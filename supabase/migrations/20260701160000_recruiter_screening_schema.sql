-- Freelance Candidate Evidence Screener MVP
--
-- Ownership chain:
--   auth.users.id -> jobs.recruiter_id -> candidates.job_id
--   -> screening_reports/chat_messages.candidate_id
--
-- Resume object paths must use:
--   <auth.uid()>/<candidate-id>/<safe-file-name>.pdf

create type public.candidate_analysis_status as enum (
  'pending',
  'extracting',
  'ready',
  'processing',
  'completed',
  'failed'
);

create type public.screening_report_status as enum (
  'processing',
  'completed',
  'failed'
);

create type public.screening_recommendation as enum (
  'strong_fit',
  'possible_fit',
  'weak_fit'
);

create type public.chat_message_role as enum ('user', 'assistant');

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  recruiter_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text not null,
  requirements text not null,
  must_have_skills text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint jobs_title_length check (char_length(btrim(title)) between 1 and 160),
  constraint jobs_description_present check (char_length(btrim(description)) > 0),
  constraint jobs_requirements_present check (char_length(btrim(requirements)) > 0),
  constraint jobs_must_have_skills_limit check (cardinality(must_have_skills) <= 50)
);

create table public.candidates (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  name text not null,
  proposal_text text not null,
  portfolio_url text not null,
  resume_path text not null unique,
  resume_text text,
  analysis_status public.candidate_analysis_status not null default 'pending',
  analysis_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint candidates_name_length check (char_length(btrim(name)) between 1 and 200),
  constraint candidates_proposal_present check (char_length(btrim(proposal_text)) > 0),
  constraint candidates_portfolio_url check (
    char_length(portfolio_url) <= 2048
    and portfolio_url ~* '^https?://[^[:space:]]+$'
  ),
  constraint candidates_resume_path check (
    char_length(resume_path) between 1 and 1024
    and resume_path = btrim(resume_path)
    and resume_path !~ '(^/|//|(^|/)\.\.?(/|$))'
    and split_part(resume_path, '/', 2) = id::text
    and split_part(resume_path, '/', 3) <> ''
    and lower(resume_path) like '%.pdf'
  ),
  constraint candidates_resume_text_nonempty check (
    resume_text is null or char_length(btrim(resume_text)) > 0
  )
);

create table public.screening_reports (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null unique references public.candidates (id) on delete cascade,
  status public.screening_report_status not null default 'processing',
  score smallint,
  recommendation public.screening_recommendation,
  summary text,
  strengths jsonb,
  weaknesses jsonb,
  matched_skills jsonb,
  missing_skills jsonb,
  proposal_specificity_findings jsonb,
  portfolio_evidence jsonb,
  review_points jsonb,
  outreach_message text,
  raw_structured_output jsonb,
  model_identifier text not null,
  prompt_version text not null,
  error_message text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint screening_reports_score_range check (score between 0 and 100),
  constraint screening_reports_score_recommendation check (
    (score is null and recommendation is null)
    or (
      score is not null
      and recommendation is not null
      and (
        (score between 80 and 100 and recommendation = 'strong_fit')
        or (score between 60 and 79 and recommendation = 'possible_fit')
        or (score between 0 and 59 and recommendation = 'weak_fit')
      )
    )
  ),
  constraint screening_reports_json_shapes check (
    (strengths is null or jsonb_typeof(strengths) = 'array')
    and (weaknesses is null or jsonb_typeof(weaknesses) = 'array')
    and (matched_skills is null or jsonb_typeof(matched_skills) = 'array')
    and (missing_skills is null or jsonb_typeof(missing_skills) = 'array')
    and (
      proposal_specificity_findings is null
      or jsonb_typeof(proposal_specificity_findings) = 'object'
    )
    and (
      portfolio_evidence is null
      or jsonb_typeof(portfolio_evidence) = 'object'
    )
    and (review_points is null or jsonb_typeof(review_points) = 'array')
    and (
      raw_structured_output is null
      or jsonb_typeof(raw_structured_output) = 'object'
    )
  ),
  constraint screening_reports_completed_fields check (
    status <> 'completed'
    or (
      score is not null
      and recommendation is not null
      and summary is not null
      and char_length(btrim(summary)) > 0
      and strengths is not null
      and weaknesses is not null
      and matched_skills is not null
      and missing_skills is not null
      and proposal_specificity_findings is not null
      and portfolio_evidence is not null
      and review_points is not null
      and outreach_message is not null
      and char_length(btrim(outreach_message)) > 0
      and raw_structured_output is not null
      and error_message is null
      and completed_at is not null
    )
  ),
  constraint screening_reports_failed_error check (
    status <> 'failed'
    or (
      error_message is not null
      and char_length(btrim(error_message)) > 0
    )
  ),
  constraint screening_reports_model_present check (
    char_length(btrim(model_identifier)) > 0
  ),
  constraint screening_reports_prompt_version_present check (
    char_length(btrim(prompt_version)) > 0
  )
);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates (id) on delete cascade,
  role public.chat_message_role not null,
  content text not null,
  created_at timestamptz not null default now(),
  constraint chat_messages_content_length check (
    char_length(btrim(content)) between 1 and 20000
  )
);

create index jobs_recruiter_id_idx on public.jobs (recruiter_id);
create index candidates_job_id_idx on public.candidates (job_id);
create index candidates_analysis_status_idx on public.candidates (analysis_status);
create index chat_messages_candidate_created_at_idx
  on public.chat_messages (candidate_id, created_at desc);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = statement_timestamp();
  return new;
end;
$$;

create trigger jobs_set_updated_at
before update on public.jobs
for each row execute function public.set_updated_at();

create trigger candidates_set_updated_at
before update on public.candidates
for each row execute function public.set_updated_at();

create trigger screening_reports_set_updated_at
before update on public.screening_reports
for each row execute function public.set_updated_at();

-- Keep ownership helpers outside exposed schemas. These narrowly scoped
-- security-definer functions avoid recursive RLS joins through parent tables.
create schema if not exists private;
revoke all on schema private from public;

create function private.owns_job(requested_job_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.jobs
    where id = requested_job_id
      and recruiter_id = (select auth.uid())
  );
$$;

create function private.owns_candidate(requested_candidate_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.candidates as candidate
    inner join public.jobs as job on job.id = candidate.job_id
    where candidate.id = requested_candidate_id
      and job.recruiter_id = (select auth.uid())
  );
$$;

revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function private.owns_job(uuid) from public, anon;
revoke all on function private.owns_candidate(uuid) from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.owns_job(uuid) to authenticated;
grant execute on function private.owns_candidate(uuid) to authenticated;

alter table public.jobs enable row level security;
alter table public.candidates enable row level security;
alter table public.screening_reports enable row level security;
alter table public.chat_messages enable row level security;

revoke all on table public.jobs from anon;
revoke all on table public.candidates from anon;
revoke all on table public.screening_reports from anon;
revoke all on table public.chat_messages from anon;

grant select, insert, update, delete on table public.jobs to authenticated;
grant select, insert, update, delete on table public.candidates to authenticated;
grant select, insert, update, delete on table public.screening_reports to authenticated;
grant select, insert, update, delete on table public.chat_messages to authenticated;

create policy "Recruiters can read their jobs"
on public.jobs
for select
to authenticated
using (recruiter_id = (select auth.uid()));

create policy "Recruiters can create their jobs"
on public.jobs
for insert
to authenticated
with check (recruiter_id = (select auth.uid()));

create policy "Recruiters can update their jobs"
on public.jobs
for update
to authenticated
using (recruiter_id = (select auth.uid()))
with check (recruiter_id = (select auth.uid()));

create policy "Recruiters can delete their jobs"
on public.jobs
for delete
to authenticated
using (recruiter_id = (select auth.uid()));

create policy "Recruiters can read candidates for their jobs"
on public.candidates
for select
to authenticated
using ((select private.owns_job(job_id)));

create policy "Recruiters can create candidates for their jobs"
on public.candidates
for insert
to authenticated
with check (
  (select private.owns_job(job_id))
  and split_part(resume_path, '/', 1) = (select auth.uid()::text)
);

create policy "Recruiters can update candidates for their jobs"
on public.candidates
for update
to authenticated
using ((select private.owns_job(job_id)))
with check (
  (select private.owns_job(job_id))
  and split_part(resume_path, '/', 1) = (select auth.uid()::text)
);

create policy "Recruiters can delete candidates for their jobs"
on public.candidates
for delete
to authenticated
using ((select private.owns_job(job_id)));

create policy "Recruiters can read reports for their candidates"
on public.screening_reports
for select
to authenticated
using ((select private.owns_candidate(candidate_id)));

create policy "Recruiters can create reports for their candidates"
on public.screening_reports
for insert
to authenticated
with check ((select private.owns_candidate(candidate_id)));

create policy "Recruiters can update reports for their candidates"
on public.screening_reports
for update
to authenticated
using ((select private.owns_candidate(candidate_id)))
with check ((select private.owns_candidate(candidate_id)));

create policy "Recruiters can delete reports for their candidates"
on public.screening_reports
for delete
to authenticated
using ((select private.owns_candidate(candidate_id)));

create policy "Recruiters can read chat for their candidates"
on public.chat_messages
for select
to authenticated
using ((select private.owns_candidate(candidate_id)));

create policy "Recruiters can create chat for their candidates"
on public.chat_messages
for insert
to authenticated
with check ((select private.owns_candidate(candidate_id)));

create policy "Recruiters can update chat for their candidates"
on public.chat_messages
for update
to authenticated
using ((select private.owns_candidate(candidate_id)))
with check ((select private.owns_candidate(candidate_id)));

create policy "Recruiters can delete chat for their candidates"
on public.chat_messages
for delete
to authenticated
using ((select private.owns_candidate(candidate_id)));

-- The bucket is private and applies the same 2 MB/PDF-only rules as intake.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('resumes', 'resumes', false, 2097152, array['application/pdf'])
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Recruiters can read their resume objects"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "Recruiters can upload their resume objects"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "Recruiters can update their resume objects"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "Recruiters can delete their resume objects"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

comment on table public.jobs is
  'Recruiter-owned job criteria used to evaluate freelance candidates.';
comment on table public.candidates is
  'Candidate evidence and private resume object path; ownership derives through jobs.';
comment on table public.screening_reports is
  'One validated, evidence-backed screening report per candidate.';
comment on table public.chat_messages is
  'Bounded follow-up conversation grounded in a completed candidate report.';
comment on column public.candidates.resume_path is
  'Private Storage path only; never persist a public or signed resume URL.';
comment on column public.screening_reports.raw_structured_output is
  'Validated raw model structure retained for audit/debugging; never trust it without the application schema.';
