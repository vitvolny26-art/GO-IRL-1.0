const fs = require('node:fs')
const path = require('node:path')
const { execFileSync } = require('node:child_process')

const root = path.resolve(__dirname, '..')
const roadmapPath = path.join(root, 'ROADMAP.md')
let roadmap = fs.readFileSync(roadmapPath, 'utf8')
if (!roadmap.includes('## Active bridge — Release Preparation and Stabilization')) {
  roadmap = execFileSync('git', ['show', 'HEAD:ROADMAP.md'], {
    cwd: root,
    encoding: 'utf8',
  })
}

const section = (start, end) => {
  const startIndex = roadmap.indexOf(start)
  const endIndex = end ? roadmap.indexOf(end, startIndex + start.length) : roadmap.length
  if (startIndex < 0 || endIndex < 0) {
    throw new Error(`ROADMAP_SECTION_NOT_FOUND: ${start} -> ${end || 'EOF'}`)
  }
  return roadmap
    .slice(startIndex, endIndex)
    .trim()
    .replace(/[ \t]+$/gm, '')
}

const frontmatter = (title, scope) => `---
title: ${title}
owner: Product Lead
status: Active
source_of_truth: true
canonical_index: ROADMAP.md
scope: ${scope}
last_review: 2026-07-29
next_review: 2026-08-09
---
`

const parts = [
  {
    file: 'ROADMAP_PART_01_FOUNDATION_MVP.md',
    title: 'Roadmap Part 01 — Foundation and MVP',
    scope: 'Product thesis, guardrails, roadmap principles, Foundation, and MVP Core',
    body: section('## Product thesis and guardrails', '## Active bridge — Release Preparation and Stabilization'),
  },
  {
    file: 'ROADMAP_PART_02_RELEASE_PREPARATION.md',
    title: 'Roadmap Part 02 — Release Preparation',
    scope: 'Active Release Preparation and Stabilization bridge',
    body: [
      section('## Current state', '## Product thesis and guardrails'),
      section('## Active bridge — Release Preparation and Stabilization', '## Phase 2 — Telegram and Notifications'),
    ].join('\n\n'),
  },
  {
    file: 'ROADMAP_PART_03_TELEGRAM_NOTIFICATIONS.md',
    title: 'Roadmap Part 03 — Telegram and Notifications',
    scope: 'Gated Telegram and notification direction',
    body: section('## Phase 2 — Telegram and Notifications', '## Phase 3 — Trust, Verification, and Real Attendance'),
  },
  {
    file: 'ROADMAP_PART_04_TRUST_MODULES.md',
    title: 'Roadmap Part 04 — Trust and Modules',
    scope: 'Trust, real attendance, modules, discovery, and Sport Coach validation',
    body: [
      section('## Phase 3 — Trust, Verification, and Real Attendance', '## Phase 5 — Production Growth'),
      section('## Sport Coach validation track', '## Decision gates'),
    ].join('\n\n'),
  },
  {
    file: 'ROADMAP_PART_05_GROWTH_DECISION_GATES.md',
    title: 'Roadmap Part 05 — Growth and Decision Gates',
    scope: 'Production growth, decision gates, dependency chain, and historical sprint references',
    body: [
      section('## Phase 5 — Production Growth', '## Sport Coach validation track'),
      section('## Decision gates'),
    ].join('\n\n'),
  },
]

for (const part of parts) {
  const content = `${frontmatter(part.title, part.scope)}\n# ${part.title}\n\nCanonical index: [ROADMAP.md](../../ROADMAP.md).\n\n${part.body}\n`
  if (content.length > 20000) {
    throw new Error(`ROADMAP_CHUNK_TOO_LARGE: ${part.file}:${content.length}`)
  }
  fs.writeFileSync(path.join(root, 'docs', 'roadmap', part.file), content)
}

const index = `---
title: Roadmap Index
owner: Product Lead
status: Active
source_of_truth: true
last_review: 2026-07-29
next_review: 2026-08-09
---

# GO IRL Product Roadmap

This file is the canonical roadmap index and current-state summary. Detailed roadmap scope is delegated to the five canonical parts below. Historical sprint records remain supporting evidence and never override this index or the current lifecycle authority in \`docs/release/CURRENT_PHASE.md\`.

GO IRL is a Telegram-first local meetup layer that helps people leave the chat and meet in real life. The product is being built as a platform, not as a one-off Mini App, so new work must remain compatible with future web, Android, and iOS clients.

## Current state

Closed Beta was completed on 2026-07-20. The active phase is **Release Preparation and Stabilization**. Broad public launch is not yet claimed.

Current proven baseline:

- Browser Mock Mode works for non-Telegram usage.
- Browser demo writes are local-only and must not touch production Supabase.
- Sport details include Coach and Event Chat.
- Event cards, time rendering, support flow, weather, and Telegram \`startapp\` sharing have working implementations.
- The core product loop is present: create event, share, join, chat, and meet in real life.

Release remains gated by reviewed quality checks, real Telegram smoke verification, approved Supabase/RLS verification, and evidenced Vercel, support, monitoring, analytics, moderation, and incident readiness.

## Canonical roadmap parts

| Part | Scope | State | Load when |
|---|---|---|---|
| [Part 01 — Foundation and MVP](docs/roadmap/ROADMAP_PART_01_FOUNDATION_MVP.md) | Product thesis, guardrails, Foundation, MVP Core | Complete / Historical | Mission concerns product boundaries, MVP, or historical foundation |
| [Part 02 — Release Preparation](docs/roadmap/ROADMAP_PART_02_RELEASE_PREPARATION.md) | Current release and stabilization workstreams | Active | Mission concerns current state, release, infrastructure, UX stabilization, or operations |
| [Part 03 — Telegram and Notifications](docs/roadmap/ROADMAP_PART_03_TELEGRAM_NOTIFICATIONS.md) | Telegram-native coordination and notifications | Draft / Gated | Mission concerns Telegram runtime, reminders, or notifications |
| [Part 04 — Trust and Modules](docs/roadmap/ROADMAP_PART_04_TRUST_MODULES.md) | Trust, attendance, modules, discovery, Sport Coach | Draft / Gated | Mission concerns trust, attendance, Coach, modules, discovery, or expansion evidence |
| [Part 05 — Growth and Decision Gates](docs/roadmap/ROADMAP_PART_05_GROWTH_DECISION_GATES.md) | Production growth, decision gates, dependencies, sprint references | Draft / Gated | Mission concerns growth, gates, sequencing, dependencies, or historical sprint traceability |

## Roadmap at a glance

| Phase | State | Primary gate |
|---|---|---|
| Phase 0 — Foundation | Complete / Historical | Historical record only |
| Phase 1 — MVP Core | Complete / Historical | Preserve and verify the core loop |
| Release Preparation and Stabilization | Active | Current \`main\` and runtime evidence |
| Phase 2 — Telegram and Notifications | Draft / Gated | Release gate green |
| Phase 3 — Trust and Real Attendance | Draft / Gated | Stable loop and explicit trust approval |
| Phase 4 — Modules and Discovery | Draft / Gated | Olomouc and Sport evidence |
| Phase 5 — Production Growth | Draft / Gated | Public-safety and operational readiness |

## Retrieval contract

- Always read this index first.
- Select only the part or parts required by the mission.
- Do not load all five parts by default.
- Record the exact GitHub commit SHA and every loaded part path.
- Fail closed if a required part is missing, stale, or exceeds 20,000 characters.
- \`Completed\` is forbidden when required roadmap context is incomplete.

Major product and architecture decisions must also follow:

- [GO IRL Constitution](docs/GO_IRL_CONSTITUTION.md)
- [Market Positioning](docs/MARKET_POSITIONING.md)
- [Competitor Watch](docs/COMPETITOR_WATCH.md)
- [Sport Coach MVP](docs/SPORT_COACH_MVP.md)
`

fs.writeFileSync(roadmapPath, index)

console.log(JSON.stringify({
  index: { file: 'ROADMAP.md', characters: index.length },
  parts: parts.map(part => ({
    file: `docs/roadmap/${part.file}`,
    characters: fs.readFileSync(path.join(root, 'docs', 'roadmap', part.file), 'utf8').length,
  })),
}, null, 2))
