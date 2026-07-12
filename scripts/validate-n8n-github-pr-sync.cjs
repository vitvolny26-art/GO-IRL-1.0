const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const workflowFile = path.resolve(process.argv[2] || path.join(repoRoot, 'n8n', 'workflows', 'github-pr-clickup-drive-sync.json'));
const workflow = JSON.parse(fs.readFileSync(workflowFile, 'utf8'));
const nodes = new Map(workflow.nodes.map((node) => [node.name, node]));
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const outputs = (name) => (workflow.connections[name]?.main || []).map((slot) => (slot || []).map((edge) => edge.node));
const reachable = (start) => {
  const seen = new Set();
  const queue = [start];
  while (queue.length) {
    const current = queue.shift();
    if (seen.has(current)) continue;
    seen.add(current);
    for (const slot of outputs(current)) queue.push(...slot);
  }
  return seen;
};

const required = [
  'GitHub PR Event',
  'Normalize PR Event',
  'Is Supported PR Action?',
  'Read PR',
  'Read PR Diff',
  'Build PR Context',
  'Get ClickUp Tasks',
  'Find Existing ClickUp Task',
  'ClickUp Task Exists?',
  'Update ClickUp Task',
  'Create ClickUp Task',
  'Generate Agent Report',
  'Search AI Reports File',
  'Select Existing AI Report',
  'AI Report Exists?',
  'Delete Existing AI Report',
  'Create AI Report',
  'Search NotebookLM Export File',
  'Select Existing NotebookLM File',
  'NotebookLM File Exists?',
  'Delete Existing NotebookLM File',
  'Create NotebookLM Export File',
  'Telegram Success Notify',
  'Build Error Notification',
  'Telegram Error Notify',
  'Manual Trigger - Dry Run',
  'Build Dry Run Preview',
  'Dry Run Complete',
];

check(workflow.active === false, 'workflow must be inactive');
for (const name of required) check(nodes.has(name), `missing required node: ${name}`);

const serialized = JSON.stringify(workflow);
check(!serialized.includes('"credentials"'), 'credential bindings must not be committed');
check(!/webhookId|instanceId|versionId/.test(serialized), 'private n8n identifiers must not be committed');
check(!workflow.nodes.some((node) => /openAi|langchain|anthropic|gemini|ollama/i.test(node.type)), 'LLM/AI node detected');
check(!/(?:\bsk-[A-Za-z0-9]{20,}\b|\bghp_[A-Za-z0-9]{20,}\b|\bAIza[A-Za-z0-9_-]{20,}\b)/.test(serialized), 'credential-like token detected');

const trigger = nodes.get('GitHub PR Event');
check(trigger?.type === 'n8n-nodes-base.githubTrigger', 'GitHub trigger node type is incorrect');
check(trigger?.parameters?.events?.includes('pull_request'), 'GitHub trigger must subscribe to pull_request');

const readPr = nodes.get('Read PR');
const readDiff = nodes.get('Read PR Diff');
check(readPr?.parameters?.resource === 'pullRequest' && readPr?.parameters?.operation === 'get', 'Read PR must be pullRequest:get');
check(readDiff?.parameters?.resource === 'pullRequest' && readDiff?.parameters?.operation === 'getDiff', 'Read PR Diff must be pullRequest:getDiff');

for (const node of workflow.nodes.filter((item) => item.type === 'n8n-nodes-base.github')) {
  check(['get', 'getDiff'].includes(node.parameters.operation), `GitHub write operation detected: ${node.name}`);
}

const createTask = nodes.get('Create ClickUp Task');
const updateTask = nodes.get('Update ClickUp Task');
const findTaskCode = nodes.get('Find Existing ClickUp Task')?.parameters?.jsCode || '';
check(createTask?.type === 'n8n-nodes-base.clickUp' && createTask?.parameters?.operation === 'create', 'missing ClickUp create node');
check(updateTask?.parameters?.operation === 'update', 'missing ClickUp update operation');
check(createTask?.parameters?.additionalFields?.content, 'ClickUp create content is missing');
check(updateTask?.parameters?.updateFields?.content, 'ClickUp update content is missing');
check(findTaskCode.includes('.marker') && findTaskCode.includes('taskExists'), 'ClickUp idempotency lookup is incomplete');

const reportCode = nodes.get('Generate Agent Report')?.parameters?.jsCode || '';
for (const section of ['# Agent Report', '## Task', '## Files inspected', '## Findings', '## Changes made', '## Checks', '## Next step']) {
  check(reportCode.includes(section), `report generator missing section: ${section}`);
}
check(reportCode.includes('source_of_truth: false'), 'report must be marked non-authoritative');
check(reportCode.includes('reportFileName') && reportCode.includes('github-pr-'), 'deterministic report filename missing');
check(reportCode.includes('No LLM or OpenAI API was used'), 'no-LLM declaration missing');

for (const name of ['Search AI Reports File', 'Search NotebookLM Export File']) {
  const current = nodes.get(name);
  check(current?.type === 'n8n-nodes-base.googleDrive', `${name} must use Google Drive`);
  check(current?.parameters?.operation === 'search' && current?.parameters?.searchMethod === 'query', `${name} must search before write`);
}
for (const name of ['Delete Existing AI Report', 'Delete Existing NotebookLM File']) {
  check(nodes.get(name)?.parameters?.operation === 'deleteFile', `${name} must delete the prior deterministic file`);
}
for (const name of ['Create AI Report', 'Create NotebookLM Export File']) {
  check(nodes.get(name)?.parameters?.operation === 'createFromText', `${name} must create text content`);
}

const productionReach = reachable('GitHub PR Event');
for (const name of ['Read PR', 'Create ClickUp Task', 'Update ClickUp Task', 'Generate Agent Report', 'Create AI Report', 'Create NotebookLM Export File', 'Telegram Success Notify']) {
  check(productionReach.has(name), `production path cannot reach ${name}`);
}
const dryRunReach = reachable('Manual Trigger - Dry Run');
check(dryRunReach.has('Dry Run Complete'), 'manual dry-run path is incomplete');
for (const name of dryRunReach) {
  const type = nodes.get(name)?.type || '';
  check(!/(github|clickUp|googleDrive|telegram)/i.test(type), `manual dry-run calls an external node: ${name}`);
}

const errorTarget = 'Build Error Notification';
const guardedExternal = [
  'Read PR',
  'Read PR Diff',
  'Get ClickUp Tasks',
  'Update ClickUp Task',
  'Create ClickUp Task',
  'Search AI Reports File',
  'Delete Existing AI Report',
  'Create AI Report',
  'Search NotebookLM Export File',
  'Delete Existing NotebookLM File',
  'Create NotebookLM Export File',
];
for (const name of guardedExternal) {
  const current = nodes.get(name);
  const slots = outputs(name);
  check(current?.onError === 'continueErrorOutput', `${name} must expose an error output`);
  check(slots[1]?.includes(errorTarget), `${name} error output must reach ${errorTarget}`);
}
check(outputs('Build Error Notification')[0]?.includes('Telegram Error Notify'), 'central error handler must notify Telegram');

if (failures.length) {
  console.error(`FAIL ${path.relative(repoRoot, workflowFile)}`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`PASS ${path.relative(repoRoot, workflowFile)}`);
console.log(`PASS ${required.length} required nodes; inactive; import-safe; no credentials; no LLM nodes`);
console.log('PASS GitHub read-only; ClickUp upsert; Drive replacement; NotebookLM mirror; Telegram success/error');
console.log('PASS manual dry-run lane contains no external integrations');
