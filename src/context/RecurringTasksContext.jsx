import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import {
  fetchRecurringTasks,
  createRecurringTask,
  updateRecurringTaskWeekdays,
  deleteRecurringTask,
  fetchAllRecurringTaskLogs,
  setRecurringTaskLog,
} from '../lib/data/recurringTasks'

const RecurringTasksContext = createContext(null)

export function RecurringTasksProvider({ children }) {
  const [tasks, setTasks] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchRecurringTasks(), fetchAllRecurringTaskLogs()]).then(
      ([tasksData, logsData]) => {
        if (cancelled) return
        setTasks(tasksData)
        setLogs(logsData)
        setLoading(false)
      }
    )
    return () => {
      cancelled = true
    }
  }, [])

  const addRecurringTask = useCallback(async (title, weekdays, level) => {
    const task = await createRecurringTask(title, weekdays, level)
    setTasks((prev) => [...prev, task])
    return task
  }, [])

  const updateWeekdays = useCallback(async (id, weekdays) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, weekdays } : t)))
    await updateRecurringTaskWeekdays(id, weekdays)
  }, [])

  const removeRecurringTask = useCallback(async (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    setLogs((prev) => prev.filter((l) => l.recurring_task_id !== id))
    await deleteRecurringTask(id)
  }, [])

  const toggleRecurringTaskLog = useCallback(
    async (taskId, date) => {
      const existing = logs.find((l) => l.recurring_task_id === taskId && l.date === date)
      const nextDone = existing ? !existing.done : true
      setLogs((prev) => {
        const found = prev.find((l) => l.recurring_task_id === taskId && l.date === date)
        if (found) {
          return prev.map((l) => (l === found ? { ...l, done: nextDone } : l))
        }
        return [...prev, { recurring_task_id: taskId, date, done: nextDone }]
      })
      await setRecurringTaskLog(taskId, date, nextDone)
    },
    [logs]
  )

  const value = useMemo(
    () => ({
      tasks,
      logs,
      loading,
      addRecurringTask,
      updateWeekdays,
      removeRecurringTask,
      toggleRecurringTaskLog,
    }),
    [tasks, logs, loading, addRecurringTask, updateWeekdays, removeRecurringTask, toggleRecurringTaskLog]
  )

  return (
    <RecurringTasksContext.Provider value={value}>
      {children}
    </RecurringTasksContext.Provider>
  )
}

export function useRecurringTasks() {
  const ctx = useContext(RecurringTasksContext)
  if (!ctx) throw new Error('useRecurringTasks must be used within RecurringTasksProvider')
  return ctx
}
