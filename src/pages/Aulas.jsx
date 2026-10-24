import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import Icon from '../components/Icon'
import { AULAS_SUGERIDAS } from '../data/aulasSugeridas'
import { subjectColor } from '../lib/subjectColor'
import { canonicalUrl, embedUrl, parseYouTube, thumbnailUrl } from '../lib/youtube'
import { addLesson, addLessons, deleteLesson, listLessons, setWatched } from '../services/lessons'
import { MIGRATION_HINT_AULAS, isMissingSchema } from '../services/questions'
import { listSubjects } from '../services/subjects'
import styles from './Aulas.module.css'

const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

export default function Aulas() {
  const [params, setParams] = useSearchParams()
  const subjectFilter = params.get('materia') ?? ''
  const [subjects, setSubjects] = useState([])
  const [lessons, setLessons] = useState(null)
  const [error, setError] = useState('')
  const [playing, setPlaying] = useState(null) // aula aberta no player
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
  }

  useEffect(() => {
    reload()
  }, [])

  const subjectById = useMemo(() => new Map(subjects.map((s) => [s.id, s])), [subjects])
  const subjectByName = useMemo(() => new Map(subjects.map((s) => [norm(s.name), s])), [subjects])

  // Sugestões que ainda não estão na lista do usuário (e cuja matéria ele tem)
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
        title: a.title,
        channel: a.channel,
        url: a.url,
        kind: a.kind ?? 'video',
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

  const visible = (lessons ?? []).filter((l) => !subjectFilter || l.subject_id === subjectFilter)

  // agrupa por matéria e, dentro dela, por assunto (na ordem em que entraram)
  const groups = useMemo(() => {
    const bySubject = new Map()
    for (const l of visible) {
      const key = l.subject_id ?? 'none'
      if (!bySubject.has(key)) bySubject.set(key, new Map())
      const topics = bySubject.get(key)
      const topic = l.topic || 'Geral'
      if (!topics.has(topic)) topics.set(topic, [])
      topics.get(topic).push(l)
    }
    const order = [...subjects.map((s) => s.id), 'none']
    return order.filter((k) => bySubject.has(k)).map((k) => ({ key: k, subject: subjectById.get(k), topics: bySubject.get(k) }))
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

  return (
    <section>
      <header className="page-header">
        <div>
          <p className="eyebrow">Estudo</p>
          <h1>Aulas</h1>
        </div>
        <div className="actions">
          <button type="button" className="btn btn-blue" onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Fechar' : '+ Adicionar aula'}
          </button>
        </div>
      </header>

      <p className={styles.legal}>
        As aulas são vídeos de terceiros no YouTube, incorporados aqui por link: o app não hospeda nem copia vídeos. Muitas foram
        feitas para provas anteriores, então confirme o conteúdo no edital vigente.
      </p>

      {error && <p className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>{error}</p>}
      {notice && <p className="alert alert-info" style={{ marginBottom: 'var(--space-4)' }}>{notice}</p>}

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
            <h2 className="card-title">Aulas gratuitas sugeridas</h2>
            <p className="muted" style={{ margin: 0 }}>
              {pending.length} aulas gratuitas do YouTube para as matérias do edital. Os links foram verificados (existem e tocam aqui), mas a
              qualidade e a atualização variam: remova o que não servir.
            </p>
          </div>
          <button type="button" className="btn btn-primary" onClick={addSuggested} disabled={busy}>
            {busy ? 'Adicionando…' : `Adicionar ${pending.length} aulas`}
          </button>
        </div>
      )}

      {lessons && lessons.length > 0 && (
        <>
          <p className="muted" style={{ margin: '0 0 var(--space-3)' }}>
            {totalWatched} de {lessons.length} aulas assistidas
          </p>
          <div className="chips" style={{ marginBottom: 'var(--space-5)' }}>
            <button
              type="button"
              className="chip"
              data-on={!subjectFilter}
              onClick={() => setParams({}, { replace: true })}
              style={{ '--tag': 'var(--primary)' }}
            >
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
                  onClick={() => setParams({ materia: s.id }, { replace: true })}
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
          {[...g.topics].map(([topic, items]) => (
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
  const [topic, setTopic] = useState('')
  const [channel, setChannel] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

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
        topic: topic.trim() || null,
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
          <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            <option value="">Sem matéria</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grow">
          Assunto (opcional)
          <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Ex.: Crase" />
        </label>
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
