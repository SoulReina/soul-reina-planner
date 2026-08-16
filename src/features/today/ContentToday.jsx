import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useContentItems } from '../../context/ContentContext'
import PlatformIcon from '../../components/PlatformIcon'

export default function ContentToday({ date }) {
  const { items, loading } = useContentItems()

  const forDate = useMemo(
    () =>
      items
        .filter((item) => item.date === date)
        .sort((a, b) => (a.publish_time || '').localeCompare(b.publish_time || '')),
    [items, date]
  )

  return (
    <div className="card">
      <h2 className="card-title">
        Contenus à publier
        <small>Ce jour-là</small>
      </h2>

      {loading ? (
        <p className="empty-hint">Chargement…</p>
      ) : forDate.length === 0 ? (
        <p className="empty-hint">
          Rien de prévu.{' '}
          <Link to="/contenu" className="content-today__link">
            Gérer le contenu
          </Link>
        </p>
      ) : (
        <ul className="content-today-list">
          {forDate.map((item) => (
            <li key={item.id} className="content-today-item">
              <span className="content-today-item__time">
                {item.publish_time ? item.publish_time.slice(0, 5) : '--:--'}
              </span>
              <span className="pill pill-solo">
                <PlatformIcon platform={item.platform} width={12} height={12} />
                {item.platform}
              </span>
              <span className="content-today-item__title">{item.title}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
