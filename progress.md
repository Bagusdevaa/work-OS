# Personal Work OS — Progress

## Current Milestone

Retired. Archived: Personal Work OS now lives in HQ's Work module, `https://hq.bagusdeva.com/work` (repo `Bagusdevaa/hq`). This repo is kept read-only for reference.

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

Nothing — retired; see HQ (`https://hq.bagusdeva.com/work`).

---

## Next

Nothing — retired; further work happens in HQ (repo `Bagusdevaa/hq`).

---

## Performance notes (measured 2026-09-11)

Navigation felt slow (1–2 s per page). Two causes, in order of size:

1. **Functions ran nowhere near the database.** Vercel defaulted to `iad1` (Washington DC) while
   the Supabase project lives in `ap-northeast-1` (Tokyo). The first correction moved functions to
   `sin1` on a wrong inference — the Supabase API _answers_ from Bali in single-digit milliseconds
   because Cloudflare terminates TLS at a nearby edge, which says nothing about where the database
   is. The pooler hostname in `DATABASE_URL` is the authority, and it reads `ap-northeast-1`, so
   functions are now pinned to `hnd1`. Both sides are reported on every response (`x-debug-region`,
   `x-debug-db`) so the pair can be checked at a glance rather than inferred.
2. **Cold starts.** Measured against `/login`, which touches no database: first request 750 ms,
   settling to ~150 ms by the sixth. So a cold instance costs roughly 350–600 ms. Five parallel
   requests against warm instances all returned in 156–335 ms.

Per-phase timings from the deployed app (`Server-Timing`, measured while functions were still in
Singapore and the database in Tokyo) showed where the time actually went:

| Phase     | ms  | What it is                           |
| --------- | --- | ------------------------------------ |
| `sess`    | 2   | reading the session cookie — free    |
| `getuser` | 120 | one HTTPS call to Supabase Auth      |
| `dbprobe` | 72  | a bare `select 1`                    |
| `dbuser`  | 144 | one indexed row from a one-row table |
| `load`    | 535 | the page's own queries and render    |

`select 1` costing 72 ms is the tell: Singapore→Tokyo is roughly that, and no amount of query tuning
touches it. The work was never the problem — the round trips were.

What was ruled out with evidence, not assumption: Postgres logged zero errors over 24 hours and the
performance advisors reported only INFO-level items; Supabase Auth answers `/user` in 2–5 ms. The
database was never the bottleneck, despite the "unresponsive project" reading in the uptime panel.

After both sides were pinned to Tokyo, the same page measured:

| Phase                  | Before     | After      |
| ---------------------- | ---------- | ---------- |
| `getuser`              | 120 ms     | 47 ms      |
| `dbprobe` (`select 1`) | 72 ms      | 5 ms       |
| `dbuser`               | 144 ms     | 7 ms       |
| `load`                 | 535 ms     | 28 ms      |
| **server total**       | **871 ms** | **~92 ms** |

Two back-to-back `select 1` probes both cost 5 ms, which ruled out connection setup as a remaining
factor — every database round trip is simply cheap now. The probes were removed afterwards; they
were two extra round trips on every authenticated request.

### Incident: dashboard 500s, 2026-09-11

Raising the pool to `max: 10` (with `idle_timeout: 300`) to "hold connections open" broke the
dashboard. `DATABASE_URL` points at Supabase's **session** pooler (port 5432), which allots a
project only a handful of client connections; postgres-js opened one per concurrent query, the
pooler refused the extras, and `buildDashboard` — which runs five queries in one `Promise.all` —
failed on the fifth every time. Postgres itself logged nothing, because the queries never reached
it. Reverted to `max: 3`, `idle_timeout: 20`, which had never erred.

The lesson: pool size is bounded by the pooler's allowance, not by what the instance can afford.
Raising it is only safe on the **transaction** pooler (port 6543), which multiplexes many client
connections onto few Postgres backends. Switching `DATABASE_URL` to port 6543 is the proper fix and
would also remove the ceiling that caused this — the app already sets `prepare: false` for it.

The `Server-Timing` and `x-debug-*` headers are deliberately left in place — they turned this from
guesswork into arithmetic, and cost nothing.

---

## Known Issues

- Email confirmation on signup is disabled in the local Supabase config; hosted Supabase enables it by default (the signup page already handles the "check your email" state).
- Hosted Supabase needs its own Site URL and redirect allow list — see `docs/supabase-production-setup.md` step 6. The values in `supabase/config.toml` apply to the local stack only.
- Supabase's built-in email sender is rate-limited to a few messages per hour. Password reset and magic link need custom SMTP before daily use (runbook step 8).
- Signups are open by default. Until runbook step 12 is done, anyone who finds the deployed URL can register an account (their data stays scoped to them, but the accounts are real).
- Vercel preview deployments share the production database; there is no separate staging project.
- `DATABASE_URL` uses the session pooler (5432), not the transaction pooler (6543) the runbook recommends. This caps how many connections the app may open; see the incident note above.
- Responses carry `Server-Timing` plus `x-debug-region` and `x-debug-db` headers. They cost nothing and turned a day of guessing into arithmetic, but they do expose which region and pooler the app dials — remove them if that ever matters.
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
- `@sveltejs/adapter-vercel` is used for production builds, targeting Vercel serverless functions. The runtime and the region are pinned in `vite.config.ts`; the region must track wherever the Supabase project lives.
- Link preloading is set to `tap` rather than SvelteKit's `hover` default (`src/app.html`). Each speculative load is a full server render with its own queries, and on serverless several concurrent ones wake several cold instances, so hovering across the sidebar used to queue work ahead of the click the user actually made.
- Supabase Auth is used server-side only via `@supabase/ssr`; no browser Supabase client.
- Styling uses plain CSS with design tokens (no utility framework) to keep dependencies minimal.
- Unit tests target pure domain logic and run with `bun test`; framework behaviour is not tested.
- Manual task order is opt-in per project (`?sort=manual`) rather than replacing the smart sort: an order the user drags has to survive, but urgency is the better default.
- Reordering a task is not written to the activity log — moving work around is not progress, and logging it would drown the log and skew project health.

---

## Last Updated

2026-09-11 — Live at https://work.bagusdeva.com. Auth verified end to end in production (signup,
email confirmation, magic-link sign-in) and the first user row written through Drizzle. Remaining:
close public signups, then the functional checklist.
