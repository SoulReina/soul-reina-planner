import { useMemo, useState } from 'react'
import { useRecurringTasks } from '../../context/RecurringTasksContext'
import WeeklyCheckGrid from '../../components/WeeklyCheckGrid'
import { PlusIcon } from '../../components/icons'
import { weekDates, addDays, todayISO, formatShortDateFR, weekdayIndex, WEEKDAY_LABELS_FR } from '../../utils/date'
import { RECURRING_TASK_CATEGORIES, categoryById, isScheduledOnWeekday } from '../../lib/data/recurringTasks'

function WeekdayPicker({ value, onChange }) {
  return (
    <div className="weekday-picker">
      {WEEKDAY_LABELS_FR.map((label, i) => {
        const active = value.includes(i)
        return (
          <button
            key={label}
            type="button"
            className={'weekday-picker__btn' + (active ? ' is-active' : '')}
            onClick={() =>
              onChange(active ? value.filter((d) => d !== i) : [...value, i].sort())
            }
            aria-pressed={active}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

function CategorySelect({ value, onChange }) {
  return (
    <select
      className="input"
      value={value || ''}
      onChange={(e) => onChange(e.target.value || null)}
      aria-label="Catégorie"
    >
      <option value="">Sans catégorie</option>
      {RECURRING_TASK_CATEGORIES.map((c) => (
        <option key={c.id} value={c.id}>
          {c.label}
        </option>
      ))}
    </select>
  )
}

export default function RecurringTasksGrid() {
  const {
    tasks,
    logs,
    loading,
    addRecurringTask,
    editRecurringTask,
    removeRecurringTask,
    toggleRecurringTaskLog,
  } = useRecurringTasks()
  const [cursor, setCursor] = useState(todayISO())
  const [draft, setDraft] = useState('')
  const [draftWeekdays, setDraftWeekdays] = useState([0, 1, 2, 3, 4, 5, 6])
  const [draftCategory, setDraftCategory] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editWeekdays, setEditWeekdays] = useState([])
  const [editCategory, setEditCategory] = useState(null)
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

  function isScheduled(taskId, day) {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return true
    return isScheduledOnWeekday(task, weekdayIndex(day))
  }

  async function handleAdd(e) {
    e.preventDefault()
    const title = draft.trim()
    if (!title) return
    setDraft('')
    const weekdays = draftWeekdays.length === 7 ? [] : draftWeekdays
    await addRecurringTask(title, weekdays, draftCategory)
    setDraftWeekdays([0, 1, 2, 3, 4, 5, 6])
    setDraftCategory(null)
  }

  function startEdit(task) {
    setEditingId(task.id)
    setEditTitle(task.title)
    setEditWeekdays(task.weekdays && task.weekdays.length ? task.weekdays : [0, 1, 2, 3, 4, 5, 6])
    setEditCategory(task.category || null)
  }

  function cancelEdit() {
    setEditingId(null)
  }

  async function saveEdit(e) {
    e.preventDefault()
    const title = editTitle.trim()
    if (!title) return
    const weekdays = editWeekdays.length === 7 ? [] : editWeekdays
    await editRecurringTask(editingId, { title, weekdays, category: editCategory })
    setEditingId(null)
  }

  const editingTask = editingId ? items.find((t) => t.id === editingId) : null

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
          items={items.map((t) => {
            const category = categoryById(t.category)
            return {
              id: t.id,
              name: t.title,
              icon: category ? (
                <span
                  className="category-dot"
                  style={{ background: category.color }}
                  title={category.label}
                />
              ) : null,
            }
          })}
          week={week}
          today={today}
          isDone={isDone}
          isScheduled={isScheduled}
          onToggle={toggleRecurringTaskLog}
          onRemove={removeRecurringTask}
          onEdit={(id) => startEdit(items.find((t) => t.id === id))}
        />
      )}

      {editingTask && (
        <form className="inline-form recurring-edit-form" onSubmit={saveEdit}>
          <input
            className="input"
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Titre de la tâche"
          />
          <WeekdayPicker value={editWeekdays} onChange={setEditWeekdays} />
          <CategorySelect value={editCategory} onChange={setEditCategory} />
          <div className="recurring-edit-form__actions">
            <button type="submit" className="btn">
              Enregistrer
            </button>
            <button type="button" className="btn btn-ghost" onClick={cancelEdit}>
              Annuler
            </button>
          </div>
        </form>
      )}

      <form className="inline-form recurring-add-form" onSubmit={handleAdd}>
        <div className="recurring-add-form__row">
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
        </div>
        <WeekdayPicker value={draftWeekdays} onChange={setDraftWeekdays} />
        <CategorySelect value={draftCategory} onChange={setDraftCategory} />
      </form>
    </div>
  )
}
