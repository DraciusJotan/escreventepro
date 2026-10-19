import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { deleteQuestion, listQuestions } from '../services/questions'
import { listSubjects } from '../services/subjects'
import { tagStyle } from '../lib/subjectColor'

export default function Questions() {
  const [subjects, setSubjects] = useState([])
  const [subjectId, setSubjectId] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [rows, setRows] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    listSubjects().then(setSubjects, (e) => setError(e.message))
  }, [])

  // Espera o usuário parar de digitar antes de consultar o banco.
  // Mudou o filtro: volta para a primeira página.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput)
      setPage(0)
    }, 350)
    return () => clearTimeout(t)
  }, [searchInput])

  useEffect(() => {
    let cancelled = false
    listQuestions({ subjectId, search, page })
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
  }, [subjectId, search, page])

  async function remove(question) {
    if (!window.confirm('Excluir esta questão? O histórico de respostas dela também será apagado.')) return
    try {
      await deleteQuestion(question.id)
      setRows((r) => r.filter((x) => x.id !== question.id))
      setCount((c) => c - 1)
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <section>
      <div className="page-header">
        <h1>
          <span className="hl">Banco de questões</span>
        </h1>
        <div className="actions">
          <Link className="btn btn-primary" to="/questoes/nova">
            + Nova
          </Link>
          <Link className="btn" to="/questoes/importar">
            Importar
          </Link>
          <Link className="btn" to="/materias">
            Matérias
          </Link>
        </div>
      </div>

      <div className="row" style={{ marginBottom: 'var(--space-4)' }}>
        <select
          className="grow"
          value={subjectId}
          onChange={(e) => {
            setSubjectId(e.target.value)
            setPage(0)
          }}
          aria-label="Filtrar por matéria"
        >
          <option value="">Todas as matérias</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <input
          className="grow"
          type="search"
          placeholder="Buscar no enunciado ou assunto"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="Buscar questões"
        />
      </div>

      {error && <p className="alert alert-error">{error}</p>}
      <p className="muted">
        {count} {count === 1 ? 'questão' : 'questões'}
      </p>

      <ul className="list">
        {rows.map((q) => (
          <li key={q.id} className="stack" style={tagStyle(q.subjects?.name)}>
            <div className="row">
              <span className="badge">{q.subjects?.name}</span>
              {q.topic && <span className="muted">{q.topic}</span>}
              <span className="muted" style={{ marginLeft: 'auto' }}>
                Gabarito {q.correct_option}
              </span>
            </div>
            <p className="truncate-3" style={{ margin: 0 }}>
              {q.statement}
            </p>
            <div className="row">
              <Link className="btn btn-sm" to={`/questoes/${q.id}`}>
                Editar
              </Link>
              <button type="button" className="btn btn-sm btn-danger" onClick={() => remove(q)}>
                Excluir
              </button>
              {q.source && <span className="muted">{q.source}</span>}
            </div>
          </li>
        ))}
      </ul>

      {!loading && rows.length === 0 && !error && (
        <p className="empty">
          Nenhuma questão ainda. Cadastre uma ou importe uma planilha.
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
