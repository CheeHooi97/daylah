package config

import (
	"fmt"
	"net"
	"net/url"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL, Address string
	AutoMigrate          bool
}

func Load() (Config, error) {
	if err := godotenv.Load(); err != nil && !os.IsNotExist(err) {
		return Config{}, fmt.Errorf("could not parse .env; check its syntax")
	}

	return fromEnvironment()
}

func fromEnvironment() (Config, error) {
	address := os.Getenv("SERVER_ADDRESS")
	if address == "" {
		address = "127.0.0.1:8080"
	}
	cfg := Config{DatabaseURL: os.Getenv("DATABASE_URL"), Address: address}
	if value := os.Getenv("POSTGRES_AUTO_MIGRATE"); value != "" {
		enabled, err := strconv.ParseBool(value)
		if err != nil {
			return Config{}, fmt.Errorf("POSTGRES_AUTO_MIGRATE must be true or false")
		}
		cfg.AutoMigrate = enabled
	}
	if cfg.DatabaseURL != "" {
		return cfg, nil
	}
	for _, key := range []string{"POSTGRES_HOST", "POSTGRES_USER", "POSTGRES_PASSWORD", "POSTGRES_DATABASE"} {
		if os.Getenv(key) == "" {
			return Config{}, fmt.Errorf("%s is required when DATABASE_URL is unset", key)
		}
	}
	port := os.Getenv("POSTGRES_PORT")
	if port == "" {
		port = "5432"
	}
	number, err := strconv.Atoi(port)
	if err != nil || number < 1 || number > 65535 {
		return Config{}, fmt.Errorf("POSTGRES_PORT must be a valid port")
	}
	ssl := os.Getenv("POSTGRES_SSLMODE")
	if ssl == "" {
		ssl = "require"
	}
	switch ssl {
	case "disable", "allow", "prefer", "require", "verify-ca", "verify-full":
	default:
		return Config{}, fmt.Errorf("POSTGRES_SSLMODE is invalid")
	}
	query := url.Values{"sslmode": {ssl}, "connect_timeout": {"10"}}
	if zone := os.Getenv("POSTGRES_TIMEZONE"); zone != "" {
		if _, err := time.LoadLocation(zone); err != nil {
			return Config{}, fmt.Errorf("POSTGRES_TIMEZONE is invalid")
		}
		query.Set("TimeZone", zone)
	}
	dsn := url.URL{Scheme: "postgres", User: url.UserPassword(os.Getenv("POSTGRES_USER"), os.Getenv("POSTGRES_PASSWORD")), Host: net.JoinHostPort(os.Getenv("POSTGRES_HOST"), port), Path: "/" + os.Getenv("POSTGRES_DATABASE"), RawQuery: query.Encode()}
	cfg.DatabaseURL = dsn.String()
	return cfg, nil
}
