import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { fetchAllTodoItems, createTodoItem, deleteTodoItem } from '../lib/data/todo'

const TodoContext = createContext(null)

export function TodoProvider({ children }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchAllTodoItems()
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

  const addItem = useCallback(async (content) => {
    const item = await createTodoItem(content)
    setItems((prev) => [...prev, item])
    return item
  }, [])

  const removeItem = useCallback(async (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
    await deleteTodoItem(id)
  }, [])

  const value = useMemo(
    () => ({ items, loading, addItem, removeItem }),
    [items, loading, addItem, removeItem]
  )

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>
}

export function useTodoItems() {
  const ctx = useContext(TodoContext)
  if (!ctx) throw new Error('useTodoItems must be used within TodoProvider')
  return ctx
}
