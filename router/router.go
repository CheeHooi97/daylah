package router

import (
	"github.com/CheeHooi97/daylah/data"
	"github.com/CheeHooi97/daylah/handler"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"gorm.io/gorm"
	"os"
	"strings"
	"time"
)

func SetupRoutes(h *handler.Handler, db *gorm.DB) *echo.Echo {
	e := echo.New()
	e.HideBanner = true
	e.IPExtractor = echo.ExtractIPDirect()
	if os.Getenv("TRUST_LOOPBACK_PROXY") == "true" {
		e.IPExtractor = echo.ExtractIPFromRealIPHeader(echo.TrustLoopback(true), echo.TrustPrivateNet(false), echo.TrustLinkLocal(false))
	}
	e.Use(middleware.Recover(), middleware.BodyLimit("4K"), middleware.Secure())
	origins := []string{"https://localhost"}
	if configured := os.Getenv("NATIVE_ORIGINS"); configured != "" {
		origins = strings.Split(configured, ",")
	}
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{AllowOrigins: origins, AllowMethods: []string{"GET", "POST", "DELETE", "OPTIONS"}, AllowHeaders: []string{"Origin", "Content-Type", "Accept", "Authorization"}}))
	e.HTTPErrorHandler = func(err error, c echo.Context) {
		code := 500
		message := "The request could not be completed."
		if he, ok := err.(*echo.HTTPError); ok {
			code = he.Code
			if text, ok := he.Message.(string); ok {
				message = text
			}
		}
		if !c.Response().Committed {
			_ = c.JSON(code, map[string]string{"error": message})
		}
	}
	e.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error { c.Response().Header().Set("Cache-Control", "no-store"); return next(c) }
	})
	e.GET("/healthz", func(c echo.Context) error {
		sql, err := db.DB()
		if err != nil || sql.PingContext(c.Request().Context()) != nil {
			return c.JSON(503, map[string]string{"status": "unavailable"})
		}
		return c.JSON(200, map[string]string{"status": "ready"})
	})
	e.GET("/v1/holidays", data.Holidays)
	limiter := handler.FixedWindowLimiter(10, time.Minute)
	e.POST("/v1/countdowns", h.Create, limiter)
	e.GET("/v1/countdowns/:publicId", h.Get)
	e.DELETE("/v1/countdowns/:publicId", h.Revoke)
	e.Server.ReadHeaderTimeout = 5 * time.Second
	e.Server.ReadTimeout = 10 * time.Second
	e.Server.WriteTimeout = 10 * time.Second
	return e
}
