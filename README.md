# ReinaOrga

Mon appli planner personnelle — React + Vite, connectée à Supabase.

## Design

- Fond : `#0E0C0A` (noir)
- Cartes/encadrés : `#F4EEE1` (beige), texte noir
- Accents : `#EFD9DC` (rose pâle, bordure `#D98CA0`), `#C9A654` (or)
- Polices : Cormorant Garamond (titres, italique), Montserrat (texte)

## Onglets

Aujourd'hui · Calendrier · Tâches · Rituels · Contenu · Budget · Économies · Business · To Do Liste
(navigation basse)

## Setup

```bash
npm install
cp .env.example .env   # renseigner VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY
npm run dev
```

Tant que Supabase n'est pas configuré, l'app fonctionne avec des données stockées en local (localStorage) pour l'onglet Aujourd'hui.

Le schéma SQL des tables attendues par l'app se trouve dans `supabase/schema.sql`.
