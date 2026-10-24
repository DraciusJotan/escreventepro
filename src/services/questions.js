import { supabase } from '../lib/supabase'

export const PAGE_SIZE = 20
export const LETTERS = ['A', 'B', 'C', 'D', 'E']
export const optionOf = (question, letter) => question[`option_${letter.toLowerCase()}`]

// Filtros do banco: matéria, fonte (ex.: "VUNESP · TJSP 2017") e texto livre.
function applyFilters(query, { subjectId, source, search }) {
  if (subjectId) query = query.eq('subject_id', subjectId)
  if (source) query = query.eq('source', source)
  if (search?.trim()) {
    // vírgulas e parênteses têm significado especial no filtro .or() do PostgREST
    const term = search.trim().replace(/[%,()*]/g, ' ')
    query = query.or(`statement.ilike.%${term}%,topic.ilike.%${term}%`)
  }
  return query
}

// Ordem estável: agrupa por fonte (ano da prova), depois por data; o id desempata
// (sem isso, linhas com a mesma data podem repetir ou sumir entre uma página e outra).
const sortQuery = (query) =>
  query
    .order('source', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true })
    .order('id', { ascending: true })

export async function listQuestions({ subjectId, source, search, page = 0 }) {
  let query = supabase
    .from('questions')
    .select('id, topic, statement, correct_option, source, subject_id, subjects(name)', {
      count: 'exact',
    })
  query = sortQuery(applyFilters(query, { subjectId, source, search })).range(
    page * PAGE_SIZE,
    page * PAGE_SIZE + PAGE_SIZE - 1,
  )

  const { data, error, count } = await query
  if (error) throw error
  return { rows: data, count }
}

// Ids de TODAS as questões do filtro (até o limite), na mesma ordem da lista.
// Usado para "Resolver todas as filtradas" e "Resolver a partir desta".
export const MAX_SESSION = 200

export async function listFilteredIds(filters, limit = MAX_SESSION) {
  const { data, error } = await sortQuery(applyFilters(supabase.from('questions').select('id'), filters)).limit(limit)
  if (error) throw error
  return data.map((r) => r.id)
}

// Fontes existentes (para o filtro por prova/ano).
export async function listSources() {
  const { data, error } = await supabase.from('questions').select('source').not('source', 'is', null).limit(1000)
  if (error) throw error
  return [...new Set(data.map((r) => r.source))].sort((x, y) => x.localeCompare(y, 'pt-BR'))
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
  const CHUNK = 40 // ids vão na URL: lotes pequenos evitam estourar o tamanho dela
  const found = new Map()
  for (let i = 0; i < ids.length; i += CHUNK) {
    const { data, error } = await supabase.from('questions').select('*').in('id', ids.slice(i, i + CHUNK))
    if (error) throw error
    for (const q of data) found.set(q.id, q)
  }
  return ids.map((id) => found.get(id)).filter(Boolean) // mantém a ordem pedida
}

// Mensagem amigável quando a migration 0002 ainda não foi rodada no Supabase.
export function isMissingSchema(error) {
  const text = `${error?.code ?? ''} ${error?.message ?? ''}`
  return /42P01|PGRST205|PGRST202|42883|does not exist|Could not find/i.test(text)
}

export const MIGRATION_HINT =
  'Falta rodar a migration 0002 no Supabase (SQL Editor → supabase/migrations/0002_simulados_caderno_metas.sql).'

export const MIGRATION_HINT_AULAS =
  'Falta rodar a migration 0003 no Supabase (SQL Editor → supabase/migrations/0003_aulas.sql).'
