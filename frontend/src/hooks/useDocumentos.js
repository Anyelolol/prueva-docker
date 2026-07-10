import { useState, useEffect, useCallback } from 'react'
import { documentoService } from '../services/documentoService'

export function useDocumentos() {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cargar = useCallback(() => {
    setLoading(true)
    documentoService.listar()
      .then(setDocs)
      .catch(e => setError(e.response?.data?.error || e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const subir = async (archivo) => {
    const doc = await documentoService.subir(archivo)
    setDocs(prev => [doc, ...prev])
    return doc
  }

  const eliminar = async (did) => {
    await documentoService.eliminar(did)
    setDocs(prev => prev.filter(d => d.did !== did))
  }

  return { docs, loading, error, cargar, subir, eliminar }
}
