import { useNavigate } from 'react-router-dom'
import { addDays, todayISO, weekdayIndex, WEEKDAY_LABELS_FR, dayNumber } from '../../utils/date'
import './DayNav.css'

const DAYS_BACK = 2
const DAYS_FORWARD = 7

export default function DayNav({ date }) {
  const navigate = useNavigate()
  const today = todayISO()
  const minDate = addDays(today, -DAYS_BACK)
  const maxDate = addDays(today, DAYS_FORWARD)

  const days = []
  for (let d = minDate; d <= maxDate; d = addDays(d, 1)) {
    days.push(d)
  }

  function goTo(day) {
    navigate(day === today ? '/' : `/jour/${day}`)
  }

  function step(delta) {
    const next = addDays(date, delta)
    if (next < minDate || next > maxDate) return
    goTo(next)
  }

  return (
    <div className="day-nav">
      <button
        type="button"
        className="day-nav__arrow"
        onClick={() => step(-1)}
        disabled={date <= minDate}
        aria-label="Jour précédent"
      >
        ‹
      </button>
      <div className="day-nav__strip">
        {days.map((day) => (
          <button
            type="button"
            key={day}
            className={
              'day-nav__chip' +
              (day === date ? ' is-active' : '') +
              (day === today ? ' is-today' : '')
            }
            onClick={() => goTo(day)}
          >
            <span className="day-nav__chip-weekday">
              {WEEKDAY_LABELS_FR[weekdayIndex(day)]}
            </span>
            <span className="day-nav__chip-num">{dayNumber(day)}</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        className="day-nav__arrow"
        onClick={() => step(1)}
        disabled={date >= maxDate}
        aria-label="Jour suivant"
      >
        ›
      </button>
    </div>
  )
}
