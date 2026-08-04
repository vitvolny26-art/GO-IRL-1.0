# Share003- Canonical origin runtime split evidence

- Date: 2026-08-04
- Role: AI Fixer
- Task: `SHARE003`
- Branch: `fix/share003-whatsapp-telegram-parity-20260803`
- Pre-change head: `04318dc3083f8947a30e2e5f4e5373588746e4d7`
- Production deployment inspected: `dpl_9DYzvw3xAsqbCedaBBdMyQgZ2gdd`
- Status: verified blocker; implementation scoped

## Runtime observations

1. `https://go-irl-1-0.vercel.app/api/meta/event-preview?event=e1a43487-0f96-44ed-9d73-c11000c5b790&language=ru` returned `200 text/html`.
2. The response contained the correct event title, date/time and address.
3. The response emitted `og:image` and `og:url` on `https://goirl.realitka.pp.ua/...`.
4. `https://goirl.realitka.pp.ua/api/meta/event-invitation-card?...` was served by Caddy as generic GO IRL HTML rather than the event JPEG.
5. The equivalent image endpoint on `https://go-irl-1-0.vercel.app/...` returned `200 image/jpeg` with `Content-Length: 82935`.
6. The frontend share builder already emits the event-preview URL on `go-irl-1-0.vercel.app`.

## Root cause

`api/meta/event-preview.ts` selected `VERCEL_PROJECT_PRODUCTION_URL` in production and did not consider the trusted incoming Vercel request host. In the verified deployment environment that value resolved the Open Graph URLs to the split Caddy hostname instead of the Vercel function host.

## Smallest approved change

- Prefer the incoming host only when it is the fixed GO IRL public share alias or a Vercel host from the current deployment environment.
- Reject arbitrary forwarded hosts.
- Ignore non-Vercel environment hosts for generated Open Graph URLs.
- Fall back to `https://go-irl-1-0.vercel.app`.
- Keep event lookup, image generation, localization, calendar actions, cache policy and organic `wa.me` routing unchanged.

## Safety

- No DNS, Vercel project configuration or production data change.
- No auth, RLS, SQL, migration, secret or n8n change.
- No merge.
- No deployment in this implementation step.
