package testutil

import (
	"fmt"

	"lab.ssafy.com/adjl1346/mattermost-plugin-schedule-message-gui/server/constants"
)

func SchedKey(id string) string {
	return fmt.Sprintf("%s%s", constants.SchedPrefix, id)
}

func IndexKey(userID string) string {
	return fmt.Sprintf("%s%s", constants.UserIndexPrefix, userID)
}
