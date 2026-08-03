# SHARE002 Roadmap

## Current phase

Runtime verification and physical-provider handoff.

## Verified completed steps

- Role and task confirmed by owner.
- ClickUp task `869edacn4` created and verified in progress.
- Task folder initialized on branch `fix/share002-whatsapp-preview-language-20260803`.
- All usages of `CardShareContent` inspected before editing.
- Root cause verified: frontend dropped the app language and forced `language=ru`.
- Smallest valid patch implemented in runtime commit `570441a4a006e31c787d6713aa9cd8a8c1f22e37`.
- WhatsApp target preserves `wa.me`, event ID and rich-preview behavior.
- RU fallback and UK/CS/EN regression coverage added.
- GitHub Actions run `30838189077` passed repository check, diff check, tests, typecheck, lint, build and bundle budget.
- Draft PR #605 created; no merge or deployment performed.

## Next verified step

Run bounded physical-device WhatsApp smoke with a current event in RU, UK, CS and EN, verifying that the rendered preview language matches the selected app language.

## Pending checks

- Android WhatsApp app.
- iOS WhatsApp app.
- WhatsApp Web/Desktop when available.
- Preview title/date/address and exact event CTA.
- Preview cache behavior after language switching.
- Evidence saved per device/app/language.
- Owner review and explicit merge approval.

## Blockers

- Physical-device provider evidence is not available from CI.
- WhatsApp crawler/app cache may delay preview refresh and must be observed rather than inferred.

## Completion conditions

- Physical smoke green for the required language/device subset.
- Acceptance criteria in `TASK.md` verified.
- Evidence saved in GitHub and Drive.
- `STATUS.md` current.
- Agent report mirrored to Drive.
- ClickUp updated with branch, commits, PR, CI and blocker.
- PR moved from Draft only after owner/reviewer decision.
- No merge or deployment without explicit approval.
