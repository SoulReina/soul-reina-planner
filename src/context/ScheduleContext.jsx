import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import {
  fetchAllScheduleBlocks,
  createScheduleBlock,
  deleteScheduleBlock,
} from '../lib/data/schedule'

const ScheduleContext = createContext(null)

export function ScheduleProvider({ children }) {
  const [blocks, setBlocks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchAllScheduleBlocks()
      .then((data) => {
        if (!cancelled) setBlocks(data)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const addBlock = useCallback(async (date, block) => {
    const item = await createScheduleBlock(date, block)
    setBlocks((prev) =>
      [...prev, item].sort(
        (a, b) => a.date.localeCompare(b.date) || a.start_time.localeCompare(b.start_time)
      )
    )
    return item
  }, [])

  const removeBlock = useCallback(async (id) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id))
    await deleteScheduleBlock(id)
  }, [])

  const value = useMemo(
    () => ({ blocks, loading, addBlock, removeBlock }),
    [blocks, loading, addBlock, removeBlock]
  )

  return (
    <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>
  )
}

export function useSchedule() {
  const ctx = useContext(ScheduleContext)
  if (!ctx) throw new Error('useSchedule must be used within ScheduleProvider')
  return ctx
}

export function useScheduleForDate(date) {
  const { blocks, loading, addBlock, removeBlock } = useSchedule()
  const forDate = blocks.filter((b) => b.date === date)
  return {
    blocks: forDate,
    loading,
    addBlock: (block) => addBlock(date, block),
    removeBlock,
  }
}
