import { useState, useEffect, useCallback } from 'react'
import { plagiarismService } from '../services/plagiarismService'

export function useHistorial() {
  const [historial, setHistorial] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cargar = useCallback(() => {
    setLoading(true)
    plagiarismService.historial()
      .then(setHistorial)
      .catch(e => setError(e.response?.data?.error || e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { cargar() }, [cargar])

  return { historial, loading, error, cargar }
}
