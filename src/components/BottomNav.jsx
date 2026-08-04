import { NavLink } from 'react-router-dom'
import {
  SunIcon,
  CalendarIcon,
  CheckIcon,
  SparkleIcon,
  FeatherIcon,
} from './icons'
import './BottomNav.css'

const TABS = [
  { to: '/', label: 'Aujourd’hui', Icon: SunIcon, end: true },
  { to: '/calendrier', label: 'Calendrier', Icon: CalendarIcon },
  { to: '/taches', label: 'Tâches', Icon: CheckIcon },
  { to: '/rituels', label: 'Rituels', Icon: SparkleIcon },
  { to: '/contenu', label: 'Contenu', Icon: FeatherIcon },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navigation principale">
      {TABS.map(({ to, label, Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            'bottom-nav__item' + (isActive ? ' is-active' : '')
          }
        >
          <Icon className="bottom-nav__icon" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
