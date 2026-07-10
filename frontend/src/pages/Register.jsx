import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '../services/authService'
import { useAuth } from '../context/AuthContext'
import styles from './Auth.module.css'

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const onSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authService.register(form)
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (e) {
      setError(e.response?.data?.error || 'Error al registrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.box}>
        <div className={styles.logo}>⬡ Plagidec</div>
        <h2 className={styles.title}>Crear cuenta</h2>
        <form onSubmit={onSubmit} className={styles.form}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label>Nombre
              <input name="nombre" value={form.nombre} onChange={onChange} required />
            </label>
            <label>Apellido
              <input name="apellido" value={form.apellido} onChange={onChange} required />
            </label>
          </div>
          <label>Email
            <input name="email" type="email" value={form.email} onChange={onChange} required />
          </label>
          <label>Contraseña
            <input name="password" type="password" value={form.password} onChange={onChange} required />
          </label>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Registrarse'}
          </button>
        </form>
        <p className={styles.link}>¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link></p>
      </div>
    </div>
  )
}
