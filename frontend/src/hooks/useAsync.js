import { useState, useCallback } from 'react'

export function useAsync(fn) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const run = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const result = await fn(...args)
      setData(result)
      return result
    } catch (e) {
      const msg = e.response?.data?.error || e.message || 'Error desconocido'
      setError(msg)
      throw e
    } finally {
      setLoading(false)
    }
  }, [fn])

  return { data, error, loading, run }
}
