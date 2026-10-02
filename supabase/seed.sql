-- Sample data placeholder: replace with partner-confirmed inventory before launch.
insert into public.properties (name, slug, type, location, description, price_from_usd, star_rating, booking_mode, status, featured)
values
  ('Private Island Luxury', 'private-island-luxury', 'resort', 'North Malé Atoll', 'Sample listing for design and flow testing.', 620, 4.9, 'request', 'published', true),
  ('Overwater Romance', 'overwater-romance', 'resort', 'South Ari Atoll', 'Sample listing for design and flow testing.', 480, 4.8, 'request', 'published', true),
  ('Family Island Escape', 'family-island-escape', 'resort', 'Baa Atoll', 'Sample listing for design and flow testing.', 340, 4.7, 'request', 'published', true)
on conflict (slug) do nothing;
