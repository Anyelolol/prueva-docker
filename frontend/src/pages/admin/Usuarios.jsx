import { useEffect, useState } from 'react'
import { adminService } from '../../services/adminService'
import { useAuth } from '../../context/AuthContext'
import styles from './Admin.module.css'

const EMPTY = { nombre: '', apellido: '', email: '', password: '', rol: 'docente', activo: true }

export default function Usuarios() {
  const { usuario: yo } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [listError, setListError] = useState('')

  const cargar = () => {
    setLoading(true)
    adminService.listarUsuarios()
      .then(setUsuarios)
      .catch(e => setListError(e.response?.data?.error || 'Error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [])

  const onChange = e => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(p => ({ ...p, [e.target.name]: val }))
  }

  const startEdit = u => {
    setEditId(u.uid)
    setForm({ nombre: u.nombre, apellido: u.apellido, email: u.email, password: '', rol: u.rol, activo: u.activo })
    setError('')
  }

  const cancelEdit = () => { setEditId(null); setForm(EMPTY); setError('') }

  const onSave = async e => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editId) {
        const body = { nombre: form.nombre, apellido: form.apellido, email: form.email, rol: form.rol, activo: form.activo }
        if (form.password) body.password = form.password
        const u = await adminService.actualizarUsuario(editId, body)
        setUsuarios(prev => prev.map(x => x.uid === editId ? u : x))
      } else {
        const u = await adminService.crearUsuario(form)
        setUsuarios(prev => [u, ...prev])
      }
      setForm(EMPTY)
      setEditId(null)
    } catch (e) {
      setError(e.response?.data?.error || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const toggleActivo = async (u) => {
    const accion = u.activo ? 'Desactivar' : 'Reactivar'
    if (!confirm(`¿${accion} a ${u.nombre} ${u.apellido}?`)) return
    setError('')
    try {
      if (u.activo) {
        await adminService.eliminarUsuario(u.uid)
        setUsuarios(prev => prev.map(x => x.uid === u.uid ? { ...x, activo: false } : x))
      } else {
        const actualizado = await adminService.actualizarUsuario(u.uid, { activo: true })
        setUsuarios(prev => prev.map(x => x.uid === u.uid ? actualizado : x))
      }
    } catch (e) {
      alert(e.response?.data?.error || 'Error')
    }
  }

  return (
    <div>
      <h1 className={styles.title}>Usuarios</h1>

      <div className={styles.grid}>
        <div className="card">
          <h3 className={styles.formTitle}>{editId ? `Editar usuario #${editId}` : 'Nuevo usuario'}</h3>
          <form onSubmit={onSave} className={styles.form}>
            <label>Nombre
              <input name="nombre" value={form.nombre} onChange={onChange} required />
            </label>
            <label>Apellido
              <input name="apellido" value={form.apellido} onChange={onChange} required />
            </label>
            <label>Email
              <input type="email" name="email" value={form.email} onChange={onChange} required />
            </label>
            <label>{editId ? 'Nueva contraseña (opcional)' : 'Contraseña'}
              <input type="password" name="password" value={form.password} onChange={onChange} required={!editId} />
            </label>
            <label>Rol
              <select
                name="rol"
                value={form.rol}
                onChange={onChange}
                disabled={editId === yo?.uid}
                title={editId === yo?.uid ? 'No podés cambiar tu propio rol' : ''}
              >
                <option value="docente">Docente</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            {editId && (
              <label style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <input
                  type="checkbox"
                  name="activo"
                  checked={form.activo}
                  onChange={onChange}
                  disabled={editId === yo?.uid}
                  style={{ width: 'auto' }}
                />
                Activo
              </label>
            )}
            {error && <p className="error-msg">{error}</p>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? <span className="spinner" /> : editId ? 'Guardar' : 'Crear'}
              </button>
              {editId && <button type="button" className="btn-ghost" onClick={cancelEdit}>Cancelar</button>}
            </div>
          </form>
        </div>

        <div>
          {loading && <span className="spinner" />}
          {listError && <p className="error-msg">{listError}</p>}
          {!loading && usuarios.length > 0 && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Activo</th>
                    <th>Último acceso</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map(u => (
                    <tr key={u.uid}>
                      <td style={{ color: 'var(--text-muted)' }}>{u.uid}</td>
                      <td>{u.nombre} {u.apellido}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                      <td><span className={`badge badge-${u.rol === 'admin' ? 'warning' : 'info'}`}>{u.rol}</span></td>
                      <td><span className={`badge badge-${u.activo ? 'success' : 'danger'}`}>{u.activo ? 'Sí' : 'No'}</span></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{u.ultimo_acceso ? new Date(u.ultimo_acceso).toLocaleString() : '—'}</td>
                      <td style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => startEdit(u)}>
                          Editar
                        </button>
                        {u.uid !== yo?.uid && (
                          <button
                            className={u.activo ? 'btn-danger' : 'btn-primary'}
                            style={{ padding: '4px 10px', fontSize: 12 }}
                            onClick={() => toggleActivo(u)}
                          >
                            {u.activo ? 'Desactivar' : 'Reactivar'}
                          </button>
                        )}
                      </td>
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
