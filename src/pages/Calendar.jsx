import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { usePriorities } from '../context/PrioritiesContext'
import { useSchedule } from '../context/ScheduleContext'
import { useHabits } from '../context/HabitsContext'
import {
  monthMatrix,
  formatMonthLabelFR,
  addMonths,
  isSameMonth,
  dayNumber,
  todayISO,
  WEEKDAY_LABELS_FR,
} from '../utils/date'
import './Calendar.css'

export default function Calendar() {
  const navigate = useNavigate()
  const today = todayISO()
  const [cursor, setCursor] = useState(today)
  const { priorities } = usePriorities()
  const { blocks } = useSchedule()
  const { habits, logs } = useHabits()

  const weeks = useMemo(() => monthMatrix(cursor), [cursor])

  const priorityDates = useMemo(
    () => new Set(priorities.map((p) => p.date)),
    [priorities]
  )
  const scheduleDates = useMemo(
    () => new Set(blocks.map((b) => b.date)),
    [blocks]
  )
  const habitCompleteDates = useMemo(() => {
    if (habits.length === 0) return new Set()
    const byDate = {}
    logs.forEach((log) => {
      if (!log.done) return
      byDate[log.date] = (byDate[log.date] || 0) + 1
    })
    return new Set(
      Object.entries(byDate)
        .filter(([, count]) => count >= habits.length)
        .map(([date]) => date)
    )
  }, [logs, habits])

  return (
    <>
      <PageHeader eyebrow="Vue d’ensemble" title="Calendrier" />
      <div className="page-content">
        <div className="card calendar-card">
          <div className="calendar-nav">
            <button
              type="button"
              className="btn btn-ghost btn-icon"
              onClick={() => setCursor((c) => addMonths(c, -1))}
              aria-label="Mois précédent"
            >
              ‹
            </button>
            <h2 className="calendar-nav__label">{formatMonthLabelFR(cursor)}</h2>
            <button
              type="button"
              className="btn btn-ghost btn-icon"
              onClick={() => setCursor((c) => addMonths(c, 1))}
              aria-label="Mois suivant"
            >
              ›
            </button>
          </div>

          <div className="calendar-grid calendar-grid--head">
            {WEEKDAY_LABELS_FR.map((label) => (
              <span key={label} className="calendar-weekday">
                {label}
              </span>
            ))}
          </div>

          {weeks.map((week) => (
            <div className="calendar-grid" key={week[0]}>
              {week.map((day) => {
                const inMonth = isSameMonth(day, cursor)
                const isToday = day === today
                return (
                  <button
                    type="button"
                    key={day}
                    className={
                      'calendar-day' +
                      (inMonth ? '' : ' is-outside') +
                      (isToday ? ' is-today' : '')
                    }
                    onClick={() => navigate(`/jour/${day}`)}
                  >
                    <span className="calendar-day__num">{dayNumber(day)}</span>
                    <span className="calendar-day__dots">
                      {scheduleDates.has(day) && (
                        <span className="calendar-dot calendar-dot--pink" />
                      )}
                      {priorityDates.has(day) && (
                        <span className="calendar-dot calendar-dot--gold" />
                      )}
                      {habitCompleteDates.has(day) && (
                        <span className="calendar-dot calendar-dot--sage" />
                      )}
                    </span>
                  </button>
                )
              })}
            </div>
          ))}

          <div className="calendar-legend">
            <span>
              <span className="calendar-dot calendar-dot--pink" /> Planning
            </span>
            <span>
              <span className="calendar-dot calendar-dot--gold" /> Priorités
            </span>
            <span>
              <span className="calendar-dot calendar-dot--sage" /> Habitudes ✓
            </span>
          </div>
        </div>

        <p className="empty-hint calendar-hint">
          Touche un jour pour voir son planning, ses priorités et ses
          habitudes.
        </p>
      </div>
    </>
  )
}
