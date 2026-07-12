const {
  OrchestratorError,
  isSensitivePath,
  matchesAny,
  normalizeRepoPath,
} = require('./core.cjs');

const ROOT_WIDE_PATTERNS = new Set(['*', '**', '**/*']);

function missionPolicyViolations(mission) {
  const violations = [];
  for (const pattern of mission.allowed_paths || []) {
    const normalized = normalizeRepoPath(pattern);
    if (ROOT_WIDE_PATTERNS.has(normalized)) {
      violations.push({ code: 'ROOT_WIDE_WRITE_SCOPE', path: normalized });
    }
    if (isSensitivePath(normalized)) {
      violations.push({ code: 'SENSITIVE_WRITE_SCOPE', path: normalized });
    }
  }
  for (const source of mission.source_of_truth_refs || []) {
    const normalized = normalizeRepoPath(source);
    if (matchesAny(normalized, mission.allowed_paths || [])) {
      violations.push({ code: 'SOURCE_OF_TRUTH_WRITE_SCOPE', path: normalized });
    }
  }
  return violations;
}

function assertMissionPolicy(mission) {
  const violations = missionPolicyViolations(mission);
  if (violations.length > 0) {
    throw new OrchestratorError('MISSION_POLICY_REJECTED', 'Mission violates the runtime intake policy.', { violations });
  }
  return mission;
}

module.exports = { ROOT_WIDE_PATTERNS, assertMissionPolicy, missionPolicyViolations };
