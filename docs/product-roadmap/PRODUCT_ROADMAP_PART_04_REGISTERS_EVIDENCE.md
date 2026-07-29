---
title: Product Roadmap Part 04 — Registers and Evidence
owner: Product Lead
status: Active
source_of_truth: false
canonical_index: docs/product-roadmap/PRODUCT_ROADMAP.md
source_document_id: 12VOnDP32ZmXKGWuytICZ06XUr5lOEmnt0gE4lERNKDw
source_revision_id: AIroW346eIu9snQFAYkAFasStCULkk2N0Q97H4Ah1K5hYdNuqeuUCTEoUXxs95EcEaCUSJBvfVxeyK4yTL66wgL5oPKoXGV1zPywI0M_W58
scope: Sprint register, Bible synchronization, conflicts, priorities, dependencies, evidence, and update rules
last_review: 2026-07-29
next_review: 2026-08-09
---

# Product Roadmap Part 04 — Registers and Evidence

Canonical index: [PRODUCT_ROADMAP.md](PRODUCT_ROADMAP.md).

## 9. Sprint register
- [x] Sprint 0 — Archived historical Foundation record.
  https://github.com/vitvolny26-art/GO-IRL-1.0/blob/main/docs/roadmap/SPRINT_0.md
- [x] Sprint 1 — Archived historical MVP Core record.
  https://github.com/vitvolny26-art/GO-IRL-1.0/blob/main/docs/roadmap/SPRINT_1.md
- [~] Active bridge — Release Preparation and Stabilization. No separate numbered sprint. Partial / Active until all release gates are evidenced.
- [ ] Sprint 2 — Draft / Gated Telegram and Notifications.
  https://github.com/vitvolny26-art/GO-IRL-1.0/blob/main/docs/roadmap/SPRINT_2.md
- [ ] Sprint 3 — Draft / Gated Trust, Verification, and RLI.
  https://github.com/vitvolny26-art/GO-IRL-1.0/blob/main/docs/roadmap/SPRINT_3.md
- [ ] Sprint 4 — Draft / Gated Modules and Discovery.
  https://github.com/vitvolny26-art/GO-IRL-1.0/blob/main/docs/roadmap/SPRINT_4.md
- [ ] Sprint 5 — Draft / Gated Production Growth.
  https://github.com/vitvolny26-art/GO-IRL-1.0/blob/main/docs/roadmap/SPRINT_5.md
- [~] `docs/roadmap/SPRINTS.md` — Draft historical overview, not a source of truth.
  https://github.com/vitvolny26-art/GO-IRL-1.0/blob/main/docs/roadmap/SPRINTS.md
- [!] Root `SPRINTS.md` was referenced by `DOCS_INDEX.md` but absent from the inspected main branch. This is external documentation debt; no GitHub change was made.
Historical completion of Sprint 0 or Sprint 1 does not prove current release readiness.
## 10. Knowledge Bible synchronization
**Stable folder**
https://drive.google.com/drive/folders/1dBvZmrVq1hRse-cSHEKgImetXXYxJ5Dt
**Control documents**
- 00A — Bible Completion Audit:
  https://docs.google.com/document/d/1azH10jEfU70KbRA19LqXvvgfBN0fYRe80zJTQ0CffC8/edit
- 00B — Bible Completion Roadmap:
  https://docs.google.com/document/d/1bcU1lPC_zVit5W_e7uQGpv3n3TB8d_Npgv9DyM3Cx8E/edit
- 00C — Knowledge Bible Migration Ledger and stable ID registry:
  https://docs.google.com/document/d/1wRpRB3s7NByFlDF6kFEhFmRRn_o9fMDXFFuMAcVbrCs/edit
**Completed Drive-only work**
- [x] No current Bible 1.0 MVP boundary chapter is missing.
- [x] Staff OS governance alignment completed for the defined 25-document set.
- [x] 18 ambiguous Drive titles were normalized while preserving IDs and content.
- [x] Stable ID/URL registry created for all 25 Bible documents.
- [x] Folder-wide metadata classification completed for 25/25 documents.
- [x] Foundation terminology and cross-reference reconciliation completed for the defined Drive editorial scope.
These completed items prove Drive organization and editorial governance only. They do not prove GitHub promotion, runtime correctness, schema correctness, release readiness, or production validation.
**Open Bible work**
- [~] Overall Bible is structurally complete but not technically final.
- [~] Source-specific reconciliation against current code, schema/migrations, release evidence, market documents, and runtime is not active in the Drive-only queue; it remains blocked pending separately authorized higher-authority evidence work.
- [x] Book IV/V Modules and Product Requirements reconciliation is complete for the bounded Drive editorial scope; implementation and runtime verification remain outside this completion.
- [x] `05.02 — Product Requirements MVP 1.0 / 1.1 Split` now bounds reminder deployment and schema/chat-expiry statements as historical source-derived claims requiring higher-authority evidence.
- [ ] Mature Drive improvements may be proposed to GitHub only through separate review and approval. No automatic promotion or overwrite.
## 11. Knowledge debt and external conflicts
These items are tracked for visibility. Resolved items record completed Drive-side reconciliation; open items remain external debt and were not changed by this Drive cleanup.
1. **Product roadmap authority reconciliation — Resolved 2026-07-28**
   GitHub `ROADMAP.md` declares `source_of_truth: true` and identifies itself as the canonical product roadmap. GitHub `docs/release/CURRENT_PHASE.md` additionally states that GitHub main is the only project source of truth. This Drive document now declares `source_of_truth: false` and is classified as an owner-designated mirror.
2. **Product roadmap evidence divergence — Drive-side resolved 2026-07-28; external verification open**
   Drive-side classification is complete: infrastructure recovery statements, Supabase project and migration identifiers, and release-evidence details in this mirror are explicitly historical/advisory records, not current proof. Current technical truth requires independent support from GitHub main or verified runtime evidence. External promotion into reviewed technical records remains open and requires a separately approved higher-authority task.
3. **Missing root sprint file — Drive remediation contract completed; GitHub fix open**
   `DOCS_INDEX.md` references root `SPRINTS.md`, but the inspected file was absent. Drive now records the exact remediation contract; the repository inconsistency remains unresolved until a reviewed GitHub change either restores the root file or removes/corrects the stale registry reference.
4. **Tool Operating Model activation pending — P1**
   PR #306 merged the document in Review status on 2026-07-24. GitHub frontmatter and DOCS_INDEX are consistent; activation remains pending explicit review approval and a separate status promotion.
5. **Bible finalization gap — Drive editorial scope resolved; technical finality blocked**
   The defined 25-document Drive snapshot is editorially complete at 100/100 under the RMap106 scoring method, and sequential Drive-only cluster reconciliation is closed. Technical finality remains Blocked because repository, implementation, schema, runtime, market, release, security, legal, and production evidence were not assessed by the Drive-only work.
6. **Archivist roadmap status drift — Drive-side resolved 2026-07-28**
   PLAN1001 in the active Chief Archivist roadmap now provides a superseding phase-status summary: Phases 1, 2, 4, and 5 are Completed within bounded Drive scope; Phases 3 and 6 are Active / Partial; Phase 7 remains Proposed / approval-gated. Historical Planned labels remain process history and no longer represent current Drive control state.
7. **ClickUp future-task sprawl — P1**
   Future Trust, Growth, AI, city, Friends, Travel, and Dating tasks must remain explicitly Gated / Future until roadmap entry gates are green.
## 12. Prioritized improvement roadmap
### P0 — Release clarity
1. Close current release blockers with direct evidence.
2. Keep GitHub `ROADMAP.md` as the authoritative product-sequencing control surface and maintain this Drive document only as an advisory mirror.
3. Record external documentation inconsistencies as debt without silently changing external authority.
4. Keep future phases gated.
### P1 — Release gate closure
1. Close RLS/security-advisor and public/signed-in RPC findings through approved security work.
2. Establish same-commit quality-gate evidence for reviewed changes.
3. Verify trusted authentication and production write paths.
4. Decide and document legacy local fallback removal.
5. Verify real Telegram second-account flow, Vercel, support, monitoring, analytics, moderation, and incident readiness.
### P1 — Product and UX stability
1. Complete event-sheet, participant, chat, profile, organizer, map, selection, and weather fixes that directly support the core loop.
2. Preserve focusChat and chat-opening behavior.
3. Keep Sport Coach bounded and evidence-driven.
4. Avoid unrelated scope expansion.
### P1 — Knowledge Bible maintenance and technical-finality evidence
1. Preserve the completed RMap102 requirement-to-roadmap and acceptance-to-gate mapping in 05.01 and 05.02.
2. Open source-specific reconciliation against current GitHub main or approved runtime evidence only through a separately authorized higher-authority task.
3. Keep unresolved technical-finality claims in the Knowledge Debt register with owner, severity, evidence, exit condition, and explicit Blocked status.
4. Do not auto-sync Drive improvements to GitHub.
### P2 — Operational discipline
1. Keep ClickUp as the single operational queue.
2. Attach every active task to a roadmap phase, entry gate, owner, and evidence.
3. Keep future epics Gated / Future.
4. Keep n8n, Telegram, and Slack as orchestration or interface layers, not alternate truth stores.
### P3–P5 — Future phases
Telegram expansion, Trust/RLI, module and city expansion, production growth, AI discovery, Friends, Travel, and Dating remain Draft / Gated. They require explicit Product Owner approval after their declared entry gates are evidenced.
## 13. Dependency chain
1. Preserve and verify Foundation and MVP Core.
2. Complete Release Preparation and Stabilization.
3. Add Telegram notifications without violating runtime boundaries.
4. Introduce trust features only after explicit approval and stable attendance evidence.
5. Expand modules and cities only after release and product evidence.
6. Start production-growth mechanics only after operational and public-safety readiness.
## 14. Evidence ledger
Claim | Evidence | Scope
--- | --- | ---
This Drive document is an owner-designated product-roadmap mirror, not the project source of truth | GitHub `docs/release/CURRENT_PHASE.md` states that GitHub main is the only project source of truth; Drive Document ID `12VOnDP32ZmXKGWuytICZ06XUr5lOEmnt0gE4lERNKDw` | Drive planning and reconciliation scope only
Sprint 0–1 are archived and Sprint 2–5 are Draft / Gated | Direct reads of GitHub main sprint records | Sprint classification only
Root `SPRINTS.md` was absent while still listed in `DOCS_INDEX.md` | GitHub file fetch and registry entry | Exact inspected path and main snapshot only
Bible metadata coverage is 25/25 and stable ID registry exists | 00A Audit, 00B Roadmap, 00C Migration Ledger | Reviewed Drive Bible folder only
Bible is not technically final, while Book IV/V editorial reconciliation and RMap102 phase/gate mapping are complete | 05.01 and 05.02 current content; 00A and 00B control records | Drive editorial classification only; no technical or runtime completion
Future ClickUp tasks do not authorize scope | ClickUp search results and this roadmap’s gates | Searchable ClickUp state at audit time only
Tool Operating Model remains consistently Review after merged PR #306; activation is pending explicit approval and status promotion | GitHub document, DOCS_INDEX.md, and merged PR #306 | Lifecycle of that governance document only
Roadmap reconciliation changed only this Drive document | Revision-guarded Google Docs updates and rereads | Drive-only reconciliation through 2026-07-29
## 15. Update rules
- Update this roadmap after each meaningful verified product work block.
- Use Completed only for evidence-backed outcomes.
- Keep Partial, Blocked, Draft, Gated, Archived, and Historical labels explicit.
- Do not use this roadmap as proof of runtime, schema, security, deployment, or production state.
- Do not activate future phases without their entry gates and explicit approval.
- Preserve history through references; do not duplicate full source documents.
- Next review: 2026-08-09.
