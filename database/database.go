package database

import (
	"github.com/CheeHooi97/daylah/migrations"
	"gorm.io/gorm"
)

func Migrate(db *gorm.DB) error {
	return db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Exec("SELECT pg_advisory_xact_lock(147812301)").Error; err != nil {
			return err
		}
		if err := tx.Exec("CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY)").Error; err != nil {
			return err
		}
		for _, migration := range []struct {
			version int
			file    string
		}{{1, "001_snapshots.sql"}, {2, "002_daylah.sql"}} {
			var count int64
			if err := tx.Table("schema_migrations").Where("version = ?", migration.version).Count(&count).Error; err != nil {
				return err
			}
			if count > 0 {
				continue
			}
			sql, err := migrations.Files.ReadFile(migration.file)
			if err != nil {
				return err
			}
			if err := tx.Exec(string(sql)).Error; err != nil {
				return err
			}
			if err := tx.Exec("INSERT INTO schema_migrations(version) VALUES (?)", migration.version).Error; err != nil {
				return err
			}
		}
		return nil
	})
}
