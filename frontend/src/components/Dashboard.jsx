import { useState, useMemo } from 'react'
import { useMeasurements } from '../hooks/useMeasurements'
import { calcStats, uniqueDays } from '../data/utils'
import StatCard from './StatCard'
import FanBadge from './FanBadge'
import FilterBar from './FilterBar'
import MeasurementChart from './MeasurementChart'
import CondensationChart from './CondensationChart'

export default function Dashboard({ location }) {
  const { data, loading, error } = useMeasurements(location)
  const [activeDay,    setActiveDay]    = useState('all')
  const [activeMetric, setActiveMetric] = useState('temp')

  const days = useMemo(function() { return uniqueDays(data) }, [data])

  const filtered = useMemo(function() {
    return activeDay === 'all'
      ? data
      : data.filter(function(d) { return d.day === activeDay })
  }, [data, activeDay])

  const stats = useMemo(function() { return calcStats(filtered) }, [filtered])

  if (loading) {
    return (
      <div style={{ padding: '48px 0', color: '#374151', fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
        Lade Messdaten...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '48px 0' }}>
        <div style={{ color: '#f87171', fontFamily: "'JetBrains Mono', monospace", fontSize: 13, marginBottom: 8, fontWeight: 700 }}>
          Verbindungsfehler
        </div>
        <div style={{ color: '#374151', fontSize: 12, marginBottom: 12 }}>{error}</div>
        <div style={{ color: '#1e2d45', fontSize: 11 }}>
          VITE_SUPABASE_URL und VITE_SUPABASE_KEY in frontend/.env.local prüfen
        </div>
      </div>
    )
  }

  if (!data.length) {
    return (
      <div style={{ padding: '48px 0', color: '#374151', fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
        Keine Daten für Standort "{location}" gefunden.
        Raspberry Pi noch nicht gestartet?
      </div>
    )
  }

  const latest = stats.latest

  return (
    <div>
      {/* Letzter Messwert */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px 20px',
        marginBottom: 24,
        fontSize: 13,
        color: '#4a5568',
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        <span style={{ color: '#1e2d45' }}>Letzter Messwert:</span>
        <span style={{ color: '#6b7280' }}>{latest ? latest.ts : '—'}</span>
        <span>T: <b style={{ color: '#f472b6' }}>{latest ? latest.temp + ' \u00b0C' : '—'}</b></span>
        <span>H: <b style={{ color: '#38bdf8' }}>{latest ? latest.hum + ' %' : '—'}</b></span>
        <span>TP: <b style={{ color: '#a78bfa' }}>{latest ? latest.dp + ' \u00b0C' : '—'}</b></span>
        <span>Lüfter: <FanBadge on={latest ? latest.fan : null} /></span>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        <StatCard
          label="Durchschn. Temperatur"
          value={stats.tempAvg !== null ? stats.tempAvg + ' \u00b0C' : null}
          color="#f472b6"
          sub="Gefilterter Zeitraum"
        />
        <StatCard
          label="Durchschn. Feuchte"
          value={stats.humAvg !== null ? stats.humAvg + ' %' : null}
          color="#38bdf8"
          sub="Gefilterter Zeitraum"
        />
        <StatCard
          label="Durchschn. Taupunkt"
          value={stats.dpAvg !== null ? stats.dpAvg + ' \u00b0C' : null}
          color="#a78bfa"
          sub="Gefilterter Zeitraum"
        />
        <StatCard
          label="Lüfter aktiv"
          value={stats.fanPct !== null ? stats.fanPct + ' %' : null}
          color="#fb923c"
          sub="Kondensationsgefahr"
        />
      </div>

      {/* Filter */}
      <FilterBar
        days={days}
        activeDay={activeDay}
        activeMetric={activeMetric}
        onDay={setActiveDay}
        onMetric={setActiveMetric}
      />

      {/* Charts */}
      <MeasurementChart
        allData={data}
        days={days}
        activeDay={activeDay}
        activeMetric={activeMetric}
      />
      <CondensationChart
        allData={data}
        activeDay={activeDay}
      />
    </div>
  )
}
