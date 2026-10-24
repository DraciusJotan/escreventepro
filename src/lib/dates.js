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

// Segunda-feira da semana de uma data (semanas de segunda a domingo).
export function mondayOf(iso) {
  return addDays(iso, -((weekday(iso) + 6) % 7))
}

export function formatShort(iso) {
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}

// Dias entre duas datas AAAA-MM-DD (positivo se `to` é depois de `from`).
export function daysBetween(from, to) {
  return Math.round((toUTC(to) - toUTC(from)) / 86400000)
}
