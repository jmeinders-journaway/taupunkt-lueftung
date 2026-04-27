export default function StatCard({ label, value, color, sub }) {
  return (
    <div style={{
      background: '#151f35',
      border: '1px solid #1e2d45',
      borderRadius: 14,
      padding: '18px 22px',
      minWidth: 140,
      flex: '1 1 130px',
    }}>
      <div style={{
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: '#4a5568',
        marginBottom: 8,
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 28,
        fontWeight: 800,
        color: color,
        lineHeight: 1,
        letterSpacing: '-0.02em',
      }}>
        {value !== null ? value : '—'}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: '#374151', marginTop: 5 }}>{sub}</div>
      )}
    </div>
  )
}
