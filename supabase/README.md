# Supabase schema and storage

The migration in `migrations/` creates the complete MVP persistence boundary:

- recruiter-owned `jobs`;
- `candidates` owned through their job;
- one `screening_reports` row per candidate;
- candidate-scoped `chat_messages`;
- a private, PDF-only `resumes` bucket with a 2 MB object limit.

## Ownership and RLS

Every public table has Row Level Security enabled and grants product operations only to the `authenticated` role. A job belongs directly to `auth.uid()`. Candidate, report, and chat policies follow the job ownership chain through narrowly scoped security-definer helpers in the unexposed `private` schema. Application server operations must still verify ownership as defense in depth.

Resume object paths must use this format:

```text
<authenticated-user-id>/<candidate-id>/<safe-file-name>.pdf
```

Storage policies compare the first folder with `auth.uid()` for every read, upload, update, and delete. The candidate insert/update policy enforces the same prefix on `resume_path`. Store only that object path; never store a public or signed URL.

Generate the candidate UUID before upload so the same value can be used in the second folder and the candidate insert. The database rejects a `resume_path` whose second folder does not match `candidates.id`.

Deleting a relational row does not delete its Storage object. Any future candidate/job deletion workflow must delete resume objects through the Storage API before deleting database rows.

## Apply locally

Docker must be running. From the repository root:

```bash
supabase start
supabase db reset
supabase db lint --local --schema public,storage --fail-on error
```

Regenerate the checked-in application type snapshot after the migration succeeds:

```bash
supabase gen types typescript --local > lib/supabase/database.types.ts
```

For the linked remote project, log in to the CLI and use `--linked` instead of
`--local`. Review the generated diff before keeping it; the type snapshot must
stay aligned with the applied migrations.

## Apply remotely

Remote changes are intentionally not automatic. After reviewing the local result:

```bash
supabase login
supabase link --project-ref <project-ref>
supabase db push --dry-run
supabase db push
```

Run the final command only when you intend to change the linked project. In the Supabase dashboard, keep the `resumes` bucket private and enable email/password authentication. Production email confirmation and redirect URLs are configured separately from this migration.
