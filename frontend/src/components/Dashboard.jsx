import { useState, useMemo } from 'react'
import { useMeasurements } from '../hooks/useMeasurements'
import { calcStats, uniqueDays, fmtTemp, feelsLike, absoluteHumidity } from '../data/utils'
import { exportCSV } from '../data/exportCSV'
import StatCard from './StatCard'
import FanBadge from './FanBadge'
import FilterBar from './FilterBar'
import MeasurementChart from './MeasurementChart'
import CondensationChart from './CondensationChart'
import DataTable from './DataTable'
import FanTable from './FanTable'
import RecordCards from './RecordCards'
import HeatmapChart from './HeatmapChart'

export default function Dashboard({ location, dark, settings }) {
  var tempUnit = settings.tempUnit || 'C'
  var timezone = settings.timezone || 'Europe/Berlin'
  var pageSize = settings.pageSize || 20

  var result      = useMeasurements(location, timezone)
  var data        = result.data
  var loading     = result.loading
  var error       = result.error
  var lastRefresh = result.lastRefresh
  var refresh     = result.refresh

  var _day = useState('all'); var activeDay = _day[0]; var setActiveDay = _day[1]
  var _met = useState('temp'); var activeMetric = _met[0]; var setMetric = _met[1]

  var days     = useMemo(function() { return uniqueDays(data) }, [data])
  var filtered = useMemo(function() {
    return activeDay === 'all' ? data : data.filter(function(d) { return d.day === activeDay })
  }, [data, activeDay])
  var stats = useMemo(function() { return calcStats(filtered) }, [filtered])

  var txt1   = dark ? '#374151' : '#475569'
  var txt2   = dark ? '#1e2d45' : '#94a3b8'
  var errClr = dark ? '#f87171' : '#dc2626'
  var bdr    = dark ? '#1e2d45' : '#e2e8f0'
  var navBg  = dark ? '#0d1526' : '#f8fafc'

  if (loading) return (
    <div style={{ padding: '48px 0', color: txt1, fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
      Lade Messdaten...
    </div>
  )
  if (error) return (
    <div style={{ padding: '48px 0' }}>
      <div style={{ color: errClr, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, marginBottom: 8, fontWeight: 700 }}>Verbindungsfehler</div>
      <div style={{ color: txt1, fontSize: 12, marginBottom: 12 }}>{error}</div>
      <div style={{ color: txt2, fontSize: 11 }}>VITE_SUPABASE_URL und VITE_SUPABASE_KEY in frontend/.env.local prüfen</div>
    </div>
  )
  if (!data.length) return (
    <div style={{ padding: '48px 0', color: txt1, fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
      Keine Daten für "{location}" gefunden. Raspberry Pi noch nicht gestartet?
    </div>
  )

  var latest   = stats.latest
  var fl       = latest ? feelsLike(latest.temp, latest.hum) : null
  var ah       = latest ? absoluteHumidity(latest.temp, latest.hum) : null
  var secondsAgo = lastRefresh ? Math.round((new Date() - lastRefresh) / 1000) : null

  // Durchschnittswerte für gefühlte Temp und abs. Feuchte
  var flAvg = filtered.length ? +(filtered.reduce(function(s,d){return s+feelsLike(d.temp,d.hum)},0)/filtered.length).toFixed(1) : null
  var ahAvg = filtered.length ? +(filtered.reduce(function(s,d){return s+absoluteHumidity(d.temp,d.hum)},0)/filtered.length).toFixed(2) : null

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 24 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 20px', fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>
          <span style={{ color: txt2 }}>Letzter Messwert:</span>
          <span style={{ color: dark ? '#6b7280' : '#64748b' }}>{latest ? latest.ts : '\u2014'}</span>
          <span style={{ color: txt1 }}>T: <b style={{ color: '#f472b6' }}>{latest ? fmtTemp(latest.temp, tempUnit) : '\u2014'}</b></span>
          <span style={{ color: txt1 }}>H: <b style={{ color: '#38bdf8' }}>{latest ? latest.hum + ' %' : '\u2014'}</b></span>
          <span style={{ color: txt1 }}>TP: <b style={{ color: '#a78bfa' }}>{latest ? fmtTemp(latest.dp, tempUnit) : '\u2014'}</b></span>
          <span style={{ color: txt1 }}>Gefühlt: <b style={{ color: '#fb923c' }}>{fl !== null ? fmtTemp(fl, tempUnit) : '\u2014'}</b></span>
          <span style={{ color: txt1 }}>Abs. Feuchte: <b style={{ color: '#34d399' }}>{ah !== null ? ah + ' g/m³' : '\u2014'}</b></span>
          <span style={{ color: txt1 }}>Lüfter: <FanBadge on={latest ? latest.fan : null} /></span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {secondsAgo !== null && (
            <span style={{ fontSize: 11, color: txt2, fontFamily: "'JetBrains Mono', monospace" }}>
              aktualisiert vor {secondsAgo}s
            </span>
          )}
          <button onClick={refresh} style={{
            padding: '5px 12px', borderRadius: 7, border: '1px solid ' + bdr,
            background: navBg, color: dark ? '#94a3b8' : '#475569',
            cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <span>&#8635;</span><span>Aktualisieren</span>
          </button>
          <button onClick={function() {
            exportCSV(filtered, 'messdaten_' + location.toLowerCase() + '_' + (activeDay === 'all' ? 'gesamt' : activeDay) + '.csv')
          }} style={{
            padding: '5px 12px', borderRadius: 7, border: '1px solid ' + bdr,
            background: navBg, color: dark ? '#94a3b8' : '#475569',
            cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <span>&#8615;</span><span>CSV Export</span>
          </button>
        </div>
      </div>

      {/* Stat Cards — 6 Karten */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        <StatCard label="Ø Temperatur"      value={stats.tempAvg !== null ? fmtTemp(stats.tempAvg, tempUnit) : null}  color="#f472b6" sub="Gefilterter Zeitraum" dark={dark} />
        <StatCard label="Ø Luftfeuchte"     value={stats.humAvg  !== null ? stats.humAvg  + ' %'                : null}  color="#38bdf8" sub="Gefilterter Zeitraum" dark={dark} />
        <StatCard label="Ø Taupunkt"        value={stats.dpAvg   !== null ? fmtTemp(stats.dpAvg, tempUnit)   : null}  color="#a78bfa" sub="Gefilterter Zeitraum" dark={dark} />
        <StatCard label="Lüfter aktiv"      value={stats.fanPct  !== null ? stats.fanPct  + ' %'                : null}  color="#fb923c" sub="Kondensationsgefahr"  dark={dark} />
        <StatCard label="Ø Gefühlte Temp."  value={flAvg !== null ? fmtTemp(flAvg, tempUnit) : null}                    color="#f87171" sub="Heat Index (≥27°C)"   dark={dark} />
        <StatCard label="Ø Abs. Feuchte"    value={ahAvg !== null ? ahAvg + ' g/m³' : null}                             color="#34d399" sub="Wasserdampf in Luft"  dark={dark} />
      </div>

      {/* Filter */}
      <FilterBar days={days} activeDay={activeDay} activeMetric={activeMetric} onDay={setActiveDay} onMetric={setMetric} dark={dark} />

      {/* Rekorde */}
      <RecordCards data={filtered} dark={dark} settings={settings} />

      {/* Charts */}
      <MeasurementChart allData={data} days={days} activeDay={activeDay} activeMetric={activeMetric} dark={dark} settings={settings} />
      <CondensationChart allData={data} activeDay={activeDay} dark={dark} settings={settings} />

      {/* Heatmap */}
      {/*<HeatmapChart data={filtered} dark={dark} />*/}

      {/* Lüfter-Protokoll */}
      <FanTable data={filtered} dark={dark} />

      {/* Datentabelle */}
      <DataTable data={filtered} days={days} dark={dark} settings={settings} />
    </div>
  )
}
