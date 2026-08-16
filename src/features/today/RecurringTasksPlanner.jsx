import { useState } from 'react'
import { useRecurringTasks } from '../../context/RecurringTasksContext'
import { WEEKDAY_SHORT_LABELS_FR } from '../../lib/data/recurringTasks'
import { PRIORITY_LEVELS, PRIORITY_LEVEL_LABELS } from '../../lib/data/priorities'
import { PlusIcon, TrashIcon } from '../../components/icons'
import '../../components/WeeklyCheckGrid.css'

export default function RecurringTasksPlanner() {
  const { tasks, loading, addRecurringTask, updateWeekdays, removeRecurringTask } =
    useRecurringTasks()
  const [draft, setDraft] = useState('')
  const [draftWeekdays, setDraftWeekdays] = useState([])
  const [draftLevel, setDraftLevel] = useState('a_faire')

  function toggleDraftWeekday(i) {
    setDraftWeekdays((prev) =>
      prev.includes(i) ? prev.filter((d) => d !== i) : [...prev, i].sort()
    )
  }

  function toggleTaskWeekday(task, i) {
    const next = task.weekdays.includes(i)
      ? task.weekdays.filter((d) => d !== i)
      : [...task.weekdays, i].sort()
    updateWeekdays(task.id, next)
  }

  async function handleAdd(e) {
    e.preventDefault()
    const title = draft.trim()
    if (!title || draftWeekdays.length === 0) return
    setDraft('')
    setDraftWeekdays([])
    await addRecurringTask(title, draftWeekdays, draftLevel)
  }

  return (
    <div className="card">
      <h2 className="card-title">
        Planning hebdomadaire
        <small>Tâches qui reviennent chaque semaine</small>
      </h2>

      {loading ? (
        <p className="empty-hint">Chargement…</p>
      ) : tasks.length === 0 ? (
        <p className="empty-hint">Aucune tâche récurrente pour l’instant.</p>
      ) : (
        <div className="weekly-grid-wrap">
          <table className="weekly-grid">
            <thead>
              <tr>
                <th className="weekly-grid__name-col" />
                {WEEKDAY_SHORT_LABELS_FR.map((label) => (
                  <th key={label} className="weekly-grid__day-head">
                    <span>{label}</span>
                  </th>
                ))}
                <th className="weekly-grid__name-col" />
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td className="weekly-grid__name">
                    <span>{task.title}</span>
                  </td>
                  {WEEKDAY_SHORT_LABELS_FR.map((label, i) => (
                    <td key={label} className="weekly-grid__cell">
                      <input
                        type="checkbox"
                        checked={task.weekdays.includes(i)}
                        onChange={() => toggleTaskWeekday(task, i)}
                        aria-label={`${task.title} — ${label}`}
                      />
                    </td>
                  ))}
                  <td>
                    <button
                      type="button"
                      className="btn btn-ghost btn-icon"
                      onClick={() => removeRecurringTask(task.id)}
                      aria-label="Supprimer"
                    >
                      <TrashIcon width={14} height={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <form className="recurring-form" onSubmit={handleAdd}>
        <input
          className="input"
          type="text"
          placeholder="Ajouter une tâche récurrente…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <div className="recurring-form__weekdays">
          {WEEKDAY_SHORT_LABELS_FR.map((label, i) => (
            <button
              type="button"
              key={label}
              className={
                'recurring-form__day' +
                (draftWeekdays.includes(i) ? ' is-active' : '')
              }
              onClick={() => toggleDraftWeekday(i)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="schedule-form__row">
          <select
            className="input"
            value={draftLevel}
            onChange={(e) => setDraftLevel(e.target.value)}
            aria-label="Niveau de la tâche récurrente"
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
        </div>
      </form>
    </div>
  )
}
