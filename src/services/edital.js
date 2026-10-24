import { supabase } from '../lib/supabase'

// Assuntos do edital que o usuário marcou como estudados: Set de chaves.
export async function listDoneTopics() {
  const { data, error } = await supabase.from('edital_progress').select('topic_key').eq('done', true)
  if (error) throw error
  return new Set(data.map((r) => r.topic_key))
}

export async function setTopicDone(topicKey, done) {
  const { error } = await supabase
    .from('edital_progress')
    .upsert({ topic_key: topicKey, done, updated_at: new Date().toISOString() }, { onConflict: 'user_id,topic_key' })
  if (error) throw error
}
