export const DAY_COLORS = [
  '#38bdf8',
  '#818cf8',
  '#34d399',
  '#f472b6',
  '#fb923c',
  '#a78bfa',
]

export function formatDay(dateStr) {
  var parts  = dateStr.split('-')
  var month  = parseInt(parts[1], 10)
  var day    = parts[2]
  var names  = ['Jan','Feb','Mrz','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez']
  return day + '. ' + names[month - 1]
}

export function transformRows(rows, timezone) {
  var tz = timezone || 'Europe/Berlin'
  // Supabase liefert desc (neueste zuerst) → umkehren für Charts (alt → neu)
  var reversed = rows.slice().reverse()
  return reversed.map(function(r) {
    // Supabase gibt z.B. "2025-06-01T07:30:00+00:00" zurück
    // Wir parsen als UTC und formatieren dann in der gewünschten Zeitzone
    var utcStr = r.ts
    var d = new Date(utcStr)

    // Lokale Uhrzeit in der Zielzeitzone extrahieren
    var localTs = d.toLocaleString('sv-SE', { timeZone: tz }) // sv-SE gibt YYYY-MM-DD HH:MM:SS
    var localDay   = localTs.slice(0, 10)   // "2025-06-01"
    var localLabel = localTs.slice(11, 16)  // "09:30"
    var localFull  = localDay + ' ' + localLabel  // "2025-06-01 09:30"

    return {
      id:    r.id,
      ts:    localFull,
      day:   localDay,
      label: localLabel,
      temp:  r.temp_c,
      hum:   r.hum_percent,
      dp:    r.dewpoint_c,
      fan:   r.fan_on ? 1 : 0,
    }
  })
}

export function uniqueDays(data) {
  var seen = {}
  var days = []
  for (var i = 0; i < data.length; i++) {
    if (!seen[data[i].day]) {
      seen[data[i].day] = true
      days.push(data[i].day)
    }
  }
  return days.sort()
}

export function calcStats(data) {
  var empty = { tempAvg: null, humAvg: null, dpAvg: null, fanPct: null, latest: null }
  if (!data || !data.length) return empty
  var n = data.length
  var tSum = 0, hSum = 0, dSum = 0, fanN = 0
  for (var i = 0; i < n; i++) {
    tSum += data[i].temp
    hSum += data[i].hum
    dSum += data[i].dp
    if (data[i].fan) fanN++
  }
  return {
    tempAvg: +(tSum / n).toFixed(1),
    humAvg:  +(hSum / n).toFixed(1),
    dpAvg:   +(dSum / n).toFixed(1),
    fanPct:  Math.round(fanN / n * 100),
    latest:  data[data.length - 1],
  }
}

// Celsius -> Fahrenheit
export function toF(c) {
  return +(c * 9 / 5 + 32).toFixed(1)
}

// Fahrenheit -> Celsius
export function fromF(f) {
  return +((f - 32) * 5 / 9).toFixed(1)
}

// Temperatur formatieren je nach Einheit
export function fmtTemp(c, unit) {
  if (unit === 'F') return toF(c) + ' °F'
  return c + ' °C'
}

// Gefühlte Temperatur (Heat Index ab 27°C, Wind Chill unter 10°C, sonst gleich Temp)
// Windgeschwindigkeit unbekannt → Wind Chill nicht sinnvoll → nur Heat Index
export function feelsLike(tempC, hum) {
  if (tempC >= 27) {
    // Heat Index (Rothfusz-Gleichung)
    var T = tempC
    var R = hum
    var HI = -8.78469475556
      + 1.61139411 * T
      + 2.33854883889 * R
      - 0.14611605 * T * R
      - 0.012308094 * T * T
      - 0.0164248277778 * R * R
      + 0.002211732 * T * T * R
      + 0.00072546 * T * R * R
      - 0.000003582 * T * T * R * R
    return +HI.toFixed(1)
  }
  // Unter 27°C: Temperatur = gefühlte Temperatur (ohne Wind unbekannt)
  return tempC
}

// Absolute Luftfeuchte in g/m³
// Formel: AH = (6.112 * e^(17.67*T/(T+243.5)) * hum * 2.1674) / (273.15 + T)
export function absoluteHumidity(tempC, hum) {
  var e = 6.112 * Math.exp((17.67 * tempC) / (tempC + 243.5))
  return +((e * hum * 2.1674) / (273.15 + tempC)).toFixed(2)
}

// Zeitzone: IANA-String -> formatierter Zeitstempel
export function formatTs(ts, timezone) {
  try {
    var d = new Date(ts.replace(' ', 'T') + ':00')
    return d.toLocaleString('de-DE', {
      timeZone: timezone || 'Europe/Berlin',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch (e) {
    return ts
  }
}
