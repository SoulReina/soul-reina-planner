import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import { useSavings } from '../context/SavingsContext'
import { useBusiness } from '../context/BusinessContext'
import { PlusIcon, TrashIcon } from '../components/icons'
import { formatXPF, toXPFAmount } from '../utils/currency'
import './Business.css'

export default function Business() {
  const { getEnvelopeBySlug, loading: savingsLoading } = useSavings()
  const { envelopes, loading, addEnvelope, removeEnvelope } = useBusiness()
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')

  const businessEnvelope = getEnvelopeBySlug('business')
  const total = businessEnvelope ? Number(businessEnvelope.current_amount) : 0
  const allocated = useMemo(
    () => envelopes.reduce((sum, e) => sum + Number(e.amount), 0),
    [envelopes]
  )
  const remaining = total - allocated

  async function handleAdd(e) {
    e.preventDefault()
    const trimmed = name.trim()
    const num = toXPFAmount(amount)
    if (!trimmed || !num || num <= 0) return
    setName('')
    setAmount('')
    await addEnvelope(trimmed, num)
  }

  return (
    <>
      <PageHeader eyebrow="Entreprise" title="Business" subtitle="Répartition interne de l’enveloppe Business" />
      <div className="page-content">
        <div className="card">
          <h2 className="card-title">
            Total épargné
            <small>Enveloppe Business — Économies</small>
          </h2>
          {savingsLoading ? (
            <p className="empty-hint">Chargement…</p>
          ) : !businessEnvelope ? (
            <p className="empty-hint">
              Aucune enveloppe « Business » trouvée dans Économies. Recrée-la pour l’alimenter ici.
            </p>
          ) : (
            <>
              <div className="envelope-amount">{formatXPF(total)}</div>
              <div className="budget-summary budget-summary--secondary">
                <div className="budget-summary__stat">
                  <span className="budget-summary__label">Alloué</span>
                  <span className="budget-summary__value">{formatXPF(allocated)}</span>
                </div>
                <div className="budget-summary__stat">
                  <span className="budget-summary__label">Non alloué</span>
                  <span
                    className={
                      'budget-summary__value' +
                      (remaining < 0 ? ' budget-summary__value--depense' : ' budget-summary__value--revenu')
                    }
                  >
                    {formatXPF(remaining)}
                  </span>
                </div>
              </div>
              {remaining < 0 && (
                <p className="business-warning">
                  La répartition dépasse le total disponible dans l’enveloppe Business.
                </p>
              )}
            </>
          )}
        </div>

        <div className="card">
          <h2 className="card-title">
            Enveloppes internes
            <small>Pub, Outils, Formation…</small>
          </h2>
          {loading ? (
            <p className="empty-hint">Chargement…</p>
          ) : envelopes.length === 0 ? (
            <p className="empty-hint">Aucune enveloppe interne pour l’instant.</p>
          ) : (
            <ul className="budget-entry-list">
              {envelopes.map((e) => (
                <li key={e.id} className="budget-entry">
                  <span className="budget-entry__label budget-entry__label--grow">{e.name}</span>
                  <span className="budget-entry__amount">{formatXPF(e.amount)}</span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-icon"
                    onClick={() => removeEnvelope(e.id)}
                    aria-label="Supprimer"
                  >
                    <TrashIcon width={14} height={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <form className="budget-inline-form" onSubmit={handleAdd}>
            <input
              className="input"
              type="text"
              placeholder="Nom de l’enveloppe…"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="budget-inline-form__row">
              <input
                className="input"
                type="number"
                min="0"
                step="1"
                placeholder="Montant à allouer (F)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <button type="submit" className="btn btn-icon" aria-label="Ajouter">
                <PlusIcon width={16} height={16} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
