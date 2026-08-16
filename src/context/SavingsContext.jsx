import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { todayISO } from '../utils/date'
import {
  fetchAllEnvelopes,
  createEnvelope,
  deleteEnvelope,
  fetchAllMovements,
  addMovement,
} from '../lib/data/savings'

const SavingsContext = createContext(null)

export function SavingsProvider({ children }) {
  const [envelopes, setEnvelopes] = useState([])
  const [movements, setMovements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchAllEnvelopes(), fetchAllMovements()]).then(
      ([envelopesData, movementsData]) => {
        if (cancelled) return
        setEnvelopes(envelopesData)
        setMovements(movementsData)
        setLoading(false)
      }
    )
    return () => {
      cancelled = true
    }
  }, [])

  const addEnvelope = useCallback(async (name, goalAmount) => {
    const envelope = await createEnvelope(name, goalAmount)
    setEnvelopes((prev) => [...prev, envelope])
    return envelope
  }, [])

  const removeEnvelope = useCallback(async (id) => {
    setEnvelopes((prev) => prev.filter((e) => e.id !== id))
    setMovements((prev) => prev.filter((m) => m.envelope_id !== id))
    await deleteEnvelope(id)
  }, [])

  const addEnvelopeMovement = useCallback(async (envelope, amount, note, month = todayISO()) => {
    const { movement, envelope: updatedEnvelope } = await addMovement(
      envelope,
      amount,
      note,
      month
    )
    setMovements((prev) => [movement, ...prev])
    setEnvelopes((prev) => prev.map((e) => (e.id === envelope.id ? updatedEnvelope : e)))
    return movement
  }, [])

  const getEnvelopeBySlug = useCallback(
    (slug) => envelopes.find((e) => e.slug === slug) || null,
    [envelopes]
  )

  const value = useMemo(
    () => ({
      envelopes,
      movements,
      loading,
      addEnvelope,
      removeEnvelope,
      addEnvelopeMovement,
      getEnvelopeBySlug,
    }),
    [
      envelopes,
      movements,
      loading,
      addEnvelope,
      removeEnvelope,
      addEnvelopeMovement,
      getEnvelopeBySlug,
    ]
  )

  return <SavingsContext.Provider value={value}>{children}</SavingsContext.Provider>
}

export function useSavings() {
  const ctx = useContext(SavingsContext)
  if (!ctx) throw new Error('useSavings must be used within SavingsProvider')
  return ctx
}
