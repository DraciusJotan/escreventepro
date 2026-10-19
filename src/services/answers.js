import { supabase } from '../lib/supabase'
import { todayISO } from '../lib/dates'

// Quem confere o gabarito e atualiza a revisão espaçada é a função SQL submit_answer.
// Retorna { is_correct, correct_option, next_due }.
export async function submitAnswer(questionId, option, mode) {
  const { data, error } = await supabase.rpc('submit_answer', {
    p_question_id: questionId,
    p_option: option,
    p_mode: mode,
  })
  if (error) throw error
  return data
}

export async function countDueReviews() {
  const { count, error } = await supabase
    .from('review_items')
    .select('question_id', { count: 'exact', head: true })
    .lte('due_date', todayISO())
  if (error) throw error
  return count ?? 0
}

// Questões pendentes (vencidas ou de hoje), as mais atrasadas primeiro.
export async function listDueQuestions(limit = 50) {
  const { data, error } = await supabase
    .from('review_items')
    .select('due_date, questions(*)')
    .lte('due_date', todayISO())
    .order('due_date')
    .limit(limit)
  if (error) throw error
  return data.map((row) => row.questions).filter(Boolean)
}
