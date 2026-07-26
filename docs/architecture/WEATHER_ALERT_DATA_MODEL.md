# Weather Alert Data Model

## Status
Design contract only. No production provider, SQL, RLS, runtime UI or automatic event action is introduced.

## Scope
Weather alerts exist only to support coordination around a specific activity. The model records the affected activity, normalized location, provider observation window, hazard, severity, confidence, lifecycle and eligible recipients.

## Hazards
The canonical hazards are rain, thunderstorm, strong wind, heat, frost, snow, ice, poor air quality and other. Existing notification kinds are reused where available. Unsupported future hazards map to a generic weather notification until the notification registry is explicitly extended.

## Severity
- `info`: informational condition;
- `watch`: conditions may affect the activity;
- `warning`: material coordination risk and service-critical delivery threshold;
- `critical`: immediate severe risk.

Severity does not authorize cancellation or rescheduling. Those decisions remain explicit organizer or moderator actions.

## Observation evidence
Each alert carries provider identity, observation time, valid forecast window, confidence and optional normalized measurements. Provider payloads remain metadata and do not become the source of truth for event state.

## Recipients
Recipients are derived from activity relationship: organizer, active participant, relevant waitlisted user or moderator. Eligibility and delivery intent are explicit. Weather alerts never grant event membership or chat access.

## Deduplication
Alerts are deduplicated by activity, hazard, start window and provider. Delivery occurrence is unique per alert and recipient.

## Retention
The contract defaults to 14 days. Runtime retention and production storage require a separate approved implementation task.

## Non-goals
- general weather application;
- provider integration;
- automatic cancellation or rescheduling;
- production notification dispatch;
- weather UI rollout;
- SQL, RLS or migrations.