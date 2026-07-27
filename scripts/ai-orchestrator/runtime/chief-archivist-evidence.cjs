const fs = require('node:fs');
const path = require('node:path');
const { OrchestratorError, sha256 } = require('./core.cjs');

const REQUIRED_PROMPTS = Object.freeze([
  'chief-archivist.md',
  'evidence-contract.md',
  'report-schema.md',
]);

const EVIDENCE_ID_PATTERN = /(?:GH|DRIVE|CLICKUP|RUNTIME):[A-Za-z0-9._/@<>-]+/g;
const EVIDENCE_ID_EXACT_PATTERN = /^(?:GH|DRIVE|CLICKUP|RUNTIME):[A-Za-z0-9._/@<>-]+$/;
const GLOBAL_SCOPE_PATTERN = /(?:^|\b)(?:all|everything|entire project|project-wide)(?:\b|$)|(?:без ограничений|весь проект)/iu;
const STRONG_CLAIM_PATTERNS = [
  /\ball required\b/iu,
  /\ball checks\b/iu,
  /\bchecks? (?:passed|pass|green)\b/iu,
  /\bno blockers? remain\b/iu,
  /\b(?:is|are) (?:current|aligned|verified|ready)\b/iu,
  /\b(?:confirmed|verified) (?:alignment|complete|completion|current|ready)\b/iu,
  /\b(?:workflow|deployment|release|project|source|document|github|drive|clickup)\b.*\b(?:active|published|deployed|merged|ready|current|aligned|complete)\b/iu,
  /все (?:обязательные|проверки|источники)/iu,
  /проверки (?:пройдены|зел[её]ные)/iu,
  /блокеров нет/iu,
  /(?:^|\s)(?:готов|готова|готово|готовы)(?:\s|[.,;:!?]|$)/iu,
  /(?:подтверждено|проверено|сверено)/iu,
  /(?:воркфлоу|релиз|проект|источник|документ|github|drive|clickup).*(?:активен|активна|опубликован|разв[её]рнут|объедин[её]н|готов|актуален|сверен|заверш[её]н)/iu,
];

function assertPositiveInteger(value, name) {
  if (!Number.isInteger(value) || value < 1) {
    throw new OrchestratorError('ARCHIVIST_LIMIT_INVALID', `${name} must be a positive integer.`, { field: name });
  }
}

function normalizeSource(source, index) {
  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    throw new OrchestratorError('ARCHIVIST_EVIDENCE_INVALID', 'Each evidence source must be an object.', { index });
  }
  const id = typeof source.id === 'string' ? source.id.trim() : '';
  const content = typeof source.content === 'string' ? source.content : '';
  const authorityRank = Number.isInteger(source.authority_rank) ? source.authority_rank : 100;
  if (!EVIDENCE_ID_EXACT_PATTERN.test(id)) {
    throw new OrchestratorError('ARCHIVIST_EVIDENCE_ID_INVALID', 'Evidence source has an invalid ID.', { index });
  }
  if (!content.trim()) {
    throw new OrchestratorError('ARCHIVIST_EVIDENCE_EMPTY', 'Evidence source content must not be empty.', { id });
  }
  return {
    id,
    authority_rank: authorityRank,
    content,
    kind: typeof source.kind === 'string' && source.kind.trim() ? source.kind.trim() : 'evidence',
  };
}

function compareSources(left, right) {
  return left.authority_rank - right.authority_rank
    || left.id.localeCompare(right.id, 'en', { sensitivity: 'variant' });
}

function selectArchivistEvidence({
  sources,
  requestedEvidenceIds,
  maxSources = 12,
  maxCharacters = 30_000,
}) {
  if (!Array.isArray(sources)) {
    throw new OrchestratorError('ARCHIVIST_EVIDENCE_INVALID', 'Evidence sources must be an array.');
  }
  assertPositiveInteger(maxSources, 'maxSources');
  assertPositiveInteger(maxCharacters, 'maxCharacters');

  const normalized = sources.map(normalizeSource);
  const ids = new Set();
  for (const source of normalized) {
    if (ids.has(source.id)) {
      throw new OrchestratorError('ARCHIVIST_EVIDENCE_DUPLICATE', 'Evidence IDs must be unique.', { id: source.id });
    }
    ids.add(source.id);
  }

  let candidates = normalized;
  if (requestedEvidenceIds !== undefined) {
    if (!Array.isArray(requestedEvidenceIds) || requestedEvidenceIds.some((id) => typeof id !== 'string')) {
      throw new OrchestratorError('ARCHIVIST_EVIDENCE_REQUEST_INVALID', 'Requested evidence IDs must be an array of strings.');
    }
    const requested = new Set(requestedEvidenceIds);
    const missing = [...requested].filter((id) => !ids.has(id)).sort();
    if (missing.length > 0) {
      throw new OrchestratorError('ARCHIVIST_EVIDENCE_UNAVAILABLE', 'Requested evidence is unavailable.', { missing });
    }
    candidates = normalized.filter((source) => requested.has(source.id));
  }

  const selected = [];
  let totalCharacters = 0;
  for (const source of [...candidates].sort(compareSources)) {
    if (selected.length >= maxSources || totalCharacters >= maxCharacters) break;
    const remaining = maxCharacters - totalCharacters;
    const content = source.content.slice(0, remaining);
    if (!content) break;
    selected.push({
      id: source.id,
      authority_rank: source.authority_rank,
      kind: source.kind,
      content,
      truncated: content.length < source.content.length,
    });
    totalCharacters += content.length;
  }

  return {
    selected,
    allowed_evidence_ids: selected.map((source) => source.id),
    size: {
      source_count: selected.length,
      character_count: totalCharacters,
      max_sources: maxSources,
      max_characters: maxCharacters,
      within_limit: selected.length <= maxSources && totalCharacters <= maxCharacters,
    },
  };
}

function loadVersionedArchivistPrompts({ repoRoot, promptDirectory } = {}) {
  if (!repoRoot) {
    throw new OrchestratorError('ARCHIVIST_REPO_ROOT_REQUIRED', 'Repository root is required to load versioned prompts.');
  }
  const root = fs.realpathSync(path.resolve(repoRoot));
  const directory = path.resolve(root, promptDirectory || path.join('scripts', 'ai-orchestrator', 'prompts'));
  const relative = path.relative(root, directory);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new OrchestratorError('ARCHIVIST_PROMPT_SCOPE_INVALID', 'Prompt directory must stay inside the repository.');
  }

  const prompts = {};
  for (const fileName of REQUIRED_PROMPTS) {
    const file = path.join(directory, fileName);
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
      throw new OrchestratorError('ARCHIVIST_PROMPT_MISSING', 'A required versioned Chief Archivist prompt is missing.', {
        prompt: fileName,
      });
    }
    const content = fs.readFileSync(file, 'utf8');
    if (!content.trim()) {
      throw new OrchestratorError('ARCHIVIST_PROMPT_EMPTY', 'A required versioned Chief Archivist prompt is empty.', {
        prompt: fileName,
      });
    }
    prompts[fileName] = {
      content,
      sha256: sha256(content),
    };
  }
  return prompts;
}

function buildArchivistRuntimeEnvelope(options) {
  const prompts = loadVersionedArchivistPrompts(options);
  const evidence = selectArchivistEvidence(options);
  return {
    prompts,
    evidence: evidence.selected,
    allowed_evidence_ids: evidence.allowed_evidence_ids,
    size: evidence.size,
  };
}

function normalizeClaim(value) {
  return value
    .toLocaleLowerCase('ru')
    .replace(/[`*_()[\]{}:;,.!?'"«»]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseEvidenceLedger(report) {
  const marker = '## Evidence ledger';
  const markerIndex = report.indexOf(marker);
  if (markerIndex < 0) {
    throw new OrchestratorError('ARCHIVIST_LEDGER_MISSING', 'Report is missing the Evidence ledger.');
  }
  const tail = report.slice(markerIndex + marker.length);
  const lines = tail.split(/\r?\n/);
  const tableLines = [];
  let started = false;
  for (const line of lines) {
    if (!line.trim()) {
      if (started) break;
      continue;
    }
    if (!line.trim().startsWith('|')) {
      if (started) break;
      continue;
    }
    started = true;
    tableLines.push(line.trim());
  }
  if (tableLines.length < 3) {
    throw new OrchestratorError('ARCHIVIST_LEDGER_INVALID', 'Evidence ledger must contain a header and at least one row.');
  }

  const cells = (line) => line.slice(1, -1).split('|').map((cell) => cell.trim());
  const header = cells(tableLines[0]);
  if (header.length !== 3 || header[0] !== 'Claim' || header[1] !== 'Evidence' || header[2] !== 'Scope') {
    throw new OrchestratorError('ARCHIVIST_LEDGER_INVALID', 'Evidence ledger columns must be Claim, Evidence, and Scope.');
  }
  const separator = cells(tableLines[1]);
  if (separator.length !== 3 || separator.some((cell) => !/^:?-{3,}:?$/.test(cell))) {
    throw new OrchestratorError('ARCHIVIST_LEDGER_INVALID', 'Evidence ledger separator is invalid.');
  }
  return tableLines.slice(2).map((line, index) => {
    const row = cells(line);
    if (row.length !== 3 || row.some((cell) => !cell)) {
      throw new OrchestratorError('ARCHIVIST_LEDGER_INVALID', 'Evidence ledger row must contain three non-empty cells.', {
        row: index + 1,
      });
    }
    return { claim: row[0], evidence: row[1], scope: row[2] };
  });
}

function extractStrongClaims(report) {
  const beforeLedger = report.split('## Evidence ledger')[0];
  return beforeLedger
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:[-*]|\d+\.)\s+/, '').trim())
    .filter((line) => line && !line.startsWith('#') && STRONG_CLAIM_PATTERNS.some((pattern) => pattern.test(line)));
}

function ledgerCoversClaim(claim, ledgerClaim) {
  const normalizedClaim = normalizeClaim(claim);
  const normalizedLedger = normalizeClaim(ledgerClaim);
  return normalizedClaim === normalizedLedger
    || normalizedClaim.includes(normalizedLedger)
    || normalizedLedger.includes(normalizedClaim);
}

function validateArchivistResult({ result, allowedEvidenceIds }) {
  if (!result || typeof result !== 'object' || Array.isArray(result)) {
    throw new OrchestratorError('ARCHIVIST_RESULT_INVALID', 'Chief Archivist result must be an object.');
  }
  const allowed = new Set(Array.isArray(allowedEvidenceIds) ? allowedEvidenceIds : []);
  if (!['COMPLETED', 'BLOCKED'].includes(result.status)
      || !Array.isArray(result.blockers)
      || typeof result.report !== 'string') {
    throw new OrchestratorError('ARCHIVIST_RESULT_INVALID', 'Chief Archivist result violates the transport schema.');
  }
  if (result.status === 'COMPLETED' && result.blockers.length > 0) {
    throw new OrchestratorError('ARCHIVIST_STATUS_INVALID', 'COMPLETED requires an empty blockers array.');
  }
  if (result.status === 'BLOCKED' && result.blockers.length === 0) {
    throw new OrchestratorError('ARCHIVIST_STATUS_INVALID', 'BLOCKED requires at least one blocker.');
  }

  const rows = parseEvidenceLedger(result.report);
  if (result.status === 'COMPLETED' && rows.length < 3) {
    throw new OrchestratorError('ARCHIVIST_LEDGER_TOO_SMALL', 'COMPLETED requires at least three Evidence ledger rows.', {
      row_count: rows.length,
    });
  }
  if (result.status === 'COMPLETED'
      && new Set(rows.map((row) => normalizeClaim(row.claim))).size !== rows.length) {
    throw new OrchestratorError('ARCHIVIST_LEDGER_DUPLICATE', 'COMPLETED requires substantive, non-duplicate ledger claims.');
  }

  for (const [index, row] of rows.entries()) {
    if (GLOBAL_SCOPE_PATTERN.test(row.scope.trim())) {
      throw new OrchestratorError('ARCHIVIST_SCOPE_GLOBAL', 'Evidence scope must be bounded.', { row: index + 1 });
    }
    const references = row.evidence.match(EVIDENCE_ID_PATTERN) || [];
    if (references.length === 0) {
      throw new OrchestratorError('ARCHIVIST_EVIDENCE_REFERENCE_MISSING', 'Evidence row has no evidence ID.', {
        row: index + 1,
      });
    }
    const unselected = references.filter((id) => !allowed.has(id));
    if (unselected.length > 0) {
      throw new OrchestratorError('ARCHIVIST_EVIDENCE_NOT_SELECTED', 'Evidence row references unselected evidence.', {
        row: index + 1,
        unselected: [...new Set(unselected)].sort(),
      });
    }
  }

  const strongClaims = extractStrongClaims(result.report);
  const unsupported = strongClaims.filter((claim) => !rows.some((row) => ledgerCoversClaim(claim, row.claim)));
  if (unsupported.length > 0) {
    throw new OrchestratorError('ARCHIVIST_STRONG_CLAIM_UNSUPPORTED', 'Strong report claims require matching ledger claims.', {
      claims: unsupported,
    });
  }

  return {
    valid: true,
    status: result.status,
    ledger_rows: rows.length,
    strong_claims: strongClaims.length,
  };
}

module.exports = {
  REQUIRED_PROMPTS,
  buildArchivistRuntimeEnvelope,
  extractStrongClaims,
  loadVersionedArchivistPrompts,
  parseEvidenceLedger,
  selectArchivistEvidence,
  validateArchivistResult,
};
