import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import {
  fetchAllSalary,
  setSalaryMonth,
  fetchAllIncomeEntries,
  createIncomeEntry,
  deleteIncomeEntry,
  fetchFixedChargeTemplates,
  fetchAllFixedChargeEntries,
  createFixedChargeTemplate,
  deactivateFixedChargeTemplate,
  setFixedChargeEntryAmount,
  ensureFixedChargeEntriesForMonth,
  fetchVariableChargeTemplates,
  fetchAllVariableChargeEntries,
  createVariableChargeTemplate,
  deactivateVariableChargeTemplate,
  setVariableChargeEntry,
  fetchAllExceptionalExpenses,
  createExceptionalExpense,
  deleteExceptionalExpense,
  fetchAllDebts,
  createDebt,
  updateDebtAmount,
  deleteDebt,
} from '../lib/data/budget'

const BudgetContext = createContext(null)

export function BudgetProvider({ children }) {
  const [salary, setSalary] = useState([])
  const [incomeEntries, setIncomeEntries] = useState([])
  const [fixedTemplates, setFixedTemplates] = useState([])
  const [fixedEntries, setFixedEntries] = useState([])
  const [variableTemplates, setVariableTemplates] = useState([])
  const [variableEntries, setVariableEntries] = useState([])
  const [exceptionalExpenses, setExceptionalExpenses] = useState([])
  const [debts, setDebts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      fetchAllSalary(),
      fetchAllIncomeEntries(),
      fetchFixedChargeTemplates(),
      fetchAllFixedChargeEntries(),
      fetchVariableChargeTemplates(),
      fetchAllVariableChargeEntries(),
      fetchAllExceptionalExpenses(),
      fetchAllDebts(),
    ]).then(
      ([
        salaryData,
        incomeData,
        fixedTemplatesData,
        fixedEntriesData,
        variableTemplatesData,
        variableEntriesData,
        exceptionalData,
        debtsData,
      ]) => {
        if (cancelled) return
        setSalary(salaryData)
        setIncomeEntries(incomeData)
        setFixedTemplates(fixedTemplatesData)
        setFixedEntries(fixedEntriesData)
        setVariableTemplates(variableTemplatesData)
        setVariableEntries(variableEntriesData)
        setExceptionalExpenses(exceptionalData)
        setDebts(debtsData)
        setLoading(false)
      }
    )
    return () => {
      cancelled = true
    }
  }, [])

  const setMonthSalary = useCallback(async (month, amount) => {
    const record = await setSalaryMonth(month, amount)
    setSalary((prev) => {
      const exists = prev.some((s) => s.month === month)
      return exists ? prev.map((s) => (s.month === month ? record : s)) : [...prev, record]
    })
    return record
  }, [])

  const addIncomeEntry = useCallback(async (entry) => {
    const created = await createIncomeEntry(entry)
    setIncomeEntries((prev) => [...prev, created])
    return created
  }, [])

  const removeIncomeEntry = useCallback(async (id) => {
    setIncomeEntries((prev) => prev.filter((e) => e.id !== id))
    await deleteIncomeEntry(id)
  }, [])

  const addFixedTemplate = useCallback(async (name, amount) => {
    const template = await createFixedChargeTemplate(name, amount)
    setFixedTemplates((prev) => [...prev, template])
    return template
  }, [])

  const removeFixedTemplate = useCallback(async (id) => {
    setFixedTemplates((prev) => prev.filter((t) => t.id !== id))
    await deactivateFixedChargeTemplate(id)
  }, [])

  const setFixedEntry = useCallback(async (templateId, month, amount) => {
    const entry = await setFixedChargeEntryAmount(templateId, month, amount)
    setFixedEntries((prev) => {
      const exists = prev.some((e) => e.template_id === templateId && e.month === month)
      return exists
        ? prev.map((e) => (e.template_id === templateId && e.month === month ? entry : e))
        : [...prev, entry]
    })
    setFixedTemplates((prev) => prev.map((t) => (t.id === templateId ? { ...t, amount } : t)))
    return entry
  }, [])

  const ensureFixedEntriesForMonth = useCallback(
    async (month) => {
      const created = await ensureFixedChargeEntriesForMonth(month, fixedTemplates, fixedEntries)
      if (created.length > 0) {
        setFixedEntries((prev) => [...prev, ...created])
      }
    },
    [fixedTemplates, fixedEntries]
  )

  const addVariableTemplate = useCallback(async (name) => {
    const template = await createVariableChargeTemplate(name)
    setVariableTemplates((prev) => [...prev, template])
    return template
  }, [])

  const removeVariableTemplate = useCallback(async (id) => {
    setVariableTemplates((prev) => prev.filter((t) => t.id !== id))
    await deactivateVariableChargeTemplate(id)
  }, [])

  const setVariableEntry = useCallback(async (templateId, month, values) => {
    const entry = await setVariableChargeEntry(templateId, month, values)
    setVariableEntries((prev) => {
      const exists = prev.some((e) => e.template_id === templateId && e.month === month)
      return exists
        ? prev.map((e) => (e.template_id === templateId && e.month === month ? entry : e))
        : [...prev, entry]
    })
    return entry
  }, [])

  const addExceptionalExpense = useCallback(async (expense) => {
    const created = await createExceptionalExpense(expense)
    setExceptionalExpenses((prev) => [created, ...prev])
    return created
  }, [])

  const removeExceptionalExpense = useCallback(async (id) => {
    setExceptionalExpenses((prev) => prev.filter((e) => e.id !== id))
    await deleteExceptionalExpense(id)
  }, [])

  const addDebt = useCallback(async (debt) => {
    const created = await createDebt(debt)
    setDebts((prev) => [...prev, created])
    return created
  }, [])

  const editDebtAmount = useCallback(async (id, amount) => {
    setDebts((prev) => prev.map((d) => (d.id === id ? { ...d, amount } : d)))
    await updateDebtAmount(id, amount)
  }, [])

  const removeDebt = useCallback(async (id) => {
    setDebts((prev) => prev.filter((d) => d.id !== id))
    await deleteDebt(id)
  }, [])

  const getMonthSummary = useCallback(
    (month) => {
      const salaryAmount = Number(salary.find((s) => s.month === month)?.amount ?? 0)
      const incomeMonth = incomeEntries.filter((e) => e.month === month)
      const businessIncome = incomeMonth
        .filter((e) => e.category === 'business')
        .reduce((sum, e) => sum + Number(e.amount), 0)
      const exceptionsIncome = incomeMonth
        .filter((e) => e.category === 'exceptions')
        .reduce((sum, e) => sum + Number(e.amount), 0)
      const totalRevenus = salaryAmount + businessIncome + exceptionsIncome

      const totalFixed = fixedEntries
        .filter((e) => e.month === month)
        .reduce((sum, e) => sum + Number(e.amount), 0)
      const totalVariable = variableEntries
        .filter((e) => e.month === month)
        .reduce((sum, e) => sum + Number(e.actual ?? e.estimated ?? 0), 0)
      const totalCharges = totalFixed + totalVariable

      const totalExceptional = exceptionalExpenses
        .filter((e) => e.month === month)
        .reduce((sum, e) => sum + Number(e.amount), 0)

      const resteAVivre = totalRevenus - totalCharges - totalExceptional
      const totalDebts = debts.reduce((sum, d) => sum + Number(d.amount), 0)
      const resteAVivreNet = resteAVivre - totalDebts

      return {
        salaryAmount,
        businessIncome,
        exceptionsIncome,
        totalRevenus,
        totalFixed,
        totalVariable,
        totalCharges,
        totalExceptional,
        resteAVivre,
        totalDebts,
        resteAVivreNet,
      }
    },
    [salary, incomeEntries, fixedEntries, variableEntries, exceptionalExpenses, debts]
  )

  const value = useMemo(
    () => ({
      loading,
      salary,
      incomeEntries,
      fixedTemplates,
      fixedEntries,
      variableTemplates,
      variableEntries,
      exceptionalExpenses,
      debts,
      setMonthSalary,
      addIncomeEntry,
      removeIncomeEntry,
      addFixedTemplate,
      removeFixedTemplate,
      setFixedEntry,
      ensureFixedEntriesForMonth,
      addVariableTemplate,
      removeVariableTemplate,
      setVariableEntry,
      addExceptionalExpense,
      removeExceptionalExpense,
      addDebt,
      editDebtAmount,
      removeDebt,
      getMonthSummary,
    }),
    [
      loading,
      salary,
      incomeEntries,
      fixedTemplates,
      fixedEntries,
      variableTemplates,
      variableEntries,
      exceptionalExpenses,
      debts,
      setMonthSalary,
      addIncomeEntry,
      removeIncomeEntry,
      addFixedTemplate,
      removeFixedTemplate,
      setFixedEntry,
      ensureFixedEntriesForMonth,
      addVariableTemplate,
      removeVariableTemplate,
      setVariableEntry,
      addExceptionalExpense,
      removeExceptionalExpense,
      addDebt,
      editDebtAmount,
      removeDebt,
      getMonthSummary,
    ]
  )

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>
}

export function useBudget() {
  const ctx = useContext(BudgetContext)
  if (!ctx) throw new Error('useBudget must be used within BudgetProvider')
  return ctx
}
