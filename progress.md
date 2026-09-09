# Personal Work OS — Progress

## Current Milestone

MVP — Foundation (complete; awaiting merge of `feat/mvp-foundation` into `main`)

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

---

## In Progress

Nothing. MVP verified: `bun run check`, `bun run lint`, `bun test` (133 tests), `bun run build` all pass; adapter-node server smoke-tested; every page checked at 1440×900, 1280×800, 1024×768, 768×1024 and 390×844 with no horizontal overflow.

---

## Next

1. Deva: review commits on `feat/mvp-foundation`, merge into `main`.
2. Point `.env` at the real Supabase project and run `bun run db:migrate` there.
3. Post-MVP candidates: password reset / magic link, task reordering, project archive view, richer calendar (week view), AI features per AGENTS.md §20 once workflows are proven.

---

## Known Issues

- Email confirmation on signup is disabled in the local Supabase config; hosted Supabase enables it by default (the signup page already handles the "check your email" state).
- `supabase/config.toml` is committed as generated; adjust `site_url`/`additional_redirect_urls` for the hosted project.

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
- `@sveltejs/adapter-node` is used for production builds (portable; swap if a platform adapter is preferred).
- Supabase Auth is used server-side only via `@supabase/ssr`; no browser Supabase client.
- Styling uses plain CSS with design tokens (no utility framework) to keep dependencies minimal.
- Unit tests target pure domain logic and run with `bun test`; framework behaviour is not tested.

---

## Last Updated

2026-09-09 — MVP milestone complete and verified (all 14 tasks of the plan in `docs/superpowers/plans/2026-09-09-mvp-foundation.md`).
