-- Telt formulierverzoeken per afzender, om misbruik van de formulieren te beperken.
-- De sleutel is een hash van functie + IP-adres; het IP-adres zelf bewaren we niet.
create table public.verzoeken (
  id uuid primary key default gen_random_uuid(),
  sleutel text not null,
  op timestamptz not null default now()
);
create index verzoeken_sleutel_op_idx on public.verzoeken (sleutel, op);
alter table public.verzoeken enable row level security;
revoke all on table public.verzoeken from anon, authenticated;
grant select, insert, delete on table public.verzoeken to service_role;
