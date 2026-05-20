import time
import math
import requests
from datetime import datetime, timezone
import board
import adafruit_dht
import RPi.GPIO as GPIO

# ── Konfiguration ──────────────────────────────────────────────
DHT_PIN        = board.D4
FAN_PIN        = 17
THRESHOLD_C    = 3.0
INTERVAL_S     = 2
LOCATION       = "Innen"           # "Innen" oder "Aussen"

SUPABASE_URL   = "https://DEIN-PROJEKT.supabase.co"
SUPABASE_KEY   = "dein-anon-public-key"
# ──────────────────────────────────────────────────────────────

dht = adafruit_dht.DHT11(DHT_PIN)
GPIO.setmode(GPIO.BCM)
GPIO.setup(FAN_PIN, GPIO.OUT, initial=GPIO.LOW)

print("Taupunkt-Lueftung gestartet")
print(f"Standort : {LOCATION}")
print(f"Schwelle : {THRESHOLD_C} C\n")


def plausible(temp_c, hum):
    return (-10.0 <= temp_c <= 60.0) and (1.0 <= hum <= 100.0)


def dew_point(temp_c, hum):
    a, b = 17.62, 243.12
    gamma = (a * temp_c) / (b + temp_c) + math.log(hum / 100.0)
    return (b * gamma) / (a - gamma)


def set_fan(on):
    GPIO.output(FAN_PIN, GPIO.HIGH if on else GPIO.LOW)


def save_to_supabase(ts, temp, hum, dp, fan_on):
    try:
        requests.post(
            f"{SUPABASE_URL}/rest/v1/measurements",
            headers={
                "apikey":        SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type":  "application/json",
            },
            json={
                "ts":          ts,
                "location":    LOCATION,
                "temp_c":      temp,
                "hum_percent": hum,
                "dewpoint_c":  dp,
                "fan_on":      bool(fan_on),
            },
            timeout=5,
        )
    except requests.RequestException as e:
        print(f"Supabase Fehler: {e}")


try:
    while True:
        try:
            temp = dht.temperature
            hum  = dht.humidity

            if temp is None or hum is None:
                print("Keine Daten -> neuer Versuch...")
                time.sleep(INTERVAL_S)
                continue

            if not plausible(temp, hum):
                print(f"Unplausibel -> T={temp:.1f} C, H={hum:.1f} %")
                time.sleep(INTERVAL_S)
                continue

            taupunkt = dew_point(temp, hum)
            abstand  = temp - taupunkt
            fan_on   = abstand < THRESHOLD_C

            set_fan(fan_on)

            ts = datetime.now(timezone.utc).isoformat()

            print(f"Zeit     : {ts}")
            print(f"Temp     : {temp:5.1f} C")
            print(f"Feuchte  : {hum:5.1f} %")
            print(f"Taupunkt : {taupunkt:5.1f} C  (Abstand: {abstand:.1f} C)")
            print(f"Luefter  : {'AN' if fan_on else 'AUS'}")
            print("-" * 40)

            save_to_supabase(ts, temp, hum, taupunkt, fan_on)
            time.sleep(INTERVAL_S)

        except RuntimeError:
            print("Lesefehler -> neuer Versuch...")
            time.sleep(1)

except KeyboardInterrupt:
    print("\nMessung beendet.")

finally:
    set_fan(False)
    GPIO.cleanup()
    print("GPIO freigegeben.")
