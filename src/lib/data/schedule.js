import { supabase, isSupabaseConfigured } from '../supabaseClient'
import { readAll, writeAll } from '../localStore'

const KEY = 'srp_schedule_blocks'

export async function fetchScheduleBlocks(date) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('schedule_blocks')
      .select('*')
      .eq('date', date)
      .order('start_time', { ascending: true })
    if (error) throw error
    return data
  }
  return readAll(KEY)
    .filter((b) => b.date === date)
    .sort((a, b) => a.start_time.localeCompare(b.start_time))
}

export async function fetchAllScheduleBlocks() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('schedule_blocks')
      .select('*')
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })
    if (error) throw error
    return data
  }
  return readAll(KEY).sort(
    (a, b) => a.date.localeCompare(b.date) || a.start_time.localeCompare(b.start_time)
  )
}

export async function createScheduleBlock(date, block) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('schedule_blocks')
      .insert({ date, ...block })
      .select()
      .single()
    if (error) throw error
    return data
  }
  const item = {
    id: crypto.randomUUID(),
    date,
    ...block,
    created_at: new Date().toISOString(),
  }
  writeAll(KEY, [...readAll(KEY), item])
  return item
}

export async function deleteScheduleBlock(id) {
  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('schedule_blocks')
      .delete()
      .eq('id', id)
    if (error) throw error
    return
  }
  writeAll(
    KEY,
    readAll(KEY).filter((b) => b.id !== id)
  )
}
