import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { plagiarismService } from '../services/plagiarismService'
import { useDocumentos } from '../hooks/useDocumentos'
import ScoreBadge from '../components/ScoreBadge'
import styles from './ResultadoDetalle.module.css'

export default function ResultadoDetalle() {
  const { eid } = useParams()
  const [ev, setEv] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { docs } = useDocumentos()
  const nombreDoc = did => docs.find(d => d.did === did)?.nombre_original || 'Documento eliminado'

  useEffect(() => {
    plagiarismService.resultado(parseInt(eid))
      .then(setEv)
      .catch(e => setError(e.response?.data?.error || 'Error al cargar'))
      .finally(() => setLoading(false))
  }, [eid])

  if (loading) return <span className="spinner" />
  if (error) return <p className="error-msg">{error}</p>
  if (!ev) return null

  const ia = ev.resultado?.ia_detection

  return (
    <div>
      <div className={styles.back}><Link to="/historial">← Historial</Link></div>
      <h1 className={styles.title}>Resultado de evaluación</h1>
      <p className={styles.meta}>{nombreDoc(ev.did)} · {ev.tipo_evaluacion} · {new Date(ev.fecha_evaluacion).toLocaleString()}</p>

      <div className={styles.topCards}>
        <div className="card">
          <div className={styles.cardLabel}>Score similitud</div>
          <div className={styles.bigScore}><ScoreBadge score={ev.score_plagio} /></div>
          <div className={styles.pct}>{ev.score_plagio != null ? `${Math.round(ev.score_plagio * 100)}%` : '—'}</div>
        </div>

        {ia && (
          <div className="card">
            <div className={styles.cardLabel}>Detección IA</div>
            <div style={{ marginTop: 8 }}>
              <span className={`badge badge-${ia.is_ai_generated ? 'danger' : 'success'}`} style={{ fontSize: 14, padding: '4px 14px' }}>
                {ia.is_ai_generated ? '⚠ Texto generado por IA' : '✓ Texto humano'}
              </span>
              {ia.prob_ia != null && (
                <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 8 }}>
                  Probabilidad de IA: {Math.round(ia.prob_ia * 100)}%
                </p>
              )}
            </div>
          </div>
        )}

        <div className="card">
          <div className={styles.cardLabel}>Estado</div>
          <div style={{ marginTop: 8 }}>
            <span className={`badge badge-${ev.estado === 'completado' ? 'success' : ev.estado === 'error' ? 'danger' : 'info'}`}>
              {ev.estado}
            </span>
          </div>
          {ev.modelo_utilizado && (
            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 8 }}>
              Modelo: {ev.modelo_utilizado} {ev.version_modelo ? `v${ev.version_modelo}` : ''}
            </p>
          )}
        </div>
      </div>

      {ev.log_error && (
        <div className="card" style={{ borderColor: 'var(--danger)', marginTop: 16 }}>
          <p style={{ color: 'var(--danger)' }}>Error: {ev.log_error}</p>
        </div>
      )}

      {ev.segmentos?.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h2 className={styles.sectionTitle}>Segmentos plagiados ({ev.segmentos.length})</h2>
          <div className={styles.segments}>
            {ev.segmentos.map((s, i) => (
              <div key={i} className="card" style={{ borderLeft: '3px solid var(--danger)', padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span className="badge badge-danger">{Math.round((s.porcentaje_similitud || 0) * 100)}%</span>
                  {s.inicio_documento != null && (
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>pos {s.inicio_documento}–{s.fin_documento}</span>
                  )}
                </div>
                <p style={{ fontSize: 13, color: 'var(--text)' }}>{s.texto_documento}</p>
                {s.texto_coincidente && (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                    Fuente: {s.texto_coincidente}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {ev.fuentes?.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h2 className={styles.sectionTitle}>Fuentes detectadas ({ev.fuentes.length})</h2>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table>
              <thead>
                <tr>
                  <th>URL / Fuente</th>
                  <th>Similitud</th>
                  <th>Segmentos</th>
                </tr>
              </thead>
              <tbody>
                {ev.fuentes.map((f, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: 13 }}>{f.url || f.titulo || f.fuente || '—'}</td>
                    <td><ScoreBadge score={f.porcentaje_coincidencia} /></td>
                    <td style={{ color: 'var(--text-muted)' }}>{f.texto_detectado ? '1' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {ev.resultado_json && (
        <details style={{ marginTop: 24 }}>
          <summary style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13 }}>JSON completo</summary>
          <pre className={styles.json}>{JSON.stringify(ev.resultado_json, null, 2)}</pre>
        </details>
      )}
    </div>
  )
}
