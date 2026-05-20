import { useState, useEffect, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area } from 'recharts'
import { fetchMeasurements } from '../data/supabase'
import { transformRows, uniqueDays, formatDay } from '../data/utils'

var METRIC_CFG = {
  temp: { label: 'Temperatur', unit: '°C' },
  hum:  { label: 'Luftfeuchte', unit: '%' },
  dp:   { label: 'Taupunkt', unit: '°C' },
}

export default function CompareView({ dark }) {
  var _innen  = useState([])
  var innen   = _innen[0]
  var setInnen = _innen[1]

  var _aussen  = useState([])
  var aussen   = _aussen[0]
  var setAussen = _aussen[1]

  var _loading = useState(true)
  var loading    = _loading[0]
  var setLoading = _loading[1]

  var _metric = useState('temp')
  var metric  = _metric[0]
  var setMetric = _metric[1]

  var _activeDay = useState('all')
  var activeDay    = _activeDay[0]
  var setActiveDay = _activeDay[1]

  useEffect(function() {
    // 2880 = 48h, damit mehrere Tage zur Auswahl stehen
    Promise.all([fetchMeasurements('Innen', 2880), fetchMeasurements('Aussen', 2880)])
      .then(function(results) {
        setInnen(transformRows(results[0]))
        setAussen(transformRows(results[1]))
        setLoading(false)
      })
      .catch(function() { setLoading(false) })
  }, [])

  var bg   = dark ? '#0d1526' : '#f8fafc'
  var bdr  = dark ? '#1e2d45' : '#e2e8f0'
  var grid = dark ? '#151f35' : '#e2e8f0'
  var tick = { fill: dark ? '#374151' : '#94a3b8', fontSize: 10 }
  var lbl  = dark ? '#374151' : '#94a3b8'
  var ttBg = dark ? '#0b1120' : '#ffffff'
  var legStyle = { fontSize: 12, color: dark ? '#6b7280' : '#94a3b8', fontFamily: "'JetBrains Mono', monospace" }

  var m = METRIC_CFG[metric]

  // Verfügbare Tage aus Innen-Daten ableiten
  var days = useMemo(function() { return uniqueDays(innen) }, [innen])

  // Nach Tag filtern
  var innenFiltered  = useMemo(function() {
    return activeDay === 'all' ? innen  : innen.filter(function(d) { return d.day === activeDay })
  }, [innen, activeDay])

  var aussenFiltered = useMemo(function() {
    return activeDay === 'all' ? aussen : aussen.filter(function(d) { return d.day === activeDay })
  }, [aussen, activeDay])

  // Auf gleiche Timestamps joinen
  var combined = useMemo(function() {
    var map = {}
    innenFiltered.forEach(function(d) {
      if (!map[d.ts]) map[d.ts] = { ts: d.ts, label: d.label }
      map[d.ts].innen = d[metric]
      map[d.ts].fan = d.fan
    })
    aussenFiltered.forEach(function(d) {
      if (!map[d.ts]) map[d.ts] = { ts: d.ts, label: d.label }
      map[d.ts].aussen = d[metric]
    })
    return Object.values(map)
      .sort(function(a, b) { return a.ts < b.ts ? -1 : 1 })
      .filter(function(_, i) { return i % 3 === 0 }) // jeder 3. Punkt für Performance
  }, [innenFiltered, aussenFiltered, metric])

  // Differenz berechnen
  var diff = useMemo(function() {
    return combined.map(function(d) {
      return {
        ts: d.ts,
        label: d.label,
        diff: (d.innen !== undefined && d.aussen !== undefined)
          ? +(d.innen - d.aussen).toFixed(1)
          : undefined
      }
    })
  }, [combined])

  // Dynamische X-Achsen-Intervalle für lesbare Beschriftungen
  var xIntervalMain = Math.max(0, Math.floor(combined.length / 8) - 1)
  var xIntervalDiff = Math.max(0, Math.floor(diff.length / 8) - 1)
  var xIntervalFan  = Math.max(0, Math.floor(combined.length / 8) - 1)

  if (loading) {
    return (
      <div style={{ background: bg, border: '1px solid ' + bdr, borderRadius: 14, padding: '40px', textAlign: 'center', color: lbl, fontSize: 13, marginBottom: 18 }}>
        Lade Vergleichsdaten...
      </div>
    )
  }

  return (
    <div style={{ background: bg, border: '1px solid ' + bdr, borderRadius: 14, padding: '20px 18px 14px', marginBottom: 18 }}>

      {/* Kopfzeile: Titel + Metrik-Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: lbl }}>
          Innen vs. Außen — {m.label}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {Object.keys(METRIC_CFG).map(function(k) {
            return (
              <button key={k} onClick={function() { setMetric(k) }} style={{
                padding: '4px 10px', borderRadius: 6, border: 'none',
                cursor: 'pointer', fontSize: 11, fontWeight: 600,
                background: metric === k ? (dark ? '#1e2d45' : '#e2e8f0') : 'transparent',
                color: metric === k ? (dark ? '#e2e8f0' : '#1a202c') : lbl,
              }}>
                {METRIC_CFG[k].label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tagesauswahl */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 14, flexWrap: 'wrap' }}>
        <button onClick={function() { setActiveDay('all') }} style={{
          padding: '3px 9px', borderRadius: 6, border: 'none',
          cursor: 'pointer', fontSize: 11, fontWeight: 600,
          background: activeDay === 'all' ? (dark ? '#1e2d45' : '#e2e8f0') : 'transparent',
          color: activeDay === 'all' ? (dark ? '#e2e8f0' : '#1a202c') : lbl,
        }}>
          Alle
        </button>
        {days.map(function(day) {
          return (
            <button key={day} onClick={function() { setActiveDay(day) }} style={{
              padding: '3px 9px', borderRadius: 6, border: 'none',
              cursor: 'pointer', fontSize: 11, fontWeight: 600,
              background: activeDay === day ? (dark ? '#1e2d45' : '#e2e8f0') : 'transparent',
              color: activeDay === day ? (dark ? '#e2e8f0' : '#1a202c') : lbl,
            }}>
              {formatDay(day)}
            </button>
          )
        })}
      </div>

      {/* Haupt-Vergleichs-Chart */}
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={combined} margin={{ top: 4, right: 12, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={grid} />
          <XAxis dataKey="label" tick={tick} interval={xIntervalMain} />
          <YAxis tick={tick} tickFormatter={function(v) { return v + m.unit }} width={52} />
          <Tooltip
            contentStyle={{ background: ttBg, border: '1px solid ' + bdr, borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: dark ? '#6b7280' : '#94a3b8', fontFamily: "'JetBrains Mono', monospace" }}
            formatter={function(v, name) { return [v + m.unit, name] }}
          />
          <Legend wrapperStyle={legStyle} />
          <Line type="monotone" dataKey="innen"  name="Innen"  stroke="#f472b6" dot={false} strokeWidth={2} connectNulls />
          <Line type="monotone" dataKey="aussen" name="Außen"  stroke="#34d399" dot={false} strokeWidth={2} connectNulls />
        </LineChart>
      </ResponsiveContainer>

      {/* Differenz-Chart */}
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: lbl, margin: '14px 0 10px' }}>
        Differenz Innen – Außen ({m.unit})
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={diff} margin={{ top: 4, right: 12, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={grid} />
          <XAxis dataKey="label" tick={tick} interval={xIntervalDiff} />
          <YAxis tick={tick} tickFormatter={function(v) { return v + m.unit }} width={52} />
          <Tooltip
            contentStyle={{ background: ttBg, border: '1px solid ' + bdr, borderRadius: 8, fontSize: 12 }}
            formatter={function(v) { return [v + m.unit, 'Differenz'] }}
          />
          <Line type="monotone" dataKey="diff" name="Differenz" stroke="#fb923c" dot={false} strokeWidth={2} connectNulls />
        </LineChart>
      </ResponsiveContainer>

      {/* Lüfter-Status-Chart */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0 10px' }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: lbl }}>
          Lüfter Status
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: lbl }}>
          <span style={{ display: 'inline-block', width: 10, height: 8, background: 'rgba(251,146,60,0.45)', border: '1px solid rgba(251,146,60,0.7)', borderRadius: 2 }} />
          <span>AN</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={50}>
        <ComposedChart data={combined} margin={{ top: 2, right: 12, bottom: 2, left: 0 }}>
          <XAxis dataKey="label" tick={tick} interval={xIntervalFan} />
          <YAxis domain={[0, 1]} hide width={52} />
          <Tooltip
            contentStyle={{ background: ttBg, border: '1px solid ' + bdr, borderRadius: 8, fontSize: 12 }}
            formatter={function(v) { return [v === 1 ? 'AN' : 'AUS', 'Lüfter'] }}
            labelStyle={{ color: dark ? '#6b7280' : '#94a3b8', fontFamily: "'JetBrains Mono', monospace" }}
          />
          <Area type="stepAfter" dataKey="fan" fill="rgba(251,146,60,0.35)" stroke="#fb923c" strokeWidth={1.5} dot={false} isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
