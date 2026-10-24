import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import Heatmap from '../components/Heatmap'
import Icon from '../components/Icon'
import StatBar from '../components/StatBar'
import { PROVA } from '../data/edital'
import { addDays, daysBetween, formatBR, formatShort, heatmapRange, mondayOf, todayISO } from '../lib/dates'
import { countDueReviews } from '../services/answers'
import { listExams } from '../services/exams'
import { countWrongQuestions } from '../services/questions'
import { DEFAULT_WEEKLY_GOAL, getWeeklyGoal } from '../services/settings'
import { getDailyActivity, getSubjectStats, percent, weakestSubjects } from '../services/stats'
import styles from './Dashboard.module.css'

const DAY_LABELS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom']

// Dias seguidos com pelo menos uma questão. Se hoje ainda não teve, a sequência
// não quebra: ela conta a partir de ontem.
function currentStreak(activity) {
  const days = new Set(activity.map((a) => a.day))
  let day = todayISO()
  if (!days.has(day)) day = addDays(day, -1)
  let streak = 0
  while (days.has(day)) {
    streak++
    day = addDays(day, -1)
  }
  return streak
}

const dateLabel = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'America/Sao_Paulo',
}).format(new Date())
const dateText = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const { start, end } = heatmapRange()
    // Itens opcionais dependem da migration 0002: se faltarem, a tela continua funcionando.
    const optional = (p, fallback) => p.catch(() => fallback)
    Promise.all([
      getDailyActivity(start, end),
      countDueReviews(),
      getSubjectStats(),
      optional(getWeeklyGoal(), DEFAULT_WEEKLY_GOAL),
      optional(countWrongQuestions(), null),
      optional(listExams(1), []),
    ]).then(
      ([activity, due, stats, goal, wrong, exams]) => setData({ activity, due, stats, goal, wrong, exam: exams[0] ?? null }),
      (e) => setError(e.message),
    )
  }, [])

  if (error) return <p className="alert alert-error">{error}</p>
  if (!data) return <p className="muted">Carregando…</p>

  const { activity, due, stats, goal, wrong, exam } = data
  const today = todayISO()
  const monday = mondayOf(today)
  const byDay = new Map(activity.map((a) => [a.day, a.total]))
  const week = DAY_LABELS.map((label, i) => {
    const iso = addDays(monday, i)
    return { label, iso, total: byDay.get(iso) ?? 0, future: iso > today, isToday: iso === today }
  })
  const daysToExam = daysBetween(today, PROVA.data)
  const daysToSignup = daysBetween(today, PROVA.inscricoesFim)
  const weekTotal = week.reduce((s, d) => s + d.total, 0)
  const weekPct = Math.min(100, Math.round((weekTotal / goal) * 100))
  const yearTotal = activity.reduce((sum, a) => sum + a.total, 0)
  const streak = currentStreak(activity)
  const todayCount = byDay.get(today) ?? 0
  const totals = stats.reduce((t, s) => ({ total: t.total + s.total, correct: t.correct + s.correct }), {
    total: 0,
    correct: 0,
  })
  const weak = weakestSubjects(stats)

  return (
    <section>
      <header className="page-header">
        <div>
          <p className="eyebrow">{dateText}</p>
          <h1>Bem-vindo de volta</h1>
        </div>
      </header>

      <div className={styles.banner}>
        <div className={styles.bannerText}>
          <h2>
            {due > 0 ? (
              <>
                Você tem <b>{due}</b> {due === 1 ? 'questão' : 'questões'} para revisar hoje
              </>
            ) : (
              <>
                Revisão em dia. <b>Hora de resolver novas questões</b>
              </>
            )}
          </h2>
          <p>
            {due > 0
              ? 'São questões que você errou e que vencem hoje ou antes. Revisar no dia certo é o que fixa.'
              : 'Nada vence hoje. Resolva uma sessão para manter a sequência de estudo.'}
          </p>
          <Link className="btn btn-primary" to={due > 0 ? '/revisao' : '/resolver'}>
            {due > 0 ? 'Revisar agora' : 'Resolver questões'} <Icon name="arrowRight" size={20} />
          </Link>
        </div>

        <div className={styles.bannerPanel} aria-label="Dias de estudo desta semana">
          <p className={styles.panelTitle}>Sua semana</p>
          <div className={styles.week}>
            {week.map((d) => (
              <div key={d.iso} className={styles.day} data-on={d.total > 0} data-today={d.isToday} data-future={d.future}>
                <span>{d.label}</span>
                <i>{d.total > 0 ? <Icon name="check" size={16} /> : ''}</i>
              </div>
            ))}
          </div>
          <p className={styles.countdown}>
            <b>Prova em {formatBR(PROVA.data)}</b>
            {daysToExam > 0 ? ` · faltam ${daysToExam} ${daysToExam === 1 ? 'dia' : 'dias'}` : ''}
            {daysToSignup >= 0 ? ` · inscrições até ${formatBR(PROVA.inscricoesFim)}` : ''}
          </p>
          <p className={styles.panelNote}>
            {streak > 0 ? `${streak} ${streak === 1 ? 'dia seguido' : 'dias seguidos'} estudando` : 'Estude hoje para iniciar uma sequência'}
          </p>
        </div>
      </div>

      <div className="grid-2 section">
        <div className="card">
          <div className={styles.cardHead}>
            <h3 className="card-title">Meta da semana</h3>
            <span className="pill">
              {formatShort(monday)} – {formatShort(addDays(monday, 6))}
            </span>
          </div>
          <p className="big-number">
            {weekTotal} <span className={styles.of}>/ {goal} questões</span>
          </p>
          <div className="meter" role="progressbar" aria-valuenow={weekPct} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso da meta semanal">
            <i style={{ width: `${weekPct}%` }} />
          </div>
          <p className="muted" style={{ margin: 'var(--space-2) 0 var(--space-3)' }}>
            {weekPct >= 100 ? 'Meta batida! Continue assim.' : `${weekPct}% da meta · faltam ${goal - weekTotal} questões`}
          </p>
          <Link className="btn btn-sm" to="/cronograma">
            Ver cronograma
          </Link>
        </div>

        <div className="card">
          <h3 className="card-title">Seu caderno de erros</h3>
          {wrong === null ? (
            <p className="muted">Disponível depois da migration 0002 (veja o README).</p>
          ) : (
            <>
              <p className="big-number">{wrong}</p>
              <p className="muted" style={{ margin: 'var(--space-1) 0 var(--space-3)' }}>
                {wrong === 1 ? 'questão em que você errou da última vez' : 'questões em que você errou da última vez'}
              </p>
              <Link className="btn btn-sm" to="/caderno">
                Abrir caderno
              </Link>
            </>
          )}
          {exam && (
            <p className={styles.lastExam}>
              Último simulado: <b>{percent(exam.correct, exam.total)}%</b> ({exam.correct}/{exam.total}) ·{' '}
              <Link to={`/simulados/${exam.id}`}>ver resultado</Link>
            </p>
          )}
        </div>
      </div>

      <div className="tiles section">
        <div className="tile" data-tone="yellow">
          <p className="big-number">{todayCount}</p>
          <span className="muted">{todayCount === 1 ? 'questão hoje' : 'questões hoje'}</span>
        </div>
        <div className="tile" data-tone="pink">
          <p className="big-number">{streak}</p>
          <span className="muted">{streak === 1 ? 'dia seguido' : 'dias seguidos'}</span>
        </div>
        <div className="tile" data-tone="teal">
          <p className="big-number">{totals.total ? `${percent(totals.correct, totals.total)}%` : '–'}</p>
          <span className="muted">de acerto</span>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">
          {yearTotal} {yearTotal === 1 ? 'questão' : 'questões'} no último ano
        </h2>
        <div className="card">
          <Heatmap activity={activity} />
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Matérias para reforçar</h2>
        <div className="card">
          {weak.length === 0 ? (
            <p className="muted" style={{ margin: 0 }}>
              Aparece aqui depois de 10 respostas em uma matéria.
            </p>
          ) : (
            weak.map((s) => (
              <StatBar key={s.subject_id} label={s.name} correct={s.correct} total={s.total} highlight />
            ))
          )}
        </div>
        <p style={{ margin: 'var(--space-3) 0 0' }}>
          <Link to="/desempenho">Ver desempenho completo</Link>
        </p>
      </div>
    </section>
  )
}
