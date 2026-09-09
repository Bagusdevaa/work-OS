# Personal Work OS — Architecture

## Stack

Frontend / Application:

- SvelteKit
- Svelte
- TypeScript

Runtime:

- Bun

Database:

- PostgreSQL
- Supabase

ORM:

- Drizzle

Validation:

- Zod

Testing:

- Bun Test

Code Quality:

- ESLint
- Prettier

---

# High-Level Architecture

Browser
↓
SvelteKit
↓
Server Actions / Server Routes
↓
Service Layer
↓
Repository Layer
↓
Drizzle
↓
Supabase PostgreSQL

Supabase Auth may be used for authentication.

Supabase Storage may be used when file storage becomes necessary.

---

# Architectural Principles

## 1. SvelteKit First

Do not create a separate Express backend.

SvelteKit provides:

- routing
- server-side logic
- server actions
- API endpoints
- rendering

---

## 2. Feature-Based Organization

Organize domain code by feature.

Example:

src/lib/features/projects/

├── components/
├── project.service.ts
├── project.repository.ts
├── project.schema.ts
├── project.types.ts
└── project.utils.ts

---

# Database Domain

Initial entities:

users
companies
areas
projects
milestones
tasks
notes
resources
events
activities
weekly_reviews
inbox_items

---

# Ownership

User-owned entities should contain appropriate ownership relationships.

Example:

users
↓
companies
↓
projects
↓
milestones
↓
tasks

Do not assume UI-level filtering provides security.

Authorization must be enforced server-side.

---

# Repository Layer

Repositories are responsible for database access.

Examples:

- findProjects()
- findProjectById()
- createProject()
- updateProject()
- deleteProject()

Repositories should not contain UI logic.

Repositories should not contain presentation concerns.

---

# Service Layer

Services contain business rules.

Examples:

- calculateProjectHealth()
- calculateMilestoneProgress()
- getRecommendedNextActions()
- generateDashboardSummary()

Services may call repositories.

Services should be testable independently from the UI.

---

# Validation

Use Zod for user input validation.

Validate:

- forms
- server actions
- API inputs
- important external data

Never trust client input.

---

# Database Migrations

All schema changes must use migrations.

Never manually modify production schema without a migration.

Migrations must be committed to version control.

---

# Indexing

Add indexes based on actual query patterns.

Likely indexed fields include:

- user_id
- company_id
- project_id
- milestone_id
- status
- priority
- due_date
- created_at
- updated_at

Do not blindly index every column.

---

# Performance

Do not optimize prematurely.

First optimize:

- unnecessary database queries
- N+1 queries
- excessive client-side data loading
- unnecessary rendering
- large unbounded lists

Use pagination when data can become large.

---

# Security

Never commit:

- Supabase service keys
- database passwords
- API keys
- tokens
- secrets

Use environment variables.

Example:

DATABASE_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=

Server-only secrets must never be exposed to the browser.

---

# Testing Strategy

Prioritize domain/business logic tests.

High-value tests:

- project health
- milestone progress
- task recommendation
- overdue calculation
- dashboard summary
- weekly review calculations

Do not create tests solely to increase coverage percentage.

---

# Architectural Anti-Patterns

Avoid:

- business logic inside UI components
- direct database calls from components
- duplicated queries
- duplicated validation
- giant utility files
- giant components
- unnecessary global state
- unnecessary stores
- unnecessary API layers
- microservices
- premature caching
- premature AI integration
