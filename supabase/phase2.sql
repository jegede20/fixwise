-- FixWise Phase 2 foundation: profiles, guest persistence, inventory, reminders, feedback and technician handoff.

alter table public.profiles add column if not exists preferred_language text not null default 'en';
alter table public.profiles add column if not exists preferred_units text not null default 'metric';
alter table public.profiles add column if not exists region text;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id,email) values (new.id,new.email)
  on conflict (id) do update set email=excluded.email;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert or update of email on auth.users
for each row execute procedure public.handle_new_user();

create table if not exists public.appliances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  guest_id text,
  nickname text not null,
  appliance_type text not null,
  brand text,
  model_number text,
  serial_number text,
  purchase_date date,
  warranty_expires date,
  expected_lifespan_years integer,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (user_id is not null or guest_id is not null)
);

create table if not exists public.maintenance_reminders (
  id uuid primary key default gen_random_uuid(),
  appliance_id uuid not null references public.appliances(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  guest_id text,
  title text not null,
  due_date date not null,
  cadence_months integer,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.diagnosis_feedback (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.diagnosis_sessions(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  guest_id text,
  accurate boolean,
  resolved boolean,
  final_cause text,
  final_cost numeric(12,2),
  currency text default 'USD',
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists public.technicians (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  city text not null,
  region text,
  country_code text not null,
  appliance_specialties text[] not null default '{}',
  certifications text[] not null default '{}',
  phone text,
  website text,
  verified boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.appliances enable row level security;
alter table public.maintenance_reminders enable row level security;
alter table public.diagnosis_feedback enable row level security;
alter table public.technicians enable row level security;

drop policy if exists "own appliances" on public.appliances;
create policy "own appliances" on public.appliances for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
drop policy if exists "own reminders" on public.maintenance_reminders;
create policy "own reminders" on public.maintenance_reminders for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
drop policy if exists "own feedback" on public.diagnosis_feedback;
create policy "own feedback" on public.diagnosis_feedback for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
drop policy if exists "public technician directory" on public.technicians;
create policy "public technician directory" on public.technicians for select using (active=true);

-- Private media: authenticated users may only access their own top-level folder.
drop policy if exists "user media insert" on storage.objects;
create policy "user media insert" on storage.objects for insert to authenticated
with check (bucket_id='diagnosis-media' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "user media select" on storage.objects;
create policy "user media select" on storage.objects for select to authenticated
using (bucket_id='diagnosis-media' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "user media delete" on storage.objects;
create policy "user media delete" on storage.objects for delete to authenticated
using (bucket_id='diagnosis-media' and (storage.foldername(name))[1]=auth.uid()::text);
