---
title: Agent Report
owner: AI Fixer / QA + UX Polish Agent
status: Draft
source_of_truth: false
last_review: 2026-07-15
next_review: 2026-07-22
---

# Agent Report

## Task

Audit the current event-location contract and propose a beta-safe address/map picker before implementation (Issue #105). This is a documentation-only task.

## Files inspected

- `src/types.ts`
- `src/App.tsx`
- `src/eventLocations.ts`
- `src/validation.ts`
- `src/activityChat.ts`
- `src/weather.ts`
- `supabase/schema.sql`
- `docs/DATABASE_SCHEMA_AUDIT.md`
- `docs/GO_IRL_CONSTITUTION.md`
- `DOCS_INDEX.md`
- `docs/reports/README.md`

## Findings

### Current state

The persisted `Activity` contract has three location fields:

- `cityId: string`;
- `address: string`;
- `locationUrl?: string`.

The Supabase `public.activities` table mirrors that contract as `city_id`, required `address`, and nullable `location_url`. It has no event latitude/longitude columns. The create form currently accepts an address and a manually editable URL. It can derive a Mapy.cz search URL and stores up to eight frequently used address/URL pairs in browser `localStorage` under `go-irl-event-locations`.

Location data is reused by the details view, map-opening action, calendar payloads, sharing, weather lookup, and activity chat. The Explore screen can request the viewer's browser geolocation, but those coordinates are not part of the event entity.

The current contract is sufficient for a closed-beta address picker that selects a formatted address and generates an external map search URL. It is not sufficient for a precise pin, reliable distance/radius queries, or map-bound searches. Those features require persisted coordinates and a separately approved schema contract.

### Minimal beta contract

Keep the persisted contract unchanged:

```ts
type EventLocation = {
  cityId: string;
  address: string;       // canonical text shown to users
  locationUrl?: string;  // legacy/backward-compatible external link
};
```

Recommended UI behavior:

1. Replace the visible manual URL field with a single address search/select control.
2. Bias suggestions to the selected city and Czechia, without requiring device location.
3. Store the selected provider result only as canonical `address`; keep provider IDs and coordinates transient.
4. Generate the external Mapy.com search URL from `address + city` when the user opens the map. Do not require `locationUrl` for new events.
5. Continue accepting existing `locationUrl` values for old events. Prefer a valid legacy URL; otherwise use the generated search URL.
6. Keep recent addresses as a convenience cache only. Supabase remains the source of truth for events.

This removes organizer-authored URLs from the main flow without changing the database, RLS, Auth, or migrations.

### Provider comparison

| Provider | Fit for Olomouc beta | Key, cost, and limits | Attribution, privacy, and storage | Recommendation |
| --- | --- | --- | --- | --- |
| Mapy.com REST API | Czech-first address search, reverse geocoding, autocomplete, routes, and tiles | Requires registration and an API key. The published plan currently includes 10,000,000 free credits/month; an address-search call costs 4 credits. Limits and commercial terms must be rechecked before implementation. | Mapy.com logo/copyright rules apply. Queries disclose typed addresses to Seznam/Mapy.com. | Preferred candidate for a Czech beta after Tech Lead approves the provider, key placement, terms, and attribution. |
| Google Maps Platform | Strong autocomplete and place coverage | Requires an API key, billing configuration, quotas, and SKU monitoring. | Google attribution and result-display/storage policies apply; geocoding results displayed on a map have Google-map restrictions. Typed addresses are sent to Google. | Use only if Mapy.com quality is insufficient and Product/Tech explicitly accept billing and policy coupling. |
| Mapbox Search/Geocoding | Good programmable search and map stack | Requires an access token and usage billing. Geocoding defaults to temporary use; the API documents a default 1,000 requests/minute limit. Search Box suggestions/retrieval are session-billed. | Temporary versus permanent storage rights must match whether results are persisted. Attribution and token restrictions apply. | Viable alternative, but its storage/licensing distinction adds avoidable beta complexity. |
| Public OSM Nominatim and `tile.openstreetmap.org` | Useful for experiments and manual fallback links | Public Nominatim has an absolute maximum of 1 request/second, requires an identifying Referer/User-Agent, and explicitly forbids client-side autocomplete. Public tiles are best-effort with no SLA. | OSM attribution is mandatory; OSMF asks not to submit personal/confidential data. Public services may withdraw access. | Do not use the public endpoints as the production autocomplete or embedded-map backend. A paid OSM-derived provider or self-hosting would be a separate decision. |

Official references:

- [Mapy.com REST API overview](https://developer.mapy.com/rest-api-mapy-cz/)
- [Mapy.com pricing](https://developer.mapy.com/pricing/)
- [Google Geocoding policies](https://developers.google.com/maps/documentation/geocoding/policies)
- [Google Geocoding usage and billing](https://developers.google.com/maps/documentation/geocoding/usage-and-billing)
- [Mapbox Geocoding API](https://docs.mapbox.com/api/search/geocoding/)
- [Mapbox pricing](https://www.mapbox.com/pricing)
- [OSMF Nominatim usage policy](https://operations.osmfoundation.org/policies/nominatim/)
- [OSMF tile usage policy](https://operations.osmfoundation.org/policies/tiles/)

### Telegram WebView compatibility and fallback

Telegram Mini Apps expose `LocationManager` from Bot API 8.0. It reports whether location is available and authorized; `getLocation` returns `null` when permission is not granted. Opening settings must be triggered by user interaction. Therefore, current-location assistance must be optional and capability-detected, never required to create an event.

The picker should be ordinary responsive React UI with keyboard/touch support. It must work when Telegram location access is unsupported, denied, or unavailable. Recommended fallback order:

1. selected/canonical address;
2. local recent-address suggestion;
3. manual address text;
4. when opening a map: valid legacy `locationUrl`, otherwise a generated Mapy.com search for `address + city`, otherwise a city-only search (Olomouc by default).

External-map opening must happen from an explicit tap. Telegram documents that `openLink` is user-interaction gated. See [Telegram Mini Apps](https://core.telegram.org/bots/webapps).

### Privacy and security

- Explain that address searches are sent to the selected map provider.
- Request device geolocation only after an explicit action such as “Near me”; creation must remain possible after denial.
- Do not put a secret provider key in `VITE_*` or client code. A browser-visible key is acceptable only when the provider explicitly supports public keys and it is restricted by allowed origins/quotas.
- If the chosen API requires a secret, proxy it through an approved server-side endpoint and add rate limiting; this needs a separate secrets/external-service decision.
- Do not persist provider IDs or coordinates until their retention rights and schema are approved.
- Validate legacy external URLs as HTTP(S). A future implementation should prefer generated/provider-owned URLs and consider an allowlist before opening stored links.

### Protected-scope impact and decision gates

| Decision | Needed for minimal beta? | Approval gate |
| --- | --- | --- |
| Keep `address`, `cityId`, optional legacy `locationUrl` | Yes | React-level implementation review; no protected-scope change |
| Choose a hosted autocomplete provider | Yes, only when autocomplete is implemented | Tech Lead approval of provider, terms, privacy, attribution, quotas, and cost |
| Add a public browser API key | Provider-dependent | Tech Lead/Security approval; origin and quota restrictions; Vercel secret/config review |
| Add a server-side provider proxy or secret | No for generated-link beta | Tech Lead/Security approval and separate external-service/secrets task |
| Persist latitude/longitude or provider place ID | No | Separate schema proposal, migration, generated types, API mapping, RLS review, rollback plan, and Tech Lead approval |
| Change Auth or ownership rules | No | Explicit Auth/RLS architecture approval; not implied by this picker |

If precise coordinates are later approved, prefer nullable `latitude` and `longitude` columns for the first migration, plus a documented coordinate source. PostGIS should be introduced only when server-side radius/spatial queries justify the dependency. Backfill must not guess coordinates: old events remain address-only and use the link fallback.

### Phased plan

**Phase 0 — no provider dependency**

- Hide the manual URL field.
- Keep manual address entry and recent-address suggestions.
- Derive the Mapy.com search URL at open time.
- Preserve all existing event records and URL fallbacks.

**Phase 1 — address autocomplete, unchanged schema**

- After provider approval, add debounced, cancellable city/Czechia-biased search.
- Require explicit selection or allow manual text fallback.
- Persist only the canonical address and existing city ID.
- Add empty/loading/error/offline/denied states and Telegram/mobile tests.

**Phase 2 — optional current-location assistance**

- Capability-detect Telegram `LocationManager`; use browser geolocation only as a documented non-Telegram fallback.
- Ask permission only after a tap and use coordinates transiently to bias results.
- Do not block creation when unavailable or denied.

**Phase 3 — precise event pin, only if product requires it**

- Approve provider storage rights and coordinate semantics.
- Design and review schema/API/RLS/migration changes.
- Backfill only explicitly verified locations; retain address-only compatibility.
- Add distance accuracy, map attribution, telemetry, quota alarms, and rollback checks.

## Changes made

Added this documentation-only audit and recommendation. No runtime or dependency changes were made.

## Checks

- Repository contract and usages: inspected locally.
- Provider and Telegram constraints: checked against the official documentation linked above on 2026-07-15.
- `pnpm` quality gates: NOT RUN — docs-only.

## Risks

- Provider prices, quotas, licensing, and Telegram client support can change; revalidate immediately before implementation.
- Address-only events cannot guarantee entrance-level precision or accurate distance calculations.
- `localStorage` recent addresses are device-local and may contain sensitive places; the implementation should provide clear removal behavior and avoid syncing them without consent.
- Existing arbitrary `locationUrl` values remain a backward-compatibility and external-navigation risk until a separate validation/allowlist change is approved.

## Not touched

- Runtime application code
- `.env`, API keys, tokens, or Vercel configuration
- Supabase schema, SQL, migrations, Auth, or RLS
- Dependencies, deployment, GitHub, or PR state

## Next step

Tech Lead must choose between Phase 0 and a Phase 1 provider. If Phase 1 is approved, record the provider, key model, attribution, privacy notice, quota/cost guardrails, and whether canonical provider results may be stored before opening an implementation task. Do not merge this report as architectural approval by itself.
