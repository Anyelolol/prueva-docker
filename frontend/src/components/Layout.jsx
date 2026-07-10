import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Layout.module.css'

const NavItem = ({ to, label, icon }) => (
  <NavLink to={to} className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
    <span className={styles.icon}>{icon}</span>
    {label}
  </NavLink>
)

export default function Layout() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>⬡</span>
          <span>Plagidec</span>
        </div>

        <nav className={styles.nav}>
          <NavItem to="/dashboard" label="Dashboard" icon="◈" />
          <NavItem to="/documentos" label="Documentos" icon="◻" />
          <NavItem to="/analizar" label="Analizar" icon="◎" />
          <NavItem to="/historial" label="Historial" icon="☰" />
          {usuario?.rol === 'admin' && (
            <>
              <div className={styles.divider} />
              <NavItem to="/admin/usuarios" label="Usuarios" icon="◉" />
              <NavItem to="/admin/logs" label="Logs" icon="▤" />
            </>
          )}
        </nav>

        <div className={styles.userBox}>
          <div className={styles.avatar}>{usuario?.nombre?.[0]?.toUpperCase()}</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{usuario?.nombre} {usuario?.apellido}</span>
            <span className={styles.userRole}>{usuario?.rol}</span>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout} title="Cerrar sesión">⏻</button>
        </div>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
