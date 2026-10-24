import { supabase } from '../lib/supabase'

export async function listLessons() {
  const { data, error } = await supabase
    .from('lessons')
    .select('id, subject_id, topic, edital_key, title, channel, url, kind, watched, created_at')
    .order('created_at', { ascending: true })
    .order('id', { ascending: true })
  if (error) throw error
  return data
}

export async function addLesson(lesson) {
  const { error } = await supabase.from('lessons').insert(lesson)
  if (error) throw error
}

// Insere várias de uma vez ignorando as que já existem (mesmo link). Devolve quantas foram novas.
// created_at crescente mantém a ordem original da lista (aula 1 antes da aula 2).
export async function addLessons(rows) {
  const base = Date.now()
  const prepared = rows.map((r, i) => ({ ...r, created_at: new Date(base + i).toISOString() }))
  const { data, error } = await supabase
    .from('lessons')
    .upsert(prepared, { onConflict: 'user_id,url', ignoreDuplicates: true })
    .select('id')
  if (error) throw error
  return data?.length ?? 0
}

export async function setWatched(id, watched) {
  const { error } = await supabase
    .from('lessons')
    .update({ watched, watched_at: watched ? new Date().toISOString() : null })
    .eq('id', id)
  if (error) throw error
}

export async function deleteLesson(id) {
  const { error } = await supabase.from('lessons').delete().eq('id', id)
  if (error) throw error
}
