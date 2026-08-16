import { supabase, isSupabaseConfigured } from '../supabaseClient'
import { readAll, writeAll } from '../localStore'

const TASKS_KEY = 'srp_recurring_tasks'
const LOGS_KEY = 'srp_recurring_task_logs'

export const WEEKDAY_SHORT_LABELS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export async function fetchRecurringTasks() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('recurring_tasks')
      .select('*')
      .eq('active', true)
      .order('position', { ascending: true })
    if (error) throw error
    return data
  }
  return readAll(TASKS_KEY)
    .filter((t) => t.active !== false)
    .sort((a, b) => a.position - b.position)
}

export async function createRecurringTask(title, weekdays, level = 'a_faire') {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('recurring_tasks')
      .insert({ title, weekdays, level })
      .select()
      .single()
    if (error) throw error
    return data
  }
  const all = readAll(TASKS_KEY)
  const item = {
    id: crypto.randomUUID(),
    title,
    weekdays,
    level,
    active: true,
    position: all.length,
    created_at: new Date().toISOString(),
  }
  writeAll(TASKS_KEY, [...all, item])
  return item
}

export async function updateRecurringTaskWeekdays(id, weekdays) {
  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('recurring_tasks')
      .update({ weekdays })
      .eq('id', id)
    if (error) throw error
    return
  }
  writeAll(
    TASKS_KEY,
    readAll(TASKS_KEY).map((t) => (t.id === id ? { ...t, weekdays } : t))
  )
}

export async function deleteRecurringTask(id) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('recurring_tasks').delete().eq('id', id)
    if (error) throw error
    return
  }
  writeAll(
    TASKS_KEY,
    readAll(TASKS_KEY).filter((t) => t.id !== id)
  )
  writeAll(
    LOGS_KEY,
    readAll(LOGS_KEY).filter((l) => l.recurring_task_id !== id)
  )
}

export async function fetchAllRecurringTaskLogs() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('recurring_task_logs').select('*')
    if (error) throw error
    return data
  }
  return readAll(LOGS_KEY)
}

export async function setRecurringTaskLog(taskId, date, done) {
  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('recurring_task_logs')
      .upsert(
        { recurring_task_id: taskId, date, done },
        { onConflict: 'recurring_task_id,date' }
      )
    if (error) throw error
    return
  }
  const all = readAll(LOGS_KEY)
  const existing = all.find((l) => l.recurring_task_id === taskId && l.date === date)
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
        recurring_task_id: taskId,
        date,
        done,
        created_at: new Date().toISOString(),
      },
    ])
  }
}
