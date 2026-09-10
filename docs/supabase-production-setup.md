# Taking Work OS live: hosted Supabase + Vercel

These are the steps only you can do — they need your Supabase account, your Vercel account, a
database password and DNS access for `bagusdeva.com`. Everything in the repo is already prepared.

Budget about an hour end to end. Work top to bottom; each step says how to tell it worked.

Two assumptions, both easy to change:

- The app will live at **`work.bagusdeva.com`**. Substitute your own subdomain everywhere below.
- Your Supabase region is **Singapore (`ap-southeast-1`)**, the closest to Bali.

### Where you are now (2026-09-11)

Already done — skip these: **1** (project `nwjnszmvlfxjhebllvuo` exists), **3** and most of **9**
(the Vercel project `work-os` is linked to the GitHub repo, `SUPABASE_URL` / `SUPABASE_ANON_KEY` /
`DATABASE_URL` are set, and the production deployment is live at
`https://work-os-two-kappa.vercel.app`), and **5** (the schema was applied through the Supabase MCP
and verified column-for-column against the local database; drizzle's migration journal was written
to match, so `bun run db:migrate` will correctly skip it).

Still to do: **2/4** only if you want to run migrations or local dev against the hosted database,
then **6, 7, 8, 10, 11, 12**. Step 6 is the blocker — until the redirect URLs are set, every
confirmation, reset and magic link will bounce.

> Supabase and Vercel both reword their dashboards from time to time. Where a label does not match
> what you see, look for the nearest equivalent in the same settings area — the concepts are stable
> even when the words move.

---

## 1. Create the Supabase project

1. Go to <https://supabase.com/dashboard> and create a new project.
2. **Name:** `work-os` (anything you like).
3. **Region:** Singapore (`ap-southeast-1`).
4. **Database password:** generate a strong one and **save it in your password manager now**.
   Supabase shows it once, and you need it in step 2.

Wait for provisioning to finish (a minute or two).

---

## 2. Copy the two connection strings

Open **Project Settings → Database → Connection string**, URI format. You need **both** poolers,
because the app and the migration tool want different things:

| Use                             | Which                  | Port   |
| ------------------------------- | ---------------------- | ------ |
| The app running on Vercel       | **Transaction pooler** | `6543` |
| `bun run db:migrate`, local dev | **Session pooler**     | `5432` |

Copy both. They look like:

```
# transaction pooler — for Vercel
postgresql://postgres.<ref>:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require

# session pooler — for migrations and local dev
postgresql://postgres.<ref>:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require
```

Replace `[PASSWORD]` with the password from step 1. If it contains `@ : / ? # [ ] %`, URL-encode
those characters (`@` → `%40`). Keep `?sslmode=require` on the end of both — Supabase requires TLS,
and without it the connection is refused.

**Why two.** Vercel runs the app as serverless functions: many short-lived instances, each opening
its own connections. The transaction pooler is built for exactly that and hands a connection back
after every transaction — `src/lib/server/db/client.ts` already sets `prepare: false` and a small
pool to suit it. That same pooler mangles the prepared statements and DDL that `drizzle-kit` uses,
so migrations go through the session pooler instead. The direct connection
(`db.<ref>.supabase.co`) is IPv6-only on new projects and Vercel cannot reach it at all.

---

## 3. Copy the API URL and key

1. Open **Project Settings → API**.
2. Copy the **Project URL** (`https://<ref>.supabase.co`).
3. Copy the **anon / public** key — on newer projects it may be called the **publishable** key.
   **Never** take the `service_role` / secret key: this app does not use it, and it bypasses every
   access rule in the database.

---

## 4. Point your local `.env` at the hosted project

Edit `.env` in the project root (it is gitignored — never commit it):

```sh
DATABASE_URL=<the session pooler string from step 2>
SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_ANON_KEY=<anon or publishable key>
```

Keep the old local values in a scratch file if you still want to run against `supabase start` —
you will want them for development.

**Check:** `bun run dev` starts with no "DATABASE_URL is not set" error.

---

## 5. Create the schema

```sh
bun run db:migrate
```

This applies `drizzle/0000_initial_schema.sql` and every later migration to the hosted database.

**Check:** the dashboard's **Table Editor** shows the 12 tables (`companies`, `areas`, `projects`,
`milestones`, `tasks`, `notes`, `resources`, `events`, `inbox_items`, `weekly_reviews`,
`activities`, `users`).

---

## 6. Point Auth at your site

Open **Authentication → URL Configuration**.

1. **Site URL:** `https://work.bagusdeva.com`
2. **Redirect URLs:** sign-in links carry query strings (`?code=…`, `?next=…`, `?type=recovery`),
   so add the wildcard forms too:

   ```
   https://work.bagusdeva.com/auth/callback
   https://work.bagusdeva.com/auth/callback?**
   http://localhost:5173/auth/callback
   http://localhost:5173/auth/callback?**
   ```

   Keep the `localhost` entries — they are what let you test auth locally.

**Check:** step 11 exercises this. A wrong list shows up as a sign-in link dropping you on the site
root or on `/login?error=auth` instead of signing you in.

---

## 7. Turn on email confirmation and match the password rule

Open **Authentication → Sign In / Providers → Email**.

1. **Confirm email:** ON. New signups then have to click a link before they can sign in; the signup
   page already renders the "check your email" state for this.
2. **Minimum password length:** `8`, matching the Zod rule in
   `src/lib/features/auth/auth.schema.ts`. Leave it lower and Supabase will accept a password the
   app's own form rejects.

---

## 8. Set up real email delivery

**Do this before you rely on password reset or magic links.** Supabase's built-in sender is for
testing only and is rate-limited to a handful of messages per hour across the whole project. Reset
and sign-in emails simply stop arriving once you cross it, with no error shown to you.

Open **Project Settings → Authentication → SMTP Settings** and point it at a real provider — Resend,
Postmark, Amazon SES and Mailgun all work. You will need:

- SMTP host, port, username and password from the provider
- a sender address on a domain you have verified with them (`no-reply@bagusdeva.com` is natural,
  since you already own the domain)

**Check:** the emails in step 11 arrive within seconds, from your own sender address.

---

## 9. Deploy to Vercel

The repo is configured for Vercel: `@sveltejs/adapter-vercel`, runtime pinned to `nodejs24.x`.

1. Go to <https://vercel.com/new> and import `Bagusdevaa/work-OS` from GitHub.
2. **Framework preset:** SvelteKit (Vercel detects it). Leave the build and output settings alone.
   Vercel sees `bun.lock` and installs with Bun; if it picked npm instead, set the install command
   to `bun install`.
3. **Environment variables** — add all three, for every environment (Production, Preview,
   Development):

   | Variable            | Value                                           |
   | ------------------- | ----------------------------------------------- |
   | `DATABASE_URL`      | the **transaction pooler** string (port `6543`) |
   | `SUPABASE_URL`      | `https://<ref>.supabase.co`                     |
   | `SUPABASE_ANON_KEY` | the anon / publishable key                      |

   Note this is the _other_ connection string from the one in your local `.env`.

4. Deploy.

There is no `ORIGIN` variable to set — that was only needed by the Node adapter this project used
before. Vercel handles it.

**Check:** the deployment succeeds and the `*.vercel.app` URL shows the login page.

**If you change an environment variable later, redeploy.** Vercel bakes them in at build time;
editing a variable does nothing until the next deployment.

---

## 10. Attach the subdomain

1. In the Vercel project: **Settings → Domains → Add**, enter `work.bagusdeva.com`.
2. Vercel shows a DNS record to create — normally a **CNAME** for `work` pointing at
   `cname.vercel-dns.com`. **Use whatever value Vercel shows you**, not the one written here.
3. Add that record at whoever hosts DNS for `bagusdeva.com`.
4. Wait for Vercel to report the domain as valid. DNS usually settles in minutes, occasionally an
   hour. The TLS certificate is issued automatically once it does.

**Check:** `https://work.bagusdeva.com` loads the login page over HTTPS.

Now go back to **step 6** and confirm the Site URL and redirect URLs use this address.

---

## 11. Verify the whole thing

On `https://work.bagusdeva.com`, walk through:

- [ ] **Sign up** with your real address → "check your email" → the confirmation link signs you in.
- [ ] **Sign out**, then **sign in** with your password.
- [ ] **Forgot password** → the email arrives → the link opens `/reset-password` (not `/login`) →
      set a new password → "Password updated" → sign in with it.
- [ ] **Email me a sign-in link** on the login page → the link signs you in.
- [ ] Create a company, a project and a task → reload → the data is still there.
- [ ] Open the project, switch task order to **Manual**, drag a task and reload — the order held.
- [ ] Complete a project, find it under **Archived**, restore it.
- [ ] **Calendar → Week**, page back and forward, switch to Month.
- [ ] Open the site on your phone — no sideways scrolling on any page.
- [ ] Supabase **Table Editor → tasks** shows the row you created.

If a link bounces you to `/login?error=auth`, the code exchange failed. Usual causes: the redirect
URL is not on the allow list (step 6), the link was already used, or you opened it in a different
browser from the one that requested it. Request a fresh link and open it in the same browser.

---

## 12. Lock it down

**Do this once your own account exists — it is the step that makes the app actually private.**

Until now anyone who finds `work.bagusdeva.com` can register. Their data would be separate from
yours (every query is scoped by `user_id`), but they would still have accounts on your app.

Open **Authentication → Sign In / Providers → Email** and turn **Allow new users to sign up** OFF.

**Check:** open `/signup` in a private window, try to register, and the attempt is refused. You can
still sign in, reset your password and use magic links; only new registrations are blocked. Turn it
back on for as long as it takes if you ever need another account.

---

## Afterwards

- **Deployments are automatic.** Vercel builds every push to `main`, and gives every other branch a
  preview URL. Preview deployments share the same database, so treat them as live data.
- **Backups.** Supabase's free tier keeps only a short backup window. If this becomes where your
  work lives, take your own dumps:
  `pg_dump "<session pooler string>" -Fc -f work-os-$(date +%F).dump`
- **Local development still works** — swap `.env` back to the `supabase start` values.
- **Schema changes:** `bun run db:generate` after editing the schema, then `bun run db:migrate`
  against the session pooler. Migrations are forward-only.
- `supabase/config.toml` configures the **local** stack only. The dashboard settings above are what
  the hosted project uses. The two are kept deliberately close, except `enable_confirmations`, which
  stays off locally so you are not chasing confirmation emails while developing.
