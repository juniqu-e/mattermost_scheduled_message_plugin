package api

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/mattermost/mattermost/server/public/model"
	"lab.ssafy.com/adjl1346/mattermost-plugin-schedule-message-gui/server/constants"
	"lab.ssafy.com/adjl1346/mattermost-plugin-schedule-message-gui/server/types"
)

func (h *Handler) ListDeleteMessage(w http.ResponseWriter, r *http.Request) {
	userID := r.Header.Get(constants.HTTPHeaderMattermostUserID)
	h.logger.Debug("Handling UserDeleteMessage request", "user_id", userID)

	h.logger.Debug("Parsing delete request body", "user_id", userID)
	req, msgID, err := parseDeleteRequest(h, r)
	if err != nil {
		h.logger.Error("Failed to parse delete request", "user_id", userID, "error", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	h.logger.Debug("Successfully parsed delete request", "user_id", userID, "message_id", msgID, "post_id", req.PostId, "channel_id", req.ChannelId)

	h.logger.Debug("Calling command layer UserDeleteMessage", "user_id", userID, "message_id", msgID)
	deletedMsg, err := h.Command.UserDeleteMessage(userID, msgID)
	args := &model.CommandArgs{
		UserId: userID,
	}
	h.logger.Debug("Building updated ephemeral list", "user_id", userID)
	updatedList := h.Command.BuildEphemeralList(args)
	h.updateEphemeralPostWithList(userID, req.PostId, req.ChannelId, updatedList)
	if err != nil {
		h.logger.Error("Command layer failed to delete message", "user_id", userID, "message_id", msgID, "error", err)
		http.Error(w, fmt.Sprintf("Failed to delete message: %v", err), http.StatusInternalServerError)
		h.sendDeletionError(userID, req.ChannelId, msgID, err)
		return
	}
	h.logger.Info("Successfully deleted message via command layer", "user_id", userID, "message_id", msgID)
	h.sendDeletionConfirmation(userID, req.ChannelId, deletedMsg)

	h.logger.Debug("UserDeleteMessage request completed successfully", "user_id", userID, "message_id", msgID)
}

func (h *Handler) buildEphemeralListUpdate(userID, postID, channelID string, updatedList *model.CommandResponse) *model.Post {
	h.logger.Debug("Building ephemeral post update structure", "user_id", userID, "post_id", postID, "channel_id", channelID)
	post := &model.Post{
		Id:        postID,
		UserId:    userID,
		ChannelId: channelID,
		Props: map[string]any{
			"attachments": updatedList.Props["attachments"],
		},
	}
	attachmentsValue := updatedList.Props["attachments"]
	attachmentsSlice, ok := attachmentsValue.([]*model.SlackAttachment)
	if !ok || len(attachmentsSlice) == 0 {
		h.logger.Debug("Attachments is empty, setting EmptyListMessage", "user_id", userID, "post_id", postID)
		post.Message = constants.EmptyListMessage
	}
	return post
}

func parseDeleteRequest(h *Handler, r *http.Request) (*model.PostActionIntegrationRequest, string, error) {
	h.logger.Debug("Decoding JSON body for delete request")
	var req model.PostActionIntegrationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.logger.Error("Failed to decode JSON body", "error", err)
		return nil, "", fmt.Errorf("invalid request body: %w", err)
	}

	h.logger.Debug("Validating delete request context", "context", req.Context)
	action, actionOk := req.Context["action"].(string)
	msgID, idOk := req.Context["id"].(string)

	if !actionOk || action != "delete" || !idOk || msgID == "" {
		err := errors.New("invalid delete request context: missing or invalid action/id")
		h.logger.Error("Delete request context validation failed", "error", err, "action", action, "action_ok", actionOk, "msg_id", msgID, "id_ok", idOk)
		return nil, "", err
	}

	h.logger.Debug("Delete request parsed and validated successfully", "action", action, "message_id", msgID)
	return &req, msgID, nil
}

func (h *Handler) updateEphemeralPostWithList(userID string, postID string, channelID string, updatedList *model.CommandResponse) {
	h.logger.Debug("Preparing to update ephemeral post with new list", "user_id", userID, "post_id", postID, "channel_id", channelID)
	updatedPost := h.buildEphemeralListUpdate(userID, postID, channelID, updatedList)
	h.poster.UpdateEphemeralPost(userID, updatedPost)
	h.logger.Debug("Successfully requested ephemeral post update", "user_id", userID, "post_id", postID, "channel_id", channelID)
}

func (h *Handler) sendDeletionConfirmation(userID string, channelID string, deletedMsg *types.ScheduledMessage) {
	h.logger.Debug("Preparing deletion confirmation message", "user_id", userID, "channel_id", channelID, "message_id", deletedMsg.ID, "timezone", deletedMsg.Timezone)
	loc, err := time.LoadLocation(deletedMsg.Timezone)
	if err != nil {
		h.logger.Warn("Failed to load timezone for confirmation message, falling back to UTC", "user_id", userID, "message_id", deletedMsg.ID, "timezone", deletedMsg.Timezone, "error", err)
		loc = time.UTC
	}
	humanTime := deletedMsg.PostAt.In(loc).Format(constants.TimeLayout)
	h.logger.Debug("Formatted time for confirmation message", "user_id", userID, "message_id", deletedMsg.ID, "formatted_time", humanTime, "location", loc.String())
	channelInfo := h.Channel.MakeChannelLink(h.Channel.GetInfoOrUnknown(deletedMsg.ChannelID))
	confirmation := &model.Post{
		UserId:    userID,
		ChannelId: channelID,
		Message:   fmt.Sprintf("%s Message scheduled for **%s** %s has been deleted.", constants.EmojiSuccess, humanTime, channelInfo),
	}
	h.logger.Debug("Sending ephemeral deletion confirmation post", "user_id", userID, "channel_id", channelID, "message_id", deletedMsg.ID)
	h.poster.SendEphemeralPost(userID, confirmation)
	h.logger.Debug("Successfully sent ephemeral deletion confirmation", "user_id", userID, "channel_id", channelID, "message_id", deletedMsg.ID)
}

func (h *Handler) sendDeletionError(userID string, channelID string, msgID string, err error) {
	h.logger.Debug("Preparing deletion error message", "user_id", userID, "channel_id", channelID, "message_id", msgID, "error", err)
	alert := &model.Post{
		UserId:    userID,
		ChannelId: channelID,
		Message:   fmt.Sprintf("%s Could not delete message: %v", constants.EmojiError, err),
	}
	h.logger.Debug("Sending ephemeral deletion confirmation post", "user_id", userID, "channel_id", channelID, "message_id", msgID)
	h.poster.SendEphemeralPost(userID, alert)
	h.logger.Debug("Successfully sent ephemeral deletion confirmation", "user_id", userID, "channel_id", channelID, "message_id", msgID)
}
