-- Producten en bestellingen. Alleen de Edge Functions (service_role) komen erbij;
-- anon en authenticated hebben geen rechten en RLS staat aan zonder policies.
-- Grants staan er expliciet: nieuwe tabellen worden niet meer automatisch aan de Data API gegeven.

create table public.producten (
  slug text primary key check (slug ~ '^[a-z0-9-]{1,60}$'),
  naam text not null,
  soort text not null check (soort in ('scan', 'thema')),
  prijs_centen integer not null check (prijs_centen > 0),
  actief boolean not null default true
);

create table public.bestellingen (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null references public.producten (slug),
  naam text not null,
  email text not null,
  bedrijf text,
  website text,
  bedrag_centen integer not null check (bedrag_centen > 0),
  status text not null default 'open'
    check (status in ('open', 'betaald', 'mislukt', 'verlopen', 'geannuleerd')),
  mollie_id text unique,
  aangemaakt_op timestamptz not null default now(),
  betaald_op timestamptz,
  gemaild_op timestamptz
);

alter table public.producten enable row level security;
alter table public.bestellingen enable row level security;

revoke all on table public.producten, public.bestellingen from anon, authenticated;
grant select on table public.producten to service_role;
grant select, insert, update on table public.bestellingen to service_role;

insert into public.producten (slug, naam, soort, prijs_centen)
values ('snelle-scan', 'Snelle scan', 'scan', 2400);
