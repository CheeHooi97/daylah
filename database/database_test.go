package database

import (
	"fmt"
	"github.com/CheeHooi97/daylah/migrations"
	"github.com/CheeHooi97/daylah/model"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"os"
	"testing"
	"time"
)

func TestPostgresDaylahMigration(t *testing.T) {
	dsn := os.Getenv("DAYLAH_TEST_DATABASE_URL")
	if dsn == "" {
		t.Skip("Set DAYLAH_TEST_DATABASE_URL for isolated PostgreSQL integration checks")
	}
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{Logger: logger.Default.LogMode(logger.Silent)})
	if err != nil {
		t.Fatal("test database unavailable")
	}
	sql, _ := db.DB()
	defer sql.Close()
	tx := db.Begin()
	defer tx.Rollback()
	name := fmt.Sprintf("daylah_test_%d", time.Now().UnixNano())
	if tx.Exec("CREATE SCHEMA "+name).Error != nil {
		t.Fatal("schema creation failed")
	}
	if tx.Exec("SET LOCAL search_path TO "+name).Error != nil {
		t.Fatal("schema selection failed")
	}
	legacy, _ := migrations.Files.ReadFile("001_snapshots.sql")
	for _, query := range []string{string(legacy), "CREATE TABLE schema_migrations(version INTEGER PRIMARY KEY)", "INSERT INTO schema_migrations VALUES(1)", "INSERT INTO countdown_snapshots(public_id,title,date,timezone,recurrence,leap_policy,theme,token_hash) VALUES('legacy','Old event','2026-10-04','UTC','none','feb28','indigo','hash')"} {
		if tx.Exec(query).Error != nil {
			t.Fatal("fixture setup failed")
		}
	}
	for i := 0; i < 2; i++ {
		if Migrate(tx) != nil {
			t.Fatal("migration failed")
		}
	}
	var snap model.Snapshot
	if tx.Where("public_id = ?", "legacy").First(&snap).Error != nil || snap.Title != "Old event" {
		t.Fatal("legacy data lost")
	}
	var kind string
	if tx.Raw("SELECT table_type FROM information_schema.tables WHERE table_schema = ? AND table_name='daylah'", name).Scan(&kind).Error != nil || kind != "BASE TABLE" {
		t.Fatal("daylah is not a table")
	}
	var count int64
	tx.Table("countdown_snapshots").Count(&count)
	if count != 1 {
		t.Fatal("legacy compatibility view failed")
	}
}
