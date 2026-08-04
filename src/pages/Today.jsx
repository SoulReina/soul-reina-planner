import { useParams, Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Priorities from '../features/today/Priorities'
import Schedule from '../features/today/Schedule'
import RitualTracker from '../features/today/RitualTracker'
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
            'Soul Reina'
          ) : (
            <Link to="/calendrier" className="page-header__back">
              ← Retour au calendrier
            </Link>
          )
        }
        title={isToday ? 'Aujourd’hui' : formatLongDateFR(date).split(' ')[0]}
        subtitle={formatLongDateFR(date)}
      />
      <div className="page-content">
        <Priorities date={date} />
        <Schedule date={date} />
        <RitualTracker date={date} />
      </div>
    </>
  )
}
