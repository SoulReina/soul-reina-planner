import { supabase, isSupabaseConfigured } from '../supabaseClient'
import { readAll, writeAll } from '../localStore'

const KEY = 'srp_priorities'

export const PRIORITY_LEVELS = ['urgent', 'important', 'a_faire']

export const PRIORITY_LEVEL_LABELS = {
  urgent: 'Urgent',
  important: 'Important',
  a_faire: 'À faire',
}

export function levelRank(level) {
  const i = PRIORITY_LEVELS.indexOf(level)
  return i === -1 ? PRIORITY_LEVELS.length : i
}

export async function fetchPriorities(date) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('priorities')
      .select('*')
      .eq('date', date)
      .order('position', { ascending: true })
    if (error) throw error
    return data
  }
  return readAll(KEY)
    .filter((p) => p.date === date)
    .sort((a, b) => a.position - b.position)
}

export async function fetchAllPriorities() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('priorities')
      .select('*')
      .order('date', { ascending: true })
      .order('position', { ascending: true })
    if (error) throw error
    return data
  }
  return readAll(KEY).sort(
    (a, b) => a.date.localeCompare(b.date) || a.position - b.position
  )
}

export async function createPriority(date, content, level = 'a_faire') {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('priorities')
      .insert({ date, content, level })
      .select()
      .single()
    if (error) throw error
    return data
  }
  const all = readAll(KEY)
  const item = {
    id: crypto.randomUUID(),
    date,
    content,
    level,
    is_done: false,
    position: all.filter((p) => p.date === date).length,
    created_at: new Date().toISOString(),
  }
  writeAll(KEY, [...all, item])
  return item
}

export async function setPriorityDone(id, isDone) {
  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('priorities')
      .update({ is_done: isDone })
      .eq('id', id)
    if (error) throw error
    return
  }
  writeAll(
    KEY,
    readAll(KEY).map((p) => (p.id === id ? { ...p, is_done: isDone } : p))
  )
}

export async function setPriorityLevel(id, level) {
  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('priorities')
      .update({ level })
      .eq('id', id)
    if (error) throw error
    return
  }
  writeAll(
    KEY,
    readAll(KEY).map((p) => (p.id === id ? { ...p, level } : p))
  )
}

export async function deletePriority(id) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('priorities').delete().eq('id', id)
    if (error) throw error
    return
  }
  writeAll(
    KEY,
    readAll(KEY).filter((p) => p.id !== id)
  )
}
