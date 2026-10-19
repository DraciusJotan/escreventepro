import { supabase } from '../lib/supabase'

export async function listSubjects() {
  const { data, error } = await supabase
    .from('subjects')
    .select('id, name, sort_order')
    .order('sort_order')
    .order('name')
  if (error) throw error
  return data
}

export async function createSubject(name) {
  const { data: last } = await supabase
    .from('subjects')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
  const sort_order = (last?.[0]?.sort_order ?? 0) + 1
  const { data, error } = await supabase
    .from('subjects')
    .insert({ name: name.trim(), sort_order })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function renameSubject(id, name) {
  const { error } = await supabase.from('subjects').update({ name: name.trim() }).eq('id', id)
  if (error) throw error
}

export async function deleteSubject(id) {
  const { error } = await supabase.from('subjects').delete().eq('id', id)
  if (error) throw error
}

// Traduz erros do Postgres para mensagens que fazem sentido na tela.
export function subjectErrorMessage(error) {
  if (error.code === '23505') return 'Já existe uma matéria com esse nome.'
  if (error.code === '23503') return 'Esta matéria tem questões. Mova ou exclua as questões antes.'
  return error.message
}
