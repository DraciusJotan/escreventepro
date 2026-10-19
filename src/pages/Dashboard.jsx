import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import Heatmap from '../components/Heatmap'
import StatBar from '../components/StatBar'
import { addDays, heatmapRange, todayISO } from '../lib/dates'
import { countDueReviews } from '../services/answers'
import { getDailyActivity, getSubjectStats, percent, weakestSubjects } from '../services/stats'
import styles from './Dashboard.module.css'

// Dias seguidos com pelo menos uma questão. Se hoje ainda não teve, a sequência
// não quebra: ela conta a partir de ontem.
function currentStreak(activity) {
  const days = new Set(activity.map((a) => a.day))
  let day = todayISO()
  if (!days.has(day)) day = addDays(day, -1)
  let streak = 0
  while (days.has(day)) {
    streak++
    day = addDays(day, -1)
  }
  return streak
}

const dateLabel = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'America/Sao_Paulo',
}).format(new Date())
const dateText = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const { start, end } = heatmapRange()
    Promise.all([getDailyActivity(start, end), countDueReviews(), getSubjectStats()]).then(
      ([activity, due, stats]) => setData({ activity, due, stats }),
      (e) => setError(e.message),
    )
  }, [])

  if (error) return <p className="alert alert-error">{error}</p>
  if (!data) return <p className="muted">Carregando…</p>

  const { activity, due, stats } = data
  const todayCount = activity.find((a) => a.day === todayISO())?.total ?? 0
  const yearTotal = activity.reduce((sum, a) => sum + a.total, 0)
  const streak = currentStreak(activity)
  const totals = stats.reduce((t, s) => ({ total: t.total + s.total, correct: t.correct + s.correct }), {
    total: 0,
    correct: 0,
  })
  const weak = weakestSubjects(stats)

  return (
    <section>
      <header className="page-header">
        <div>
          <p className="eyebrow">{dateText}</p>
          <h1>
            <span className="hl">Hoje</span>
          </h1>
        </div>
      </header>

      <div className={`postit ${styles.review}`}>
        <div>
          <p className={styles.hand}>{due > 0 ? 'na pauta de hoje:' : 'pauta de hoje:'}</p>
          <p className={styles.reviewTitle}>
            {due > 0 ? (
              <>
                <b>{due}</b> {due === 1 ? 'questão para revisar' : 'questões para revisar'}
              </>
            ) : (
              'Revisão em dia!'
            )}
          </p>
          <p className={styles.reviewText}>
            {due > 0
              ? 'Questões que você errou e que vencem hoje ou antes.'
              : 'Nada vence hoje. Que tal resolver questões novas?'}
          </p>
        </div>
        <Link className="btn btn-primary" to={due > 0 ? '/revisao' : '/resolver'}>
          {due > 0 ? 'Revisar agora' : 'Resolver questões'}
        </Link>
      </div>

      <div className="tiles">
        <div className="tile" data-tone="yellow">
          <p className="big-number">{todayCount}</p>
          <span className="muted">{todayCount === 1 ? 'questão hoje' : 'questões hoje'}</span>
        </div>
        <div className="tile" data-tone="pink">
          <p className="big-number">{streak}</p>
          <span className="muted">{streak === 1 ? 'dia seguido' : 'dias seguidos'}</span>
        </div>
        <div className="tile" data-tone="teal">
          <p className="big-number">{totals.total ? `${percent(totals.correct, totals.total)}%` : '–'}</p>
          <span className="muted">de acerto</span>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">
          {yearTotal} {yearTotal === 1 ? 'questão' : 'questões'} no último ano
        </h2>
        <div className="card">
          <Heatmap activity={activity} />
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Matérias para reforçar</h2>
        <div className="card">
          {weak.length === 0 ? (
            <p className="muted" style={{ margin: 0 }}>
              Aparece aqui depois de 10 respostas em uma matéria.
            </p>
          ) : (
            weak.map((s) => (
              <StatBar key={s.subject_id} label={s.name} correct={s.correct} total={s.total} highlight />
            ))
          )}
        </div>
        <p style={{ margin: 'var(--space-3) 0 0' }}>
          <Link to="/desempenho">Ver desempenho completo</Link>
        </p>
      </div>
    </section>
  )
}
