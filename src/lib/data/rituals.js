import { supabase, isSupabaseConfigured } from '../supabaseClient'
import { readAll, writeAll } from '../localStore'

const RITUALS_KEY = 'srp_rituals'
const LOGS_KEY = 'srp_ritual_logs'

export async function fetchRituals() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('rituals')
      .select('*')
      .eq('active', true)
      .order('position', { ascending: true })
    if (error) throw error
    return data
  }
  return readAll(RITUALS_KEY)
    .filter((r) => r.active !== false)
    .sort((a, b) => a.position - b.position)
}

export async function createRitual(name, type) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('rituals')
      .insert({ name, type })
      .select()
      .single()
    if (error) throw error
    return data
  }
  const all = readAll(RITUALS_KEY)
  const item = {
    id: crypto.randomUUID(),
    name,
    type,
    active: true,
    position: all.filter((r) => r.type === type).length,
    created_at: new Date().toISOString(),
  }
  writeAll(RITUALS_KEY, [...all, item])
  return item
}

export async function deleteRitual(id) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('rituals').delete().eq('id', id)
    if (error) throw error
    return
  }
  writeAll(
    RITUALS_KEY,
    readAll(RITUALS_KEY).filter((r) => r.id !== id)
  )
  writeAll(
    LOGS_KEY,
    readAll(LOGS_KEY).filter((l) => l.ritual_id !== id)
  )
}

export async function fetchAllRitualLogs() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('ritual_logs').select('*')
    if (error) throw error
    return data
  }
  return readAll(LOGS_KEY)
}

export async function setRitualLog(ritualId, date, done) {
  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('ritual_logs')
      .upsert(
        { ritual_id: ritualId, date, done },
        { onConflict: 'ritual_id,date' }
      )
    if (error) throw error
    return
  }
  const all = readAll(LOGS_KEY)
  const existing = all.find((l) => l.ritual_id === ritualId && l.date === date)
  if (existing) {
    writeAll(
      LOGS_KEY,
      all.map((l) => (l === existing ? { ...l, done } : l))
    )
  } else {
    writeAll(LOGS_KEY, [
      ...all,
      {
        id: crypto.randomUUID(),
        ritual_id: ritualId,
        date,
        done,
        created_at: new Date().toISOString(),
      },
    ])
  }
}
