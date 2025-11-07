package api

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"

	"lab.ssafy.com/adjl1346/mattermost-plugin-schedule-message-gui/internal/testutil"
	"lab.ssafy.com/adjl1346/mattermost-plugin-schedule-message-gui/server/constants"
)

func TestMattermostAuthorizationRequired_Unauthorized(t *testing.T) {
	p := &Handler{logger: &testutil.FakeLogger{}}
	handlerCalled := false
	dummyHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		handlerCalled = true
		w.WriteHeader(http.StatusOK)
	})

	req := httptest.NewRequest(http.MethodGet, "/", nil) // No MM User ID header
	rr := httptest.NewRecorder()

	p.MattermostAuthorizationRequired(dummyHandler).ServeHTTP(rr, req)

	assert.Equal(t, http.StatusUnauthorized, rr.Code)
	assert.Equal(t, "Not authorized\n", rr.Body.String())
	assert.False(t, handlerCalled, "Wrapped handler should not have been called")
}

func TestMattermostAuthorizationRequired_Authorized(t *testing.T) {
	p := &Handler{logger: &testutil.FakeLogger{}}
	handlerCalled := false
	dummyHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		handlerCalled = true
		w.WriteHeader(http.StatusOK)
	})

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.Header.Set(constants.HTTPHeaderMattermostUserID, "test-user-id")
	rr := httptest.NewRecorder()

	p.MattermostAuthorizationRequired(dummyHandler).ServeHTTP(rr, req)

	assert.Equal(t, http.StatusOK, rr.Code)
	assert.True(t, handlerCalled, "Wrapped handler should have been called")
}
