# taupunkt-lueftung

Taupunkt-Monitor fuer den Raspberry Pi mit DHT11 Sensor und automatischer Lueftersteuerung.
Messwerte werden in Supabase gespeichert und live im React-Dashboard angezeigt.

Live: https://jmeinders-journaway.github.io/taupunkt-lueftung/

## Struktur

```
taupunkt-lueftung/
├── database/   SQL-Schema fuer Supabase
├── raspberry/  Python-Skript fuer den Pi
└── frontend/   React-Dashboard (GitHub Pages)
```

## Schnellstart

1. `database/schema.sql` in Supabase ausfuehren
2. `frontend/.env.local` mit Supabase URL + Key befuellen
3. `cd frontend && npm install && npm run dev`
4. `npm run deploy` fuer GitHub Pages
