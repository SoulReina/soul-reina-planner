-- Schéma Supabase pour Soul Reina Planner
-- À exécuter dans l'éditeur SQL du projet Supabase.
-- App mono-utilisateur (pas d'auth pour l'instant) : RLS ouvert via la clé anon.

create extension if not exists "pgcrypto";

-- Onglet "Aujourd'hui" -------------------------------------------------

create table if not exists priorities (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date,
  content text not null,
  level text not null default 'a_faire' check (level in ('urgent', 'important', 'a_faire')),
  is_done boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists schedule_blocks (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date,
  start_time time not null,
  end_time time,
  title text not null,
  type text not null check (type in ('salarie', 'solo')),
  notes text,
  created_at timestamptz not null default now()
);

-- Onglet "Rituels" ---------------------------------------------------------
-- Utilisée à la fois par l'onglet "Rituels" (matin/soir) et par la carte
-- "Rituels" de l'onglet "Aujourd'hui" : une seule source de vérité.

create table if not exists rituals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('matin', 'soir')),
  position integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists ritual_logs (
  id uuid primary key default gen_random_uuid(),
  ritual_id uuid not null references rituals (id) on delete cascade,
  date date not null default current_date,
  done boolean not null default false,
  created_at timestamptz not null default now(),
  unique (ritual_id, date)
);

-- Onglet "Contenu" ---------------------------------------------------------

create table if not exists content_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  platform text not null default 'Instagram',
  status text not null default 'idee' check (status in ('idee', 'en_cours', 'planifie', 'publie')),
  date date,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_priorities_date on priorities (date);
create index if not exists idx_schedule_blocks_date on schedule_blocks (date);
create index if not exists idx_ritual_logs_date on ritual_logs (date);
create index if not exists idx_content_items_date on content_items (date);

-- Row Level Security -----------------------------------------------------
-- App personnelle sans authentification : on ouvre l'accès complet à la clé anon.
-- (à restreindre plus tard si une authentification est ajoutée)

alter table priorities enable row level security;
alter table schedule_blocks enable row level security;
alter table rituals enable row level security;
alter table ritual_logs enable row level security;
alter table content_items enable row level security;

create policy "public access" on priorities for all using (true) with check (true);
create policy "public access" on schedule_blocks for all using (true) with check (true);
create policy "public access" on rituals for all using (true) with check (true);
create policy "public access" on ritual_logs for all using (true) with check (true);
create policy "public access" on content_items for all using (true) with check (true);

