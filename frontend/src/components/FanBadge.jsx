export default function FanBadge({ on }) {
  if (on === null || on === undefined) {
    return (
      <span style={{
        display: 'inline-block', padding: '2px 10px', borderRadius: 20,
        fontSize: 11, fontWeight: 700,
        fontFamily: "'JetBrains Mono', monospace",
        background: '#1a2035', color: '#4a5568',
      }}>—</span>
    )
  }
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 700,
      fontFamily: "'JetBrains Mono', monospace",
      background: on ? '#2d1515' : '#0d2a1a',
      color:      on ? '#f87171' : '#4ade80',
    }}>
      {on ? 'AN' : 'AUS'}
    </span>
  )
}
