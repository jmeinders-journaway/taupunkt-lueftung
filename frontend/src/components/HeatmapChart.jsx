import { useState, useMemo } from 'react'

var HOURS = []
for (var i = 0; i < 24; i++) { HOURS.push(i) }

var METRICS_CFG = {
  temp: { label: 'Temperatur', unit: '°C', low: '#93c5fd', mid: '#fbbf24', high: '#f87171' },
  hum:  { label: 'Luftfeuchte', unit: '%', low: '#fde68a', mid: '#38bdf8', high: '#1d4ed8' },
  dp:   { label: 'Taupunkt', unit: '°C', low: '#6ee7b7', mid: '#818cf8', high: '#a21caf' },
}

function lerpColor(a, b, t) {
  function hex(s) { return parseInt(s, 16) }
  var ar = hex(a.slice(1,3)), ag = hex(a.slice(3,5)), ab = hex(a.slice(5,7))
  var br = hex(b.slice(1,3)), bg = hex(b.slice(3,5)), bb = hex(b.slice(5,7))
  var r = Math.round(ar + (br - ar) * t)
  var g = Math.round(ag + (bg - ag) * t)
  var bv = Math.round(ab + (bb - ab) * t)
  return 'rgb(' + r + ',' + g + ',' + bv + ')'
}

function colorForValue(val, min, max, cfg) {
  if (val === null) return 'transparent'
  var t = max === min ? 0.5 : (val - min) / (max - min)
  if (t < 0.5) return lerpColor(cfg.low, cfg.mid, t * 2)
  return lerpColor(cfg.mid, cfg.high, (t - 0.5) * 2)
}

export default function HeatmapChart({ data, dark }) {
  var _metric = useState('temp')
  var metric  = _metric[0]
  var setMetric = _metric[1]

  var bg   = dark ? '#0d1526' : '#f8fafc'
  var bdr  = dark ? '#1e2d45' : '#e2e8f0'
  var bg2  = dark ? '#151f35' : '#f0f4f8'
  var lbl  = dark ? '#374151' : '#94a3b8'
  var txt  = dark ? '#e2e8f0' : '#1a202c'
  var txt2 = dark ? '#6b7280' : '#94a3b8'
  var cfg  = METRICS_CFG[metric]

  var days = useMemo(function() {
    var seen = {}; var arr = []
    data.forEach(function(d) { if (!seen[d.day]) { seen[d.day] = true; arr.push(d.day) } })
    return arr.sort()
  }, [data])

  // Durchschnitt pro Tag + Stunde
  var grid = useMemo(function() {
    var map = {}
    data.forEach(function(d) {
      var h = parseInt(d.label.slice(0, 2), 10)
      var k = d.day + '_' + h
      if (!map[k]) map[k] = { sum: 0, n: 0 }
      map[k].sum += d[metric]
      map[k].n++
    })
    var result = {}
    Object.keys(map).forEach(function(k) {
      result[k] = +(map[k].sum / map[k].n).toFixed(1)
    })
    return result
  }, [data, metric])

  var allVals = Object.values(grid).filter(function(v) { return v !== null })
  var minVal  = allVals.length ? Math.min.apply(null, allVals) : 0
  var maxVal  = allVals.length ? Math.max.apply(null, allVals) : 1

  var cellW = Math.max(28, Math.min(52, Math.floor((900 - 60) / Math.max(days.length, 1))))

  function formatDayShort(d) {
    var parts = d.split('-')
    return parts[2] + '.' + parts[1]
  }

  return (
    <div style={{ background: bg, border: '1px solid ' + bdr, borderRadius: 14, padding: '20px 18px 14px', marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: lbl }}>
          Tages-Heatmap — Ø {cfg.label} pro Stunde
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {Object.keys(METRICS_CFG).map(function(k) {
            return (
              <button key={k} onClick={function() { setMetric(k) }} style={{
                padding: '4px 10px', borderRadius: 6, border: 'none',
                cursor: 'pointer', fontSize: 11, fontWeight: 600,
                background: metric === k ? METRICS_CFG[k].high + '33' : 'transparent',
                color: metric === k ? METRICS_CFG[k].high : lbl,
              }}>
                {METRICS_CFG[k].label}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'flex', minWidth: days.length * cellW + 50 }}>
          {/* Stunden-Achse links */}
          <div style={{ width: 36, flexShrink: 0 }}>
            <div style={{ height: 24 }} />
            {HOURS.map(function(h) {
              return (
                <div key={h} style={{
                  height: 22, display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                  paddingRight: 6, fontSize: 9, color: txt2, fontFamily: "'JetBrains Mono', monospace",
                }}>
                  {String(h).padStart(2,'0')}
                </div>
              )
            })}
          </div>

          {/* Spalten pro Tag */}
          {days.map(function(day) {
            return (
              <div key={day} style={{ width: cellW, flexShrink: 0 }}>
                <div style={{
                  height: 24, fontSize: 9, color: txt2,
                  fontFamily: "'JetBrains Mono', monospace",
                  textAlign: 'center', fontWeight: 600,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {formatDayShort(day)}
                </div>
                {HOURS.map(function(h) {
                  var val  = grid[day + '_' + h]
                  var clr  = colorForValue(val !== undefined ? val : null, minVal, maxVal, cfg)
                  var isDark = val !== undefined && (val - minVal) / (maxVal - minVal || 1) > 0.5
                  return (
                    <div key={h} title={val !== undefined ? val + ' ' + cfg.unit : 'Keine Daten'} style={{
                      height: 22, margin: 1,
                      background: clr,
                      borderRadius: 3,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 8, fontWeight: 700, color: val !== undefined ? (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)') : 'transparent',
                      fontFamily: "'JetBrains Mono', monospace",
                      cursor: 'default',
                    }}>
                      {val !== undefined ? val : ''}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legende */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 10, color: txt2 }}>
        <span>niedrig</span>
        <div style={{ display: 'flex', height: 10, flex: 1, maxWidth: 200, borderRadius: 4, overflow: 'hidden' }}>
          {Array.from({ length: 20 }, function(_, i) {
            return (
              <div key={i} style={{ flex: 1, background: colorForValue(minVal + (maxVal - minVal) * i / 19, minVal, maxVal, cfg) }} />
            )
          })}
        </div>
        <span>hoch</span>
        <span style={{ marginLeft: 8, fontFamily: "'JetBrains Mono', monospace" }}>
          {minVal} – {maxVal} {cfg.unit}
        </span>
      </div>
    </div>
  )
}
