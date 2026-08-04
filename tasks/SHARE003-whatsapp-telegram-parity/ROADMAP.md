# Share003- Roadmap

## Current phase

Bounded exact-head runtime and physical-provider verification. The canonical-origin defect is fixed and green in CI. The organic implementation remains direct `wa.me` plus a public event-preview endpoint; n8n is not in the click path.

## Verified completed

- Role, task and exact `Share003-` prefix confirmed.
- Organic WhatsApp sharing without company registration/documents confirmed.
- WhatsApp Business/Cloud API remains out of scope under WABA001.
- RU/UK/CS/EN with RU fallback is carried into the event-preview URL.
- WhatsApp primary event-action semantics match the Telegram-standard preview.
- Direct `wa.me`, one event-specific preview URL and existing non-WhatsApp behavior are preserved.
- Result A established: n8n is not a Share003 runtime dependency.
- Android RU physical smoke reproduced a missing event preview.
- A generic site page rendered normally on the same Android WhatsApp session, localizing the defect to the event-preview contract.
- The event-preview endpoint returned correct title/date/address.
- The invitation-card renderer returned a valid JPEG on the Vercel host.
- Split routing was verified: generated Open Graph URLs used a Caddy-served custom hostname instead of the Vercel function host.
- Short event-based image URL implemented at `04318dc3083f8947a30e2e5f4e5373588746e4d7`.
- Trusted Vercel request-origin resolution implemented at `221f702ff9999f282516907c834c31e465e52460`.
- Arbitrary forwarded hosts and non-Vercel environment hosts are rejected for generated Open Graph URLs.
- Exact implementation CI passed: run `30869138836`, job `91867284000`.
- Runtime evidence, CI evidence, task report and Drive mirror were created.

## Next verified step

1. Create one Vercel Preview for exact commit `221f702ff9999f282516907c834c31e465e52460`.
2. Verify deployment state is READY and target is not production.
3. Fetch the preview event endpoint and verify `og:url` and `og:image` use the same working Vercel host.
4. Fetch the image URL and verify `200 image/jpeg`.
5. Repeat Android RU WhatsApp smoke with a fresh language-specific URL.
6. If Android RU is green, execute the remaining RU/UK/CS/EN Android, iOS and Web/Desktop matrix.
7. Request separate owner approval before any production deployment or merge.

## Pending checks

- exact-head Vercel Preview;
- Android RU retest;
- Android UK/CS/EN;
- iOS RU/UK/CS/EN;
- WhatsApp Web/Desktop RU/UK/CS/EN;
- title, date, address and non-placeholder image;
- exact event CTA and calendar CTA;
- app switching and return flow;
- provider cache after language/event changes;
- ClickUp synchronization when the connector rate-limit window has elapsed;
- owner review after all applicable evidence.

## Blockers

- exact implementation head is not deployed;
- current verified production runtime remains on prior branch head `04318dc...`;
- physical WhatsApp rendering and provider cache cannot be inferred from CI;
- iOS and authenticated WhatsApp Web/Desktop sessions remain unavailable in this chat;
- ClickUp write verification is blocked by the previously returned rate limit;
- merge and production deployment require separate owner approval.

## Completion conditions

- acceptance criteria verified;
- exact-head runtime behaviour verified;
- Android/iOS/Web/Desktop RU/UK/CS/EN matrix complete;
- event and calendar actions verified;
- cache observations recorded;
- required checks green on current head;
- evidence, STATUS, task ROADMAP and report current;
- Drive mirror verified;
- ClickUp updated with verified evidence;
- branch, commit and PR references current;
- required owner approvals received;
- no automatic merge or production deployment.
