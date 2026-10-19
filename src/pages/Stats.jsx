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
      <header className="page-header">
        <h1>Desempenho</h1>
      </header>

      <div className="figures" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div>
          <p className="big-number">{totals.total ? `${percent(totals.correct, totals.total)}%` : '–'}</p>
          <span className="muted">de acerto geral</span>
        </div>
        <div>
          <p className="big-number">{totals.total}</p>
          <span className="muted">respostas</span>
        </div>
      </div>

      <h2 className="section-title">Por matéria</h2>
      <div className="card">
        {stats.map((s) => (
          <StatBar
            key={s.subject_id}
            label={s.name}
            correct={s.correct}
            total={s.total}
            highlight={weakIds.has(s.subject_id)}
          />
        ))}
      </div>
      <p className="muted" style={{ fontSize: '0.85rem' }}>
        O ponto vermelho marca as 3 matérias com menor acerto, entre as que têm pelo menos{' '}
        {MIN_ANSWERS_FOR_RANKING} respostas.
      </p>
    </section>
  )
}
