import { supabase } from '../lib/supabase'

// Salva o resultado de um simulado. items: [{ q, sel, ok }]
export async function saveExam(exam) {
  const { data, error } = await supabase.from('exams').insert(exam).select('id').single()
  if (error) throw error
  return data.id
}

export async function listExams(limit = 50) {
  const { data, error } = await supabase
    .from('exams')
    .select('id, title, finished_at, time_limit_seconds, time_used_seconds, total, correct')
    .order('finished_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

export async function getExam(id) {
  const { data, error } = await supabase.from('exams').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function deleteExam(id) {
  const { error } = await supabase.from('exams').delete().eq('id', id)
  if (error) throw error
}

export const formatDuration = (seconds) => {
  const s = Math.max(0, Math.round(seconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const ss = s % 60
  const pad = (n) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(ss)}` : `${pad(m)}:${pad(ss)}`
}
