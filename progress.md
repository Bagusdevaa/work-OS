# Personal Work OS — Progress

## Current Milestone

MVP — Foundation

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

---

## In Progress

Projects (CRUD, project page, activity).

---

## Next

1. Projects
2. Milestones
3. Tasks
4. Dashboard
5. Project health
6. My Work
7. Inbox
8. Calendar
9. Weekly Review

---

## Known Issues

None.

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

2026-09-09 — app shell, companies and areas complete (Tasks 4–5 of the MVP plan in `docs/superpowers/plans/`).
