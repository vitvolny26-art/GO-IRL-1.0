const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { validateMission } = require('../validate-mission.cjs');

const TERMINAL_STATES = new Set([
  'archived',
  'blocked',
  'rejected',
  'expired',
  'scope_violation',
  'checks_failed',
  'budget_exceeded',
  'cancelled',
]);

const TRANSITIONS = {
  proposed: ['validated', 'rejected', 'expired', 'scope_violation'],
  validated: ['awaiting_mission_approval'],
  awaiting_mission_approval: ['approved', 'rejected', 'expired', 'cancelled'],
  approved: ['context_ready', 'blocked', 'scope_violation', 'expired', 'cancelled'],
  context_ready: ['planned', 'blocked', 'scope_violation', 'expired', 'cancelled'],
  planned: ['implementing', 'blocked', 'expired', 'cancelled'],
  implementing: ['reviewing', 'blocked', 'scope_violation', 'budget_exceeded'],
  reviewing: ['correction_requested', 'checking', 'blocked', 'scope_violation', 'budget_exceeded', 'expired', 'cancelled'],
  correction_requested: ['implementing', 'blocked', 'expired', 'cancelled'],
  checking: ['awaiting_change_approval', 'checks_failed', 'expired', 'cancelled'],
  awaiting_change_approval: ['report_ready', 'cancelled'],
  report_ready: ['committed', 'checks_failed', 'cancelled'],
  checks_failed: ['checking', 'report_ready', 'cancelled'],
  committed: ['pushed', 'blocked'],
  pushed: ['draft_pr', 'blocked'],
  draft_pr: ['archived'],
};

const SENSITIVE_PATTERNS = [
  /(?:^|\/)(?:auth|authentication)(?:\/|$)/i,
  /(?:^|\/)rls(?:\/|$)/i,
  /(?:^|\/)sql(?:\/|$)|\.sql$/i,
  /(?:^|\/)migrations?(?:\/|$)/i,
  /(?:^|\/)(?:deploy(?:ment)?|vercel)(?:\/|$)|(?:^|\/)vercel\.json$|(?:^|\/)\.vercel(?:\/|$)|(?:^|\/)deployment\.md$/i,
  /(?:^|\/)production[-_]?data(?:\/|$)/i,
  /(?:^|\/)(?:secrets?|credentials?)(?:\/|$)/i,
  /(?:^|\/)\.env(?:[./*]|$)/i,
];

class OrchestratorError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'OrchestratorError';
    this.code = code;
    this.details = details;
  }
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
  }
  return value;
}

function stableStringify(value) {
  return JSON.stringify(stableValue(value));
}

function sha256(value) {
  const input = Buffer.isBuffer(value) ? value : Buffer.from(String(value));
  return crypto.createHash('sha256').update(input).digest('hex');
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJsonAtomic(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  fs.renameSync(temporary, file);
}

function normalizeRepoPath(value) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new OrchestratorError('INVALID_PATH', 'Repository path must be a non-empty string.');
  }
  const normalized = value.replaceAll('\\', '/').replace(/^\.\//, '');
  if (path.posix.isAbsolute(normalized) || /^[A-Za-z]:\//.test(normalized)) {
    throw new OrchestratorError('INVALID_PATH', 'Absolute repository paths are forbidden.', { path: value });
  }
  const segments = normalized.split('/');
  if (segments.some((segment) => segment === '..' || segment === '')) {
    throw new OrchestratorError('INVALID_PATH', 'Path traversal and empty path segments are forbidden.', { path: value });
  }
  return normalized;
}

function globToRegExp(glob) {
  const normalized = normalizeRepoPath(glob);
  let expression = '^';
  for (let index = 0; index < normalized.length; index += 1) {
    const character = normalized[index];
    if (character === '*' && normalized[index + 1] === '*') {
      if (normalized[index + 2] === '/') {
        expression += '(?:.*/)?';
        index += 2;
      } else {
        expression += '.*';
        index += 1;
      }
    } else if (character === '*') {
      expression += '[^/]*';
    } else if (character === '?') {
      expression += '[^/]';
    } else {
      expression += character.replace(/[|\\{}()[\]^$+?.]/g, '\\$&');
    }
  }
  return new RegExp(`${expression}$`);
}

function matchesAny(repoPath, patterns) {
  const normalized = normalizeRepoPath(repoPath);
  return patterns.some((pattern) => globToRegExp(pattern).test(normalized));
}

function isSensitivePath(repoPath) {
  const normalized = normalizeRepoPath(repoPath);
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(normalized));
}

function pathDecision(repoPath, mission, options = {}) {
  const normalized = normalizeRepoPath(repoPath);
  if (isSensitivePath(normalized)) return { allowed: false, reason: 'sensitive_scope', path: normalized };
  if (matchesAny(normalized, mission.forbidden_paths)) return { allowed: false, reason: 'forbidden_path', path: normalized };
  if (options.readOnlySource === true && mission.source_of_truth_refs.includes(normalized)) {
    return { allowed: true, reason: 'source_of_truth', path: normalized };
  }
  if (!matchesAny(normalized, mission.allowed_paths)) return { allowed: false, reason: 'outside_allowed_paths', path: normalized };
  return { allowed: true, reason: 'allowed_path', path: normalized };
}

function assertPathsAllowed(repoPaths, mission, options = {}) {
  const decisions = repoPaths.map((repoPath) => pathDecision(repoPath, mission, options));
  const rejected = decisions.filter((decision) => !decision.allowed);
  if (rejected.length > 0) {
    throw new OrchestratorError('SCOPE_VIOLATION', 'One or more paths violate the Mission scope.', { rejected });
  }
  return decisions.map((decision) => decision.path);
}

function stateFile(stateDir) {
  return path.join(path.resolve(stateDir), 'state.json');
}

function loadState(stateDir) {
  const file = stateFile(stateDir);
  if (!fs.existsSync(file)) {
    return { schema_version: '1.0', active_mission_id: null, missions: {} };
  }
  return readJson(file);
}

function saveState(stateDir, state) {
  writeJsonAtomic(stateFile(stateDir), state);
  return state;
}

function artifactFile(stateDir, missionId, name) {
  return path.join(path.resolve(stateDir), 'artifacts', missionId, name);
}

function transition(record, nextState, now = new Date()) {
  const allowed = TRANSITIONS[record.state] || [];
  if (!allowed.includes(nextState)) {
    throw new OrchestratorError('INVALID_TRANSITION', `Cannot transition Mission from ${record.state} to ${nextState}.`, {
      current_state: record.state,
      requested_state: nextState,
    });
  }
  record.state = nextState;
  record.updated_at = now.toISOString();
  record.history.push({ state: nextState, at: record.updated_at });
  return record;
}

function requireMission(state, missionId) {
  const record = state.missions[missionId];
  if (!record) throw new OrchestratorError('MISSION_NOT_FOUND', `Mission ${missionId} was not found.`);
  return record;
}

function semanticMissionHash(mission) {
  const { mission_id: ignoredMissionId, ...semanticPayload } = mission;
  void ignoredMissionId;
  return sha256(stableStringify(semanticPayload));
}

function intakeMission({ mission, stateDir, now = new Date() }) {
  const errors = validateMission(mission);
  if (errors.length > 0) {
    throw new OrchestratorError('MISSION_INVALID', 'Mission contract validation failed.', { errors });
  }

  const state = loadState(stateDir);
  const payloadHash = sha256(stableStringify(mission));
  const semanticHash = semanticMissionHash(mission);
  const existing = state.missions[mission.mission_id];
  if (existing) {
    if (existing.payload_hash === payloadHash) return { idempotent: true, record: existing };
    throw new OrchestratorError('MISSION_CONFLICT', 'Mission ID already exists with a changed payload.', {
      mission_id: mission.mission_id,
    });
  }

  const duplicate = Object.values(state.missions).find((record) => record.semantic_hash === semanticHash);
  if (duplicate) {
    throw new OrchestratorError('DUPLICATE_MISSION', 'An equivalent Mission already exists under another ID.', {
      mission_id: mission.mission_id,
      duplicate_of: duplicate.mission.mission_id,
    });
  }

  if (state.active_mission_id) {
    const active = state.missions[state.active_mission_id];
    if (active && !TERMINAL_STATES.has(active.state)) {
      throw new OrchestratorError('ACTIVE_MISSION_EXISTS', 'Only one active Mission is allowed.', {
        active_mission_id: state.active_mission_id,
      });
    }
  }

  const timestamp = now.toISOString();
  const record = {
    mission,
    payload_hash: payloadHash,
    semantic_hash: semanticHash,
    state: 'proposed',
    created_at: timestamp,
    updated_at: timestamp,
    correction_passes: 0,
    history: [{ state: 'proposed', at: timestamp }],
    artifacts: {},
    agent_executions: {},
    checks: {},
  };
  state.missions[mission.mission_id] = record;

  if (mission.expires_at && Date.parse(mission.expires_at) <= now.getTime()) {
    transition(record, 'expired', now);
    saveState(stateDir, state);
    throw new OrchestratorError('MISSION_EXPIRED', 'Mission expired before intake.', { mission_id: mission.mission_id });
  }

  transition(record, 'validated', now);
  transition(record, 'awaiting_mission_approval', now);
  state.active_mission_id = mission.mission_id;
  saveState(stateDir, state);
  return { idempotent: false, record };
}

function approveMission({ missionId, actor, stateDir, now = new Date() }) {
  if (!actor || actor.trim() === '') throw new OrchestratorError('HUMAN_ACTOR_REQUIRED', 'Mission Approval requires a human actor.');
  const state = loadState(stateDir);
  const record = requireMission(state, missionId);
  if (record.mission.expires_at && Date.parse(record.mission.expires_at) <= now.getTime()) {
    transition(record, 'expired', now);
    state.active_mission_id = null;
    saveState(stateDir, state);
    throw new OrchestratorError('MISSION_EXPIRED', 'Mission expired before approval.', { mission_id: missionId });
  }
  transition(record, 'approved', now);
  record.mission_approval = { actor: actor.trim(), approved_at: now.toISOString() };
  saveState(stateDir, state);
  return record;
}

function closeMission({ missionId, actor, stateDir, action = 'cancel', now = new Date() }) {
  if (!actor || actor.trim() === '') throw new OrchestratorError('HUMAN_ACTOR_REQUIRED', 'Closing a Mission requires a human actor.');
  const state = loadState(stateDir);
  const record = requireMission(state, missionId);
  const nextState = action === 'archive' ? 'archived' : 'cancelled';
  transition(record, nextState, now);
  record.closed_by = { actor: actor.trim(), action, at: now.toISOString() };
  if (state.active_mission_id === missionId) state.active_mission_id = null;
  saveState(stateDir, state);
  return record;
}

module.exports = {
  OrchestratorError,
  TERMINAL_STATES,
  artifactFile,
  approveMission,
  assertPathsAllowed,
  closeMission,
  globToRegExp,
  intakeMission,
  isSensitivePath,
  loadState,
  matchesAny,
  normalizeRepoPath,
  pathDecision,
  readJson,
  requireMission,
  saveState,
  sha256,
  stableStringify,
  transition,
  writeJsonAtomic,
};
