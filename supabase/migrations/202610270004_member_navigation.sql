begin;
-- Retain existing accounts and balances; extend supported assets and add vault accounts.
do $$declare c record; begin
 for c in select conname from pg_constraint where conrelid='public.ledger_accounts'::regclass and contype='c' and (pg_get_constraintdef(oid) like '%currency%' or pg_get_constraintdef(oid) like '%kind%') loop
 execute format('alter table public.ledger_accounts drop constraint %I',c.conname);
 end loop;
end;$$;
alter table public.ledger_accounts drop constraint ledger_accounts_user_id_currency_key;
alter table public.ledger_accounts add unique(user_id,currency,kind);
alter table public.ledger_accounts add constraint ledger_kind check(kind in ('user','vault','clearing'));
alter table public.ledger_accounts add constraint ledger_currency check(currency in ('USDT','USDC','BTC','TRX','XRP','SOL','ETH','USD','MXN'));
alter table public.ledger_accounts add constraint ledger_owner_balance check((kind in ('user','vault') and user_id is not null and balance_atomic>=0) or (kind='clearing' and user_id is null));
alter table public.ledger_accounts add constraint ledger_currency_precision check(decimals=case when currency='BTC' then 8 when currency='ETH' then 18 when currency='SOL' then 9 when currency in ('USDT','USDC','TRX','XRP') then 6 else 2 end);

create table public.member_preferences(user_id uuid primary key references public.profiles(id),currency text not null default 'USDT' check(currency in ('USDT','USDC','BTC','TRX','XRP','SOL')),hide_zero boolean not null default false,include_vault boolean not null default false);
create table public.loyalty_progress(user_id uuid primary key references public.profiles(id),points numeric(38,0) not null default 0 check(points>=0 and points::text not in ('NaN','Infinity')),updated_at timestamptz not null default now());
create table public.member_notifications(id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles(id),title text not null check(length(title) between 1 and 120),body text not null check(length(body) between 1 and 2000),created_at timestamptz not null default now(),read_at timestamptz);
create index notifications_owner_date on public.member_notifications(user_id,created_at desc,id);
alter table public.member_preferences enable row level security;
alter table public.loyalty_progress enable row level security;
alter table public.member_notifications enable row level security;
create policy member_preferences_own on public.member_preferences for select to authenticated using(user_id=auth.uid() and public.session_allowed());
create policy loyalty_own on public.loyalty_progress for select to authenticated using(user_id=auth.uid() and public.session_allowed());
create policy notifications_own on public.member_notifications for select to authenticated using(user_id=auth.uid() and public.session_allowed());
revoke all on public.member_preferences,public.loyalty_progress,public.member_notifications from public,anon,authenticated;
grant select on public.member_preferences,public.loyalty_progress,public.member_notifications to authenticated;
grant all on public.member_preferences,public.loyalty_progress,public.member_notifications to service_role;

create function private.provision_member() returns trigger language plpgsql security definer set search_path='' as $$begin
 insert into public.member_preferences(user_id) values(new.id);
 insert into public.loyalty_progress(user_id) values(new.id);
 -- The existing auth trigger provisions the primary USDT wallet.
 insert into public.ledger_accounts(user_id,kind,currency,decimals)
 select new.id,k.kind,c.code,c.precision from (values('USDT',6),('USDC',6),('BTC',8),('TRX',6),('XRP',6),('SOL',9)) c(code,precision) cross join (values('user'),('vault')) k(kind) where k.kind='vault' or c.code<>'USDT';
 return new;
end;$$;
create trigger provision_member after insert on public.profiles for each row execute function private.provision_member();
insert into public.member_preferences(user_id) select id from public.profiles;
insert into public.loyalty_progress(user_id) select id from public.profiles;
insert into public.ledger_accounts(user_id,kind,currency,decimals)
 select p.id,k.kind,c.code,c.precision from public.profiles p cross join (values('USDT',6),('USDC',6),('BTC',8),('TRX',6),('XRP',6),('SOL',9)) c(code,precision) cross join (values('user'),('vault')) k(kind) on conflict(user_id,currency,kind) do nothing;
create or replace function public.get_my_wallets() returns table(id uuid,currency text,decimals smallint,balance_atomic text) language sql security invoker set search_path='' as $$
 select a.id,a.currency,a.decimals,a.balance_atomic::text from public.ledger_accounts a where a.user_id=auth.uid() and a.kind='user' order by a.currency;
$$;
create function public.get_member_overview() returns jsonb language sql security invoker set search_path='' as $$
 select jsonb_build_object(
 'wallets',coalesce((select jsonb_agg(jsonb_build_object('currency',currency,'kind',kind,'decimals',decimals,'balance_atomic',balance_atomic::text)) from public.ledger_accounts where user_id=auth.uid() and kind in ('user','vault')),'[]'::jsonb),
 'preferences',(select to_jsonb(p)-'user_id' from public.member_preferences p where user_id=auth.uid()),
 'points',coalesce((select points::text from public.loyalty_progress where user_id=auth.uid()),'0'),
 'unread',(select count(*) from public.member_notifications where user_id=auth.uid() and read_at is null),
 'notifications',coalesce((select jsonb_agg(to_jsonb(n)-'user_id' order by n.created_at desc,n.id) from (select * from public.member_notifications where user_id=auth.uid() order by created_at desc,id limit 50)n),'[]'::jsonb));
$$;
create function public.save_member_preferences(p_currency text,p_hide_zero boolean,p_include_vault boolean) returns void language plpgsql security definer set search_path='' as $$begin
 if auth.uid() is null or not public.session_allowed() or not exists(select 1 from public.profiles where id=auth.uid() and account_status='active') then raise exception 'SESSION_REQUIRED';end if;
 update public.member_preferences set currency=p_currency,hide_zero=p_hide_zero,include_vault=p_include_vault where user_id=auth.uid();
end;$$;
create function public.read_member_notifications(p_id uuid default null) returns void language plpgsql security definer set search_path='' as $$begin
 if auth.uid() is null or not public.session_allowed() then raise exception 'SESSION_REQUIRED';end if;
 update public.member_notifications set read_at=now() where user_id=auth.uid() and read_at is null and (p_id is null or id=p_id);
end;$$;
create function public.move_vault_funds(p_currency text,p_amount numeric,p_direction text,p_key uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare src uuid;dst uuid;begin
 if auth.uid() is null or not public.session_allowed() then raise exception 'SESSION_REQUIRED';end if;
 if p_direction is null or p_direction not in ('in','out') or p_currency is null or p_currency not in ('USDT','USDC','BTC','TRX','XRP','SOL') then raise exception 'INVALID_TRANSFER';end if;
 select id into src from public.ledger_accounts where user_id=auth.uid() and currency=p_currency and kind=case when p_direction='in' then 'user' else 'vault' end;
 select id into dst from public.ledger_accounts where user_id=auth.uid() and currency=p_currency and kind=case when p_direction='in' then 'vault' else 'user' end;
 return public.post_ledger_transfer(src,dst,p_amount,p_key,'vault:'||p_direction);
end;$$;
revoke all on function public.get_member_overview(),public.save_member_preferences(text,boolean,boolean),public.read_member_notifications(uuid),public.move_vault_funds(text,numeric,text,uuid) from public,anon;
grant execute on function public.get_member_overview(),public.save_member_preferences(text,boolean,boolean),public.read_member_notifications(uuid),public.move_vault_funds(text,numeric,text,uuid) to authenticated;
create or replace function public.post_ledger_transfer(p_source uuid,p_target uuid,p_amount numeric,p_idempotency uuid,p_reference text)
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
  if source_row.kind in ('user','vault') and source_row.balance_atomic<p_amount then raise exception 'Insufficient balance';end if;
  if exists(select 1 from public.profiles where id in (source_row.user_id,target_row.user_id) and (account_status<>'active' or onboarding_completed=false)) then raise exception 'Account unavailable';end if;
  insert into public.ledger_transactions(idempotency_key,source_account,target_account,amount_atomic,reference) values(p_idempotency,p_source,p_target,p_amount,p_reference) returning id into transaction_uuid;
  insert into public.ledger_entries(transaction_id,account_id,amount_atomic) values(transaction_uuid,p_source,-p_amount),(transaction_uuid,p_target,p_amount);
  update public.ledger_accounts set balance_atomic=balance_atomic-p_amount where id=p_source;
  update public.ledger_accounts set balance_atomic=balance_atomic+p_amount where id=p_target;
  return transaction_uuid;
end;$$;
commit;

