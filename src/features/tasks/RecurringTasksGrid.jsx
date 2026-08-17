import { useMemo, useState } from 'react'
import { useRecurringTasks } from '../../context/RecurringTasksContext'
import WeeklyCheckGrid from '../../components/WeeklyCheckGrid'
import { PlusIcon } from '../../components/icons'
import { weekDates, addDays, todayISO, formatShortDateFR } from '../../utils/date'

export default function RecurringTasksGrid() {
  const { tasks, logs, loading, addRecurringTask, removeRecurringTask, toggleRecurringTaskLog } =
    useRecurringTasks()
  const [cursor, setCursor] = useState(todayISO())
  const [draft, setDraft] = useState('')
  const today = todayISO()
  const week = useMemo(() => weekDates(cursor), [cursor])

  const items = useMemo(
    () => [...tasks].sort((a, b) => a.position - b.position),
    [tasks]
  )

  function isDone(taskId, day) {
    const log = logs.find((l) => l.recurring_task_id === taskId && l.date === day)
    return Boolean(log?.done)
  }

  async function handleAdd(e) {
    e.preventDefault()
    const title = draft.trim()
    if (!title) return
    setDraft('')
    await addRecurringTask(title)
  }

  return (
    <div className="card">
      <h2 className="card-title">
        Tâches récurrentes
        <small>Ménage, entretien… coche au fil de l’eau</small>
      </h2>

      <div className="calendar-nav">
        <button
          type="button"
          className="btn btn-ghost btn-icon"
          onClick={() => setCursor((c) => addDays(c, -7))}
          aria-label="Semaine précédente"
        >
          ‹
        </button>
        <h3 className="calendar-nav__label">
          {formatShortDateFR(week[0])} – {formatShortDateFR(week[6])}
        </h3>
        <button
          type="button"
          className="btn btn-ghost btn-icon"
          onClick={() => setCursor((c) => addDays(c, 7))}
          aria-label="Semaine suivante"
        >
          ›
        </button>
      </div>

      {loading ? (
        <p className="empty-hint">Chargement…</p>
      ) : items.length === 0 ? (
        <p className="empty-hint">Aucune tâche récurrente pour l’instant.</p>
      ) : (
        <WeeklyCheckGrid
          items={items.map((t) => ({ id: t.id, name: t.title }))}
          week={week}
          today={today}
          isDone={isDone}
          onToggle={toggleRecurringTaskLog}
          onRemove={removeRecurringTask}
        />
      )}

      <form className="inline-form" onSubmit={handleAdd}>
        <input
          className="input"
          type="text"
          placeholder="Ajouter une tâche récurrente…"
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
