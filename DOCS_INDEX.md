# GO IRL Documentation Status Registry

Single entry point for GO IRL documentation status, ownership, and conflict tracking.

## Absolute source-of-truth rules

- `docs/GO_IRL_CONSTITUTION.md` is the absolute source of truth for GO IRL philosophy and architecture principles.
- `README.md` is the source of truth for current code scope and stabilized MVP boundaries.
- `DEPLOYMENT.md` is the source of truth for Vercel-first deployment flow.
- `docs/MVP_DOC_AUDIT.md` is the source of truth for known documentation conflicts.
- `docs/MISSING_SECTIONS.md` tracks missing or incomplete documentation boundaries.
- Historical snapshot files must not be used for code generation.
- Do not change `.env`, secrets, Supabase RLS, auth, or destructive SQL without explicit approval.

## Статусный реестр документации

| Документ | Тип | Статус (Current/Draft/Deprecated) | Source of Truth (Да/Нет) | Известные конфликты |
|---|---|---|---|---|
| `README.md` | Core / Code Scope | Current | Да | Current stabilized boundary copied from source repo. |
| `DOCS_INDEX.md` | Registry | Current | Да | Must be updated after every doc move/status change. |
| `DEPLOYMENT.md` | Release / Deploy | Current | Да | Vercel-first; Netlify is historical/secondary. |
| `BETA_TESTING.md` | QA / Beta | Current | Да | Includes Browser Demo Mode and Share/Join checks. |
| `docs/MVP_DOC_AUDIT.md` | Audit / Conflict Registry | Current | Да | Tracks fixed/open documentation conflicts. |
| `docs/MISSING_SECTIONS.md` | Audit / Missing Boundaries | Current | Да | Tracks remaining incomplete sections. |
| `docs/MVP_STABILIZATION_PLAN.md` | MVP Plan | Current | Да | Includes Weather Widget boundary. |
| `docs/EventLifecycle.md` | Architecture | Draft | Нет | Chat 24-hour rule is contained but needs code/migration audit. |
| `docs/SPORT_COACH_MVP.md` | Product Scope / Coach | Current | Да | `CoachRequestPanel.tsx` is current UI basis; Role Choice and Review Flow are future. |
| `SETUP.md` | Legacy Setup | Deprecated | Нет | Historical only; do not generate code from it. |
| `SETUP_RU.md` | Legacy Setup | Deprecated | Нет | Historical only; do not generate code from it. |
| `SPRINT0_STATUS.md` | Historical Snapshot | Deprecated | Нет | Netlify-era proof; not current Vercel release truth. |
| `CHECKLIST.md` | Historical Checklist | Deprecated | Нет | Old local assumptions. |
| `PATCH_REPORT.md` | Historical Patch Report | Deprecated | Нет | Trusted Auth implementation history, not current release truth. |
| `GO_IRL_DOCUMENTATION.md` | Generated Snapshot | Deprecated | Нет | Old generated snapshot. |

## Current documentation conflicts

| Conflict | Resolution |
|---|---|
| Trusted Auth was both current production model and public blocker. | Marked as `[SHIPPED/PRODUCTION PATH]`; remaining work is operational verification. |
| Coach UI promise exceeded current implementation. | Role Choice and Review Flow moved to future; `CoachRequestPanel.tsx` is current MVP basis. |
| Sprint 0 Netlify proof conflicted with Vercel beta flow. | Netlify marked historical/secondary; Vercel is current deployment target. |
| Legacy setup docs could mislead AI/code generation. | Deprecated and excluded from code generation. |
| Activity Chat 24-hour rule was not safely verified. | Contained as temporary chat; exact archive timing needs code/migration audit. |
| Vercel latest failure can be quota-related. | `upgradeToPro=build-rate-limit` is operational quota issue, not code regression. |

## Maintenance rule

Update this registry when:

- a document is added, moved, deprecated, or promoted to source of truth;
- release/deployment source of truth changes;
- source docs are resynced from `vitvolny26-art/GO-IRL`;
- a missing section is closed or re-opened.
