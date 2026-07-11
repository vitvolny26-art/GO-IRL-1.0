const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const workflowFile = path.resolve(__dirname, '..', 'n8n', 'workflows', 'go-irl-ai-staff-os-structural-test.json');
const workflow = JSON.parse(fs.readFileSync(workflowFile, 'utf8'));
const nodes = new Map(workflow.nodes.map((node) => [node.name, node]));

function runCode(name, json, items = [{ json }], staticData = {}) {
  const code = nodes.get(name)?.parameters?.jsCode;
  assert.ok(code, `Missing Code node: ${name}`);
  const execute = new Function('$json', '$input', '$getWorkflowStaticData', code);
  return execute(json, { all: () => items }, () => staticData);
}

function normalize(raw) {
  return runCode('STAFF-00 Normalize Mission', raw).json;
}

function selectRoles(raw) {
  const normalized = normalize(raw);
  assert.equal(normalized.missionValid, true);
  return runCode('STAFF-00 Role Selection', normalized).json;
}

function baseMission(title, objective) {
  return {
    title,
    objective,
    expected_deliverable: 'Synthetic report only',
    maximum_budget_usd: 1,
  };
}

function runResultPipeline(raw, mutateFirst) {
  const selected = selectRoles(raw);
  const split = runCode('STAFF-01 Split Context Packs', selected, [{ json: selected }]);
  const validated = split.map((item, index) => {
    const synthetic = runCode('STAFF-01 Synthetic Agent Result', item.json).json;
    if (index === 0 && mutateFirst) mutateFirst(synthetic);
    return runCode('STAFF-01 Validate Agent Result', synthetic);
  });
  let state = runCode('STAFF-01 Collect Role Results', validated[0].json, validated)[0].json;
  state = runCode('STAFF-01 Budget Check', state).json;
  state = runCode('STAFF-01 Conflict Detection', state).json;
  return runCode('STAFF-01 Report Only Complete', state).json.staff01_result;
}

const cases = [
  ['A Beta QA', baseMission('Beta QA verification', 'Test beta acceptance quality'), ['Project Coordinator', 'Product Lead', 'QA Lead']],
  ['B Auth/RLS', baseMission('Auth and RLS audit', 'Verify Supabase security and private data'), ['Project Coordinator', 'Tech Lead', 'QA Lead', 'Security Lead', 'Supabase Steward']],
  ['C Bug investigation', baseMission('Investigate broken join bug', 'Find regression error'), ['Project Coordinator', 'Tech Lead', 'QA Lead']],
];

for (const [label, mission, expected] of cases) {
  assert.deepEqual(selectRoles(mission).activated_roles, expected);
  console.log(`PASS ${label}: ${expected.join(', ')}`);
}

const forbidden = runResultPipeline(baseMission('Documentation alignment', 'Check README alignment'), (result) => {
  result.proposed_changes = ['merge branch'];
});
assert.ok(forbidden.invalid_results.length > 0);
assert.equal(forbidden.critic_required, true);
assert.equal(forbidden.human_approval_required, true);
assert.equal(forbidden.status, 'blocked');
console.log('PASS D forbidden proposal: invalid + critic + approval + blocked');

const clean = runResultPipeline(baseMission('Documentation alignment', 'Check README alignment'));
assert.equal(clean.invalid_results.length, 0);
assert.equal(clean.critic_required, false);
assert.equal(clean.human_approval_required, false);
assert.equal(clean.status, 'completed');
assert.equal(clean.total_estimated_cost_usd, 0);
assert.equal(clean.synthetic, true);
assert.equal(clean.report_only, true);
console.log('PASS E clean restore: completed + zero cost + synthetic report-only');

const budget = normalize(baseMission('Budget test', 'Verify reserve split'));
assert.equal(budget.budget.reserved_budget_usd, 0.25);
assert.equal(budget.budget.available_budget_usd, 0.75);
assert.equal(normalize({ ...baseMission('Low', 'Budget'), maximum_budget_usd: 0 }).missionValid, false);
assert.equal(normalize({ ...baseMission('High', 'Budget'), maximum_budget_usd: 5.01 }).missionValid, false);
console.log('PASS budget bounds and 25/75 split');

const staticData = { staff00MissionHashes: [{ hash: 'expired', mission_id: 'old', ts: Date.now() - (8 * 24 * 60 * 60 * 1000) }] };
for (let i = 0; i < 101; i += 1) {
  runCode('STAFF-00 Duplicate Check', { mission_hash: `hash-${i}`, mission_id: `mission-${i}` }, undefined, staticData);
}
assert.equal(staticData.staff00MissionHashes.length, 100);
assert.equal(staticData.staff00MissionHashes.some((record) => record.hash === 'expired'), false);
const duplicate = runCode('STAFF-00 Duplicate Check', { mission_hash: 'hash-100', mission_id: 'new-id' }, undefined, staticData).json;
assert.equal(duplicate.duplicate, true);
assert.equal(duplicate.original_mission_id, 'mission-100');
console.log('PASS duplicate retention: 7 days, max 100, original mission retained');
