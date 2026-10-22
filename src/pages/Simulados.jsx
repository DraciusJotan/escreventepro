import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { deleteExam, formatDuration, listExams } from '../services/exams'
import { isMissingSchema, MIGRATION_HINT } from '../services/questions'
import { percent } from '../services/stats'

const dateFmt = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Sao_Paulo',
})

export default function Simulados() {
  const [exams, setExams] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    listExams().then(setExams, (e) => setError(isMissingSchema(e) ? MIGRATION_HINT : e.message))
  }, [])

  async function remove(exam) {
    if (!window.confirm('Excluir este simulado do histórico?')) return
    try {
      await deleteExam(exam.id)
      setExams((list) => list.filter((x) => x.id !== exam.id))
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <section>
      <header className="page-header">
        <div>
          <p className="eyebrow">Simulado</p>
          <h1>Simulados Realizados</h1>
        </div>
        <Link className="btn btn-primary" to="/simulado/novo">
          Novo simulado
        </Link>
      </header>

      {error && <p className="alert alert-error">{error}</p>}
      {!exams && !error && <p className="muted">Carregando…</p>}

      {exams?.length === 0 && (
        <div className="card empty">
          <p style={{ margin: 0 }}>
            <strong>Nenhum simulado ainda.</strong>
          </p>
          <p>
            Faça um simulado cronometrado para treinar o ritmo da prova. <Link to="/simulado/novo">Começar agora</Link>
          </p>
        </div>
      )}

      <ul className="list">
        {exams?.map((x) => {
          const pct = percent(x.correct, x.total)
          return (
            <li key={x.id} className="row" style={{ '--tag': pct >= 70 ? 'var(--success)' : pct >= 50 ? 'var(--warn)' : 'var(--danger)' }}>
              <div className="grow">
                <strong>{x.title}</strong>
                <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>
                  {dateFmt.format(new Date(x.finished_at))} · {formatDuration(x.time_used_seconds)} de {formatDuration(x.time_limit_seconds)}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <b style={{ fontSize: '1.4rem' }}>{pct}%</b>
                <p className="muted" style={{ margin: 0, fontSize: '0.8rem' }}>
                  {x.correct}/{x.total} acertos
                </p>
              </div>
              <Link className="btn btn-sm" to={`/simulados/${x.id}`}>
                Ver resultado
              </Link>
              <button type="button" className="btn btn-sm btn-danger" onClick={() => remove(x)}>
                Excluir
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
