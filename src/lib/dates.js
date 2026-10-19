// Todas as datas do app usam o fuso de São Paulo, igual ao banco (daily_activity).
const TZ = 'America/Sao_Paulo'
const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: TZ }) // en-CA => AAAA-MM-DD

export const todayISO = () => formatter.format(new Date())

function toUTC(iso) {
  return new Date(`${iso}T00:00:00Z`)
}

export function addDays(iso, n) {
  const d = toUTC(iso)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

// 0 = domingo ... 6 = sábado
export const weekday = (iso) => toUTC(iso).getUTCDay()

// Intervalo do mapa de calor: 53 semanas, começando num domingo para que
// a última coluna seja a semana de hoje.
export function heatmapRange() {
  const end = todayISO()
  const start = addDays(end, -(53 * 7 - 1))
  return { start: addDays(start, -weekday(start)), end }
}

export function formatBR(iso) {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}
