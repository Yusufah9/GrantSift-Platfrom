# GrantSift architecture

## Layers
```
app/            Next.js routes — composition only, no business logic
components/     Presentational UI, grouped by domain
lib/services/   Business logic (ProjectService, ReadinessService, SopService...)
lib/repositories/  Supabase data access, one per aggregate
lib/ai/         GeminiService — the only place that calls the Gemini API
lib/youtube/    YouTubeDiscoveryService — the only place that calls YouTube's API
lib/validation/ Zod schemas shared by client forms and server routes
lib/errors/     AppError + typed error codes + ApiResponse envelope
lib/supabase/   Browser / server / admin Supabase client factories
```

## Sourcing pipeline (updated for funder-first input)
```
Funder URL or pasted requirements
   -> FunderSourceService.fetchFunderProfile()      (validated fetch, SSRF-safe)
   -> YouTubeDiscoveryService.findGrantWinnerVideos() (search, not a proxy)
   -> transcript retrieval per verified video
   -> GeminiService extraction/classification passes (fast tier)
   -> GeminiService synthesis pass (synthesis tier)
   -> insights persisted with source_id + trust label (never fabricated)
```
Each stage writes a `processing_jobs` row (`pending -> processing -> completed
| failed | partially_completed`) so status is observable end to end.

## Data access
Three Supabase clients:
- **Browser client** (anon key) — used in client components, respects RLS.
- **Server client** (anon key, cookie-bound) — used in server components and
  route handlers acting as the logged-in user, respects RLS.
- **Admin client** (service role key) — server-only, used only for
  operations RLS cannot express (e.g. cross-user admin views). Never
  imported into any file under `components/` or any client bundle.

## AI pipeline design
`GeminiService.generateStructured` always takes a Zod schema. A response
that fails validation is retried, not stored — GrantSift never persists a
malformed AI result. Two model tiers: `fast` for classification/extraction,
`synthesis` for the final readiness/narrative synthesis, per the PRD's cost
control section.

## Security
- Service role key and Gemini/YouTube keys are read only via
  `requireEnv()` / `getServerConfig()`, server-side, never in a file under
  `components/` or any `"use client"` module.
- All outbound fetches to a user-supplied URL go through
  `assertFetchableUrl()`, which blocks non-http(s) schemes and private/
  loopback hosts. YouTube discovery only ever calls the fixed Google API
  host — it is a search client, not a URL proxy.
- RLS policies (see `supabase/migrations/001_initial_schema.sql`) scope
  every project-owned table to `auth.uid() = projects.user_id`.

## Future scaling
Processing is called from route handlers today but is not aware of the
transport. Moving `ProcessingPipelineService` behind a queue (e.g. a Vercel
cron-triggered worker or an external queue) later means swapping the
trigger, not rewriting the pipeline.

