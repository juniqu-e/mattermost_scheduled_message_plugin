package clock_test

import (
	"testing"
	"time"

	"lab.ssafy.com/adjl1346/mattermost-plugin-schedule-message-gui/server/clock"
)

func TestRealClock_Now(t *testing.T) {
	c := clock.NewReal()

	before := time.Now()
	got := c.Now()
	after := time.Now()

	if got.Before(before) || got.After(after) {
		t.Fatalf("Now() = %v, expected between %v and %v", got, before, after)
	}
}
