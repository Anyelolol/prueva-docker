import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { documentoService } from '../services/documentoService'
import { plagiarismService } from '../services/plagiarismService'
import ScoreBadge from '../components/ScoreBadge'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const { usuario } = useAuth()
  const [stats, setStats] = useState({ docs: 0, evaluaciones: 0, health: null })
  const [recientes, setRecientes] = useState([])
  const [docsMap, setDocsMap] = useState({})

  useEffect(() => {
    Promise.all([
      documentoService.listar(),
      plagiarismService.historial(),
      plagiarismService.health()
    ]).then(([docs, hist, health]) => {
      setStats({ docs: docs.length, evaluaciones: hist.length, health })
      setRecientes(hist.slice(0, 5))
      setDocsMap(Object.fromEntries(docs.map(d => [d.did, d.nombre_archivo])))
    }).catch(() => {})
  }, [])

  return (
    <div>
      <h1 className={styles.title}>Hola, {usuario?.nombre}</h1>
      <p className={styles.sub}>Sistema de detección de plagio</p>

      <div className={styles.cards}>
        <div className="card">
          <div className={styles.cardLabel}>Documentos</div>
          <div className={styles.cardVal}>{stats.docs}</div>
          <Link to="/documentos" className={styles.cardLink}>Ver todos →</Link>
        </div>
        <div className="card">
          <div className={styles.cardLabel}>Evaluaciones</div>
          <div className={styles.cardVal}>{stats.evaluaciones}</div>
          <Link to="/historial" className={styles.cardLink}>Ver historial →</Link>
        </div>
        <div className="card">
          <div className={styles.cardLabel}>Estado IA</div>
          <div className={styles.cardVal}>
            {stats.health === null
              ? '…'
              : stats.health.ia
                ? <span className="badge badge-success">Online</span>
                : <span className="badge badge-danger">Offline</span>}
          </div>
        </div>
        <div className="card">
          <div className={styles.cardLabel}>Acción rápida</div>
          <div style={{ marginTop: 8 }}>
            <Link to="/analizar">
              <button className="btn-primary" style={{ width: '100%' }}>+ Nueva evaluación</button>
            </Link>
          </div>
        </div>
      </div>

      {recientes.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h2 className={styles.sectionTitle}>Evaluaciones recientes</h2>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Documento</th>
                  <th>Tipo</th>
                  <th>Score</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recientes.map((e, i) => (
                  <tr key={e.eid}>
                    <td><Link to={`/historial/${e.eid}`}>{i + 1}</Link></td>
                    <td>{docsMap[e.did] || `Doc #${e.did}`}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{e.tipo_evaluacion}</td>
                    <td><ScoreBadge score={e.score_plagio} /></td>
                    <td><span className={`badge badge-${e.estado === 'completado' ? 'success' : e.estado === 'error' ? 'danger' : 'info'}`}>{e.estado}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(e.fecha_evaluacion).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
