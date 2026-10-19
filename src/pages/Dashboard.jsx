import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import Heatmap from '../components/Heatmap'
import StatBar from '../components/StatBar'
import { addDays, heatmapRange, todayISO } from '../lib/dates'
import { countDueReviews } from '../services/answers'
import { getDailyActivity, getSubjectStats, percent, weakestSubjects } from '../services/stats'

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
  const today = todayISO()
  const todayCount = activity.find((a) => a.day === today)?.total ?? 0
  const yearTotal = activity.reduce((sum, a) => sum + a.total, 0)
  const totals = stats.reduce((t, s) => ({ total: t.total + s.total, correct: t.correct + s.correct }), {
    total: 0,
    correct: 0,
  })
  const weak = weakestSubjects(stats)

  return (
    <section>
      <div className="page-header">
        <h1>Início</h1>
      </div>

      <div className="card stack" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <div className="big-number">{due}</div>
            <div className="muted">{due === 1 ? 'questão para revisar hoje' : 'questões para revisar hoje'}</div>
          </div>
          <Link className="btn btn-primary" to={due ? '/revisao' : '/resolver'}>
            {due ? 'Revisar agora' : 'Resolver questões'}
          </Link>
        </div>
      </div>

      <div className="grid-stats">
        <div className="card">
          <div className="big-number">{todayCount}</div>
          <div className="muted">hoje</div>
        </div>
        <div className="card">
          <div className="big-number">{currentStreak(activity)}</div>
          <div className="muted">dias seguidos</div>
        </div>
        <div className="card">
          <div className="big-number">{totals.total ? `${percent(totals.correct, totals.total)}%` : '–'}</div>
          <div className="muted">de acerto geral</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
        <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>
          {yearTotal} {yearTotal === 1 ? 'questão' : 'questões'} no último ano
        </h2>
        <Heatmap activity={activity} />
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Matérias para reforçar</h2>
        {weak.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>
            Aparece aqui depois de 10 respostas em uma matéria.
          </p>
        ) : (
          weak.map((s) => <StatBar key={s.subject_id} label={s.name} correct={s.correct} total={s.total} highlight />)
        )}
        <p style={{ marginBottom: 0 }}>
          <Link to="/desempenho">Ver desempenho completo</Link>
        </p>
      </div>
    </section>
  )
}
