import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { countDueReviews } from '../services/answers'
import Icon from './Icon'
import Logo from './Logo'
import Menu from './Menu'
import styles from './Layout.module.css'

const QUESTION_AREA = ['/questoes', '/resolver', '/caderno', '/simulado', '/simulados', '/materias']

const THEMES = [
  { id: 'dark', label: 'Escuro', icon: 'moon' },
  { id: 'light', label: 'Claro', icon: 'sun' },
  { id: 'auto', label: 'Auto', icon: 'target' },
]

function MenuItem({ to, icon, children, onClick }) {
  return (
    <NavLink to={to} className={styles.item} role="menuitem" onClick={onClick}>
      <Icon name={icon} size={20} />
      <span>{children}</span>
    </NavLink>
  )
}

// Desktop: barra superior com menus (como as plataformas de cursinho).
// Celular: a mesma navegação vira uma barra de abas fixa embaixo.
export default function Layout() {
  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [due, setDue] = useState(0)
  const [term, setTerm] = useState('')

  // Atualiza o contador da Revisão a cada troca de tela.
  useEffect(() => {
    countDueReviews().then(setDue, () => {})
  }, [location.pathname])

  const inQuestionArea = QUESTION_AREA.some((p) => location.pathname.startsWith(p))
  const initial = (user.email?.[0] ?? '?').toUpperCase()
  const linkClass = ({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)

  function search(e, close) {
    e.preventDefault()
    const q = term.trim()
    navigate(q ? `/questoes?busca=${encodeURIComponent(q)}` : '/questoes')
    setTerm('')
    close()
  }

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <NavLink to="/" className={styles.brand} aria-label="Escrevente Pro, início">
          <Logo size={36} />
          <span className={styles.brandText}>
            Escrevente <b>Pro</b>
          </span>
        </NavLink>

        <nav className={styles.nav} aria-label="Principal">
          <NavLink to="/" end className={linkClass}>
            <Icon name="home" size={22} />
            <span>Início</span>
          </NavLink>
          <NavLink to="/cronograma" className={linkClass}>
            <Icon name="calendar" size={22} />
            <span>Cronograma</span>
          </NavLink>

          <NavLink to="/aulas" className={linkClass}>
            <Icon name="video" size={22} />
            <span>Aulas</span>
          </NavLink>

          <Menu
            label="Questões e simulados"
            triggerClassName={inQuestionArea ? `${styles.link} ${styles.active}` : styles.link}
            trigger={
              <>
                <Icon name="listCheck" size={22} />
                <span>
                  Questões <i className={styles.amp}>&amp;</i> Simulados
                </span>
              </>
            }
          >
            {() => (
              <>
                <p className={styles.heading}>Questões</p>
                <MenuItem to="/questoes" icon="book">Banco de Questões</MenuItem>
                <MenuItem to="/resolver" icon="pencil">Resolver Questões</MenuItem>
                <MenuItem to="/caderno" icon="notebook">Meu Caderno de Erros</MenuItem>
                <p className={styles.heading}>Simulado</p>
                <MenuItem to="/simulado/novo" icon="filePlus">Novo Simulado</MenuItem>
                <MenuItem to="/simulados" icon="fileCheck">Simulados Realizados</MenuItem>
              </>
            )}
          </Menu>

          <NavLink to="/revisao" className={linkClass}>
            <span className={styles.iconWrap}>
              <Icon name="repeat" size={22} />
              {due > 0 && <span className={styles.dot} aria-hidden="true" />}
            </span>
            <span>Revisão</span>
            {due > 0 && (
              <span className={styles.count} aria-label={`${due} pendentes`}>
                {due}
              </span>
            )}
          </NavLink>
          <NavLink to="/desempenho" className={linkClass}>
            <Icon name="chart" size={22} />
            <span>Desempenho</span>
          </NavLink>
        </nav>

        <div className={styles.actions}>
          <Menu
            label="Buscar questões"
            align="right"
            triggerClassName={styles.searchBtn}
            trigger={
              <>
                <Icon name="search" size={22} />
                <span>Buscar</span>
              </>
            }
          >
            {(close) => (
              <form className={styles.search} onSubmit={(e) => search(e, close)}>
                <input
                  autoFocus
                  type="search"
                  placeholder="Buscar no enunciado ou assunto"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  aria-label="Buscar questões"
                />
                <button type="submit" className="btn btn-blue">
                  Buscar
                </button>
              </form>
            )}
          </Menu>

          <Menu
            label="Conta"
            align="right"
            triggerClassName={styles.avatarBtn}
            trigger={
              <>
                <span className={styles.avatar}>{initial}</span>
                <Icon name="chevronDown" size={18} />
              </>
            }
          >
            {(close) => (
              <>
                <p className={styles.email}>{user.email}</p>
                <MenuItem to="/materias" icon="folder">Matérias</MenuItem>
                <MenuItem to="/questoes/importar" icon="upload">Importar questões</MenuItem>
                <p className={styles.heading}>Tema</p>
                <div className={styles.themes} role="group" aria-label="Tema">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={styles.themeBtn}
                      data-on={theme === t.id}
                      onClick={() => setTheme(t.id)}
                    >
                      <Icon name={t.icon} size={16} /> {t.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className={`${styles.item} ${styles.signOut}`}
                  onClick={() => {
                    close()
                    signOut()
                  }}
                >
                  <Icon name="logout" size={20} />
                  <span>Sair</span>
                </button>
              </>
            )}
          </Menu>
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
