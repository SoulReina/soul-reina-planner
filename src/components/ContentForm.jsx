import { useState } from 'react'
import { PlusIcon, CheckIcon } from './icons'
import PlatformIcon from './PlatformIcon'
import {
  CONTENT_STATUSES,
  CONTENT_STATUS_LABELS,
  CONTENT_PLATFORM_FAVORITES,
} from '../lib/data/content'

export const CUSTOM_PLATFORM = '__custom__'

export const EMPTY_CONTENT_FORM = {
  title: '',
  platforms: [CONTENT_PLATFORM_FAVORITES[0]],
  customPlatform: '',
  status: 'idee',
  date: '',
  publishTime: '',
  body: '',
  cta: '',
  description: '',
  notes: '',
}

export function contentItemToFormValues(item) {
  const isFavorite = CONTENT_PLATFORM_FAVORITES.includes(item.platform)
  return {
    title: item.title || '',
    platforms: [isFavorite ? item.platform : CUSTOM_PLATFORM],
    customPlatform: isFavorite ? '' : item.platform || '',
    status: item.status,
    date: item.date || '',
    publishTime: item.publish_time ? item.publish_time.slice(0, 5) : '',
    body: item.body || '',
    cta: item.cta || '',
    description: item.description || '',
    notes: item.notes || '',
  }
}

export default function ContentForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel,
  resetOnSubmit,
  allowMultiplePlatforms,
}) {
  const [form, setForm] = useState(initialValues)

  function togglePlatform(p) {
    setForm((f) => {
      const has = f.platforms.includes(p)
      const platforms = has ? f.platforms.filter((x) => x !== p) : [...f.platforms, p]
      return { ...f, platforms }
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const title = form.title.trim()
    if (!title) return
    const platforms = [
      ...new Set(
        form.platforms
          .map((p) => (p === CUSTOM_PLATFORM ? form.customPlatform.trim() : p))
          .filter(Boolean)
      ),
    ]
    if (platforms.length === 0) return
    await onSubmit(
      platforms.map((platform) => ({
        title,
        platform,
        status: form.status,
        date: form.date || null,
        publish_time: form.publishTime || null,
        body: form.body.trim() || null,
        cta: form.cta.trim() || null,
        description: form.description.trim() || null,
        notes: form.notes.trim() || null,
      }))
    )
    if (resetOnSubmit) setForm(initialValues)
  }

  const SubmitIcon = onCancel ? CheckIcon : PlusIcon

  return (
    <form
      className={'content-form' + (onCancel ? ' content-form--inline' : '')}
      onSubmit={handleSubmit}
    >
      <input
        className="input"
        type="text"
        placeholder="Titre du contenu…"
        value={form.title}
        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
      />
      {allowMultiplePlatforms ? (
        <div className="content-form__platforms">
          {CONTENT_PLATFORM_FAVORITES.map((p) => (
            <label key={p} className="content-form__platform-option">
              <input
                type="checkbox"
                checked={form.platforms.includes(p)}
                onChange={() => togglePlatform(p)}
              />
              <PlatformIcon platform={p} width={13} height={13} />
              {p}
            </label>
          ))}
          <label className="content-form__platform-option">
            <input
              type="checkbox"
              checked={form.platforms.includes(CUSTOM_PLATFORM)}
              onChange={() => togglePlatform(CUSTOM_PLATFORM)}
            />
            Autre
          </label>
        </div>
      ) : (
        <select
          className="input"
          value={form.platforms[0]}
          onChange={(e) => setForm((f) => ({ ...f, platforms: [e.target.value] }))}
        >
          {CONTENT_PLATFORM_FAVORITES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
          <option value={CUSTOM_PLATFORM}>Autre (personnalisé)…</option>
        </select>
      )}
      {form.platforms.includes(CUSTOM_PLATFORM) && (
        <input
          className="input"
          type="text"
          placeholder="Nom du réseau…"
          value={form.customPlatform}
          onChange={(e) => setForm((f) => ({ ...f, customPlatform: e.target.value }))}
        />
      )}
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
      <div className="content-form__actions">
        <button type="submit" className="btn content-form__submit">
          <SubmitIcon width={16} height={16} />
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Annuler
          </button>
        )}
      </div>
    </form>
  )
}
