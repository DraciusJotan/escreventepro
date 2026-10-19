import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'
import { useAuth } from '../contexts/AuthContext'
import { countDueReviews } from '../services/answers'
import Icon from './Icon'
import Logo from './Logo'
import styles from './Layout.module.css'

const NAV_ITEMS = [
  { to: '/', label: 'Início', icon: 'home' },
  { to: '/resolver', label: 'Resolver', icon: 'pencil' },
  { to: '/revisao', label: 'Revisão', icon: 'repeat', badge: true },
  { to: '/questoes', label: 'Questões', icon: 'book' },
  { to: '/desempenho', label: 'Desempenho', icon: 'chart' },
]

// Celular: barra de abas fixa embaixo (alcance do polegar).
// Computador (>= 900px): barra lateral à esquerda.
export default function Layout() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const [due, setDue] = useState(0)

  // Atualiza o contador da Revisão a cada troca de tela.
  useEffect(() => {
    countDueReviews().then(setDue, () => {})
  }, [location.pathname])

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <span className={styles.brand}>
          <Logo size={30} />
          Escrevente <em>Pro</em>
        </span>
        <button type="button" className={styles.iconButton} onClick={signOut} aria-label="Sair">
          <Icon name="logout" />
        </button>
      </header>

      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <span className={styles.brand}>
            <Logo size={36} />
            Escrevente <em>Pro</em>
          </span>
          <span className={styles.tagline}>concurso TJSP · VUNESP</span>
        </div>

        <nav className={styles.nav} aria-label="Principal">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}
            >
              <span className={styles.iconWrap}>
                <Icon name={item.icon} />
                {item.badge && due > 0 && <span className={styles.dot} aria-hidden="true" />}
              </span>
              <span>{item.label}</span>
              {item.badge && due > 0 && (
                <span className={styles.count} aria-label={`${due} pendentes`}>
                  {due}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className={styles.account}>
          <span className={styles.email}>{user.email}</span>
          <button type="button" className={styles.signOut} onClick={signOut}>
            <Icon name="logout" size={16} /> Sair
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
