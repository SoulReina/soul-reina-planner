import { useEffect, useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import { useBudget } from '../context/BudgetContext'
import { PlusIcon, TrashIcon } from '../components/icons'
import { todayISO, formatMonthLabelFR, addMonths } from '../utils/date'
import BarChart, { monthlyBarData } from '../components/charts/BarChart'
import './Budget.css'

function formatEUR(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount || 0)
}

function monthKeyOf(cursor) {
  return `${cursor.slice(0, 7)}-01`
}

function InlineAmount({ value, onCommit, placeholder }) {
  const [draft, setDraft] = useState(value ?? '')

  useEffect(() => {
    setDraft(value ?? '')
  }, [value])

  function commit() {
    const num = Number(draft)
    if (draft === '' || Number.isNaN(num)) {
      setDraft(value ?? '')
      return
    }
    if (num !== Number(value ?? 0)) onCommit(num)
  }

  return (
    <input
      className="input budget-inline-amount"
      type="number"
      min="0"
      step="0.01"
      placeholder={placeholder}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
    />
  )
}

function SalaryRow({ monthKey }) {
  const { salary, setMonthSalary } = useBudget()
  const amount = salary.find((s) => s.month === monthKey)?.amount ?? 0

  return (
    <div className="budget-row">
      <span className="budget-row__label">Salaire</span>
      <InlineAmount value={amount} onCommit={(v) => setMonthSalary(monthKey, v)} placeholder="Montant €" />
    </div>
  )
}

function IncomeList({ monthKey, category, title }) {
  const { incomeEntries, addIncomeEntry, removeIncomeEntry } = useBudget()
  const [label, setLabel] = useState('')
  const [note, setNote] = useState('')
  const [amount, setAmount] = useState('')

  const entries = incomeEntries.filter((e) => e.month === monthKey && e.category === category)

  async function handleAdd(e) {
    e.preventDefault()
    const trimmed = label.trim()
    const num = Number(amount)
    if (!trimmed || !num || num <= 0) return
    await addIncomeEntry({
      month: monthKey,
      category,
      label: trimmed,
      amount: num,
      note: note.trim() || null,
    })
    setLabel('')
    setNote('')
    setAmount('')
  }

  return (
    <div className="budget-subsection">
      <h3 className="budget-subsection__title">{title}</h3>
      {entries.length > 0 && (
        <ul className="budget-entry-list">
          {entries.map((e) => (
            <li key={e.id} className="budget-entry">
              <div className="budget-entry__body">
                <span className="budget-entry__label">{e.label}</span>
                {e.note && <span className="budget-entry__note">{e.note}</span>}
              </div>
              <span className="budget-entry__amount budget-entry__amount--revenu">
                +{formatEUR(e.amount)}
              </span>
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                onClick={() => removeIncomeEntry(e.id)}
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
          placeholder="Libellé…"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <input
          className="input"
          type="text"
          placeholder="Note (optionnel)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="budget-inline-form__row">
          <input
            className="input"
            type="number"
            min="0"
            step="0.01"
            placeholder="Montant €"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button type="submit" className="btn btn-icon" aria-label="Ajouter">
            <PlusIcon width={16} height={16} />
          </button>
        </div>
      </form>
    </div>
  )
}

function FixedCharges({ monthKey }) {
  const { fixedTemplates, fixedEntries, addFixedTemplate, removeFixedTemplate, setFixedEntry } =
    useBudget()
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')

  async function handleAdd(e) {
    e.preventDefault()
    const trimmed = name.trim()
    const num = Number(amount)
    if (!trimmed || !num || num <= 0) return
    const template = await addFixedTemplate(trimmed, num)
    await setFixedEntry(template.id, monthKey, num)
    setName('')
    setAmount('')
  }

  return (
    <div className="card">
      <h2 className="card-title">
        Charges fixes
        <small>Mémorisées d’un mois sur l’autre</small>
      </h2>
      {fixedTemplates.length === 0 ? (
        <p className="empty-hint">Aucune charge fixe pour l’instant.</p>
      ) : (
        <ul className="budget-entry-list">
          {fixedTemplates.map((t) => {
            const entry = fixedEntries.find((e) => e.template_id === t.id && e.month === monthKey)
            return (
              <li key={t.id} className="budget-entry">
                <span className="budget-entry__label budget-entry__label--grow">{t.name}</span>
                <InlineAmount
                  value={entry?.amount ?? t.amount}
                  onCommit={(v) => setFixedEntry(t.id, monthKey, v)}
                  placeholder="Montant €"
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-icon"
                  onClick={() => removeFixedTemplate(t.id)}
                  aria-label="Retirer"
                >
                  <TrashIcon width={14} height={14} />
                </button>
              </li>
            )
          })}
        </ul>
      )}
      <form className="budget-inline-form" onSubmit={handleAdd}>
        <input
          className="input"
          type="text"
          placeholder="Nouvelle charge fixe…"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="budget-inline-form__row">
          <input
            className="input"
            type="number"
            min="0"
            step="0.01"
            placeholder="Montant €"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button type="submit" className="btn btn-icon" aria-label="Ajouter">
            <PlusIcon width={16} height={16} />
          </button>
        </div>
      </form>
    </div>
  )
}

function VariableCharges({ monthKey }) {
  const {
    variableTemplates,
    variableEntries,
    addVariableTemplate,
    removeVariableTemplate,
    setVariableEntry,
  } = useBudget()
  const [name, setName] = useState('')

  async function handleAdd(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    await addVariableTemplate(trimmed)
    setName('')
  }

  return (
    <div className="card">
      <h2 className="card-title">
        Charges variables
        <small>Estimé, puis Réel une fois connu</small>
      </h2>
      {variableTemplates.length === 0 ? (
        <p className="empty-hint">Aucune charge variable pour l’instant.</p>
      ) : (
        <ul className="budget-entry-list">
          {variableTemplates.map((t) => {
            const entry = variableEntries.find(
              (e) => e.template_id === t.id && e.month === monthKey
            )
            return (
              <li key={t.id} className="budget-entry budget-entry--variable">
                <span className="budget-entry__label budget-entry__label--grow">{t.name}</span>
                <InlineAmount
                  value={entry?.estimated ?? ''}
                  placeholder="Estimé €"
                  onCommit={(v) =>
                    setVariableEntry(t.id, monthKey, { estimated: v, actual: entry?.actual ?? null })
                  }
                />
                <InlineAmount
                  value={entry?.actual ?? ''}
                  placeholder="Réel €"
                  onCommit={(v) =>
                    setVariableEntry(t.id, monthKey, {
                      estimated: entry?.estimated ?? 0,
                      actual: v,
                    })
                  }
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-icon"
                  onClick={() => removeVariableTemplate(t.id)}
                  aria-label="Retirer"
                >
                  <TrashIcon width={14} height={14} />
                </button>
              </li>
            )
          })}
        </ul>
      )}
      <form className="budget-inline-form" onSubmit={handleAdd}>
        <input
          className="input"
          type="text"
          placeholder="Nouvelle charge variable…"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" className="btn btn-icon" aria-label="Ajouter">
          <PlusIcon width={16} height={16} />
        </button>
      </form>
    </div>
  )
}

function ExceptionalExpenses({ monthKey }) {
  const { exceptionalExpenses, addExceptionalExpense, removeExceptionalExpense } = useBudget()
  const [label, setLabel] = useState('')
  const [amount, setAmount] = useState('')

  const items = exceptionalExpenses.filter((e) => e.month === monthKey)

  async function handleAdd(e) {
    e.preventDefault()
    const trimmed = label.trim()
    const num = Number(amount)
    if (!trimmed || !num || num <= 0) return
    await addExceptionalExpense({ month: monthKey, label: trimmed, amount: num })
    setLabel('')
    setAmount('')
  }

  return (
    <div className="card">
      <h2 className="card-title">
        Dépenses exceptionnelles
        <small>Ponctuelles, ce mois-ci</small>
      </h2>
      {items.length === 0 ? (
        <p className="empty-hint">Aucune dépense exceptionnelle ce mois-ci.</p>
      ) : (
        <ul className="budget-entry-list">
          {items.map((e) => (
            <li key={e.id} className="budget-entry">
              <span className="budget-entry__label budget-entry__label--grow">{e.label}</span>
              <span className="budget-entry__amount budget-entry__amount--depense">
                −{formatEUR(e.amount)}
              </span>
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                onClick={() => removeExceptionalExpense(e.id)}
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
          placeholder="Libellé…"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <div className="budget-inline-form__row">
          <input
            className="input"
            type="number"
            min="0"
            step="0.01"
            placeholder="Montant €"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button type="submit" className="btn btn-icon" aria-label="Ajouter">
            <PlusIcon width={16} height={16} />
          </button>
        </div>
      </form>
    </div>
  )
}

function Debts() {
  const { debts, addDebt, editDebtAmount, removeDebt } = useBudget()
  const [label, setLabel] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')

  async function handleAdd(e) {
    e.preventDefault()
    const trimmed = label.trim()
    const num = Number(amount)
    if (!trimmed || !num || num <= 0) return
    await addDebt({ label: trimmed, amount: num, note: note.trim() || null })
    setLabel('')
    setAmount('')
    setNote('')
  }

  return (
    <div className="card">
      <h2 className="card-title">
        Dettes
        <small>Soldes restants, hors reste à vivre principal</small>
      </h2>
      {debts.length === 0 ? (
        <p className="empty-hint">Aucune dette en cours.</p>
      ) : (
        <ul className="budget-entry-list">
          {debts.map((d) => (
            <li key={d.id} className="budget-entry">
              <div className="budget-entry__body">
                <span className="budget-entry__label">{d.label}</span>
                {d.note && <span className="budget-entry__note">{d.note}</span>}
              </div>
              <InlineAmount value={d.amount} onCommit={(v) => editDebtAmount(d.id, v)} />
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                onClick={() => removeDebt(d.id)}
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
          placeholder="Libellé…"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <input
          className="input"
          type="text"
          placeholder="Note (optionnel)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="budget-inline-form__row">
          <input
            className="input"
            type="number"
            min="0"
            step="0.01"
            placeholder="Montant restant €"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button type="submit" className="btn btn-icon" aria-label="Ajouter">
            <PlusIcon width={16} height={16} />
          </button>
        </div>
      </form>
    </div>
  )
}

export default function Budget() {
  const { loading, ensureFixedEntriesForMonth, getMonthSummary } = useBudget()
  const [cursor, setCursor] = useState(todayISO())
  const currentYear = Number(todayISO().slice(0, 4))
  const [chartYear, setChartYear] = useState(currentYear)

  const monthKey = monthKeyOf(cursor)
  const summary = getMonthSummary(monthKey)

  useEffect(() => {
    ensureFixedEntriesForMonth(monthKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthKey, ensureFixedEntriesForMonth])

  const revenueData = useMemo(
    () => monthlyBarData(chartYear, (m) => getMonthSummary(m).totalRevenus),
    [chartYear, getMonthSummary]
  )
  const netData = useMemo(
    () => monthlyBarData(chartYear, (m) => getMonthSummary(m).resteAVivreNet),
    [chartYear, getMonthSummary]
  )

  return (
    <>
      <PageHeader eyebrow="Finances" title="Budget" subtitle="Revenus, charges, reste à vivre" />
      <div className="page-content">
        <div className="card budget-nav-card">
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
        </div>

        {loading ? (
          <div className="card">
            <p className="empty-hint">Chargement…</p>
          </div>
        ) : (
          <>
            <div className="card">
              <h2 className="card-title">
                Revenus
                <small>{formatMonthLabelFR(cursor)}</small>
              </h2>
              <SalaryRow monthKey={monthKey} />
              <IncomeList monthKey={monthKey} category="business" title="Business" />
              <IncomeList monthKey={monthKey} category="exceptions" title="Exceptions" />
            </div>

            <FixedCharges monthKey={monthKey} />
            <VariableCharges monthKey={monthKey} />
            <ExceptionalExpenses monthKey={monthKey} />
            <Debts />

            <div className="card">
              <h2 className="card-title">
                Récapitulatif du mois
                <small>{formatMonthLabelFR(cursor)}</small>
              </h2>
              <div className="budget-summary">
                <div className="budget-summary__stat">
                  <span className="budget-summary__label">Revenus</span>
                  <span className="budget-summary__value budget-summary__value--revenu">
                    {formatEUR(summary.totalRevenus)}
                  </span>
                </div>
                <div className="budget-summary__stat">
                  <span className="budget-summary__label">Charges</span>
                  <span className="budget-summary__value budget-summary__value--depense">
                    {formatEUR(summary.totalCharges)}
                  </span>
                </div>
                <div className="budget-summary__stat">
                  <span className="budget-summary__label">Except.</span>
                  <span className="budget-summary__value budget-summary__value--depense">
                    {formatEUR(summary.totalExceptional)}
                  </span>
                </div>
              </div>
              <div className="budget-summary budget-summary--secondary">
                <div className="budget-summary__stat">
                  <span className="budget-summary__label">Reste à vivre</span>
                  <span className="budget-summary__value">{formatEUR(summary.resteAVivre)}</span>
                </div>
                <div className="budget-summary__stat">
                  <span className="budget-summary__label">Dettes</span>
                  <span className="budget-summary__value budget-summary__value--depense">
                    {formatEUR(summary.totalDebts)}
                  </span>
                </div>
                <div className="budget-summary__stat">
                  <span className="budget-summary__label">Reste à vivre net</span>
                  <span className="budget-summary__value budget-summary__value--net">
                    {formatEUR(summary.resteAVivreNet)}
                  </span>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="card-title">
                Revenus par mois
                <small>Vue annuelle</small>
              </h2>
              <BarChart
                data={revenueData}
                year={chartYear}
                onYearChange={setChartYear}
                minYear={currentYear - 5}
                maxYear={currentYear}
                formatValue={formatEUR}
              />
            </div>

            <div className="card">
              <h2 className="card-title">
                Reste à vivre net par mois
                <small>Vue annuelle</small>
              </h2>
              <BarChart
                data={netData}
                year={chartYear}
                onYearChange={setChartYear}
                minYear={currentYear - 5}
                maxYear={currentYear}
                formatValue={formatEUR}
              />
            </div>
          </>
        )}
      </div>
    </>
  )
}
