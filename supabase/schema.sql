create extension if not exists pgcrypto;

create type appliance_type as enum ('washer','dryer','dishwasher','fridge','oven','hvac','water_heater','garbage_disposal','microwave','other');
create type diagnosis_status as enum ('intake','diagnosing','follow_up','resolved','escalated');
create type repair_complexity as enum ('unknown','diy_safe','moderate','professional');
create type message_role as enum ('user','assistant','system');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  diagnosis_count integer not null default 0,
  created_at timestamptz not null default now()
);
create table public.diagnosis_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  guest_id text,
  appliance_type appliance_type not null default 'other',
  appliance_brand text,
  appliance_model text,
  status diagnosis_status not null default 'intake',
  complexity repair_complexity not null default 'unknown',
  summary text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.diagnosis_sessions(id) on delete cascade,
  role message_role not null,
  content text not null,
  media_urls text[] not null default '{}',
  media_type text not null default 'none' check (media_type in ('none','photo','video_frames')),
  follow_up_questions text[],
  created_at timestamptz not null default now()
);
create table public.diagnosis_results (
  id uuid primary key default gen_random_uuid(),
  session_id uuid unique not null references public.diagnosis_sessions(id) on delete cascade,
  primary_cause text not null,
  alternative_causes text[] not null default '{}',
  confidence text not null check (confidence in ('low','medium','high')),
  complexity repair_complexity not null,
  safety_warnings text[] not null default '{}',
  tools_needed text[] not null default '{}',
  estimated_time text,
  steps jsonb not null default '[]',
  professional_needed boolean not null default false,
  professional_reason text,
  what_to_tell_technician text,
  warranty_note text,
  created_at timestamptz not null default now()
);
create table public.safety_log (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.diagnosis_sessions(id) on delete set null,
  layer text not null check (layer in ('input_filter','prompt','output_scanner','validation')),
  event_type text not null check (event_type in ('blocked','warning','escalated','validation_fail')),
  user_input varchar(500), model_output varchar(2000), matched_pattern text, scanner_result jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.diagnosis_sessions enable row level security;
alter table public.messages enable row level security;
alter table public.diagnosis_results enable row level security;
alter table public.safety_log enable row level security;
create policy "own profile" on public.profiles for all using (auth.uid()=id) with check (auth.uid()=id);
create policy "own sessions" on public.diagnosis_sessions for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "own messages" on public.messages for all using (exists(select 1 from public.diagnosis_sessions s where s.id=session_id and s.user_id=auth.uid())) with check (exists(select 1 from public.diagnosis_sessions s where s.id=session_id and s.user_id=auth.uid()));
create policy "own results" on public.diagnosis_results for all using (exists(select 1 from public.diagnosis_sessions s where s.id=session_id and s.user_id=auth.uid())) with check (exists(select 1 from public.diagnosis_sessions s where s.id=session_id and s.user_id=auth.uid()));
-- safety_log intentionally has no client policy; write through a server route using the service role.

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('diagnosis-media','diagnosis-media',false,10485760,array['image/jpeg','image/png','image/webp','video/mp4'])
on conflict (id) do nothing;
