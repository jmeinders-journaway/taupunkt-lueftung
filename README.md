# taupunkt-lueftung

Taupunkt-Monitor fuer den Raspberry Pi (Joy-Pi) mit DHT11 Sensor und automatischer Lueftersteuerung.
Der Pi misst Temperatur und Luftfeuchte, berechnet den Taupunkt und schaltet bei Kondensationsgefahr den Luefter ein.
Alle Messwerte werden in Supabase gespeichert und in einem React-Dashboard auf GitHub Pages angezeigt.

## Aufbau

```
taupunkt-lueftung/
├── frontend/        React-Dashboard (GitHub Pages)
├── raspberry/       Python-Skript fuer den Pi
├── database/        SQL-Schema fuer Supabase
└── README.md
```

## Schnellstart

### 1. Datenbank einrichten
Supabase-Projekt anlegen auf https://supabase.com, dann das Schema einspielen:
-> siehe `database/schema.sql`

### 2. Raspberry Pi einrichten
Abhaengigkeiten installieren und Skript starten:
-> siehe `raspberry/README.md`

### 3. Dashboard deployen
React-App bauen und auf GitHub Pages deployen:
-> siehe `frontend/README.md`

## Live

https://jmeinders-journaway.github.io/taupunkt-lueftung/

## Technologien

- Raspberry Pi 4B + Joy-Pi + DHT11
- Python 3 (adafruit-dht, RPi.GPIO, requests)
- Supabase (PostgreSQL + REST-API)
- React + Vite + Recharts
- GitHub Pages
