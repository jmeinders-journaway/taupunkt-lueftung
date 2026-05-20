export default function StatCard({ label, value, color, sub, dark }) {
  var bg  = dark ? '#151f35' : '#ffffff'
  var bdr = dark ? '#1e2d45' : '#e2e8f0'
  var lbl = dark ? '#4a5568' : '#94a3b8'
  var sub_ = dark ? '#374151' : '#a0aec0'

  return (
    <div style={{
      background: bg,
      border: '1px solid ' + bdr,
      borderRadius: 14,
      padding: '18px 22px',
      minWidth: 140,
      flex: '1 1 130px',
      transition: 'background 0.2s',
    }}>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: lbl, marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 28, fontWeight: 800, color: color, lineHeight: 1, letterSpacing: '-0.02em' }}>
        {value !== null && value !== undefined ? value : '\u2014'}
      </div>
      {sub && <div style={{ fontSize: 11, color: sub_, marginTop: 5 }}>{sub}</div>}
    </div>
  )
}
