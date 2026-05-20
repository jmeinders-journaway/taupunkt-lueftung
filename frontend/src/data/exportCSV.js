export function exportCSV(data, filename) {
  var header = 'Zeitstempel,Temperatur (C),Luftfeuchte (%),Taupunkt (C),Luefter\n'
  var rows = data.map(function(d) {
    return [d.ts, d.temp, d.hum, d.dp, d.fan ? 'AN' : 'AUS'].join(',')
  }).join('\n')
  var blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
  var url  = URL.createObjectURL(blob)
  var a    = document.createElement('a')
  a.href     = url
  a.download = filename || 'messdaten.csv'
  a.click()
  URL.revokeObjectURL(url)
}
