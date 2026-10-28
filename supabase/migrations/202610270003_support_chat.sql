-- Support is separate from balances and KYC. Players cannot impersonate agents.
create table public.support_messages (
  id uuid primary key default gen_random_uuid(),
  message_order bigint generated always as identity unique,
  user_id uuid not null references public.profiles(id),
  request_id uuid not null,
  sender text not null check(sender in ('user','automatic','agent')),
  text text not null check(char_length(text) between 1 and 2000),
  created_at timestamptz not null default clock_timestamp(),
  unique(user_id,request_id,sender)
);
create index support_messages_user_order on public.support_messages(user_id,message_order);
alter table public.support_messages enable row level security;
revoke all on public.support_messages from anon,authenticated;
grant select on public.support_messages to authenticated;
grant all on public.support_messages to service_role;
grant usage on sequence public.support_messages_message_order_seq to service_role;
create policy support_own on public.support_messages for select to authenticated
  using(user_id=(select auth.uid()) and (select public.session_allowed()));

create function public.send_support_message(p_request_id uuid,p_text text)
returns setof public.support_messages language plpgsql security definer set search_path='' as $$
declare current_user_id uuid:=auth.uid();
begin
  if current_user_id is null or not public.session_allowed() then raise exception 'SESSION_REQUIRED'; end if;
  -- Serializes retries and rate limits for this account.
  perform 1 from public.profiles where id=current_user_id and account_status='active' for update;
  if not found then raise exception 'ACCOUNT_UNAVAILABLE'; end if;
  if p_request_id is null or p_text is null or char_length(btrim(p_text)) not between 1 and 2000 then raise exception 'INVALID_MESSAGE'; end if;
  if not exists(select 1 from public.support_messages where user_id=current_user_id and request_id=p_request_id) then
    if (select count(*) from public.support_messages where user_id=current_user_id and sender='user' and created_at > now()-interval '15 minutes') >= 30 then raise exception 'SUPPORT_RATE_LIMIT'; end if;
    insert into public.support_messages(user_id,request_id,sender,text) values
      (current_user_id,p_request_id,'user',btrim(p_text)),
      (current_user_id,p_request_id,'automatic','Gracias por contactar con el soporte de HorseBet. Un agente de soporte se pondrá en contacto contigo pronto. Agradecemos tu paciencia y la espera.');
  end if;
  return query select * from public.support_messages where user_id=current_user_id and request_id=p_request_id order by message_order;
end;$$;
revoke all on function public.send_support_message(uuid,text) from public,anon;
grant execute on function public.send_support_message(uuid,text) to authenticated;
