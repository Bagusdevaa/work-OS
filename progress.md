# Personal Work OS — Progress

## Current Milestone

Deployment — hosted Supabase + Vercel. Repo side complete and merged; the app builds and serves on
Vercel with the schema in place. What remains is dashboard-only configuration (see Next).

Previous: Post-MVP (merged into `main` 2026-09-11), MVP — Foundation (merged 2026-09-10)

---

## Completed

- [x] Repository initialized (branch `feat/mvp-foundation`, pre-push hook installed)
- [x] SvelteKit configured (Svelte 5 runes, adapter-node)
- [x] Bun configured (`bun test` for unit tests)
- [x] TypeScript strict configured
- [x] ESLint configured
- [x] Prettier configured
- [x] Drizzle configured (`drizzle.config.ts`, migrations in `drizzle/`)
- [x] Supabase PostgreSQL connected (local stack via `supabase start`; `.env` holds local dev values)
- [x] Design tokens + global styles (`src/lib/styles/tokens.css`, `global.css`)
- [x] Shared domain vocabulary (`src/lib/types/domain.ts`)
- [x] Date utilities with tests (`src/lib/utils/dates.ts`)
- [x] Database schema created (12 tables, enums, relations; migration `drizzle/0000_initial_schema.sql`)
- [x] Authentication implemented (Supabase Auth via @supabase/ssr, server-side only; login, signup, callback, signout; route guard in hooks)
- [x] Application shell implemented (responsive sidebar/rail/drawer, top bar, page primitives, error page)
- [x] Companies & Areas (list, create, edit, archive/restore, overview page with areas, projects, activity)
- [x] Activity log (repository/service + ActivityList component)
- [x] Projects (list with filters, create/edit, project page with focus card, status select, why/goal, notes, resources, activity)
- [x] Notes & Resources (inline create/delete on the project page)
- [x] Milestones (inline create/complete/reopen/delete on the project page; progress calculated from tasks; tested)
- [x] Tasks (quick add grouped by milestone, done toggle, edit page with delete, project progress; sorting/overdue/grouping tested)
- [x] Project health (deterministic `calculateProjectHealth` with reasons; badge on project page, cards and company rows; 14 tests)
- [x] Dashboard (stats, "Focus now" recommendations with reasons, needs-attention projects, active projects, upcoming deadlines, recent activity; recommendation/bucket/deadline logic tested)
- [x] My Work (Overdue / Due today / This week / Blocked / Next up sections; context filter by company, project or personal; `?view=` deep links from dashboard; tested)
- [x] Inbox (quick capture with automatic kind detection, convert to task / note / project, dismiss and restore, processed history; classification tested)
- [x] Calendar (month grid + agenda of task, milestone and project deadlines plus events; add/remove events; grid helpers tested)
- [x] Weekly Review (computed summary: completed tasks/milestones, projects by health, overdue, next week; editable wins/problems/lessons/priorities saved per week with a snapshot; tested)

### Post-MVP (plan: `docs/superpowers/plans/2026-09-10-post-mvp.md`)

- [x] Password reset (`/forgot-password` → emailed link → `/reset-password`) and magic-link sign-in, both through `/auth/callback`; `friendlyAuthMessage` and the password schemas tested
- [x] Manual task order — native drag-and-drop with ▲▼ keyboard/touch fallback, Smart/Manual toggle per project, `sortOrder` rewritten in one transaction; `moveWithinGroup`, `sortOrderPatches` and manual `sortTasks` tested
- [x] Project archive page (`/projects/archive`) grouping completed and archived projects by company, with Archive/Restore and an "Archived (n)" link from Projects; `groupProjectsByCompany` tested
- [x] Calendar week view (`?view=week&week=YYYY-MM-DD`) beside the month grid, with a Month/Week toggle that keeps the visible dates; `buildWeekGrid`, `shiftWeek`, `weekLabel`, `currentWeek` tested
- [x] Hosted Supabase runbook (`docs/supabase-production-setup.md`); local `supabase/config.toml` auth URLs aligned with the dev server on port 5173

### Deployment (Vercel)

- [x] Swapped `@sveltejs/adapter-node` for `@sveltejs/adapter-vercel`, runtime pinned to `nodejs24.x` so the build does not depend on the machine's Node version
- [x] Database client tuned for serverless: small pool (`max: 3`) and `idle_timeout: 20` so many short-lived instances cannot exhaust Supabase's shared pooler
- [x] Runbook rewritten for Supabase + Vercel: both pooler connection strings and why they differ, env vars, custom subdomain, and a final lock-down step that closes public signups

---

## In Progress

Nothing in the repo. Deployment state as of 2026-09-11:

- Vercel project `work-os` is linked to the GitHub repo; production builds from `main` succeed and
  `https://work-os-two-kappa.vercel.app` serves the app. Builds before the adapter swap all failed.
- `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set correctly — proven live: a password-reset and a
  magic-link request against the deployment both reached Supabase Auth and returned success.
  `DATABASE_URL` is present too (the db client throws at import when it is missing, and no request
  500s), but actual query connectivity stays unproven until the first sign-in.
- The schema was applied to the hosted project through the Supabase MCP, then verified against the
  local database: column, constraint and index fingerprints all match (123 columns, identical MD5s).
  Drizzle's journal row was written with the same sha256 the migrator computes, so a later
  `bun run db:migrate` skips it rather than re-applying.
- All 12 public tables have RLS enabled (Supabase's `rls_auto_enable` event trigger does this) with
  no policies, which is what this app wants: PostgREST and the anon key are blocked entirely, while
  the app reaches the data through Drizzle as the table owner.
- CSRF protection is active on the deployment (a form POST without a matching Origin is refused).

Post-MVP verified: `bun run check`, `bun run lint`, `bun test` (174 tests) and
`bun run build` all pass, and every new flow was exercised against the running local stack —
password reset end to end through Mailpit (request → emailed PKCE link → `/reset-password` → sign in
with the new password), magic-link sign-in, task reordering by drag and by keyboard, archive and
restore, and the calendar Month/Week toggle. Nine pages checked in Chrome at 1440, 1280, 1024, 768
and 390 px: no horizontal overflow, no console or page errors.

Two defects surfaced only in that live pass and are fixed: magic link reported a distinct error for
unknown addresses (account enumeration), and a dropped task submitted an empty id because the form
was submitted before Svelte flushed the bound state.

---

## Next

1. Deva, dashboard-only work in `docs/supabase-production-setup.md` — none of it is reachable from
   the Supabase or Vercel MCP:
   - **Step 6 first (blocking).** Until the Site URL and redirect allow list include the deployed
     origin, every confirmation, reset and magic link bounces to the wrong place.
   - Step 7 (confirm email, min password length 8), step 8 (custom SMTP — the built-in sender is
     too rate-limited to depend on), step 10 (attach `work.bagusdeva.com`), step 11 (walk the
     verification checklist), step 12 (close public signups).
2. Later candidates: richer calendar interactions, saved views, AI features per AGENTS.md §20 once
   the deterministic workflows have proven themselves in daily use.

---

## Known Issues

- Email confirmation on signup is disabled in the local Supabase config; hosted Supabase enables it by default (the signup page already handles the "check your email" state).
- Hosted Supabase needs its own Site URL and redirect allow list — see `docs/supabase-production-setup.md` step 6. The values in `supabase/config.toml` apply to the local stack only.
- Supabase's built-in email sender is rate-limited to a few messages per hour. Password reset and magic link need custom SMTP before daily use (runbook step 8).
- Signups are open by default. Until runbook step 12 is done, anyone who finds the deployed URL can register an account (their data stays scoped to them, but the accounts are real).
- Vercel preview deployments share the production database; there is no separate staging project.
- `drizzle.__drizzle_migrations` has RLS disabled. The `drizzle` schema is not exposed through PostgREST so it is not reachable with the anon key, but `ALTER TABLE "drizzle"."__drizzle_migrations" ENABLE ROW LEVEL SECURITY;` would close it off entirely; the app and drizzle-kit connect as the table owner and are unaffected.
- Supabase's own `public.rls_auto_enable()` is a `SECURITY DEFINER` function callable via RPC, which the security advisor flags. It is platform-managed, only does work inside a DDL event trigger, and is what enabled RLS on our tables — left alone deliberately.
- Drag-and-drop reordering is pointer-only by design; the ▲▼ buttons carry keyboard and touch, and the grip is hidden where hover does not exist.

---

## Architectural Decisions

- SvelteKit handles frontend and backend logic.
- PostgreSQL is the primary database.
- Supabase provides managed PostgreSQL infrastructure; the Supabase CLI runs the same stack locally.
- Drizzle is the primary database access layer.
- Business logic belongs in services.
- Database access belongs in repositories.
- Feature-based architecture is preferred.
- AI features are deferred until deterministic workflows are solid.
- `@sveltejs/adapter-vercel` is used for production builds, targeting Vercel serverless functions. The runtime is pinned in `vite.config.ts`.
- Supabase Auth is used server-side only via `@supabase/ssr`; no browser Supabase client.
- Styling uses plain CSS with design tokens (no utility framework) to keep dependencies minimal.
- Unit tests target pure domain logic and run with `bun test`; framework behaviour is not tested.
- Manual task order is opt-in per project (`?sort=manual`) rather than replacing the smart sort: an order the user drags has to survive, but urgency is the better default.
- Reordering a task is not written to the activity log — moving work around is not progress, and logging it would drown the log and skew project health.

---

## Last Updated

2026-09-11 — Deployed to Vercel and schema applied to hosted Supabase via MCP. Remaining work is
Supabase dashboard configuration (auth URLs, email, signups) plus attaching the custom domain.
