# Personal Work OS — Progress

## Current Milestone

Deployment — hosted Supabase + Vercel (repo side complete on `chore/vercel-deploy`;
the hosted setup itself is Deva's to run)

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

Nothing. Post-MVP verified: `bun run check`, `bun run lint`, `bun test` (174 tests) and
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

1. Deva: follow `docs/supabase-production-setup.md` end to end. Two steps carry the most risk of
   being skipped: custom SMTP (step 8), without which reset and magic-link email quietly stops, and
   closing signups (step 12), without which anyone who finds the URL can register.
2. Later candidates: richer calendar interactions, saved views, AI features per AGENTS.md §20 once
   the deterministic workflows have proven themselves in daily use.

---

## Known Issues

- Email confirmation on signup is disabled in the local Supabase config; hosted Supabase enables it by default (the signup page already handles the "check your email" state).
- Hosted Supabase needs its own Site URL and redirect allow list — see `docs/supabase-production-setup.md` step 6. The values in `supabase/config.toml` apply to the local stack only.
- Supabase's built-in email sender is rate-limited to a few messages per hour. Password reset and magic link need custom SMTP before daily use (runbook step 8).
- Signups are open by default. Until runbook step 12 is done, anyone who finds the deployed URL can register an account (their data stays scoped to them, but the accounts are real).
- Vercel preview deployments share the production database; there is no separate staging project.
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

2026-09-11 — Post-MVP merged into `main`. Repo prepared for Vercel on `chore/vercel-deploy`:
adapter swap, serverless-safe database pooling, and a Supabase + Vercel runbook.
