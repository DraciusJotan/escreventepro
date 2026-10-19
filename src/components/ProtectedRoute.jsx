import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../contexts/AuthContext'

// Envolve as rotas que exigem login. Isso é só conforto de UX:
// a segurança de verdade está no RLS do banco.
export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <div className="center-screen">Carregando…</div>
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />

  return <Outlet />
}
