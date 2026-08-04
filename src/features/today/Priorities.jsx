import { useMemo, useState } from 'react'
import { usePrioritiesForDate } from '../../context/PrioritiesContext'
import {
  PRIORITY_LEVELS,
  PRIORITY_LEVEL_LABELS,
  levelRank,
} from '../../lib/data/priorities'
import { PlusIcon, TrashIcon } from '../../components/icons'

export default function Priorities({ date }) {
  const {
    priorities,
    loading,
    addPriority,
    togglePriority,
    updatePriorityLevel,
    removePriority,
  } = usePrioritiesForDate(date)
  const [draft, setDraft] = useState('')
  const [draftLevel, setDraftLevel] = useState('a_faire')

  const sorted = useMemo(
    () =>
      [...priorities].sort(
        (a, b) => levelRank(a.level) - levelRank(b.level) || a.position - b.position
      ),
    [priorities]
  )

  async function handleAdd(e) {
    e.preventDefault()
    const content = draft.trim()
    if (!content) return
    setDraft('')
    await addPriority(content, draftLevel)
  }

  return (
    <div className="card">
      <h2 className="card-title">
        Priorités du jour
        <small>Ce qui compte vraiment, aujourd’hui</small>
      </h2>

      {loading ? (
        <p className="empty-hint">Chargement…</p>
      ) : sorted.length === 0 ? (
        <p className="empty-hint">Aucune priorité pour l’instant.</p>
      ) : (
        <ul className="priority-list">
          {sorted.map((item) => (
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
          ))}
        </ul>
      )}

      <form className="inline-form" onSubmit={handleAdd}>
        <input
          className="input"
          type="text"
          placeholder="Ajouter une priorité…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <select
          className="input priorities-level-select"
          value={draftLevel}
          onChange={(e) => setDraftLevel(e.target.value)}
          aria-label="Niveau de la nouvelle priorité"
        >
          {PRIORITY_LEVELS.map((l) => (
            <option key={l} value={l}>
              {PRIORITY_LEVEL_LABELS[l]}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn-icon" aria-label="Ajouter">
          <PlusIcon width={16} height={16} />
        </button>
      </form>
    </div>
  )
}
