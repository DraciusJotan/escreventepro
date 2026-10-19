import { NavLink, Outlet } from 'react-router'
import { useAuth } from '../contexts/AuthContext'
import styles from './Layout.module.css'

const NAV_ITEMS = [
  { to: '/', label: 'Início', icon: '⌂' },
  { to: '/resolver', label: 'Resolver', icon: '✎' },
  { to: '/revisao', label: 'Revisão', icon: '↻' },
  { to: '/questoes', label: 'Questões', icon: '☰' },
  { to: '/desempenho', label: 'Desempenho', icon: '▤' },
]

// Mobile: barra de navegação fixa embaixo (alcance do polegar).
// Desktop (>= 768px): a mesma barra vira um menu no topo.
export default function Layout() {
  const { user, signOut } = useAuth()

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <span className={styles.brand}>Escrevente Pro</span>
        <nav className={styles.nav} aria-label="Principal">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}
            >
              <span className={styles.icon} aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className={styles.account}>
          <span className={styles.email}>{user.email}</span>
          <button type="button" className="btn" onClick={signOut}>Sair</button>
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
