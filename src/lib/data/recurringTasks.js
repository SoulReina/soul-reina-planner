import { supabase, isSupabaseConfigured } from '../supabaseClient'
import { readAll, writeAll } from '../localStore'

const TASKS_KEY = 'srp_recurring_tasks'
const LOGS_KEY = 'srp_recurring_task_logs'

export const RECURRING_TASK_CATEGORIES = [
  { id: 'business_soulreina', label: 'Business SoulReina', color: '#F7D7E3' },
  { id: 'business_reinacare', label: 'Business ReinaCare', color: '#D6E6F7' },
  { id: 'menage', label: 'Ménage', color: '#DCEEDC' },
  { id: 'beaute_sante', label: 'Beauté/Santé', color: '#E6DCF3' },
  { id: 'vie_personnelle', label: 'Vie personnelle', color: '#FBF1C7' },
]

export function categoryById(id) {
  return RECURRING_TASK_CATEGORIES.find((c) => c.id === id) || null
}

// weekdays vide = récurrente tous les jours (compat. tâches créées avant le
// sélecteur de jours). Sinon la tâche n'apparaît que les jours cochés
// (0=lundi..6=dimanche, cf. utils/date.js#weekdayIndex).
export function isScheduledOnWeekday(task, weekday) {
  return !task.weekdays || task.weekdays.length === 0 || task.weekdays.includes(weekday)
}

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

export async function createRecurringTask(title, weekdays = [], category = null) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('recurring_tasks')
      .insert({ title, weekdays, category })
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
    category,
    active: true,
    position: all.length,
    created_at: new Date().toISOString(),
  }
  writeAll(TASKS_KEY, [...all, item])
  return item
}

export async function updateRecurringTask(id, updates) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('recurring_tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }
  const all = readAll(TASKS_KEY)
  const updated = all.map((t) => (t.id === id ? { ...t, ...updates } : t))
  writeAll(TASKS_KEY, updated)
  return updated.find((t) => t.id === id)
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
