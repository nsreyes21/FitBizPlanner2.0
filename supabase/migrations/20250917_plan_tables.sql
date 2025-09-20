-- plans (one per build flow completion or draft)
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  business_type text not null,
  location text not null,
  plan_title text,
  summary jsonb,              -- AI summary object
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- items (12 months of suggestions, tasks, etc.)
create table if not exists public.plan_items (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references public.plans(id) on delete cascade,
  month_index int not null,          -- 0..11
  title text not null,
  details text,
  category text,                      -- Apparel, Community, Holiday, Business
  created_at timestamptz default now()
);

create index if not exists plan_items_plan_idx on public.plan_items(plan_id);
alter table public.plans enable row level security;
alter table public.plan_items enable row level security;

-- RLS
create policy "plans owner read" on public.plans for select using (auth.uid() = user_id);
create policy "plans owner write" on public.plans for insert with check (auth.uid() = user_id);
create policy "plans owner update" on public.plans for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "items owner read" on public.plan_items for select using (
  exists (select 1 from public.plans p where p.id = plan_id and p.user_id = auth.uid())
);
create policy "items owner write" on public.plan_items for insert with check (
  exists (select 1 from public.plans p where p.id = plan_id and p.user_id = auth.uid())
);
