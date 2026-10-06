package migrations

import "embed"

// Files is the canonical versioned PostgreSQL migration source.
//
//go:embed *.sql
var Files embed.FS
