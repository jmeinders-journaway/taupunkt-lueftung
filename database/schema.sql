-- ============================================================
-- taupunkt-lueftung / Supabase Schema
-- ============================================================

-- Haupttabelle fuer alle Messwerte
CREATE TABLE IF NOT EXISTS measurements (
    id           BIGSERIAL    PRIMARY KEY,
    ts           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    location     TEXT         NOT NULL CHECK (location IN ('Innen', 'Aussen')),
    temp_c       REAL         NOT NULL,
    hum_percent  REAL         NOT NULL,
    dewpoint_c   REAL         NOT NULL,
    fan_on       BOOLEAN      NOT NULL DEFAULT FALSE
);

