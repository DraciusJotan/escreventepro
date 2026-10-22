import { useState } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuth } from '../contexts/AuthContext'
import Logo from '../components/Logo'
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
      <aside className={styles.side}>
        <span className={styles.brand}>
          <Logo size={40} />
          Escrevente <b>Pro</b>
        </span>

        <div className={styles.pitch}>
          <p className={styles.lead}>
            <span className={styles.mark}>Constância</span> vence talento na hora da prova.
          </p>
          <ul className={styles.points}>
            <li>Suas questões, organizadas por matéria e assunto</li>
            <li>O que você erra volta no dia certo para revisar</li>
            <li>Um mapa de estudo para não quebrar a sequência</li>
          </ul>
        </div>

        <span className={styles.note}>Escrevente Técnico Judiciário · TJSP · VUNESP</span>
      </aside>

      <section className={styles.formSide}>
        <div className={styles.formWrap}>
          <span className={`${styles.brand} ${styles.mobileBrand}`}>
            <Logo size={36} />
            Escrevente <b>Pro</b>
          </span>
          <h1 className={styles.title}>
            {isLogin ? 'Entrar' : 'Criar conta'}
          </h1>
          <p className={styles.subtitle}>
            {isLogin ? 'Continue de onde parou.' : 'Leva menos de um minuto.'}
          </p>

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

          <p className={styles.switch}>
            {isLogin ? 'Ainda não tem conta?' : 'Já tem conta?'}{' '}
            <button
              type="button"
              onClick={() => {
                setMode(isLogin ? 'signup' : 'login')
                setError('')
              }}
            >
              {isLogin ? 'Cadastre-se' : 'Entrar'}
            </button>
          </p>
        </div>
      </section>
    </main>
  )
}
