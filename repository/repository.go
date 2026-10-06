package repository

import "gorm.io/gorm"

type Repositories struct{ CountdownRepo CountdownRepository }

func InitializeRepository(db *gorm.DB) *Repositories {
	return &Repositories{CountdownRepo: NewCountdownRepository(db)}
}
