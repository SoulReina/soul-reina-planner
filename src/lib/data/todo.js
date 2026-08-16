import { supabase, isSupabaseConfigured } from '../supabaseClient'
import { readAll, writeAll } from '../localStore'

const KEY = 'srp_todo_items'

export async function fetchAllTodoItems() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('todo_items')
      .select('*')
      .order('position', { ascending: true })
    if (error) throw error
    return data
  }
  return readAll(KEY).sort((a, b) => a.position - b.position)
}

export async function createTodoItem(content) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('todo_items')
      .insert({ content })
      .select()
      .single()
    if (error) throw error
    return data
  }
  const all = readAll(KEY)
  const item = {
    id: crypto.randomUUID(),
    content,
    position: all.length,
    created_at: new Date().toISOString(),
  }
  writeAll(KEY, [...all, item])
  return item
}

export async function deleteTodoItem(id) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('todo_items').delete().eq('id', id)
    if (error) throw error
    return
  }
  writeAll(
    KEY,
    readAll(KEY).filter((t) => t.id !== id)
  )
}
