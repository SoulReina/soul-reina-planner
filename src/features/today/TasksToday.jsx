import { useMemo, useState } from 'react'
import { usePrioritiesForDate } from '../../context/PrioritiesContext'
import { useRecurringTasks } from '../../context/RecurringTasksContext'
import {
  PRIORITY_LEVELS,
  PRIORITY_LEVEL_LABELS,
  levelRank,
} from '../../lib/data/priorities'
import { PlusIcon, TrashIcon } from '../../components/icons'
import { weekdayIndex } from '../../utils/date'

export default function TasksToday({ date }) {
  const {
    priorities,
    loading: prioritiesLoading,
    addPriority,
    togglePriority,
    updatePriorityLevel,
    removePriority,
  } = usePrioritiesForDate(date)
  const {
    tasks: recurringTasks,
    logs: recurringLogs,
    loading: recurringLoading,
    toggleRecurringTaskLog,
  } = useRecurringTasks()
  const [draft, setDraft] = useState('')
  const [draftLevel, setDraftLevel] = useState('a_faire')

  const weekday = weekdayIndex(date)

  const merged = useMemo(() => {
    const priorityItems = priorities.map((p) => ({
      kind: 'priority',
      id: p.id,
      text: p.content,
      level: p.level,
      done: p.is_done,
      position: p.position,
    }))
    const recurringItems = recurringTasks
      .filter((t) => t.weekdays.includes(weekday))
      .map((t) => {
        const log = recurringLogs.find(
          (l) => l.recurring_task_id === t.id && l.date === date
        )
        return {
          kind: 'recurring',
          id: t.id,
          text: t.title,
          level: t.level,
          done: Boolean(log?.done),
          position: 0,
        }
      })
    return [...priorityItems, ...recurringItems].sort(
      (a, b) => levelRank(a.level) - levelRank(b.level) || a.position - b.position
    )
  }, [priorities, recurringTasks, recurringLogs, weekday, date])

  async function handleAdd(e) {
    e.preventDefault()
    const content = draft.trim()
    if (!content) return
    setDraft('')
    await addPriority(content, draftLevel)
  }

  const loading = prioritiesLoading || recurringLoading

  return (
    <div className="card">
      <h2 className="card-title">
        Tâches du jour
        <small>Ponctuelles et récurrentes</small>
      </h2>

      {loading ? (
        <p className="empty-hint">Chargement…</p>
      ) : merged.length === 0 ? (
        <p className="empty-hint">Aucune tâche pour l’instant.</p>
      ) : (
        <ul className="priority-list">
          {merged.map((item) => (
            <li key={item.kind + item.id} className="checkbox-row">
              <input
                type="checkbox"
                checked={item.done}
                onChange={() =>
                  item.kind === 'priority'
                    ? togglePriority(priorities.find((p) => p.id === item.id))
                    : toggleRecurringTaskLog(item.id, date)
                }
                aria-label={`Marquer "${item.text}" comme fait`}
              />
              {item.kind === 'recurring' && (
                <span className="task-recurring-mark" title="Tâche récurrente">
                  ↻
                </span>
              )}
              <span className={'row-text' + (item.done ? ' done' : '')}>
                {item.text}
              </span>
              {item.kind === 'priority' ? (
                <select
                  className={'pill pill-' + item.level}
                  value={item.level}
                  onChange={(e) => updatePriorityLevel(item.id, e.target.value)}
                  aria-label={`Niveau de "${item.text}"`}
                >
                  {PRIORITY_LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {PRIORITY_LEVEL_LABELS[l]}
                    </option>
                  ))}
                </select>
              ) : (
                <span className={'pill pill-' + item.level}>
                  {PRIORITY_LEVEL_LABELS[item.level]}
                </span>
              )}
              {item.kind === 'priority' && (
                <button
                  type="button"
                  className="btn btn-ghost btn-icon"
                  onClick={() => removePriority(item.id)}
                  aria-label="Supprimer"
                >
                  <TrashIcon width={15} height={15} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <form className="inline-form" onSubmit={handleAdd}>
        <input
          className="input"
          type="text"
          placeholder="Ajouter une tâche…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <select
          className="input priorities-level-select"
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
        <button type="submit" className="btn btn-icon" aria-label="Ajouter">
          <PlusIcon width={16} height={16} />
        </button>
      </form>
    </div>
  )
}
