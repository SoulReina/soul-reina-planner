import { supabase, isSupabaseConfigured } from '../supabaseClient'
import { readAll, writeAll } from '../localStore'

const KEY = 'srp_business_envelopes'

export async function fetchAllBusinessEnvelopes() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('business_envelopes')
      .select('*')
      .order('position', { ascending: true })
    if (error) throw error
    return data
  }
  return readAll(KEY).sort((a, b) => a.position - b.position)
}

export async function createBusinessEnvelope(name, amount) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('business_envelopes')
      .insert({ name, amount })
      .select()
      .single()
    if (error) throw error
    return data
  }
  const all = readAll(KEY)
  const record = {
    id: crypto.randomUUID(),
    name,
    amount,
    position: all.length,
    created_at: new Date().toISOString(),
  }
  writeAll(KEY, [...all, record])
  return record
}

export async function deleteBusinessEnvelope(id) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('business_envelopes').delete().eq('id', id)
    if (error) throw error
    return
  }
  writeAll(
    KEY,
    readAll(KEY).filter((e) => e.id !== id)
  )
}
