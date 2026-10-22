import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { saveSession, shuffled } from '../lib/session'
import { tagStyle } from '../lib/subjectColor'
import { deleteQuestion, listFilteredIds, listQuestions, listSources, MAX_SESSION } from '../services/questions'
import { listSubjects } from '../services/subjects'
import styles from './Questions.module.css'

// Banco de questões: filtre, escolha e resolva. Os filtros ficam na URL, então ao voltar
// de uma sessão você encontra a lista do jeito que deixou.
export default function Questions() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const subjectId = params.get('materia') ?? ''
  const source = params.get('fonte') ?? ''
  const search = params.get('busca') ?? ''

  const [subjects, setSubjects] = useState([])
  const [sources, setSources] = useState([])
  const [searchInput, setSearchInput] = useState(search)
  const [rows, setRows] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(() => new Set())
  const [random, setRandom] = useState(false)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    listSubjects().then(setSubjects, (e) => setError(e.message))
    listSources().then(setSources, () => {})
  }, [])

  function setFilter(key, value) {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value) next.set(key, value)
        else next.delete(key)
        return next
      },
      { replace: true },
    )
    setPage(0)
  }

  // Busca digitada: espera parar de digitar antes de consultar o banco.
  useEffect(() => {
    if (searchInput === search) return
    const t = setTimeout(() => setFilter('busca', searchInput.trim()), 350)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  // Busca feita pelo menu superior enquanto já está nesta tela
  useEffect(() => {
    setSearchInput(search)
  }, [search])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    listQuestions({ subjectId, source, search, page })
      .then(({ rows: data, count: total }) => {
        if (cancelled) return
        setRows((prev) => (page === 0 ? data : [...prev, ...data]))
        setCount(total ?? 0)
        setError('')
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [subjectId, source, search, page])

  const filters = { subjectId, source, search }
  const hasFilters = !!(subjectId || source || search)
  const filteredTotal = Math.min(count, MAX_SESSION)

  function begin(ids, start = 0, label = '') {
    if (!ids.length) return
    saveSession({ ids, start, label, from: `/questoes${window.location.search}` })
    navigate('/questoes/resolver')
  }

  async function solveFiltered() {
    setStarting(true)
    try {
      const ids = await listFilteredIds(filters)
      begin(random ? shuffled(ids) : ids, 0, 'Questões filtradas')
    } catch (e) {
      setError(e.message)
    } finally {
      setStarting(false)
    }
  }

  // "Resolver a partir desta": a sessão segue a ordem da lista, começando na questão clicada.
  async function solveFrom(question) {
    setStarting(true)
    try {
      const ids = await listFilteredIds(filters)
      const at = ids.indexOf(question.id)
      if (at === -1) begin([question.id, ...ids.slice(0, MAX_SESSION - 1)], 0, 'A partir da questão escolhida')
      else begin(ids, at, 'A partir da questão escolhida')
    } catch (e) {
      setError(e.message)
    } finally {
      setStarting(false)
    }
  }

  function solveSelected() {
    const ids = [...selected]
    begin(random ? shuffled(ids) : ids, 0, 'Questões selecionadas')
  }

  const toggle = (id) =>
    setSelected((cur) => {
      const next = new Set(cur)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const allVisible = rows.length > 0 && rows.every((q) => selected.has(q.id))
  const toggleVisible = () =>
    setSelected((cur) => {
      const next = new Set(cur)
      rows.forEach((q) => (allVisible ? next.delete(q.id) : next.add(q.id)))
      return next
    })

  async function remove(question) {
    if (!window.confirm('Excluir esta questão? O histórico de respostas dela também será apagado.')) return
    try {
      await deleteQuestion(question.id)
      setRows((r) => r.filter((x) => x.id !== question.id))
      setCount((c) => c - 1)
      setSelected((cur) => {
        const next = new Set(cur)
        next.delete(question.id)
        return next
      })
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <section>
      <header className="page-header">
        <div>
          <p className="eyebrow">Questões</p>
          <h1>Banco de Questões</h1>
        </div>
        <div className="actions">
          <Link className="btn btn-blue" to="/questoes/nova">
            + Nova
          </Link>
          <Link className="btn" to="/questoes/importar">
            Importar
          </Link>
          <Link className="btn" to="/materias">
            Matérias
          </Link>
        </div>
      </header>

      <div className={styles.filters}>
        <select value={subjectId} onChange={(e) => setFilter('materia', e.target.value)} aria-label="Filtrar por matéria">
          <option value="">Todas as matérias</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select value={source} onChange={(e) => setFilter('fonte', e.target.value)} aria-label="Filtrar por prova">
          <option value="">Todas as provas</option>
          {sources.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          type="search"
          placeholder="Buscar no enunciado ou assunto"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="Buscar questões"
        />
      </div>

      {/* Barra de ações: fica visível ao rolar a lista */}
      <div className={styles.bar}>
        <label className={styles.check}>
          <input type="checkbox" checked={allVisible} onChange={toggleVisible} disabled={!rows.length} />
          <span>Selecionar visíveis</span>
        </label>
        <span className={styles.count}>
          {count} {count === 1 ? 'questão' : 'questões'}
          {selected.size > 0 && (
            <>
              {' · '}
              <b>{selected.size}</b> {selected.size === 1 ? 'selecionada' : 'selecionadas'}{' '}
              <button type="button" className={styles.link} onClick={() => setSelected(new Set())}>
                limpar
              </button>
            </>
          )}
        </span>
        <label className={styles.check}>
          <input type="checkbox" checked={random} onChange={(e) => setRandom(e.target.checked)} />
          <span>Embaralhar</span>
        </label>
        <div className={styles.barActions}>
          <button type="button" className="btn btn-sm" disabled={!selected.size} onClick={solveSelected}>
            Resolver selecionadas{selected.size ? ` (${selected.size})` : ''}
          </button>
          <button type="button" className="btn btn-primary btn-sm" disabled={!count || starting} onClick={solveFiltered}>
            {starting ? 'Abrindo…' : `Resolver ${hasFilters ? 'filtradas' : 'todas'} (${filteredTotal})`}
          </button>
        </div>
      </div>
      {count > MAX_SESSION && (
        <p className="muted" style={{ margin: '0 0 var(--space-3)', fontSize: '0.82rem' }}>
          Cada sessão tem no máximo {MAX_SESSION} questões. Use os filtros para resolver o resto em outras sessões.
        </p>
      )}

      {error && <p className="alert alert-error">{error}</p>}

      <ul className="list">
        {rows.map((q) => (
          <li key={q.id} className={styles.item} style={tagStyle(q.subjects?.name)}>
            <label className={styles.rowCheck} aria-label="Selecionar questão">
              <input type="checkbox" checked={selected.has(q.id)} onChange={() => toggle(q.id)} />
            </label>
            <div className={styles.body}>
              <div className="row">
                <span className="badge">{q.subjects?.name}</span>
                {q.topic && <span className="muted">{q.topic}</span>}
                <span className="muted" style={{ marginLeft: 'auto' }}>
                  Gabarito {q.correct_option}
                </span>
              </div>
              <p className="truncate-3" style={{ margin: 'var(--space-2) 0' }}>
                {q.statement}
              </p>
              <div className="row">
                <button type="button" className="btn btn-blue btn-sm" disabled={starting} onClick={() => solveFrom(q)}>
                  Resolver
                </button>
                <Link className="btn btn-sm" to={`/questoes/${q.id}`}>
                  Editar
                </Link>
                <button type="button" className="btn btn-sm btn-danger" onClick={() => remove(q)}>
                  Excluir
                </button>
                {q.source && <span className="muted" style={{ fontSize: '0.82rem' }}>{q.source}</span>}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {!loading && rows.length === 0 && !error && (
        <p className="empty">
          {hasFilters ? 'Nenhuma questão com esses filtros.' : 'Nenhuma questão ainda. Cadastre uma ou importe uma planilha.'}
        </p>
      )}
      {loading && <p className="muted">Carregando…</p>}
      {!loading && rows.length < count && (
        <button type="button" className="btn" onClick={() => setPage((p) => p + 1)} style={{ marginTop: 'var(--space-4)' }}>
          Carregar mais
        </button>
      )}
    </section>
  )
}
