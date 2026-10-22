import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Practice from './pages/Practice'
import Review from './pages/Review'
import Questions from './pages/Questions'
import QuestionForm from './pages/QuestionForm'
import ImportQuestions from './pages/ImportQuestions'
import Subjects from './pages/Subjects'
import Stats from './pages/Stats'
import ResolverSelecao from './pages/ResolverSelecao'
import Cronograma from './pages/Cronograma'
import Caderno from './pages/Caderno'
import SimuladoNovo from './pages/SimuladoNovo'
import Simulados from './pages/Simulados'
import SimuladoResultado from './pages/SimuladoResultado'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="resolver" element={<Practice />} />
              <Route path="revisao" element={<Review />} />
              <Route path="questoes" element={<Questions />} />
              <Route path="questoes/nova" element={<QuestionForm />} />
              <Route path="questoes/resolver" element={<ResolverSelecao />} />
              <Route path="questoes/importar" element={<ImportQuestions />} />
              <Route path="questoes/:id" element={<QuestionForm />} />
              <Route path="materias" element={<Subjects />} />
              <Route path="desempenho" element={<Stats />} />
              <Route path="cronograma" element={<Cronograma />} />
              <Route path="caderno" element={<Caderno />} />
              <Route path="simulado/novo" element={<SimuladoNovo />} />
              <Route path="simulados" element={<Simulados />} />
              <Route path="simulados/:id" element={<SimuladoResultado />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
