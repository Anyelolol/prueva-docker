import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Auth.module.css'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const onSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (e) {
      setError(e.response?.data?.error || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.box}>
        <div className={styles.logo}>⬡ Plagidec</div>
        <h2 className={styles.title}>Iniciar sesión</h2>
        <form onSubmit={onSubmit} className={styles.form}>
          <label>Email
            <input name="email" type="email" value={form.email} onChange={onChange} required autoFocus />
          </label>
          <label>Contraseña
            <input name="password" type="password" value={form.password} onChange={onChange} required />
          </label>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Entrar'}
          </button>
        </form>
        <p className={styles.link}>¿Sin cuenta? <Link to="/register">Registrarse</Link></p>
      </div>
    </div>
  )
}
