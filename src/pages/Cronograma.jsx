import { useEffect, useState } from 'react'
import { addDays, formatShort, mondayOf, todayISO } from '../lib/dates'
import { isMissingSchema, MIGRATION_HINT } from '../services/questions'
import { DEFAULT_WEEKLY_GOAL, getWeeklyGoal, setWeeklyGoal } from '../services/settings'
import { getDailyActivity } from '../services/stats'
import styles from './Cronograma.module.css'

const WEEKS = 6
const DAY_LABELS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']

export default function Cronograma() {
  const today = todayISO()
  const thisMonday = mondayOf(today)
  const firstMonday = addDays(thisMonday, -7 * (WEEKS - 1))

  const [goal, setGoal] = useState(DEFAULT_WEEKLY_GOAL)
  const [goalInput, setGoalInput] = useState(String(DEFAULT_WEEKLY_GOAL))
  const [activity, setActivity] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getDailyActivity(firstMonday, today).then(setActivity, (e) => setError(e.message))
    getWeeklyGoal().then(
      (g) => {
        setGoal(g)
        setGoalInput(String(g))
      },
      (e) => isMissingSchema(e) && setError(MIGRATION_HINT),
    )
  }, [firstMonday, today])

  async function save(e) {
    e.preventDefault()
    const value = Math.round(Number(goalInput))
    if (!(value >= 1 && value <= 5000)) return setError('Use uma meta entre 1 e 5000 questões por semana.')
    setSaving(true)
    setError('')
    try {
      await setWeeklyGoal(value)
      setGoal(value)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(isMissingSchema(err) ? MIGRATION_HINT : err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!activity) return <section>{error ? <p className="alert alert-error">{error}</p> : <p className="muted">Carregando…</p>}</section>

  const byDay = new Map(activity.map((a) => [a.day, a.total]))
  const weeks = Array.from({ length: WEEKS }, (_, w) => {
    const monday = addDays(thisMonday, -7 * w) // w = 0 é a semana atual
    const days = DAY_LABELS.map((label, i) => {
      const iso = addDays(monday, i)
      return { label, iso, total: byDay.get(iso) ?? 0, future: iso > today }
    })
    const total = days.reduce((s, d) => s + d.total, 0)
    return { monday, days, total, pct: Math.min(100, Math.round((total / goal) * 100)), current: w === 0 }
  })
  const maxDay = Math.max(1, ...weeks.flatMap((w) => w.days.map((d) => d.total)))
  const perDay = Math.ceil(goal / 7)

  return (
    <section>
      <header className="page-header">
        <div>
          <p className="eyebrow">Planejamento</p>
          <h1>Cronograma de estudos</h1>
        </div>
      </header>

      {error && <p className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>{error}</p>}

      <form className={`card ${styles.goal}`} onSubmit={save}>
        <div>
          <h2 className="card-title">Sua meta semanal</h2>
          <p className="muted" style={{ margin: 0 }}>
            Quantas questões você quer resolver por semana? São cerca de <b>{perDay}</b> por dia.
          </p>
        </div>
        <div className={styles.goalForm}>
          <input
            type="number"
            min={1}
            max={5000}
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            aria-label="Meta semanal de questões"
          />
          <button type="submit" className="btn btn-blue" disabled={saving}>
            {saving ? 'Salvando…' : saved ? 'Salvo!' : 'Salvar meta'}
          </button>
        </div>
      </form>

      <h2 className="section-title">Semanas</h2>
      <div className={styles.grid}>
        {weeks.map((w) => {
          const over = !w.current && w.pct < 100
          return (
            <article key={w.monday} className={styles.week} data-current={w.current}>
              <header className={styles.head}>
                <h3>
                  {formatShort(w.monday)} – {formatShort(addDays(w.monday, 6))}
                </h3>
                {w.current ? <span className="pill">Atual</span> : over ? <span className="pill pill-muted">Abaixo da meta</span> : <span className="pill">Meta batida</span>}
              </header>
              <div className={styles.numbers}>
                <b>{w.pct}%</b>
                <span className="muted">
                  {w.total} de {goal} questões
                </span>
              </div>
              <div className="meter" role="progressbar" aria-valuenow={w.pct} aria-valuemin={0} aria-valuemax={100}>
                <i style={{ width: `${w.pct}%`, background: w.pct >= 100 ? 'var(--success)' : undefined }} />
              </div>
              <div className={styles.bars} aria-hidden="true">
                {w.days.map((d) => (
                  <div key={d.iso} className={styles.col} data-future={d.future} title={`${formatShort(d.iso)}: ${d.total}`}>
                    <span className={styles.bar}>
                      <i style={{ height: `${Math.round((d.total / maxDay) * 100)}%` }} />
                    </span>
                    <small>{d.label}</small>
                  </div>
                ))}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
