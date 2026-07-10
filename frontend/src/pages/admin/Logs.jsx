import { useState, useCallback } from 'react'
import { adminService } from '../../services/adminService'
import styles from './Admin.module.css'

const NIVELES = ['', 'INFO', 'WARNING', 'ERROR']
const MODULOS = ['', 'auth', 'documentos', 'plagio', 'usuarios']

export default function Logs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [filtros, setFiltros] = useState({ nivel: '', modulo: '', limit: 100 })
  const [error, setError] = useState('')

  const cargar = useCallback(() => {
    setLoading(true)
    const params = {}
    if (filtros.nivel) params.nivel = filtros.nivel
    if (filtros.modulo) params.modulo = filtros.modulo
    params.limit = filtros.limit
    adminService.logs(params)
      .then(setLogs)
      .catch(e => setError(e.response?.data?.error || 'Error'))
      .finally(() => setLoading(false))
  }, [filtros])

  const onChange = e => setFiltros(p => ({ ...p, [e.target.name]: e.target.value }))

  return (
    <div>
      <h1 className={styles.title}>Logs del sistema</h1>

      <div className={styles.filterBar}>
        <select name="nivel" value={filtros.nivel} onChange={onChange} style={{ width: 140 }}>
          {NIVELES.map(n => <option key={n} value={n}>{n || 'Todos los niveles'}</option>)}
        </select>
        <select name="modulo" value={filtros.modulo} onChange={onChange} style={{ width: 140 }}>
          {MODULOS.map(m => <option key={m} value={m}>{m || 'Todos los módulos'}</option>)}
        </select>
        <select name="limit" value={filtros.limit} onChange={onChange} style={{ width: 100 }}>
          {[50, 100, 200].map(l => <option key={l} value={l}>{l} entradas</option>)}
        </select>
        <button className="btn-primary" onClick={cargar} disabled={loading}>
          {loading ? <span className="spinner" /> : 'Cargar'}
        </button>
      </div>

      {error && <p className="error-msg">{error}</p>}

      {logs.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden', marginTop: 16 }}>
          <table>
            <thead>
              <tr><th>Fecha</th><th>Módulo</th><th>Nivel</th><th>Mensaje</th><th>Usuario</th></tr>
            </thead>
            <tbody>
              {logs.map((l, i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>{new Date(l.creado_en).toLocaleString()}</td>
                  <td style={{ fontSize: 12 }}>{l.modulo}</td>
                  <td>
                    <span className={`badge badge-${l.nivel === 'ERROR' ? 'danger' : l.nivel === 'WARNING' ? 'warning' : 'success'}`}>
                      {l.nivel}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.mensaje}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{l.uid ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && logs.length === 0 && (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: 40 }}>Presiona "Cargar" para ver logs.</p>
      )}
    </div>
  )
}
