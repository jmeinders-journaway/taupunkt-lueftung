-- ============================================================
-- taupunkt-lueftung / Supabase Schema
-- ============================================================
-- Ausfuehren im Supabase Dashboard unter: SQL Editor -> Run
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

-- Index fuer schnelle Abfragen nach Standort und Zeit
CREATE INDEX IF NOT EXISTS idx_measurements_location_ts
    ON measurements (location, ts DESC);

-- ============================================================
-- Row Level Security (RLS)
-- Schutzt die Daten: jeder darf lesen, jeder darf schreiben,
-- niemand darf loeschen oder veraendern.
-- ============================================================
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;

-- Lesen erlaubt (fuer das Dashboard)
CREATE POLICY "allow public read"
    ON measurements
    FOR SELECT
    USING (true);

-- Schreiben erlaubt (fuer den Raspberry Pi)
CREATE POLICY "allow public insert"
    ON measurements
    FOR INSERT
    WITH CHECK (true);

-- ============================================================
-- Beispielabfragen
-- ============================================================

-- Letzte 10 Messungen Innen:
-- SELECT * FROM measurements WHERE location = 'Innen' ORDER BY ts DESC LIMIT 10;

-- Durchschnittswerte pro Tag:
-- SELECT
--     DATE(ts) AS tag,
--     location,
--     ROUND(AVG(temp_c)::numeric, 1)       AS avg_temp,
--     ROUND(AVG(hum_percent)::numeric, 1)  AS avg_hum,
--     ROUND(AVG(dewpoint_c)::numeric, 1)   AS avg_dp,
--     COUNT(*) FILTER (WHERE fan_on)       AS fan_an_count
-- FROM measurements
-- GROUP BY DATE(ts), location
-- ORDER BY tag DESC, location;
