import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import QuizRunner from '../components/QuizRunner'
import { subjectColor, tagStyle } from '../lib/subjectColor'
import { fetchWrongQuestions, isMissingSchema, MIGRATION_HINT } from '../services/questions'
import { listSubjects } from '../services/subjects'

// "Meu Caderno de Erros": questões cuja última resposta foi errada. Acertou de novo? Sai do caderno.
export default function Caderno() {
  const [subjects, setSubjects] = useState([])
  const [selected, setSelected] = useState([])
  const [questions, setQuestions] = useState(null)
  const [error, setError] = useState('')
  const [running, setRunning] = useState(false)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    listSubjects().then(setSubjects, (e) => setError(e.message))
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchWrongQuestions(selected, 200).then(
      (list) => !cancelled && (setQuestions(list), setError('')),
      (e) => !cancelled && setError(isMissingSchema(e) ? MIGRATION_HINT : e.message),
    )
    return () => {
      cancelled = true
    }
  }, [selected, reload])

  const names = Object.fromEntries(subjects.map((s) => [s.id, s.name]))
  const toggle = (id) => setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))

  if (running && questions?.length) {
    return (
      <section>
        <header className="page-header">
          <h1>Refazendo o caderno de erros</h1>
        </header>
        <QuizRunner
          questions={questions}
          mode="practice"
          subjectNames={names}
          exitLabel="Voltar ao caderno"
          onExit={() => {
            setRunning(false)
            setQuestions(null)
            setReload((n) => n + 1)
          }}
        />
      </section>
    )
  }

  return (
    <section>
      <header className="page-header">
        <div>
          <p className="eyebrow">Questões</p>
          <h1>Meu Caderno de Erros</h1>
        </div>
        <button type="button" className="btn btn-primary" disabled={!questions?.length} onClick={() => setRunning(true)}>
          Refazer {questions?.length ? `${questions.length} ` : ''}questões
        </button>
      </header>

      {error && <p className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>{error}</p>}

      <div className="chips" style={{ marginBottom: 'var(--space-5)' }}>
        {subjects.map((s) => (
          <label key={s.id} className="chip" data-on={selected.includes(s.id)} style={tagStyle(s.name)}>
            <input type="checkbox" checked={selected.includes(s.id)} onChange={() => toggle(s.id)} />
            {s.name}
          </label>
        ))}
      </div>

      {!questions && !error && <p className="muted">Carregando…</p>}

      {questions?.length === 0 && (
        <div className="card empty">
          <p style={{ margin: 0 }}>
            <strong>Seu caderno está vazio.</strong>
          </p>
          <p>
            Questões que você erra aparecem aqui até você acertar de novo. <Link to="/resolver">Resolver questões</Link>
          </p>
        </div>
      )}

      <ul className="list">
        {questions?.map((q) => (
          <li key={q.id} style={{ '--tag': subjectColor(names[q.subject_id]) }} className="stack">
            <div className="row">
              <span className="badge">{names[q.subject_id]}</span>
              {q.topic && <span className="muted">{q.topic}</span>}
              <span className="muted" style={{ marginLeft: 'auto' }}>
                Gabarito {q.correct_option}
              </span>
            </div>
            <p className="truncate-3" style={{ margin: 0 }}>
              {q.statement}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
