-- Sample clients for local testing / demo.
-- Run after the migration (Supabase SQL editor or `supabase db push`).

insert into public.clients (name, phone, status, created_at) values
  ('Amelia Hart',      '+1 202 555 0114', 'NEW',         now() - interval '1 day'),
  ('Marcus Bellamy',   '+1 202 555 0192', 'IN_PROGRESS', now() - interval '3 days'),
  ('Priya Nair',       '+1 202 555 0176', 'IN_PROGRESS', now() - interval '5 days'),
  ('Diego Fuentes',    '+1 202 555 0138', 'CLOSED',      now() - interval '9 days'),
  ('Sofia Rossi',      '+1 202 555 0155', 'NEW',         now() - interval '2 days'),
  ('James O''Connor',  '+1 202 555 0121', 'CLOSED',      now() - interval '14 days');
