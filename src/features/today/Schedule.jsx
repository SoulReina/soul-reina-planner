import { useState } from 'react'
import { useScheduleForDate } from '../../context/ScheduleContext'
import { PlusIcon, TrashIcon } from '../../components/icons'

const EMPTY_FORM = { startTime: '', endTime: '', title: '', type: 'salarie' }

export default function Schedule({ date }) {
  const { blocks, loading, addBlock, removeBlock } = useScheduleForDate(date)
  const [form, setForm] = useState(EMPTY_FORM)

  async function handleAdd(e) {
    e.preventDefault()
    if (!form.startTime || !form.title.trim()) return
    await addBlock({
      start_time: form.startTime,
      end_time: form.endTime || null,
      title: form.title.trim(),
      type: form.type,
    })
    setForm(EMPTY_FORM)
  }

  return (
    <div className="card">
      <h2 className="card-title">
        Planning
        <small>Poste salarié &amp; activité solo</small>
      </h2>

      {loading ? (
        <p className="empty-hint">Chargement…</p>
      ) : blocks.length === 0 ? (
        <p className="empty-hint">Rien de prévu pour l’instant.</p>
      ) : (
        <ul className="schedule-list">
          {blocks.map((block) => (
            <li key={block.id} className="schedule-item">
              <div className="schedule-item__time">
                <span>{block.start_time.slice(0, 5)}</span>
                {block.end_time && (
                  <span className="schedule-item__time-end">
                    {block.end_time.slice(0, 5)}
                  </span>
                )}
              </div>
              <div className="schedule-item__body">
                <div className="schedule-item__title-row">
                  <span className="schedule-item__title">{block.title}</span>
                  <span
                    className={
                      'pill ' +
                      (block.type === 'solo' ? 'pill-solo' : 'pill-salarie')
                    }
                  >
                    {block.type === 'solo' ? 'Solo' : 'Salarié'}
                  </span>
                </div>
                {block.notes && (
                  <p className="schedule-item__notes">{block.notes}</p>
                )}
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                onClick={() => removeBlock(block.id)}
                aria-label="Supprimer"
              >
                <TrashIcon width={15} height={15} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form className="schedule-form" onSubmit={handleAdd}>
        <div className="schedule-form__row">
          <input
            className="input"
            type="time"
            value={form.startTime}
            onChange={(e) =>
              setForm((f) => ({ ...f, startTime: e.target.value }))
            }
            required
          />
          <input
            className="input"
            type="time"
            value={form.endTime}
            onChange={(e) =>
              setForm((f) => ({ ...f, endTime: e.target.value }))
            }
            placeholder="Fin"
          />
        </div>
        <input
          className="input"
          type="text"
          placeholder="Intitulé…"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        />
        <div className="schedule-form__row">
          <div className="type-toggle">
            <button
              type="button"
              className={
                'type-toggle__btn' +
                (form.type === 'salarie' ? ' is-active-salarie' : '')
              }
              onClick={() => setForm((f) => ({ ...f, type: 'salarie' }))}
            >
              Salarié
            </button>
            <button
              type="button"
              className={
                'type-toggle__btn' +
                (form.type === 'solo' ? ' is-active-solo' : '')
              }
              onClick={() => setForm((f) => ({ ...f, type: 'solo' }))}
            >
              Solo
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
