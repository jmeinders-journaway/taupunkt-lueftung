import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import CompareView from './components/CompareView'

var TIMEZONES = [
  { value: 'Europe/Berlin',    label: 'Berlin (MEZ)' },
  { value: 'Europe/London',    label: 'London (GMT)' },
  { value: 'America/New_York', label: 'New York (EST)' },
  { value: 'America/Chicago',  label: 'Chicago (CST)' },
  { value: 'America/Denver',   label: 'Denver (MST)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST)' },
  { value: 'Asia/Tokyo',       label: 'Tokio (JST)' },
  { value: 'UTC',              label: 'UTC' },
]

var PAGE_SIZES = [10, 20, 50, 100]

function Clock({ dark, timezone }) {
  var _t = useState('')
  var t = _t[0]; var setT = _t[1]
  useEffect(function() {
    function tick() {
      setT(new Date().toLocaleString('de-DE', { timeZone: timezone || 'Europe/Berlin' }))
    }
    tick()
    var id = setInterval(tick, 1000)
    return function() { clearInterval(id) }
  }, [timezone])
  return <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: dark ? '#1e2d45' : '#94a3b8' }}>{t}</span>
}

var PAGES = [
  { key: 'innen',   label: 'Innen',    icon: '\u{1F3E0}', location: 'Innen',  color: '#f472b6', bgDark: '#2d1520', bgLight: '#fdf2f8' },
  { key: 'aussen',  label: 'Außen',    icon: '\u{1F33F}',  location: 'Aussen', color: '#34d399', bgDark: '#0d2a1e', bgLight: '#f0fdf4' },
  { key: 'compare', label: 'Vergleich', icon: '\u21C4',    location: null,     color: '#fb923c', bgDark: '#2a1a0a', bgLight: '#fff7ed' },
]

export default function App() {
  var _page = useState('innen'); var page = _page[0]; var setPage = _page[1]
  var _dark = useState(true);    var dark = _dark[0]; var setDark = _dark[1]
  var _settingsOpen = useState(false); var settingsOpen = _settingsOpen[0]; var setSettingsOpen = _settingsOpen[1]

  // Globale Einstellungen
  var _tempUnit  = useState('C');               var tempUnit  = _tempUnit[0];  var setTempUnit  = _tempUnit[1]
  var _timezone  = useState('Europe/Berlin');   var timezone  = _timezone[0];  var setTimezone  = _timezone[1]
  var _pageSize  = useState(20);                var pageSize  = _pageSize[0];  var setPageSize  = _pageSize[1]

  var settings = { tempUnit: tempUnit, timezone: timezone, pageSize: pageSize }

  var current  = PAGES.find(function(p) { return p.key === page }) || PAGES[0]
  var navBg    = dark ? '#08101e' : '#ffffff'
  var navBdr   = dark ? '#0f1e30' : '#e2e8f0'
  var pageBg   = dark ? '#0b1120' : '#f1f5f9'
  var brand    = dark ? '#4a5568' : '#64748b'
  var tabBg    = dark ? '#0b1120' : '#f8fafc'
  var tabBdr   = dark ? '#0f1e30' : '#e2e8f0'
  var h1Color  = dark ? '#c4cdd9' : '#1e293b'
  var subColor = dark ? '#1e2d45' : '#94a3b8'
  var panelBg  = dark ? '#0d1526' : '#ffffff'
  var inputBg  = dark ? '#0b1120' : '#f8fafc'
  var txt0     = dark ? '#e2e8f0' : '#1a202c'
  var txt1     = dark ? '#6b7280' : '#718096'
  var txt2     = dark ? '#374151' : '#a0aec0'

  return (
    <div style={{ minHeight: '100vh', background: pageBg, transition: 'background 0.2s' }}>
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 32px', background: navBg, borderBottom: '1px solid ' + navBdr,
        position: 'sticky', top: 0, zIndex: 100, transition: 'background 0.2s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>&#127777;</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, fontSize: 15, color: brand }}>
            taupunkt-<span style={{ color: '#38bdf8' }}>lueftung</span>
          </span>
        </div>

        <div style={{ display: 'flex', gap: 3, background: tabBg, border: '1px solid ' + tabBdr, borderRadius: 10, padding: 4 }}>
          {PAGES.map(function(p) {
            var active = p.key === page
            return (
              <button key={p.key} onClick={function() { setPage(p.key) }} style={{
                padding: '6px 16px', borderRadius: 7, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600,
                background: active ? (dark ? p.bgDark : p.bgLight) : 'transparent',
                color:      active ? p.color : (dark ? '#374151' : '#94a3b8'),
                transition: 'color 0.15s, background 0.15s',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span>{p.icon}</span><span>{p.label}</span>
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Clock dark={dark} timezone={timezone} />

          {/* Dark Mode */}
          <button onClick={function() { setDark(!dark) }} style={{
            padding: '5px 10px', borderRadius: 8, border: '1px solid ' + navBdr,
            background: dark ? '#1e2d45' : '#e2e8f0', color: dark ? '#94a3b8' : '#475569',
            cursor: 'pointer', fontSize: 13, fontWeight: 700, transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <span>{dark ? '\u2600\uFE0F' : '\u{1F319}'}</span>
            <span style={{ fontSize: 11 }}>{dark ? 'Light' : 'Dark'}</span>
          </button>

          {/* Settings */}
          <button onClick={function() { setSettingsOpen(!settingsOpen) }} style={{
            padding: '5px 10px', borderRadius: 8, border: '1px solid ' + navBdr,
            background: settingsOpen ? (dark ? '#1e2d45' : '#e2e8f0') : 'transparent',
            color: dark ? '#94a3b8' : '#475569',
            cursor: 'pointer', fontSize: 15, transition: 'all 0.15s',
          }}>
            &#9881;
          </button>
        </div>
      </nav>

      {/* Settings Panel */}
      {settingsOpen && (
        <div style={{
          position: 'fixed', top: 58, right: 20, zIndex: 200,
          background: panelBg, border: '1px solid ' + navBdr,
          borderRadius: 14, padding: '20px 22px', minWidth: 280,
          boxShadow: dark ? '0 8px 40px rgba(0,0,0,0.6)' : '0 8px 40px rgba(0,0,0,0.15)',
        }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: txt0, marginBottom: 16 }}>Einstellungen</div>

          {/* Temperatureinheit */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: txt2, marginBottom: 6 }}>
              Temperatureinheit
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['C', 'F'].map(function(u) {
                return (
                  <button key={u} onClick={function() { setTempUnit(u) }} style={{
                    padding: '5px 16px', borderRadius: 7, border: '1px solid ' + navBdr,
                    cursor: 'pointer', fontSize: 13, fontWeight: 700,
                    background: tempUnit === u ? (dark ? '#1e2d45' : '#e2e8f0') : inputBg,
                    color: tempUnit === u ? (dark ? '#38bdf8' : '#0ea5e9') : txt1,
                  }}>
                    °{u}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Zeitzone */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: txt2, marginBottom: 6 }}>
              Zeitzone
            </div>
            <select value={timezone} onChange={function(e) { setTimezone(e.target.value) }} style={{
              width: '100%', padding: '6px 10px', borderRadius: 7, border: '1px solid ' + navBdr,
              background: inputBg, color: txt0, fontSize: 12, cursor: 'pointer',
              fontFamily: "'Inter', system-ui, sans-serif",
            }}>
              {TIMEZONES.map(function(tz) {
                return <option key={tz.value} value={tz.value}>{tz.label}</option>
              })}
            </select>
          </div>

          {/* Einträge pro Seite */}
          <div style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: txt2, marginBottom: 6 }}>
              Einträge pro Seite
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {PAGE_SIZES.map(function(s) {
                return (
                  <button key={s} onClick={function() { setPageSize(s) }} style={{
                    padding: '5px 12px', borderRadius: 7, border: '1px solid ' + navBdr,
                    cursor: 'pointer', fontSize: 12, fontWeight: 700,
                    background: pageSize === s ? (dark ? '#1e2d45' : '#e2e8f0') : inputBg,
                    color: pageSize === s ? (dark ? '#38bdf8' : '#0ea5e9') : txt1,
                  }}>
                    {s}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close settings */}
      {settingsOpen && (
        <div onClick={function() { setSettingsOpen(false) }} style={{
          position: 'fixed', inset: 0, zIndex: 150,
        }} />
      )}

      <main style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <span style={{ fontSize: 26 }}>{current.icon}</span>
            <h1 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 800, color: h1Color }}>
              {page === 'innen'   ? 'Innenraum-Messung' :
               page === 'aussen'  ? 'Außenbereich-Messung' :
               'Innen vs. Außen \u2014 Vergleich'}
            </h1>
          </div>
          <div style={{ fontSize: 12, color: subColor }}>
            {page === 'compare'
              ? 'Beide Standorte im direkten Vergleich'
              : 'Live-Daten aus Supabase \u00b7 Standort: ' + current.location}
          </div>
        </div>

        {page === 'compare'
          ? <CompareView dark={dark} settings={settings} />
          : <Dashboard key={page} location={current.location} dark={dark} settings={settings} />
        }
      </main>
    </div>
  )
}
