import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { usuario, cargando } = useAuth()

  if (cargando) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <span className="spinner" />
    </div>
  )

  if (!usuario) return <Navigate to="/login" replace />
  if (adminOnly && usuario.rol !== 'admin') return <Navigate to="/dashboard" replace />

  return children
}
