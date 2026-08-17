import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { fetchCycleSettings, saveCycleStartDate, DEFAULT_CYCLE_START } from '../lib/data/cycle'

const CycleContext = createContext(null)

export function CycleProvider({ children }) {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchCycleSettings()
      .then((data) => {
        if (!cancelled) setSettings(data)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const updateStartDate = useCallback(
    async (startDate) => {
      const saved = await saveCycleStartDate(settings?.id, startDate)
      setSettings(saved)
      return saved
    },
    [settings]
  )

  const value = useMemo(
    () => ({ startDate: settings?.start_date || DEFAULT_CYCLE_START, loading, updateStartDate }),
    [settings, loading, updateStartDate]
  )

  return <CycleContext.Provider value={value}>{children}</CycleContext.Provider>
}

export function useCycle() {
  const ctx = useContext(CycleContext)
  if (!ctx) throw new Error('useCycle must be used within CycleProvider')
  return ctx
}
