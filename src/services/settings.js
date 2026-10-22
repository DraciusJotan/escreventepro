import { supabase } from '../lib/supabase'

export const DEFAULT_WEEKLY_GOAL = 100

export async function getWeeklyGoal() {
  const { data, error } = await supabase.from('user_settings').select('weekly_goal').maybeSingle()
  if (error) throw error
  return data?.weekly_goal ?? DEFAULT_WEEKLY_GOAL
}

export async function setWeeklyGoal(goal) {
  const { error } = await supabase
    .from('user_settings')
    .upsert({ weekly_goal: goal, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
  if (error) throw error
}
