-- Preserve existing countdown data while adopting the requested table name.
ALTER TABLE countdown_snapshots RENAME TO daylah;
-- An updatable compatibility view keeps the previous API binary rollback-safe.
CREATE VIEW countdown_snapshots AS SELECT * FROM daylah;
