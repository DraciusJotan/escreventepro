// Sessão de estudo escolhida no Banco de Questões (quais questões e por onde começar).
// Fica no sessionStorage: sobrevive a um F5, mas não vaza para outra aba/visita.
const KEY = 'escreventepro:sessao'

export function saveSession(data) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    /* sem armazenamento: a sessão não poderá ser retomada ao recarregar */
  }
}

export function loadSession() {
  try {
    const raw = JSON.parse(sessionStorage.getItem(KEY))
    return Array.isArray(raw?.ids) && raw.ids.length ? raw : null
  } catch {
    return null
  }
}

export function shuffled(list) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
