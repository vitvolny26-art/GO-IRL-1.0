#!/usr/bin/env node
const path = require('node:path');
const os = require('node:os');
const { approveMission, closeMission, intakeMission, loadState, readJson, requireMission } = require('./runtime/core.cjs');
const {
  approveChange,
  generateReport,
  prepareMission,
  refreshBaseline,
  runQa,
  retryQa,
  submitImplementerResult,
  submitReviewerResult,
} = require('./runtime/workflow.cjs');
const { publishDraft } = require('./runtime/publisher.cjs');
const { runCodexImplementer, runCodexReviewer } = require('./runtime/codex-adapter.cjs');
const { runBridgeCli } = require('./bridge.cjs');

function parseArguments(argv) {
  const positionals = [];
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith('--')) {
      positionals.push(item);
      continue;
    }
    const key = item.slice(2).replaceAll('-', '_');
    if (key === 'execute' || key === 'execute_agent' || key === 'full') {
      options[key] = true;
      continue;
    }
    const value = argv[index + 1];
    if (value === undefined || value.startsWith('--')) throw new Error(`Missing value for ${item}`);
    options[key] = value;
    index += 1;
  }
  return { positionals, options };
}

function csv(value) {
  return value ? value.split(',').map((item) => item.trim()).filter(Boolean) : [];
}

function required(value, name) {
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function defaultStateDirectory() {
  if (process.platform === 'win32' && process.env.LOCALAPPDATA) {
    return path.join(process.env.LOCALAPPDATA, 'GO-IRL', 'ai-orchestrator');
  }
  if (process.env.XDG_STATE_HOME) return path.join(process.env.XDG_STATE_HOME, 'go-irl', 'ai-orchestrator');
  return path.join(os.homedir(), '.local', 'state', 'go-irl', 'ai-orchestrator');
}

function summarizeRecord(record) {
  return {
    mission_id: record.mission.mission_id,
    state: record.state,
    budget: {
      spent_usd: record.budget_spent_usd || 0,
      maximum_usd: record.mission.maximum_budget_usd,
    },
    correction_passes: record.correction_passes,
    qa_retries: record.qa_retries?.length || 0,
    artifacts: Object.fromEntries(Object.entries(record.artifacts || {}).map(([key, value]) => [key, value.path])),
    implementer_status: record.agent_executions.implementer?.result.status || null,
    reviewer_status: record.agent_executions.reviewer?.result.status || null,
    change_approval: record.change_approval || null,
    draft_pr: record.draft_pr || null,
  };
}

function present(command, output, full) {
  if (full) return output;
  if (command === 'status' && output.missions) {
    return {
      active_mission_id: output.active_mission_id,
      missions: Object.values(output.missions).map(summarizeRecord),
    };
  }
  if (output?.mission && output?.state) return summarizeRecord(output);
  if (output?.record) {
    const presented = { record: summarizeRecord(output.record) };
    if (output.idempotent !== undefined) presented.idempotent = output.idempotent;
    if (output.contextPack) {
      presented.context_pack = {
        file_count: output.contextPack.size_metadata.file_count,
        total_bytes: output.contextPack.size_metadata.total_bytes,
        redaction_status: output.contextPack.secret_redaction.status,
      };
    }
    if (output.invocation) {
      presented.agent_result = output.invocation.result;
      presented.output_file = output.invocation.outputFile;
    }
    if (output.path) presented.path = output.path;
    if (output.plan && output.executed !== undefined) {
      presented.executed = output.executed;
      presented.publish_plan = output.plan;
    }
    return presented;
  }
  if (output?.green !== undefined && Array.isArray(output.results)) {
    return {
      green: output.green,
      results: output.results.map((result) => ({ command: result.command, status: result.status })),
      first_error: output.first_error,
    };
  }
  return output;
}

function usage() {
  return `Usage:
  echo <request.json> | node scripts/ai-orchestrator/orchestrator.cjs bridge <resource> <action>
  node scripts/ai-orchestrator/orchestrator.cjs intake <mission.json> [--state-dir .ai-orchestrator]
  node scripts/ai-orchestrator/orchestrator.cjs approve-mission <mission-id> --actor <human>
  node scripts/ai-orchestrator/orchestrator.cjs prepare <mission-id> --include <csv> --grep <csv>
  node scripts/ai-orchestrator/orchestrator.cjs refresh-baseline <mission-id> --actor <human>
  node scripts/ai-orchestrator/orchestrator.cjs submit-implementer <mission-id> <result.json> --execution <id>
  node scripts/ai-orchestrator/orchestrator.cjs submit-review <mission-id> <result.json> --execution <id>
  node scripts/ai-orchestrator/orchestrator.cjs run-implementer <mission-id> --execution <id> --cost-usd <estimate> --execute-agent
  node scripts/ai-orchestrator/orchestrator.cjs run-reviewer <mission-id> --execution <id> --cost-usd <estimate> --execute-agent
  node scripts/ai-orchestrator/orchestrator.cjs qa <mission-id>
  node scripts/ai-orchestrator/orchestrator.cjs retry-qa <mission-id> --actor <human>
  node scripts/ai-orchestrator/orchestrator.cjs approve-change <mission-id> --actor <human>
  node scripts/ai-orchestrator/orchestrator.cjs report <mission-id> --report <repo-path>
  node scripts/ai-orchestrator/orchestrator.cjs final-qa <mission-id>
  node scripts/ai-orchestrator/orchestrator.cjs publish <mission-id> --selected <csv> --commit-message <text> --pr-title <text> [--execute]
  node scripts/ai-orchestrator/orchestrator.cjs archive <mission-id> --actor <human>
  node scripts/ai-orchestrator/orchestrator.cjs cancel <mission-id> --actor <human>
  node scripts/ai-orchestrator/orchestrator.cjs status [mission-id]`;
}

function runCli(argv) {
  if (argv[0] === 'bridge') return runBridgeCli(argv.slice(1));
  const { positionals, options } = parseArguments(argv);
  const command = positionals[0];
  if (!command) {
    console.error(usage());
    return 2;
  }
  const repoRoot = path.resolve(options.repo || process.cwd());
  const stateDir = options.state_dir ? path.resolve(repoRoot, options.state_dir) : defaultStateDirectory();
  let output;

  if (command === 'intake') {
    output = intakeMission({ mission: readJson(required(positionals[1], 'mission.json')), stateDir });
  } else if (command === 'approve-mission') {
    output = approveMission({ missionId: required(positionals[1], 'mission-id'), actor: options.actor, stateDir });
  } else if (command === 'prepare') {
    output = prepareMission({
      missionId: required(positionals[1], 'mission-id'),
      stateDir,
      repoRoot,
      includePatterns: csv(options.include),
      grepQueries: csv(options.grep),
      maxBytes: options.max_bytes ? Number(options.max_bytes) : undefined,
    });
  } else if (command === 'submit-implementer') {
    output = submitImplementerResult({
      missionId: required(positionals[1], 'mission-id'),
      result: readJson(required(positionals[2], 'result.json')),
      executionId: options.execution,
      costUsd: options.cost_usd,
      stateDir,
      repoRoot,
    });
  } else if (command === 'refresh-baseline') {
    output = refreshBaseline({
      missionId: required(positionals[1], 'mission-id'),
      actor: options.actor,
      stateDir,
      repoRoot,
    });
  } else if (command === 'submit-review') {
    output = submitReviewerResult({
      missionId: required(positionals[1], 'mission-id'),
      result: readJson(required(positionals[2], 'result.json')),
      executionId: options.execution,
      costUsd: options.cost_usd,
      stateDir,
    });
  } else if (command === 'run-implementer' || command === 'run-reviewer') {
    if (options.execute_agent !== true) throw new Error('--execute-agent is required for a real Codex execution.');
    const runAgent = command === 'run-implementer' ? runCodexImplementer : runCodexReviewer;
    output = runAgent({
      missionId: required(positionals[1], 'mission-id'),
      stateDir,
      repoRoot,
      executionId: required(options.execution, '--execution'),
      estimatedCostUsd: required(options.cost_usd, '--cost-usd'),
    });
  } else if (command === 'qa' || command === 'final-qa') {
    output = runQa({
      missionId: required(positionals[1], 'mission-id'),
      stateDir,
      repoRoot,
      final: command === 'final-qa',
    });
  } else if (command === 'retry-qa') {
    output = retryQa({ missionId: required(positionals[1], 'mission-id'), actor: options.actor, stateDir });
  } else if (command === 'approve-change') {
    output = approveChange({ missionId: required(positionals[1], 'mission-id'), actor: options.actor, stateDir });
  } else if (command === 'report') {
    output = generateReport({
      missionId: required(positionals[1], 'mission-id'),
      stateDir,
      repoRoot,
      reportPath: required(options.report, '--report'),
    });
  } else if (command === 'publish') {
    output = publishDraft({
      missionId: required(positionals[1], 'mission-id'),
      stateDir,
      repoRoot,
      selectedFiles: csv(options.selected),
      commitMessage: options.commit_message,
      prTitle: options.pr_title,
      prBody: options.pr_body,
      execute: options.execute === true,
    });
  } else if (command === 'archive' || command === 'cancel') {
    output = closeMission({
      missionId: required(positionals[1], 'mission-id'),
      actor: options.actor,
      stateDir,
      action: command,
    });
  } else if (command === 'status') {
    const state = loadState(stateDir);
    output = positionals[1] ? requireMission(state, positionals[1]) : state;
  } else {
    console.error(usage());
    return 2;
  }

  console.log(JSON.stringify(present(command, output, options.full === true), null, 2));
  return 0;
}

if (require.main === module) {
  try {
    process.exitCode = runCli(process.argv.slice(2));
  } catch (error) {
    console.error(JSON.stringify({
      status: 'FAIL',
      code: error.code || 'CLI_ERROR',
      message: error.message,
      details: error.details || {},
    }, null, 2));
    process.exitCode = 1;
  }
}

module.exports = { defaultStateDirectory, parseArguments, present, runCli, summarizeRecord };
