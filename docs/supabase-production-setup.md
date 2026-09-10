# Moving Work OS onto a hosted Supabase project

These are the steps only you can do — they need your Supabase account, a database password and
your deployment host. Everything else is already in the repo.

Budget about 30 minutes. Work top to bottom; each step says how to tell it worked.

> Supabase changes its dashboard wording from time to time. Where a label below does not match what
> you see, look for the nearest equivalent in the same settings area — the concepts are stable even
> when the words move.

---

## 1. Create the project

1. Go to <https://supabase.com/dashboard> and create a new project.
2. **Name:** `work-os` (anything you like).
3. **Region:** pick the one closest to you — Singapore (`ap-southeast-1`) is the nearest to Bali.
4. **Database password:** generate a strong one and **save it in your password manager now**.
   Supabase shows it once. You will paste it into the connection string in step 2.

Wait for provisioning to finish (a minute or two).

---

## 2. Copy the database connection string

1. Open **Project Settings → Database → Connection string**.
2. Choose the **Session pooler** connection (port `5432`), URI format.
3. Copy it. It looks like:

   ```
   postgresql://postgres.<project-ref>:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
   ```

4. Replace `[YOUR-PASSWORD]` with the password from step 1.
   If the password contains `@ : / ? # [ ] %`, URL-encode those characters (e.g. `@` → `%40`).

**Why the session pooler:** it works over IPv4 without an add-on, and it supports both the app and
`drizzle-kit` migrations from one string. The direct connection (`db.<ref>.supabase.co`) is
IPv6-only on new projects unless you buy the IPv4 add-on. The transaction pooler (port `6543`) works
for the running app — `src/lib/server/db/client.ts` already sets `prepare: false` for it — but can
trip up migrations, so stick to the session pooler unless you have a reason not to.

---

## 3. Copy the API URL and key

1. Open **Project Settings → API**.
2. Copy the **Project URL** (`https://<project-ref>.supabase.co`).
3. Copy the **anon / public** key. On newer projects this may be called the **publishable** key —
   take that one. **Never** take the `service_role` / secret key: this app does not use it, and it
   bypasses every access rule.

---

## 4. Fill in `.env`

Edit `.env` in the project root (it is gitignored — never commit it):

```sh
DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<anon or publishable key>
```

Keep a copy of the old local values somewhere if you still want to run against `supabase start`.

**Check:** `bun run dev` starts without the "DATABASE_URL is not set" error.

---

## 5. Create the schema

```sh
bun run db:migrate
```

This applies `drizzle/0000_initial_schema.sql` plus every later migration to the hosted database.

**Check:** in the dashboard, **Table Editor** shows the 12 tables (`companies`, `areas`, `projects`,
`milestones`, `tasks`, `notes`, `resources`, `events`, `inbox_items`, `weekly_reviews`, `activities`,
`users`).

---

## 6. Point Auth at your site

Open **Authentication → URL Configuration**.

1. **Site URL:** your real address — `https://work-os.yourdomain.com`.
   While you are still testing locally, `http://localhost:5173` is fine.
2. **Redirect URLs:** add every callback address the app uses. Sign-in links carry query strings
   (`?code=…`, `?next=…`, `?type=recovery`), so include the wildcard forms:

   ```
   https://work-os.yourdomain.com/auth/callback
   https://work-os.yourdomain.com/auth/callback?**
   http://localhost:5173/auth/callback
   http://localhost:5173/auth/callback?**
   ```

**Check:** step 9 tests this. A wrong list shows up as a sign-in link dropping you on the site root
or on `/login?error=auth` instead of signing you in.

---

## 7. Turn on email confirmation and match the password rule

Open **Authentication → Sign In / Providers → Email**.

1. **Confirm email:** ON. New signups then have to click a link before they can sign in — the signup
   page already renders the "check your email" state for this.
2. **Minimum password length:** `8`, to match the Zod rule in
   `src/lib/features/auth/auth.schema.ts`. (Leave it lower and Supabase will accept a password the
   app's own form rejects.)

---

## 8. Set up real email delivery

**Do this before you rely on password reset or magic links.** Supabase's built-in email sender is
meant for testing only and is rate-limited to a handful of messages per hour, shared across your
whole project. Reset and magic-link emails will silently stop arriving once you cross it.

Open **Project Settings → Authentication → SMTP Settings** and point it at a real provider — Resend,
Postmark, Amazon SES and Mailgun all work. You will need:

- SMTP host, port, username, password from the provider
- a sender address on a domain you have verified with that provider

**Check:** step 9 emails arrive within a few seconds, from your own sender address.

---

## 9. Verify the whole flow

Run the app against the hosted project (`bun run dev`, or your deployment) and walk through:

- [ ] **Sign up** with a real address → "check your email" screen → confirmation link signs you in.
- [ ] **Sign out**, then **sign in** with the password.
- [ ] **Forgot password** → the email arrives → the link opens `/reset-password` (not `/login`) →
      set a new password → "Password updated".
- [ ] **Sign in with the new password.**
- [ ] **Email me a sign-in link** on the login page → the link signs you in.
- [ ] Create a company, a project and a task → reload → the data is still there.
- [ ] **Table Editor → tasks** shows the row you just created.

If a link bounces you to `/login?error=auth`, the code exchange failed. The usual causes: the
redirect URL is not on the allow list (step 6), the link was already used, or you opened it in a
different browser from the one that requested it. Request a fresh link and open it in the same
browser.

---

## 10. Deploying

The build uses `@sveltejs/adapter-node`:

```sh
bun run build
node build          # serves on PORT, default 3000
```

On your host, set these environment variables:

| Variable            | Value                                                      |
| ------------------- | ---------------------------------------------------------- |
| `DATABASE_URL`      | the session-pooler string from step 2                      |
| `SUPABASE_URL`      | the project URL from step 3                                |
| `SUPABASE_ANON_KEY` | the anon / publishable key from step 3                     |
| `ORIGIN`            | `https://work-os.yourdomain.com` — your real public origin |
| `PORT`              | whatever your host expects (often set for you)             |

**`ORIGIN` is not optional.** Every screen in this app saves through SvelteKit form actions, and
adapter-node rejects cross-site POSTs. Without a correct `ORIGIN` every save fails with
`Cross-site POST form submissions are forbidden`, while the pages themselves still load — so the app
looks fine until you try to change anything.

Then go back to step 6 and make sure the Site URL and redirect URLs use the deployed address.

---

## Notes

- `supabase/config.toml` configures the **local** stack only; the dashboard settings above are what
  the hosted project uses. The two are kept deliberately similar so local behaviour matches
  production — except `enable_confirmations`, which stays `false` locally so you are not chasing
  confirmation emails during development.
- To keep developing locally, keep the old local values and switch `.env` back; `supabase start`
  still works exactly as before.
- Migrations are forward-only. Generate new ones with `bun run db:generate` after changing the
  schema, and apply them with `bun run db:migrate`.
