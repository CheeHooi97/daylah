package service

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"github.com/CheeHooi97/daylah/model"
	"github.com/CheeHooi97/daylah/repository"
	"strings"
	"time"
	_ "time/tzdata"
	"unicode/utf8"
)

var ErrInvalid = errors.New("invalid snapshot")

type Input struct {
	Title      string `json:"title"`
	Date       string `json:"date"`
	Timezone   string `json:"timezone"`
	Recurrence string `json:"recurrence"`
	LeapPolicy string `json:"leapPolicy"`
	Theme      string `json:"theme"`
}
type CountdownService struct {
	Repo repository.CountdownRepository
}

func Validate(i Input) error {
	if utf8.RuneCountInString(strings.TrimSpace(i.Title)) < 1 || utf8.RuneCountInString(i.Title) > 120 {
		return ErrInvalid
	}
	d, err := time.Parse("2006-01-02", i.Date)
	if err != nil || d.Format("2006-01-02") != i.Date || d.Year() < 1 {
		return ErrInvalid
	}
	if i.Timezone == "" || i.Timezone == "Local" {
		return ErrInvalid
	}
	if _, err := time.LoadLocation(i.Timezone); err != nil {
		return ErrInvalid
	}
	if i.Recurrence != "none" && i.Recurrence != "annual" {
		return ErrInvalid
	}
	if i.LeapPolicy != "feb28" && i.LeapPolicy != "mar1" {
		return ErrInvalid
	}
	if i.Theme != "indigo" && i.Theme != "rose" && i.Theme != "forest" {
		return ErrInvalid
	}
	return nil
}
func random(n int) (string, error) {
	b := make([]byte, n)
	_, err := rand.Read(b)
	return base64.RawURLEncoding.EncodeToString(b), err
}
func Hash(token string) string { h := sha256.Sum256([]byte(token)); return hex.EncodeToString(h[:]) }
func (s *CountdownService) Create(ctx context.Context, i Input) (*model.Snapshot, string, error) {
	if err := Validate(i); err != nil {
		return nil, "", err
	}
	id, err := random(18)
	if err != nil {
		return nil, "", err
	}
	token, err := random(32)
	if err != nil {
		return nil, "", err
	}
	snap := &model.Snapshot{PublicID: id, Title: strings.TrimSpace(i.Title), Date: i.Date, Timezone: i.Timezone, Recurrence: i.Recurrence, LeapPolicy: i.LeapPolicy, Theme: i.Theme, TokenHash: Hash(token), CreatedAt: time.Now().UTC()}
	err = s.Repo.Create(ctx, snap)
	return snap, token, err
}
