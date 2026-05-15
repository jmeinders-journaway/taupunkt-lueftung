import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea,
} from 'recharts'
import { DAY_COLORS, formatDay } from '../data/utils'

const METRIC_CFG = {
  temp: { key: 'temp', label: 'Temperatur',  color: '#f472b6', unit: '\u00b0C' },
  hum:  { key: 'hum',  label: 'Luftfeuchte', color: '#38bdf8', unit: '%'       },
  dp:   { key: 'dp',   label: 'Taupunkt',    color: '#a78bfa', unit: '\u00b0C' },
}

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

export default function MeasurementChart({ allData, days, activeDay, activeMetric }) {
  const m     = METRIC_CFG[activeMetric] || METRIC_CFG.temp
  const multi = activeDay === 'all'

  let chartData, lines, fanAreas

  if (multi) {
    var base = allData.filter(function(d) { return d.day === days[0] })
    chartData = base.map(function(row) {
      var entry = { label: row.label }
      days.forEach(function(day) {
        var match = allData.find(function(d) { return d.day === day && d.label === row.label })
        if (match) entry[day] = match[m.key]
      })
      return entry
    })
    fanAreas = []
    days.forEach(function(day, di) {
      var dayData = allData.filter(function(d) { return d.day === day })
      buildFanAreas(dayData, 'label').forEach(function(a) {
        fanAreas.push({
          x1: a.x1, x2: a.x2,
          color: DAY_COLORS[di % DAY_COLORS.length],
        })
      })
    })
    lines = days.map(function(day, i) {
      return (
        <Line
          key={day}
          type="monotone"
          dataKey={day}
          name={formatDay(day)}
          stroke={DAY_COLORS[i % DAY_COLORS.length]}
          dot={false}
          strokeWidth={2}
          connectNulls
        />
      )
    })
  } else {
    chartData = allData.filter(function(d) { return d.day === activeDay })
    fanAreas = buildFanAreas(chartData, 'label')
    lines = (
      <Line
        type="monotone"
        dataKey={m.key}
        name={m.label}
        stroke={m.color}
        dot={false}
        strokeWidth={2.5}
        activeDot={{ r: 4, fill: m.color }}
      />
    )
  }

  const title = m.label + ' \u2014 ' + (multi ? 'Tagesvergleich' : formatDay(activeDay))

  const interval = chartData.length > 50 ? Math.floor(chartData.length / 10) : (multi ? 5 : 3)

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
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 4, right: 12, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
          <XAxis dataKey="label" tick={AXIS_TICK} interval={interval} />
          <YAxis
            tick={AXIS_TICK}
            tickFormatter={function(v) { return v + m.unit }}
            width={52}
          />
          <Tooltip
            contentStyle={{ background: '#0b1120', border: '1px solid #1e2d45', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#6b7280', fontFamily: "'JetBrains Mono', monospace" }}
            itemStyle={{ color: '#e2e8f0' }}
            formatter={function(v, name) { return [v + m.unit, name] }}
          />
          <Legend wrapperStyle={LEGEND_STYLE} />
          {fanAreas.map(function(a, i) {
            return (
              <ReferenceArea
                key={i}
                x1={a.x1}
                x2={a.x2}
                fill={a.color || "#fb923c"}
                fillOpacity={0.18}
                strokeOpacity={0}
              />
            )
          })}
          {lines}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
