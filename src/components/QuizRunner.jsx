import { useState } from 'react'
import { submitAnswer } from '../services/answers'
import { LETTERS, optionOf } from '../services/questions'
import { formatBR } from '../lib/dates'
import styles from './QuizRunner.module.css'

// Resolve uma lista de questões, uma por vez, com feedback imediato.
// mode: 'practice' | 'review'. O servidor confere o gabarito (submit_answer).
export default function QuizRunner({ questions, mode, onExit, exitLabel = 'Voltar' }) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [score, setScore] = useState({ correct: 0, total: 0 })

  const question = questions[index]

  if (!question) {
    const pct = score.total ? Math.round((score.correct / score.total) * 100) : 0
    return (
      <div className="card stack" style={{ textAlign: 'center' }}>
        <h2 style={{ margin: 0 }}>Sessão concluída</h2>
        <p className="big-number">{pct}%</p>
        <p className="muted">
          {score.correct} de {score.total} corretas
        </p>
        <button type="button" className="btn btn-primary" onClick={onExit}>
          {exitLabel}
        </button>
      </div>
    )
  }

  async function confirm() {
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

  function stateOf(letter) {
    if (!result) return letter === selected ? 'selected' : ''
    if (letter === result.correct_option) return 'correct'
    if (letter === selected) return 'wrong'
    return ''
  }

  const isLast = index === questions.length - 1

  return (
    <div className="stack">
      <div className={styles.progress}>
        <span>
          Questão {index + 1} de {questions.length}
        </span>
        <span className="muted">
          {score.correct}/{score.total} certas
        </span>
      </div>

      <div className="card stack">
        <div className="row">
          {question.topic && <span className="badge">{question.topic}</span>}
          {question.source && <span className="muted">{question.source}</span>}
        </div>
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
              <span>{optionOf(question, letter)}</span>
            </button>
          ))}
        </div>

        {result && (
          <div className={`alert ${result.is_correct ? styles.ok : 'alert-error'}`} role="status">
            <strong>
              {result.is_correct ? 'Acertou!' : `Errou. Gabarito: ${result.correct_option}.`}
            </strong>
            {result.next_due && (
              <div>
                {result.is_correct ? 'Próxima revisão' : 'Volta para revisão'} em{' '}
                {formatBR(result.next_due)}.
              </div>
            )}
          </div>
        )}
        {error && <p className="alert alert-error">{error}</p>}

        {result ? (
          <button type="button" className="btn btn-primary" onClick={next}>
            {isLast ? 'Ver resultado' : 'Próxima'}
          </button>
        ) : (
          <button type="button" className="btn btn-primary" disabled={!selected || busy} onClick={confirm}>
            {busy ? 'Enviando…' : 'Responder'}
          </button>
        )}
      </div>

      <button type="button" className="btn btn-sm" onClick={onExit} style={{ alignSelf: 'flex-start' }}>
        Encerrar sessão
      </button>
    </div>
  )
}
