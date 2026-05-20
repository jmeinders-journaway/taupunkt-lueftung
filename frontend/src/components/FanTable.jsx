import { useMemo } from 'react'
import { formatDay } from '../data/utils'

export default function FanTable({ data, dark }) {
  var bg1  = dark ? '#0d1526' : '#f8fafc'
  var bg2  = dark ? '#151f35' : '#f0f4f8'
  var bg0  = dark ? '#0b1120' : '#ffffff'
  var bdr  = dark ? '#1e2d45' : '#e2e8f0'
  var txt0 = dark ? '#e2e8f0' : '#1a202c'
  var txt1 = dark ? '#6b7280' : '#718096'

  // Zusammenhängende Fan-AN Perioden berechnen
  var periods = useMemo(function() {
    var result = []
    var start  = null
    var startTs = null

    for (var i = 0; i < data.length; i++) {
      var d = data[i]
      if (d.fan && start === null) {
        start   = i
        startTs = d.ts
      } else if (!d.fan && start !== null) {
        var prev = data[i - 1]
        result.push({
          from:     startTs,
          to:       prev.ts,
          day:      prev.day,
          count:    i - start,
          tempAvg:  +(data.slice(start, i).reduce(function(s, r) { return s + r.temp }, 0) / (i - start)).toFixed(1),
          dpAvg:    +(data.slice(start, i).reduce(function(s, r) { return s + r.dp   }, 0) / (i - start)).toFixed(1),
        })
        start = null
      }
    }
    // Letzter Block falls Daten mit fan=1 enden
    if (start !== null) {
      var last = data[data.length - 1]
      result.push({
        from:    startTs,
        to:      last.ts,
        day:     last.day,
        count:   data.length - start,
        tempAvg: +(data.slice(start).reduce(function(s, r) { return s + r.temp }, 0) / (data.length - start)).toFixed(1),
        dpAvg:   +(data.slice(start).reduce(function(s, r) { return s + r.dp   }, 0) / (data.length - start)).toFixed(1),
      })
    }
    return result
  }, [data])

  var fanRows    = data.filter(function(d) { return d.fan })
  var fanPercent = data.length ? Math.round(fanRows.length / data.length * 100) : 0

  return (
    <div style={{
      background: bg1,
      border: '1px solid ' + bdr,
      borderRadius: 14,
      padding: '18px 18px 14px',
      marginBottom: 18,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: txt1 }}>
          Lüfter-Protokoll
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 11, color: txt1, fontFamily: "'JetBrains Mono', monospace" }}>
          <span>Perioden: <b style={{ color: '#fb923c' }}>{periods.length}</b></span>
          <span>Messungen aktiv: <b style={{ color: '#fb923c' }}>{fanRows.length}</b></span>
          <span>Anteil: <b style={{ color: '#fb923c' }}>{fanPercent} %</b></span>
        </div>
      </div>

      {periods.length === 0 ? (
        <div style={{ fontSize: 12, color: txt1, padding: '20px 0', textAlign: 'center', fontFamily: "'JetBrains Mono', monospace" }}>
          Keine Lüfter-Aktivität im gewählten Zeitraum
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, color: txt0 }}>
            <thead>
              <tr>
                {['Tag', 'Von', 'Bis', 'Dauer (Messungen)', 'Ø Temperatur', 'Ø Taupunkt'].map(function(h) {
                  return (
                    <th key={h} style={{
                      padding: '7px 12px',
                      background: bg2,
                      borderBottom: '2px solid ' + bdr,
                      textAlign: 'left',
                      fontWeight: 700,
                      fontSize: 11,
                      letterSpacing: '0.05em',
                      color: txt1,
                      whiteSpace: 'nowrap',
                    }}>{h}</th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {periods.map(function(p, i) {
                return (
                  <tr key={i} style={{ background: i % 2 === 0 ? bg1 : bg0 }}>
                    <td style={{ padding: '6px 12px', borderBottom: '1px solid ' + bdr, whiteSpace: 'nowrap' }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{formatDay(p.day)}</span>
                    </td>
                    <td style={{ padding: '6px 12px', borderBottom: '1px solid ' + bdr, whiteSpace: 'nowrap' }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#fb923c' }}>{p.from.slice(-5)}</span>
                    </td>
                    <td style={{ padding: '6px 12px', borderBottom: '1px solid ' + bdr, whiteSpace: 'nowrap' }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace', color: '#fb923c" }}>{p.to.slice(-5)}</span>
                    </td>
                    <td style={{ padding: '6px 12px', borderBottom: '1px solid ' + bdr }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '1px 8px', borderRadius: 20,
                        background: dark ? '#2d1c0a' : '#ffedd5',
                        color: '#fb923c',
                        fontSize: 11, fontWeight: 700,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>
                        {p.count}×
                      </span>
                    </td>
                    <td style={{ padding: '6px 12px', borderBottom: '1px solid ' + bdr }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#f472b6' }}>{p.tempAvg} °C</span>
                    </td>
                    <td style={{ padding: '6px 12px', borderBottom: '1px solid ' + bdr }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#a78bfa' }}>{p.dpAvg} °C</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
