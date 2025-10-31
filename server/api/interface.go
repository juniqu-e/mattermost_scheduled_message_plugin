package api

import (
	"net/http"

	"github.com/mattermost/mattermost/server/public/plugin"
)

type Interface interface {
	ServeHTTP(c *plugin.Context, w http.ResponseWriter, r *http.Request)
	ListDeleteMessage(w http.ResponseWriter, r *http.Request)
	CreateSchedule(w http.ResponseWriter, r *http.Request)
}
