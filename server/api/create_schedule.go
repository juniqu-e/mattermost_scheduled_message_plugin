package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"lab.ssafy.com/adjl1346/mattermost-plugin-schedule-message-gui/server/constants"
)

type CreateSceduleRequest struct {
	ChannelId  string   `json:"channel_id"`
	FileIds    []string `json:"file_ids"`
	PostAtTime string   `json:"post_at_time"`
	PostAtDate string   `json:"post_at_date"`
	Message    string   `json:"message"`
}

func (h *Handler) CreateSchedule(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get(constants.HTTPHeaderMattermostUserID)
	h.logger.Debug("Handling CreateScedule request", "user_id", userID)

	h.logger.Debug("Parsing CreateScedule request body", "user_id", userID)
	req, err := parseCreateScheduleRequest(h, r)
	if err != nil {
		h.logger.Debug("Failed to parse CreateScedule request", "user_id", userID, "error", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	h.logger.Debug("Successfully parsed CreateScedule request", "user_id", userID, "channel_id", req.ChannelId)

	h.logger.Debug("Calling ScheduleService BuildPost", "user_id", userID)

	req.Message = parseRequestToCommand(req)
	post, err := h.ScheduleService.BuildPost(userID, req.ChannelId, req.FileIds, req.Message)
	if err != nil {
		h.logger.Debug("Failed to BuildPost", "user_id", userID, "error", err)
		h.poster.SendEphemeralPost(userID, post)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	h.logger.Debug("Success BuildPost", "user_id", userID)

	h.poster.SendEphemeralPost(userID, post)
}

func parseCreateScheduleRequest(h *Handler, r *http.Request) (*CreateSceduleRequest, error) {
	h.logger.Debug("Decoding JSON body for delete request")
	var req CreateSceduleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.logger.Error("Failed to decode JSON body", "error", err)
		return nil, err
	}
	return &req, nil
}

func parseRequestToCommand(r *CreateSceduleRequest) string {
	time := strings.TrimSpace(r.PostAtTime)
	date := strings.TrimSpace(r.PostAtDate)
	message := strings.TrimSpace(r.Message)

	cmd := fmt.Sprintf("at %s", time)
	if strings.TrimSpace(date) != "" {
		cmd = fmt.Sprintf("%s on %s", cmd, date)
	}

	cmd = fmt.Sprintf("%s message %s", cmd, message)

	return cmd
}
