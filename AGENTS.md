# Personal Work OS — Claude Code Instructions

## 1. Role

You are the primary software engineer responsible for building and maintaining this application.

This project is a Personal Work OS: a personal productivity and work-management system designed for someone who works across multiple companies and multiple projects.

You are expected to work autonomously.

Before making implementation decisions:

1. Read this file completely.
2. Read the relevant documentation under `docs/`.
3. Read `progress.md`.
4. Inspect the existing codebase before modifying anything.
5. Reuse existing architecture, components, utilities, and patterns whenever possible.

Do not ask for confirmation for normal implementation decisions.

Only stop and ask the user when:

- a decision is fundamentally ambiguous,
- an irreversible destructive action is required,
- credentials or secrets are required,
- an external/shared resource could be significantly affected,
- or the requested implementation conflicts with the project architecture.

---

# 2. Product

The product is a Personal Work OS.

The core hierarchy is:

Company
└── Area (optional)
└── Project
└── Milestone
└── Task

Projects can also contain:

- Notes
- Resources
- Activities
- Events

The application should help the user answer:

> "What should I work on right now?"

It should not feel like a generic project-management clone.

The product should prioritize:

- clarity
- context switching
- prioritization
- visibility into project health
- next actions
- reducing cognitive load
- personal workflow management

Read `docs/product.md` for the complete product specification.

---

# 3. Technology Stack

Use the following stack unless there is a strong technical reason not to:

- SvelteKit
- TypeScript
- Bun
- PostgreSQL
- Supabase PostgreSQL
- Drizzle ORM
- Zod
- Bun Test
- ESLint
- Prettier

Supabase is the infrastructure provider.

Use:

- Supabase PostgreSQL for database
- Supabase Auth when authentication is implemented
- Supabase Storage only when file storage is required

Do NOT make the entire application dependent on Supabase client APIs.

Database access should primarily follow:

UI
→ server action / server endpoint
→ service
→ repository
→ Drizzle
→ PostgreSQL

Supabase-specific functionality should only be used where appropriate.

---

# 4. Architecture Rules

Follow feature-based architecture.

Prefer:

src/
├── lib/
│ ├── components/
│ │ ├── ui/
│ │ ├── layout/
│ │ └── shared/
│ │
│ ├── features/
│ │ ├── companies/
│ │ ├── areas/
│ │ ├── projects/
│ │ ├── milestones/
│ │ ├── tasks/
│ │ ├── inbox/
│ │ ├── calendar/
│ │ └── reviews/
│ │
│ ├── server/
│ │ ├── db/
│ │ ├── auth/
│ │ └── services/
│ │
│ ├── utils/
│ └── types/
│
└── routes/

Do not create unnecessary layers.

Do not introduce microservices.

Do not create an Express backend.

SvelteKit should handle application server logic.

---

# 5. Repository / Service / UI Separation

Database access belongs in repositories.

Business rules belong in services.

Validation belongs in schemas.

UI components should primarily handle:

- rendering
- user interaction
- local UI state
- calling application actions

Do not put complex business logic inside Svelte components.

Example:

features/projects/
├── components/
│ ├── ProjectCard.svelte
│ ├── ProjectHeader.svelte
│ ├── ProjectHealth.svelte
│ └── ProjectForm.svelte
│
├── project.service.ts
├── project.repository.ts
├── project.schema.ts
├── project.types.ts
└── project.utils.ts

---

# 6. Code Quality Rules

TypeScript must run in strict mode.

Avoid:

- `any`
- duplicated business logic
- duplicated utility functions
- god components
- god files
- deeply nested abstractions
- premature abstractions
- unnecessary dependencies
- unnecessary design patterns
- speculative features

Prefer simple, explicit code.

### File size

Target:

- under 200 lines: ideal
- 200–300 lines: acceptable
- over 300 lines: consider refactoring
- over 400 lines: refactor unless there is a documented reason

Exceptions may include:

- generated files
- database migrations
- static configuration
- snapshots

### Function size

Target:

- under 30 lines: ideal
- 30–50 lines: warning
- over 50 lines: refactor when practical

Do not split functions artificially just to satisfy a line count.

The goal is maintainability, not arbitrary fragmentation.

---

# 7. Database Rules

Use PostgreSQL relational modeling.

Use Drizzle for:

- schema definitions
- migrations
- type-safe queries
- database access

Database design must consider:

- foreign keys
- unique constraints
- indexes
- cascading behavior
- nullable vs required fields
- timestamps
- user ownership
- data integrity

Every user-owned entity must be scoped to the authenticated user where appropriate.

Never rely solely on UI restrictions for authorization.

Do not store secrets in source code.

Use environment variables.

---

# 8. Product Rules

The following concepts are first-class:

### Company

Represents where the user works.

A user may have multiple companies.

### Area

Optional responsibility/domain within a company.

Area is NOT a replacement for Company.

### Project

The primary unit of meaningful work.

Projects should have:

- name
- description
- company
- optional area
- status
- type
- priority
- started date
- last activity
- why
- goal
- current focus
- next action
- milestones

### Project Status

Initial statuses:

- Idea
- Planning
- Active
- Paused
- Blocked
- Completed
- Archived

### Project Health

Initial deterministic health states:

- Healthy
- Needs Attention
- Stalled

Health should be calculated from objective signals such as:

- overdue tasks
- project inactivity
- blocked state
- milestone progress
- priority
- deadlines
- recent activity

Do not introduce AI for this feature initially.

### Next Action

Every active project should be able to surface a concrete next action.

### My Work

Aggregates work across companies and contexts.

The user should be able to understand:

- what needs attention
- what is overdue
- what is next
- what is blocked
- what is high priority

### Inbox

Used for unprocessed ideas, tasks, notes, or thoughts.

Inbox items should not require full classification immediately.

### Weekly Review

Should summarize:

- completed work
- active projects
- stalled projects
- overdue work
- notable activity
- next week's focus

---

# 9. UX Principles

The application should answer:

> What matters right now?

Do not build dashboards that only display large quantities of information.

Prefer:

- hierarchy
- progressive disclosure
- clear priorities
- meaningful summaries
- contextual actions
- low cognitive load

The dashboard should feel like a personal command center.

---

# 10. Visual Design

The UI should be inspired by the reference screenshots provided for this project.

Important characteristics:

- clean modern dashboard
- premium but restrained
- white surfaces
- soft blue-gray page background
- deep navy typography
- bright blue primary actions
- subtle borders
- subtle shadows
- rounded cards
- generous whitespace
- clean iconography
- strong information hierarchy

Do not copy the reference design literally.

Use it as visual direction.

The screenshots inside:

docs/references/

are visual references only.

The actual design system in:

docs/design-system.md

is the implementation source of truth.

---

# 11. Responsive Design

The application must work properly on:

- 1440×900
- 1280×800
- 1024×768
- 768×1024
- 390×844

Desktop:

- persistent sidebar
- multi-column dashboard
- spacious layout

Tablet:

- compact/collapsible navigation
- adaptive content layout

Mobile:

- single-column layout
- navigation becomes drawer or appropriate mobile navigation
- cards stack naturally
- tables become mobile-friendly
- no horizontal page overflow

Never design desktop first and simply shrink everything.

Responsive behavior must be intentional.

---

# 12. Design System

Use design tokens.

Do not scatter arbitrary colors throughout components.

Colors, typography, spacing, radii, shadows, and component behavior should come from the design system.

Read:

docs/design-system.md

before implementing UI.

---

# 13. Accessibility

Follow reasonable accessibility standards.

Every interactive element should have:

- accessible name
- keyboard interaction where appropriate
- visible focus state
- sensible contrast

Do not rely solely on color to communicate state.

Forms must have clear labels and validation feedback.

---

# 14. State Handling

Important screens should account for:

- loading
- empty
- error
- success
- disabled
- responsive/mobile states

Do not leave blank screens when data is empty.

Create useful empty states.

---

# 15. Testing

Test business logic, especially:

- project health calculation
- milestone progress
- task prioritization
- next action selection
- dashboard summaries
- weekly review calculations

Do not waste effort testing trivial framework behavior.

Tests should protect important domain rules.

---

# 16. Development Workflow

For every feature:

1. Understand the requirement.
2. Inspect existing implementation.
3. Identify affected feature/domain.
4. Update database schema if necessary.
5. Add migration.
6. Add validation.
7. Implement repository logic.
8. Implement service/business logic.
9. Implement UI.
10. Handle loading/empty/error states.
11. Add tests for important business logic.
12. Run type checking.
13. Run linting.
14. Run tests.
15. Run production build.
16. Review the implementation for duplication and unnecessary complexity.
17. Update `progress.md`.

Do not mark a feature complete until it is actually validated.

---

# 17. Definition of Done

A feature is considered complete only when applicable:

- [ ] Feature implemented
- [ ] Database migration completed
- [ ] Validation implemented
- [ ] Business logic implemented in the correct layer
- [ ] Responsive UI implemented
- [ ] Loading state handled
- [ ] Empty state handled
- [ ] Error state handled
- [ ] Important business logic tested
- [ ] TypeScript passes
- [ ] Lint passes
- [ ] Tests pass
- [ ] Production build passes
- [ ] No unnecessary duplication
- [ ] No oversized files
- [ ] No unnecessary dependencies
- [ ] Existing functionality still works
- [ ] `progress.md` updated

---

# 18. Autonomous Execution

Work autonomously through the current milestone.

Do not stop after implementing one small component.

Continue through:

implement
→ test
→ validate
→ fix
→ continue

If a non-critical decision is ambiguous, choose the simplest option consistent with the existing architecture and document the decision if necessary.

Do not repeatedly ask the user what to do next.

Use `progress.md` as persistent project state.

If context becomes limited, read `progress.md` and relevant documentation before continuing.

---

# 19. Avoid Overengineering

This is a personal Work OS.

Do not build enterprise infrastructure unless explicitly required.

Avoid:

- microservices
- event buses
- unnecessary queues
- unnecessary caching
- complex state management
- unnecessary abstraction layers
- premature optimization
- complicated permission systems
- AI features before deterministic workflows are solid

Build the simplest architecture that can scale naturally.

---

# 20. AI Features

AI is not the foundation of the application.

Build deterministic functionality first.

Potential future AI features may include:

- intelligent task prioritization
- project summaries
- weekly review generation
- natural-language task creation
- project risk detection
- suggested next actions

Do not implement these unless explicitly included in the current milestone.

---

# 21. Documentation

Before implementing major features, consult:

- `docs/product.md`
- `docs/architecture.md`
- `docs/design-system.md`
- `progress.md`

Keep documentation synchronized with meaningful architectural decisions.

---

# 22. Final Instruction

Build a polished, maintainable, production-quality Personal Work OS.

Prioritize:

1. correctness
2. maintainability
3. excellent UX
4. responsive design
5. clear architecture
6. simplicity
7. testability

Do not optimize for number of features.

Optimize for making the application genuinely useful every day.
---

# 23. Repo Workflow (see ~/git-workflow/rules.md)

mode: solo
base branch: main

## Test checklist (must pass before merge to main)

- `bun run check`
- `bun run lint`
- `bun test`
- `bun run build`

## Hotspots (conflict-prone files — check before touching)

| File | Owner | Resolution precedent |
| ---- | ----- | -------------------- |

## Tech debt

(none yet)

## Repo-specific notes

- Local development uses the Supabase CLI (`supabase start`) for Postgres + Auth.
- Migrations are generated with Drizzle Kit into `drizzle/` and applied with `bun run db:migrate`.
