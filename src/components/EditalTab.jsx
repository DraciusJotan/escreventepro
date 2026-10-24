import { useMemo } from 'react'
import { BLOCOS, EDITAL, PROVA, TODOS_TOPICOS } from '../data/edital'
import { daysBetween, formatBR, todayISO } from '../lib/dates'
import { subjectColor } from '../lib/subjectColor'
import styles from './EditalTab.module.css'

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`

// Checklist do conteúdo programático do edital: o que você já estudou e quais assuntos têm aula.
export default function EditalTab({ lessons, done, onToggle, onOpenLessons }) {
  const today = todayISO()
  const daysToExam = daysBetween(today, PROVA.data)
  const daysToSignup = daysBetween(today, PROVA.inscricoesFim)

  // aulas por assunto do edital
  const byTopic = useMemo(() => {
    const map = new Map()
    for (const l of lessons) {
      if (!l.edital_key) continue
      const cur = map.get(l.edital_key) ?? { total: 0, watched: 0 }
      cur.total++
      if (l.watched) cur.watched++
      map.set(l.edital_key, cur)
    }
    return map
  }, [lessons])

  const doneCount = TODOS_TOPICOS.filter((t) => done.has(t.key)).length
  const withLessons = TODOS_TOPICOS.filter((t) => byTopic.has(t.key)).length
  const pct = Math.round((doneCount / TODOS_TOPICOS.length) * 100)
  const topicosPorMateria = new Map(EDITAL.map((m) => [m.materia, m.topicos]))

  return (
    <div>
      <div className={`card ${styles.exam}`}>
        <div>
          <p className="eyebrow">{PROVA.edital} · {PROVA.banca}</p>
          <h2 className={styles.examTitle}>
            {PROVA.cargo} · {PROVA.orgao}
          </h2>
          <p className="muted" style={{ margin: 0 }}>
            Prova objetiva e redação em <b>{formatBR(PROVA.data)}</b>
            {daysToExam > 0 && <> · faltam <b>{plural(daysToExam, 'dia', 'dias')}</b></>}
            {daysToSignup >= 0 && <> · inscrições até <b>{formatBR(PROVA.inscricoesFim)}</b> ({daysToSignup === 0 ? 'último dia' : `faltam ${plural(daysToSignup, 'dia', 'dias')}`})</>}
          </p>
        </div>
        <ul className={styles.rules}>
          <li>
            <b>{PROVA.questoes} questões</b>: Português 16, Direito 30, Conhecimentos Gerais 24.
          </li>
          <li>
            <b>Português e Direito eliminam</b>: mínimo de 50% em cada bloco, e nota final mínima 5 (de 0 a 10).
          </li>
          <li>
            <b>Redação eliminatória</b> (0 a {PROVA.redacao.maximo}, mínimo {PROVA.redacao.minimo}), no mesmo dia.
          </li>
        </ul>
      </div>

      <div className={styles.summary}>
        <div>
          <p className="big-number">{doneCount}/{TODOS_TOPICOS.length}</p>
          <span className="muted">assuntos estudados ({pct}%)</span>
          <div className="meter" style={{ marginTop: 'var(--space-2)' }} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso no edital">
            <i style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div>
          <p className="big-number">{withLessons}/{TODOS_TOPICOS.length}</p>
          <span className="muted">assuntos com aula na sua lista</span>
        </div>
      </div>

      <p className={styles.source}>
        Conteúdo conforme resumos do {PROVA.edital}. Os artigos indicados vêm do resumo do edital anterior, que tem a mesma estrutura: confira no
        Anexo VIII do edital oficial, no site da VUNESP, antes de estudar em cima deles.
      </p>

      {BLOCOS.map((bloco) => (
        <section key={bloco.id} className="section">
          <h2 className={styles.blockTitle}>
            Bloco {bloco.id} · {bloco.nome}
            <span className={styles.blockMeta} data-eliminatorio={bloco.eliminatorio}>
              {Object.values(bloco.materias).reduce((a, b) => a + b, 0)} questões · {bloco.eliminatorio ? 'eliminatório' : 'classificatório'}
            </span>
          </h2>

          {Object.entries(bloco.materias).map(([materia, questoes]) => {
            const topicos = topicosPorMateria.get(materia) ?? []
            const feitos = topicos.filter((t) => done.has(t.key)).length
            return (
              <div key={materia} className={styles.subject} style={{ '--tag': subjectColor(materia) }}>
                <h3 className={styles.subjectTitle}>
                  <span className="badge">{materia}</span>
                  <span className="muted">
                    {bloco.id === 'II' ? '' : `${plural(questoes, 'questão', 'questões')} · `}
                    {feitos}/{topicos.length} estudados
                  </span>
                </h3>
                <ul className={styles.topics}>
                  {topicos.map((t) => {
                    const info = byTopic.get(t.key)
                    return (
                      <li key={t.key} className={styles.topic} data-done={done.has(t.key)}>
                        <label className={styles.check}>
                          <input type="checkbox" checked={done.has(t.key)} onChange={() => onToggle(t.key, !done.has(t.key))} />
                          <span>
                            <span className={styles.topicTitle}>{t.title}</span>
                            {t.detail && <span className={styles.detail}>{t.detail}</span>}
                          </span>
                        </label>
                        {info ? (
                          <button type="button" className="btn btn-sm" onClick={() => onOpenLessons(t.key)}>
                            {plural(info.total, 'aula', 'aulas')}
                            {info.watched > 0 && ` · ${info.watched} vista${info.watched === 1 ? '' : 's'}`}
                          </button>
                        ) : (
                          <span className={styles.noLesson}>sem aula</span>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </section>
      ))}
    </div>
  )
}
