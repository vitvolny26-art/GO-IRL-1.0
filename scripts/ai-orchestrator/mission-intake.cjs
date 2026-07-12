#!/usr/bin/env node
const fs = require('node:fs');
const { OrchestratorError, intakeMission, sha256, stableStringify } = require('./runtime/core.cjs');
const { assertMissionPolicy } = require('./runtime/mission-policy.cjs');
const { defaultStateDirectory } = require('./runtime/locations.cjs');
const { validateMission } = require('./validate-mission.cjs');

function parseOptions(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (item !== '--actor') {
      const error = new Error('Unknown mission intake option.');
      error.code = 'MISSION_INTAKE_OPTION_UNKNOWN';
      throw error;
    }
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) {
      const error = new Error('Missing --actor value.');
      error.code = 'HUMAN_ACTOR_REQUIRED';
      throw error;
    }
    options.actor = value;
    index += 1;
  }
  return options;
}

function parseMissionJson(text) {
  try {
    const mission = JSON.parse(text);
    if (!mission || typeof mission !== 'object' || Array.isArray(mission)) throw new Error('Mission must be an object.');
    return mission;
  } catch {
    const error = new Error('Mission input must be one valid JSON object.');
    error.code = 'MISSION_JSON_INVALID';
    throw error;
  }
}

function createMissionId(mission) {
  const { mission_id: ignoredMissionId, ...payload } = mission;
  void ignoredMissionId;
  return `MISSION-${sha256(stableStringify(payload)).slice(0, 20).toUpperCase()}`;
}

function normalizeMission(mission) {
  return { ...mission, mission_id: mission.mission_id || createMissionId(mission) };
}

function intakeAcceptedMission({ mission, actor, stateDir, now = new Date() }) {
  if (!actor || actor.trim() === '') {
    throw new OrchestratorError('HUMAN_ACTOR_REQUIRED', 'Mission intake requires the upstream human approval actor.');
  }
  const normalized = normalizeMission(mission);
  const errors = validateMission(normalized);
  if (errors.length > 0) {
    throw new OrchestratorError('MISSION_INVALID', 'Mission contract validation failed.', { errors });
  }
  assertMissionPolicy(normalized);
  const result = intakeMission({ mission: normalized, stateDir, acceptedBy: actor.trim(), now });
  return {
    success: true,
    mission_id: result.record.mission.mission_id,
    status: 'accepted',
    next_action: 'context_build',
  };
}

function failureResponse(error, missionId) {
  const safeMessages = {
    HUMAN_ACTOR_REQUIRED: 'An upstream human approval actor is required.',
    MISSION_JSON_INVALID: 'Mission input must be one valid JSON object.',
    MISSION_INVALID: 'Mission schema validation failed.',
    MISSION_POLICY_REJECTED: 'Mission policy validation failed.',
    DUPLICATE_MISSION: 'An equivalent Mission already exists.',
    ACTIVE_MISSION_EXISTS: 'Another Mission is already active.',
    MISSION_CONFLICT: 'Mission ID conflicts with an existing payload.',
    MISSION_EXPIRED: 'Mission is expired.',
    MISSION_INTAKE_OPTION_UNKNOWN: 'Unknown mission intake option.',
  };
  return {
    success: false,
    mission_id: missionId || null,
    status: 'rejected',
    next_action: 'fix_mission',
    error: {
      code: error.code || 'MISSION_INTAKE_FAILED',
      message: safeMessages[error.code] || 'Mission intake was rejected.',
    },
  };
}

function runMissionIntakeCli(argv, options = {}) {
  const stdout = options.stdout || process.stdout;
  const stateDir = options.stateDir || defaultStateDirectory();
  let mission;
  let response;
  try {
    const parsedOptions = parseOptions(argv);
    const input = options.input === undefined ? fs.readFileSync(0, 'utf8') : options.input;
    mission = parseMissionJson(input);
    response = intakeAcceptedMission({ mission, actor: parsedOptions.actor, stateDir, now: options.now });
  } catch (error) {
    response = failureResponse(error, mission?.mission_id || (mission ? createMissionId(mission) : null));
  }
  stdout.write(`${JSON.stringify(response)}\n`);
  return response.success ? 0 : 1;
}

if (require.main === module) process.exitCode = runMissionIntakeCli(process.argv.slice(2));

module.exports = {
  createMissionId,
  failureResponse,
  intakeAcceptedMission,
  normalizeMission,
  parseMissionJson,
  parseOptions,
  runMissionIntakeCli,
};
