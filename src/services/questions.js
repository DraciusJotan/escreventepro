import { supabase } from '../lib/supabase'

export const PAGE_SIZE = 20
export const LETTERS = ['A', 'B', 'C', 'D', 'E']
export const optionOf = (question, letter) => question[`option_${letter.toLowerCase()}`]

export async function listQuestions({ subjectId, search, page = 0 }) {
  let query = supabase
    .from('questions')
    .select('id, topic, statement, correct_option, source, subject_id, subjects(name)', {
      count: 'exact',
    })
    .order('created_at', { ascending: false })
    .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1)

  if (subjectId) query = query.eq('subject_id', subjectId)
  if (search?.trim()) {
    // vírgulas e parênteses têm significado especial no filtro .or() do PostgREST
    const term = search.trim().replace(/[%,()*]/g, ' ')
    query = query.or(`statement.ilike.%${term}%,topic.ilike.%${term}%`)
  }

  const { data, error, count } = await query
  if (error) throw error
  return { rows: data, count }
}

export async function getQuestion(id) {
  const { data, error } = await supabase.from('questions').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function createQuestion(payload) {
  const { error } = await supabase.from('questions').insert(payload)
  if (error) throw error
}

export async function updateQuestion(id, payload) {
  const { error } = await supabase.from('questions').update(payload).eq('id', id)
  if (error) throw error
}

export async function deleteQuestion(id) {
  const { error } = await supabase.from('questions').delete().eq('id', id)
  if (error) throw error
}

// Insere em lotes para não estourar o tamanho da requisição.
export async function bulkInsertQuestions(rows, onProgress) {
  const CHUNK = 100
  for (let i = 0; i < rows.length; i += CHUNK) {
    const { error } = await supabase.from('questions').insert(rows.slice(i, i + CHUNK))
    if (error) throw error
    onProgress?.(Math.min(i + CHUNK, rows.length), rows.length)
  }
}

// O sorteio acontece no banco (função random_questions).
export async function fetchRandomQuestions(subjectIds, limit) {
  const { data, error } = await supabase.rpc('random_questions', {
    p_subject_ids: subjectIds,
    p_limit: limit,
  })
  if (error) throw error
  return data
}

// Caderno de erros: questões cuja última resposta foi errada (função wrong_questions).
export async function fetchWrongQuestions(subjectIds = [], limit = 200) {
  const { data, error } = await supabase.rpc('wrong_questions', {
    p_subject_ids: subjectIds,
    p_limit: limit,
  })
  if (error) throw error
  return data
}

export async function countWrongQuestions() {
  const { count, error } = await supabase.rpc('wrong_questions', { p_limit: 500 }, { count: 'exact', head: true })
  if (error) throw error
  return count ?? 0
}

export async function getQuestionsByIds(ids) {
  if (!ids.length) return []
  const { data, error } = await supabase.from('questions').select('*').in('id', ids)
  if (error) throw error
  return data
}

// Mensagem amigável quando a migration 0002 ainda não foi rodada no Supabase.
export function isMissingSchema(error) {
  const text = `${error?.code ?? ''} ${error?.message ?? ''}`
  return /42P01|PGRST205|PGRST202|42883|does not exist|Could not find/i.test(text)
}

export const MIGRATION_HINT =
  'Falta rodar a migration 0002 no Supabase (SQL Editor → supabase/migrations/0002_simulados_caderno_metas.sql).'
