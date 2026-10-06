package repository

import (
	"context"
	"github.com/CheeHooi97/daylah/model"
	"gorm.io/gorm"
	"time"
)

type CountdownRepository interface {
	Create(context.Context, *model.Snapshot) error
	Get(context.Context, string) (*model.Snapshot, error)
	Revoke(context.Context, string, string) (bool, error)
}
type countdownRepository struct{ db *gorm.DB }

func NewCountdownRepository(db *gorm.DB) CountdownRepository { return &countdownRepository{db} }
func (r *countdownRepository) Create(ctx context.Context, s *model.Snapshot) error {
	return r.db.WithContext(ctx).Create(s).Error
}
func (r *countdownRepository) Get(ctx context.Context, id string) (*model.Snapshot, error) {
	var s model.Snapshot
	err := r.db.WithContext(ctx).Where("public_id = ? AND revoked_at IS NULL", id).First(&s).Error
	return &s, err
}
func (r *countdownRepository) Revoke(ctx context.Context, id, hash string) (bool, error) {
	result := r.db.WithContext(ctx).Model(&model.Snapshot{}).Where("public_id = ? AND token_hash = ? AND revoked_at IS NULL", id, hash).Update("revoked_at", time.Now().UTC())
	return result.RowsAffected == 1, result.Error
}
