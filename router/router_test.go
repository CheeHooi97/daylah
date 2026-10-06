package router

import (
	"github.com/CheeHooi97/daylah/handler"
	"net/http/httptest"
	"testing"
)

func TestNativeCORS(t *testing.T) {
	e := SetupRoutes(&handler.Handler{}, nil)
	for _, origin := range []string{"https://localhost", "https://untrusted.example"} {
		req := httptest.NewRequest("OPTIONS", "/v1/countdowns", nil)
		req.Header.Set("Origin", origin)
		req.Header.Set("Access-Control-Request-Method", "POST")
		req.Header.Set("Access-Control-Request-Headers", "content-type,authorization")
		rec := httptest.NewRecorder()
		e.ServeHTTP(rec, req)
		allowed := rec.Header().Get("Access-Control-Allow-Origin")
		if origin == "https://localhost" && allowed != origin {
			t.Fatal("native origin rejected")
		}
		if origin != "https://localhost" && allowed != "" {
			t.Fatal("untrusted origin allowed")
		}
	}
}
