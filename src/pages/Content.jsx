import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import { useContentItems } from '../context/ContentContext'
import {
  CONTENT_STATUSES,
  CONTENT_STATUS_LABELS,
  CONTENT_PLATFORMS,
} from '../lib/data/content'
import { PlusIcon, TrashIcon } from '../components/icons'
import { formatShortDateFR } from '../utils/date'
import './Content.css'

const EMPTY_FORM = {
  title: '',
  platform: CONTENT_PLATFORMS[0],
  status: 'idee',
  date: '',
  notes: '',
}

export default function Content() {
  const { items, loading, addItem, patchItem, removeItem } = useContentItems()
  const [form, setForm] = useState(EMPTY_FORM)

  const byStatus = useMemo(() => {
    const map = new Map(CONTENT_STATUSES.map((s) => [s, []]))
    items.forEach((item) => {
      if (!map.has(item.status)) map.set(item.status, [])
      map.get(item.status).push(item)
    })
    return map
  }, [items])

  async function handleAdd(e) {
    e.preventDefault()
    const title = form.title.trim()
    if (!title) return
    await addItem({
      title,
      platform: form.platform,
      status: form.status,
      date: form.date || null,
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
          {loading ? (
            <p className="empty-hint">Chargement…</p>
          ) : items.length === 0 ? (
            <p className="empty-hint">Aucun contenu planifié pour l’instant.</p>
          ) : (
            <div className="content-columns">
              {CONTENT_STATUSES.map((status) => {
                const list = byStatus.get(status) || []
                if (list.length === 0) return null
                return (
                  <div className="content-column" key={status}>
                    <h3 className="content-column__title">
                      {CONTENT_STATUS_LABELS[status]}
                      <span className="content-column__count">
                        {list.length}
                      </span>
                    </h3>
                    <ul className="content-list">
                      {list.map((item) => (
                        <li key={item.id} className="content-item">
                          <div className="content-item__row">
                            <span className="content-item__title">
                              {item.title}
                            </span>
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
                              {item.platform}
                            </span>
                            {item.date && (
                              <span className="content-item__date">
                                {formatShortDateFR(item.date)}
                              </span>
                            )}
                          </div>
                          {item.notes && (
                            <p className="content-item__notes">{item.notes}</p>
                          )}
                          <select
                            className="input content-item__status"
                            value={item.status}
                            onChange={(e) =>
                              patchItem(item.id, { status: e.target.value })
                            }
                          >
                            {CONTENT_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {CONTENT_STATUS_LABELS[s]}
                              </option>
                            ))}
                          </select>
                        </li>
                      ))}
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
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
            />
            <div className="content-form__row">
              <select
                className="input"
                value={form.platform}
                onChange={(e) =>
                  setForm((f) => ({ ...f, platform: e.target.value }))
                }
              >
                {CONTENT_PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <select
                className="input"
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value }))
                }
              >
                {CONTENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {CONTENT_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <input
              className="input"
              type="date"
              value={form.date}
              onChange={(e) =>
                setForm((f) => ({ ...f, date: e.target.value }))
              }
            />
            <textarea
              className="input content-form__notes"
              placeholder="Notes (optionnel)…"
              rows={2}
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
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
