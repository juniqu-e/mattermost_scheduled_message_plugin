package api

import (
	"net/http"

	"lab.ssafy.com/adjl1346/mattermost-plugin-schedule-message-gui/server/constants"
)

func (h *Handler) MattermostAuthorizationRequired(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userID := r.Header.Get(constants.HTTPHeaderMattermostUserID)
		h.logger.Debug("Checking Mattermost authorization", "user_id", userID, "url", r.URL.String())
		if userID == "" {
			h.logger.Warn("Authorization failed: Missing user ID header", "header", constants.HTTPHeaderMattermostUserID, "remote_addr", r.RemoteAddr)
			http.Error(w, "Not authorized", http.StatusUnauthorized)
			return
		}
		h.logger.Debug("Authorization successful", "user_id", userID)
		next.ServeHTTP(w, r)
	})
}
