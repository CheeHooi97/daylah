package model

import "time"

type Snapshot struct {
	ID         uint64     `json:"-" gorm:"primaryKey"`
	PublicID   string     `json:"publicId" gorm:"uniqueIndex"`
	Title      string     `json:"title"`
	Date       string     `json:"date"`
	Timezone   string     `json:"timezone"`
	Recurrence string     `json:"recurrence"`
	LeapPolicy string     `json:"leapPolicy"`
	Theme      string     `json:"theme"`
	TokenHash  string     `json:"-"`
	CreatedAt  time.Time  `json:"createdAt"`
	RevokedAt  *time.Time `json:"-"`
}

func (Snapshot) TableName() string { return "daylah" }
