import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { createQuestion, getQuestion, LETTERS, updateQuestion } from '../services/questions'
import { listSubjects } from '../services/subjects'

const EMPTY = {
  topic: '',
  statement: '',
  option_a: '',
  option_b: '',
  option_c: '',
  option_d: '',
  option_e: '',
  correct_option: '',
  source: '',
}

export default function QuestionForm() {
  const { id } = useParams() // ausente em /questoes/nova
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState([])
  const [subjectId, setSubjectId] = useState('')
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(!!id)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [savedMsg, setSavedMsg] = useState('')
  const addAnother = useRef(false)

  useEffect(() => {
    listSubjects().then(setSubjects, (e) => setError(e.message))
    if (!id) return
    getQuestion(id)
      .then((q) => {
        setSubjectId(q.subject_id)
        setForm({
          topic: q.topic ?? '',
          statement: q.statement,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          option_e: q.option_e,
          correct_option: q.correct_option,
          source: q.source ?? '',
        })
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSavedMsg('')
    if (!form.correct_option) return setError('Marque qual alternativa é o gabarito.')

    const payload = {
      subject_id: subjectId,
      topic: form.topic.trim() || null,
      statement: form.statement.trim(),
      option_a: form.option_a.trim(),
      option_b: form.option_b.trim(),
      option_c: form.option_c.trim(),
      option_d: form.option_d.trim(),
      option_e: form.option_e.trim(),
      correct_option: form.correct_option,
      source: form.source.trim() || null,
    }

    setSaving(true)
    try {
      if (id) await updateQuestion(id, payload)
      else await createQuestion(payload)

      if (addAnother.current) {
        // mantém matéria, assunto e fonte para cadastrar em sequência
        setForm({ ...EMPTY, topic: form.topic, source: form.source })
        setSavedMsg('Questão salva. Pode cadastrar a próxima.')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        navigate('/questoes')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
      addAnother.current = false
    }
  }

  if (loading) return <p className="muted">Carregando…</p>

  return (
    <section>
      <div className="page-header">
        <h1>
          <span className="hl">{id ? 'Editar questão' : 'Nova questão'}</span>
        </h1>
        <Link className="btn" to="/questoes">
          ← Voltar
        </Link>
      </div>

      <form className="stack" onSubmit={handleSubmit}>
        {savedMsg && <p className="alert alert-info">{savedMsg}</p>}

        <label>
          Matéria
          <select required value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            <option value="" disabled>
              Selecione…
            </option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Assunto (opcional)
          <input value={form.topic} onChange={set('topic')} placeholder="Ex.: Crase" />
        </label>

        <label>
          Enunciado
          <textarea required rows={5} value={form.statement} onChange={set('statement')} />
        </label>

        <fieldset className="stack" style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend style={{ fontWeight: 500, marginBottom: 'var(--space-2)' }}>
            Alternativas (marque o gabarito)
          </legend>
          {LETTERS.map((letter) => (
            <div key={letter} className="row" style={{ flexWrap: 'nowrap' }}>
              <label style={{ flexDirection: 'row', alignItems: 'center', gap: 'var(--space-2)' }}>
                <input
                  type="radio"
                  name="correct"
                  value={letter}
                  checked={form.correct_option === letter}
                  onChange={set('correct_option')}
                  aria-label={`Gabarito é ${letter}`}
                />
                <strong>{letter}</strong>
              </label>
              <input
                className="grow"
                required
                style={{ minWidth: 0 }}
                value={form[`option_${letter.toLowerCase()}`]}
                onChange={set(`option_${letter.toLowerCase()}`)}
                aria-label={`Alternativa ${letter}`}
              />
            </div>
          ))}
        </fieldset>

        <label>
          Fonte (opcional)
          <input value={form.source} onChange={set('source')} placeholder="Ex.: VUNESP 2023 TJSP" />
        </label>

        {error && <p className="alert alert-error">{error}</p>}

        <div className="actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
          {!id && (
            <button
              type="submit"
              className="btn"
              disabled={saving}
              onClick={() => {
                addAnother.current = true
              }}
            >
              Salvar e adicionar outra
            </button>
          )}
        </div>
      </form>
    </section>
  )
}
