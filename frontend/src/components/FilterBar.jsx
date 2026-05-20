import { DAY_COLORS, formatDay } from '../data/utils'

var METRICS = [
  { key: 'temp', label: 'Temperatur',  color: '#f472b6' },
  { key: 'hum',  label: 'Luftfeuchte', color: '#38bdf8' },
  { key: 'dp',   label: 'Taupunkt',    color: '#a78bfa' },
]

function Pill({ active, color, onClick, children, dark }) {
  var bg0 = dark ? '#0d1526' : '#f8fafc'
  var bdr = dark ? '#1e2d45' : '#e2e8f0'
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 14px', borderRadius: 7, border: 'none',
        cursor: 'pointer', fontSize: 12, fontWeight: 600,
        background: active ? color + '20' : 'transparent',
        color:      active ? color : (dark ? '#4a5568' : '#94a3b8'),
        transition: 'color 0.12s, background 0.12s',
      }}
    >
      {children}
    </button>
  )
}

export default function FilterBar({ days, activeDay, activeMetric, onDay, onMetric, dark }) {
  var bg  = dark ? '#0d1526' : '#f8fafc'
  var bdr = dark ? '#1e2d45' : '#e2e8f0'
  var groupWrap = {
    display: 'flex', gap: 3,
    background: bg,
    border: '1px solid ' + bdr,
    borderRadius: 10, padding: 4,
  }

  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
      <div style={groupWrap}>
        <Pill active={activeDay === 'all'} color="#94a3b8" onClick={function() { onDay('all') }} dark={dark}>
          Alle Tage
        </Pill>
        {days.map(function(day, i) {
          return (
            <Pill key={day} active={activeDay === day} color={DAY_COLORS[i % DAY_COLORS.length]} onClick={function() { onDay(day) }} dark={dark}>
              {formatDay(day)}
            </Pill>
          )
        })}
      </div>
      <div style={groupWrap}>
        {METRICS.map(function(m) {
          return (
            <Pill key={m.key} active={activeMetric === m.key} color={m.color} onClick={function() { onMetric(m.key) }} dark={dark}>
              {m.label}
            </Pill>
          )
        })}
      </div>
    </div>
  )
}
