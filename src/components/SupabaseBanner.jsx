import { isSupabaseConfigured } from '../lib/supabaseClient'
import './SupabaseBanner.css'

export default function SupabaseBanner() {
  if (isSupabaseConfigured) return null

  return (
    <div className="supabase-banner">
      Supabase non connecté — les données sont sauvegardées uniquement sur cet
      appareil (localStorage). Renseigne{' '}
      <code>VITE_SUPABASE_URL</code> et <code>VITE_SUPABASE_ANON_KEY</code>{' '}
      dans <code>.env</code> pour synchroniser.
    </div>
  )
}
