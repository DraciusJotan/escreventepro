import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import EditalTab from '../components/EditalTab'
import Icon from '../components/Icon'
import { AULAS_SUGERIDAS } from '../data/aulasSugeridas'
import { EDITAL, topicoPorChave } from '../data/edital'
import { subjectColor } from '../lib/subjectColor'
import { canonicalUrl, embedUrl, parseYouTube, thumbnailUrl } from '../lib/youtube'
import { listDoneTopics, setTopicDone } from '../services/edital'
import { addLesson, addLessons, deleteLesson, listLessons, setWatched } from '../services/lessons'
import { MIGRATION_HINT_AULAS, isMissingSchema } from '../services/questions'
import { listSubjects } from '../services/subjects'
import styles from './Aulas.module.css'

const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

// ordem dos assuntos dentro da matéria: visão geral, assuntos na ordem do edital, questões
function topicOrder(lesson) {
  if (lesson.edital_key) {
    const m = EDITAL.find((e) => e.topicos.some((t) => t.key === lesson.edital_key))
    return 10 + (m?.topicos.findIndex((t) => t.key === lesson.edital_key) ?? 0)
  }
  return lesson.topic === 'Questões' || lesson.topic === 'Questões da VUNESP' ? 1000 : 0
}

export default function Aulas() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('aba') === 'edital' ? 'edital' : 'aulas'
  const subjectFilter = params.get('materia') ?? ''
  const topicFilter = params.get('assunto') ?? ''

  const [subjects, setSubjects] = useState([])
  const [lessons, setLessons] = useState(null)
  const [done, setDone] = useState(new Set())
  const [error, setError] = useState('')
  const [playing, setPlaying] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')

  async function reload() {
    try {
      const [subs, list] = await Promise.all([listSubjects(), listLessons()])
      setSubjects(subs)
      setLessons(list)
      setError('')
    } catch (e) {
      setError(isMissingSchema(e) ? MIGRATION_HINT_AULAS : e.message)
    }
    listDoneTopics().then(setDone, () => {})
  }

  useEffect(() => {
    reload()
  }, [])

  const setParam = (changes) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        for (const [k, v] of Object.entries(changes)) (v ? next.set(k, v) : next.delete(k))
        return next
      },
      { replace: true },
    )

  const subjectById = useMemo(() => new Map(subjects.map((s) => [s.id, s])), [subjects])
  const subjectByName = useMemo(() => new Map(subjects.map((s) => [norm(s.name), s])), [subjects])

  const pending = useMemo(() => {
    const have = new Set((lessons ?? []).map((l) => l.url))
    return AULAS_SUGERIDAS.filter((a) => !have.has(a.url) && subjectByName.has(norm(a.subject)))
  }, [lessons, subjectByName])

  async function addSuggested() {
    setBusy(true)
    setNotice('')
    try {
      const rows = pending.map((a) => ({
        subject_id: subjectByName.get(norm(a.subject)).id,
        topic: a.topic,
        edital_key: a.edital,
        title: a.title,
        channel: a.channel,
        url: a.url,
        kind: a.kind,
      }))
      const added = await addLessons(rows)
      setNotice(`${added} ${added === 1 ? 'aula adicionada' : 'aulas adicionadas'}.`)
      await reload()
    } catch (e) {
      setError(isMissingSchema(e) ? MIGRATION_HINT_AULAS : e.message)
    } finally {
      setBusy(false)
    }
  }

  async function toggleWatched(lesson) {
    setLessons((list) => list.map((l) => (l.id === lesson.id ? { ...l, watched: !l.watched } : l)))
    try {
      await setWatched(lesson.id, !lesson.watched)
    } catch (e) {
      setError(e.message)
      reload()
    }
  }

  async function toggleTopic(key, value) {
    setDone((cur) => {
      const next = new Set(cur)
      if (value) next.add(key)
      else next.delete(key)
      return next
    })
    try {
      await setTopicDone(key, value)
    } catch (e) {
      setError(isMissingSchema(e) ? MIGRATION_HINT_AULAS : e.message)
      listDoneTopics().then(setDone, () => {})
    }
  }

  async function remove(lesson) {
    if (!window.confirm(`Remover "${lesson.title}" da sua lista?`)) return
    try {
      await deleteLesson(lesson.id)
      setLessons((list) => list.filter((l) => l.id !== lesson.id))
      if (playing?.id === lesson.id) setPlaying(null)
    } catch (e) {
      setError(e.message)
    }
  }

  const visible = (lessons ?? []).filter(
    (l) => (!subjectFilter || l.subject_id === subjectFilter) && (!topicFilter || l.edital_key === topicFilter),
  )

  const groups = useMemo(() => {
    const bySubject = new Map()
    for (const l of visible) {
      const key = l.subject_id ?? 'none'
      if (!bySubject.has(key)) bySubject.set(key, new Map())
      const topics = bySubject.get(key)
      const topic = l.topic || 'Geral'
      if (!topics.has(topic)) topics.set(topic, { order: topicOrder(l), items: [] })
      topics.get(topic).items.push(l)
    }
    const order = [...subjects.map((s) => s.id), 'none']
    return order
      .filter((k) => bySubject.has(k))
      .map((k) => ({
        key: k,
        subject: subjectById.get(k),
        topics: [...bySubject.get(k)].sort((a, b) => a[1].order - b[1].order),
      }))
  }, [visible, subjects, subjectById])

  const counts = useMemo(() => {
    const c = new Map()
    for (const l of lessons ?? []) {
      const k = l.subject_id ?? 'none'
      const cur = c.get(k) ?? { total: 0, watched: 0 }
      cur.total++
      if (l.watched) cur.watched++
      c.set(k, cur)
    }
    return c
  }, [lessons])

  const totalWatched = (lessons ?? []).filter((l) => l.watched).length
  const topicLabel = topicFilter ? topicoPorChave.get(topicFilter)?.title : ''

  return (
    <section>
      <header className="page-header">
        <div>
          <p className="eyebrow">Estudo</p>
          <h1>Aulas e edital</h1>
        </div>
        {tab === 'aulas' && (
          <div className="actions">
            <button type="button" className="btn btn-blue" onClick={() => setShowForm((v) => !v)}>
              {showForm ? 'Fechar' : '+ Adicionar aula'}
            </button>
          </div>
        )}
      </header>

      <div className={styles.tabs} role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'aulas'} data-on={tab === 'aulas'} onClick={() => setParam({ aba: '' })}>
          Aulas
        </button>
        <button type="button" role="tab" aria-selected={tab === 'edital'} data-on={tab === 'edital'} onClick={() => setParam({ aba: 'edital', assunto: '' })}>
          Edital (checklist)
        </button>
      </div>

      {error && <p className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>{error}</p>}
      {notice && <p className="alert alert-info" style={{ marginBottom: 'var(--space-4)' }}>{notice}</p>}

      {tab === 'edital' && lessons && (
        <EditalTab
          lessons={lessons}
          done={done}
          onToggle={toggleTopic}
          onOpenLessons={(key) => setParam({ aba: '', assunto: key, materia: '' })}
        />
      )}

      {tab === 'aulas' && (
        <>
          <p className={styles.legal}>
            As aulas são vídeos de terceiros no YouTube, incorporados aqui por link: o app não hospeda nem copia vídeos. Muitas foram
            feitas para provas anteriores, então confirme o conteúdo no edital vigente.
          </p>

          {showForm && (
            <LessonForm
              subjects={subjects}
              defaultSubject={subjectFilter}
              onSaved={async () => {
                setShowForm(false)
                await reload()
              }}
            />
          )}

          {lessons && pending.length > 0 && (
            <div className={`card ${styles.suggest}`}>
              <div>
                <h2 className="card-title">Aulas gratuitas sugeridas para o edital</h2>
                <p className="muted" style={{ margin: 0 }}>
                  {pending.length} aulas do YouTube, ligadas aos assuntos do edital. Os links foram verificados (existem e tocam aqui), mas
                  a qualidade e a atualização variam: remova o que não servir.
                </p>
              </div>
              <button type="button" className="btn btn-primary" onClick={addSuggested} disabled={busy}>
                {busy ? 'Adicionando…' : `Adicionar ${pending.length} aulas`}
              </button>
            </div>
          )}

          {topicFilter && (
            <p className={styles.filterNote}>
              Mostrando só o assunto: <b>{topicLabel}</b>{' '}
              <button type="button" onClick={() => setParam({ assunto: '' })}>
                limpar filtro
              </button>
            </p>
          )}

          {lessons && lessons.length > 0 && (
            <>
              <p className="muted" style={{ margin: '0 0 var(--space-3)' }}>
                {totalWatched} de {lessons.length} aulas assistidas
              </p>
              <div className="chips" style={{ marginBottom: 'var(--space-5)' }}>
                <button type="button" className="chip" data-on={!subjectFilter} onClick={() => setParam({ materia: '', assunto: '' })} style={{ '--tag': 'var(--primary)' }}>
                  Todas
                </button>
                {subjects
                  .filter((s) => counts.has(s.id))
                  .map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className="chip"
                      data-on={subjectFilter === s.id}
                      onClick={() => setParam({ materia: s.id, assunto: '' })}
                      style={{ '--tag': subjectColor(s.name) }}
                    >
                      {s.name} <span className="muted">{counts.get(s.id).watched}/{counts.get(s.id).total}</span>
                    </button>
                  ))}
              </div>
            </>
          )}

          {!lessons && !error && <p className="muted">Carregando…</p>}

          {lessons?.length === 0 && !pending.length && (
            <p className="empty">Nenhuma aula ainda. Use "Adicionar aula" e cole o link de um vídeo ou playlist do YouTube.</p>
          )}

          {groups.map((g) => (
            <div key={g.key} className="section" style={{ '--tag': subjectColor(g.subject?.name ?? '') }}>
              <h2 className={styles.subjectTitle}>
                <span className="badge">{g.subject?.name ?? 'Sem matéria'}</span>
                <span className="muted">
                  {counts.get(g.key)?.watched ?? 0}/{counts.get(g.key)?.total ?? 0} assistidas
                </span>
              </h2>
              {g.topics.map(([topic, { items }]) => (
                <div key={topic} className={styles.topic}>
                  <h3>{topic}</h3>
                  <ul className="list">
                    {items.map((l) => {
                      const p = parseYouTube(l.url)
                      const thumb = p && thumbnailUrl(p)
                      return (
                        <li key={l.id} className={styles.item} data-watched={l.watched}>
                          <button type="button" className={styles.thumb} onClick={() => setPlaying(l)} aria-label={`Assistir: ${l.title}`}>
                            {thumb ? <img src={thumb} alt="" loading="lazy" /> : <span className={styles.playlist}>Playlist</span>}
                            <i className={styles.play}>
                              <Icon name="play" size={22} />
                            </i>
                          </button>
                          <div className={styles.info}>
                            <p className={styles.title}>{l.title}</p>
                            <p className="muted" style={{ margin: 0, fontSize: '0.82rem' }}>
                              {l.channel ? `${l.channel} · ` : ''}
                              {l.kind === 'playlist' ? 'playlist' : 'vídeo'}
                            </p>
                            <div className="row" style={{ marginTop: 'var(--space-2)' }}>
                              <label className={styles.watched}>
                                <input type="checkbox" checked={l.watched} onChange={() => toggleWatched(l)} />
                                Assistida
                              </label>
                              <button type="button" className="btn btn-sm" onClick={() => setPlaying(l)}>
                                Assistir
                              </button>
                              <button type="button" className="btn btn-sm btn-danger" onClick={() => remove(l)}>
                                Remover
                              </button>
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </>
      )}

      {playing && (
        <Player
          lesson={playing}
          onClose={() => setPlaying(null)}
          onWatched={async () => {
            if (!playing.watched) await toggleWatched(playing)
            setPlaying((p) => (p ? { ...p, watched: true } : p))
          }}
        />
      )}
    </section>
  )
}

function Player({ lesson, onClose, onWatched }) {
  const p = parseYouTube(lesson.url)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={lesson.title} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <div>
            <p className={styles.modalTitle}>{lesson.title}</p>
            {lesson.channel && <p className="muted" style={{ margin: 0, fontSize: '0.82rem' }}>{lesson.channel}</p>}
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Fechar">
            <Icon name="x" size={22} />
          </button>
        </div>
        {p ? (
          <div className={styles.frame}>
            <iframe
              src={embedUrl(p)}
              title={lesson.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        ) : (
          <p className="alert alert-error">Link de vídeo inválido.</p>
        )}
        <div className={styles.modalActions}>
          <button type="button" className="btn btn-primary" onClick={onWatched} disabled={lesson.watched}>
            {lesson.watched ? 'Marcada como assistida' : 'Marcar como assistida'}
          </button>
          {p && (
            <a className="btn" href={canonicalUrl(p)} target="_blank" rel="noopener noreferrer">
              Abrir no YouTube
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function LessonForm({ subjects, defaultSubject, onSaved }) {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [subjectId, setSubjectId] = useState(defaultSubject)
  const [editalKey, setEditalKey] = useState('')
  const [topic, setTopic] = useState('')
  const [channel, setChannel] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // assuntos do edital da matéria escolhida
  const subjectName = subjects.find((s) => s.id === subjectId)?.name
  const topicOptions = EDITAL.find((m) => norm(m.materia) === norm(subjectName ?? ''))?.topicos ?? []

  // Preenche título e canal sozinho, se o YouTube deixar (se não deixar, você digita)
  async function autofill() {
    const p = parseYouTube(url)
    if (!p || title) return
    try {
      const res = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(canonicalUrl(p))}`)
      if (!res.ok) return
      const data = await res.json()
      setTitle((t) => t || data.title)
      setChannel((c) => c || data.author_name)
    } catch {
      /* sem permissão do navegador: tudo bem */
    }
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    const p = parseYouTube(url)
    if (!p) return setError('Cole um link do YouTube (vídeo ou playlist).')
    setSaving(true)
    try {
      await addLesson({
        subject_id: subjectId || null,
        edital_key: editalKey || null,
        topic: (editalKey ? topicoPorChave.get(editalKey)?.short : topic.trim()) || null,
        title: title.trim(),
        channel: channel.trim() || null,
        url: canonicalUrl(p),
        kind: p.kind,
      })
      await onSaved()
    } catch (err) {
      setError(err.code === '23505' ? 'Essa aula já está na sua lista.' : isMissingSchema(err) ? MIGRATION_HINT_AULAS : err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="card stack" onSubmit={submit} style={{ marginBottom: 'var(--space-5)' }}>
      <label>
        Link do YouTube (vídeo ou playlist)
        <input type="url" required value={url} onChange={(e) => setUrl(e.target.value)} onBlur={autofill} placeholder="https://www.youtube.com/watch?v=..." />
      </label>
      <label>
        Título
        <input required value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <div className="row" style={{ alignItems: 'flex-end' }}>
        <label className="grow">
          Matéria
          <select
            value={subjectId}
            onChange={(e) => {
              setSubjectId(e.target.value)
              setEditalKey('')
            }}
          >
            <option value="">Sem matéria</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        {topicOptions.length > 0 ? (
          <label className="grow">
            Assunto do edital
            <select value={editalKey} onChange={(e) => setEditalKey(e.target.value)}>
              <option value="">Outro assunto…</option>
              {topicOptions.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.short}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {!editalKey && (
          <label className="grow">
            Assunto (opcional)
            <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Ex.: Crase" />
          </label>
        )}
      </div>
      <label>
        Canal (opcional)
        <input value={channel} onChange={(e) => setChannel(e.target.value)} />
      </label>
      {error && <p className="alert alert-error">{error}</p>}
      <button type="submit" className="btn btn-primary" disabled={saving}>
        {saving ? 'Salvando…' : 'Adicionar à minha lista'}
      </button>
    </form>
  )
}
