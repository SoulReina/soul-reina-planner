import { useParams, Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import DayNav from '../features/today/DayNav'
import TasksToday from '../features/today/TasksToday'
import RecurringTasksPlanner from '../features/today/RecurringTasksPlanner'
import Schedule from '../features/today/Schedule'
import ContentToday from '../features/today/ContentToday'
import RitualTracker from '../features/today/RitualTracker'
import Notebook from '../features/today/Notebook'
import { todayISO, formatLongDateFR } from '../utils/date'
import '../features/today/today.css'

export default function Today() {
  const { date: dateParam } = useParams()
  const today = todayISO()
  const date = dateParam || today
  const isToday = date === today

  return (
    <>
      <PageHeader
        eyebrow={
          isToday ? (
            'ReinaOrga'
          ) : (
            <Link to="/calendrier" className="page-header__back">
              ← Retour au calendrier
            </Link>
          )
        }
        title={isToday ? 'Aujourd’hui' : formatLongDateFR(date).split(' ')[0]}
        subtitle={formatLongDateFR(date)}
      />
      <DayNav date={date} />
      <div className="page-content">
        <TasksToday date={date} />
        <RecurringTasksPlanner />
        <Schedule date={date} />
        <ContentToday date={date} />
        <RitualTracker date={date} />
        <Notebook />
      </div>
    </>
  )
}
