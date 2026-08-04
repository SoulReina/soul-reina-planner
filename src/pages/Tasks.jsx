import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import { usePriorities } from '../context/PrioritiesContext'
import { PlusIcon, TrashIcon } from '../components/icons'
import { todayISO, formatShortDateFR } from '../utils/date'
import './Tasks.css'

const FILTERS = [
  { key: 'today', label: 'Aujourd’hui' },
  { key: 'upcoming', label: 'À venir' },
  { key: 'done', label: 'Terminées' },
  { key: 'all', label: 'Toutes' },
]

export default function Tasks() {
  const { priorities, loading, addPriority, togglePriority, removePriority } =
    usePriorities()
  const [filter, setFilter] = useState('today')
  const [draft, setDraft] = useState('')
  const [draftDate, setDraftDate] = useState(todayISO())
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

  const grouped = useMemo(() => {
    if (filter === 'today') return null
    const map = new Map()
    filtered.forEach((item) => {
      if (!map.has(item.date)) map.set(item.date, [])
      map.get(item.date).push(item)
    })
    return map
  }, [filtered, filter])

  async function handleAdd(e) {
    e.preventDefault()
    const content = draft.trim()
    if (!content) return
    setDraft('')
    await addPriority(draftDate, content)
  }

  function renderItem(item) {
    return (
      <li key={item.id} className="checkbox-row">
        <input
          type="checkbox"
          checked={item.is_done}
          onChange={() => togglePriority(item)}
          aria-label={`Marquer "${item.content}" comme fait`}
        />
        <span className={'row-text' + (item.is_done ? ' done' : '')}>
          {item.content}
        </span>
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
        subtitle="Toutes tes priorités, jour par jour"
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
          ) : grouped ? (
            <div className="tasks-groups">
              {Array.from(grouped.entries()).map(([date, items]) => (
                <div key={date} className="tasks-group">
                  <h3 className="tasks-group__date">
                    {date === today ? 'Aujourd’hui' : formatShortDateFR(date)}
                  </h3>
                  <ul className="priority-list">{items.map(renderItem)}</ul>
                </div>
              ))}
            </div>
          ) : (
            <ul className="priority-list">{filtered.map(renderItem)}</ul>
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
      </div>
    </>
  )
}
