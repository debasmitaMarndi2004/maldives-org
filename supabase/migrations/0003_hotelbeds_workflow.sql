-- Hotelbeds supplier workflow metadata. This stores references and displayable
-- booking terms only; supplier credentials are never stored in the database.

alter table public.booking_requests add column if not exists price_amount numeric(12,2);
alter table public.booking_requests add column if not exists price_currency text;
alter table public.booking_requests add column if not exists hotelbeds_rate_key text;
alter table public.booking_requests add column if not exists supplier_reference text;
alter table public.booking_requests add column if not exists supplier_status text;
alter table public.booking_requests add column if not exists voucher_url text;
alter table public.booking_requests add column if not exists cancellation_policy jsonb;
alter table public.booking_requests add column if not exists price_breakdown jsonb;
alter table public.booking_requests add column if not exists confirmed_at timestamptz;

create index if not exists booking_requests_supplier_reference_idx on public.booking_requests(supplier_reference);
