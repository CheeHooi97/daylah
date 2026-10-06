package service

import (
	"context"
	"encoding/json"
	"github.com/CheeHooi97/daylah/model"
	"gorm.io/gorm"
	"strings"
	"testing"
)

type fakeRepo struct{ records map[string]*model.Snapshot }

func (f *fakeRepo) Create(ctx context.Context, s *model.Snapshot) error {
	f.records[s.PublicID] = s
	return nil
}
func (f *fakeRepo) Get(ctx context.Context, id string) (*model.Snapshot, error) {
	s, ok := f.records[id]
	if !ok || s.RevokedAt != nil {
		return nil, gorm.ErrRecordNotFound
	}
	return s, nil
}
func (f *fakeRepo) Revoke(ctx context.Context, id, hash string) (bool, error) {
	s, ok := f.records[id]
	if !ok || s.TokenHash != hash {
		return false, nil
	}
	delete(f.records, id)
	return true, nil
}
func TestSnapshots(t *testing.T) {
	repo := &fakeRepo{records: map[string]*model.Snapshot{}}
	s := CountdownService{Repo: repo}
	input := Input{Title: "Birthday", Date: "2028-02-29", Timezone: "Asia/Singapore", Recurrence: "annual", LeapPolicy: "feb28", Theme: "indigo"}
	first, token, err := s.Create(context.Background(), input)
	if err != nil {
		t.Fatal(err)
	}
	second, token2, err := s.Create(context.Background(), input)
	if err != nil {
		t.Fatal(err)
	}
	if first.PublicID == second.PublicID || token == token2 || len(token) < 40 || first.TokenHash == token {
		t.Fatal("unsafe identifiers or token storage")
	}
	serialized, _ := json.Marshal(first)
	if strings.Contains(string(serialized), token) || strings.Contains(string(serialized), first.TokenHash) {
		t.Fatal("private token leaked")
	}
	if ok, _ := s.Revoke(context.Background(), first.PublicID, "wrong"); ok {
		t.Fatal("wrong token accepted")
	}
	if ok, err := s.Revoke(context.Background(), first.PublicID, token); !ok || err != nil {
		t.Fatal("revocation failed")
	}
	if _, err := s.Get(context.Background(), first.PublicID); err != gorm.ErrRecordNotFound {
		t.Fatal("revoked snapshot readable")
	}
	input.Title = "Changed"
	if second.Title != "Birthday" {
		t.Fatal("snapshot mutated")
	}
}
func TestValidation(t *testing.T) {
	valid := Input{Title: "Date", Date: "2026-10-04", Timezone: "UTC", Recurrence: "none", LeapPolicy: "feb28", Theme: "indigo"}
	if Validate(valid) != nil {
		t.Fatal("valid input rejected")
	}
	for _, modify := range []func(*Input){func(i *Input) { i.Date = "2026-02-29" }, func(i *Input) { i.Timezone = "Local" }, func(i *Input) { i.Timezone = "Bad/Zone" }, func(i *Input) { i.Title = strings.Repeat("a", 121) }, func(i *Input) { i.Title = " " }, func(i *Input) { i.Theme = "html" }, func(i *Input) { i.Recurrence = "monthly" }, func(i *Input) { i.LeapPolicy = "skip" }} {
		i := valid
		modify(&i)
		if Validate(i) == nil {
			t.Fatalf("invalid input accepted: %+v", i)
		}
	}
}
