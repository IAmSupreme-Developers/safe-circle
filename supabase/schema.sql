-- Users are managed by Supabase Auth (auth.users)
-- This extends it with app-specific profile data

create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  phone text,
  role text not null default 'guardian', -- guardian | admin
  proximity_buffer_meters int not null default 50,
  created_at timestamptz default now()
);

create table public.trackers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade not null,
  device_id text unique not null,
  label text not null, -- e.g. "Emma's Backpack"
  registered_at timestamptz default now(),
  last_lat double precision,
  last_lng double precision,
  last_seen timestamptz,
  is_active boolean default true
);

create table public.safe_zones (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade not null,
  tracker_id uuid references public.trackers(id) on delete cascade,
  label text not null,
  lat double precision not null,
  lng double precision not null,
  radius_meters int not null default 200,
  notify_on_exit boolean default true,
  notify_on_enter boolean default false,
  exit_message text,
  exit_severity text default 'warning', -- warning | danger | info
  is_enabled boolean default true,
  created_at timestamptz default now()
);

create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade not null,
  tracker_id uuid references public.trackers(id) on delete set null,
  safe_zone_id uuid references public.safe_zones(id) on delete set null,
  type text not null, -- zone_exit | zone_enter | community | manual
  severity text not null default 'warning', -- info | warning | danger
  message text not null,
  lat double precision,
  lng double precision,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS: users can only see their own data
alter table public.profiles enable row level security;
alter table public.trackers enable row level security;
alter table public.safe_zones enable row level security;
alter table public.alerts enable row level security;

create policy "own profile" on public.profiles for all using (auth.uid() = id);
create policy "own trackers" on public.trackers for all using (auth.uid() = owner_id);
create policy "own safe_zones" on public.safe_zones for all using (auth.uid() = owner_id);
create policy "own alerts" on public.alerts for all using (auth.uid() = owner_id);
