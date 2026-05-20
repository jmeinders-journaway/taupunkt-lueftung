import { useState, useMemo } from 'react'
import { formatDay, fmtTemp, absoluteHumidity, feelsLike } from '../data/utils'

export default function DataTable({ data, days, dark, settings }) {
  var tempUnit = (settings && settings.tempUnit) || 'C'
  var pageSize = (settings && settings.pageSize) || 20

  var ALL_COLUMNS = [
    { key: 'ts',   label: 'Zeitstempel' },
    { key: 'temp', label: 'Temperatur' },
    { key: 'hum',  label: 'Feuchte (%)' },
    { key: 'dp',   label: 'Taupunkt' },
    { key: 'fl',   label: 'Gefühlt' },
    { key: 'ah',   label: 'Abs. Feuchte' },
    { key: 'fan',  label: 'Lüfter' },
  ]

  var _cols   = useState(['ts', 'temp', 'hum', 'dp', 'fl', 'ah', 'fan'])
  var cols    = _cols[0]; var setCols = _cols[1]

  var _day    = useState('all')
  var selDay  = _day[0]; var setDay  = _day[1]

  var _page   = useState(0)
  var page    = _page[0]; var setPage = _page[1]

  var _search = useState('')
  var search  = _search[0]; var setSearch = _search[1]

  var bg0  = dark ? '#0b1120' : '#ffffff'
  var bg1  = dark ? '#0d1526' : '#f8fafc'
  var bg2  = dark ? '#151f35' : '#f0f4f8'
  var bdr  = dark ? '#1e2d45' : '#e2e8f0'
  var txt0 = dark ? '#e2e8f0' : '#1a202c'
  var txt1 = dark ? '#6b7280' : '#718096'
  var txt2 = dark ? '#374151' : '#a0aec0'

  function toggleCol(key) {
    if (cols.indexOf(key) !== -1) {
      if (cols.length === 1) return
      setCols(cols.filter(function(c) { return c !== key }))
    } else {
      setCols(cols.concat([key]))
    }
    setPage(0)
  }

  var filtered = useMemo(function() {
    var d = selDay === 'all' ? data : data.filter(function(r) { return r.day === selDay })
    if (search.trim()) {
      var q = search.trim().toLowerCase()
      d = d.filter(function(r) {
        return r.ts.toLowerCase().indexOf(q) !== -1
          || String(r.temp).indexOf(q) !== -1
          || String(r.hum).indexOf(q) !== -1
          || String(r.dp).indexOf(q) !== -1
      })
    }
    return d
  }, [data, selDay, search])

  var totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  var pageData   = filtered.slice(page * pageSize, page * pageSize + pageSize)

  function renderCell(row, key) {
    if (key === 'fan') {
      return (
        <span style={{
          display: 'inline-block', padding: '1px 8px', borderRadius: 20,
          fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
          background: row.fan ? (dark ? '#2d1515' : '#fee2e2') : (dark ? '#0d2a1a' : '#dcfce7'),
          color: row.fan ? '#f87171' : '#4ade80',
        }}>
          {row.fan ? 'AN' : 'AUS'}
        </span>
      )
    }
    if (key === 'temp') return <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#f472b6' }}>{fmtTemp(row.temp, tempUnit)}</span>
    if (key === 'dp')   return <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#a78bfa' }}>{fmtTemp(row.dp, tempUnit)}</span>
    if (key === 'fl')   return <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#fb923c' }}>{fmtTemp(feelsLike(row.temp, row.hum), tempUnit)}</span>
    if (key === 'ah')   return <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#34d399' }}>{absoluteHumidity(row.temp, row.hum) + ' g/m³'}</span>
    return <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{row[key]}</span>
  }

  return (
    <div style={{ background: bg1, border: '1px solid ' + bdr, borderRadius: 14, padding: '18px 18px 14px', marginBottom: 18 }}>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: txt1, marginBottom: 14 }}>
        Datentabelle — {filtered.length} Einträge
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14, alignItems: 'flex-start' }}>
        {/* Spalten */}
        <div>
          <div style={{ fontSize: 10, color: txt2, marginBottom: 5, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Spalten (SELECT)</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {ALL_COLUMNS.map(function(c) {
              var active = cols.indexOf(c.key) !== -1
              return (
                <button key={c.key} onClick={function() { toggleCol(c.key) }} style={{
                  padding: '4px 10px', borderRadius: 6, border: '1px solid ' + bdr,
                  cursor: 'pointer', fontSize: 11, fontWeight: 600,
                  background: active ? (dark ? '#1e3a2a' : '#dcfce7') : bg0,
                  color: active ? '#4ade80' : txt1, transition: 'all 0.12s',
                }}>
                  {c.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tag */}
        <div>
          <div style={{ fontSize: 10, color: txt2, marginBottom: 5, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Tag (WHERE)</div>
          <select value={selDay} onChange={function(e) { setDay(e.target.value); setPage(0) }} style={{
            padding: '5px 10px', borderRadius: 7, border: '1px solid ' + bdr,
            background: bg0, color: txt0, fontSize: 12, cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace",
          }}>
            <option value="all">Alle Tage</option>
            {days.map(function(d) { return <option key={d} value={d}>{formatDay(d)} ({d})</option> })}
          </select>
        </div>

        {/* Suche */}
        <div>
          <div style={{ fontSize: 10, color: txt2, marginBottom: 5, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Suche</div>
          <input type="text" placeholder="z.B. 22.5 oder 14:30" value={search}
            onChange={function(e) { setSearch(e.target.value); setPage(0) }}
            style={{
              padding: '5px 10px', borderRadius: 7, border: '1px solid ' + bdr,
              background: bg0, color: txt0, fontSize: 12,
              fontFamily: "'JetBrains Mono', monospace", outline: 'none', width: 180,
            }}
          />
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, color: txt0 }}>
          <thead>
            <tr>
              {ALL_COLUMNS.filter(function(c) { return cols.indexOf(c.key) !== -1 }).map(function(c) {
                return (
                  <th key={c.key} style={{
                    padding: '7px 12px', background: bg2, borderBottom: '2px solid ' + bdr,
                    textAlign: 'left', fontWeight: 700, fontSize: 11, letterSpacing: '0.05em', color: txt1, whiteSpace: 'nowrap',
                  }}>
                    {c.label}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {pageData.map(function(row, i) {
              return (
                <tr key={row.id} style={{ background: i % 2 === 0 ? bg1 : bg0 }}>
                  {ALL_COLUMNS.filter(function(c) { return cols.indexOf(c.key) !== -1 }).map(function(c) {
                    return (
                      <td key={c.key} style={{ padding: '6px 12px', borderBottom: '1px solid ' + bdr, whiteSpace: 'nowrap', color: txt0 }}>
                        {renderCell(row, c.key)}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
        <span style={{ fontSize: 11, color: txt2, fontFamily: "'JetBrains Mono', monospace" }}>
          Seite {page + 1} / {totalPages} &nbsp;({filtered.length} Zeilen, {pageSize} pro Seite)
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { label: '«', fn: function() { setPage(0) },                              disabled: page === 0 },
            { label: '‹', fn: function() { setPage(Math.max(0, page - 1)) },          disabled: page === 0 },
            { label: '›', fn: function() { setPage(Math.min(totalPages-1, page+1)) }, disabled: page >= totalPages - 1 },
            { label: '»', fn: function() { setPage(totalPages - 1) },                 disabled: page >= totalPages - 1 },
          ].map(function(btn) {
            return (
              <button key={btn.label} onClick={btn.fn} disabled={btn.disabled} style={{
                padding: '4px 10px', borderRadius: 6, border: '1px solid ' + bdr,
                background: btn.disabled ? bg0 : bg2, color: btn.disabled ? txt2 : txt0,
                cursor: btn.disabled ? 'default' : 'pointer', fontSize: 13, fontWeight: 700,
              }}>
                {btn.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
