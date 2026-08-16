import { supabase, isSupabaseConfigured } from '../supabaseClient'
import { readAll, writeAll } from '../localStore'

const SALARY_KEY = 'srp_budget_salary'
const INCOME_KEY = 'srp_budget_income_entries'
const FIXED_TEMPLATES_KEY = 'srp_budget_fixed_templates'
const FIXED_ENTRIES_KEY = 'srp_budget_fixed_entries'
const VARIABLE_TEMPLATES_KEY = 'srp_budget_variable_templates'
const VARIABLE_ENTRIES_KEY = 'srp_budget_variable_entries'
const EXCEPTIONAL_KEY = 'srp_budget_exceptional_expenses'
const DEBTS_KEY = 'srp_debts'

// Salaire ---------------------------------------------------------------

export async function fetchAllSalary() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('budget_salary').select('*')
    if (error) throw error
    return data
  }
  return readAll(SALARY_KEY)
}

export async function setSalaryMonth(month, amount) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('budget_salary')
      .upsert({ month, amount }, { onConflict: 'month' })
      .select()
      .single()
    if (error) throw error
    return data
  }
  const all = readAll(SALARY_KEY)
  const existing = all.find((s) => s.month === month)
  if (existing) {
    const updated = { ...existing, amount }
    writeAll(
      SALARY_KEY,
      all.map((s) => (s === existing ? updated : s))
    )
    return updated
  }
  const record = { id: crypto.randomUUID(), month, amount, created_at: new Date().toISOString() }
  writeAll(SALARY_KEY, [...all, record])
  return record
}

// Revenus Business / Exceptions ------------------------------------------

export async function fetchAllIncomeEntries() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('budget_income_entries')
      .select('*')
      .order('position', { ascending: true })
    if (error) throw error
    return data
  }
  return readAll(INCOME_KEY).sort((a, b) => a.position - b.position)
}

export async function createIncomeEntry(entry) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('budget_income_entries')
      .insert(entry)
      .select()
      .single()
    if (error) throw error
    return data
  }
  const all = readAll(INCOME_KEY)
  const record = {
    id: crypto.randomUUID(),
    note: null,
    ...entry,
    position: all.length,
    created_at: new Date().toISOString(),
  }
  writeAll(INCOME_KEY, [...all, record])
  return record
}

export async function deleteIncomeEntry(id) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('budget_income_entries').delete().eq('id', id)
    if (error) throw error
    return
  }
  writeAll(
    INCOME_KEY,
    readAll(INCOME_KEY).filter((e) => e.id !== id)
  )
}

// Charges fixes -----------------------------------------------------------

export async function fetchFixedChargeTemplates() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('budget_fixed_charge_templates')
      .select('*')
      .eq('active', true)
      .order('position', { ascending: true })
    if (error) throw error
    return data
  }
  return readAll(FIXED_TEMPLATES_KEY)
    .filter((t) => t.active !== false)
    .sort((a, b) => a.position - b.position)
}

export async function fetchAllFixedChargeEntries() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('budget_fixed_charge_entries').select('*')
    if (error) throw error
    return data
  }
  return readAll(FIXED_ENTRIES_KEY)
}

export async function createFixedChargeTemplate(name, amount) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('budget_fixed_charge_templates')
      .insert({ name, amount })
      .select()
      .single()
    if (error) throw error
    return data
  }
  const all = readAll(FIXED_TEMPLATES_KEY)
  const record = {
    id: crypto.randomUUID(),
    name,
    amount,
    active: true,
    position: all.length,
    created_at: new Date().toISOString(),
  }
  writeAll(FIXED_TEMPLATES_KEY, [...all, record])
  return record
}

export async function deactivateFixedChargeTemplate(id) {
  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('budget_fixed_charge_templates')
      .update({ active: false })
      .eq('id', id)
    if (error) throw error
    return
  }
  writeAll(
    FIXED_TEMPLATES_KEY,
    readAll(FIXED_TEMPLATES_KEY).map((t) => (t.id === id ? { ...t, active: false } : t))
  )
}

// Verrouille le montant d'un mois pour un gabarit, et fait de cette valeur
// le nouveau défaut proposé pour les mois suivants.
export async function setFixedChargeEntryAmount(templateId, month, amount) {
  if (isSupabaseConfigured) {
    const [{ data: entry, error: entryError }] = await Promise.all([
      supabase
        .from('budget_fixed_charge_entries')
        .upsert({ template_id: templateId, month, amount }, { onConflict: 'template_id,month' })
        .select()
        .single(),
    ])
    if (entryError) throw entryError
    const { error: templateError } = await supabase
      .from('budget_fixed_charge_templates')
      .update({ amount })
      .eq('id', templateId)
    if (templateError) throw templateError
    return entry
  }
  const allEntries = readAll(FIXED_ENTRIES_KEY)
  const existing = allEntries.find((e) => e.template_id === templateId && e.month === month)
  let entry
  if (existing) {
    entry = { ...existing, amount }
    writeAll(
      FIXED_ENTRIES_KEY,
      allEntries.map((e) => (e === existing ? entry : e))
    )
  } else {
    entry = {
      id: crypto.randomUUID(),
      template_id: templateId,
      month,
      amount,
      created_at: new Date().toISOString(),
    }
    writeAll(FIXED_ENTRIES_KEY, [...allEntries, entry])
  }
  writeAll(
    FIXED_TEMPLATES_KEY,
    readAll(FIXED_TEMPLATES_KEY).map((t) => (t.id === templateId ? { ...t, amount } : t))
  )
  return entry
}

// Crée, pour un mois donné, les entrées manquantes des gabarits actifs en
// reprenant leur montant par défaut (comportement "mémorisée et proposée").
export async function ensureFixedChargeEntriesForMonth(month, templates, existingEntries) {
  const missing = templates.filter(
    (t) => !existingEntries.some((e) => e.template_id === t.id && e.month === month)
  )
  if (missing.length === 0) return []
  if (isSupabaseConfigured) {
    const rows = missing.map((t) => ({ template_id: t.id, month, amount: t.amount }))
    const { data, error } = await supabase
      .from('budget_fixed_charge_entries')
      .upsert(rows, { onConflict: 'template_id,month' })
      .select()
    if (error) throw error
    return data
  }
  const all = readAll(FIXED_ENTRIES_KEY)
  const created = missing.map((t) => ({
    id: crypto.randomUUID(),
    template_id: t.id,
    month,
    amount: t.amount,
    created_at: new Date().toISOString(),
  }))
  writeAll(FIXED_ENTRIES_KEY, [...all, ...created])
  return created
}

// Charges variables ---------------------------------------------------------

export async function fetchVariableChargeTemplates() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('budget_variable_charge_templates')
      .select('*')
      .eq('active', true)
      .order('position', { ascending: true })
    if (error) throw error
    return data
  }
  return readAll(VARIABLE_TEMPLATES_KEY)
    .filter((t) => t.active !== false)
    .sort((a, b) => a.position - b.position)
}

export async function fetchAllVariableChargeEntries() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('budget_variable_charge_entries').select('*')
    if (error) throw error
    return data
  }
  return readAll(VARIABLE_ENTRIES_KEY)
}

export async function createVariableChargeTemplate(name) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('budget_variable_charge_templates')
      .insert({ name })
      .select()
      .single()
    if (error) throw error
    return data
  }
  const all = readAll(VARIABLE_TEMPLATES_KEY)
  const record = {
    id: crypto.randomUUID(),
    name,
    active: true,
    position: all.length,
    created_at: new Date().toISOString(),
  }
  writeAll(VARIABLE_TEMPLATES_KEY, [...all, record])
  return record
}

export async function deactivateVariableChargeTemplate(id) {
  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('budget_variable_charge_templates')
      .update({ active: false })
      .eq('id', id)
    if (error) throw error
    return
  }
  writeAll(
    VARIABLE_TEMPLATES_KEY,
    readAll(VARIABLE_TEMPLATES_KEY).map((t) => (t.id === id ? { ...t, active: false } : t))
  )
}

export async function setVariableChargeEntry(templateId, month, { estimated, actual }) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('budget_variable_charge_entries')
      .upsert(
        { template_id: templateId, month, estimated, actual },
        { onConflict: 'template_id,month' }
      )
      .select()
      .single()
    if (error) throw error
    return data
  }
  const all = readAll(VARIABLE_ENTRIES_KEY)
  const existing = all.find((e) => e.template_id === templateId && e.month === month)
  let entry
  if (existing) {
    entry = { ...existing, estimated, actual }
    writeAll(
      VARIABLE_ENTRIES_KEY,
      all.map((e) => (e === existing ? entry : e))
    )
  } else {
    entry = {
      id: crypto.randomUUID(),
      template_id: templateId,
      month,
      estimated,
      actual,
      created_at: new Date().toISOString(),
    }
    writeAll(VARIABLE_ENTRIES_KEY, [...all, entry])
  }
  return entry
}

// Dépenses exceptionnelles ---------------------------------------------------

export async function fetchAllExceptionalExpenses() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('budget_exceptional_expenses')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  }
  return readAll(EXCEPTIONAL_KEY).sort((a, b) => b.created_at.localeCompare(a.created_at))
}

export async function createExceptionalExpense(expense) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('budget_exceptional_expenses')
      .insert(expense)
      .select()
      .single()
    if (error) throw error
    return data
  }
  const record = { id: crypto.randomUUID(), ...expense, created_at: new Date().toISOString() }
  writeAll(EXCEPTIONAL_KEY, [...readAll(EXCEPTIONAL_KEY), record])
  return record
}

export async function deleteExceptionalExpense(id) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('budget_exceptional_expenses').delete().eq('id', id)
    if (error) throw error
    return
  }
  writeAll(
    EXCEPTIONAL_KEY,
    readAll(EXCEPTIONAL_KEY).filter((e) => e.id !== id)
  )
}

// Dettes -------------------------------------------------------------------

export async function fetchAllDebts() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('debts')
      .select('*')
      .order('position', { ascending: true })
    if (error) throw error
    return data
  }
  return readAll(DEBTS_KEY).sort((a, b) => a.position - b.position)
}

export async function createDebt(debt) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('debts').insert(debt).select().single()
    if (error) throw error
    return data
  }
  const all = readAll(DEBTS_KEY)
  const record = {
    id: crypto.randomUUID(),
    note: null,
    ...debt,
    position: all.length,
    created_at: new Date().toISOString(),
  }
  writeAll(DEBTS_KEY, [...all, record])
  return record
}

export async function updateDebtAmount(id, amount) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('debts').update({ amount }).eq('id', id)
    if (error) throw error
    return
  }
  writeAll(
    DEBTS_KEY,
    readAll(DEBTS_KEY).map((d) => (d.id === id ? { ...d, amount } : d))
  )
}

export async function deleteDebt(id) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('debts').delete().eq('id', id)
    if (error) throw error
    return
  }
  writeAll(
    DEBTS_KEY,
    readAll(DEBTS_KEY).filter((d) => d.id !== id)
  )
}
