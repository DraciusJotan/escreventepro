import { supabase } from '../lib/supabase'

export async function getSubjectStats() {
  const { data, error } = await supabase.rpc('subject_stats')
  if (error) throw error
  return data
}

// Retorna [{ day: 'AAAA-MM-DD', total, correct }]
export async function getDailyActivity(start, end) {
  const { data, error } = await supabase.rpc('daily_activity', { p_start: start, p_end: end })
  if (error) throw error
  return data
}

// Poucas respostas distorcem a porcentagem (1 erro em 1 tentativa = 0%).
export const MIN_ANSWERS_FOR_RANKING = 10

export const percent = (correct, total) => (total ? Math.round((correct / total) * 100) : 0)

export function weakestSubjects(stats, count = 3) {
  return stats
    .filter((s) => s.total >= MIN_ANSWERS_FOR_RANKING)
    .sort((a, b) => a.correct / a.total - b.correct / b.total)
    .slice(0, count)
}
