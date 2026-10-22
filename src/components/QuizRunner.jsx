import { useEffect, useRef, useState } from 'react'
import { submitAnswer } from '../services/answers'
import { LETTERS, optionOf } from '../services/questions'
import { formatDuration } from '../services/exams'
import { formatBR } from '../lib/dates'
import { subjectColor } from '../lib/subjectColor'
import Icon from './Icon'
import styles from './QuizRunner.module.css'

const BLOCK = 10

// Resolve uma lista de questões com navegação livre (Anterior/Próxima) e grade de gabarito.
//  mode 'practice' | 'review': responde e vê o resultado na hora (o servidor confere o gabarito).
//  mode 'exam': simulado. Só marca; nada é corrigido até finalizar (ou acabar o tempo).
// Atalhos: A–E escolhe, Enter responde/avança, ← → navegam.
export default function QuizRunner({
  questions,
  mode,
  onExit,
  exitLabel = 'Voltar',
  subjectNames = {},
  timeLimitSeconds,
  onFinishExam,
  initialIndex = 0,
}) {
  const isExam = mode === 'exam'
  const [index, setIndex] = useState(() => Math.min(Math.max(initialIndex, 0), Math.max(questions.length - 1, 0)))
  const [answers, setAnswers] = useState({}) // id -> { selected, result }
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [remaining, setRemaining] = useState(timeLimitSeconds ?? 0)
  const startedAt = useRef(Date.now())
  const finishing = useRef(false)

  const question = questions[index]
  const current = question ? answers[question.id] : null
  const result = current?.result ?? null
  const selected = current?.selected ?? null
  const answeredCount = questions.filter((q) => answers[q.id]?.result).length
  const markedCount = questions.filter((q) => answers[q.id]?.selected).length
  const correctCount = questions.filter((q) => answers[q.id]?.result?.is_correct).length

  function select(letter) {
    if (!question || result || busy) return
    setAnswers((a) => ({ ...a, [question.id]: { selected: letter, result: null } }))
  }

  async function confirm() {
    if (!question || !selected || busy || result || isExam) return
    setBusy(true)
    setError('')
    try {
      const res = await submitAnswer(question.id, selected, mode)
      setAnswers((a) => ({ ...a, [question.id]: { selected, result: res } }))
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const go = (i) => {
    setIndex(Math.min(Math.max(i, 0), questions.length - 1))
    setError('')
  }

  async function finishExam({ auto = false } = {}) {
    if (finishing.current) return
    const blank = questions.length - markedCount
    if (!auto && blank > 0 && !window.confirm(`Você deixou ${blank} ${blank === 1 ? 'questão' : 'questões'} em branco. Finalizar mesmo assim?`)) return
    finishing.current = true
    setBusy(true)
    setError('')
    const selections = Object.fromEntries(questions.filter((q) => answers[q.id]?.selected).map((q) => [q.id, answers[q.id].selected]))
    try {
      await onFinishExam({ selections, usedSeconds: Math.round((Date.now() - startedAt.current) / 1000) })
    } catch (e) {
      finishing.current = false
      setBusy(false)
      setError(e.message)
    }
  }

  // cronômetro do simulado
  useEffect(() => {
    if (!isExam || !timeLimitSeconds) return
    const tick = setInterval(() => {
      const left = timeLimitSeconds - Math.round((Date.now() - startedAt.current) / 1000)
      setRemaining(Math.max(0, left))
      if (left <= 0) {
        clearInterval(tick)
        finishExam({ auto: true })
      }
    }, 1000)
    return () => clearInterval(tick)
  })

  useEffect(() => {
    function onKey(e) {
      if (!question || done || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.target.closest?.('input, textarea, select')) return
      const key = e.key.toUpperCase()
      if (LETTERS.includes(key)) select(key)
      else if (e.key === 'ArrowRight') go(index + 1)
      else if (e.key === 'ArrowLeft') go(index - 1)
      else if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') {
        if (isExam) return
        if (result) index < questions.length - 1 ? go(index + 1) : setDone(true)
        else confirm()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  function chipState(q, i) {
    const a = answers[q.id]
    if (a?.result) return a.result.is_correct ? 'ok' : 'no'
    if (a?.selected) return 'marked'
    return i === index ? 'now' : 'todo'
  }

  const grid = (
    <div className={styles.gabarito}>
      <p className={styles.gabaritoTitle}>Gabarito de questões</p>
      {Array.from({ length: Math.ceil(questions.length / BLOCK) }, (_, b) => (
        <div key={b} className={styles.block}>
          <span className={styles.blockLabel}>Bloco {b + 1}</span>
          <div className={styles.chips}>
            {questions.slice(b * BLOCK, b * BLOCK + BLOCK).map((q, k) => {
              const i = b * BLOCK + k
              const a = answers[q.id]
              return (
                <button
                  key={q.id}
                  type="button"
                  className={styles.chipBtn}
                  data-state={chipState(q, i)}
                  data-current={i === index}
                  onClick={() => {
                    setDone(false)
                    go(i)
                  }}
                  aria-label={`Questão ${i + 1}`}
                >
                  {i + 1}
                  {a?.selected ? `\\${a.selected}` : ''}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )

  if (done) {
    const pct = answeredCount ? Math.round((correctCount / answeredCount) * 100) : 0
    return (
      <div className={styles.quiz}>
        <div className={styles.summary}>
          <p className="eyebrow">Sessão concluída</p>
          <p className={styles.summaryPct}>{pct}%</p>
          <p className={styles.summaryText}>
            {correctCount} de {answeredCount} {answeredCount === 1 ? 'questão correta' : 'questões corretas'}
            {answeredCount < questions.length && ` · ${questions.length - answeredCount} sem resposta`}
          </p>
          <div className="actions">
            <button type="button" className="btn btn-primary" onClick={onExit}>
              {exitLabel}
            </button>
            <button type="button" className="btn" onClick={() => setDone(false)}>
              Revisar questões
            </button>
          </div>
        </div>
        {grid}
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
  const low = isExam && timeLimitSeconds && remaining <= 300

  return (
    <div className={styles.quiz}>
      <div className={styles.topcard}>
        <button type="button" className={styles.navBtn} onClick={() => go(index - 1)} disabled={index === 0}>
          <Icon name="chevronLeft" size={18} /> Anterior
        </button>
        <div className={styles.counter}>
          <span>
            Questão <b>{index + 1}</b> de {questions.length}
          </span>
          {isExam && timeLimitSeconds ? (
            <span className={styles.timer} data-low={low} aria-label="Tempo restante">
              <Icon name="timer" size={16} /> {formatDuration(remaining)}
            </span>
          ) : (
            <span className={styles.score}>
              {correctCount} {correctCount === 1 ? 'certa' : 'certas'} · {answeredCount - correctCount}{' '}
              {answeredCount - correctCount === 1 ? 'errada' : 'erradas'}
            </span>
          )}
        </div>
        <button type="button" className={styles.navBtn} onClick={() => go(index + 1)} disabled={isLast}>
          Próxima <Icon name="chevronRight" size={18} />
        </button>
      </div>

      <article className={styles.sheet}>
        {result && (
          <div className={styles.stamp} data-ok={result.is_correct} aria-hidden="true">
            {result.is_correct ? 'Certo' : 'Errado'}
          </div>
        )}

        <p className={styles.meta}>
          {subject && (
            <span className="badge" style={{ '--tag': subjectColor(subject) }}>
              {subject}
            </span>
          )}
          {[question.topic, question.source].filter(Boolean).join('  ·  ')}
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
              onClick={() => select(letter)}
            >
              <span className={styles.letter}>{letter}</span>
              <span className={styles.optionText}>{optionOf(question, letter)}</span>
            </button>
          ))}
        </div>

        {result && (
          <div className={styles.feedback} data-ok={result.is_correct} role="status">
            <strong>{result.is_correct ? 'Resposta correta.' : `Gabarito: ${result.correct_option}.`}</strong>
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
        <button type="button" className="btn" onClick={onExit} disabled={busy && isExam}>
          Encerrar
        </button>
        {isExam ? (
          <button type="button" className="btn btn-primary" disabled={busy} onClick={() => finishExam()}>
            {busy ? 'Corrigindo…' : `Finalizar simulado (${markedCount}/${questions.length})`}
          </button>
        ) : result ? (
          isLast ? (
            <button type="button" className="btn btn-primary" onClick={() => setDone(true)}>
              Ver resultado
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => go(index + 1)}>
              Próxima questão
            </button>
          )
        ) : (
          <button type="button" className="btn btn-primary" disabled={!selected || busy} onClick={confirm}>
            {busy ? 'Enviando…' : 'Responder'}
          </button>
        )}
      </div>

      {grid}
      <p className={styles.hint}>Atalhos: A–E escolhem, Enter confirma, ← → navegam.</p>
    </div>
  )
}
