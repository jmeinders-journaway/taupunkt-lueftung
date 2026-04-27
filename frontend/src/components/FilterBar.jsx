import { DAY_COLORS, formatDay } from '../data/utils'

const METRICS = [
  { key: 'temp', label: 'Temperatur',  color: '#f472b6' },
  { key: 'hum',  label: 'Luftfeuchte', color: '#38bdf8' },
  { key: 'dp',   label: 'Taupunkt',    color: '#a78bfa' },
]

function Pill({ active, color, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 14px',
        borderRadius: 7,
        border: 'none',
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '0.01em',
        background: active ? color + '20' : 'transparent',
        color:      active ? color         : '#4a5568',
        transition: 'color 0.12s, background 0.12s',
      }}
    >
      {children}
    </button>
  )
}

const groupWrap = {
  display: 'flex',
  gap: 3,
  background: '#0d1526',
  border: '1px solid #1e2d45',
  borderRadius: 10,
  padding: 4,
}

export default function FilterBar({ days, activeDay, activeMetric, onDay, onMetric }) {
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
      <div style={groupWrap}>
        <Pill active={activeDay === 'all'} color="#94a3b8" onClick={function() { onDay('all') }}>
          Alle Tage
        </Pill>
        {days.map(function(day, i) {
          return (
            <Pill
              key={day}
              active={activeDay === day}
              color={DAY_COLORS[i % DAY_COLORS.length]}
              onClick={function() { onDay(day) }}
            >
              {formatDay(day)}
            </Pill>
          )
        })}
      </div>
      <div style={groupWrap}>
        {METRICS.map(function(m) {
          return (
            <Pill
              key={m.key}
              active={activeMetric === m.key}
              color={m.color}
              onClick={function() { onMetric(m.key) }}
            >
              {m.label}
            </Pill>
          )
        })}
      </div>
    </div>
  )
}
