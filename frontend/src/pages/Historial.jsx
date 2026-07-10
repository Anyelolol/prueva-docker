import { Link } from 'react-router-dom'
import { useHistorial } from '../hooks/useHistorial'
import { useDocumentos } from '../hooks/useDocumentos'
import ScoreBadge from '../components/ScoreBadge'
import styles from './Historial.module.css'

export default function Historial() {
  const { historial, loading, error, cargar } = useHistorial()
  const { docs } = useDocumentos()
  const nombreDoc = did => docs.find(d => d.did === did)?.nombre_archivo || `Doc #${did}`

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Historial de evaluaciones</h1>
        <button className="btn-ghost" onClick={cargar}>↻ Actualizar</button>
      </div>

      {loading && <span className="spinner" />}
      {error && <p className="error-msg">{error}</p>}

      {!loading && historial.length === 0 && (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: 40 }}>Sin evaluaciones aún.</p>
      )}

      {historial.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Documento</th>
                <th>Tipo</th>
                <th>Score</th>
                <th>IA detectada</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {historial.map((e, i) => (
                <tr key={e.eid}>
                  <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                  <td>{nombreDoc(e.did)}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{e.tipo_evaluacion}</td>
                  <td><ScoreBadge score={e.score_plagio} /></td>
                  <td>
                    {e.resultado?.ia_detection
                      ? <span className={`badge badge-${e.resultado.ia_detection.is_ai_generated ? 'danger' : 'success'}`}>
                          {e.resultado.ia_detection.is_ai_generated ? 'Sí' : 'No'}
                        </span>
                      : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                  <td>
                    <span className={`badge badge-${e.estado === 'completado' ? 'success' : e.estado === 'error' ? 'danger' : 'info'}`}>
                      {e.estado}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(e.fecha_evaluacion).toLocaleDateString()}</td>
                  <td><Link to={`/historial/${e.eid}`}><button className="btn-ghost" style={{ padding: '4px 12px', fontSize: 12 }}>Ver</button></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
