import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import { useSavings } from '../context/SavingsContext'
import { useBudget } from '../context/BudgetContext'
import { PlusIcon, TrashIcon } from '../components/icons'
import { todayISO, formatMonthLabelFR, addMonths } from '../utils/date'
import { colorForIndex } from '../lib/palette'
import PieChart from '../components/charts/PieChart'
import './Savings.css'

function formatEUR(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount || 0)
}

function monthKeyOf(cursor) {
  return `${cursor.slice(0, 7)}-01`
}

function EnvelopeCard({ envelope, movements, onMovement, onRemove }) {
  const [amount, setAmount] = useState('')
  const current = Number(envelope.current_amount)
  const goal = envelope.goal_amount ? Number(envelope.goal_amount) : null
  const progress = goal ? Math.min(100, Math.round((current / goal) * 100)) : null

  async function handleMovement(sign) {
    const value = Number(amount)
    if (!value || value <= 0) return
    setAmount('')
    await onMovement(envelope, sign * value)
  }

  return (
    <div className="card">
      <div className="envelope-header">
        <h2 className="card-title">{envelope.name}</h2>
        <button
          type="button"
          className="btn btn-ghost btn-icon"
          onClick={() => onRemove(envelope.id)}
          aria-label="Supprimer l'enveloppe"
        >
          <TrashIcon width={14} height={14} />
        </button>
      </div>

      <div className="envelope-amount">
        {formatEUR(current)}
        {goal !== null && <span className="envelope-amount__goal"> / {formatEUR(goal)}</span>}
      </div>

      {goal !== null && (
        <div className="envelope-progress">
          <div className="envelope-progress__bar" style={{ width: `${progress}%` }} />
        </div>
      )}

      <div className="envelope-form">
        <input
          className="input"
          type="number"
          min="0"
          step="0.01"
          placeholder="Montant € ce mois-ci"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button type="button" className="btn envelope-form__btn" onClick={() => handleMovement(1)}>
          Ajouter
        </button>
        <button
          type="button"
          className="btn btn-ghost envelope-form__btn"
          onClick={() => handleMovement(-1)}
        >
          Retirer
        </button>
      </div>

      {movements.length > 0 && (
        <details className="envelope-history">
          <summary>Derniers mouvements</summary>
          <ul>
            {movements.slice(0, 8).map((m) => (
              <li key={m.id}>
                <span className={Number(m.amount) >= 0 ? 'is-positive' : 'is-negative'}>
                  {Number(m.amount) >= 0 ? '+' : ''}
                  {formatEUR(m.amount)}
                </span>
                <span className="envelope-history__date">
                  {new Date(m.created_at).toLocaleDateString('fr-FR')}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}

export default function Savings() {
  const { envelopes, movements, loading, addEnvelope, removeEnvelope, addEnvelopeMovement } =
    useSavings()
  const { getMonthSummary } = useBudget()
  const [cursor, setCursor] = useState(todayISO())
  const [name, setName] = useState('')
  const [goal, setGoal] = useState('')

  const monthKey = monthKeyOf(cursor)
  const disponible = getMonthSummary(monthKey).resteAVivreNet

  const movementsByEnvelope = useMemo(() => {
    const map = new Map()
    movements.forEach((m) => {
      if (!map.has(m.envelope_id)) map.set(m.envelope_id, [])
      map.get(m.envelope_id).push(m)
    })
    return map
  }, [movements])

  const distribuedCeMois = useMemo(
    () =>
      movements
        .filter((m) => m.month === monthKey)
        .reduce((sum, m) => sum + Number(m.amount), 0),
    [movements, monthKey]
  )

  const restantARepartir = disponible - distribuedCeMois

  const pieData = useMemo(
    () =>
      envelopes.map((e, i) => ({
        key: e.id,
        label: e.name,
        value: Number(e.current_amount),
        color: colorForIndex(i),
      })),
    [envelopes]
  )

  async function handleMovement(envelope, amount) {
    await addEnvelopeMovement(envelope, amount, null, monthKey)
  }

  async function handleAdd(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setName('')
    setGoal('')
    await addEnvelope(trimmed, goal ? Number(goal) : null)
  }

  return (
    <>
      <PageHeader eyebrow="Épargne" title="Économies" subtitle="Une enveloppe par objectif" />
      <div className="page-content">
        <div className="card">
          <div className="budget-month-nav">
            <button
              type="button"
              className="btn btn-ghost btn-icon"
              onClick={() => setCursor((c) => addMonths(c, -1))}
              aria-label="Mois précédent"
            >
              ‹
            </button>
            <h2 className="budget-month-nav__label">{formatMonthLabelFR(cursor)}</h2>
            <button
              type="button"
              className="btn btn-ghost btn-icon"
              onClick={() => setCursor((c) => addMonths(c, 1))}
              aria-label="Mois suivant"
            >
              ›
            </button>
          </div>
          <div className="budget-summary budget-summary--secondary">
            <div className="budget-summary__stat">
              <span className="budget-summary__label">Reste à vivre net</span>
              <span className="budget-summary__value budget-summary__value--net">
                {formatEUR(disponible)}
              </span>
            </div>
            <div className="budget-summary__stat">
              <span className="budget-summary__label">Déjà réparti</span>
              <span className="budget-summary__value">{formatEUR(distribuedCeMois)}</span>
            </div>
            <div className="budget-summary__stat">
              <span className="budget-summary__label">Restant à répartir</span>
              <span
                className={
                  'budget-summary__value' +
                  (restantARepartir < 0 ? ' budget-summary__value--depense' : ' budget-summary__value--revenu')
                }
              >
                {formatEUR(restantARepartir)}
              </span>
            </div>
          </div>
        </div>

        {envelopes.length > 0 && (
          <div className="card">
            <h2 className="card-title">
              Répartition
              <small>Totaux cumulés par enveloppe</small>
            </h2>
            <PieChart data={pieData} formatValue={formatEUR} />
          </div>
        )}

        {loading ? (
          <div className="card">
            <p className="empty-hint">Chargement…</p>
          </div>
        ) : envelopes.length === 0 ? (
          <div className="card">
            <p className="empty-hint">Aucune enveloppe pour l’instant.</p>
          </div>
        ) : (
          envelopes.map((envelope) => (
            <EnvelopeCard
              key={envelope.id}
              envelope={envelope}
              movements={movementsByEnvelope.get(envelope.id) || []}
              onMovement={handleMovement}
              onRemove={removeEnvelope}
            />
          ))
        )}

        <div className="card">
          <h2 className="card-title">
            Nouvelle enveloppe
            <small>Avec ou sans objectif</small>
          </h2>
          <form className="envelope-create-form" onSubmit={handleAdd}>
            <input
              className="input"
              type="text"
              placeholder="Nom de l’enveloppe…"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="envelope-create-form__row">
              <input
                className="input"
                type="number"
                min="0"
                step="0.01"
                placeholder="Objectif € (optionnel)"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
              <button type="submit" className="btn btn-icon" aria-label="Créer">
                <PlusIcon width={16} height={16} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
