-- Run once in the Supabase SQL editor.

-- 1. Enable / disable a store
alter table public.stores
  add column if not exists is_disabled boolean not null default false;

-- 2. Seller <-> admin chat, one thread per store
create table if not exists public.store_messages (
  id           bigint generated always as identity primary key,
  store_handle text not null references public.stores(handle) on delete cascade,
  sender       text not null check (sender in ('seller', 'admin')),
  body         text not null check (char_length(body) between 1 and 1000),
  created_at   timestamptz not null default now()
);
create index if not exists store_messages_handle_idx
  on public.store_messages (store_handle, created_at);

alter table public.store_messages enable row level security;

-- Store owner: read and write their own store's thread (as 'seller' only)
create policy "owner reads own thread" on public.store_messages
  for select using (exists (
    select 1 from public.stores s
    where s.handle = store_messages.store_handle
      and s.owner_email = auth.jwt() ->> 'email'));

create policy "owner writes own thread" on public.store_messages
  for insert with check (
    sender = 'seller' and exists (
      select 1 from public.stores s
      where s.handle = store_messages.store_handle
        and s.owner_email = auth.jwt() ->> 'email'));

-- Admin: everything. Keep this email in sync with ADMIN_EMAIL in src/app.js.
create policy "admin all" on public.store_messages
  for all using (auth.jwt() ->> 'email' = 'y319praveen@gmail.com')
  with check (auth.jwt() ->> 'email' = 'y319praveen@gmail.com');

-- 3. Live updates for the chat
alter publication supabase_realtime add table public.store_messages;

-- 4. Only the admin may change is_disabled. Without this, a seller's existing
-- "update own store" policy would let them re-enable their own store.
create or replace function public.guard_is_disabled() returns trigger as $$
begin
  if new.is_disabled is distinct from old.is_disabled
     and coalesce(auth.jwt() ->> 'email', '') <> 'y319praveen@gmail.com' then
    new.is_disabled := old.is_disabled;
  end if;
  return new;
end $$ language plpgsql security definer;

drop trigger if exists guard_is_disabled on public.stores;
create trigger guard_is_disabled before update on public.stores
  for each row execute function public.guard_is_disabled();
