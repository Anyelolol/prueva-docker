import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Documentos from './pages/Documentos'
import Analizar from './pages/Analizar'
import Historial from './pages/Historial'
import ResultadoDetalle from './pages/ResultadoDetalle'
import Usuarios from './pages/admin/Usuarios'
import Modelos from './pages/admin/Modelos'
import Logs from './pages/admin/Logs'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="documentos" element={<Documentos />} />
            <Route path="analizar" element={<Analizar />} />
            <Route path="historial" element={<Historial />} />
            <Route path="historial/:eid" element={<ResultadoDetalle />} />
            <Route path="admin/usuarios" element={
              <ProtectedRoute adminOnly>
                <Usuarios />
              </ProtectedRoute>
            } />
            <Route path="admin/logs" element={
              <ProtectedRoute adminOnly>
                <Logs />
              </ProtectedRoute>
            } />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
