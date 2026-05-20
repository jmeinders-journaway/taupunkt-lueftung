import {
  ComposedChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceArea,
} from 'recharts'
import { formatDay, toF } from '../data/utils'

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

export default function CondensationChart({ allData, activeDay, dark, settings }) {
  var tempUnit = (settings && settings.tempUnit) || 'C'
  var unitStr  = tempUnit === 'F' ? ' °F' : ' °C'

  var raw = activeDay === 'all'
    ? allData.filter(function(_, i) { return i % 2 === 0 })
    : allData.filter(function(d) { return d.day === activeDay })

  // Konvertieren wenn Fahrenheit
  var filtered = tempUnit === 'F' ? raw.map(function(d) {
    return Object.assign({}, d, { temp: toF(d.temp), dp: toF(d.dp) })
  }) : raw

  var xKey = activeDay === 'all' ? 'ts' : 'label'
  var fanAreas = buildFanAreas(filtered, xKey)
  var xInterval = Math.max(0, Math.floor(filtered.length / 8) - 1)

  var bg   = dark ? '#0d1526' : '#f8fafc'
  var grid = dark ? '#151f35' : '#e2e8f0'
  var tick = { fill: dark ? '#374151' : '#94a3b8', fontSize: 11 }
  var bdr  = dark ? '#1e2d45' : '#e2e8f0'
  var lbl  = dark ? '#374151' : '#94a3b8'
  var ttBg = dark ? '#0b1120' : '#ffffff'
  var legStyle = { fontSize: 12, color: dark ? '#6b7280' : '#94a3b8', fontFamily: "'JetBrains Mono', monospace" }

  return (
    <div style={{ background: bg, border: '1px solid ' + bdr, borderRadius: 14, padding: '20px 18px 14px', marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: lbl }}>
          {'Kondensationsrisiko \u2014 ' + (activeDay === 'all' ? 'Alle Tage' : formatDay(activeDay)) + ' (' + unitStr.trim() + ')'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: lbl }}>
          <span style={{ display: 'inline-block', width: 12, height: 8, background: 'rgba(251,146,60,0.25)', border: '1px solid rgba(251,146,60,0.5)', borderRadius: 2 }} />
          <span>Lüfter AN</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={230}>
        <ComposedChart data={filtered} margin={{ top: 4, right: 12, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={grid} />
          <XAxis dataKey={xKey} tick={tick} interval={xInterval} tickFormatter={function(v) { return v.slice(-5) }} />
          <YAxis tick={tick} tickFormatter={function(v) { return v + unitStr }} width={56} />
          <Tooltip
            contentStyle={{ background: ttBg, border: '1px solid ' + bdr, borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: dark ? '#6b7280' : '#94a3b8', fontFamily: "'JetBrains Mono', monospace" }}
            itemStyle={{ color: dark ? '#e2e8f0' : '#1a202c' }}
            formatter={function(v, name) { return [v + unitStr, name] }}
          />
          <Legend wrapperStyle={legStyle} />
          {fanAreas.map(function(a, i) { return <ReferenceArea key={i} x1={a.x1} x2={a.x2} fill="#fb923c" fillOpacity={0.18} strokeOpacity={0} /> })}
          <Line type="monotone" dataKey="temp" name="Temperatur" stroke="#f472b6" dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="dp"   name="Taupunkt"   stroke="#a78bfa" dot={false} strokeWidth={2} strokeDasharray="6 3" />
        </ComposedChart>
      </ResponsiveContainer>
      <div style={{ fontSize: 11, color: lbl, marginTop: 10, paddingLeft: 2 }}>
        Lüfter schaltet ein wenn Abstand &lt; {tempUnit === 'F' ? '5.4 °F' : '3 °C'} (Linien nähern sich an)
      </div>
    </div>
  )
}
