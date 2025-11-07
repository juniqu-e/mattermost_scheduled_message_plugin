package bot

import (
	"fmt"
	"path/filepath"

	"github.com/mattermost/mattermost/server/public/model"

	"lab.ssafy.com/adjl1346/mattermost-plugin-schedule-message-gui/internal/ports"
	"lab.ssafy.com/adjl1346/mattermost-plugin-schedule-message-gui/server/constants"
)

func EnsureBot(botAPI ports.BotService, imgSvc ports.BotProfileImageService) (string, error) {
	bot := &model.Bot{
		Username:    "scheduled-messages",
		DisplayName: "Message Scheduler",
		Description: "Scheduled Messages Bot",
	}
	profileImagePath := filepath.Join(constants.AssetsDir, constants.ProfileImageFilename)
	profileImage := imgSvc.ProfileImagePath(profileImagePath)
	botUserID, err := botAPI.EnsureBot(bot, profileImage)
	if err != nil {
		return "", fmt.Errorf("failed to ensure bot: %w", err)
	}
	return botUserID, nil
}
