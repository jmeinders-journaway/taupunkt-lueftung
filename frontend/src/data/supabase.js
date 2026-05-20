const BASE = import.meta.env.VITE_SUPABASE_URL
const KEY  = import.meta.env.VITE_SUPABASE_KEY

export async function fetchMeasurements(location, limit) {
  var url = BASE + '/rest/v1/measurements'
    + '?location=eq.' + location
    + '&order=ts.desc'
    + '&limit=' + (limit || 720)

  var res = await fetch(url, {
    headers: {
      apikey:        KEY,
      Authorization: 'Bearer ' + KEY,
    },
  })

  if (!res.ok) {
    var text = await res.text()
    throw new Error('Supabase ' + res.status + ': ' + text)
  }

  return res.json()
}
