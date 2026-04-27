import { useState, useEffect } from 'react'
import { fetchMeasurements } from '../data/supabase'
import { transformRows } from '../data/utils'

export function useMeasurements(location) {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(function() {
    var cancelled = false
    setLoading(true)
    setError(null)

    fetchMeasurements(location)
      .then(function(rows) {
        if (!cancelled) {
          setData(transformRows(rows))
          setLoading(false)
        }
      })
      .catch(function(err) {
        if (!cancelled) {
          setError(err.message)
          setLoading(false)
        }
      })

    return function() { cancelled = true }
  }, [location])

  return { data, loading, error }
}
