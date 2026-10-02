-- Maldives.org foundation schema. Every public page currently uses sample data;
-- connect these tables to Supabase before enabling real partner inventory.
create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  preferred_currency text not null default 'USD',
  role text not null default 'guest' check (role in ('guest','partner','admin','super_admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.properties (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  type text not null check (type in ('resort','guesthouse','hotel','liveaboard')),
  location text,
  description text,
  price_from_usd numeric(12,2),
  star_rating numeric(2,1),
  booking_mode text not null default 'request' check (booking_mode in ('instant','request','affiliate')),
  transfer_info text,
  tags jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  consent_at timestamptz not null default now(),
  confirmed_at timestamptz,
  unsubscribed_at timestamptz
);

create table if not exists public.inquiries (
  id uuid primary key default uuid_generate_v4(),
  email text not null,
  name text,
  subject text,
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.inquiries enable row level security;

create policy "published properties are public" on public.properties for select using (status = 'published');
create policy "users read their own profile" on public.profiles for select using (auth.uid() = id);

create index if not exists properties_slug_idx on public.properties(slug);
create index if not exists properties_type_idx on public.properties(type);
create index if not exists properties_price_idx on public.properties(price_from_usd);
