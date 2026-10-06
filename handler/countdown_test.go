package handler

import (
	"github.com/labstack/echo/v4"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func TestCreateRejectsPrivateNotes(t *testing.T) {
	e := echo.New()
	h := Handler{}
	req := httptest.NewRequest("POST", "/", strings.NewReader(`{"notes":"secret"}`))
	req.Header.Set("Content-Type", "application/json")
	err := h.Create(e.NewContext(req, httptest.NewRecorder()))
	if err == nil || err.(*echo.HTTPError).Code != 400 {
		t.Fatal("unknown private fields accepted")
	}
}
func TestFixedLimit(t *testing.T) {
	e := echo.New()
	e.IPExtractor = echo.ExtractIPDirect()
	e.POST("/", func(c echo.Context) error { return c.NoContent(204) }, FixedWindowLimiter(10, time.Minute))
	for i := 0; i < 11; i++ {
		rec := httptest.NewRecorder()
		req := httptest.NewRequest("POST", "/", nil)
		req.RemoteAddr = "192.0.2.1:1234"
		e.ServeHTTP(rec, req)
		expected := 204
		if i == 10 {
			expected = 429
		}
		if rec.Code != expected {
			t.Fatalf("request %d got %d", i, rec.Code)
		}
	}
}
