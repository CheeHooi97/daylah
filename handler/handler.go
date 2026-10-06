package handler

import "github.com/CheeHooi97/daylah/service"

func NewHandler(s *service.Services) *Handler { return &Handler{Countdowns: s.CountdownService} }
