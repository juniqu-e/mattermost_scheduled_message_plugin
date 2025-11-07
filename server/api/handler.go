package api

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/mattermost/mattermost/server/public/plugin"

	"lab.ssafy.com/adjl1346/mattermost-plugin-schedule-message-gui/internal/ports"
	"lab.ssafy.com/adjl1346/mattermost-plugin-schedule-message-gui/server/command"
)

type Handler struct {
	logger          ports.Logger
	poster          ports.PostService
	Command         command.Interface
	ScheduleService ports.ScheduleService
	ListService     ports.ListService
	Channel         ports.ChannelService
}

func NewHandler(
	logger ports.Logger,
	poster ports.PostService,
	channel ports.ChannelService,
	command command.Interface,
	listService ports.ListService,
	scheduleService ports.ScheduleService,
) *Handler {
	logger.Debug("Creating new api Handler")
	return &Handler{
		logger:          logger,
		poster:          poster,
		Channel:         channel,
		Command:         command,
		ListService:     listService,
		ScheduleService: scheduleService,
	}
}

// ServeHTTP sets up the HTTP router and handlers for the API.
func (h *Handler) ServeHTTP(c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	router := mux.NewRouter()

	// Apply middleware to require Mattermost authorization.
	router.Use(h.MattermostAuthorizationRequired)

	// Set up /api/v1 routes.
	api := router.PathPrefix("/api/v1").Subrouter()
	api.HandleFunc("/delete", h.ListDeleteMessage).Methods(http.MethodPost)
	api.HandleFunc("/schedule", h.CreateSchedule).Methods(http.MethodPost)
	api.HandleFunc("/schedule/{channelId}", h.GetSchedules).Methods(http.MethodGet)

	router.ServeHTTP(w, r)
}
