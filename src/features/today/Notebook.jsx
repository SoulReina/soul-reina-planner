import { useEffect, useRef, useState } from 'react'
import { useNote } from '../../context/NoteContext'

const SAVE_DELAY = 600

export default function Notebook() {
  const { note, loading, updateNote } = useNote()
  const [value, setValue] = useState('')
  const [saved, setSaved] = useState(false)
  const initialized = useRef(false)
  const timeoutRef = useRef(null)

  useEffect(() => {
    if (!loading && !initialized.current) {
      setValue(note?.content || '')
      initialized.current = true
    }
  }, [loading, note])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  function handleChange(e) {
    const next = e.target.value
    setValue(next)
    setSaved(false)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(async () => {
      await updateNote(next)
      setSaved(true)
    }, SAVE_DELAY)
  }

  return (
    <div className="card">
      <h2 className="card-title">
        Pense-bête
        <small>{saved ? 'Enregistré' : 'Notes libres'}</small>
      </h2>
      {loading ? (
        <p className="empty-hint">Chargement…</p>
      ) : (
        <textarea
          className="input notebook-textarea"
          rows={5}
          placeholder="Un rappel, une idée, quelque chose à ne pas oublier…"
          value={value}
          onChange={handleChange}
        />
      )}
    </div>
  )
}
