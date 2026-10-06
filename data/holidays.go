package data

import (
	"embed"
	"encoding/json"
	"github.com/labstack/echo/v4"
	"strconv"
)

//go:embed *.json
var datasets embed.FS

func Holidays(c echo.Context) error {
	country := c.QueryParam("country")
	year, err := strconv.Atoi(c.QueryParam("year"))
	if (country != "MY" && country != "SG") || err != nil || year < 1 || year > 9999 {
		return echo.NewHTTPError(400, "Choose country MY or SG and a valid year.")
	}
	file, err := datasets.ReadFile(country + "-" + strconv.Itoa(year) + ".json")
	if err != nil {
		return c.JSON(200, map[string]any{"country": country, "year": year, "version": "2026-10-04", "status": "unavailable", "scope": "No verified coverage is available.", "records": []any{}})
	}
	var body any
	if json.Unmarshal(file, &body) != nil {
		return echo.NewHTTPError(503, "Holiday dataset unavailable.")
	}
	c.Response().Header().Set("Cache-Control", "public, max-age=3600")
	return c.JSON(200, body)
}
