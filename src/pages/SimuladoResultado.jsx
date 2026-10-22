import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import StatBar from '../components/StatBar'
import { subjectColor } from '../lib/subjectColor'
import { formatDuration, getExam } from '../services/exams'
import { getQuestionsByIds } from '../services/questions'
import { listSubjects } from '../services/subjects'
import { percent } from '../services/stats'
import styles from './SimuladoResultado.module.css'

export default function SimuladoResultado() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getExam(id)
      .then(async (exam) => {
        const [questions, subjects] = await Promise.all([getQuestionsByIds(exam.items.map((i) => i.q)), listSubjects()])
        setData({ exam, questions: new Map(questions.map((q) => [q.id, q])), subjects: new Map(subjects.map((s) => [s.id, s.name])) })
      })
      .catch((e) => setError(e.message))
  }, [id])

  if (error) return <p className="alert alert-error">{error}</p>
  if (!data) return <p className="muted">Carregando…</p>

  const { exam, questions, subjects } = data
  const pct = percent(exam.correct, exam.total)
  const blank = exam.items.filter((i) => !i.sel).length

  // desempenho por matéria dentro do simulado
  const perSubject = new Map()
  for (const item of exam.items) {
    const q = questions.get(item.q)
    if (!q) continue
    const name = subjects.get(q.subject_id) ?? 'Outras'
    const cur = perSubject.get(name) ?? { total: 0, correct: 0 }
    cur.total++
    if (item.ok) cur.correct++
    perSubject.set(name, cur)
  }

  return (
    <section>
      <header className="page-header">
        <div>
          <p className="eyebrow">Simulado realizado</p>
          <h1>{exam.title}</h1>
        </div>
        <div className="actions">
          <Link className="btn" to="/simulados">
            Todos os simulados
          </Link>
          <Link className="btn btn-primary" to="/simulado/novo">
            Novo simulado
          </Link>
        </div>
      </header>

      <div className={styles.banner}>
        <p className={styles.pct}>{pct}%</p>
        <div>
          <p className={styles.line}>
            <b>{exam.correct}</b> de {exam.total} questões corretas
          </p>
          <p className={styles.sub}>
            {blank > 0 && `${blank} em branco · `}Tempo: {formatDuration(exam.time_used_seconds)} de {formatDuration(exam.time_limit_seconds)}
          </p>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Por matéria</h2>
        <div className="card">
          {[...perSubject].map(([name, s]) => (
            <StatBar key={name} label={name} correct={s.correct} total={s.total} />
          ))}
        </div>
      </div>

      <h2 className="section-title">Questões</h2>
      <ul className="list">
        {exam.items.map((item, i) => {
          const q = questions.get(item.q)
          const state = !item.sel ? 'blank' : item.ok ? 'ok' : 'no'
          return (
            <li key={item.q} className="stack" style={{ '--tag': subjectColor(q ? subjects.get(q.subject_id) : '') }}>
              <div className="row">
                <b>{i + 1}.</b>
                {q && <span className="badge">{subjects.get(q.subject_id)}</span>}
                <span className={styles.tag} data-state={state}>
                  {state === 'blank' ? 'Em branco' : state === 'ok' ? 'Acertou' : 'Errou'}
                </span>
                <span className="muted" style={{ marginLeft: 'auto', fontSize: '0.85rem' }}>
                  {item.sel ? `Você marcou ${item.sel}` : 'Sem resposta'}
                  {q && ` · Gabarito ${q.correct_option}`}
                </span>
              </div>
              <p className="truncate-3" style={{ margin: 0 }}>
                {q ? q.statement : 'Esta questão foi excluída do banco.'}
              </p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
