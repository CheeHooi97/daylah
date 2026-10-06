package service

import (
	"context"
	"github.com/CheeHooi97/daylah/model"
	"github.com/CheeHooi97/daylah/repository"
)

type Services struct{ CountdownService *CountdownService }

func InitializeService(r *repository.Repositories) *Services {
	return &Services{CountdownService: &CountdownService{Repo: r.CountdownRepo}}
}
func (s *CountdownService) Get(ctx context.Context, id string) (*model.Snapshot, error) {
	return s.Repo.Get(ctx, id)
}
func (s *CountdownService) Revoke(ctx context.Context, id, token string) (bool, error) {
	return s.Repo.Revoke(ctx, id, Hash(token))
}
