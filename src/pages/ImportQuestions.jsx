import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { readFileMatrix, validateMatrix } from '../lib/importQuestions'
import { bulkInsertQuestions } from '../services/questions'
import { listSubjects } from '../services/subjects'

export default function ImportQuestions() {
  const [subjects, setSubjects] = useState([])
  const [fileName, setFileName] = useState('')
  const [report, setReport] = useState(null) // { valid, errors, total }
  const [progress, setProgress] = useState(null)
  const [done, setDone] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    listSubjects().then(setSubjects, (e) => setError(e.message))
  }, [])

  async function handleFile(e) {
    const file = e.target.files?.[0]
    setReport(null)
    setDone(0)
    setError('')
    if (!file) return
    setFileName(file.name)
    try {
      const matrix = await readFileMatrix(file)
      setReport(validateMatrix(matrix, subjects))
    } catch (err) {
      setError(err.message)
    }
  }

  async function importAll() {
    setError('')
    setProgress({ current: 0, total: report.valid.length })
    try {
      await bulkInsertQuestions(report.valid, (current, total) => setProgress({ current, total }))
      setDone(report.valid.length)
      setReport(null)
    } catch (err) {
      setError(`Falha durante a importação: ${err.message}`)
    } finally {
      setProgress(null)
    }
  }

  return (
    <section>
      <div className="page-header">
        <h1>
          <span className="hl">Importar questões</span>
        </h1>
        <Link className="btn" to="/questoes">
          ← Voltar
        </Link>
      </div>

      <div className="card stack">
        <p style={{ margin: 0 }}>
          1. Baixe o modelo, preencha uma questão por linha e salve como <strong>.xlsx</strong> ou{' '}
          <strong>.csv</strong>.
        </p>
        <div className="actions">
          <a className="btn" href={`${import.meta.env.BASE_URL}modelo-questoes.xlsx`} download>
            Baixar modelo (.xlsx)
          </a>
          <a className="btn" href={`${import.meta.env.BASE_URL}modelo-questoes.csv`} download>
            Baixar modelo (.csv)
          </a>
        </div>
        <p style={{ margin: 0 }}>
          2. Envie o arquivo. Você vê uma prévia e os erros por linha <em>antes</em> de salvar qualquer coisa.
        </p>
        <input type="file" accept=".xlsx,.xls,.csv,.txt" onChange={handleFile} aria-label="Arquivo de questões" />
        <p className="muted" style={{ margin: 0 }}>
          A coluna <code>materia</code> precisa ter o nome igual ao de uma das suas matérias.
        </p>
      </div>

      {error && <p className="alert alert-error" style={{ marginTop: 'var(--space-4)' }}>{error}</p>}
      {done > 0 && (
        <p className="alert alert-info" style={{ marginTop: 'var(--space-4)' }}>
          {done} questões importadas.{' '}
          <Link to="/questoes">Ver banco de questões</Link>
        </p>
      )}

      {report && (
        <div className="stack" style={{ marginTop: 'var(--space-4)' }}>
          <div className="card stack">
            <h2 style={{ margin: 0, fontSize: '1.1rem' }}>{fileName}</h2>
            <p style={{ margin: 0 }}>
              <strong>{report.valid.length}</strong> prontas para importar ·{' '}
              <strong>{report.errors.length}</strong> com erro · {report.total} linhas lidas
            </p>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!report.valid.length || !!progress}
              onClick={importAll}
            >
              {progress
                ? `Importando ${progress.current}/${progress.total}…`
                : `Importar ${report.valid.length} questões`}
            </button>
            {report.errors.length > 0 && report.valid.length > 0 && (
              <p className="muted" style={{ margin: 0 }}>
                As linhas com erro serão ignoradas. Corrija a planilha e reenvie só elas depois, se quiser.
              </p>
            )}
          </div>

          {report.errors.length > 0 && (
            <div className="card">
              <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Erros</h2>
              <div className="table-wrap">
                <table className="simple">
                  <thead>
                    <tr>
                      <th>Linha</th>
                      <th>Problema</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.errors.slice(0, 100).map((er) => (
                      <tr key={er.line}>
                        <td>{er.line}</td>
                        <td>{er.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {report.errors.length > 100 && (
                <p className="muted">Mostrando os 100 primeiros erros.</p>
              )}
            </div>
          )}

          {report.valid.length > 0 && (
            <div className="card">
              <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Prévia (5 primeiras)</h2>
              <div className="table-wrap">
                <table className="simple">
                  <thead>
                    <tr>
                      <th>Assunto</th>
                      <th>Enunciado</th>
                      <th>Gab.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.valid.slice(0, 5).map((q, i) => (
                      <tr key={i}>
                        <td>{q.topic}</td>
                        <td>{q.statement.slice(0, 120)}</td>
                        <td>{q.correct_option}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
