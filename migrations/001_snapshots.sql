CREATE TABLE countdown_snapshots (
 id BIGSERIAL PRIMARY KEY,
 public_id TEXT UNIQUE NOT NULL,
 title VARCHAR(120) NOT NULL,
 date VARCHAR(10) NOT NULL,
 timezone TEXT NOT NULL,
 recurrence TEXT NOT NULL CHECK (recurrence IN ('none','annual')),
 leap_policy TEXT NOT NULL CHECK (leap_policy IN ('feb28','mar1')),
 theme TEXT NOT NULL CHECK (theme IN ('indigo','rose','forest')),
 token_hash TEXT NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 revoked_at TIMESTAMPTZ
);
