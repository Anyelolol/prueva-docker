import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { setCargando(false); return }
    authService.me()
      .then(u => setUsuario(u))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setCargando(false))
  }, [])

  const login = async (email, password) => {
    const data = await authService.login(email, password)
    localStorage.setItem('token', data.token)
    setUsuario(data.usuario)
    return data.usuario
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
