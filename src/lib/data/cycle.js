import { supabase, isSupabaseConfigured } from '../supabaseClient'
import { startOfWeek, todayISO } from '../../utils/date'

const KEY = 'srp_cycle_settings'

export const DEFAULT_CYCLE_START = '2026-08-17'

export async function fetchCycleSettings() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('cycle_settings')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
    if (error) throw error
    return data[0] || null
  }
  const raw = localStorage.getItem(KEY)
  return raw ? JSON.parse(raw) : null
}

export async function saveCycleStartDate(id, startDate) {
  const start_date = startOfWeek(startDate || todayISO())
  if (isSupabaseConfigured) {
    if (id) {
      const { data, error } = await supabase
        .from('cycle_settings')
        .update({ start_date, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    }
    const { data, error } = await supabase
      .from('cycle_settings')
      .insert({ start_date })
      .select()
      .single()
    if (error) throw error
    return data
  }
  const settings = {
    id: id || crypto.randomUUID(),
    start_date,
    updated_at: new Date().toISOString(),
  }
  localStorage.setItem(KEY, JSON.stringify(settings))
  return settings
}
