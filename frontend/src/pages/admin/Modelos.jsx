import { useEffect, useState } from 'react'
import { adminService } from '../../services/adminService'
import styles from './Admin.module.css'

const EMPTY = { nombre_modelo: '', version: '', descripcion: '', activo: true }

export default function Modelos() {
  const [modelos, setModelos] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    adminService.listarModelos()
      .then(setModelos)
      .catch(e => setError(e.response?.data?.error || 'Error'))
      .finally(() => setLoading(false))
  }, [])

  const onChange = e => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(p => ({ ...p, [e.target.name]: val }))
  }

  const onSave = async e => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editId) {
        const m = await adminService.actualizarModelo(editId, form)
        setModelos(prev => prev.map(x => x.mid === editId ? m : x))
      } else {
        const m = await adminService.crearModelo(form)
        setModelos(prev => [m, ...prev])
      }
      setForm(EMPTY)
      setEditId(null)
    } catch (e) {
      setError(e.response?.data?.error || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const startEdit = m => { setEditId(m.mid); setForm({ nombre_modelo: m.nombre_modelo, version: m.version, descripcion: m.descripcion || '', activo: m.activo }) }
  const cancelEdit = () => { setEditId(null); setForm(EMPTY); setError('') }

  return (
    <div>
      <h1 className={styles.title}>Modelos IA</h1>

      <div className={styles.grid}>
        <div className="card">
          <h3 className={styles.formTitle}>{editId ? `Editar modelo #${editId}` : 'Nuevo modelo'}</h3>
          <form onSubmit={onSave} className={styles.form}>
            <label>Nombre modelo
              <input name="nombre_modelo" value={form.nombre_modelo} onChange={onChange} required />
            </label>
            <label>Versión
              <input name="version" value={form.version} onChange={onChange} required />
            </label>
            <label>Descripción
              <input name="descripcion" value={form.descripcion} onChange={onChange} />
            </label>
            <label style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" name="activo" checked={form.activo} onChange={onChange} style={{ width: 'auto' }} />
              Activo
            </label>
            {error && <p className="error-msg">{error}</p>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? <span className="spinner" /> : editId ? 'Guardar' : 'Crear'}</button>
              {editId && <button type="button" className="btn-ghost" onClick={cancelEdit}>Cancelar</button>}
            </div>
          </form>
        </div>

        <div>
          {loading && <span className="spinner" />}
          {!loading && modelos.length > 0 && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table>
                <thead>
                  <tr><th>#</th><th>Nombre</th><th>Versión</th><th>Activo</th><th></th></tr>
                </thead>
                <tbody>
                  {modelos.map(m => (
                    <tr key={m.mid}>
                      <td style={{ color: 'var(--text-muted)' }}>{m.mid}</td>
                      <td>{m.nombre_modelo}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{m.version}</td>
                      <td><span className={`badge badge-${m.activo ? 'success' : 'danger'}`}>{m.activo ? 'Sí' : 'No'}</span></td>
                      <td><button className="btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => startEdit(m)}>Editar</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
