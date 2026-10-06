package handler

import (
	"encoding/json"
	"errors"
	"github.com/CheeHooi97/daylah/service"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
	"io"
	"net/http"
	"strings"
)

type Handler struct{ Countdowns *service.CountdownService }

func (h *Handler) Create(c echo.Context) error {
	if !strings.HasPrefix(c.Request().Header.Get("Content-Type"), "application/json") {
		return echo.NewHTTPError(415, "Use application/json.")
	}
	var input service.Input
	decoder := json.NewDecoder(c.Request().Body)
	decoder.DisallowUnknownFields()
	if decoder.Decode(&input) != nil {
		return echo.NewHTTPError(400, "Invalid snapshot fields.")
	}
	if decoder.Decode(new(any)) != io.EOF {
		return echo.NewHTTPError(400, "Send one JSON object.")
	}
	snap, token, err := h.Countdowns.Create(c.Request().Context(), input)
	if errors.Is(err, service.ErrInvalid) {
		return echo.NewHTTPError(400, "Check the title, date, timezone and settings.")
	}
	if err != nil {
		return echo.NewHTTPError(503, "Sharing is temporarily unavailable.")
	}
	return c.JSON(http.StatusCreated, map[string]any{"snapshot": snap, "deletionToken": token})
}
func (h *Handler) Get(c echo.Context) error {
	s, err := h.Countdowns.Get(c.Request().Context(), c.Param("publicId"))
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return echo.NewHTTPError(404, "This countdown is unavailable.")
	}
	if err != nil {
		return echo.NewHTTPError(503, "Sharing is temporarily unavailable.")
	}
	return c.JSON(200, s)
}
func (h *Handler) Revoke(c echo.Context) error {
	auth := c.Request().Header.Get("Authorization")
	if !strings.HasPrefix(auth, "Bearer ") || len(auth) > 100 {
		return echo.NewHTTPError(404, "This countdown is unavailable.")
	}
	ok, err := h.Countdowns.Revoke(c.Request().Context(), c.Param("publicId"), strings.TrimPrefix(auth, "Bearer "))
	if err != nil {
		return echo.NewHTTPError(503, "Sharing is temporarily unavailable.")
	}
	if !ok {
		return echo.NewHTTPError(404, "This countdown is unavailable.")
	}
	return c.NoContent(204)
}
