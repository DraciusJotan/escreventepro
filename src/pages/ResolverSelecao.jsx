import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import QuizRunner from '../components/QuizRunner'
import { loadSession } from '../lib/session'
import { getQuestionsByIds } from '../services/questions'
import { listSubjects } from '../services/subjects'

// Resolve as questões escolhidas no Banco de Questões (selecionadas, filtradas ou "a partir desta").
export default function ResolverSelecao() {
  const navigate = useNavigate()
  const [session] = useState(loadSession)
  const [questions, setQuestions] = useState(null)
  const [names, setNames] = useState({})
  const [error, setError] = useState('')

  useEffect(() => {
    if (!session) return
    Promise.all([getQuestionsByIds(session.ids), listSubjects()]).then(
      ([list, subjects]) => {
        setQuestions(list)
        setNames(Object.fromEntries(subjects.map((s) => [s.id, s.name])))
      },
      (e) => setError(e.message),
    )
  }, [session])

  // sem sessão salva (acesso direto ao endereço): volta para o banco
  if (!session) return <Navigate to="/questoes" replace />

  const back = () => navigate(session.from ?? '/questoes')

  return (
    <section>
      <header className="page-header">
        <div>
          <p className="eyebrow">{session.label || 'Banco de Questões'}</p>
          <h1>Resolver questões</h1>
        </div>
        <Link className="btn" to={session.from ?? '/questoes'}>
          Voltar ao banco
        </Link>
      </header>

      {error && <p className="alert alert-error">{error}</p>}
      {!questions && !error && <p className="muted">Carregando…</p>}
      {questions?.length === 0 && (
        <p className="empty">Essas questões não existem mais no banco. Volte e escolha de novo.</p>
      )}
      {questions?.length > 0 && (
        <QuizRunner
          questions={questions}
          mode="practice"
          subjectNames={names}
          initialIndex={session.start ?? 0}
          exitLabel="Voltar ao banco"
          onExit={back}
        />
      )}
    </section>
  )
}
