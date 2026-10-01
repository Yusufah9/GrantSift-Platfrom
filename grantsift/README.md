# GrantSift

Analyze a grant funder, see what a real applicant needs, and build a working
application plan: readiness checklist, task-by-task SOP, and a downloadable
Excel workbook. Evidence comes from the funder's own site and from founders
who have publicly discussed winning that grant on YouTube — every claim is
labeled by source and never presented as more certain than it is.

## Stack
Next.js (App Router) · React · TypeScript · Supabase (Postgres, Auth, RLS)
· Google Gemini · YouTube Data API v3 · Tailwind CSS · Zod · React Hook Form
· SheetJS (xlsx) · Vercel

## Status
The core product, blog, and admin are complete: auth (email + Google),
project creation, the funder → YouTube → Gemini analysis pipeline,
readiness scoring, SOP generation, Excel export, a public blog with an
admin CRUD, and an admin user-management screen. Automated tests (unit +
integration) and a CI workflow are in place — see `## Testing` below.
Genuinely still open: E2E tests need to be run against a real deployment
(the harness is written, see `e2e/README.md`), and a full manual
accessibility/device pass before a public launch.

## Local setup
```bash
npm install
cp .env.example .env.local   # fill in the values below
npm run dev
```

## Environment variables
See `.env.example` for the full list. At minimum for local dev:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | Supabase project → Settings → API |
| `GEMINI_API_KEY` | Google AI Studio |
| `YOUTUBE_API_KEY` | Google Cloud Console → enable "YouTube Data API v3" |
| `GOOGLE_OAUTH_CLIENT_ID` / `SECRET` | Configured inside Supabase Auth → Providers → Google |

Missing a required variable fails fast with a clear message
(`GEMINI_API_KEY is not configured...`) instead of a cryptic runtime error —
see `src/lib/config.ts`.

## Supabase setup
1. Create a project at supabase.com.
2. Run the migrations in order: `supabase db push` (or paste each file in
   `supabase/migrations/` into the SQL editor, in filename order — `001`,
   `002`, `003`).
3. Enable the Google provider under Authentication → Providers.
4. Row Level Security is enabled by the migrations — every project-owned
   table is scoped to its owner automatically.
5. **Auth → URL Configuration** (this step is easy to miss and causes the
   Google sign-in redirect bug described below):
   - Set **Site URL** to `http://localhost:3000` for local dev (your real
     domain once deployed).
   - Add `http://localhost:3000/auth/callback` to **Redirect URLs** (and
     your production equivalent, e.g. `https://yourapp.com/auth/callback`,
     once deployed).
6. To make the first admin user: sign up normally through the app, then in
   the Supabase SQL editor run:
   ```sql
   update profiles set role = 'admin' where id = '<the user''s auth.users id>';
   ```
   There's no in-app way to self-promote to admin — that's intentional.

## Google OAuth setup (two places, both required)
Google sign-in fails in two different ways if either of these is missing:

**In Google Cloud Console** (APIs & Services → Credentials → your OAuth
client → Authorized redirect URIs), add:
```
https://<your-project-ref>.supabase.co/auth/v1/callback
```
This is Supabase's own callback, not GrantSift's. Find `<your-project-ref>`
in your Supabase project URL.

**In Supabase** (Authentication → Providers → Google), paste that same
client's Client ID and Client Secret.

If you see the browser land on `localhost:3000/?code=...` and then fail
with "site can't be reached" or "connection refused" after picking a Google
account, it means the redirect landed on the wrong place — check step 5
above (Redirect URLs) first; Supabase silently falls back to Site URL if
the exact callback URL isn't in that allow-list. If it instead shows an
explicit Google error page (`redirect_uri_mismatch`), that's the Google
Cloud Console step above. Also make sure `npm run dev` is actually still
running in a terminal when you test this — a stopped dev server produces
the same "connection refused" page.

## Email
All application emails (account confirmation links, password reset links, password updated notifications, and welcome emails) are delivered through Brevo:

- **Email Provider**: Brevo SMTP Relay (`smtp-relay.brevo.com:587`)
- **Credentials**:
  - `EMAIL_PROVIDER=brevo`
  - `BREVO_SMTP_SERVER=smtp-relay.brevo.com`
  - `BREVO_SMTP_PORT=587`
  - `BREVO_SMTP_USER=bc10e8001@smtp-brevo.com`
  - `BREVO_SMTP_KEY=your-brevo-smtp-key`
  - `EMAIL_FROM=GrantSift <bc10e8001@smtp-brevo.com>`
- **Fallback**: If `EMAIL_PROVIDER` is unset or credentials are missing in local dev, it logs cleanly to the terminal (`[email:noop] Would send...`) without crashing.

## Password reset
The emailed reset link carries a one-time session in the URL itself, which
only your browser can see — the reset-password page runs entirely
client-side for this reason (see `src/app/(auth)/reset-password/page.tsx`).
If a reset link is opened more than once, or after it's expired, the page
shows "This link has expired" and offers to send a new one, rather than
failing silently.

## Scripts
```bash
npm run dev        # local development
npm run build      # production build
npm run start      # run the production build
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm run test        # vitest (unit + in-memory integration tests)
npm run test:e2e    # Playwright — needs a live instance + real credentials, see e2e/README.md
```

## Testing
`npm test` runs 60+ unit tests (validation schemas, the SSRF guard, the
Excel workbook builder, markdown sanitization) and integration tests
against an in-memory Supabase fake (`src/test-utils/fake-supabase.ts`) for
the repository layer. None of this needs a real database or API keys, and
it runs in CI on every push. `npm run test:e2e` is real Playwright specs
against a running instance with real credentials — see `e2e/README.md` for
why that's not automated by default.

## CI
`.github/workflows/ci.yml` runs lint, typecheck, unit tests, and a
production build on every push and pull request, using placeholder
environment values (nothing is actually called at build time — every real
service call happens at request time behind `requireEnv()`).

## Deploying to Vercel
1. Push this repository to GitHub.
2. Import it in Vercel.
3. Add every variable from `.env.example` under Project Settings →
   Environment Variables.
4. Deploy. `npm run build` must succeed before a deployment is considered
   production ready.
     

