import { useState } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuth } from '../contexts/AuthContext'
import styles from './Login.module.css'

const ERROR_MESSAGES = {
  'Invalid login credentials': 'E-mail ou senha incorretos.',
  'Email not confirmed': 'Confirme seu e-mail antes de entrar (veja sua caixa de entrada).',
  'User already registered': 'Já existe uma conta com este e-mail.',
}

function translateError(message) {
  if (ERROR_MESSAGES[message]) return ERROR_MESSAGES[message]
  if (message.includes('Password should be at least')) return 'A senha precisa ter pelo menos 6 caracteres.'
  return message
}

export default function Login() {
  const { user, signIn, signUp } = useAuth()
  const location = useLocation()
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to={location.state?.from?.pathname ?? '/'} replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setInfo('')
    setSubmitting(true)

    const { data, error } =
      mode === 'login' ? await signIn(email, password) : await signUp(email, password)

    setSubmitting(false)
    if (error) return setError(translateError(error.message))

    // Com confirmação de e-mail ligada, o cadastro não devolve sessão.
    if (mode === 'signup' && !data.session) {
      setInfo('Conta criada! Enviamos um link de confirmação para o seu e-mail.')
      setMode('login')
    }
  }

  const isLogin = mode === 'login'

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.brand}>Escrevente Pro</h1>
        <p className={styles.subtitle}>Seu treino diário para o TJSP</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label>
            E-mail
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Senha
            <input
              type="password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <p className="alert alert-error">{error}</p>}
          {info && <p className="alert alert-info">{info}</p>}

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Aguarde…' : isLogin ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <button
          type="button"
          className={styles.switch}
          onClick={() => {
            setMode(isLogin ? 'signup' : 'login')
            setError('')
          }}
        >
          {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entrar'}
        </button>
      </div>
    </main>
  )
}
