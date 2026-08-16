import { supabase, isSupabaseConfigured } from '../supabaseClient'

const KEY = 'srp_note'

export async function fetchNote() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
    if (error) throw error
    return data[0] || null
  }
  const raw = localStorage.getItem(KEY)
  return raw ? JSON.parse(raw) : null
}

export async function saveNote(id, content) {
  if (isSupabaseConfigured) {
    if (id) {
      const { data, error } = await supabase
        .from('notes')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    }
    const { data, error } = await supabase
      .from('notes')
      .insert({ content })
      .select()
      .single()
    if (error) throw error
    return data
  }
  const note = {
    id: id || crypto.randomUUID(),
    content,
    updated_at: new Date().toISOString(),
  }
  localStorage.setItem(KEY, JSON.stringify(note))
  return note
}
