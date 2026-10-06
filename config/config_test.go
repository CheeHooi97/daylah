package config

import (
	"net/url"
	"testing"
)

func TestSplitPostgresConfiguration(t *testing.T) {
	for key, value := range map[string]string{"DATABASE_URL": "", "POSTGRES_HOST": "localhost", "POSTGRES_PORT": "5432", "POSTGRES_USER": "daylah", "POSTGRES_PASSWORD": "p@ss:/?# word", "POSTGRES_DATABASE": "daylah", "POSTGRES_SSLMODE": "require", "POSTGRES_TIMEZONE": "UTC", "POSTGRES_AUTO_MIGRATE": "true"} {
		t.Setenv(key, value)
	}
	cfg, err := fromEnvironment()
	if err != nil {
		t.Fatal(err)
	}
	parsed, err := url.Parse(cfg.DatabaseURL)
	if err != nil {
		t.Fatal("invalid generated URL")
	}
	password, _ := parsed.User.Password()
	if password != "p@ss:/?# word" || parsed.Path != "/daylah" || parsed.Query().Get("sslmode") != "require" || !cfg.AutoMigrate {
		t.Fatal("configuration did not round-trip")
	}
	t.Setenv("POSTGRES_PORT", "invalid")
	if _, err := fromEnvironment(); err == nil {
		t.Fatal("invalid port accepted")
	}
}

func TestExplicitURLPrecedence(t *testing.T) {
	t.Setenv("DATABASE_URL", "postgres://localhost/daylah")
	t.Setenv("POSTGRES_AUTO_MIGRATE", "false")
	cfg, err := fromEnvironment()
	if err != nil || cfg.DatabaseURL != "postgres://localhost/daylah" || cfg.AutoMigrate {
		t.Fatal("explicit URL precedence failed")
	}
	t.Setenv("POSTGRES_AUTO_MIGRATE", "invalid")
	if _, err := fromEnvironment(); err == nil {
		t.Fatal("invalid boolean accepted")
	}
}
