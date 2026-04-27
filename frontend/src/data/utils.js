export const DAY_COLORS = [
  '#38bdf8',
  '#818cf8',
  '#34d399',
  '#f472b6',
  '#fb923c',
  '#a78bfa',
]

export function formatDay(dateStr) {
  const [, m, d] = dateStr.split('-')
  const names = ['Jan','Feb','Mrz','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez']
  return `${d}. ${names[parseInt(m, 10) - 1]}`
}

export function transformRows(rows) {
  return rows.map(function(r) {
    const ts = r.ts.replace('T', ' ').slice(0, 16)
    return {
      id:       r.id,
      ts:       ts,
      day:      r.ts.slice(0, 10),
      label:    r.ts.slice(11, 16),
      temp:     r.temp_c,
      hum:      r.hum_percent,
      dp:       r.dewpoint_c,
      fan:      r.fan_on ? 1 : 0,
    }
  })
}

export function uniqueDays(data) {
  var seen = {}
  var days = []
  for (var i = 0; i < data.length; i++) {
    if (!seen[data[i].day]) {
      seen[data[i].day] = true
      days.push(data[i].day)
    }
  }
  return days.sort()
}

export function calcStats(data) {
  var empty = { tempAvg: null, humAvg: null, dpAvg: null, fanPct: null, latest: null }
  if (!data || !data.length) return empty
  var n = data.length
  var tSum = 0, hSum = 0, dSum = 0, fanN = 0
  for (var i = 0; i < n; i++) {
    tSum += data[i].temp
    hSum += data[i].hum
    dSum += data[i].dp
    if (data[i].fan) fanN++
  }
  return {
    tempAvg: +(tSum / n).toFixed(1),
    humAvg:  +(hSum / n).toFixed(1),
    dpAvg:   +(dSum / n).toFixed(1),
    fanPct:  Math.round(fanN / n * 100),
    latest:  data[0],
  }
}
