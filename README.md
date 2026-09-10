# Personal Work OS

A personal command center for managing work across multiple companies and projects.
It exists to answer one question: **"What should I work on right now?"**

See `AGENTS.md` for engineering rules, `docs/` for the product, architecture and
design-system specs, and `progress.md` for the current project state.

## Stack

SvelteKit · Svelte 5 · TypeScript (strict) · Bun · PostgreSQL (Supabase) · Drizzle ORM · Zod

## Getting started

```sh
bun install
cp .env.example .env        # fill in DATABASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY
bun run db:migrate          # apply migrations
bun run dev
```

### Local development with Supabase CLI

```sh
supabase start              # local Postgres + Auth on Docker
supabase status             # prints DB URL, API URL and anon key for .env
```

### Hosted Supabase

See `docs/supabase-production-setup.md` for the step-by-step move onto a hosted
Supabase project (connection string, auth URLs, email delivery, deployment env vars).

## Scripts

| Script                | Purpose                              |
| --------------------- | ------------------------------------ |
| `bun run dev`         | Start the dev server                 |
| `bun run build`       | Production build (adapter-node)      |
| `bun run preview`     | Preview the production build         |
| `bun run check`       | Type-check with svelte-check         |
| `bun run lint`        | Prettier check + ESLint              |
| `bun run format`      | Format with Prettier                 |
| `bun test`            | Run unit tests (Bun test)            |
| `bun run db:generate` | Generate a migration from the schema |
| `bun run db:migrate`  | Apply migrations                     |
| `bun run db:studio`   | Open Drizzle Studio                  |
