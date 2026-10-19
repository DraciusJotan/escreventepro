import { useEffect, useRef } from 'react'
import { addDays, formatBR, heatmapRange, weekday } from '../lib/dates'
import styles from './Heatmap.module.css'

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

function level(count) {
  if (count === 0) return 0
  if (count < 5) return 1
  if (count < 10) return 2
  if (count < 20) return 3
  return 4
}

// activity: [{ day: 'AAAA-MM-DD', total }]
export default function Heatmap({ activity }) {
  const scroller = useRef(null)
  const { start, end } = heatmapRange()
  const counts = new Map(activity.map((a) => [a.day, a.total]))

  const cells = []
  const monthLabels = []
  let lastMonth = -1
  for (let day = start, i = 0; day <= end; day = addDays(day, 1), i++) {
    const col = Math.floor(i / 7)
    const month = Number(day.slice(5, 7)) - 1
    if (weekday(day) === 0 && month !== lastMonth) {
      monthLabels.push({ col, label: MONTHS[month] })
      lastMonth = month
    }
    const total = counts.get(day) ?? 0
    cells.push(
      <div
        key={day}
        className={styles.cell}
        data-level={level(total)}
        title={`${formatBR(day)}: ${total} ${total === 1 ? 'questão' : 'questões'}`}
      />,
    )
  }
  const columns = Math.ceil(cells.length / 7)

  // Começa rolado até o fim, que é onde está o dia de hoje.
  useEffect(() => {
    const el = scroller.current
    if (el) el.scrollLeft = el.scrollWidth
  }, [])

  return (
    <div className={styles.scroller} ref={scroller}>
      <div className={styles.inner}>
        <div className={styles.months} style={{ gridTemplateColumns: `repeat(${columns}, var(--cell))` }}>
          {monthLabels.map((m) => (
            <span key={m.col} style={{ gridColumn: m.col + 1 }}>
              {m.label}
            </span>
          ))}
        </div>
        <div
          className={styles.grid}
          role="img"
          aria-label="Mapa de calor de questões resolvidas nos últimos 12 meses"
        >
          {cells}
        </div>
      </div>
    </div>
  )
}
