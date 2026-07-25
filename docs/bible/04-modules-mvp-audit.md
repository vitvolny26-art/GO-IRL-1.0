---
title: Bible Module Scope Audit
owner: Chief Archivist / Technical Lead
status: Active
source_of_truth: true
last_review: 2026-07-25
next_review: 2026-08-25
---

# Book IV — Module Scope Audit

## Result

The module vision is reconciled with current `main`.

| Area | Classification |
|---|---|
| Core Activity System | Current |
| Six-category Olomouc baseline | Proven Closed-Beta evidence / default release baseline |
| Sport specialization and Sport Coach | Current where implemented |
| Generic fallback | Current |
| Activity Chat and weather | Current where implemented |
| Profile provider preferences | Current |
| Maps and calendar provider routing | Current |
| Reminder/outbox foundation | Current where verified |
| Telegram and Messenger delivery | Enabled where current production evidence confirms |
| WhatsApp and Instagram delivery | Gated |
| Full plug-in/module platform | Future |
| AI personalization and cross-module intelligence | Future |
| Ticketing, marketplace, clubs, dating | Future |

## Containment rules

- Do not treat artwork or taxonomy data as approval to expose a category.
- Do not treat an adapter as proof that its provider is production-enabled.
- Do not build a module registry rewrite for release preparation.
- Do not create new tables or RLS policies from this audit.
- Preserve Generic fallback and the current Activity model.

## Conclusion

GO IRL is a focused local-meetup platform with modular supporting capabilities, not a collection of independent products.
