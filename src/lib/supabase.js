import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error(
    'Variáveis do Supabase ausentes. Copie .env.example para .env.local e preencha os valores.',
  )
}

// Cliente único para o app inteiro. Ele guarda a sessão no localStorage
// e renova o token de acesso automaticamente.
export const supabase = createClient(url, anonKey)
