import math
import time
from datetime import datetime, timezone

import requests
import board
import adafruit_dht
import RPi.GPIO as GPIO

# ============================================================
# Supabase Verbindung
# ============================================================

SUPABASE_URL = ""
SUPABASE_ANON_KEY = ""
SUPABASE_TABLE_URL = "{SUPABASE_URL}/rest/v1/measurements"

SUPABASE_HEADERS = {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal",
}

# ============================================================
# GPIO Pins
# ============================================================

INSIDE_PIN = board.D4
OUTSIDE_PIN = board.D26

FAN_PIN = 21

# ============================================================
# Logik
# ============================================================

DEWPOINT_DIFF_ON = 4.0
DEWPOINT_DIFF_OFF = 3.0

def dew_point_c(temp_c: float, hum_percent: float) -> float:
    a = 17.62
    b = 243.12
    gamma = (a * temp_c) / (b + temp_c) + math.log(hum_percent / 100.0)
    return (b * gamma) / (a - gamma)


def plausible(temp_c: float, hum_percent: float) -> bool:
    return (-10.0 <= temp_c <= 60.0) and (1.0 <= hum_percent <= 100.0)


def save(location, temp, hum, dew, fan_on, ts):
    payload = {
        "ts": ts,
        "location": location,
        "temp_c": temp,
        "hum_percent": hum,
        "dewpoint_c": dew,
        "fan_on": fan_on
    }

    response = requests.post(
        SUPABASE_TABLE_URL,
        headers=SUPABASE_HEADERS,
        json=payload,
        timeout=10
    )

    if response.status_code not in (200, 201, 204):
        print(f"Supabase Fehler ({location}): {response.status_code}")
        print(response.text)


def main():
    GPIO.setwarnings(False)
    GPIO.setmode(GPIO.BCM)
    GPIO.cleanup()
    
    GPIO.setup(FAN_PIN, GPIO.OUT)

    GPIO.output(FAN_PIN, GPIO.HIGH)

    dht_inside = adafruit_dht.DHT22(INSIDE_PIN)
    dht_outside = adafruit_dht.DHT22(OUTSIDE_PIN)

    fan_on = False

    print("Taupunkt Messung (ohne Lfter) gestartet")
    print("=" * 50)

    
    while True:
        try:
            # Innen messen
            t_in = dht_inside.temperature
            h_in = dht_inside.humidity

            time.sleep(2) 

            # Auen messen
            t_out = dht_outside.temperature
            h_out = dht_outside.humidity

            if None in (t_in, h_in, t_out, h_out):
                print("Sensor liefert None, retry...")
                time.sleep(2)
                continue

            if not plausible(t_in, h_in) or not plausible(t_out, h_out):
                print("Unplausible Werte, bersprungen")
                time.sleep(2)
                continue

            dp_in = dew_point_c(t_in, h_in)
            dp_out = dew_point_c(t_out, h_out)

            delta = dp_in - dp_out
            
            if not fan_on and delta >= DEWPOINT_DIFF_ON:
             fan_on = True
             GPIO.output(FAN_PIN, GPIO.LOW)   # EIN

            elif fan_on and delta <= DEWPOINT_DIFF_OFF:
             fan_on = False
             GPIO.output(FAN_PIN, GPIO.HIGH)  # AUS
            
            ts = datetime.now(timezone.utc).isoformat()

            print(f"Zeit:              {ts}")
            print("-" * 50)
            print(f"Innen Temp:        {t_in:5.1f} C")
            print(f"Innen Feuchte:     {h_in:5.1f} %")
            print(f"Innen Taupunkt:    {dp_in:5.1f} C")
            print("-" * 50)
            print(f"Aussen Temp:       {t_out:5.1f} C")
            print(f"Aussen Feuchte:    {h_out:5.1f} %")
            print(f"Aussen Taupunkt:   {dp_out:5.1f} C")
            print("-" * 50)
            print(f"Differenz:         {delta:5.2f} C")
            print(f"Luefter (berechnet): {'AN' if fan_on else 'AUS'}")
            print("=" * 50)

            # Supabase speichern
            save("Innen", t_in, h_in, dp_in, fan_on, ts)
            save("Aussen", t_out, h_out, dp_out, fan_on, ts)

            print("Gespeichert\n")

        except RuntimeError as e:
            print("Sensorfehler:", e)

        except Exception as e:
            print("Fataler Fehler:", e)
            
            GPIO.output(FAN_PIN, GPIO.HIGH)
            GPIO.cleanup()
            break

        time.sleep(5)


if __name__ == "__main__":
    main()
