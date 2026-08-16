import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import { useTodoItems } from '../context/TodoContext'
import { usePriorities } from '../context/PrioritiesContext'
import { PRIORITY_LEVELS, PRIORITY_LEVEL_LABELS } from '../lib/data/priorities'
import { PlusIcon, TrashIcon } from '../components/icons'
import { todayISO } from '../utils/date'
import './TodoList.css'

function TodoRow({ item, onRemove, onConvert }) {
  const [converting, setConverting] = useState(false)
  const [date, setDate] = useState(todayISO())
  const [level, setLevel] = useState('a_faire')

  async function handleConfirm(e) {
    e.preventDefault()
    await onConvert(item, date, level)
  }

  return (
    <li className="todo-item">
      <div className="todo-item__row">
        <span className="todo-item__text">{item.content}</span>
        <div className="todo-item__actions">
          <button
            type="button"
            className="btn btn-ghost todo-item__convert"
            onClick={() => setConverting((c) => !c)}
          >
            Transformer en tâche
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            onClick={() => onRemove(item.id)}
            aria-label="Supprimer"
          >
            <TrashIcon width={14} height={14} />
          </button>
        </div>
      </div>

      {converting && (
        <form className="todo-item__convert-form" onSubmit={handleConfirm}>
          <input
            className="input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <select
            className="input"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            aria-label="Niveau de la tâche"
          >
            {PRIORITY_LEVELS.map((l) => (
              <option key={l} value={l}>
                {PRIORITY_LEVEL_LABELS[l]}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-icon" aria-label="Confirmer">
            <PlusIcon width={16} height={16} />
          </button>
        </form>
      )}
    </li>
  )
}

export default function TodoList() {
  const { items, loading, addItem, removeItem } = useTodoItems()
  const { addPriority } = usePriorities()
  const [draft, setDraft] = useState('')

  async function handleAdd(e) {
    e.preventDefault()
    const content = draft.trim()
    if (!content) return
    setDraft('')
    await addItem(content)
  }

  async function handleConvert(item, date, level) {
    await addPriority(date, item.content, level)
    await removeItem(item.id)
  }

  return (
    <>
      <PageHeader
        eyebrow="Idées"
        title="To Do Liste"
        subtitle="Ce qui n’est pas urgent, pas encore planifié"
      />
      <div className="page-content">
        <div className="card">
          {loading ? (
            <p className="empty-hint">Chargement…</p>
          ) : items.length === 0 ? (
            <p className="empty-hint">Aucune idée pour l’instant.</p>
          ) : (
            <ul className="todo-list">
              {items.map((item) => (
                <TodoRow
                  key={item.id}
                  item={item}
                  onRemove={removeItem}
                  onConvert={handleConvert}
                />
              ))}
            </ul>
          )}

          <form className="inline-form" onSubmit={handleAdd}>
            <input
              className="input"
              type="text"
              placeholder="Ajouter une idée…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button type="submit" className="btn btn-icon" aria-label="Ajouter">
              <PlusIcon width={16} height={16} />
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
