/* global $json */

const j = $json || {};
const m = (j.mission && typeof j.mission === 'object') ? j.mission : {};
const budget = (j.budget && typeof j.budget === 'object') ? j.budget : {};

// Canonical supported roles (always the full universe for skipped_roles).
const ALL_ROLES = ['Project Coordinator', 'Automation Engineer', 'Archivist', 'Product Lead', 'Tech Lead', 'QA Lead', 'UX Lead', 'Security Lead', 'Supabase Steward', 'Release Manager', 'Market Analyst', 'GitHub Operator', 'Replit Operator', 'Sprint Planner', 'Critic'];

const title = (m.title || '').toString().toLowerCase();
const objective = (m.objective || '').toString().toLowerCase();
const deliverable = (m.expected_deliverable || '').toString().toLowerCase();
const hay = (title + ' ' + objective + ' ' + deliverable);
function has(words) { for (const w of words) { if (hay.indexOf(w) !== -1) return true; } return false; }

// Deterministic category detection (first match wins, ordered by risk/priority).
let category = 'documentation alignment';
let activated = ['Project Coordinator', 'Archivist', 'Product Lead'];

const explicitAutomation = has(['n8n', 'automation', 'webhook', 'integration', 'cron', 'queue', 'bridge', 'idempot', 'dedup']);
const workflowAutomation = has(['workflow']) && has(['node', 'trigger', 'execution', 'retry', 'schedule', 'run']);

if (has(['auth', 'rls', 'row level security', 'supabase', 'data privacy', 'private data', 'security', 'secret'])) {
  category = 'auth/RLS/data';
  activated = ['Project Coordinator', 'Security Lead', 'Supabase Steward', 'Tech Lead', 'QA Lead'];
} else if (explicitAutomation || workflowAutomation) {
  category = 'automation engineering';
  activated = ['Project Coordinator', 'Automation Engineer', 'Tech Lead', 'QA Lead'];
} else if (has(['bug', 'defect', 'crash', 'error', 'investigat', 'regression', 'broken', 'fix'])) {
  category = 'bug investigation';
  activated = ['Project Coordinator', 'QA Lead', 'Tech Lead'];
} else if (has(['architecture', 'refactor', 'system design', 'scalab', 'design review', 'tech debt', 'technical debt'])) {
  category = 'architecture review';
  activated = ['Project Coordinator', 'Tech Lead', 'Product Lead', 'Archivist'];
} else if (has(['market', 'competitor', 'research', 'analysis', 'pricing', 'segment', 'audience'])) {
  category = 'market research';
  activated = ['Project Coordinator', 'Market Analyst', 'Product Lead', 'Archivist'];
} else if (has(['qa', 'test', 'beta', 'quality', 'acceptance', 'verify'])) {
  category = 'beta QA';
  activated = ['Project Coordinator', 'QA Lead', 'Product Lead'];
} else if (has(['doc', 'documentation', 'readme', 'guide', 'checklist', 'align'])) {
  category = 'documentation alignment';
  activated = ['Project Coordinator', 'Archivist', 'Product Lead'];
}

// Dedup + preserve canonical order for activated roles.
const activatedSet = {};
for (const r of activated) { activatedSet[r] = true; }
const activated_roles = ALL_ROLES.filter(function (r) { return !!activatedSet[r]; });
const skipped_roles = ALL_ROLES.filter(function (r) { return !activatedSet[r]; });
const routing_reason = 'Deterministic keyword routing matched category "' + category + '" -> ' + activated_roles.join(', ') + '. No AI used.';

// ---- per-role budget split (report-only, deterministic) --------------------
const available = (typeof budget.available_budget_usd === 'number') ? budget.available_budget_usd : 0;
const n = activated_roles.length || 1;
const per_role_cost = Math.floor((available / n) * 10000) / 10000;

const forbidden_actions = Array.isArray(m.forbidden_actions) ? m.forbidden_actions : [];
const allowed_actions = ['read', 'analyze', 'summarize', 'draft_report', 'recommend']; // report-only defaults

function roleTask(role) {
  return role + ' contribution for mission: ' + (m.title || '');
}
function roleGoal(role) {
  return 'Provide a report-only ' + role + ' assessment supporting: ' + (m.objective || '');
}

const context_packs = activated_roles.map(function (role) {
  return {
    mission_id: (j.mission_id || m.mission_id || '').toString(),
    role: role,
    task: roleTask(role),
    goal: roleGoal(role),
    allowed_actions: allowed_actions,
    forbidden_actions: forbidden_actions,
    expected_output: (m.expected_deliverable || 'Report-only assessment.'),
    token_budget: 2000,
    call_limit: 2,
    cost_limit_usd: per_role_cost,
    retry_limit: 1,
    data_classification: 'internal-nonsensitive'
  };
});

return {
  json: Object.assign({}, j, {
    routing_category: category,
    activated_roles: activated_roles,
    skipped_roles: skipped_roles,
    routing_reason: routing_reason,
    context_packs: context_packs
  })
};
