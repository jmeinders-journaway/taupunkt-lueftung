-- ============================================================
-- taupunkt-lueftung / Supabase Schema
-- Ausfuehren im Supabase Dashboard: SQL Editor -> Run
-- ============================================================

CREATE TABLE IF NOT EXISTS measurements (
    id           BIGSERIAL    PRIMARY KEY,
    ts           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    location     TEXT         NOT NULL CHECK (location IN ('Innen', 'Aussen')),
    temp_c       REAL         NOT NULL,
    hum_percent  REAL         NOT NULL,
    dewpoint_c   REAL         NOT NULL,
    fan_on       BOOLEAN      NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_measurements_location_ts
    ON measurements (location, ts DESC);

-- Row Level Security
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow public read"
    ON measurements FOR SELECT USING (true);

CREATE POLICY "allow public insert"
    ON measurements FOR INSERT WITH CHECK (true);
