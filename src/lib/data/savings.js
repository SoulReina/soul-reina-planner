import { supabase, isSupabaseConfigured } from '../supabaseClient'
import { readAll, writeAll } from '../localStore'

const ENVELOPES_KEY = 'srp_savings_envelopes'
const MOVEMENTS_KEY = 'srp_savings_movements'

// Mêmes enveloppes par défaut que le seed SQL (voir supabase/schema.sql),
// pour que le mode localStorage (Supabase non configuré) parte du même état.
const DEFAULT_ENVELOPES = [
  { name: 'Santé', slug: 'sante' },
  { name: 'Voiture', slug: 'voiture' },
  { name: 'Maison', slug: 'maison' },
  { name: 'Urgences', slug: 'urgences' },
  { name: 'Voyages', slug: 'voyages' },
  { name: 'Plaisir', slug: 'plaisir' },
  { name: 'Cadeaux', slug: 'cadeaux' },
  { name: 'Beauté', slug: 'beaute' },
  { name: 'Business', slug: 'business' },
  { name: 'Jayden', slug: 'jayden' },
  { name: 'Livret A', slug: 'livret-a' },
]

function seedDefaultEnvelopes() {
  const seeded = DEFAULT_ENVELOPES.map((e, position) => ({
    id: crypto.randomUUID(),
    goal_amount: null,
    current_amount: 0,
    position,
    created_at: new Date().toISOString(),
    ...e,
  }))
  writeAll(ENVELOPES_KEY, seeded)
  return seeded
}

export async function fetchAllEnvelopes() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('savings_envelopes')
      .select('*')
      .order('position', { ascending: true })
    if (error) throw error
    return data
  }
  const existing = readAll(ENVELOPES_KEY)
  const envelopes = existing.length > 0 ? existing : seedDefaultEnvelopes()
  return envelopes.sort((a, b) => a.position - b.position)
}

export async function createEnvelope(name, goalAmount) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('savings_envelopes')
      .insert({ name, goal_amount: goalAmount })
      .select()
      .single()
    if (error) throw error
    return data
  }
  const all = readAll(ENVELOPES_KEY)
  const item = {
    id: crypto.randomUUID(),
    name,
    goal_amount: goalAmount,
    current_amount: 0,
    position: all.length,
    created_at: new Date().toISOString(),
  }
  writeAll(ENVELOPES_KEY, [...all, item])
  return item
}

export async function deleteEnvelope(id) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('savings_envelopes').delete().eq('id', id)
    if (error) throw error
    return
  }
  writeAll(
    ENVELOPES_KEY,
    readAll(ENVELOPES_KEY).filter((e) => e.id !== id)
  )
  writeAll(
    MOVEMENTS_KEY,
    readAll(MOVEMENTS_KEY).filter((m) => m.envelope_id !== id)
  )
}

export async function fetchAllMovements() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('savings_movements')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  }
  return readAll(MOVEMENTS_KEY).sort((a, b) => b.created_at.localeCompare(a.created_at))
}

export async function addMovement(envelope, amount, note, month) {
  const nextAmount = Number(envelope.current_amount) + amount
  if (isSupabaseConfigured) {
    const { data: movement, error: movementError } = await supabase
      .from('savings_movements')
      .insert({ envelope_id: envelope.id, amount, note, month })
      .select()
      .single()
    if (movementError) throw movementError
    const { data: updatedEnvelope, error: envelopeError } = await supabase
      .from('savings_envelopes')
      .update({ current_amount: nextAmount })
      .eq('id', envelope.id)
      .select()
      .single()
    if (envelopeError) throw envelopeError
    return { movement, envelope: updatedEnvelope }
  }
  const movement = {
    id: crypto.randomUUID(),
    envelope_id: envelope.id,
    amount,
    note,
    month,
    created_at: new Date().toISOString(),
  }
  writeAll(MOVEMENTS_KEY, [...readAll(MOVEMENTS_KEY), movement])
  const updatedEnvelope = { ...envelope, current_amount: nextAmount }
  writeAll(
    ENVELOPES_KEY,
    readAll(ENVELOPES_KEY).map((e) => (e.id === envelope.id ? updatedEnvelope : e))
  )
  return { movement, envelope: updatedEnvelope }
}
