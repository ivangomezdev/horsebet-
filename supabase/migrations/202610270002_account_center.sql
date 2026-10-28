begin;
alter table public.profiles add column avatar text not null default 'red' check(avatar in ('red','gold','blue'));
alter table public.profiles add column email_promotions boolean not null default false;
alter table public.profiles add column sms_promotions boolean not null default false;
create table private.kyc_submissions(user_id uuid primary key references public.profiles(id),encrypted_payload text not null,updated_at timestamptz not null default now());
create table private.account_files(id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles(id),kind text not null check(kind in ('identity_front','identity_back','proof_address')),object_path text not null unique,mime_type text not null check(mime_type='image/webp'),size_bytes integer not null check(size_bytes between 1 and 3145728),created_at timestamptz not null default now());
create index account_files_user on private.account_files(user_id);
create table private.app_sessions(id uuid primary key,user_id uuid not null references public.profiles(id),created_at timestamptz not null default now(),last_seen_at timestamptz not null default now(),revoked_at timestamptz);
create index app_sessions_user on private.app_sessions(user_id);
create table public.game_rounds(id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles(id),provider text not null,provider_round_id text not null,game_id text not null,game_name text not null,currency text not null,decimals smallint not null,bet_atomic numeric(38,0) not null check(bet_atomic>=0),payout_atomic numeric(38,0) not null check(payout_atomic>=0),multiplier numeric(20,6) not null default 0,played_at timestamptz not null default now(),unique(provider,provider_round_id));
alter table public.game_rounds enable row level security;
revoke all on public.game_rounds from anon,authenticated;
grant select on public.game_rounds to authenticated;
create policy game_rounds_own on public.game_rounds for select to authenticated using(user_id=(select auth.uid()));
create index game_rounds_user_date on public.game_rounds(user_id,played_at desc);

create function public.session_allowed() returns boolean language sql security definer set search_path='' as $$
 select not exists(select 1 from private.app_sessions where id=nullif(auth.jwt()->>'session_id','')::uuid and revoked_at is not null);
$$;
create policy profiles_session on public.profiles as restrictive for select to authenticated using((select public.session_allowed()));
create policy kyc_session on public.kyc_status as restrictive for select to authenticated using((select public.session_allowed()));
create policy ledger_session on public.ledger_accounts as restrictive for select to authenticated using((select public.session_allowed()));
create policy entries_session on public.ledger_entries as restrictive for select to authenticated using((select public.session_allowed()));
create policy games_session on public.game_rounds as restrictive for select to authenticated using((select public.session_allowed()));
create function public.touch_user_session() returns boolean language plpgsql security definer set search_path='' as $$
declare current_id uuid:=nullif(auth.jwt()->>'session_id','')::uuid;
begin
 if auth.uid() is null or current_id is null then return false;end if;
 insert into private.app_sessions(id,user_id) values(current_id,auth.uid()) on conflict(id) do update set last_seen_at=now() where private.app_sessions.revoked_at is null and private.app_sessions.user_id=auth.uid();
 return exists(select 1 from private.app_sessions where id=current_id and user_id=auth.uid() and revoked_at is null);
end;$$;
create function public.list_user_sessions() returns table(id uuid,created_at timestamptz,last_seen_at timestamptz,is_current boolean) language sql security definer set search_path='' as $$
 select s.id,s.created_at,s.last_seen_at,s.id=nullif(auth.jwt()->>'session_id','')::uuid from private.app_sessions s where s.user_id=auth.uid() and s.revoked_at is null and public.session_allowed() order by s.last_seen_at desc;
$$;
create function public.revoke_user_sessions(p_all boolean default false) returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.session_allowed() then raise exception 'Session revoked';end if;
 update private.app_sessions set revoked_at=now() where user_id=auth.uid() and (p_all or id<>nullif(auth.jwt()->>'session_id','')::uuid);
end;$$;

create function public.revoke_current_session() returns void language sql security definer set search_path='' as $$
 update private.app_sessions set revoked_at=now() where user_id=auth.uid() and id=nullif(auth.jwt()->>'session_id','')::uuid;
$$;
revoke all on function public.revoke_current_session() from public,anon;
grant execute on function public.revoke_current_session() to authenticated;

create function public.save_account_settings(p_user_id uuid,p_section text,p_data jsonb) returns void language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from public.profiles where id=p_user_id and account_status='active' and onboarding_completed) then raise exception 'Account unavailable';end if;
 if p_section='profile' then update public.profiles set username=p_data->>'username',avatar=p_data->>'avatar',updated_at=now() where id=p_user_id;
 elsif p_section='preferences' then update public.profiles set email_promotions=(p_data->>'emailPromotions')::boolean,sms_promotions=(p_data->>'smsPromotions')::boolean,updated_at=now() where id=p_user_id;
 elsif p_section='phone' then update public.profiles set phone_e164=p_data->>'phone',country_code=p_data->>'country',phone_verified_at=null,updated_at=now() where id=p_user_id;
 else raise exception 'Invalid settings';end if;
 insert into private.audit_events(user_id,action) values(p_user_id,'settings.'||p_section);
end;$$;
create function public.save_kyc_draft(p_user_id uuid,p_payload text) returns void language plpgsql security definer set search_path='' as $$
begin
 perform 1 from public.kyc_status where user_id=p_user_id for update;
 if exists(select 1 from public.kyc_status where user_id=p_user_id and status in ('in_review','verified')) then raise exception 'Verification locked';end if;
 if length(p_payload)>12000 then raise exception 'Payload too large';end if;
 insert into private.kyc_submissions(user_id,encrypted_payload) values(p_user_id,p_payload) on conflict(user_id) do update set encrypted_payload=excluded.encrypted_payload,updated_at=now();
 update public.kyc_status set status='pending',updated_at=now() where user_id=p_user_id;
 insert into private.audit_events(user_id,action) values(p_user_id,'kyc.draft_saved');
end;$$;
create function public.read_kyc_draft(p_user_id uuid) returns text language sql security definer set search_path='' as $$select encrypted_payload from private.kyc_submissions where user_id=p_user_id;$$;
create function public.register_account_file(p_user_id uuid,p_kind text,p_path text,p_size integer) returns uuid language plpgsql security definer set search_path='' as $$
declare file_id uuid;
begin
 perform 1 from public.kyc_status where user_id=p_user_id for update;
 if not exists(select 1 from private.kyc_submissions where user_id=p_user_id) or exists(select 1 from public.kyc_status where user_id=p_user_id and status in ('in_review','verified')) then raise exception 'Verification locked';end if;
 if (select count(*) from private.account_files where user_id=p_user_id)>=12 then raise exception 'File limit reached';end if;
 if p_path not like p_user_id::text||'/%' then raise exception 'Invalid file path';end if;
 insert into private.account_files(user_id,kind,object_path,mime_type,size_bytes) values(p_user_id,p_kind,p_path,'image/webp',p_size) returning id into file_id;
 insert into private.audit_events(user_id,action) values(p_user_id,'kyc.file_uploaded');return file_id;
end;$$;
create function public.list_account_files(p_user_id uuid) returns table(id uuid,kind text,object_path text,size_bytes integer,created_at timestamptz) language sql security definer set search_path='' as $$select f.id,f.kind,f.object_path,f.size_bytes,f.created_at from private.account_files f where user_id=p_user_id order by f.created_at desc;$$;
create function public.submit_kyc(p_user_id uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 perform 1 from public.kyc_status where user_id=p_user_id for update;
 if not exists(select 1 from private.kyc_submissions where user_id=p_user_id) or not exists(select 1 from private.account_files where user_id=p_user_id and kind='identity_front') then raise exception 'Missing verification data';end if;
 update public.kyc_status set status='in_review',updated_at=now() where user_id=p_user_id and status in ('pending','rejected','expired');
 if not found then raise exception 'Verification locked';end if;
 insert into private.audit_events(user_id,action) values(p_user_id,'kyc.submitted');
end;$$;
create function public.my_transactions(p_from timestamptz,p_to timestamptz,p_type text,p_offset integer default 0)
returns table(id uuid,currency text,decimals smallint,amount_atomic text,kind text,created_at timestamptz) language sql security invoker set search_path='' as $$
 select e.id,a.currency,a.decimals,e.amount_atomic::text,case when e.amount_atomic>0 then 'credit' else 'debit' end,e.created_at from public.ledger_entries e join public.ledger_accounts a on a.id=e.account_id where a.user_id=auth.uid() and e.created_at>=p_from and e.created_at<p_to and (p_type='all' or p_type='credit' and e.amount_atomic>0 or p_type='debit' and e.amount_atomic<0) order by e.created_at desc,e.id limit 21 offset greatest(0,least(p_offset,10000));
$$;
create function public.my_game_history(p_category text,p_game text,p_offset integer default 0)
returns table(id uuid,game_id text,game_name text,provider text,currency text,decimals smallint,bet_atomic text,payout_atomic text,multiplier numeric,played_at timestamptz) language sql security invoker set search_path='' as $$
 select g.id,g.game_id,g.game_name,g.provider,g.currency,g.decimals,g.bet_atomic::text,g.payout_atomic::text,g.multiplier,g.played_at from public.game_rounds g where g.user_id=auth.uid() and (p_category='all' or g.provider=p_category) and (p_game='all' or g.game_id=p_game) order by g.played_at desc,g.id limit 21 offset greatest(0,least(p_offset,10000));
$$;

revoke all on all tables in schema private from public,anon,authenticated;
revoke all on function public.session_allowed(),public.touch_user_session(),public.list_user_sessions(),public.revoke_user_sessions(boolean),public.my_transactions(timestamptz,timestamptz,text,integer),public.my_game_history(text,text,integer) from public,anon;
grant execute on function public.session_allowed(),public.touch_user_session(),public.list_user_sessions(),public.revoke_user_sessions(boolean),public.my_transactions(timestamptz,timestamptz,text,integer),public.my_game_history(text,text,integer) to authenticated;
revoke all on function public.save_account_settings(uuid,text,jsonb),public.save_kyc_draft(uuid,text),public.read_kyc_draft(uuid),public.register_account_file(uuid,text,text,integer),public.list_account_files(uuid),public.submit_kyc(uuid) from public,anon,authenticated;
grant execute on function public.save_account_settings(uuid,text,jsonb),public.save_kyc_draft(uuid,text),public.read_kyc_draft(uuid),public.register_account_file(uuid,text,text,integer),public.list_account_files(uuid),public.submit_kyc(uuid) to service_role;
-- Private bucket. No browser upload/read policies: the server checks ownership and signs short-lived links.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('account-documents','account-documents',false,3145728,array['image/webp']) on conflict(id) do nothing;
commit;
