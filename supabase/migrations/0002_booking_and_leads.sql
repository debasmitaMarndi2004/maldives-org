-- Durable booking requests, leads and wishlist records used by the server APIs.
-- The service-role API client writes these rows; RLS prevents public reads.

alter table public.inquiries add column if not exists reference text unique;

create table if not exists public.booking_requests (
  id uuid primary key default uuid_generate_v4(),
  reference text unique not null,
  offer_id text,
  offer_title text not null,
  offer_type text not null check (offer_type in ('stay','experience','transfer')),
  source text not null default 'sample',
  supplier_code text,
  traveler_name text not null,
  traveler_email text not null,
  traveler_country text,
  guests integer not null default 1 check (guests > 0 and guests <= 50),
  check_in date,
  check_out date,
  activity_date date,
  notes text,
  price_from_usd numeric(12,2),
  currency text not null default 'USD',
  status text not null default 'new' check (status in ('new','contacted','pending','payment_received','confirmed','cancelled','refunded')),
  stripe_session_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wishlist_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  property_slug text not null,
  created_at timestamptz not null default now(),
  unique (user_id, property_slug)
);

alter table public.booking_requests enable row level security;
alter table public.wishlist_items enable row level security;

create policy "users read their own wishlist" on public.wishlist_items
  for select using (auth.uid() = user_id);
create policy "users manage their own wishlist" on public.wishlist_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists booking_requests_reference_idx on public.booking_requests(reference);
create index if not exists booking_requests_email_idx on public.booking_requests(traveler_email);
create index if not exists booking_requests_status_idx on public.booking_requests(status);
create index if not exists wishlist_items_user_idx on public.wishlist_items(user_id);
