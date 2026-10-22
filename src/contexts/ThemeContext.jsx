import { createContext, useContext, useEffect, useState } from 'react'

const KEY = 'escreventepro:tema'
const ThemeContext = createContext(null)

function readStored() {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'auto' || v === 'dark' ? v : 'dark'
  } catch {
    return 'dark'
  }
}

// Tema: 'dark' (padrão), 'light' ou 'auto' (segue o sistema).
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readStored)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem(KEY, theme)
    } catch {
      /* sem armazenamento: o tema vale só nesta visita */
    }
  }, [theme])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

// eslint-disable-next-line react/only-export-components
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme precisa estar dentro de <ThemeProvider>')
  return ctx
}
