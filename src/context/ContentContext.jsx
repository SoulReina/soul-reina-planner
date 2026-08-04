import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import {
  fetchAllContentItems,
  createContentItem,
  updateContentItem,
  deleteContentItem,
} from '../lib/data/content'

const ContentContext = createContext(null)

export function ContentProvider({ children }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchAllContentItems()
      .then((data) => {
        if (!cancelled) setItems(data)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const addItem = useCallback(async (item) => {
    const created = await createContentItem(item)
    setItems((prev) => [...prev, created])
    return created
  }, [])

  const patchItem = useCallback(async (id, patch) => {
    setItems((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
    await updateContentItem(id, patch)
  }, [])

  const removeItem = useCallback(async (id) => {
    setItems((prev) => prev.filter((c) => c.id !== id))
    await deleteContentItem(id)
  }, [])

  const value = useMemo(
    () => ({ items, loading, addItem, patchItem, removeItem }),
    [items, loading, addItem, patchItem, removeItem]
  )

  return (
    <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
  )
}

export function useContentItems() {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContentItems must be used within ContentProvider')
  return ctx
}
