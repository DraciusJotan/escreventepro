import { useAuth } from '../contexts/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <section>
      <h1>Olá!</h1>
      <p className="muted">Você está logado como {user.email}.</p>
      <div className="card">
        <p>Aqui vão aparecer a revisão de hoje, o mapa de calor e seu resumo de desempenho.</p>
      </div>
    </section>
  )
}
