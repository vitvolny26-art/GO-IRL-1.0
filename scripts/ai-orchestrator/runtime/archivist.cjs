const ARCHIVIST_PROFILE = {
  key: 'project_archivist',
  role: 'Project Archivist',
  purpose: 'Protect project memory, source-of-truth hierarchy, and documentation continuity.',
  activation_commands: ['Beru tebya Arhivariusom', 'Create a Project Archivist'],
  required_reading: [
    'DOCS_INDEX.md',
    'README.md',
    'docs/onboarding/AI_ROLES.md',
    'docs/governance/AI_ORGANIZATION.md',
    'docs/onboarding/ARCHIVIST_CHARTER.md',
    'docs/MVP_DOC_AUDIT.md',
    'docs/MISSING_SECTIONS.md',
    'docs/audit/KNOWLEDGE_DEBT.md',
    'docs/reports/README.md',
  ],
  cleanup_workflow: [
    'Inventory documentation against DOCS_INDEX and README before proposing edits.',
    'Classify every finding as stale, duplicate, missing, conflicting, deprecated, or source-of-truth drift.',
    'Keep future vision subordinate to current MVP source-of-truth documents.',
    'If canonical documentation is outside the Mission write scope, create a report with exact follow-up tasks instead of editing it.',
    'Leave a durable Agent Report under docs/reports before closing the work session.',
  ],
  write_controls: [
    'Never edit secrets, .env files, auth, RLS, SQL, migrations, deployment files, or production data.',
    'Never change DOCS_INDEX, roadmap, backlog, or source-of-truth documents unless they are explicitly inside exact_write_scope.',
    'Do not mark documentation complete without validation evidence.',
  ],
};

const ARCHIVIST_TERMS = [
  'archivist',
  'project memory',
  'source-of-truth control',
  'source of truth control',
];

const DOCUMENTATION_TERMS = [
  'documentation',
  'docs',
  'doc audit',
  'docs_index',
  'registry',
  'knowledge debt',
  'source-of-truth',
  'source of truth',
];

function combinedMissionText(mission, contextPack = {}) {
  const evidence = (contextPack.grep_evidence || [])
    .map((item) => `${item.query || ''} ${item.path || ''} ${item.excerpt || ''}`)
    .join(' ');
  return [
    mission.objective,
    ...(mission.source_of_truth_refs || []),
    evidence,
  ].join(' ').toLocaleLowerCase('en-US');
}

function containsAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

function isArchivistMission(mission, contextPack = {}) {
  const text = combinedMissionText(mission, contextPack);
  return containsAny(text, ARCHIVIST_TERMS)
    || (containsAny(text, DOCUMENTATION_TERMS) && text.includes('ai_roles.md') && text.includes('ai_organization.md'));
}

function createArchivistProfile(mission, contextPack = {}) {
  if (!isArchivistMission(mission, contextPack)) return null;
  return {
    ...ARCHIVIST_PROFILE,
    mission_fit: 'The Mission context references Archivist governance and documentation-ordering work.',
  };
}

module.exports = {
  ARCHIVIST_PROFILE,
  createArchivistProfile,
  isArchivistMission,
};
