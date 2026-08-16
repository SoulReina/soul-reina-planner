import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import { usePriorities } from '../context/PrioritiesContext'
import { useTodoItems } from '../context/TodoContext'
import {
  PRIORITY_LEVELS,
  PRIORITY_LEVEL_LABELS,
} from '../lib/data/priorities'
import { PlusIcon, TrashIcon } from '../components/icons'
import { todayISO, formatShortDateFR } from '../utils/date'
import './Tasks.css'

const FILTERS = [
  { key: 'today', label: 'Aujourd’hui' },
  { key: 'upcoming', label: 'À venir' },
  { key: 'done', label: 'Terminées' },
  { key: 'all', label: 'Toutes' },
]

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

function IdeasSection() {
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
    <div className="card">
      <h2 className="card-title">
        Idées
        <small>Ce qui n’est pas urgent, pas encore planifié</small>
      </h2>
      {loading ? (
        <p className="empty-hint">Chargement…</p>
      ) : items.length === 0 ? (
        <p className="empty-hint">Aucune idée pour l’instant.</p>
      ) : (
        <ul className="todo-list">
          {items.map((item) => (
            <TodoRow key={item.id} item={item} onRemove={removeItem} onConvert={handleConvert} />
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
  )
}

export default function Tasks() {
  const {
    priorities,
    loading,
    addPriority,
    togglePriority,
    updatePriorityLevel,
    removePriority,
  } = usePriorities()
  const [filter, setFilter] = useState('today')
  const [draft, setDraft] = useState('')
  const [draftDate, setDraftDate] = useState(todayISO())
  const [draftLevel, setDraftLevel] = useState('a_faire')
  const today = todayISO()

  const filtered = useMemo(() => {
    const sorted = [...priorities].sort(
      (a, b) => a.date.localeCompare(b.date) || a.position - b.position
    )
    switch (filter) {
      case 'today':
        return sorted.filter((p) => p.date === today)
      case 'upcoming':
        return sorted.filter((p) => p.date > today && !p.is_done)
      case 'done':
        return sorted.filter((p) => p.is_done)
      default:
        return sorted
    }
  }, [priorities, filter, today])

  const byLevel = useMemo(() => {
    const map = new Map(PRIORITY_LEVELS.map((l) => [l, []]))
    filtered.forEach((item) => {
      const level = PRIORITY_LEVELS.includes(item.level) ? item.level : 'a_faire'
      map.get(level).push(item)
    })
    return map
  }, [filtered])

  async function handleAdd(e) {
    e.preventDefault()
    const content = draft.trim()
    if (!content) return
    setDraft('')
    await addPriority(draftDate, content, draftLevel)
  }

  function renderItem(item) {
    return (
      <li key={item.id} className="checkbox-row task-row">
        <input
          type="checkbox"
          checked={item.is_done}
          onChange={() => togglePriority(item)}
          aria-label={`Marquer "${item.content}" comme fait`}
        />
        <div className="task-row__body">
          <span className={'row-text' + (item.is_done ? ' done' : '')}>
            {item.content}
          </span>
          {filter !== 'today' && (
            <span className="task-row__date">
              {item.date === today ? 'Aujourd’hui' : formatShortDateFR(item.date)}
            </span>
          )}
        </div>
        <select
          className={'pill pill-' + item.level}
          value={item.level}
          onChange={(e) => updatePriorityLevel(item.id, e.target.value)}
          aria-label={`Niveau de "${item.content}"`}
        >
          {PRIORITY_LEVELS.map((l) => (
            <option key={l} value={l}>
              {PRIORITY_LEVEL_LABELS[l]}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="btn btn-ghost btn-icon"
          onClick={() => removePriority(item.id)}
          aria-label="Supprimer"
        >
          <TrashIcon width={15} height={15} />
        </button>
      </li>
    )
  }

  return (
    <>
      <PageHeader
        eyebrow="À faire"
        title="Tâches"
        subtitle="Classées par niveau de priorité"
      />
      <div className="page-content">
        <div className="card">
          <div className="tabs">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                className={'tabs__btn' + (filter === f.key ? ' is-active' : '')}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="empty-hint">Chargement…</p>
          ) : filtered.length === 0 ? (
            <p className="empty-hint">Rien ici pour l’instant.</p>
          ) : (
            <div className="tasks-groups">
              {PRIORITY_LEVELS.map((level) => {
                const items = byLevel.get(level)
                if (!items || items.length === 0) return null
                return (
                  <div key={level} className="tasks-group">
                    <h3 className="tasks-group__date">
                      {PRIORITY_LEVEL_LABELS[level]}
                      <span className="tasks-group__count">{items.length}</span>
                    </h3>
                    <ul className="priority-list">{items.map(renderItem)}</ul>
                  </div>
                )
              })}
            </div>
          )}

          <form className="tasks-form" onSubmit={handleAdd}>
            <input
              className="input"
              type="text"
              placeholder="Ajouter une tâche…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <div className="tasks-form__row">
              <select
                className="input"
                value={draftLevel}
                onChange={(e) => setDraftLevel(e.target.value)}
                aria-label="Niveau de la nouvelle tâche"
              >
                {PRIORITY_LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {PRIORITY_LEVEL_LABELS[l]}
                  </option>
                ))}
              </select>
              <input
                className="input"
                type="date"
                value={draftDate}
                onChange={(e) => setDraftDate(e.target.value)}
              />
              <button type="submit" className="btn btn-icon" aria-label="Ajouter">
                <PlusIcon width={16} height={16} />
              </button>
            </div>
          </form>
        </div>

        <IdeasSection />
      </div>
    </>
  )
}
