import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import {
  fetchAllPriorities,
  createPriority,
  setPriorityDone,
  deletePriority,
} from '../lib/data/priorities'

const PrioritiesContext = createContext(null)

export function PrioritiesProvider({ children }) {
  const [priorities, setPriorities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchAllPriorities()
      .then((data) => {
        if (!cancelled) setPriorities(data)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const addPriority = useCallback(async (date, content) => {
    const item = await createPriority(date, content)
    setPriorities((prev) => [...prev, item])
    return item
  }, [])

  const togglePriority = useCallback(async (item) => {
    const nextDone = !item.is_done
    setPriorities((prev) =>
      prev.map((p) => (p.id === item.id ? { ...p, is_done: nextDone } : p))
    )
    await setPriorityDone(item.id, nextDone)
  }, [])

  const removePriority = useCallback(async (id) => {
    setPriorities((prev) => prev.filter((p) => p.id !== id))
    await deletePriority(id)
  }, [])

  const value = useMemo(
    () => ({ priorities, loading, addPriority, togglePriority, removePriority }),
    [priorities, loading, addPriority, togglePriority, removePriority]
  )

  return (
    <PrioritiesContext.Provider value={value}>
      {children}
    </PrioritiesContext.Provider>
  )
}

export function usePriorities() {
  const ctx = useContext(PrioritiesContext)
  if (!ctx) throw new Error('usePriorities must be used within PrioritiesProvider')
  return ctx
}

export function usePrioritiesForDate(date) {
  const { priorities, loading, addPriority, togglePriority, removePriority } =
    usePriorities()
  const forDate = priorities.filter((p) => p.date === date)
  return {
    priorities: forDate,
    loading,
    addPriority: (content) => addPriority(date, content),
    togglePriority,
    removePriority,
  }
}
