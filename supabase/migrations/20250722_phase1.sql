-- 20250722_phase1.sql
create table public.competitors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  ticker text,
  created_at timestamptz default now()
);

create table public.competitor_events (
  id uuid primary key default gen_random_uuid(),
  competitor_id uuid references public.competitors(id) on delete cascade,
  headline text,
  summary text,
  url text unique,                -- dedupe key
  published_at timestamptz,
  is_important boolean default false,
  created_at timestamptz default now()
);

-- row‑level security OFF for hackathon speed
alter table public.competitors disable row level security;
alter table public.competitor_events disable row level security;

insert into public.competitors (name,ticker) values
  ('Acme Corp','ACME'),
  ('Globex Inc','GLOB'); 