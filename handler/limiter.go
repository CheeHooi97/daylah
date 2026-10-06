package handler

import (
	"github.com/labstack/echo/v4"
	"sync"
	"time"
)

type window struct {
	started time.Time
	count   int
}

// FixedWindowLimiter caps creation at ten requests per client in each minute.
// Entries expire on subsequent traffic; rejected traffic does not extend a window.
func FixedWindowLimiter(limit int, duration time.Duration) echo.MiddlewareFunc {
	var mu sync.Mutex
	entries := map[string]window{}
	lastSweep := time.Now()
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			now := time.Now()
			key := c.RealIP()
			mu.Lock()
			if now.Sub(lastSweep) >= duration {
				for ip, w := range entries {
					if now.Sub(w.started) >= duration {
						delete(entries, ip)
					}
				}
				lastSweep = now
			}
			w := entries[key]
			if w.started.IsZero() || now.Sub(w.started) >= duration {
				w = window{started: now}
			}
			if w.count >= limit {
				mu.Unlock()
				c.Response().Header().Set("Retry-After", "60")
				return echo.NewHTTPError(429, "Try sharing again in a minute.")
			}
			w.count++
			entries[key] = w
			mu.Unlock()
			return next(c)
		}
	}
}
