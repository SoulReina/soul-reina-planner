import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import { useContentItems } from '../context/ContentContext'
import {
  CONTENT_STATUSES,
  CONTENT_STATUS_LABELS,
  CONTENT_PLATFORM_FAVORITES,
} from '../lib/data/content'
import { PlusIcon, TrashIcon } from '../components/icons'
import PlatformIcon from '../components/PlatformIcon'
import { formatShortDateFR } from '../utils/date'
import './Content.css'

const CUSTOM_PLATFORM = '__custom__'

const EMPTY_FORM = {
  title: '',
  platform: CONTENT_PLATFORM_FAVORITES[0],
  customPlatform: '',
  status: 'idee',
  date: '',
  publishTime: '',
  body: '',
  cta: '',
  description: '',
  notes: '',
}

const GROUP_MODES = [
  { key: 'status', label: 'Par statut' },
  { key: 'platform', label: 'Par réseau' },
]

export default function Content() {
  const { items, loading, addItem, patchItem, removeItem } = useContentItems()
  const [form, setForm] = useState(EMPTY_FORM)
  const [groupMode, setGroupMode] = useState('status')

  const groups = useMemo(() => {
    if (groupMode === 'platform') {
      const map = new Map()
      items.forEach((item) => {
        const key = item.platform || 'Autre'
        if (!map.has(key)) map.set(key, [])
        map.get(key).push(item)
      })
      const keys = [...map.keys()].sort((a, b) => {
        const ai = CONTENT_PLATFORM_FAVORITES.indexOf(a)
        const bi = CONTENT_PLATFORM_FAVORITES.indexOf(b)
        if (ai !== -1 && bi !== -1) return ai - bi
        if (ai !== -1) return -1
        if (bi !== -1) return 1
        return a.localeCompare(b)
      })
      return keys.map((key) => ({ key, label: key, items: map.get(key) }))
    }
    const map = new Map(CONTENT_STATUSES.map((s) => [s, []]))
    items.forEach((item) => {
      if (!map.has(item.status)) map.set(item.status, [])
      map.get(item.status).push(item)
    })
    return CONTENT_STATUSES.map((status) => ({
      key: status,
      label: CONTENT_STATUS_LABELS[status],
      items: map.get(status) || [],
    }))
  }, [items, groupMode])

  async function handleAdd(e) {
    e.preventDefault()
    const title = form.title.trim()
    if (!title) return
    const platform =
      form.platform === CUSTOM_PLATFORM ? form.customPlatform.trim() : form.platform
    if (!platform) return
    await addItem({
      title,
      platform,
      status: form.status,
      date: form.date || null,
      publish_time: form.publishTime || null,
      body: form.body.trim() || null,
      cta: form.cta.trim() || null,
      description: form.description.trim() || null,
      notes: form.notes.trim() || null,
    })
    setForm(EMPTY_FORM)
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
          {items.length > 0 && (
            <div className="tabs">
              {GROUP_MODES.map((g) => (
                <button
                  key={g.key}
                  type="button"
                  className={'tabs__btn' + (groupMode === g.key ? ' is-active' : '')}
                  onClick={() => setGroupMode(g.key)}
                >
                  {g.label}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <p className="empty-hint">Chargement…</p>
          ) : items.length === 0 ? (
            <p className="empty-hint">Aucun contenu planifié pour l’instant.</p>
          ) : (
            <div className="content-columns">
              {groups.map((group) => {
                if (group.items.length === 0) return null
                return (
                  <div className="content-column" key={group.key}>
                    <h3 className="content-column__title">
                      {groupMode === 'platform' && (
                        <PlatformIcon platform={group.key} width={15} height={15} />
                      )}
                      {group.label}
                      <span className="content-column__count">{group.items.length}</span>
                    </h3>
                    <ul className="content-list">
                      {group.items.map((item) => {
                        const hasDetails = item.body || item.description
                        return (
                          <li key={item.id} className="content-item">
                            <div className="content-item__row">
                              <span className="content-item__title">{item.title}</span>
                              <button
                                type="button"
                                className="btn btn-ghost btn-icon"
                                onClick={() => removeItem(item.id)}
                                aria-label="Supprimer"
                              >
                                <TrashIcon width={14} height={14} />
                              </button>
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
                  </div>
                )
              })}
            </div>
          )}

          <form className="content-form" onSubmit={handleAdd}>
            <input
              className="input"
              type="text"
              placeholder="Titre du contenu…"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
            <div className="content-form__row">
              <select
                className="input"
                value={form.platform}
                onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
              >
                {CONTENT_PLATFORM_FAVORITES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
                <option value={CUSTOM_PLATFORM}>Autre (personnalisé)…</option>
              </select>
              <select
                className="input"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              >
                {CONTENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {CONTENT_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            {form.platform === CUSTOM_PLATFORM && (
              <input
                className="input"
                type="text"
                placeholder="Nom du réseau…"
                value={form.customPlatform}
                onChange={(e) => setForm((f) => ({ ...f, customPlatform: e.target.value }))}
              />
            )}
            <div className="content-form__row">
              <input
                className="input"
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
              <input
                className="input"
                type="time"
                value={form.publishTime}
                onChange={(e) => setForm((f) => ({ ...f, publishTime: e.target.value }))}
                aria-label="Heure de publication"
              />
            </div>
            <textarea
              className="input content-form__notes"
              placeholder="Corps du texte / script…"
              rows={3}
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            />
            <input
              className="input"
              type="text"
              placeholder="Call-to-action (ex : « Lien en bio »)…"
              value={form.cta}
              onChange={(e) => setForm((f) => ({ ...f, cta: e.target.value }))}
            />
            <textarea
              className="input content-form__notes"
              placeholder="Description / légende du post…"
              rows={2}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
            <textarea
              className="input content-form__notes"
              placeholder="Notes (optionnel)…"
              rows={2}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
            <button type="submit" className="btn content-form__submit">
              <PlusIcon width={16} height={16} />
              Enregistrer
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
