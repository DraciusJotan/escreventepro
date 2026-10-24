import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import QuizRunner from '../components/QuizRunner'
import { PLANO_SIMULADO, PROVA } from '../data/edital'
import { subjectColor, tagStyle } from '../lib/subjectColor'
import { submitAnswer } from '../services/answers'
import { saveExam } from '../services/exams'
import { fetchRandomQuestions, isMissingSchema, MIGRATION_HINT } from '../services/questions'
import { listSubjects } from '../services/subjects'
import styles from './SimuladoNovo.module.css'

// A VUNESP dá ~3 minutos por questão (provas de 100 questões em 5 horas).
const MINUTES_PER_QUESTION = 3
// Modelo do edital: 70 questões; deixa uma folga para a redação, que é feita no mesmo dia.
const MODEL_MINUTES = 210

const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

export default function SimuladoNovo() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('modelo') // 'modelo' | 'custom'
  const [subjects, setSubjects] = useState([])
  const [selected, setSelected] = useState([])
  const [quantity, setQuantity] = useState(20)
  const [minutes, setMinutes] = useState(20 * MINUTES_PER_QUESTION)
  const [minutesTouched, setMinutesTouched] = useState(false)
  const [modelMinutes, setModelMinutes] = useState(MODEL_MINUTES)
  const [exam, setExam] = useState(null) // { questions, startedAt, limit, title }
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    listSubjects().then(setSubjects, (e) => setError(e.message))
  }, [])

  const toggle = (id) => setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))

  function changeQuantity(value) {
    setQuantity(value)
    if (!minutesTouched) setMinutes(Math.max(1, Math.round(Number(value) || 1) * MINUTES_PER_QUESTION))
  }

  async function start(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'modelo') return await startModel()
      const n = Math.min(200, Math.max(1, Math.round(Number(quantity))))
      const list = await fetchRandomQuestions(selected, n)
      if (!list.length) setError('Nenhuma questão encontrada para essa seleção. Cadastre ou importe questões primeiro.')
      else
        setExam({
          questions: list,
          startedAt: new Date(),
          limit: Math.max(1, Math.round(Number(minutes))) * 60,
          title: `Simulado de ${list.length} questões`,
        })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Monta a prova na proporção do edital: sorteia por matéria, na ordem da prova.
  async function startModel() {
    const byName = new Map(subjects.map((s) => [norm(s.name), s]))
    const questions = []
    const shortages = []
    for (const item of PLANO_SIMULADO) {
      const subject = byName.get(norm(item.materia))
      const got = subject ? await fetchRandomQuestions([subject.id], item.quantidade) : []
      questions.push(...got)
      if (got.length < item.quantidade) shortages.push(`${item.materia} (${got.length} de ${item.quantidade})`)
    }
    if (!questions.length) return setError('Seu banco não tem questões para montar o simulado. Cadastre ou importe questões primeiro.')
    if (
      shortages.length &&
      !window.confirm(
        `Seu banco não tem questões suficientes em: ${shortages.join(', ')}.\n\nIniciar mesmo assim, com ${questions.length} questões?`,
      )
    )
      return
    setExam({
      questions,
      startedAt: new Date(),
      limit: Math.max(1, Math.round(Number(modelMinutes))) * 60,
      title: `Simulado modelo TJSP (${questions.length} questões)`,
    })
  }

  // Corrige no fim: registra cada resposta (alimenta o caderno de erros e a revisão) e salva o simulado.
  async function finish({ selections, usedSeconds }) {
    const { questions, startedAt, limit, title } = exam
    const answered = questions.filter((q) => selections[q.id])
    const results = new Map()
    const CHUNK = 8
    for (let i = 0; i < answered.length; i += CHUNK) {
      await Promise.all(
        answered.slice(i, i + CHUNK).map(async (q) => {
          results.set(q.id, await submitAnswer(q.id, selections[q.id], 'exam'))
        }),
      )
    }
    const items = questions.map((q) => ({ q: q.id, sel: selections[q.id] ?? null, ok: results.get(q.id)?.is_correct ?? false }))
    let id
    try {
      id = await saveExam({
        title,
        started_at: startedAt.toISOString(),
        finished_at: new Date().toISOString(),
        time_limit_seconds: limit,
        time_used_seconds: Math.min(usedSeconds, limit),
        total: questions.length,
        correct: items.filter((i) => i.ok).length,
        items,
      })
    } catch (err) {
      throw new Error(isMissingSchema(err) ? MIGRATION_HINT : err.message)
    }
    navigate(`/simulados/${id}`)
  }

  if (exam) {
    return (
      <section>
        <header className="page-header">
          <h1>Simulado</h1>
        </header>
        <QuizRunner
          questions={exam.questions}
          mode="exam"
          timeLimitSeconds={exam.limit}
          subjectNames={Object.fromEntries(subjects.map((s) => [s.id, s.name]))}
          onFinishExam={finish}
          onExit={() => {
            if (window.confirm('Encerrar o simulado agora? Suas marcações serão perdidas.')) setExam(null)
          }}
        />
      </section>
    )
  }

  return (
    <section>
      <header className="page-header">
        <div>
          <p className="eyebrow">Simulado</p>
          <h1>Novo Simulado</h1>
        </div>
        <Link className="btn" to="/simulados">
          Simulados realizados
        </Link>
      </header>

      <div className={styles.modes} role="tablist">
        <button type="button" role="tab" aria-selected={mode === 'modelo'} data-on={mode === 'modelo'} onClick={() => setMode('modelo')}>
          <b>Modelo do edital</b>
          <span>{PROVA.questoes} questões, na proporção da prova</span>
        </button>
        <button type="button" role="tab" aria-selected={mode === 'custom'} data-on={mode === 'custom'} onClick={() => setMode('custom')}>
          <b>Personalizado</b>
          <span>Você escolhe matérias e quantidade</span>
        </button>
      </div>

      <form className="card stack" onSubmit={start}>
        <p className="muted" style={{ margin: 0 }}>
          Como na prova: você marca as respostas e só vê o resultado no fim. As questões que errar vão para o caderno de erros e para a
          revisão.
        </p>

        {mode === 'modelo' ? (
          <>
            <div className="table-wrap">
              <table className="simple">
                <thead>
                  <tr>
                    <th>Bloco</th>
                    <th>Matéria</th>
                    <th style={{ textAlign: 'right' }}>Questões</th>
                  </tr>
                </thead>
                <tbody>
                  {PLANO_SIMULADO.map((p) => (
                    <tr key={p.materia}>
                      <td>{p.bloco}</td>
                      <td>
                        <span className="badge" style={{ '--tag': subjectColor(p.materia) }}>
                          {p.materia}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>{p.quantidade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>
              O edital define o total de cada bloco (Português 16, Direito 30, Conhecimentos Gerais 24). A divisão do Direito por matéria é
              uma estimativa. Se o seu banco tiver menos questões de alguma matéria, o app avisa antes de começar.
            </p>
            <label>
              Tempo (minutos)
              <input type="number" min={1} max={600} value={modelMinutes} onChange={(e) => setModelMinutes(e.target.value)} required />
            </label>
            <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>
              Sugestão: {MODEL_MINUTES} minutos (3 por questão), deixando o restante das 5 horas da prova para a redação.
            </p>
          </>
        ) : (
          <>
            <fieldset className="stack" style={{ border: 'none', padding: 0, margin: 0 }}>
              <legend className="section-title">Matérias (nenhuma marcada = todas)</legend>
              <div className="chips">
                {subjects.map((s) => (
                  <label key={s.id} className="chip" data-on={selected.includes(s.id)} style={tagStyle(s.name)}>
                    <input type="checkbox" checked={selected.includes(s.id)} onChange={() => toggle(s.id)} />
                    {s.name}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="row" style={{ alignItems: 'flex-end' }}>
              <label className="grow">
                Quantidade de questões
                <input type="number" min={1} max={200} value={quantity} onChange={(e) => changeQuantity(e.target.value)} required />
              </label>
              <label className="grow">
                Tempo (minutos)
                <input
                  type="number"
                  min={1}
                  max={600}
                  value={minutes}
                  onChange={(e) => {
                    setMinutes(e.target.value)
                    setMinutesTouched(true)
                  }}
                  required
                />
              </label>
            </div>
          </>
        )}

        {error && <p className="alert alert-error">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Sorteando…' : 'Iniciar simulado'}
        </button>
      </form>
    </section>
  )
}
