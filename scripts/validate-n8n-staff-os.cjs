const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const defaultWorkflow = path.join(repoRoot, 'n8n', 'workflows', 'go-irl-ai-staff-os-structural-test.json');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function removePrivateBindings(value) {
  if (Array.isArray(value)) return value.map(removePrivateBindings);
  if (!value || typeof value !== 'object') {
    return typeof value === 'string'
      ? value.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, 'YOUR_NOTIFICATION_EMAIL')
      : value;
  }
  const clean = {};
  for (const [key, child] of Object.entries(value)) {
    if (['credentials', 'webhookId', 'instanceId', 'versionId'].includes(key)) continue;
    clean[key] = removePrivateBindings(child);
  }
  return clean;
}

function prepare(sourceFile, destinationFile) {
  const source = readJson(sourceFile);
  const prepared = removePrivateBindings(source);
  const staffNodeNames = new Set(
    prepared.nodes
      .filter((node) => /^STAFF-(?:00|01|02)\b/.test(node.name))
      .map((node) => node.name),
  );

  prepared.name = 'GO IRL — AI Staff OS Structural Test (Sanitized)';
  prepared.active = false;
  delete prepared.meta;
  delete prepared.pinData;
  delete prepared.nodeGroups;
  delete prepared.tags;

  prepared.nodes = prepared.nodes.filter((node) => staffNodeNames.has(node.name));
  const staffConnections = {};
  for (const [sourceName, connection] of Object.entries(prepared.connections || {})) {
    if (!staffNodeNames.has(sourceName)) continue;
    const main = (connection.main || []).map((slot) =>
      (slot || []).filter((edge) => staffNodeNames.has(edge.node)),
    );
    staffConnections[sourceName] = { ...connection, main };
  }
  prepared.connections = staffConnections;

  const noteName = 'STAFF-OS Single-Run Procedure';
  const note = {
    parameters: {
      content: [
        '## Staff OS structural test — single run',
        '1. Edit **STAFF-00 Raw Mission Input (Sample)**.',
        '2. Start only from **STAFF-00 Mission Trigger (Manual)**.',
        '3. Execute the workflow once from that manual trigger.',
        '4. Inspect **STAFF-01 Report Only Complete** after the lane finishes.',
        '',
        '**Do not execute the terminal node directly.** n8n can reuse prior IF-path data.',
        '**Do not run the AI Report Bus branch.** This copy is inactive and test-only.',
      ].join('\n'),
      height: 380,
      width: 520,
      color: 5,
    },
    type: 'n8n-nodes-base.stickyNote',
    typeVersion: 1,
    position: [-180, 2100],
    id: 'staff-os-single-run-procedure',
    name: noteName,
  };
  const oldNote = prepared.nodes.findIndex((node) => node.name === noteName);
  if (oldNote === -1) prepared.nodes.push(note);
  else prepared.nodes[oldNote] = note;

  fs.mkdirSync(path.dirname(destinationFile), { recursive: true });
  fs.writeFileSync(destinationFile, `${JSON.stringify(prepared, null, 2)}\n`);
}

function outputs(workflow, source) {
  const main = workflow.connections[source]?.main || [];
  return main.map((slot) => (slot || []).map((edge) => edge.node));
}

function reachable(workflow, start) {
  const seen = new Set();
  const queue = [start];
  while (queue.length) {
    const current = queue.shift();
    if (seen.has(current)) continue;
    seen.add(current);
    for (const slot of outputs(workflow, current)) queue.push(...slot);
  }
  return seen;
}

function hasCycle(workflow, allowed, current, visiting = new Set(), visited = new Set()) {
  if (visiting.has(current)) return true;
  if (visited.has(current)) return false;
  visiting.add(current);
  for (const slot of outputs(workflow, current)) {
    for (const next of slot) {
      if (allowed.has(next) && hasCycle(workflow, allowed, next, visiting, visited)) return true;
    }
  }
  visiting.delete(current);
  visited.add(current);
  return false;
}

function validate(file) {
  const workflow = readJson(file);
  const nodes = new Map(workflow.nodes.map((node) => [node.name, node]));
  const required = [
    'STAFF-00 Mission Trigger (Manual)',
    'STAFF-00 Raw Mission Input (Sample)',
    'STAFF-00 Normalize Mission',
    'STAFF-00 Is Mission Valid?',
    'STAFF-00 Duplicate Check',
    'STAFF-00 Is New Mission?',
    'STAFF-00 Role Selection',
    'STAFF-01 Split Context Packs',
    'STAFF-01 Execute Role (DISABLED)',
    'STAFF-01 Synthetic Agent Result',
    'STAFF-01 Validate Agent Result',
    'STAFF-01 Collect Role Results',
    'STAFF-01 Budget Check',
    'STAFF-01 Conflict Detection',
    'STAFF-02 Critic (DISABLED)',
    'STAFF-01 Coordinator Synthesis (DISABLED)',
    'STAFF-01 Human Approval Required?',
    'STAFF-01 Report Only Complete',
    'STAFF-OS Single-Run Procedure',
  ];
  const failures = [];
  const check = (condition, message) => {
    if (!condition) failures.push(message);
  };

  check(workflow.active === false, 'workflow must be inactive');
  for (const name of required) check(nodes.has(name), `missing required node: ${name}`);
  for (const name of ['STAFF-01 Execute Role (DISABLED)', 'STAFF-02 Critic (DISABLED)', 'STAFF-01 Coordinator Synthesis (DISABLED)']) {
    check(nodes.get(name)?.disabled === true, `${name} must be disabled`);
  }

  const staffLane = reachable(workflow, 'STAFF-00 Mission Trigger (Manual)');
  const forbiddenTypes = /(?:googleDrive|gmail|github|telegram|supabase|httpRequest|openAi|langchain)/i;
  for (const node of workflow.nodes) {
    check(!forbiddenTypes.test(node.type), `external/AI node remains in Staff-only workflow: ${node.name}`);
    check(/^STAFF-(?:00|01|02)\b/.test(node.name) || node.name === 'STAFF-OS Single-Run Procedure', `non-Staff node remains: ${node.name}`);
  }
  check(!hasCycle(workflow, staffLane, 'STAFF-00 Mission Trigger (Manual)'), 'Staff OS lane contains a cycle');

  const manualTriggers = workflow.nodes.filter((node) => node.type === 'n8n-nodes-base.manualTrigger');
  check(manualTriggers.length === 1, `expected exactly one Manual Trigger, found ${manualTriggers.length}`);
  check(manualTriggers[0]?.name === 'STAFF-00 Mission Trigger (Manual)', 'the only Manual Trigger must be STAFF-00 Mission Trigger (Manual)');
  const triggerOut = outputs(workflow, 'STAFF-00 Mission Trigger (Manual)').flat();
  check(triggerOut.length === 1 && triggerOut[0] === 'STAFF-00 Raw Mission Input (Sample)', 'Manual Trigger must connect directly to Raw Mission Input');
  check(staffLane.size === workflow.nodes.filter((node) => node.type !== 'n8n-nodes-base.stickyNote').length, 'every executable node must be reachable from the Manual Trigger');

  const normalizeOut = outputs(workflow, 'STAFF-00 Normalize Mission').flat();
  const validOut = outputs(workflow, 'STAFF-00 Is Mission Valid?');
  check(normalizeOut.length === 1 && normalizeOut[0] === 'STAFF-00 Is Mission Valid?', 'validation must immediately follow normalization');
  check(validOut[0]?.includes('STAFF-00 Duplicate Check'), 'valid missions must continue to duplicate persistence');
  check(!validOut[1]?.includes('STAFF-00 Duplicate Check'), 'invalid missions must never enter duplicate persistence');

  const duplicateCode = nodes.get('STAFF-00 Duplicate Check')?.parameters?.jsCode || '';
  check(duplicateCode.includes('7 * 24 * 60 * 60 * 1000'), 'duplicate retention must be 7 days');
  check(duplicateCode.includes('MAX_RECORDS = 100'), 'duplicate store must be capped at 100 records');

  const normalizeCode = nodes.get('STAFF-00 Normalize Mission')?.parameters?.jsCode || '';
  check(normalizeCode.includes('maximum_budget_usd < 0.01') && normalizeCode.includes('maximum_budget_usd > 5'), 'budget bounds must be 0.01–5 USD');
  check(normalizeCode.includes('* 0.25') && normalizeCode.includes('* 0.75'), 'budget must reserve 25% and dispatch 75%');
  check(normalizeCode.includes('max_critic_cycles: 1'), 'critic cycles must be capped at 1');

  const approvalOut = outputs(workflow, 'STAFF-01 Human Approval Required?');
  check(approvalOut[0]?.includes('STAFF-01 Report Only Complete'), 'approval true output must reach Report Only Complete');
  check(approvalOut[1]?.includes('STAFF-01 Report Only Complete'), 'approval false output must reach Report Only Complete');

  const finalCode = nodes.get('STAFF-01 Report Only Complete')?.parameters?.jsCode || '';
  check(finalCode.includes('invalid_results.length > 0') && finalCode.includes("final_status = 'blocked'"), 'invalid results must block final status');
  check(finalCode.includes('budget_exceeded') && finalCode.includes('needs_human_approval'), 'final status must handle budget and approval gates');

  const approvalCode = nodes.get('STAFF-01 Conflict Detection')?.parameters?.jsCode || '';
  for (const token of ['code', 'branch', 'commit', 'pull request', 'merge', 'architecture', 'auth', 'rls', 'sql', 'migration', 'secret', 'production data', 'deploy', 'docs_index', 'knowledge debt', 'beta-ready', 'release-ready']) {
    check(approvalCode.toLowerCase().includes(token), `approval detector missing token: ${token}`);
  }

  const serialized = JSON.stringify(workflow);
  check(!serialized.includes('"credentials"'), 'credential references must be removed');
  check(!/\bwebhookId\b|\binstanceId\b|\bversionId\b/.test(serialized), 'webhook/instance/version identifiers must be removed');
  check(!/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(serialized), 'email address must not be present');

  const noteText = nodes.get('STAFF-OS Single-Run Procedure')?.parameters?.content || '';
  check(noteText.includes('Do not execute the terminal node directly'), 'single-run note must warn against terminal-node execution');

  if (failures.length) {
    console.error(`FAIL ${path.relative(repoRoot, file)}`);
    console.error(`- ${failures[0]}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS ${path.relative(repoRoot, file)}`);
  console.log(`PASS ${required.length} required nodes; exactly one Manual Trigger; inactive; no cycle`);
  console.log('PASS Staff-only graph; no external nodes, credentials, or private bindings');
  console.log('PASS validation-before-persistence; dual approval outputs; blocked-status guard');
}

const args = process.argv.slice(2);
if (args[0] === '--prepare') {
  if (!args[1]) throw new Error('Usage: node scripts/validate-n8n-staff-os.cjs --prepare <source.json> [destination.json]');
  prepare(path.resolve(args[1]), path.resolve(args[2] || defaultWorkflow));
  validate(path.resolve(args[2] || defaultWorkflow));
} else {
  validate(path.resolve(args[0] || defaultWorkflow));
}
