import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import { useContentItems } from '../context/ContentContext'
import {
  CONTENT_STATUSES,
  CONTENT_STATUS_LABELS,
  CONTENT_PLATFORM_FAVORITES,
} from '../lib/data/content'
import ContentForm, {
  EMPTY_CONTENT_FORM,
  contentItemToFormValues,
} from '../components/ContentForm'
import { TrashIcon, PencilIcon } from '../components/icons'
import PlatformIcon from '../components/PlatformIcon'
import { formatShortDateFR, todayISO } from '../utils/date'
import './Content.css'

const ALL_PLATFORMS = '__all__'

export default function Content() {
  const { items, loading, addItem, patchItem, removeItem } = useContentItems()
  const [activePlatform, setActivePlatform] = useState(ALL_PLATFORMS)
  const [activeStatus, setActiveStatus] = useState(CONTENT_STATUSES[0])
  const [editingId, setEditingId] = useState(null)

  const today = todayISO()

  const platforms = useMemo(() => {
    const custom = new Set()
    items.forEach((item) => {
      const p = item.platform || 'Autre'
      if (!CONTENT_PLATFORM_FAVORITES.includes(p)) custom.add(p)
    })
    return [...CONTENT_PLATFORM_FAVORITES, ...[...custom].sort((a, b) => a.localeCompare(b))]
  }, [items])

  const platformCounts = useMemo(() => {
    const map = new Map()
    items.forEach((item) => {
      const p = item.platform || 'Autre'
      map.set(p, (map.get(p) || 0) + 1)
    })
    return map
  }, [items])

  const platformItems = useMemo(() => {
    if (activePlatform === ALL_PLATFORMS) return items
    return items.filter((item) => (item.platform || 'Autre') === activePlatform)
  }, [items, activePlatform])

  const statusCounts = useMemo(() => {
    const map = new Map(CONTENT_STATUSES.map((s) => [s, 0]))
    platformItems.forEach((item) => {
      map.set(item.status, (map.get(item.status) || 0) + 1)
    })
    return map
  }, [platformItems])

  const visibleItems = useMemo(
    () => platformItems.filter((item) => item.status === activeStatus),
    [platformItems, activeStatus]
  )

  const staleItems = useMemo(
    () => items.filter((item) => item.status === 'publie' && item.date && item.date < today),
    [items, today]
  )

  async function handleAdd(payloads) {
    await Promise.all(payloads.map((payload) => addItem(payload)))
  }

  async function handleEditSubmit(id, payloads) {
    await patchItem(id, payloads[0])
    setEditingId(null)
  }

  async function handleCleanup() {
    await Promise.all(staleItems.map((item) => removeItem(item.id)))
  }

  return (
    <>
      <PageHeader
        eyebrow="Création"
        title="Contenu"
        subtitle="Idées, tournage, publication"
      />
      <div className="page-content">
        <div className="card">
          {staleItems.length > 0 && (
            <div className="content-cleanup">
              <span>
                {staleItems.length} contenu{staleItems.length > 1 ? 's' : ''} publié
                {staleItems.length > 1 ? 's' : ''} depuis la veille ou avant.
              </span>
              <button type="button" className="btn btn-ghost" onClick={handleCleanup}>
                Nettoyer
              </button>
            </div>
          )}

          {items.length > 0 && (
            <>
              <div className="tabs">
                <button
                  type="button"
                  className={'tabs__btn' + (activePlatform === ALL_PLATFORMS ? ' is-active' : '')}
                  onClick={() => setActivePlatform(ALL_PLATFORMS)}
                >
                  Tous
                  <span className="tabs__count">{items.length}</span>
                </button>
                {platforms.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={'tabs__btn' + (activePlatform === p ? ' is-active' : '')}
                    onClick={() => setActivePlatform(p)}
                  >
                    <PlatformIcon platform={p} width={13} height={13} />
                    {p}
                    <span className="tabs__count">{platformCounts.get(p) || 0}</span>
                  </button>
                ))}
              </div>

              <div className="tabs tabs--sub">
                {CONTENT_STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={'tabs__btn' + (activeStatus === s ? ' is-active' : '')}
                    onClick={() => setActiveStatus(s)}
                  >
                    {CONTENT_STATUS_LABELS[s]}
                    <span className="tabs__count">{statusCounts.get(s) || 0}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {loading ? (
            <p className="empty-hint">Chargement…</p>
          ) : items.length === 0 ? (
            <p className="empty-hint">Aucun contenu planifié pour l’instant.</p>
          ) : visibleItems.length === 0 ? (
            <p className="empty-hint">Rien ici pour l’instant.</p>
          ) : (
            <ul className="content-list">
              {visibleItems.map((item) => {
                if (editingId === item.id) {
                  return (
                    <li key={item.id} className="content-item">
                      <ContentForm
                        initialValues={contentItemToFormValues(item)}
                        onSubmit={(payload) => handleEditSubmit(item.id, payload)}
                        onCancel={() => setEditingId(null)}
                        submitLabel="Enregistrer"
                      />
                    </li>
                  )
                }
                const hasDetails = item.body || item.description
                return (
                  <li key={item.id} className="content-item">
                    <div className="content-item__row">
                      <span className="content-item__title">{item.title}</span>
                      <div className="content-item__actions">
                        <button
                          type="button"
                          className="btn btn-ghost btn-icon"
                          onClick={() => setEditingId(item.id)}
                          aria-label="Modifier"
                        >
                          <PencilIcon width={14} height={14} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-icon"
                          onClick={() => removeItem(item.id)}
                          aria-label="Supprimer"
                        >
                          <TrashIcon width={14} height={14} />
                        </button>
                      </div>
                    </div>
                    <div className="content-item__meta">
                      <span className="pill pill-solo">
                        <PlatformIcon platform={item.platform} width={12} height={12} />
                        {item.platform}
                      </span>
                      {item.date && (
                        <span className="content-item__date">
                          {formatShortDateFR(item.date)}
                          {item.publish_time && ` · ${item.publish_time.slice(0, 5)}`}
                        </span>
                      )}
                    </div>
                    {item.cta && <p className="content-item__cta">{item.cta}</p>}
                    {hasDetails && (
                      <details className="content-item__details">
                        <summary>Corps &amp; description</summary>
                        {item.body && <p>{item.body}</p>}
                        {item.description && <p>{item.description}</p>}
                      </details>
                    )}
                    {item.notes && <p className="content-item__notes">{item.notes}</p>}
                    <select
                      className="input content-item__status"
                      value={item.status}
                      onChange={(e) => patchItem(item.id, { status: e.target.value })}
                    >
                      {CONTENT_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {CONTENT_STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </li>
                )
              })}
            </ul>
          )}

          <ContentForm
            initialValues={EMPTY_CONTENT_FORM}
            onSubmit={handleAdd}
            submitLabel="Enregistrer"
            resetOnSubmit
            allowMultiplePlatforms
          />
        </div>
      </div>
    </>
  )
}
