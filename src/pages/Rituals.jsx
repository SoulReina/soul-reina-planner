import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import { useRituals } from '../context/RitualsContext'
import WeeklyCheckGrid from '../components/WeeklyCheckGrid'
import { PlusIcon } from '../components/icons'
import { weekDates, todayISO } from '../utils/date'

function RitualGroup({ title, subtitle, type, rituals, logs, loading, onAdd, onToggle, onRemove }) {
  const [draft, setDraft] = useState('')
  const today = todayISO()
  const week = weekDates(today)

  function isDone(ritualId, day) {
    const log = logs.find((l) => l.ritual_id === ritualId && l.date === day)
    return Boolean(log?.done)
  }

  async function handleAdd(e) {
    e.preventDefault()
    const name = draft.trim()
    if (!name) return
    setDraft('')
    await onAdd(name, type)
  }

  return (
    <div className="card">
      <h2 className="card-title">
        {title}
        <small>{subtitle}</small>
      </h2>

      {loading ? (
        <p className="empty-hint">Chargement…</p>
      ) : rituals.length === 0 ? (
        <p className="empty-hint">Aucune étape pour l’instant.</p>
      ) : (
        <WeeklyCheckGrid
          items={rituals}
          week={week}
          today={today}
          isDone={isDone}
          onToggle={onToggle}
          onRemove={onRemove}
        />
      )}

      <form className="inline-form" onSubmit={handleAdd}>
        <input
          className="input"
          type="text"
          placeholder="Ajouter une étape…"
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

export default function Rituals() {
  const { rituals, logs, loading, addRitual, removeRitual, toggleRitualLog } =
    useRituals()
  const matin = rituals.filter((r) => r.type === 'matin')
  const soir = rituals.filter((r) => r.type === 'soir')

  return (
    <>
      <PageHeader
        eyebrow="Ancrage"
        title="Rituels"
        subtitle="Matin et soir, semaine par semaine"
      />
      <div className="page-content">
        <RitualGroup
          title="Rituel du matin"
          subtitle="Pour bien démarrer"
          type="matin"
          rituals={matin}
          logs={logs}
          loading={loading}
          onAdd={addRitual}
          onToggle={toggleRitualLog}
          onRemove={removeRitual}
        />
        <RitualGroup
          title="Rituel du soir"
          subtitle="Pour bien clôturer"
          type="soir"
          rituals={soir}
          logs={logs}
          loading={loading}
          onAdd={addRitual}
          onToggle={toggleRitualLog}
          onRemove={removeRitual}
        />
      </div>
    </>
  )
}
