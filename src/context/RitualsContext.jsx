import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import {
  fetchRituals,
  createRitual,
  deleteRitual,
  fetchAllRitualLogs,
  setRitualLog,
} from '../lib/data/rituals'

const RitualsContext = createContext(null)

export function RitualsProvider({ children }) {
  const [rituals, setRituals] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchRituals(), fetchAllRitualLogs()]).then(
      ([ritualsData, logsData]) => {
        if (cancelled) return
        setRituals(ritualsData)
        setLogs(logsData)
        setLoading(false)
      }
    )
    return () => {
      cancelled = true
    }
  }, [])

  const addRitual = useCallback(async (name, type) => {
    const ritual = await createRitual(name, type)
    setRituals((prev) => [...prev, ritual])
    return ritual
  }, [])

  const removeRitual = useCallback(async (id) => {
    setRituals((prev) => prev.filter((r) => r.id !== id))
    setLogs((prev) => prev.filter((l) => l.ritual_id !== id))
    await deleteRitual(id)
  }, [])

  const toggleRitualLog = useCallback(
    async (ritualId, date) => {
      const existing = logs.find((l) => l.ritual_id === ritualId && l.date === date)
      const nextDone = existing ? !existing.done : true
      setLogs((prev) => {
        const found = prev.find((l) => l.ritual_id === ritualId && l.date === date)
        if (found) {
          return prev.map((l) => (l === found ? { ...l, done: nextDone } : l))
        }
        return [...prev, { ritual_id: ritualId, date, done: nextDone }]
      })
      await setRitualLog(ritualId, date, nextDone)
    },
    [logs]
  )

  const value = useMemo(
    () => ({ rituals, logs, loading, addRitual, removeRitual, toggleRitualLog }),
    [rituals, logs, loading, addRitual, removeRitual, toggleRitualLog]
  )

  return (
    <RitualsContext.Provider value={value}>{children}</RitualsContext.Provider>
  )
}

export function useRituals() {
  const ctx = useContext(RitualsContext)
  if (!ctx) throw new Error('useRituals must be used within RitualsProvider')
  return ctx
}
