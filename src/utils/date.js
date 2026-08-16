export function todayISO() {
  const d = new Date()
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60000)
  return local.toISOString().slice(0, 10)
}

export function formatLongDateFR(isoDate) {
  const d = new Date(`${isoDate}T00:00:00`)
  const formatted = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(d)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export function formatShortDateFR(isoDate) {
  const d = new Date(`${isoDate}T00:00:00`)
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
  }).format(d)
}

export function toISO(date) {
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60000)
  return local.toISOString().slice(0, 10)
}

export function addDays(isoDate, amount) {
  const d = new Date(`${isoDate}T00:00:00`)
  d.setDate(d.getDate() + amount)
  return toISO(d)
}

export function addMonths(isoDate, amount) {
  const d = new Date(`${isoDate}T00:00:00`)
  d.setMonth(d.getMonth() + amount)
  return toISO(d)
}

// Monday-based weekday index: 0 = Monday ... 6 = Sunday
export function weekdayIndex(isoDate) {
  const d = new Date(`${isoDate}T00:00:00`)
  return (d.getDay() + 6) % 7
}

const mondayIndex = weekdayIndex

export function startOfWeek(isoDate) {
  return addDays(isoDate, -mondayIndex(isoDate))
}

export function weekDates(isoDate) {
  const start = startOfWeek(isoDate)
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export function startOfMonth(isoDate) {
  return `${isoDate.slice(0, 7)}-01`
}

export function daysInMonth(isoDate) {
  const [y, m] = isoDate.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}

// Returns an array of weeks, each an array of 7 ISO date strings,
// covering the full month plus leading/trailing days to fill the grid.
export function monthMatrix(isoDate) {
  const monthStart = startOfMonth(isoDate)
  const gridStart = startOfWeek(monthStart)
  const total = daysInMonth(monthStart)
  const monthEnd = addDays(monthStart, total - 1)
  const gridEnd = addDays(monthEnd, (6 - mondayIndex(monthEnd) + 7) % 7)

  const weeks = []
  let cursor = gridStart
  while (cursor <= gridEnd) {
    const week = Array.from({ length: 7 }, (_, i) => addDays(cursor, i))
    weeks.push(week)
    cursor = addDays(cursor, 7)
  }
  return weeks
}

export function isSameMonth(isoDate, monthIsoDate) {
  return isoDate.slice(0, 7) === monthIsoDate.slice(0, 7)
}

export function formatMonthLabelFR(isoDate) {
  const d = new Date(`${isoDate}T00:00:00`)
  const formatted = new Intl.DateTimeFormat('fr-FR', {
    month: 'long',
    year: 'numeric',
  }).format(d)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export const WEEKDAY_LABELS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export function dayNumber(isoDate) {
  return Number(isoDate.slice(8, 10))
}
