const BASE = import.meta.env.VITE_SUPABASE_URL
const KEY  = import.meta.env.VITE_SUPABASE_KEY

export async function fetchMeasurements(location) {
  const url = `${BASE}/rest/v1/measurements`
    + `?location=eq.${location}`
    + `&order=ts.desc`
    + `&limit=720`

  const res = await fetch(url, {
    headers: {
      apikey:        KEY,
      Authorization: `Bearer ${KEY}`,
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Supabase ${res.status}: ${text}`)
  }

  return res.json()
}
