-- profiles
create table if not exists profiles (
  id uuid primary key default auth.uid(),
  email text,
  business_type text,
  city text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- events
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  name text not null,
  type text not null,              -- apparel, community, holiday, business, challenge, custom
  category text not null default 'apparel',
  date date not null,
  city text,
  business_type text,
  tags text[] default '{}',
  status text not null default 'planned',   -- planned, in_progress, done, canceled
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

-- milestones
create table if not exists milestones (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  user_id uuid not null default auth.uid(),
  name text not null,
  offset_days int not null,        -- relative to event date
  absolute_date date not null,
  owner text,
  status text not null default 'open',  -- open, done
  notes text,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- helpful indexes
create index if not exists idx_events_user_date on events(user_id, date);
create index if not exists idx_milestones_event on milestones(event_id);

-- timestamps
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists t_events_updated on events;
create trigger t_events_updated before update on events
for each row execute function set_updated_at();

drop trigger if exists t_milestones_updated on milestones;
create trigger t_milestones_updated before update on milestones
for each row execute function set_updated_at();