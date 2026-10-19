import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import {
  createSubject,
  deleteSubject,
  listSubjects,
  renameSubject,
  subjectErrorMessage,
} from '../services/subjects'
import { tagStyle } from '../lib/subjectColor'

export default function Subjects() {
  const [subjects, setSubjects] = useState(null)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [error, setError] = useState('')

  async function reload() {
    try {
      setSubjects(await listSubjects())
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => {
    reload()
  }, [])

  async function run(action) {
    setError('')
    try {
      await action()
      await reload()
    } catch (e) {
      setError(subjectErrorMessage(e))
    }
  }

  function add(e) {
    e.preventDefault()
    if (!newName.trim()) return
    run(async () => {
      await createSubject(newName)
      setNewName('')
    })
  }

  function save(id) {
    if (!editingName.trim()) return
    run(async () => {
      await renameSubject(id, editingName)
      setEditingId(null)
    })
  }

  function remove(subject) {
    if (!window.confirm(`Excluir a matéria "${subject.name}"?`)) return
    run(() => deleteSubject(subject.id))
  }

  return (
    <section>
      <div className="page-header">
        <h1>
          <span className="hl">Matérias</span>
        </h1>
        <Link className="btn" to="/questoes">
          ← Questões
        </Link>
      </div>

      <form className="row" onSubmit={add} style={{ marginBottom: 'var(--space-4)' }}>
        <input
          className="grow"
          placeholder="Nova matéria"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          aria-label="Nome da nova matéria"
        />
        <button type="submit" className="btn btn-primary">
          Adicionar
        </button>
      </form>

      {error && <p className="alert alert-error">{error}</p>}
      {!subjects && !error && <p className="muted">Carregando…</p>}

      <ul className="list">
        {subjects?.map((s) => (
          <li key={s.id} className="row" style={tagStyle(s.name)}>
            {editingId === s.id ? (
              <>
                <input
                  className="grow"
                  value={editingName}
                  autoFocus
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && save(s.id)}
                  aria-label="Novo nome da matéria"
                />
                <button type="button" className="btn btn-sm btn-primary" onClick={() => save(s.id)}>
                  Salvar
                </button>
                <button type="button" className="btn btn-sm" onClick={() => setEditingId(null)}>
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <span className="grow">{s.name}</span>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => {
                    setEditingId(s.id)
                    setEditingName(s.name)
                  }}
                >
                  Renomear
                </button>
                <button type="button" className="btn btn-sm btn-danger" onClick={() => remove(s)}>
                  Excluir
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
