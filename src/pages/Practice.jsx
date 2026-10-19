import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import QuizRunner from '../components/QuizRunner'
import { fetchRandomQuestions } from '../services/questions'
import { listSubjects } from '../services/subjects'

export default function Practice() {
  const [subjects, setSubjects] = useState([])
  const [selected, setSelected] = useState([]) // vazio = todas
  const [quantity, setQuantity] = useState(10)
  const [questions, setQuestions] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    listSubjects().then(setSubjects, (e) => setError(e.message))
  }, [])

  function toggle(id) {
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))
  }

  async function start(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const list = await fetchRandomQuestions(selected, Number(quantity))
      if (!list.length) setError('Nenhuma questão encontrada para essa seleção. Cadastre ou importe questões primeiro.')
      else setQuestions(list)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (questions) {
    return (
      <section>
        <div className="page-header">
          <h1>Resolver</h1>
        </div>
        <QuizRunner
          questions={questions}
          mode="practice"
          exitLabel="Nova sessão"
          onExit={() => setQuestions(null)}
        />
      </section>
    )
  }

  return (
    <section>
      <div className="page-header">
        <h1>Resolver questões</h1>
      </div>

      <form className="card stack" onSubmit={start}>
        <fieldset className="stack" style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>
            Matérias <span className="muted">(nenhuma marcada = todas)</span>
          </legend>
          {subjects.map((s) => (
            <label key={s.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 'var(--space-3)', minHeight: 36 }}>
              <input
                type="checkbox"
                checked={selected.includes(s.id)}
                onChange={() => toggle(s.id)}
                style={{ width: 20, height: 20 }}
              />
              {s.name}
            </label>
          ))}
        </fieldset>

        <label>
          Quantidade de questões
          <input
            type="number"
            min={1}
            max={200}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </label>

        {error && (
          <p className="alert alert-error">
            {error} <Link to="/questoes">Ir para o banco</Link>
          </p>
        )}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Sorteando…' : 'Começar'}
        </button>
      </form>
    </section>
  )
}
