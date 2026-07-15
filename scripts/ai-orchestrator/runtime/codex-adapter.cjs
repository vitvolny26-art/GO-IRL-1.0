const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { OrchestratorError, artifactFile, loadState, readJson, requireMission } = require('./core.cjs');
const { submitImplementerResult, submitReviewerResult } = require('./workflow.cjs');

function codexCommand() {
  if (process.platform === 'win32') {
    const script = path.join(process.env.APPDATA || '', 'npm', 'node_modules', '@openai', 'codex', 'bin', 'codex.js');
    if (fs.existsSync(script)) return { executable: process.execPath, prefixArgs: [script] };
  }
  return { executable: 'codex', prefixArgs: [] };
}

function defaultCodexRunner(executable, args, options) {
  const result = spawnSync(executable, args, {
    cwd: options.cwd,
    encoding: 'utf8',
    input: options.input,
    shell: false,
  });
  return {
    status: result.status ?? 1,
    stdout: result.stdout || '',
    stderr: result.stderr || result.error?.message || '',
  };
}

function assertBudgetReservation(record, estimatedCostUsd) {
  const cost = Number(estimatedCostUsd);
  if (!Number.isFinite(cost) || cost <= 0) {
    throw new OrchestratorError('COST_ESTIMATE_REQUIRED', 'Real Codex execution requires a positive estimated cost.');
  }
  const projected = Number(((record.budget_spent_usd || 0) + cost).toFixed(6));
  if (projected > record.mission.maximum_budget_usd) {
    throw new OrchestratorError('BUDGET_EXCEEDED', 'Codex execution would exceed the Mission budget.', {
      maximum_budget_usd: record.mission.maximum_budget_usd,
      projected_budget_usd: projected,
    });
  }
  return cost;
}

function implementerPrompt(record) {
  const handoff = readJson(record.artifacts.codex_handoff.path);
  const specialist = handoff.specialist_profile
    ? `\nSpecialist profile: ${handoff.specialist_profile.role}. Follow its required reading, cleanup workflow, and write controls while still returning role "Codex Implementer".\n`
    : '';
  return `You are the Codex Implementer for a human-approved GO IRL Mission.${specialist}\n${JSON.stringify(handoff, null, 2)}\n\nWork only inside the exact write scope. Do not commit, push, create a PR, merge, deploy, modify dependencies, or self-approve. Return only one JSON Agent Result matching the provided output schema. changed_files must exactly match the worktree changes you made.`;
}

function reviewerPrompt(record) {
  const handoff = readJson(record.artifacts.codex_handoff.path);
  const implementerResult = record.agent_executions.implementer.result;
  return `You are an Independent Reviewer. This is a separate read-only execution.\n\nMission handoff:\n${JSON.stringify(handoff, null, 2)}\n\nImplementer result:\n${JSON.stringify(implementerResult, null, 2)}\n\nThe isolated branch may contain changes that predate this Mission and were captured in its worktree baseline. Review only the files declared in implementer changed_files, while checking them against the Mission and acceptance criteria. Do not modify files, approve your own work, commit, push, create a PR, merge, or deploy. Return only one JSON Agent Result with role \"Independent Reviewer\" and status PASS, CHANGES_REQUIRED, or BLOCKED.`;
}

function invokeCodex({ role, record, repoRoot, stateDir, runner = defaultCodexRunner }) {
  const isImplementer = role === 'implementer';
  const outputFile = artifactFile(stateDir, record.mission.mission_id, `codex-${role}-output-${Date.now()}.json`);
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  const schemaFile = path.join(__dirname, '..', 'schemas', 'agent-result-output.schema.json');
  const args = [
    '--sandbox', isImplementer ? 'workspace-write' : 'read-only',
    '--ask-for-approval', 'never',
    '--cd', path.resolve(repoRoot),
    'exec',
    '--ephemeral',
    '--output-schema', schemaFile,
    '--output-last-message', outputFile,
    '-',
  ];
  const command = codexCommand();
  const result = runner(command.executable, [...command.prefixArgs, ...args], {
    cwd: repoRoot,
    input: isImplementer ? implementerPrompt(record) : reviewerPrompt(record),
    outputFile,
  });
  if (result.status !== 0) {
    throw new OrchestratorError('CODEX_EXECUTION_FAILED', `Codex ${role} execution failed.`, {
      error_block: [result.stdout, result.stderr].filter(Boolean).join('\n').trim(),
    });
  }
  if (!fs.existsSync(outputFile)) {
    throw new OrchestratorError('CODEX_RESULT_MISSING', 'Codex completed without writing the structured Agent Result.');
  }
  return { result: readJson(outputFile), outputFile, args };
}

function runCodexImplementer({ missionId, stateDir, repoRoot, executionId, estimatedCostUsd, runner }) {
  const state = loadState(stateDir);
  const record = requireMission(state, missionId);
  if (!['planned', 'correction_requested'].includes(record.state)) {
    throw new OrchestratorError('IMPLEMENTER_NOT_EXPECTED', 'Mission is not awaiting Codex implementation.', { state: record.state });
  }
  const cost = assertBudgetReservation(record, estimatedCostUsd);
  const invocation = invokeCodex({ role: 'implementer', record, repoRoot, stateDir, runner });
  const updated = submitImplementerResult({
    missionId, stateDir, repoRoot, executionId, costUsd: cost, result: invocation.result,
  });
  return { invocation, record: updated };
}

function runCodexReviewer({ missionId, stateDir, repoRoot, executionId, estimatedCostUsd, runner }) {
  const state = loadState(stateDir);
  const record = requireMission(state, missionId);
  if (record.state !== 'reviewing') {
    throw new OrchestratorError('REVIEWER_NOT_EXPECTED', 'Mission is not awaiting Codex review.', { state: record.state });
  }
  const cost = assertBudgetReservation(record, estimatedCostUsd);
  const invocation = invokeCodex({ role: 'reviewer', record, repoRoot, stateDir, runner });
  const updated = submitReviewerResult({
    missionId, stateDir, executionId, costUsd: cost, result: invocation.result,
  });
  return { invocation, record: updated };
}

module.exports = {
  assertBudgetReservation,
  codexCommand,
  defaultCodexRunner,
  implementerPrompt,
  invokeCodex,
  reviewerPrompt,
  runCodexImplementer,
  runCodexReviewer,
};
