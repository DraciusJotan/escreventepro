import { percent } from '../services/stats'
import styles from './StatBar.module.css'

// Barra de acerto de uma matéria. A cor segue o desempenho.
export default function StatBar({ label, correct, total, highlight = false }) {
  const pct = percent(correct, total)
  const tone = total === 0 ? 'none' : pct < 50 ? 'bad' : pct < 70 ? 'mid' : 'good'

  return (
    <div className={`${styles.item} ${highlight ? styles.highlight : ''}`}>
      <div className={styles.head}>
        <span className={styles.label}>{label}</span>
        <span className="muted">
          {total === 0 ? 'sem respostas' : `${pct}% · ${correct}/${total}`}
        </span>
      </div>
      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Acerto em ${label}`}
      >
        <div className={styles.fill} data-tone={tone} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
