import { supabase, isSupabaseConfigured } from '../supabaseClient'
import { readAll, writeAll } from '../localStore'

const HABITS_KEY = 'srp_habits'
const LOGS_KEY = 'srp_habit_logs'

export async function fetchHabits() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('active', true)
      .order('position', { ascending: true })
    if (error) throw error
    return data
  }
  return readAll(HABITS_KEY)
    .filter((h) => h.active !== false)
    .sort((a, b) => a.position - b.position)
}

export async function createHabit(name, icon = '✦') {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('habits')
      .insert({ name, icon })
      .select()
      .single()
    if (error) throw error
    return data
  }
  const all = readAll(HABITS_KEY)
  const item = {
    id: crypto.randomUUID(),
    name,
    icon,
    active: true,
    position: all.length,
    created_at: new Date().toISOString(),
  }
  writeAll(HABITS_KEY, [...all, item])
  return item
}

export async function deleteHabit(id) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('habits').delete().eq('id', id)
    if (error) throw error
    return
  }
  writeAll(
    HABITS_KEY,
    readAll(HABITS_KEY).filter((h) => h.id !== id)
  )
  writeAll(
    LOGS_KEY,
    readAll(LOGS_KEY).filter((l) => l.habit_id !== id)
  )
}

export async function fetchHabitLogs(date) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('date', date)
    if (error) throw error
    return data
  }
  return readAll(LOGS_KEY).filter((l) => l.date === date)
}

export async function fetchAllHabitLogs() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('habit_logs').select('*')
    if (error) throw error
    return data
  }
  return readAll(LOGS_KEY)
}

export async function setHabitLog(habitId, date, done) {
  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('habit_logs')
      .upsert(
        { habit_id: habitId, date, done },
        { onConflict: 'habit_id,date' }
      )
    if (error) throw error
    return
  }
  const all = readAll(LOGS_KEY)
  const existing = all.find((l) => l.habit_id === habitId && l.date === date)
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
        habit_id: habitId,
        date,
        done,
        created_at: new Date().toISOString(),
      },
    ])
  }
}
