import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import QuizRunner from '../components/QuizRunner'
import { listDueQuestions } from '../services/answers'
import { listSubjects } from '../services/subjects'

export default function Review() {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState(null)
  const [error, setError] = useState('')

  const [subjectNames, setSubjectNames] = useState({})

  useEffect(() => {
    listDueQuestions().then(setQuestions, (e) => setError(e.message))
    listSubjects().then((list) => setSubjectNames(Object.fromEntries(list.map((s) => [s.id, s.name]))))
  }, [])

  return (
    <section>
      <div className="page-header">
        <h1>
          <span className="hl">Revisão de hoje</span>
        </h1>
      </div>

      {error && <p className="alert alert-error">{error}</p>}
      {!questions && !error && <p className="muted">Carregando…</p>}

      {questions?.length === 0 && (
        <div className="card empty">
          <p style={{ margin: 0 }}>
            <strong>Nada pendente por hoje.</strong>
          </p>
          <p>
            Questões que você erra voltam aqui nos dias seguintes. <Link to="/resolver">Resolver questões</Link>
          </p>
        </div>
      )}

      {questions?.length > 0 && (
        <>
          <p className="muted">
            {questions.length} {questions.length === 1 ? 'questão pendente' : 'questões pendentes'}
          </p>
          <QuizRunner
            questions={questions}
            mode="review"
            subjectNames={subjectNames}
            exitLabel="Voltar ao início"
            onExit={() => navigate('/')}
          />
        </>
      )}
    </section>
  )
}
