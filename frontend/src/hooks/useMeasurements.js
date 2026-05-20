import { useState, useEffect, useCallback } from 'react'
import { fetchMeasurements } from '../data/supabase'
import { transformRows } from '../data/utils'

export function useMeasurements(location, timezone) {
  var _data    = useState([])
  var data     = _data[0]; var setData = _data[1]

  var _loading = useState(true)
  var loading    = _loading[0]; var setLoading = _loading[1]

  var _error   = useState(null)
  var error    = _error[0]; var setError = _error[1]

  var _lastRefresh = useState(null)
  var lastRefresh    = _lastRefresh[0]; var setLastRefresh = _lastRefresh[1]

  var load = useCallback(function() {
    setError(null)
    fetchMeasurements(location)
      .then(function(rows) {
        setData(transformRows(rows, timezone))
        setLoading(false)
        setLastRefresh(new Date())
      })
      .catch(function(err) {
        setError(err.message)
        setLoading(false)
      })
  }, [location, timezone])

  // Initial load + reload wenn location oder timezone sich ändert
  useEffect(function() {
    setLoading(true)
    load()
  }, [load])

  // Auto-Refresh alle 30 Sekunden
  useEffect(function() {
    var id = setInterval(load, 30000)
    return function() { clearInterval(id) }
  }, [load])

  return { data: data, loading: loading, error: error, lastRefresh: lastRefresh, refresh: load }
}
