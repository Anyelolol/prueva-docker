import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDocumentos } from '../hooks/useDocumentos'
import styles from './Documentos.module.css'

export default function Documentos() {
  const { docs, loading, error, subir, eliminar } = useDocumentos()
  const [uploading, setUploading] = useState(false)
  const [uploadErr, setUploadErr] = useState('')
  const fileRef = useRef()

  const onFile = async e => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    setUploadErr('')
    try {
      await subir(file)
    } catch (e) {
      setUploadErr(e.response?.data?.error || 'Error al subir')
    } finally {
      setUploading(false)
      fileRef.current.value = ''
    }
  }

  const onEliminar = async (did, nombre) => {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return
    await eliminar(did)
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Documentos</h1>
        <div className={styles.uploadZone}>
          <input ref={fileRef} type="file" accept=".pdf,.txt,.docx" onChange={onFile} style={{ display: 'none' }} id="file-input" />
          <label htmlFor="file-input">
            <button className="btn-primary" onClick={() => fileRef.current.click()} disabled={uploading}>
              {uploading ? <span className="spinner" /> : '+ Subir documento'}
            </button>
          </label>
          {uploadErr && <span className="error-msg">{uploadErr}</span>}
        </div>
      </div>

      {loading && <span className="spinner" />}
      {error && <p className="error-msg">{error}</p>}

      {!loading && docs.length === 0 && (
        <p style={{ color: 'var(--text-muted)', marginTop: 40, textAlign: 'center' }}>No hay documentos aún. Sube uno para comenzar.</p>
      )}

      {docs.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden', marginTop: 16 }}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d, i) => (
                <tr key={d.did}>
                  <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                  <td>{d.nombre_archivo}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{d.tipo_documento}</td>
                  <td>
                    <span className={`badge badge-${d.estado === 'completado' ? 'success' : d.estado === 'error' ? 'danger' : d.estado === 'procesando' ? 'warning' : 'info'}`}>
                      {d.estado}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(d.fecha_subida).toLocaleDateString()}</td>
                  <td>
                    <div className={styles.actions}>
                      <Link to={`/analizar?did=${d.did}`}>
                        <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }}>Analizar</button>
                      </Link>
                      <button className="btn-danger" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => onEliminar(d.did, d.nombre_archivo)}>✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
