# End-to-end tests

These run against a real, running instance of GrantSift — either
`npm run dev` locally or a staging deployment — with a real Supabase
project, Gemini key, and YouTube key behind it. They are **not** run by
`npm test` or by the CI workflow in `.github/workflows/ci.yml`, because
they need live secrets that don't belong in this repository or in a
public CI run without configuration.

## One-time setup

```bash
npm install
npx playwright install --with-deps chromium
```

## Required environment

| Variable | Purpose |
|---|---|
| `E2E_BASE_URL` | Where the app is running. Defaults to `http://localhost:3000`. |
| `E2E_TEST_EMAIL` / `E2E_TEST_PASSWORD` | A real account these tests can sign up/log in with. Use a disposable test account, not a real user. |

Each spec skips itself with a clear message (rather than failing) when the
credentials it needs aren't set, so a partial `.env` doesn't break the
whole run.

## Running

```bash
npm run dev            # in one terminal — must stay running
E2E_TEST_EMAIL=test@example.com E2E_TEST_PASSWORD=correcthorse1 npm run test:e2e
```

## What's covered

- `smoke.spec.ts` — the public site (landing, footer links, blog index)
  loads without a login and without console errors.
- `auth.spec.ts` — sign up, log out, log back in, and the forgot-password
  request flow (not the emailed link itself, which needs a real inbox).
- `project-lifecycle.spec.ts` — log in, create a project, and confirm the
  page it lands on shows the funder and organization fields just entered.
  Does **not** run the full analysis pipeline (that costs real Gemini/
  YouTube API quota) — see the note in that file for how to extend it.

## What's intentionally not covered here

Running the live funder → YouTube → Gemini pipeline end-to-end costs real
API quota and depends on a specific funder actually having YouTube
coverage, so it isn't a good fit for a repeatable CI-style check. Test it
manually against a funder you know has recipient videos before every
release, and consider a mocked-Gemini variant if you want it automated.

