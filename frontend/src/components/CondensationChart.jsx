import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea,
} from 'recharts'
import { formatDay } from '../data/utils'

const AXIS_TICK  = { fill: '#374151', fontSize: 11 }
const GRID_COLOR = '#151f35'
const LEGEND_STYLE = {
  fontSize: 12,
  color: '#6b7280',
  fontFamily: "'JetBrains Mono', monospace",
}

function buildFanAreas(data, xKey) {
  var areas = []
  var start = null
  for (var i = 0; i < data.length; i++) {
    var d = data[i]
    if (d.fan && start === null) {
      start = d[xKey]
    } else if (!d.fan && start !== null) {
      areas.push({ x1: start, x2: data[i - 1][xKey] })
      start = null
    }
  }
  if (start !== null) {
    areas.push({ x1: start, x2: data[data.length - 1][xKey] })
  }
  return areas
}

export default function CondensationChart({ allData, activeDay }) {
  const filtered = activeDay === 'all'
    ? allData.filter(function(_, i) { return i % 2 === 0 })
    : allData.filter(function(d) { return d.day === activeDay })

  const title = 'Kondensationsrisiko \u2014 '
    + (activeDay === 'all' ? 'Alle Tage' : formatDay(activeDay))

  const xKey = activeDay === 'all' ? 'ts' : 'label'

  const fanAreas = buildFanAreas(filtered, xKey)

  const interval = filtered.length > 50 ? Math.floor(filtered.length / 10) : (activeDay === 'all' ? 11 : 3)

  return (
    <div style={{
      background: '#0d1526',
      border: '1px solid #1e2d45',
      borderRadius: 14,
      padding: '20px 18px 14px',
      marginBottom: 18,
    }}>
      <div style={{
        fontSize: 10, fontWeight: 600, letterSpacing: '0.12em',
        textTransform: 'uppercase', color: '#374151', marginBottom: 14,
      }}>
        {title}
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={filtered} margin={{ top: 4, right: 12, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
          <XAxis
            dataKey={xKey}
            tick={AXIS_TICK}
            interval={interval}
            tickFormatter={function(v) { return v.slice(-5) }}
          />
          <YAxis
            tick={AXIS_TICK}
            tickFormatter={function(v) { return v + '\u00b0C' }}
            width={52}
          />
          <Tooltip
            contentStyle={{ background: '#0b1120', border: '1px solid #1e2d45', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#6b7280', fontFamily: "'JetBrains Mono', monospace" }}
            itemStyle={{ color: '#e2e8f0' }}
            formatter={function(v, name) { return [v + '\u00b0C', name] }}
          />
          <Legend wrapperStyle={LEGEND_STYLE} />
          {fanAreas.map(function(a, i) {
            return (
                <ReferenceArea
                    key={i}
                    x1={a.x1}
                    x2={a.x2}
                    fill="#fb923c"
                    fillOpacity={0.18}
                    strokeOpacity={0}
                />
            )
          })}
          <Line
            type="monotone"
            dataKey="temp"
            name="Temperatur"
            stroke="#f472b6"
            dot={false}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="dp"
            name="Taupunkt"
            stroke="#a78bfa"
            dot={false}
            strokeWidth={2}
            strokeDasharray="6 3"
          />
        </LineChart>
      </ResponsiveContainer>
      <div style={{
        fontSize: 11,
        color: '#374151',
        marginTop: 10,
        paddingLeft: 2,
      }}>
        Lüfter schaltet ein wenn Abstand &lt; 3 C (Linien nähern sich an)
      </div>
    </div>
  )
}
