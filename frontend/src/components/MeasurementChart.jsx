import {
  ComposedChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceArea,
} from 'recharts'
import { DAY_COLORS, formatDay, toF } from '../data/utils'

var METRIC_CFG = {
  temp: { key: 'temp', label: 'Temperatur',  color: '#f472b6', isTemp: true },
  hum:  { key: 'hum',  label: 'Luftfeuchte', color: '#38bdf8', isTemp: false, unit: '%' },
  dp:   { key: 'dp',   label: 'Taupunkt',    color: '#a78bfa', isTemp: true },
}

function buildFanAreas(data, xKey) {
  var areas = []
  var start = null
  for (var i = 0; i < data.length; i++) {
    var d = data[i]
    if (d.fan && start === null) { start = d[xKey] }
    else if (!d.fan && start !== null) { areas.push({ x1: start, x2: data[i-1][xKey] }); start = null }
  }
  if (start !== null) areas.push({ x1: start, x2: data[data.length-1][xKey] })
  return areas
}

export default function MeasurementChart({ allData, days, activeDay, activeMetric, dark, settings }) {
  var tempUnit = (settings && settings.tempUnit) || 'C'
  var m        = METRIC_CFG[activeMetric] || METRIC_CFG.temp
  var multi    = activeDay === 'all'
  var unitStr  = m.isTemp ? (tempUnit === 'F' ? ' °F' : ' °C') : m.unit

  // Wert konvertieren falls nötig
  function convert(v) {
    if (m.isTemp && tempUnit === 'F') return toF(v)
    return v
  }

  var bg   = dark ? '#0d1526' : '#f8fafc'
  var grid = dark ? '#151f35' : '#e2e8f0'
  var tick = { fill: dark ? '#374151' : '#94a3b8', fontSize: 11 }
  var bdr  = dark ? '#1e2d45' : '#e2e8f0'
  var lbl  = dark ? '#374151' : '#94a3b8'
  var ttBg = dark ? '#0b1120' : '#ffffff'
  var legStyle = { fontSize: 12, color: dark ? '#6b7280' : '#94a3b8', fontFamily: "'JetBrains Mono', monospace" }

  var chartData, lines, fanAreas

  if (multi) {
    var base = allData.filter(function(d) { return d.day === days[0] })
    chartData = base.map(function(row) {
      var entry = { label: row.label }
      days.forEach(function(day) {
        var match = allData.find(function(d) { return d.day === day && d.label === row.label })
        if (match) entry[day] = convert(match[m.key])
      })
      return entry
    })
    fanAreas = []
    days.forEach(function(day, di) {
      buildFanAreas(allData.filter(function(d) { return d.day === day }), 'label').forEach(function(a) {
        fanAreas.push({ x1: a.x1, x2: a.x2, color: DAY_COLORS[di % DAY_COLORS.length] })
      })
    })
    lines = days.map(function(day, i) {
      return <Line key={day} type="monotone" dataKey={day} name={formatDay(day)} stroke={DAY_COLORS[i % DAY_COLORS.length]} dot={false} strokeWidth={2} connectNulls />
    })
  } else {
    // Einzeltag: Daten konvertieren
    chartData = allData.filter(function(d) { return d.day === activeDay }).map(function(d) {
      var entry = Object.assign({}, d)
      if (m.isTemp && tempUnit === 'F') {
        entry.temp = toF(d.temp)
        entry.dp   = toF(d.dp)
      }
      return entry
    })
    fanAreas = buildFanAreas(chartData, 'label').map(function(a) { return { x1: a.x1, x2: a.x2, color: '#fb923c' } })
    lines = <Line type="monotone" dataKey={m.key} name={m.label} stroke={m.color} dot={false} strokeWidth={2.5} activeDot={{ r: 4, fill: m.color }} />
  }

  var xInterval = Math.max(0, Math.floor(chartData.length / 8) - 1)

  return (
    <div style={{ background: bg, border: '1px solid ' + bdr, borderRadius: 14, padding: '20px 18px 14px', marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: lbl }}>
          {m.label}{m.isTemp ? ' (' + unitStr.trim() + ')' : ''} &mdash; {multi ? 'Tagesvergleich' : formatDay(activeDay)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: lbl }}>
          <span style={{ display: 'inline-block', width: 12, height: 8, background: 'rgba(251,146,60,0.25)', border: '1px solid rgba(251,146,60,0.5)', borderRadius: 2 }} />
          <span>Lüfter AN</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData} margin={{ top: 4, right: 12, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={grid} />
          <XAxis dataKey="label" tick={tick} interval={xInterval} />
          <YAxis tick={tick} tickFormatter={function(v) { return v + unitStr }} width={56} />
          <Tooltip
            contentStyle={{ background: ttBg, border: '1px solid ' + bdr, borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: dark ? '#6b7280' : '#94a3b8', fontFamily: "'JetBrains Mono', monospace" }}
            itemStyle={{ color: dark ? '#e2e8f0' : '#1a202c' }}
            formatter={function(v, name) { return [v + unitStr, name] }}
          />
          <Legend wrapperStyle={legStyle} />
          {fanAreas.map(function(a, i) { return <ReferenceArea key={i} x1={a.x1} x2={a.x2} fill={a.color} fillOpacity={0.18} strokeOpacity={0} /> })}
          {lines}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
