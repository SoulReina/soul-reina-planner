import { supabase, isSupabaseConfigured } from '../supabaseClient'
import { readAll, writeAll } from '../localStore'

const KEY = 'srp_content_items'

export const CONTENT_STATUSES = ['idee', 'en_cours', 'planifie', 'publie']

export const CONTENT_STATUS_LABELS = {
  idee: 'Idée',
  en_cours: 'En cours',
  planifie: 'Planifié',
  publie: 'Publié',
}

export const CONTENT_PLATFORM_FAVORITES = ['TikTok', 'Instagram', 'Facebook', 'Threads']

export async function fetchAllContentItems() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('content_items')
      .select('*')
      .order('date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true })
    if (error) throw error
    return data
  }
  return readAll(KEY).sort((a, b) => {
    if (a.date && b.date) return a.date.localeCompare(b.date)
    if (a.date) return -1
    if (b.date) return 1
    return a.created_at.localeCompare(b.created_at)
  })
}

export async function createContentItem(item) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('content_items')
      .insert(item)
      .select()
      .single()
    if (error) throw error
    return data
  }
  const record = {
    id: crypto.randomUUID(),
    status: 'idee',
    platform: 'Instagram',
    date: null,
    notes: '',
    ...item,
    created_at: new Date().toISOString(),
  }
  writeAll(KEY, [...readAll(KEY), record])
  return record
}

export async function updateContentItem(id, patch) {
  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('content_items')
      .update(patch)
      .eq('id', id)
    if (error) throw error
    return
  }
  writeAll(
    KEY,
    readAll(KEY).map((c) => (c.id === id ? { ...c, ...patch } : c))
  )
}

export async function deleteContentItem(id) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('content_items').delete().eq('id', id)
    if (error) throw error
    return
  }
  writeAll(
    KEY,
    readAll(KEY).filter((c) => c.id !== id)
  )
}
