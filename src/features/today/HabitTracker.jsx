import { useState } from 'react'
import { useHabits } from '../../context/HabitsContext'
import WeeklyCheckGrid from '../../components/WeeklyCheckGrid'
import { PlusIcon } from '../../components/icons'
import { weekDates, todayISO } from '../../utils/date'

export default function HabitTracker({ date }) {
  const { habits, logs, loading, addHabit, removeHabit, toggleHabitLog } =
    useHabits()
  const [draft, setDraft] = useState('')
  const today = todayISO()
  const week = weekDates(date)

  function isDone(habitId, day) {
    const log = logs.find((l) => l.habit_id === habitId && l.date === day)
    return Boolean(log?.done)
  }

  async function handleAdd(e) {
    e.preventDefault()
    const name = draft.trim()
    if (!name) return
    setDraft('')
    await addHabit(name)
  }

  const doneToday = habits.filter((h) => isDone(h.id, today)).length

  return (
    <div className="card">
      <h2 className="card-title">
        Habitudes
        <small>
          {habits.length > 0
            ? `${doneToday} / ${habits.length} aujourd’hui`
            : 'Tracker hebdomadaire'}
        </small>
      </h2>

      {loading ? (
        <p className="empty-hint">Chargement…</p>
      ) : habits.length === 0 ? (
        <p className="empty-hint">Aucune habitude suivie pour l’instant.</p>
      ) : (
        <WeeklyCheckGrid
          items={habits}
          week={week}
          today={today}
          isDone={isDone}
          onToggle={toggleHabitLog}
          onRemove={removeHabit}
        />
      )}

      <form className="inline-form" onSubmit={handleAdd}>
        <input
          className="input"
          type="text"
          placeholder="Ajouter une habitude…"
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
