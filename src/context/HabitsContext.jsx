import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import {
  fetchHabits,
  createHabit,
  deleteHabit,
  fetchAllHabitLogs,
  setHabitLog,
} from '../lib/data/habits'

const HabitsContext = createContext(null)

export function HabitsProvider({ children }) {
  const [habits, setHabits] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchHabits(), fetchAllHabitLogs()]).then(
      ([habitsData, logsData]) => {
        if (cancelled) return
        setHabits(habitsData)
        setLogs(logsData)
        setLoading(false)
      }
    )
    return () => {
      cancelled = true
    }
  }, [])

  const addHabit = useCallback(async (name, icon) => {
    const habit = await createHabit(name, icon)
    setHabits((prev) => [...prev, habit])
    return habit
  }, [])

  const removeHabit = useCallback(async (id) => {
    setHabits((prev) => prev.filter((h) => h.id !== id))
    setLogs((prev) => prev.filter((l) => l.habit_id !== id))
    await deleteHabit(id)
  }, [])

  const toggleHabitLog = useCallback(async (habitId, date) => {
    setLogs((prev) => {
      const existing = prev.find((l) => l.habit_id === habitId && l.date === date)
      const nextDone = existing ? !existing.done : true
      if (existing) {
        return prev.map((l) => (l === existing ? { ...l, done: nextDone } : l))
      }
      return [...prev, { habit_id: habitId, date, done: nextDone }]
    })
    const existing = logs.find((l) => l.habit_id === habitId && l.date === date)
    const nextDone = existing ? !existing.done : true
    await setHabitLog(habitId, date, nextDone)
  }, [logs])

  const value = useMemo(
    () => ({ habits, logs, loading, addHabit, removeHabit, toggleHabitLog }),
    [habits, logs, loading, addHabit, removeHabit, toggleHabitLog]
  )

  return (
    <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>
  )
}

export function useHabits() {
  const ctx = useContext(HabitsContext)
  if (!ctx) throw new Error('useHabits must be used within HabitsProvider')
  return ctx
}
