import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import {
  fetchAllBusinessEnvelopes,
  createBusinessEnvelope,
  deleteBusinessEnvelope,
} from '../lib/data/business'

const BusinessContext = createContext(null)

export function BusinessProvider({ children }) {
  const [envelopes, setEnvelopes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchAllBusinessEnvelopes()
      .then((data) => {
        if (!cancelled) setEnvelopes(data)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const addEnvelope = useCallback(async (name, amount) => {
    const created = await createBusinessEnvelope(name, amount)
    setEnvelopes((prev) => [...prev, created])
    return created
  }, [])

  const removeEnvelope = useCallback(async (id) => {
    setEnvelopes((prev) => prev.filter((e) => e.id !== id))
    await deleteBusinessEnvelope(id)
  }, [])

  const value = useMemo(
    () => ({ envelopes, loading, addEnvelope, removeEnvelope }),
    [envelopes, loading, addEnvelope, removeEnvelope]
  )

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>
}

export function useBusiness() {
  const ctx = useContext(BusinessContext)
  if (!ctx) throw new Error('useBusiness must be used within BusinessProvider')
  return ctx
}
