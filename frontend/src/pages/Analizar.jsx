import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { documentoService } from '../services/documentoService'
import { plagiarismService } from '../services/plagiarismService'
import ScoreBadge from '../components/ScoreBadge'
import styles from './Analizar.module.css'

export default function Analizar() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [docs, setDocs] = useState([])
  const [form, setForm] = useState({ did: params.get('did') || '', did_referencia: '', referencia: '', tipo_evaluacion: 'similitud_semantica' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resultado, setResultado] = useState(null)

  const esComparacion = form.tipo_evaluacion === 'similitud_semantica'

  useEffect(() => {
    documentoService.listar().then(setDocs).catch(() => {})
  }, [])

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const onSubmit = async e => {
    e.preventDefault()
    if (!form.did) { setError('Selecciona un documento a analizar'); return }
    if (esComparacion && !form.did_referencia && !form.referencia) {
      setError('Selecciona un segundo documento o pega un texto de referencia')
      return
    }
    setError('')
    setLoading(true)
    setResultado(null)
    try {
      const r = await plagiarismService.check(
        parseInt(form.did),
        form.referencia,
        form.tipo_evaluacion,
        form.did_referencia ? parseInt(form.did_referencia) : null
      )
      setResultado(r)
    } catch (e) {
      setError(e.response?.data?.error || 'Error al analizar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className={styles.title}>Nueva evaluación</h1>

      <div className={styles.grid}>
        <div className="card">
          <form onSubmit={onSubmit} className={styles.form}>
            <label>Tipo de evaluación
              <select name="tipo_evaluacion" value={form.tipo_evaluacion} onChange={onChange}>
                <option value="similitud_semantica">Similitud semántica (compara 2 documentos)</option>
                <option value="deteccion_ia">Detección IA (analiza 1 documento)</option>
              </select>
            </label>

            <label>{esComparacion ? 'Documento A' : 'Documento a analizar'}
              <select name="did" value={form.did} onChange={onChange} required>
                <option value="">— Seleccionar —</option>
                {docs.map(d => (
                  <option key={d.did} value={d.did}>{d.nombre_archivo} (#{d.did})</option>
                ))}
              </select>
            </label>

            {esComparacion && (
              <>
                <label>Documento B <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(o pega un texto abajo)</span>
                  <select name="did_referencia" value={form.did_referencia} onChange={onChange}>
                    <option value="">— Seleccionar —</option>
                    {docs.filter(d => String(d.did) !== String(form.did)).map(d => (
                      <option key={d.did} value={d.did}>{d.nombre_archivo} (#{d.did})</option>
                    ))}
                  </select>
                </label>

                <label>Texto de referencia <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(opcional si elegiste Documento B)</span>
                  <textarea name="referencia" value={form.referencia} onChange={onChange} rows={6} placeholder="Pega aquí el texto original para comparar..." />
                </label>
              </>
            )}

            {error && <p className="error-msg">{error}</p>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" style={{ marginRight: 8 }} /> Procesando…</> : 'Analizar'}
            </button>
          </form>
        </div>

        {resultado && (
          <div className={styles.resultado}>
            <div className="card" style={{ marginBottom: 16 }}>
              <div className={styles.scoreRow}>
                {resultado.score_plagio != null && (
                  <div>
                    <div className={styles.scoreLabel}>Score de similitud</div>
                    <div className={styles.scoreBig}><ScoreBadge score={resultado.score_plagio} /></div>
                  </div>
                )}
                {resultado.resultado?.ia_detection && (
                  <div>
                    <div className={styles.scoreLabel}>Detección IA</div>
                    <div className={styles.scoreBig}>
                      <span className={`badge badge-${resultado.resultado.ia_detection.is_ai_generated ? 'danger' : 'success'}`}>
                        {resultado.resultado.ia_detection.is_ai_generated ? 'IA detectada' : 'No IA'}
                        {resultado.resultado.ia_detection.prob_ia != null &&
                          ` (${Math.round(resultado.resultado.ia_detection.prob_ia * 100)}%)`}
                      </span>
                    </div>
                  </div>
                )}
                <button className="btn-ghost" style={{ marginLeft: 'auto' }} onClick={() => navigate(`/historial/${resultado.eid}`)}>
                  Ver detalle →
                </button>
              </div>
            </div>

            {resultado.segmentos?.length > 0 && (
              <div className="card">
                <h3 className={styles.secTitle}>Segmentos plagiados ({resultado.segmentos.length})</h3>
                <div className={styles.segments}>
                  {resultado.segmentos.map((s, i) => (
                    <div key={i} className={styles.segment}>
                      <span className="badge badge-danger" style={{ marginBottom: 4 }}>{Math.round((s.porcentaje_similitud || 0) * 100)}%</span>
                      <p>{s.texto_documento}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
