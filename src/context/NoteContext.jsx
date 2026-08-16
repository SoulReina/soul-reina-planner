import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { fetchNote, saveNote } from '../lib/data/notes'

const NoteContext = createContext(null)

export function NoteProvider({ children }) {
  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchNote()
      .then((data) => {
        if (!cancelled) setNote(data)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const updateNote = useCallback(
    async (content) => {
      const saved = await saveNote(note?.id, content)
      setNote(saved)
      return saved
    },
    [note]
  )

  const value = useMemo(
    () => ({ note, loading, updateNote }),
    [note, loading, updateNote]
  )

  return <NoteContext.Provider value={value}>{children}</NoteContext.Provider>
}

export function useNote() {
  const ctx = useContext(NoteContext)
  if (!ctx) throw new Error('useNote must be used within NoteProvider')
  return ctx
}
