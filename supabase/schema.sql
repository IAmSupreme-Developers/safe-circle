-- Drop everything in reverse dependency order (idempotent re-run safe)
drop table if exists public.releases cascade;
drop table if exists public.comments cascade;
drop table if exists public.posts cascade;
drop table if exists public.alerts cascade;
drop table if exists public.safe_zones cascade;
drop table if exists public.trackers cascade;
drop table if exists public.profiles cascade;

drop function if exists public.handle_new_user() cascade;

drop policy if exists "authenticated users can upload media" on storage.objects;
drop policy if exists "public media read" on storage.objects;
drop policy if exists "owner can delete media" on storage.objects;

-- ─────────────────────────────────────────
-- Tables
-- ─────────────────────────────────────────

create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  avatar_url text,
  phone text,
  role text not null default 'guardian', -- guardian | admin
  proximity_buffer_meters int not null default 50,
  created_at timestamptz default now()
);

create table public.trackers (
  id uuid primary key default gen_random_uuid(),
  device_id text unique not null,
  code text not null,
  owner_id uuid references public.profiles(id) on delete set null,
  label text,
  registered_at timestamptz,
  last_lat double precision,
  last_lng double precision,
  accuracy double precision,
  last_seen timestamptz,
  is_active boolean default true,
  created_at timestamptz default now()
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
  exit_severity text default 'warning',
  is_enabled boolean default true,
  created_at timestamptz default now()
);

create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade not null,
  tracker_id uuid references public.trackers(id) on delete set null,
  safe_zone_id uuid references public.safe_zones(id) on delete set null,
  type text not null,
  severity text not null default 'warning', -- info | warning | danger
  message text not null,
  lat double precision,
  lng double precision,
  is_read boolean default false,
  created_at timestamptz default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  attachments text[] default '{}',
  location_lat double precision,
  location_lng double precision,
  category text default 'alert',   -- missing | found | sighting | alert | update
  subject text,
  city text,
  country text,
  tags text[] default '{}',
  is_resolved boolean default false,
  view_count int default 0,
  created_at timestamptz default now()
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

create table public.releases (
  id uuid primary key default gen_random_uuid(),
  version text not null,
  build_number int not null,
  platform text not null default 'android', -- android | ios | all
  channel text not null default 'beta',      -- beta | stable | alpha
  title text not null,
  notes text,                                -- markdown changelog
  download_url text,
  is_latest boolean default false,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- Auto-create profile on signup
-- ─────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.trackers enable row level security;
alter table public.safe_zones enable row level security;
alter table public.alerts enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.releases enable row level security;

create policy "own profile"               on public.profiles  for all    using (auth.uid() = id);
create policy "owner access"              on public.trackers  for all    using (auth.uid() = owner_id);
create policy "device can update location" on public.trackers for update using (true) with check (true);
create policy "own safe_zones"            on public.safe_zones for all   using (auth.uid() = owner_id);
create policy "own alerts"                on public.alerts    for all    using (auth.uid() = owner_id);
create policy "anyone can read posts"     on public.posts     for select using (true);
create policy "own posts insert"          on public.posts     for insert with check (auth.uid() = author_id);
create policy "own posts delete"          on public.posts     for delete using (auth.uid() = author_id);
create policy "own posts update"          on public.posts     for update using (auth.uid() = author_id);
create policy "anyone can read comments"  on public.comments  for select using (true);
create policy "own comments insert"       on public.comments  for insert with check (auth.uid() = author_id);
create policy "own comments delete"       on public.comments  for delete using (auth.uid() = author_id);
create policy "public can read releases"  on public.releases  for select using (true);

-- ─────────────────────────────────────────
-- Storage
-- ─────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "authenticated users can upload media"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'media');

create policy "public media read"
  on storage.objects for select
  using (bucket_id = 'media');

create policy "owner can delete media"
  on storage.objects for delete to authenticated
  using (bucket_id = 'media' and auth.uid()::text = (storage.foldername(name))[1]);

-- ─────────────────────────────────────────
-- Seed examples (run manually)
-- ─────────────────────────────────────────
-- insert into public.trackers (device_id, code) values ('SC-ABC123', 'XY99ZZ');
-- insert into public.releases (version, build_number, platform, channel, title, notes, download_url, is_latest)
--   values ('1.0.0-beta', 1, 'android', 'beta', 'Beta Release 1', '- Initial beta release', '/releases/beta-release.apk', true);
