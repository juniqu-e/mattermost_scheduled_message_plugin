package command

import (
	"lab.ssafy.com/adjl1346/mattermost-plugin-schedule-message-gui/server/types"
	"github.com/mattermost/mattermost/server/public/model"
)

type Interface interface {
	Register() error
	Execute(args *model.CommandArgs) (*model.CommandResponse, *model.AppError)
	BuildEphemeralList(args *model.CommandArgs) *model.CommandResponse
	UserDeleteMessage(userID, msgID string) (*types.ScheduledMessage, error)
}
