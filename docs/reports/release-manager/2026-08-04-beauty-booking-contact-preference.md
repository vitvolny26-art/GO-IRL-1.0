---
title: Beauty Booking Contact Preference
owner: GO IRL Release Engineer
status: Draft
source_of_truth: false
last_review: 2026-08-04
next_review: 2026-08-11
---

# Agent Report

## Task

Add an optional client request to be contacted before a Beauty booking is confirmed, and improve readability of the public professional profile sticky actions.

## Files inspected

- `src/services/ServiceActivityCard.tsx`
- `src/services/servicesBookingRepository.ts`
- `src/services/service-activity-card.css`
- `src/services/service-activity-card-overrides.css`
- `src/beauty/BeautyPilotWorkspace.tsx`
- `src/beauty/BeautyProfessionalProfilePortal.tsx`
- `src/beauty/beauty-professional-profile.css`
- `src/beauty/beauty-professional-profile-overrides.css`
- two owner-provided mobile screenshots

## Findings

The client booking form already persisted required name/contact values but had no optional pre-confirmation communication preference. The professional workspace displayed the stored contact but had no corresponding instruction. The public profile sticky action buttons used a 54 px base height and a mostly transparent gradient, reducing readability over the manicure background.

## Changes made

- Added a localized optional checkbox: `Contact me before confirming the booking`.
- Persisted the preference as `contactBeforeConfirmation` on local service bookings.
- Preserved backward compatibility by normalizing older stored bookings to `false`.
- Exposed the preference in the synthetic booking activity metadata.
- Added a visible note in the master booking detail when the client selected the option.
- Added compact custom checkbox styling for the booking form.
- Reduced sticky profile action height to 44 px desktop / 42 px mobile.
- Added a stronger dark gradient, blur and upper shadow behind the sticky actions.
- Added repository regression coverage for stored `true` and legacy default `false` values.

## Scope and safety

- No auth, Supabase RLS, SQL, migration, secret, environment, DNS or production-data changes.
- No merge or deployment.
- Existing booking fields, date selection, slots and status lifecycle remain unchanged.

## Checks

Exact-head GitHub Actions is required after the Draft PR is opened.

Local checks could not run because the execution environment could not resolve `github.com`; this is recorded as an infrastructure limitation rather than an application result.

## Rollback

Revert the task branch commits or remove `contactBeforeConfirmation`, the booking checkbox/note styles, and the sticky-action override changes.

## Next step

Wait for exact-head CI. After green CI, review the booking form and sticky footer on the same mobile viewport shown in the supplied screenshots. Merge and production deployment require separate explicit approval.
