-- ============================================================
-- eBooking Fiji — Core Venue Booking Engine
-- Migration 001: Core booking tables
-- ============================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- venues (parent record — one per physical venue)
-- ------------------------------------------------------------
create table if not exists venues (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  name         text not null,
  address      text,
  city         text default 'Suva',
  phone        text,
  whatsapp     text,
  caretaker_name text,
  caretaker_phone text,
  deposit_pct  numeric(5,2) not null default 30.00,  -- % upfront deposit
  created_at   timestamptz not null default now()
);

-- Seed Calvary Temple Suva
insert into venues (slug, name, address, city, phone, whatsapp, caretaker_name, caretaker_phone, deposit_pct)
values (
  'calvary-temple-suva',
  'Calvary Temple Suva',
  '12 Gordon Street, Suva',
  'Suva',
  '+6793123456',
  '6793123456',
  'Brother Sione Taukei',
  '+6799001234',
  30.00
)
on conflict (slug) do nothing;

-- ------------------------------------------------------------
-- spaces (sub-spaces within a venue)
-- ------------------------------------------------------------
create table if not exists spaces (
  id                 uuid primary key default gen_random_uuid(),
  venue_id           uuid not null references venues(id) on delete cascade,
  space_name         text not null,
  description        text,
  capacity           int not null,
  hourly_rate_fjd    numeric(10,2) not null,
  day_rate_fjd       numeric(10,2),
  min_booking_hours  int not null default 2,
  is_active          boolean not null default true,
  created_at         timestamptz not null default now()
);

-- Seed Calvary Temple spaces
insert into spaces (venue_id, space_name, description, capacity, hourly_rate_fjd, day_rate_fjd, min_booking_hours)
select
  v.id,
  s.space_name,
  s.description,
  s.capacity,
  s.hourly_rate,
  s.day_rate,
  s.min_hours
from venues v
cross join (values
  ('Main Auditorium',  'Full sanctuary with stage, PA system, and seating for 800+', 850, 180.00, 1200.00, 4),
  ('Annex Hall',       'Secondary hall ideal for receptions and mid-size gatherings',  250,  90.00,  600.00, 2),
  ('Youth Center',     'Modern multipurpose room for workshops and smaller events',     80,  50.00,  300.00, 2)
) as s(space_name, description, capacity, hourly_rate, day_rate, min_hours)
where v.slug = 'calvary-temple-suva'
on conflict do nothing;

-- ------------------------------------------------------------
-- recurring_blackouts (weekly repeating blocks)
-- ------------------------------------------------------------
create table if not exists recurring_blackouts (
  id           uuid primary key default gen_random_uuid(),
  space_id     uuid not null references spaces(id) on delete cascade,
  title        text not null,
  day_of_week  int not null check (day_of_week between 0 and 6),  -- 0=Sun
  start_time   time not null,
  end_time     time not null,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- Seed blackouts for Main Auditorium
insert into recurring_blackouts (space_id, title, day_of_week, start_time, end_time)
select
  s.id,
  b.title,
  b.dow,
  b.start_t::time,
  b.end_t::time
from spaces s
join venues v on v.id = s.venue_id
cross join (values
  ('Sunday Morning Service',   0, '07:00', '13:00'),
  ('Sunday Evening Service',   0, '17:00', '20:00'),
  ('Wednesday Prayer Meeting', 3, '18:00', '20:30'),
  ('Friday Youth Service',     5, '17:00', '21:00')
) as b(title, dow, start_t, end_t)
where v.slug = 'calvary-temple-suva'
  and s.space_name = 'Main Auditorium'
on conflict do nothing;

-- Youth Center blackouts
insert into recurring_blackouts (space_id, title, day_of_week, start_time, end_time)
select
  s.id,
  b.title,
  b.dow,
  b.start_t::time,
  b.end_t::time
from spaces s
join venues v on v.id = s.venue_id
cross join (values
  ('Friday Youth',  5, '16:00', '21:00'),
  ('Sunday School', 0, '08:30', '12:00')
) as b(title, dow, start_t, end_t)
where v.slug = 'calvary-temple-suva'
  and s.space_name = 'Youth Center'
on conflict do nothing;

-- ------------------------------------------------------------
-- bookings
-- ------------------------------------------------------------
create sequence if not exists booking_seq start 1000;

create table if not exists bookings (
  id                  uuid primary key default gen_random_uuid(),
  reference_code      text unique not null
                        default ('CT-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('booking_seq')::text, 4, '0')),
  space_id            uuid not null references spaces(id),
  renter_name         text not null,
  renter_phone        text not null,
  renter_email        text,
  event_title         text not null,
  start_time          timestamptz not null,
  end_time            timestamptz not null,
  total_amount_fjd    numeric(10,2) not null,
  deposit_amount_fjd  numeric(10,2) not null,
  status              text not null default 'pending_approval'
                        check (status in (
                          'pending_approval',
                          'approved_pending_deposit',
                          'confirmed',
                          'rejected',
                          'cancelled'
                        )),
  rejection_reason    text,
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  constraint no_time_overlap exclude using gist (
    space_id with =,
    tstzrange(start_time, end_time) with &&
  ) where (status not in ('rejected', 'cancelled')),

  constraint valid_time_range check (end_time > start_time)
);

-- Enable btree_gist for exclusion constraint
create extension if not exists btree_gist;

-- Trigger: keep updated_at current
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger bookings_updated_at
  before update on bookings
  for each row execute function set_updated_at();

-- ------------------------------------------------------------
-- booking_addons
-- ------------------------------------------------------------
create table if not exists booking_addons (
  id              uuid primary key default gen_random_uuid(),
  booking_id      uuid not null references bookings(id) on delete cascade,
  service_name    text not null
                    check (service_name in (
                      'PA Sound System',
                      'Stage Lighting',
                      'Projector & Screen',
                      'Sanitation Fee',
                      'Stage Instruments',
                      'Chair & Table Hire',
                      'Cleaning Service'
                    )),
  quantity        int not null default 1 check (quantity > 0),
  unit_price_fjd  numeric(10,2) not null,
  created_at      timestamptz not null default now()
);

-- ------------------------------------------------------------
-- payments
-- ------------------------------------------------------------
create table if not exists payments (
  id                    uuid primary key default gen_random_uuid(),
  booking_id            uuid not null references bookings(id) on delete cascade,
  payment_method        text not null
                          check (payment_method in (
                            'mpaisa_qr',
                            'mycash',
                            'bsp_bank_transfer',
                            'anz_bank_transfer',
                            'westpac_bank_transfer'
                          )),
  amount_fjd            numeric(10,2) not null,
  transaction_reference text,
  receipt_image_url     text,
  payment_status        text not null default 'unverified'
                          check (payment_status in ('unverified', 'verified', 'failed')),
  is_deposit            boolean not null default false,
  verified_by           text,
  verified_at           timestamptz,
  notes                 text,
  created_at            timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------
alter table venues enable row level security;
alter table spaces enable row level security;
alter table recurring_blackouts enable row level security;
alter table bookings enable row level security;
alter table booking_addons enable row level security;
alter table payments enable row level security;

-- Public read on venues / spaces / blackouts (for booking page)
create policy "public_read_venues"          on venues             for select using (true);
create policy "public_read_spaces"          on spaces             for select using (is_active = true);
create policy "public_read_blackouts"       on recurring_blackouts for select using (is_active = true);

-- Anyone can create a booking (guest checkout)
create policy "public_insert_bookings"      on bookings           for insert with check (true);
create policy "public_read_own_booking"     on bookings           for select using (true);

-- Addons and payments follow booking
create policy "public_insert_addons"        on booking_addons     for insert with check (true);
create policy "public_read_addons"          on booking_addons     for select using (true);
create policy "public_insert_payments"      on payments           for insert with check (true);
create policy "public_read_payments"        on payments           for select using (true);

-- Admin full access (service role bypasses RLS anyway)
-- Future: scope to auth.role() = 'admin'

-- ------------------------------------------------------------
-- Helpful views
-- ------------------------------------------------------------
create or replace view booking_summary as
select
  b.id,
  b.reference_code,
  b.event_title,
  b.renter_name,
  b.renter_phone,
  b.renter_email,
  b.start_time,
  b.end_time,
  b.total_amount_fjd,
  b.deposit_amount_fjd,
  b.status,
  b.notes,
  b.created_at,
  s.space_name,
  s.capacity,
  v.name   as venue_name,
  v.slug   as venue_slug,
  v.whatsapp as venue_whatsapp,
  coalesce(sum(ba.quantity * ba.unit_price_fjd), 0) as addons_total_fjd,
  count(distinct ba.id)                              as addon_count,
  count(distinct p.id)                               as payment_count,
  bool_or(p.payment_status = 'verified')             as has_verified_payment
from bookings b
join spaces s on s.id = b.space_id
join venues v on v.id = s.venue_id
left join booking_addons ba on ba.booking_id = b.id
left join payments p on p.booking_id = b.id
group by b.id, s.space_name, s.capacity, v.name, v.slug, v.whatsapp;
