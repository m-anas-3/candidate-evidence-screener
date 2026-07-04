alter table public.candidates
  alter column portfolio_url drop not null;

alter table public.candidates
  drop constraint candidates_portfolio_url;

alter table public.candidates
  add constraint candidates_portfolio_url check (
    portfolio_url is null
    or (
      char_length(portfolio_url) <= 2048
      and portfolio_url ~* '^https?://[^[:space:]]+$'
    )
  );

comment on column public.candidates.portfolio_url is
  'Optional recruiter-reviewed portfolio URL. It is not fetched or scored by the analysis agent.';
