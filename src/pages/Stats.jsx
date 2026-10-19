import { useEffect, useState } from 'react'
import StatBar from '../components/StatBar'
import { getSubjectStats, MIN_ANSWERS_FOR_RANKING, percent, weakestSubjects } from '../services/stats'

export default function Stats() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getSubjectStats().then(setStats, (e) => setError(e.message))
  }, [])

  if (error) return <p className="alert alert-error">{error}</p>
  if (!stats) return <p className="muted">Carregando…</p>

  const totals = stats.reduce((t, s) => ({ total: t.total + s.total, correct: t.correct + s.correct }), {
    total: 0,
    correct: 0,
  })
  const weakIds = new Set(weakestSubjects(stats).map((s) => s.subject_id))

  return (
    <section>
      <div className="page-header">
        <h1>Desempenho</h1>
      </div>

      <div className="grid-stats">
        <div className="card">
          <div className="big-number">{totals.total ? `${percent(totals.correct, totals.total)}%` : '–'}</div>
          <div className="muted">de acerto geral</div>
        </div>
        <div className="card">
          <div className="big-number">{totals.total}</div>
          <div className="muted">respostas</div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Por matéria</h2>
        {stats.map((s) => (
          <StatBar
            key={s.subject_id}
            label={s.name}
            correct={s.correct}
            total={s.total}
            highlight={weakIds.has(s.subject_id)}
          />
        ))}
        <p className="muted" style={{ marginBottom: 0 }}>
          Em destaque: as 3 matérias com menor acerto, considerando só as que têm pelo menos{' '}
          {MIN_ANSWERS_FOR_RANKING} respostas.
        </p>
      </div>
    </section>
  )
}
