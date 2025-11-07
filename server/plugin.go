package main

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"sync"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/plugin"
	"github.com/mattermost/mattermost/server/public/pluginapi"

	"lab.ssafy.com/adjl1346/mattermost-plugin-schedule-message-gui/adapters/mm"
	"lab.ssafy.com/adjl1346/mattermost-plugin-schedule-message-gui/internal/ports"
	"lab.ssafy.com/adjl1346/mattermost-plugin-schedule-message-gui/server/api"
	"lab.ssafy.com/adjl1346/mattermost-plugin-schedule-message-gui/server/bot"
	"lab.ssafy.com/adjl1346/mattermost-plugin-schedule-message-gui/server/channel"
	"lab.ssafy.com/adjl1346/mattermost-plugin-schedule-message-gui/server/clock"
	"lab.ssafy.com/adjl1346/mattermost-plugin-schedule-message-gui/server/command"
	"lab.ssafy.com/adjl1346/mattermost-plugin-schedule-message-gui/server/constants"
	"lab.ssafy.com/adjl1346/mattermost-plugin-schedule-message-gui/server/scheduler"
	"lab.ssafy.com/adjl1346/mattermost-plugin-schedule-message-gui/server/store"
)

type ClientFactory func(api plugin.API, drv plugin.Driver) *pluginapi.Client

type ClockFactory func() ports.Clock

type BotEnsurer func(ports.BotService, ports.BotProfileImageService) (string, error)

type AppBuilder interface {
	NewChannel(cli *pluginapi.Client) *channel.Channel
	NewStore(cli *pluginapi.Client, maxUserMessages int) ports.Store
	NewScheduler(cli *pluginapi.Client, st ports.Store, ch ports.ChannelService, botID string, clk ports.Clock) *scheduler.Scheduler
	NewCommandHandler(
		cli *pluginapi.Client,
		st ports.Store,
		ch ports.ChannelService,
		listSvc ports.ListService,
		scheduleSvc ports.ScheduleService,
		help string,
	) *command.Handler
	NewAPIHandler(
		cli *pluginapi.Client,
		poster ports.PostService,
		Channel ports.ChannelService,
		Command command.Interface,
		ListStervice ports.ListService,
		ScheduleService *command.ScheduleService,
	) *api.Handler
}

type prodBuilder struct{}

func (prodBuilder) NewChannel(cli *pluginapi.Client) *channel.Channel {
	return channel.New(&cli.Log, &cli.Channel, &cli.Team, &cli.User)
}

func (prodBuilder) NewStore(cli *pluginapi.Client, maxUserMessages int) ports.Store {
	return store.NewKVStore(&cli.Log, &cli.KV, mm.ListMatchingService{}, maxUserMessages)
}

func (prodBuilder) NewScheduler(cli *pluginapi.Client, st ports.Store, ch ports.ChannelService, botID string, clk ports.Clock) *scheduler.Scheduler {
	return scheduler.New(&cli.Log, &cli.Post, st, ch, botID, clk)
}

func (prodBuilder) NewCommandHandler(
	cli *pluginapi.Client,
	st ports.Store,
	ch ports.ChannelService,
	listSvc ports.ListService,
	scheduleSvc ports.ScheduleService,
	help string,
) *command.Handler {
	return command.NewHandler(
		&cli.Log,
		&cli.SlashCommand,
		&cli.User,
		st,
		ch,
		listSvc,
		scheduleSvc,
		help,
	)
}

func (prodBuilder) NewAPIHandler(
	cli *pluginapi.Client,
	poster ports.PostService,
	channel ports.ChannelService,
	command command.Interface,
	listStervice ports.ListService,
	scheduleService *command.ScheduleService,
) *api.Handler {
	return api.NewHandler(
		&cli.Log,
		poster,
		channel,
		command,
		listStervice,
		scheduleService,
	)
}

type Plugin struct {
	plugin.MattermostPlugin
	// configurationLock synchronizes access to the configuration.
	configurationLock sync.RWMutex
	// configuration is the active plugin configuration. Consult getConfiguration and
	// setConfiguration for usage.
	configuration          *configuration
	client                 *pluginapi.Client
	BotID                  string
	Scheduler              *scheduler.Scheduler
	Store                  ports.Store
	Channel                ports.ChannelService
	Command                command.Interface
	defaultMaxUserMessages int
	helpText               string
	logger                 ports.Logger
	poster                 ports.PostService
	api                    api.Interface
}

func (p *Plugin) loadHelpText(text string) (string, error) {
	p.API.LogDebug("Attempting to load help text")
	if text != "" {
		p.API.LogDebug("Using provided help text argument")
		return text, nil
	}
	p.API.LogDebug("Help text argument empty, attempting to load from file")
	bundlePath, err := p.API.GetBundlePath()
	if err != nil {
		p.API.LogError("Failed to get bundle path for help text", "error", err)
		return "", fmt.Errorf("failed to get bundle path: %w", err)
	}
	helpFilePath := filepath.Join(bundlePath, constants.AssetsDir, constants.HelpFilename)
	p.API.LogDebug("Reading help file", "path", helpFilePath)
	helpBytes, err := os.ReadFile(helpFilePath)
	if err != nil {
		p.API.LogError("Failed to read help file", "path", helpFilePath, "error", err)
		return "", fmt.Errorf("failed to read help file %s: %w", helpFilePath, err)
	}
	loadedText := string(helpBytes)
	p.API.LogDebug("Successfully loaded help text from file", "path", helpFilePath, "length", len(loadedText))
	return loadedText, nil
}

func (p *Plugin) OnActivate() error {
	p.API.LogDebug("OnActivate called, invoking OnActivateWith defaults")
	return p.OnActivateWith(pluginapi.NewClient, clock.NewReal, nil, bot.EnsureBot, "")
}

func (p *Plugin) OnActivateWith(
	clientFactory ClientFactory,
	clockFactory ClockFactory,
	builder AppBuilder,
	ensureBot BotEnsurer,
	help string,
) error {
	p.API.LogDebug("OnActivateWith called")
	p.client = clientFactory(p.API, p.Driver)
	p.API.LogDebug("Client created")

	var helpText string
	var helpErr error
	if helpText, helpErr = p.loadHelpText(help); helpErr != nil {
		p.API.LogError("Plugin activation failed: could not load help text.", "error", helpErr.Error())
		return helpErr
	}
	p.helpText = helpText
	p.API.LogDebug("Help text loaded")

	p.API.LogDebug("Ensuring bot account exists")
	botID, botErr := ensureBot(&p.client.Bot, mm.BotProfileImageServiceWrapper{})
	if botErr != nil {
		p.API.LogError("Plugin activation failed: could not ensure bot.", "error", botErr.Error())
		return botErr
	}
	p.API.LogDebug("Bot account ensured", "bot_id", botID)

	if builder == nil {
		p.API.LogDebug("Using production builder")
		builder = prodBuilder{}
	} else {
		p.API.LogDebug("Using provided builder (likely for testing)")
	}

	clk := clockFactory()
	p.API.LogDebug("Clock created")

	if initErr := p.initialize(botID, clk, builder); initErr != nil {
		p.API.LogError("Plugin activation failed: could not initialize dependencies.", "error", initErr.Error())
		return initErr
	}
	p.API.LogDebug("Plugin components initialized")

	p.API.LogInfo("Scheduled Messages plugin activated successfully.")
	return nil
}

func (p *Plugin) OnDeactivate() error {
	p.API.LogInfo("Deactivating Scheduled Messages plugin")
	if p.Scheduler != nil {
		p.API.LogDebug("Stopping scheduler")
		p.Scheduler.Stop()
		p.API.LogDebug("Scheduler stopped")
	} else {
		p.API.LogWarn("Scheduler was nil during deactivation")
	}
	p.API.LogInfo("Scheduled Messages plugin deactivated.")
	return nil
}

func (p *Plugin) initialize(botID string, clk ports.Clock, builder AppBuilder) error {
	p.API.LogDebug("Initializing plugin components", "bot_id", botID)
	p.BotID = botID
	p.defaultMaxUserMessages = constants.MaxUserMessages
	p.logger = &p.client.Log
	p.poster = &p.client.Post

	p.logger.Debug("Initializing Channel service")
	p.Channel = builder.NewChannel(p.client)
	p.logger.Debug("Initializing Store service", "max_user_messages", p.defaultMaxUserMessages)
	p.Store = builder.NewStore(p.client, p.defaultMaxUserMessages)
	p.logger.Debug("Initializing Scheduler service", "bot_id", p.BotID)
	p.Scheduler = builder.NewScheduler(p.client, p.Store, p.Channel, p.BotID, clk)

	p.logger.Debug("Initializing List service")
	listService := command.NewListService(p.logger, p.Store, p.Channel)

	p.logger.Debug("Initializing Schedule service", "max_user_messages", p.defaultMaxUserMessages)
	scheduleService := command.NewScheduleService(p.logger, &p.client.User, p.Store, p.Channel, clk, p.defaultMaxUserMessages)

	p.logger.Debug("Initializing Command handler")
	p.Command = builder.NewCommandHandler(
		p.client,
		p.Store,
		p.Channel,
		listService,
		scheduleService,
		p.helpText,
	)

	p.logger.Debug("Initializing Api Handler")
	p.api = builder.NewAPIHandler(
		p.client,
		p.poster,
		p.Channel,
		p.Command,
		listService,
		scheduleService,
	)

	p.logger.Debug("Registering command handler")
	if err := p.Command.Register(); err != nil {
		p.logger.Error("Failed to register command handler", "error", err)
		return err
	}
	p.logger.Debug("Command handler registered successfully")

	p.logger.Info("Starting scheduler goroutine")
	go p.Scheduler.Start()

	p.logger.Debug("Plugin initialization complete")
	return nil
}

func (p *Plugin) ExecuteCommand(c *plugin.Context, args *model.CommandArgs) (*model.CommandResponse, *model.AppError) {
	p.logger.Debug("ExecuteCommand hook triggered", "user_id", args.UserId, "channel_id", args.ChannelId, "command", args.Command)
	resp, appErr := p.Command.Execute(args)
	if appErr != nil {
		p.logger.Error("Command execution failed", "user_id", args.UserId, "command", args.Command, "error", appErr)
	} else {
		p.logger.Debug("Command execution successful", "user_id", args.UserId, "command", args.Command)
	}
	return resp, appErr
}

func (p *Plugin) ServeHTTP(c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	p.logger.Debug("Received HTTP request", "method", r.Method, "url", r.URL.String())
	p.api.ServeHTTP(c, w, r)
}
