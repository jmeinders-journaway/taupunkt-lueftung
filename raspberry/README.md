# Raspberry Pi Setup

## Abhängigkeiten installieren

```bash
pip install adafruit-circuitpython-dht RPi.GPIO requests --break-system-packages
```

## Konfiguration

In `taupunkt_lueftung.py` diese Werte anpassen:

```python
LOCATION     = "Innen"      # oder "Aussen" - muss exakt so geschrieben sein
SUPABASE_URL = "https://DEIN-PROJEKT.supabase.co"
SUPABASE_KEY = "dein-anon-public-key"
FAN_PIN      = 17            # GPIO-Pin des Lüfters (BCM-Nummerierung)
THRESHOLD_C  = 3.0           # Lüfter AN wenn Temp - Taupunkt < 3 Grad
```

## Starten

```bash
python3 taupunkt_lueftung.py
```