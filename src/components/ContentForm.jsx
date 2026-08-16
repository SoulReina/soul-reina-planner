import { useState } from 'react'
import { PlusIcon, CheckIcon } from './icons'
import {
  CONTENT_STATUSES,
  CONTENT_STATUS_LABELS,
  CONTENT_PLATFORM_FAVORITES,
} from '../lib/data/content'

export const CUSTOM_PLATFORM = '__custom__'

export const EMPTY_CONTENT_FORM = {
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

export function contentItemToFormValues(item) {
  const isFavorite = CONTENT_PLATFORM_FAVORITES.includes(item.platform)
  return {
    title: item.title || '',
    platform: isFavorite ? item.platform : CUSTOM_PLATFORM,
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
}) {
  const [form, setForm] = useState(initialValues)

  async function handleSubmit(e) {
    e.preventDefault()
    const title = form.title.trim()
    if (!title) return
    const platform =
      form.platform === CUSTOM_PLATFORM ? form.customPlatform.trim() : form.platform
    if (!platform) return
    await onSubmit({
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
