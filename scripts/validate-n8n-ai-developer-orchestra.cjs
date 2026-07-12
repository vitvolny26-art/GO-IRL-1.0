#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_WORKFLOW = path.join(__dirname, '..', 'n8n', 'workflows', 'go-irl-ai-developer-orchestra.json');

function readWorkflow(file = DEFAULT_WORKFLOW) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function edgeList(workflow) {
  const edges = [];
  for (const [from, outputs] of Object.entries(workflow.connections || {})) {
    for (const [type, lanes] of Object.entries(outputs || {})) {
      for (let output = 0; output < lanes.length; output += 1) {
        for (const edge of lanes[output] || []) edges.push({ from, to: edge.node, type, output });
      }
    }
  }
  return edges;
}

function reachable(edges, start, target, skip) {
  const queue = [start];
  const seen = new Set();
  while (queue.length > 0) {
    const current = queue.shift();
    if (current === skip || seen.has(current)) continue;
    if (current === target) return true;
    seen.add(current);
    for (const edge of edges.filter((item) => item.type === 'main' && item.from === current)) queue.push(edge.to);
  }
  return false;
}

function validateWorkflow(workflow) {
  const errors = [];
  const add = (code, message) => errors.push({ code, message });
  const nodes = Array.isArray(workflow.nodes) ? workflow.nodes : [];
  const names = new Set(nodes.map((item) => item.name));
  const edges = edgeList(workflow);
  const getNode = (name) => nodes.find((item) => item.name === name);
  const codeNodes = nodes.filter((item) => item.type === 'n8n-nodes-base.code');
  const codeFor = (name) => getNode(name)?.parameters?.jsCode || '';
  const serialized = JSON.stringify(workflow);
  const codeText = codeNodes.map((item) => item.parameters?.jsCode || '').join('\n');

  if (workflow.active !== false) add('WORKFLOW_ACTIVE', 'Workflow must import inactive.');
  if (nodes.filter((item) => item.type === 'n8n-nodes-base.manualTrigger').length !== 1) add('MANUAL_TRIGGER_COUNT', 'Exactly one Manual Trigger is required.');
  if (nodes.filter((item) => item.type === 'n8n-nodes-base.scheduleTrigger').length !== 1) add('QUEUE_PUMP_TRIGGER_COUNT', 'Exactly one Schedule queue pump is required.');
  const telegramTriggers = nodes.filter((item) => item.type === 'n8n-nodes-base.telegramTrigger');
  if (telegramTriggers.length !== 1 || telegramTriggers[0].disabled !== true) add('TELEGRAM_TRIGGER_NOT_DISABLED', 'Telegram Trigger must exist and import disabled.');
  if (nodes.some((item) => Object.hasOwn(item, 'credentials'))) add('EMBEDDED_CREDENTIALS', 'Workflow nodes must not contain credentials.');

  const forbiddenSecretPatterns = [
    /"webhookId"\s*:/i,
    /"instanceId"\s*:/i,
    /\bsk-[A-Za-z0-9_-]{16,}\b/,
    /\bgh[oprsu]_[A-Za-z0-9]{16,}\b/,
    /\b\d{6,12}:[A-Za-z0-9_-]{20,}\b/,
    /C:\\Users\\/i,
    /Authorization["']?\s*:\s*["']Bearer\s+(?!<|\[)/i,
  ];
  if (forbiddenSecretPatterns.some((pattern) => pattern.test(serialized))) add('SECRET_OR_INSTANCE_DATA', 'Workflow contains secret-like or instance-specific data.');
  if (/state\.json|\.runtime-state|\.ai-orchestrator[\\/]|runtime[\\/]state|[\\/]artifacts[\\/]/i.test(serialized)) add('INTERNAL_STATE_REFERENCE', 'n8n must not read Runtime internal state or artifact files.');

  const requiredNodes = [
    'Manual Trigger — Dry Run', 'Telegram Trigger (DISABLED)', 'Telegram User Validation',
    'Queue — Find Mission by ID', 'Queue — Evaluate Idempotency', 'Queue — Duplicate Mission?',
    'Queue — Get Active Missions', 'Queue — Decide Admission', 'Schedule Trigger — Queue Pump',
    'Queue Pump — Select Candidate', 'Build Runtime Mission Intake Command', 'SSH — mission-intake.cjs',
    'SSH — bridge.cjs mission status', 'Project Coordinator — OpenRouter', 'Role Selection Registry Gate',
    'SSH — bridge.cjs context build', 'SSH — bridge.cjs planner run', 'SSH — bridge.cjs implementer run',
    'SSH — bridge.cjs review run', 'Critic Required?', 'Conditional Critic — OpenRouter',
    'SSH — bridge.cjs qa run', 'Human Approval Gate — Telegram Owner', 'SSH — bridge.cjs publish preview',
    'ClickUp — Inspect Existing List Statuses', 'ClickUp — Find Mission Task', 'Drive — Search Agent Report',
    'Drive — Update Agent Report', 'Drive — Create Agent Report', 'Queue — Mark External Sync Awaiting Review',
    'Telegram Mission Accepted', 'Telegram Human Approval Request', 'Telegram Completion Notification',
    'Telegram Failed or Blocked', 'Sanitize Operations Failure',
  ];
  for (const required of requiredNodes) if (!names.has(required)) add('REQUIRED_NODE_MISSING', `Missing node: ${required}`);

  for (const edge of edges) {
    if (!names.has(edge.from) || !names.has(edge.to)) add('BROKEN_CONNECTION', `Broken connection ${edge.from} -> ${edge.to}`);
  }

  const indegree = new Map(nodes.map((item) => [item.name, 0]));
  const adjacency = new Map(nodes.map((item) => [item.name, []]));
  for (const edge of edges) {
    indegree.set(edge.to, (indegree.get(edge.to) || 0) + 1);
    adjacency.get(edge.from)?.push(edge.to);
  }
  const topo = [...indegree.entries()].filter(([, count]) => count === 0).map(([name]) => name);
  let visited = 0;
  while (topo.length > 0) {
    const current = topo.shift();
    visited += 1;
    for (const next of adjacency.get(current) || []) {
      indegree.set(next, indegree.get(next) - 1);
      if (indegree.get(next) === 0) topo.push(next);
    }
  }
  if (visited !== nodes.length) add('WORKFLOW_CYCLE', 'Workflow graph must be acyclic.');

  for (const item of codeNodes) {
    try {
      // n8n Code nodes run inside a function body, so this validates syntax without executing expressions.
      new Function(item.parameters?.jsCode || ''); // eslint-disable-line no-new-func
    } catch (error) {
      add('CODE_NODE_SYNTAX', `${item.name}: ${error.message}`);
    }
  }

  const intakeInvocation = /\| node scripts\/ai-orchestrator\/mission-intake\.cjs --actor/.test(codeFor('Build Runtime Mission Intake Command'));
  if (!intakeInvocation) add('MISSION_INTAKE_NOT_USED', 'The promoted queue Mission must invoke mission-intake.cjs once.');
  const intakeInvocationCount = (codeText.match(/\| node scripts\/ai-orchestrator\/mission-intake\.cjs --actor/g) || []).length;
  if (intakeInvocationCount !== 1) add('MISSION_INTAKE_COUNT', `Expected one mission-intake invocation builder, found ${intakeInvocationCount}.`);
  if (!codeText.includes('scripts/ai-orchestrator/bridge.cjs')) add('BRIDGE_NOT_USED', 'bridge.cjs is not invoked.');
  const runtimeBuilders = codeNodes.filter((item) => /^Build .* Command$/.test(item.name) && !['Build Mission JSON','Build Runtime Mission Intake Command'].includes(item.name));
  for (const builder of runtimeBuilders) {
    if (!(builder.parameters?.jsCode || '').includes('scripts/ai-orchestrator/bridge.cjs')) add('BRIDGE_BYPASS', `${builder.name} bypasses bridge.cjs.`);
  }
  const sshNodes = nodes.filter((item) => item.type === 'n8n-nodes-base.ssh');
  if (sshNodes.length !== runtimeBuilders.length + 1) add('SSH_COMMAND_SURFACE', 'SSH surface must be one Mission Intake plus bridge-only commands.');

  const dataTables = nodes.filter((item) => item.type === 'n8n-nodes-base.dataTable');
  if (dataTables.length < 10) add('QUEUE_DATA_TABLE_SURFACE', 'Mission Queue requires Data Table reads and audited upserts.');
  if (dataTables.some((item) => item.parameters?.dataTableId?.value !== 'MISSION_QUEUE_DATA_TABLE_ID')) add('QUEUE_TABLE_PLACEHOLDER', 'Every queue node must use the sanitized Data Table ID placeholder.');
  const queueFields = ['mission_id','telegram_chat_id','clickup_task_id','drive_report_file_id','integration_status','runtime_status','sync_status','last_processed_at','retry_count'];
  const queueSchema = JSON.stringify(getNode('Queue — Upsert Received')?.parameters?.columns?.schema || []);
  for (const field of queueFields) if (!queueSchema.includes(field)) add('QUEUE_SCHEMA_FIELD_MISSING', `Queue schema is missing ${field}.`);
  for (const status of ['received','queued','running','awaiting_human_approval','blocked','failed','completed','synced']) {
    if (!serialized.includes(status)) add('QUEUE_STATUS_MISSING', `Integration status missing: ${status}`);
  }
  if (!codeFor('Queue — Evaluate Idempotency').includes('duplicate_mission') || !reachable(edges, 'Queue — Duplicate Mission?', 'Telegram Cached Mission Notification')) add('QUEUE_IDEMPOTENCY_MISSING', 'Duplicate mission_id must return cached integration status without Runtime execution.');
  if (!codeFor('Queue — Decide Admission').includes("['running','awaiting_human_approval']") && !codeFor('Queue Pump — Select Candidate').includes("['running','awaiting_human_approval']")) add('ONE_ACTIVE_MISSION_MISSING', 'Queue must block promotion while another Mission is active.');
  if (!codeFor('Sanitize Operations Failure').includes('Math.min(1,previous+1)')) add('INTEGRATION_RETRY_CAP_MISSING', 'Integration retry counter must be capped at one.');
  if (reachable(edges, 'Sanitize Operations Failure', 'SSH — bridge.cjs implementer run')) add('RUNTIME_REIMPLEMENTATION_RETRY', 'Integration failure handling must never restart implementation.');
  if (!codeFor('Queue — Mark External Sync Awaiting Review').includes("integration_status:'awaiting_human_approval'") || !codeFor('Queue — Mark External Sync Awaiting Review').includes('runtime_slot_released:false')) add('PREVIEW_RELEASES_RUNTIME_SLOT', 'Publish preview must not release the active Runtime slot.');

  if (!reachable(edges, 'Telegram User Validation', 'Queue — Find Mission by ID')) add('TELEGRAM_ALLOWLIST_NOT_DOMINANT', 'Telegram allowlist must precede Mission Queue and Runtime.');
  if (reachable(edges, 'Telegram Trigger (DISABLED)', 'SSH — mission-intake.cjs', 'Telegram User Validation')) add('TELEGRAM_ALLOWLIST_BYPASS', 'Mission Intake is reachable without Telegram user validation.');
  if (!reachable(edges, 'Queue — Start Runtime Now?', 'SSH — mission-intake.cjs')) add('QUEUE_ADMISSION_NOT_CONNECTED', 'Runtime Intake must follow queue admission.');

  const clickUpSerialized = JSON.stringify(nodes.filter((item) => /ClickUp/.test(item.name)));
  for (const id of ['90121889124','90128278475','901219478483']) if (!clickUpSerialized.includes(id)) add('CLICKUP_ID_MISSING', `ClickUp configuration missing ${id}.`);
  if (!codeFor('ClickUp — Build Mission Payload').includes('go_irl_mission_id:') || !reachable(edges, 'ClickUp — Get Mission Tasks', 'ClickUp — Find Mission Task')) add('CLICKUP_DEDUP_MISSING', 'ClickUp must reuse mission_id as its sync key.');
  if (!codeFor('ClickUp — Build Mission Payload').includes('GitHub is the source of truth.')) add('CLICKUP_SOURCE_TRUTH_MISSING', 'ClickUp description must state the GitHub source-of-truth rule.');
  if (!codeFor('ClickUp — Build Mission Payload').includes('statuses') || !codeFor('ClickUp — Build Mission Payload').includes('in_progress')) add('CLICKUP_STATUS_INSPECTION_MISSING', 'ClickUp status mapping must be derived from the existing list.');

  if (!serialized.includes('1skcboyr_rPQOFN34iwMAqRvf97BYVllJ')) add('DRIVE_FOLDER_MISSING', 'AI Reports Drive folder is missing.');
  if (!reachable(edges, 'Drive — Search Agent Report', 'Drive — Agent Report Exists?') || !reachable(edges, 'Drive — Agent Report Exists?', 'Drive — Update Agent Report') || !reachable(edges, 'Drive — Agent Report Exists?', 'Drive — Create Agent Report')) add('DRIVE_UPSERT_MISSING', 'Drive report must be searched and then updated or created.');
  if (nodes.some((item) => /Drive/.test(item.name) && ['deleteFile','delete'].includes(item.parameters?.operation))) add('DRIVE_DELETE_FORBIDDEN', 'Operations workflow must not delete old Drive reports.');
  for (const section of ['## Task','## Files inspected','## Activated roles','## Skipped roles','## Findings','## Changes made','## Checks','## Runtime status','## ClickUp','## GitHub','## Risks','## Next step']) {
    if (!codeFor('Build Telegram Completion Message').includes(section)) add('DRIVE_REPORT_SECTION_MISSING', `Agent Report section missing: ${section}`);
  }
  if (!codeFor('Build Telegram Completion Message').includes('Draft PR: not created.') || !codeFor('Build Telegram Completion Message').includes('Publish preview ready.')) add('PUBLISH_STATUS_NOT_HONEST', 'Agent Report must distinguish publish preview from a real Draft PR.');

  if (!serialized.includes('scripts/build-notebooklm-txt.cjs') || !serialized.includes('export_refresh_required')) add('EXPORT_REFRESH_MISSING', 'Existing export script and refresh-required flag must be recorded.');
  for (const excluded of ['.env*','.git/**','node_modules/**','dist/**','.vercel/**','package-lock.json','GO IRL DOC/**']) {
    if (!serialized.includes(excluded)) add('EXPORT_EXCLUSION_MISSING', `Export exclusion missing: ${excluded}`);
  }
  if (/notebooklm[^\n]{0,80}(api\/|https?:\/\/)/i.test(codeText)) add('NOTEBOOKLM_API_FORBIDDEN', 'Workflow must not call a NotebookLM API.');

  const modelNodes = nodes.filter((item) => item.type === '@n8n/n8n-nodes-langchain.lmChatOpenRouter');
  const chainNodes = nodes.filter((item) => item.type === '@n8n/n8n-nodes-langchain.chainLlm');
  if (modelNodes.length !== 4 || chainNodes.length !== 4) add('OPENROUTER_ROLE_COUNT', 'Four bounded OpenRouter stages are required.');
  for (const chain of chainNodes) if (!edges.some((edge) => edge.type === 'ai_languageModel' && edge.to === chain.name)) add('OPENROUTER_MODEL_MISSING', `${chain.name} has no OpenRouter model.`);

  const roleRegistry = ['Project Coordinator','Archivist','Tech Lead','QA Lead','Product Lead','Market Analyst','UX Lead','Security Lead','Supabase Steward','Release Manager','Replit Operator','GitHub Operator','Sprint Planner','Implementer','Independent Reviewer'];
  for (const role of roleRegistry) if (!serialized.includes(role)) add('ROLE_REGISTRY_MISMATCH', `Role missing from routing registry: ${role}`);
  for (const mandatory of ['Project Coordinator','Tech Lead','Implementer','Independent Reviewer','QA Lead','GitHub Operator','Archivist']) if (!codeFor('Role Selection Registry Gate').includes(mandatory)) add('MINIMUM_CODE_ROLE_MISSING', `Minimum role not enforced: ${mandatory}`);

  if (!edges.some((edge) => edge.from === 'Critic Required?' && edge.to === 'Conditional Critic — OpenRouter' && edge.output === 0)) add('CRITIC_NOT_CONDITIONAL', 'Critic is not gated by the true branch.');
  if (reachable(edges, 'Conditional Critic — OpenRouter', 'SSH — bridge.cjs implementer run')) add('CRITIC_LOOP_TO_IMPLEMENTER', 'Critic must never route back to Implementer.');
  if (!codeFor('Detect Critic Requirement').includes('critic_cycles:') || !codeFor('Detect Critic Requirement').includes('?1:0')) add('CRITIC_LIMIT_MISSING', 'Critic must be limited to one cycle.');

  if (reachable(edges, 'Telegram Trigger (DISABLED)', 'SSH — bridge.cjs mission approve', 'Human Approval Gate — Telegram Owner')) add('HUMAN_APPROVAL_BYPASS', 'Change Approval is reachable without Telegram owner gate.');
  if (reachable(edges, 'Telegram Trigger (DISABLED)', 'SSH — bridge.cjs publish preview', 'Human Approval Gate — Telegram Owner')) add('PUBLISH_PREVIEW_BYPASS', 'Publish preview is reachable without Telegram owner gate.');
  if (!reachable(edges, 'Human Approval Gate — Telegram Owner', 'SSH — bridge.cjs publish preview')) add('PUBLISH_PREVIEW_UNREACHABLE', 'Approved path does not reach publish preview.');
  if (!reachable(edges, 'SSH — bridge.cjs publish preview', 'Telegram Completion Notification')) add('TELEGRAM_COMPLETION_UNREACHABLE', 'Completion notification must follow publish preview and operations sync.');
  if (/\b(?:gh\s+pr\s+(?:create|merge)|git\s+(?:commit|push)|vercel\s+deploy|pnpm\s+(?:run\s+)?deploy)\b/i.test(codeText)) add('AUTOMATIC_PUBLISH_FORBIDDEN', 'Workflow must not commit, push, create/merge a PR, or deploy.');

  const externalTypes = ['n8n-nodes-base.ssh','n8n-nodes-base.telegram','n8n-nodes-base.clickUp','n8n-nodes-base.googleDrive','n8n-nodes-base.httpRequest','n8n-nodes-base.dataTable','@n8n/n8n-nodes-langchain.chainLlm'];
  for (const external of nodes.filter((item) => externalTypes.includes(item.type))) {
    if (reachable(edges, 'Manual Trigger — Dry Run', external.name)) add('DRY_RUN_EXTERNAL_WRITE', `Dry run reaches external node: ${external.name}`);
  }
  for (const preview of ['queue_contract','clickup_payload_preview','drive_report_preview','telegram_previews','export_manifest_preview','external_writes:false']) if (!codeFor('Build Dry Run Preview').includes(preview)) add('DRY_RUN_PREVIEW_INCOMPLETE', `Dry run preview missing: ${preview}`);

  const completionCode = codeFor('Finalize Telegram Completion');
  for (const item of ['Роли:','typecheck: PASS','lint: PASS','build: PASS','test: PASS','drive_report_url','clickup_task_url']) if (!completionCode.includes(item)) add('TELEGRAM_COMPLETION_FIELD_MISSING', `Completion message missing ${item}.`);
  if (!completionCode.includes('code_reference') || !codeFor('Build Telegram Completion Message').includes('Publish preview ready. Draft PR execution requires separate GitHub Operator approval.')) add('TELEGRAM_INVENTED_PUBLISH', 'Completion must report publish preview unless a real URL exists.');
  const failureCode = codeFor('Sanitize Operations Failure');
  if (!failureCode.includes('[REDACTED]') || !failureCode.includes('slice(0,500)') || codeFor('Build Safe Failure Notification').includes('stack')) add('FAILURE_SANITIZATION_MISSING', 'Failure Telegram output must be sanitized and bounded.');

  const forbiddenNodeTypes = /github|gmail|postgres|supabase/i;
  if (nodes.some((item) => forbiddenNodeTypes.test(item.type))) add('FORBIDDEN_EXTERNAL_NODE', 'Workflow contains a forbidden GitHub/Gmail/database integration node.');
  return errors;
}

function runCli(argv = process.argv.slice(2)) {
  const file = argv[0] ? path.resolve(argv[0]) : DEFAULT_WORKFLOW;
  let workflow;
  try {
    workflow = readWorkflow(file);
  } catch (error) {
    console.error(`FAIL JSON_INVALID\n${error.message}`);
    return 1;
  }
  const errors = validateWorkflow(workflow);
  if (errors.length > 0) {
    console.error(`FAIL ${errors[0].code}\n${errors[0].message}`);
    return 1;
  }
  console.log(`PASS ${path.relative(process.cwd(), file)}\n${workflow.nodes.length} nodes; inactive; credential-free; Operations Layer and Runtime Bridge boundaries verified.`);
  return 0;
}

if (require.main === module) process.exitCode = runCli();

module.exports = { DEFAULT_WORKFLOW, edgeList, readWorkflow, reachable, runCli, validateWorkflow };
