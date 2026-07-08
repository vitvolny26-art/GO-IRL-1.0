# Reputation System

GO IRL reputation exists to make real-life meetings safer, warmer, and more reliable. It must not become a popularity contest, a social ranking, a currency, or a game economy.

## 1. Purpose

The reputation system should answer practical questions:

- did this person really participate?
- does this organizer create reliable Activities?
- can the system trust this confirmation or report?
- is this user helping the local community?

Reputation must support real-life trust without pushing users into performative behavior.

## 2. Real Life Index (RLI)

Real Life Index is a public or semi-public signal of real offline activity.

RLI can increase for:

- confirmed participation;
- organizing Activities;
- helping the community;
- successful full Activities;
- active streaks;
- first participation in new categories;
- referrals only after the invited user completes 3 confirmed Activities.

RLI can decrease for:

- no-show;
- late cancellation;
- spam;
- fake Activities;
- confirmed abuse reports.

RLI is not:

- a token;
- crypto;
- a financial reward;
- a game level;
- likes;
- a public shame score.

RLI ledger preserves historical contribution data so future reward programs can be built without changing the core data model.

## 3. Trust Score

Trust Score is hidden and internal only.

It is used by the system for:

- anti-spam;
- moderation;
- weighting attendance confirmations;
- weighting reports;
- access to future community roles.

Trust Score can increase for:

- regular participation;
- majority confirmation;
- no abuse reports;
- honest behavior;
- verified organizer history.

Trust Score can decrease for:

- spam;
- mass cancellations;
- unconfirmed participation;
- fake Activities;
- many confirmed reports;
- suspicious behavior.

Trust Score must never be shown publicly as a user rating. GO IRL must not rank or shame users by Trust Score.

Before significant penalties depend on Trust Score, GO IRL needs:

- auditability;
- anti-bias review;
- appeal process;
- moderator oversight;
- retention policy.

## 4. Community Contribution

Community Contribution is separate from RLI.

It reflects how a user helps the community become healthier, not just how often they attend.

Signals can include:

- organizing quality Activities;
- helping newcomers;
- regular successful events;
- positive feedback;
- local community building;
- reliable moderation or ambassador work later.

Future use:

- ambassadors;
- moderators;
- trusted organizers;
- community builders.

The name should stay "Community Contribution", not "Community Score", so it does not feel like a game ranking.

## 5. Life Map

Life Map is personal history of real-life activity.

It can show:

- categories explored;
- cities visited;
- new connections;
- active weeks;
- organized Activities;
- meaningful milestones.

Life Map is not a leaderboard and must not compare users publicly.

## 6. Attendance Confirmation

MVP should avoid QR codes.

### Level 1

Organizer confirms participants after the Activity.

### Level 2

Participants confirm each other:

```text
Was this person actually there?
Yes / No
```

### Level 3

Optional Telegram geolocation confirmation.

Rules:

- opt-in only;
- only in a defined time window;
- only within an allowed radius around the Activity location;
- raw coordinates are not stored as history;
- only the verification result is stored;
- raw location is deleted immediately or never persisted.

## 7. Event Confidence Levels

Event confidence describes how reliable the Activity completion signal is.

High:

- organizer confirmed;
- majority participants confirmed;
- optional geolocation confirmed.

Medium:

- majority participants confirmed.

Low:

- only organizer confirmed.

Low confidence Activities may give reduced RLI.

## 8. RLI Ledger

Future table: `rli_ledger`

Fields:

- `id`
- `user_id`
- `activity_id`
- `delta`
- `reason`
- `source_type`
- `confidence_level`
- `created_at`
- `created_by_system`
- `metadata`

Purpose:

- transparent contribution history;
- auditability;
- anti-fraud;
- future reward program preparation without changing the core model.

## 9. Penalties

Reputation penalties must be careful and appealable.

Potential penalty reasons:

- confirmed no-show;
- repeated late cancellation;
- fake Activity;
- spam;
- confirmed abuse report;
- referral fraud.

No major penalty should be applied without:

- evidence;
- audit log;
- moderator review when needed;
- appeal path for serious restrictions.

## 10. Referral Program

Referrals should reward real community growth, not account farming.

Rule:

Referral credit is counted only after the invited user completes 3 confirmed Activities.

Future anti-fraud checks:

- duplicate account detection;
- suspicious invite patterns;
- same-device abuse signals where privacy-safe;
- manual review for high-volume rewards.

## 11. Privacy Rules

- Trust Score is internal and hidden.
- Users must not be publicly ranked by Trust Score.
- RLI can be public or semi-public, but should reveal minimal detail.
- Raw geolocation is never stored as movement history.
- Geolocation confirmation is opt-in.
- Only verification results are stored.
- Users should later be able to request reputation audit/export.
- Chat, private profile, Telegram ID, phone, and email must not be used for reputation without explicit policy.

## 12. Future Reward Programs

GO IRL may later create reward programs for real community contribution.

Rules:

- no crypto/tokenization in MVP;
- do not call RLI currency;
- do not promise financial rewards;
- preserve ledger integrity so future reward programs can be evaluated safely;
- reward programs require privacy, fraud, legal, and abuse review first.
