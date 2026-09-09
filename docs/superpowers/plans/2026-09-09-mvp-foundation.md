# Personal Work OS — MVP Implementation Plan

> **For agentic workers:** Execute inline, task by task (superpowers:executing-plans). Pure domain
> logic is built test-first with `bun test`. Tick the checkboxes as tasks complete and mirror the
> state in `progress.md`.

**Goal:** A working Personal Work OS MVP: companies → areas → projects → milestones → tasks, with a
dashboard, deterministic project health, "what should I work on" recommendations, My Work, Inbox,
Calendar and Weekly Review.

**Architecture:** SvelteKit (Svelte 5 runes) handles UI and server logic. Routes call feature
services; services hold business rules and call repositories; repositories use Drizzle against
PostgreSQL. Pure domain calculations (health, progress, recommendations, summaries) live in
`*.utils.ts`/`*.service.ts` files with no I/O so they are unit-testable with Bun.

**Tech Stack:** SvelteKit 2 · Svelte 5 · TypeScript strict · Bun · PostgreSQL (Supabase) ·
Drizzle ORM + Drizzle Kit · Zod 4 · @supabase/ssr (auth only) · @lucide/svelte · Inter (fontsource)

**Spec:** `AGENTS.md`, `docs/product.md`, `docs/architecture.md`, `docs/design-system.md`

## Global Constraints

- TypeScript strict; no `any`.
- Files ideally < 200 lines, refactor > 300; functions ideally < 30 lines.
- Layering: route → service → repository → Drizzle. No DB access from components.
- Every user-owned table has `user_id`; every repository function takes `userId` first.
- Validation with Zod in `*.schema.ts`; forms use SvelteKit actions + `use:enhance`.
- Design tokens only (CSS custom properties in `src/lib/styles/tokens.css`).
- Breakpoints: desktop ≥ 1280, tablet 768–1279, mobile < 768. No horizontal overflow.
- Every screen: loading, empty, error, success states.
- Commits: one line, `Feat:` / `Fix:` / `Chore:` / `Docs:` / `Refactor:` prefix, no trailers.
- No AI features.

---

## Domain vocabulary (shared by DB enums, Zod and UI)

`src/lib/types/domain.ts`

```ts
export const PROJECT_STATUSES = [
	'idea',
	'planning',
	'active',
	'paused',
	'blocked',
	'completed',
	'archived'
] as const;
export const PROJECT_TYPES = ['work', 'personal', 'internal', 'client', 'experiment'] as const;
export const PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
export const TASK_STATUSES = ['todo', 'in_progress', 'blocked', 'done'] as const;
export const MILESTONE_STATUSES = ['planned', 'active', 'completed'] as const;
export const HEALTH_STATES = ['healthy', 'needs_attention', 'stalled'] as const;
export const COMPANY_STATUSES = ['active', 'archived'] as const;
export const INBOX_KINDS = ['task', 'idea', 'note', 'link', 'reminder'] as const;
export const INBOX_STATUSES = ['open', 'processed', 'dismissed'] as const;
export const RESOURCE_KINDS = ['link', 'document', 'other'] as const;
```

Dates: `date` columns are ISO strings (`YYYY-MM-DD`); timestamps are `Date`. Pure functions take
`today: string` / `now: Date` explicitly.

---

### Task 1: Project foundation ✅ (config, no tests)

- vite.config.ts uses adapter-node; drizzle.config.ts points at `src/lib/server/db/schema/index.ts`.
- `bunfig.toml` for `bun test` (preload nothing; tests are `src/**/*.test.ts`).
- Design tokens + global styles: `src/lib/styles/tokens.css`, `src/lib/styles/global.css`.
- `src/lib/utils/dates.ts` (tested): `toISODate`, `addDays`, `daysBetween`, `startOfWeek`,
  `formatDate`, `isOverdue`.
- Commit: `Chore: initialize SvelteKit project with tooling and design tokens`

### Task 2: Database foundation

**Files:** `src/lib/server/db/client.ts`, `src/lib/server/db/schema/{users,companies,areas,projects,milestones,tasks,notes,resources,events,activities,inbox-items,weekly-reviews,index}.ts`, `drizzle/0000_*.sql`

**Produces:** Drizzle tables + inferred row types (`Project`, `Task`, …) via `$inferSelect`.

Ownership: `users.id` (uuid = Supabase auth user id) → every table `user_id` FK cascade.
Indexes: `user_id`, `company_id`, `project_id`, `milestone_id`, `status`, `due_date`, `created_at`.

- Commit: `Feat: add database schema and initial migration`

### Task 3: Authentication (Supabase Auth, server-side only)

**Files:** `src/lib/server/auth/supabase.ts`, `src/hooks.server.ts`, `src/app.d.ts`,
`src/lib/features/auth/{auth.schema.ts,auth.service.ts}`, `src/lib/features/users/user.repository.ts`,
`src/routes/(auth)/login/+page.{server.ts,svelte}`, `src/routes/(auth)/signup/…`, `src/routes/auth/callback/+server.ts`, `src/routes/auth/signout/+server.ts`

**Produces:** `event.locals.user: { id, email, displayName }` for all `(app)` routes.
Unauthenticated access to `(app)` → redirect `/login`.

- Commit: `Feat: add Supabase authentication with login and signup`

### Task 4: Application shell

**Files:** `src/lib/components/layout/{AppShell,Sidebar,TopBar,NavLink}.svelte`,
`src/lib/components/ui/{Button,Card,Badge,Input,Textarea,Select,FormField,PageHeader,EmptyState}.svelte`,
`src/routes/(app)/+layout.{server.ts,svelte}`, `src/routes/+layout.svelte`, `src/routes/+error.svelte`

Sidebar: Dashboard, My Work, Projects, Companies, Inbox, Calendar, Weekly Review.
Desktop persistent sidebar; tablet collapsed icon rail; mobile drawer + top bar.

- Commit: `Feat: add application shell with responsive navigation`

### Task 5: Companies & Areas

**Files:** `src/lib/features/companies/{company.schema,company.repository,company.service,company.types}.ts`,
`src/lib/features/areas/{area.schema,area.repository,area.service}.ts`,
routes `(app)/companies`, `(app)/companies/new`, `(app)/companies/[id]`, `(app)/companies/[id]/edit`

Company page: overview (project counts by status), areas (inline add/remove), projects, activity.

- Commit: `Feat: add companies and areas`

### Task 6: Projects

**Files:** `src/lib/features/projects/{project.schema,project.repository,project.service,project.types,project.utils}.ts`,
`components/{ProjectCard,ProjectForm,ProjectHeader}.svelte`, routes `(app)/projects`, `/new`, `/[id]`, `/[id]/edit`

Also activities feature: `src/lib/features/activities/{activity.repository,activity.service}.ts`
with `logActivity(userId, {projectId?, companyId?, entityType, entityId, action, summary})`.

- Commit: `Feat: add projects with activity log`

### Task 7: Milestones (tested: progress)

`milestone.utils.ts`: `calculateMilestoneProgress(tasks) → { total, done, percent }`.
Tests: empty → 0%; 2/4 done → 50%; all done → 100%.
Managed inside the project page (create, complete, edit due date).

- Commit: `Feat: add milestones with progress calculation`

### Task 8: Tasks (tested: overdue, sorting)

`task.utils.ts`: `isTaskOverdue(task, today)`, `sortTasksForList(tasks, today)`.
Task rows with quick status toggle, inline create inside project page, edit page `/tasks/[id]`.

- Commit: `Feat: add tasks`

### Task 9: Project health (tested)

`src/lib/features/projects/project-health.ts`:
`calculateProjectHealth(input: HealthInput, today: string) → { state: HealthState; reasons: string[] }`.
Rules (thresholds exported as `HEALTH_THRESHOLDS`):

- not in-flight (idea/paused/completed/archived) → healthy, reason "Not in progress".
- stalled: inactive ≥ 14 days, or blocked ≥ 7 days without activity, or task overdue ≥ 14 days.
- needs_attention: any overdue task, inactive ≥ 7 days, status blocked, blocked tasks, overdue
  milestone, active with no next action and no open tasks.
- otherwise healthy.

- Commit: `Feat: add deterministic project health`

### Task 10: Dashboard + recommendations (tested)

`src/lib/features/tasks/task-recommendation.ts`:
`recommendTasks(candidates, today, limit) → RecommendedTask[]` with `score` and `reasons`.
`src/lib/features/dashboard/dashboard.service.ts`: `buildDashboardSummary(...)`.
Route `(app)/+page.server.ts` + widgets: Focus now, Needs attention, Overdue, Upcoming deadlines,
Active projects, Recent activity, Quick actions.

- Commit: `Feat: add dashboard with next-action recommendations`

### Task 11: My Work

Route `(app)/my-work` with sections Overdue / Today / Urgent / Next / Blocked and filter by
company / project / personal.

### Task 12: Inbox

`inbox.*` feature: quick capture form, list, convert to task (choose project), dismiss.

### Task 13: Calendar

`(app)/calendar`: month grid (desktop) / agenda list (mobile) of task due dates, milestone due
dates, project due dates and events; event create form.

### Task 14: Weekly Review (tested)

`review.utils.ts`: `buildWeeklySummary(data, weekStart)`; route `(app)/reviews` + `/[weekStart]`
with editable wins / problems / lessons / next-week priorities.

---

## Self-review checklist

- [ ] Every product.md section maps to a task above.
- [ ] Names in later tasks match earlier definitions (see vocabulary).
- [ ] `progress.md` updated after each task.
