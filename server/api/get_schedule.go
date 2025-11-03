package api

import (
	"errors"
	"net/http"
	"strings"

	"github.com/gorilla/mux"
	"lab.ssafy.com/adjl1346/mattermost-plugin-schedule-message-gui/server/constants"
)

func (h *Handler) GetSchedules(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get(constants.HTTPHeaderMattermostUserID)
	h.logger.Debug("Handling GetSchedules request", "user_id", userID)

	h.logger.Debug("Extract path parameter", "user_id", userID)
	channelId := strings.TrimSpace(getPathParamChannelId(r))
	if channelId == "" {
		h.logger.Debug("Failed to extract GetSchedules request", "user_id", userID)
		http.Error(w, errors.New("path parameter is required").Error(), http.StatusBadRequest)
		return
	}
	h.logger.Debug("Successfully extract path parameter", "user_id", userID, "channel_id", channelId)

	h.logger.Debug("Calling ListService GetSchedules", "user_id", userID)
	post, err := h.ListService.BuildPost(userID, channelId)
	if err != nil {
		h.logger.Debug("Failed Calling ListService GetSchedules", "user_id", userID, "error", err)
		h.poster.SendEphemeralPost(userID, post)
		return
	}
	h.logger.Debug("Successfully ListService GetSchedules", "user_id", userID)

	h.poster.SendEphemeralPost(userID, post)
}

func getPathParamChannelId(r *http.Request) string {
	vars := mux.Vars(r)
	channelId := vars["channelId"]

	return channelId
}
