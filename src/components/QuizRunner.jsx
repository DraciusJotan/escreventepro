import { useEffect, useState } from 'react'
import { submitAnswer } from '../services/answers'
import { LETTERS, optionOf } from '../services/questions'
import { formatBR } from '../lib/dates'
import styles from './QuizRunner.module.css'

// Resolve uma lista de questões, uma por vez, com feedback imediato.
// mode: 'practice' | 'review'. O servidor confere o gabarito (submit_answer).
// Atalhos: A–E escolhe a alternativa, Enter responde / avança.
export default function QuizRunner({ questions, mode, onExit, exitLabel = 'Voltar', subjectNames = {} }) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [score, setScore] = useState({ correct: 0, total: 0 })

  const question = questions[index]

  async function confirm() {
    if (!question || !selected || busy || result) return
    setBusy(true)
    setError('')
    try {
      const res = await submitAnswer(question.id, selected, mode)
      setResult(res)
      setScore((s) => ({ correct: s.correct + (res.is_correct ? 1 : 0), total: s.total + 1 }))
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  function next() {
    setIndex((i) => i + 1)
    setSelected(null)
    setResult(null)
    setError('')
  }

  useEffect(() => {
    function onKey(e) {
      if (!question || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.target.closest?.('input, textarea, select')) return
      const key = e.key.toUpperCase()
      if (!result && !busy && LETTERS.includes(key)) {
        setSelected(key)
      } else if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') {
        if (result) next()
        else confirm()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!question) {
    const pct = score.total ? Math.round((score.correct / score.total) * 100) : 0
    return (
      <div className={styles.summary}>
        <p className="eyebrow">Sessão concluída</p>
        <p className={styles.summaryPct}>{pct}%</p>
        <p className="muted">
          {score.correct} de {score.total} {score.total === 1 ? 'questão correta' : 'questões corretas'}
        </p>
        <button type="button" className="btn btn-primary" onClick={onExit}>
          {exitLabel}
        </button>
      </div>
    )
  }

  function stateOf(letter) {
    if (!result) return letter === selected ? 'selected' : ''
    if (letter === result.correct_option) return 'correct'
    if (letter === selected) return 'wrong'
    return 'dim'
  }

  const isLast = index === questions.length - 1
  const subject = subjectNames[question.subject_id]

  return (
    <div className={styles.quiz}>
      <div className={styles.progress}>
        <div className={styles.progressText}>
          <span>
            Questão <strong>{index + 1}</strong> de {questions.length}
          </span>
          <span className="muted">
            {score.correct}/{score.total} certas
          </span>
        </div>
        <div className={styles.track}>
          <div className={styles.bar} style={{ width: `${(index / questions.length) * 100}%` }} />
        </div>
      </div>

      <article className={styles.paper}>
        <p className={styles.meta}>
          {[subject, question.topic, question.source].filter(Boolean).join('  ·  ')}
        </p>
        <p className={styles.statement}>{question.statement}</p>

        <div className={styles.options} role="radiogroup" aria-label="Alternativas">
          {LETTERS.map((letter) => (
            <button
              key={letter}
              type="button"
              role="radio"
              aria-checked={selected === letter}
              className={styles.option}
              data-state={stateOf(letter)}
              disabled={!!result || busy}
              onClick={() => setSelected(letter)}
            >
              <span className={styles.letter}>{letter}</span>
              <span className={styles.optionText}>{optionOf(question, letter)}</span>
            </button>
          ))}
        </div>

        {result && (
          <div className={styles.feedback} data-ok={result.is_correct} role="status">
            <strong>{result.is_correct ? 'Resposta correta.' : `Resposta incorreta. Gabarito: ${result.correct_option}.`}</strong>
            {result.next_due && (
              <span>
                {result.is_correct ? 'Próxima revisão' : 'Volta para revisão'} em {formatBR(result.next_due)}.
              </span>
            )}
          </div>
        )}
        {error && <p className="alert alert-error">{error}</p>}
      </article>

      <div className={styles.footer}>
        <button type="button" className="btn" onClick={onExit}>
          Encerrar
        </button>
        {result ? (
          <button type="button" className="btn btn-primary" onClick={next}>
            {isLast ? 'Ver resultado' : 'Próxima questão'}
          </button>
        ) : (
          <button type="button" className="btn btn-primary" disabled={!selected || busy} onClick={confirm}>
            {busy ? 'Enviando…' : 'Responder'}
          </button>
        )}
      </div>
      <p className={styles.hint}>Atalhos: teclas A–E escolhem, Enter confirma.</p>
    </div>
  )
}
