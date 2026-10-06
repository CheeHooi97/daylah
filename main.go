package main

import (
	"context"
	"github.com/CheeHooi97/daylah/config"
	"github.com/CheeHooi97/daylah/database"
	"github.com/CheeHooi97/daylah/handler"
	"github.com/CheeHooi97/daylah/repository"
	"github.com/CheeHooi97/daylah/router"
	"github.com/CheeHooi97/daylah/service"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}
	db, err := gorm.Open(postgres.Open(cfg.DatabaseURL), &gorm.Config{Logger: logger.Default.LogMode(logger.Silent)})
	if err != nil {
		log.Fatal("Database connection failed")
	}
	sql, err := db.DB()
	if err != nil {
		log.Fatal("Database pool failed")
	}
	defer sql.Close()
	sql.SetMaxOpenConns(10)
	sql.SetMaxIdleConns(5)
	sql.SetConnMaxLifetime(30 * time.Minute)
	explicitMigration := len(os.Args) > 1 && os.Args[1] == "migrate"
	if explicitMigration || cfg.AutoMigrate {
		if database.Migrate(db) != nil {
			log.Fatal("Migration failed")
		}
		log.Print("Database migrations applied")
		if explicitMigration {
			return
		}
	}
	e := router.SetupRoutes(handler.NewHandler(service.InitializeService(repository.InitializeRepository(db))), db)
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	go func() {
		if err := e.Start(cfg.Address); err != nil && err != http.ErrServerClosed {
			log.Print("API server stopped")
			stop()
		}
	}()
	<-ctx.Done()
	shutdown, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_ = e.Shutdown(shutdown)
}
