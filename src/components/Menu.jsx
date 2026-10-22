import { useEffect, useId, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import styles from './Menu.module.css'

// Menu suspenso acessível: abre com clique, fecha com Esc, clique fora ou troca de rota.
// `children` pode ser uma função (close) => nós, para itens que fecham o menu ao serem usados.
export default function Menu({ trigger, triggerClassName, align = 'left', label, children }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const id = useId()
  const { pathname } = useLocation()

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // fecha ao navegar
  useEffect(() => setOpen(false), [pathname])

  return (
    <div className={styles.wrap} ref={ref}>
      <button
        type="button"
        className={triggerClassName}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={id}
        aria-label={label}
        onClick={() => setOpen((o) => !o)}
        data-open={open}
      >
        {trigger}
      </button>
      {open && (
        <div id={id} className={styles.panel} data-align={align} role="menu">
          {typeof children === 'function' ? children(() => setOpen(false)) : children}
        </div>
      )}
    </div>
  )
}
