import { useMemo, useState } from 'react'
import { useRituals } from '../../context/RitualsContext'
import WeeklyCheckGrid from '../../components/WeeklyCheckGrid'
import { PlusIcon } from '../../components/icons'
import { weekDates, todayISO } from '../../utils/date'

const TYPE_ICON = { matin: '☀️', soir: '🌙' }

export default function RitualTracker({ date }) {
  const { rituals, logs, loading, addRitual, removeRitual, toggleRitualLog } =
    useRituals()
  const [draft, setDraft] = useState('')
  const [draftType, setDraftType] = useState('matin')
  const today = todayISO()
  const week = weekDates(date)

  const items = useMemo(
    () =>
      [...rituals]
        .sort((a, b) => a.type.localeCompare(b.type) || a.position - b.position)
        .map((r) => ({ ...r, icon: TYPE_ICON[r.type] })),
    [rituals]
  )

  function isDone(ritualId, day) {
    const log = logs.find((l) => l.ritual_id === ritualId && l.date === day)
    return Boolean(log?.done)
  }

  async function handleAdd(e) {
    e.preventDefault()
    const name = draft.trim()
    if (!name) return
    setDraft('')
    await addRitual(name, draftType)
  }

  const doneToday = rituals.filter((r) => isDone(r.id, today)).length

  return (
    <div className="card">
      <h2 className="card-title">
        Rituels
        <small>
          {rituals.length > 0
            ? `${doneToday} / ${rituals.length} aujourd’hui`
            : 'Tracker hebdomadaire'}
        </small>
      </h2>

      {loading ? (
        <p className="empty-hint">Chargement…</p>
      ) : items.length === 0 ? (
        <p className="empty-hint">Aucun rituel suivi pour l’instant.</p>
      ) : (
        <WeeklyCheckGrid
          items={items}
          week={week}
          today={today}
          isDone={isDone}
          onToggle={toggleRitualLog}
          onRemove={removeRitual}
        />
      )}

      <form className="schedule-form" onSubmit={handleAdd}>
        <input
          className="input"
          type="text"
          placeholder="Ajouter un rituel…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <div className="schedule-form__row">
          <div className="type-toggle">
            <button
              type="button"
              className={
                'type-toggle__btn' +
                (draftType === 'matin' ? ' is-active-salarie' : '')
              }
              onClick={() => setDraftType('matin')}
            >
              Matin
            </button>
            <button
              type="button"
              className={
                'type-toggle__btn' +
                (draftType === 'soir' ? ' is-active-solo' : '')
              }
              onClick={() => setDraftType('soir')}
            >
              Soir
            </button>
          </div>
          <button type="submit" className="btn btn-icon" aria-label="Ajouter">
            <PlusIcon width={16} height={16} />
          </button>
        </div>
      </form>
    </div>
  )
}
