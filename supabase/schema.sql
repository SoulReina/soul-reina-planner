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
  publish_time time,
  body text,
  cta text,
  description text,
  notes text,
  created_at timestamptz not null default now()
);

alter table content_items add column if not exists publish_time time;
alter table content_items add column if not exists body text;
alter table content_items add column if not exists cta text;
alter table content_items add column if not exists description text;

-- Onglet "Aujourd'hui" — tâches récurrentes -------------------------------
-- Gabarit de tâche répétée sur certains jours de la semaine (0=lundi..6=dimanche),
-- fusionnée chaque jour dans la liste à cocher aux côtés des priorités ponctuelles.

create table if not exists recurring_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  weekdays integer[] not null default '{}',
  level text not null default 'a_faire' check (level in ('urgent', 'important', 'a_faire')),
  active boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists recurring_task_logs (
  id uuid primary key default gen_random_uuid(),
  recurring_task_id uuid not null references recurring_tasks (id) on delete cascade,
  date date not null,
  done boolean not null default false,
  created_at timestamptz not null default now(),
  unique (recurring_task_id, date)
);

-- Onglet "Aujourd'hui" — pense-bête (global, une seule ligne) -------------

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  content text not null default '',
  updated_at timestamptz not null default now()
);

-- Onglet "Budget" ----------------------------------------------------------

create table if not exists budget_transactions (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date,
  type text not null check (type in ('revenu', 'depense')),
  category text not null default 'Autre',
  label text not null,
  amount numeric(10, 2) not null check (amount >= 0),
  notes text,
  created_at timestamptz not null default now()
);

-- Onglet "Budget" — revenus ------------------------------------------------
-- Salaire : une seule entrée par mois. Business / Exceptions : listes à
-- entrées multiples avec note optionnelle.

create table if not exists budget_salary (
  id uuid primary key default gen_random_uuid(),
  month date not null unique,
  amount numeric(10, 2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists budget_income_entries (
  id uuid primary key default gen_random_uuid(),
  month date not null,
  category text not null check (category in ('business', 'exceptions')),
  label text not null,
  amount numeric(10, 2) not null check (amount >= 0),
  note text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

-- Onglet "Budget" — charges fixes -------------------------------------------
-- Le gabarit mémorise le libellé et le dernier montant utilisé (proposé par
-- défaut les mois suivants). Chaque mois verrouille sa propre valeur dans
-- budget_fixed_charge_entries pour ne jamais corrompre l'historique déjà
-- affiché dans les graphiques si le gabarit change plus tard.

create table if not exists budget_fixed_charge_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  amount numeric(10, 2) not null default 0,
  active boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists budget_fixed_charge_entries (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references budget_fixed_charge_templates (id) on delete cascade,
  month date not null,
  amount numeric(10, 2) not null default 0,
  created_at timestamptz not null default now(),
  unique (template_id, month)
);

-- Onglet "Budget" — charges variables -----------------------------------
-- Le gabarit ne mémorise que le libellé : Estimé / Réel sont ressaisis
-- chaque mois puisqu'ils varient.

create table if not exists budget_variable_charge_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  active boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists budget_variable_charge_entries (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references budget_variable_charge_templates (id) on delete cascade,
  month date not null,
  estimated numeric(10, 2) not null default 0,
  actual numeric(10, 2),
  created_at timestamptz not null default now(),
  unique (template_id, month)
);

-- Onglet "Budget" — dépenses exceptionnelles ---------------------------
-- Liste libre, non mémorisée d'un mois sur l'autre.

create table if not exists budget_exceptional_expenses (
  id uuid primary key default gen_random_uuid(),
  month date not null,
  label text not null,
  amount numeric(10, 2) not null check (amount >= 0),
  created_at timestamptz not null default now()
);

-- Onglet "Budget" — dettes -------------------------------------------------
-- Liste permanente de soldes restants (pas rattachée à un mois). Le total
-- des dettes actives est déduit du reste à vivre net chaque mois ; supprimer
-- une dette équivaut à la considérer soldée.

create table if not exists debts (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  amount numeric(10, 2) not null default 0,
  note text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

-- Onglet "Économies" (enveloppes) -------------------------------------------

create table if not exists savings_envelopes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  goal_amount numeric(10, 2),
  current_amount numeric(10, 2) not null default 0,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

alter table savings_envelopes add column if not exists slug text unique;

create table if not exists savings_movements (
  id uuid primary key default gen_random_uuid(),
  envelope_id uuid not null references savings_envelopes (id) on delete cascade,
  amount numeric(10, 2) not null,
  note text,
  month date not null default current_date,
  created_at timestamptz not null default now()
);

alter table savings_movements add column if not exists month date not null default current_date;

-- Enveloppes par défaut, créées une seule fois grâce au slug stable.
insert into savings_envelopes (name, slug, position) values
  ('Santé', 'sante', 0),
  ('Voiture', 'voiture', 1),
  ('Maison', 'maison', 2),
  ('Urgences', 'urgences', 3),
  ('Voyages', 'voyages', 4),
  ('Plaisir', 'plaisir', 5),
  ('Cadeaux', 'cadeaux', 6),
  ('Beauté', 'beaute', 7),
  ('Business', 'business', 8),
  ('Jayden', 'jayden', 9),
  ('Livret A', 'livret-a', 10)
on conflict (slug) do nothing;

-- Onglet "Business" ----------------------------------------------------------
-- Répartition interne, informative, du total de l'enveloppe Économies
-- "Business" (slug 'business') : aucun mouvement réel n'est créé, c'est un
-- découpage du même total.

create table if not exists business_envelopes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  amount numeric(10, 2) not null default 0,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

-- Onglet "To Do Liste" -------------------------------------------------------

create table if not exists todo_items (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_priorities_date on priorities (date);
create index if not exists idx_schedule_blocks_date on schedule_blocks (date);
create index if not exists idx_ritual_logs_date on ritual_logs (date);
create index if not exists idx_content_items_date on content_items (date);
create index if not exists idx_recurring_task_logs_date on recurring_task_logs (date);
create index if not exists idx_budget_transactions_date on budget_transactions (date);
create index if not exists idx_savings_movements_envelope on savings_movements (envelope_id);
create index if not exists idx_savings_movements_month on savings_movements (month);
create index if not exists idx_budget_salary_month on budget_salary (month);
create index if not exists idx_budget_income_entries_month on budget_income_entries (month);
create index if not exists idx_budget_fixed_charge_entries_month on budget_fixed_charge_entries (month);
create index if not exists idx_budget_fixed_charge_entries_template on budget_fixed_charge_entries (template_id);
create index if not exists idx_budget_variable_charge_entries_month on budget_variable_charge_entries (month);
create index if not exists idx_budget_variable_charge_entries_template on budget_variable_charge_entries (template_id);
create index if not exists idx_budget_exceptional_expenses_month on budget_exceptional_expenses (month);

-- Row Level Security -----------------------------------------------------
-- App personnelle sans authentification : on ouvre l'accès complet à la clé anon.
-- (à restreindre plus tard si une authentification est ajoutée)

alter table priorities enable row level security;
alter table schedule_blocks enable row level security;
alter table rituals enable row level security;
alter table ritual_logs enable row level security;
alter table content_items enable row level security;
alter table recurring_tasks enable row level security;
alter table recurring_task_logs enable row level security;
alter table notes enable row level security;
alter table budget_transactions enable row level security;
alter table savings_envelopes enable row level security;
alter table savings_movements enable row level security;
alter table todo_items enable row level security;
alter table budget_salary enable row level security;
alter table budget_income_entries enable row level security;
alter table budget_fixed_charge_templates enable row level security;
alter table budget_fixed_charge_entries enable row level security;
alter table budget_variable_charge_templates enable row level security;
alter table budget_variable_charge_entries enable row level security;
alter table budget_exceptional_expenses enable row level security;
alter table debts enable row level security;
alter table business_envelopes enable row level security;

create policy "public access" on priorities for all using (true) with check (true);
create policy "public access" on schedule_blocks for all using (true) with check (true);
create policy "public access" on rituals for all using (true) with check (true);
create policy "public access" on ritual_logs for all using (true) with check (true);
create policy "public access" on content_items for all using (true) with check (true);
create policy "public access" on recurring_tasks for all using (true) with check (true);
create policy "public access" on recurring_task_logs for all using (true) with check (true);
create policy "public access" on notes for all using (true) with check (true);
create policy "public access" on budget_transactions for all using (true) with check (true);
create policy "public access" on savings_envelopes for all using (true) with check (true);
create policy "public access" on savings_movements for all using (true) with check (true);
create policy "public access" on todo_items for all using (true) with check (true);
create policy "public access" on budget_salary for all using (true) with check (true);
create policy "public access" on budget_income_entries for all using (true) with check (true);
create policy "public access" on budget_fixed_charge_templates for all using (true) with check (true);
create policy "public access" on budget_fixed_charge_entries for all using (true) with check (true);
create policy "public access" on budget_variable_charge_templates for all using (true) with check (true);
create policy "public access" on budget_variable_charge_entries for all using (true) with check (true);
create policy "public access" on budget_exceptional_expenses for all using (true) with check (true);
create policy "public access" on debts for all using (true) with check (true);
create policy "public access" on business_envelopes for all using (true) with check (true);
