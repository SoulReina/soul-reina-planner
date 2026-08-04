import { TrashIcon } from './icons'
import { WEEKDAY_LABELS_FR, dayNumber } from '../utils/date'
import './WeeklyCheckGrid.css'

export default function WeeklyCheckGrid({
  items,
  week,
  today,
  isDone,
  onToggle,
  onRemove,
}) {
  return (
    <div className="weekly-grid-wrap">
      <table className="weekly-grid">
        <thead>
          <tr>
            <th className="weekly-grid__name-col" />
            {week.map((day, i) => (
              <th
                key={day}
                className={
                  'weekly-grid__day-head' + (day === today ? ' is-today' : '')
                }
              >
                <span>{WEEKDAY_LABELS_FR[i]}</span>
                <span className="weekly-grid__day-num">{dayNumber(day)}</span>
              </th>
            ))}
            <th className="weekly-grid__name-col" />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td className="weekly-grid__name">
                {item.icon && (
                  <span className="weekly-grid__icon">{item.icon}</span>
                )}
                <span>{item.name}</span>
              </td>
              {week.map((day) => (
                <td
                  key={day}
                  className={
                    'weekly-grid__cell' + (day === today ? ' is-today' : '')
                  }
                >
                  <input
                    type="checkbox"
                    checked={isDone(item.id, day)}
                    onChange={() => onToggle(item.id, day)}
                    aria-label={`${item.name} — ${day}`}
                  />
                </td>
              ))}
              <td>
                <button
                  type="button"
                  className="btn btn-ghost btn-icon"
                  onClick={() => onRemove(item.id)}
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
  )
}
