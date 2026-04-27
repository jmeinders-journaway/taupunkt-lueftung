import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'

function Clock() {
  const [t, setT] = useState('')
  useEffect(function() {
    var id = setInterval(function() {
      setT(new Date().toLocaleString('de-DE'))
    }, 1000)
    setT(new Date().toLocaleString('de-DE'))
    return function() { clearInterval(id) }
  }, [])
  return (
    <span style={{
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 11,
      color: '#1e2d45',
    }}>
      {t}
    </span>
  )
}

const PAGES = [
  { key: 'innen',  label: 'Innen',  icon: '\u{1F3E0}', location: 'Innen',  color: '#f472b6', bg: '#2d1520' },
  { key: 'aussen', label: 'Aussen', icon: '\u{1F33F}', location: 'Aussen', color: '#34d399', bg: '#0d2a1e' },
]

export default function App() {
  const [page, setPage] = useState('innen')
  const current = PAGES.find(function(p) { return p.key === page }) || PAGES[0]

  return (
    <div style={{ minHeight: '100vh', background: '#0b1120' }}>

      {/* Navbar */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 32px',
        background: '#08101e',
        borderBottom: '1px solid #0f1e30',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>&#127777;</span>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 800,
            fontSize: 15,
            color: '#4a5568',
            letterSpacing: '-0.02em',
          }}>
            taupunkt-<span style={{ color: '#38bdf8' }}>lueftung</span>
          </span>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex',
          gap: 3,
          background: '#0b1120',
          border: '1px solid #0f1e30',
          borderRadius: 10,
          padding: 4,
        }}>
          {PAGES.map(function(p) {
            var active = p.key === page
            return (
              <button
                key={p.key}
                onClick={function() { setPage(p.key) }}
                style={{
                  padding: '6px 18px',
                  borderRadius: 7,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  background: active ? p.bg    : 'transparent',
                  color:      active ? p.color : '#374151',
                  transition: 'color 0.15s, background 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>{p.icon}</span>
                <span>{p.label}</span>
              </button>
            )
          })}
        </div>

        <Clock />
      </nav>

      {/* Page */}
      <main style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }}>

        {/* Page header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <span style={{ fontSize: 26 }}>{current.icon}</span>
            <h1 style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 20,
              fontWeight: 800,
              color: '#c4cdd9',
              letterSpacing: '-0.03em',
            }}>
              {current.key === 'innen' ? 'Innenraum-Messung' : 'Aussenbereich-Messung'}
            </h1>
          </div>
          <div style={{ fontSize: 12, color: '#1e2d45' }}>
            Live-Daten aus Supabase &middot; Standort: {current.location}
          </div>
        </div>

        <Dashboard key={page} location={current.location} />
      </main>
    </div>
  )
}
