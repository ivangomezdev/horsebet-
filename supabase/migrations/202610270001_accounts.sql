-- Run once in a new Supabase project's SQL editor. Never put a service key in the browser.
begin;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete restrict,
  username text not null unique check (username ~ '^[a-z0-9][a-z0-9_]{2,23}$'),
  country_code text check (country_code ~ '^[A-Z]{2}$'),
  phone_e164 text check (phone_e164 ~ '^\+[1-9][0-9]{6,14}$'),
  phone_verified_at timestamptz,
  referral_code text check (length(referral_code)<=40),
  onboarding_completed boolean not null default false,
  age_attested_at timestamptz,
  terms_accepted_at timestamptz,
  terms_version text,
  account_status text not null default 'active' check (account_status in ('active','suspended','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.kyc_status (
  user_id uuid primary key references public.profiles(id) on delete restrict,
  status text not null default 'not_started' check (status in ('not_started','pending','in_review','verified','rejected','expired')),
  updated_at timestamptz not null default now()
);
-- Store provider references, not document scans or identity numbers in ordinary profile tables.
create table private.kyc_cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  provider text not null,
  provider_reference text not null,
  status text not null default 'pending',
  retention_until timestamptz,
  created_at timestamptz not null default now(),
  unique(provider,provider_reference)
);
create table private.audit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete restrict,
  action text not null,
  created_at timestamptz not null default now()
);
create table private.auth_limits (
  key_hash text primary key check(length(key_hash)=64),
  attempts integer not null,
  expires_at timestamptz not null
);
create index auth_limits_expiry on private.auth_limits(expires_at);

create table public.ledger_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete restrict,
  kind text not null check (kind in ('user','clearing')),
  currency text not null check (currency in ('USDT','BTC','ETH','USD','MXN')),
  decimals smallint not null check (decimals between 0 and 18),
  balance_atomic numeric(38,0) not null default 0,
  created_at timestamptz not null default now(),
  unique(user_id,currency),
  check ((kind='user' and user_id is not null and balance_atomic>=0) or (kind='clearing' and user_id is null)),
  check (decimals = case currency when 'BTC' then 8 when 'ETH' then 18 when 'USDT' then 6 else 2 end)
);
create unique index one_clearing_per_currency on public.ledger_accounts(currency) where kind='clearing';
create table public.ledger_transactions (
  id uuid primary key default gen_random_uuid(),
  idempotency_key uuid not null unique,
  source_account uuid not null references public.ledger_accounts(id),
  target_account uuid not null references public.ledger_accounts(id),
  amount_atomic numeric(38,0) not null check (amount_atomic>0),
  reference text not null check(length(reference) between 1 and 200),
  created_at timestamptz not null default now(),
  check (source_account<>target_account)
);
create table public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.ledger_transactions(id),
  account_id uuid not null references public.ledger_accounts(id),
  amount_atomic numeric(38,0) not null check(amount_atomic<>0),
  created_at timestamptz not null default now(),
  unique(transaction_id,account_id)
);
create index entries_account_date on public.ledger_entries(account_id,created_at desc);

alter table public.profiles enable row level security;
alter table public.kyc_status enable row level security;
alter table public.ledger_accounts enable row level security;
alter table public.ledger_transactions enable row level security;
alter table public.ledger_entries enable row level security;
create policy profiles_own_read on public.profiles for select to authenticated using(id=(select auth.uid()));
create policy kyc_own_read on public.kyc_status for select to authenticated using(user_id=(select auth.uid()));
create policy accounts_own_read on public.ledger_accounts for select to authenticated using(user_id=(select auth.uid()));
create policy entries_own_read on public.ledger_entries for select to authenticated using(exists(select 1 from public.ledger_accounts a where a.id=account_id and a.user_id=(select auth.uid())));
-- No client write policy, no client transaction access, no private-schema access.
revoke all on public.profiles,public.kyc_status,public.ledger_accounts,public.ledger_entries,public.ledger_transactions from anon, authenticated;
grant select on public.profiles,public.kyc_status,public.ledger_accounts,public.ledger_entries to authenticated;
revoke all on public.ledger_accounts,public.ledger_entries,public.ledger_transactions from service_role;
grant select on public.ledger_accounts,public.ledger_entries,public.ledger_transactions to service_role;
revoke all on all tables in schema private from public,anon,authenticated;

create function private.provision_user() returns trigger language plpgsql security definer set search_path='' as $$
declare requested text;
begin
  requested:=lower(new.raw_user_meta_data->>'username');
  if requested is null or requested !~ '^[a-z0-9][a-z0-9_]{2,23}$' then requested:='hb_'||substr(replace(new.id::text,'-',''),1,20);end if;
  insert into public.profiles(id,username) values(new.id,requested);
  insert into public.kyc_status(user_id) values(new.id);
  insert into public.ledger_accounts(user_id,kind,currency,decimals) values(new.id,'user','USDT',6);
  return new;
end;$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function private.provision_user();

create function public.complete_user_profile(p_user_id uuid,p_username text,p_country text,p_phone text,p_referral text)
returns void language plpgsql security definer set search_path='' as $$
begin
  if p_username !~ '^[a-z0-9][a-z0-9_]{2,23}$' or p_country !~ '^[A-Z]{2}$' then raise exception 'Invalid profile';end if;
  update public.profiles set username=p_username,country_code=p_country,phone_e164=p_phone,referral_code=nullif(p_referral,''),
    onboarding_completed=true,age_attested_at=now(),terms_accepted_at=now(),terms_version='preview-2026-10',updated_at=now()
  where id=p_user_id and onboarding_completed=false and account_status='active';
  if not found then raise exception 'Profile already completed or unavailable';end if;
  insert into private.audit_events(user_id,action) values(p_user_id,'profile.completed');
end;$$;
create function public.resolve_login_email(p_username text) returns text language sql security definer set search_path='' as $$
  select u.email from auth.users u join public.profiles p on p.id=u.id where p.username=lower(p_username) limit 1;
$$;
create function public.consume_auth_limit(p_key text,p_limit integer,p_seconds integer) returns boolean language plpgsql security definer set search_path='' as $$
declare attempts_now integer;
begin
  if p_limit<1 or p_limit>100 or p_seconds<1 or p_seconds>3600 then raise exception 'Invalid limit';end if;
  delete from private.auth_limits where expires_at<now()-interval '1 day';
  insert into private.auth_limits as limits(key_hash,attempts,expires_at) values(p_key,1,now()+make_interval(secs=>p_seconds))
    on conflict(key_hash) do update set attempts=case when limits.expires_at<=now() then 1 else least(limits.attempts+1,p_limit+1) end,
      expires_at=case when limits.expires_at<=now() then now()+make_interval(secs=>p_seconds) else limits.expires_at end
    returning attempts into attempts_now;
  return attempts_now<=p_limit;
end;$$;

create function public.get_my_wallets() returns table(id uuid,currency text,decimals smallint,balance_atomic text)
language sql security invoker set search_path='' as $$
  select a.id,a.currency,a.decimals,a.balance_atomic::text from public.ledger_accounts a where a.user_id=(select auth.uid()) order by a.currency;
$$;

-- Sole ledger write operation. Atomic, balanced, ordered row locks and idempotency.
-- There is deliberately no HTTP endpoint exposing it to players.
create function public.post_ledger_transfer(p_source uuid,p_target uuid,p_amount numeric,p_idempotency uuid,p_reference text)
returns uuid language plpgsql security definer set search_path='' as $$
declare source_row public.ledger_accounts%rowtype; target_row public.ledger_accounts%rowtype; previous public.ledger_transactions%rowtype; transaction_uuid uuid;
begin
  if p_source is null or p_target is null or p_source=p_target or p_idempotency is null or p_amount is null or p_amount::text in ('NaN','Infinity','-Infinity') or p_amount<=0 or p_amount<>trunc(p_amount) or p_amount>1e30 or p_reference is null or length(p_reference) not between 1 and 200 then raise exception 'Invalid transfer';end if;
  perform pg_advisory_xact_lock(hashtextextended(p_idempotency::text,0));
  select * into previous from public.ledger_transactions where idempotency_key=p_idempotency;
  if found then
    if previous.source_account<>p_source or previous.target_account<>p_target or previous.amount_atomic<>p_amount or previous.reference<>p_reference then raise exception 'Idempotency conflict';end if;
    return previous.id;
  end if;
  perform id from public.ledger_accounts where id in (p_source,p_target) order by id for update;
  select * into source_row from public.ledger_accounts where id=p_source;
  select * into target_row from public.ledger_accounts where id=p_target;
  if source_row.id is null or target_row.id is null or source_row.currency<>target_row.currency then raise exception 'Incompatible accounts';end if;
  if source_row.kind='user' and source_row.balance_atomic<p_amount then raise exception 'Insufficient balance';end if;
  if exists(select 1 from public.profiles where id in (source_row.user_id,target_row.user_id) and (account_status<>'active' or onboarding_completed=false)) then raise exception 'Account unavailable';end if;
  insert into public.ledger_transactions(idempotency_key,source_account,target_account,amount_atomic,reference) values(p_idempotency,p_source,p_target,p_amount,p_reference) returning id into transaction_uuid;
  insert into public.ledger_entries(transaction_id,account_id,amount_atomic) values(transaction_uuid,p_source,-p_amount),(transaction_uuid,p_target,p_amount);
  update public.ledger_accounts set balance_atomic=balance_atomic-p_amount where id=p_source;
  update public.ledger_accounts set balance_atomic=balance_atomic+p_amount where id=p_target;
  return transaction_uuid;
end;$$;
create function private.reject_ledger_mutation() returns trigger language plpgsql set search_path='' as $$begin raise exception 'Ledger is append-only';end;$$;
create trigger immutable_entries before update or delete on public.ledger_entries for each row execute function private.reject_ledger_mutation();
create trigger immutable_transactions before update or delete on public.ledger_transactions for each row execute function private.reject_ledger_mutation();
create trigger immutable_audit before update or delete on private.audit_events for each row execute function private.reject_ledger_mutation();

create function private.assert_balanced_transaction() returns trigger language plpgsql set search_path='' as $$
declare total numeric; number_of_entries integer;
begin
  select coalesce(sum(amount_atomic),0),count(*) into total,number_of_entries from public.ledger_entries where transaction_id=new.id;
  if total<>0 or number_of_entries<>2 then raise exception 'Unbalanced transaction';end if;
  return null;
end;$$;
create constraint trigger balanced_transaction after insert on public.ledger_transactions deferrable initially deferred for each row execute function private.assert_balanced_transaction();

revoke all on function public.complete_user_profile(uuid,text,text,text,text),public.resolve_login_email(text),public.consume_auth_limit(text,integer,integer),public.post_ledger_transfer(uuid,uuid,numeric,uuid,text) from public,anon,authenticated;
grant execute on function public.complete_user_profile(uuid,text,text,text,text),public.resolve_login_email(text),public.consume_auth_limit(text,integer,integer),public.post_ledger_transfer(uuid,uuid,numeric,uuid,text) to service_role;
revoke all on function public.get_my_wallets() from public,anon;
grant execute on function public.get_my_wallets() to authenticated;
revoke all on all functions in schema private from public,anon,authenticated;
insert into public.ledger_accounts(kind,currency,decimals) values('clearing','USDT',6);
commit;
