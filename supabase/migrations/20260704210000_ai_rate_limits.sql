-- Persistent per-recruiter limits for AI-backed operations. Keeping the
-- events in Postgres makes enforcement consistent across serverless instances.

create table private.ai_rate_limit_events (
  recruiter_id uuid not null references auth.users (id) on delete cascade,
  request_kind text not null,
  created_at timestamptz not null default clock_timestamp(),
  constraint ai_rate_limit_events_kind check (
    request_kind in ('candidate_analysis', 'candidate_chat')
  )
);

create index ai_rate_limit_events_lookup_idx
on private.ai_rate_limit_events (recruiter_id, request_kind, created_at);

create index ai_rate_limit_events_cleanup_idx
on private.ai_rate_limit_events (created_at);

revoke all on table private.ai_rate_limit_events from public, anon, authenticated;

create function public.consume_ai_rate_limit(requested_kind text)
returns table (allowed boolean, retry_after_seconds integer)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  request_time timestamptz := clock_timestamp();
  event_count integer;
  oldest_event timestamptz;
  rate_limit integer;
  rate_window interval;
begin
  if actor_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  case requested_kind
    when 'candidate_chat' then
      rate_limit := 20;
      rate_window := interval '5 minutes';
    when 'candidate_analysis' then
      rate_limit := 15;
      rate_window := interval '1 hour';
    else
      raise exception 'Unsupported AI request kind.' using errcode = '22023';
  end case;

  -- Serialize requests for the same recruiter and operation so concurrent
  -- calls cannot pass the limit together.
  perform pg_advisory_xact_lock(
    hashtextextended(actor_id::text || ':' || requested_kind, 0)
  );

  delete from private.ai_rate_limit_events as event
  where event.created_at < request_time - interval '1 hour';

  select count(*), min(event.created_at)
  into event_count, oldest_event
  from private.ai_rate_limit_events as event
  where event.recruiter_id = actor_id
    and event.request_kind = requested_kind
    and event.created_at > request_time - rate_window;

  if event_count >= rate_limit then
    return query
    select
      false,
      greatest(
        1,
        ceil(extract(epoch from (oldest_event + rate_window - request_time)))::integer
      );
    return;
  end if;

  insert into private.ai_rate_limit_events (recruiter_id, request_kind, created_at)
  values (actor_id, requested_kind, request_time);

  return query select true, 0;
end;
$$;

revoke all on function public.consume_ai_rate_limit(text) from public, anon;
grant execute on function public.consume_ai_rate_limit(text) to authenticated;
