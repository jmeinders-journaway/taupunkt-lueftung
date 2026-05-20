export default function RecordCards({ data, dark }) {
  if (!data || !data.length) return null

  var bg  = dark ? '#151f35' : '#ffffff'
  var bdr = dark ? '#1e2d45' : '#e2e8f0'
  var lbl = dark ? '#4a5568' : '#94a3b8'
  var sub = dark ? '#374151' : '#a0aec0'
  var txt = dark ? '#e2e8f0' : '#1a202c'

  function minBy(key) {
    return data.reduce(function(a, b) { return a[key] < b[key] ? a : b })
  }
  function maxBy(key) {
    return data.reduce(function(a, b) { return a[key] > b[key] ? a : b })
  }

  var records = [
    { label: 'Höchste Temperatur', row: maxBy('temp'), val: maxBy('temp').temp + ' °C', color: '#f87171' },
    { label: 'Niedrigste Temperatur', row: minBy('temp'), val: minBy('temp').temp + ' °C', color: '#93c5fd' },
    { label: 'Höchste Luftfeuchte', row: maxBy('hum'), val: maxBy('hum').hum + ' %', color: '#38bdf8' },
    { label: 'Niedrigste Luftfeuchte', row: minBy('hum'), val: minBy('hum').hum + ' %', color: '#fbbf24' },
    { label: 'Höchster Taupunkt', row: maxBy('dp'), val: maxBy('dp').dp + ' °C', color: '#a78bfa' },
    { label: 'Niedrigster Taupunkt', row: minBy('dp'), val: minBy('dp').dp + ' °C', color: '#6ee7b7' },
  ]

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: lbl, marginBottom: 12 }}>
        Rekorde im gewählten Zeitraum
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 10 }}>
        {records.map(function(r) {
          return (
            <div key={r.label} style={{
              background: bg,
              border: '1px solid ' + bdr,
              borderRadius: 12,
              padding: '14px 16px',
              borderTop: '3px solid ' + r.color,
            }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: lbl, marginBottom: 6 }}>
                {r.label}
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 800, color: r.color, lineHeight: 1, marginBottom: 4 }}>
                {r.val}
              </div>
              <div style={{ fontSize: 10, color: sub, fontFamily: "'JetBrains Mono', monospace" }}>
                {r.row.ts}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
