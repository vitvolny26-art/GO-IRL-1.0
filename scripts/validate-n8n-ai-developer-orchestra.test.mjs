import { describe, expect, it } from 'vitest';
import validator from './validate-n8n-ai-developer-orchestra.cjs';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function codes(workflow) {
  return validator.validateWorkflow(workflow).map((error) => error.code);
}

describe('GO IRL n8n AI Developer Orchestra Operations Layer validator', () => {
  it('accepts the inactive Operations Layer around the Runtime Bridge', () => {
    expect(validator.validateWorkflow(validator.readWorkflow())).toEqual([]);
  });

  it('rejects activation and embedded credentials', () => {
    const workflow = clone(validator.readWorkflow());
    workflow.active = true;
    workflow.nodes[0].credentials = { telegramApi: { id: 'secret', name: 'secret' } };
    expect(codes(workflow)).toEqual(expect.arrayContaining(['WORKFLOW_ACTIVE', 'EMBEDDED_CREDENTIALS']));
  });

  it('rejects a post-intake Runtime command that bypasses bridge.cjs', () => {
    const workflow = clone(validator.readWorkflow());
    const builder = workflow.nodes.find((item) => item.name === 'Build Planner Command');
    builder.parameters.jsCode = builder.parameters.jsCode.replace('scripts/ai-orchestrator/bridge.cjs', 'scripts/ai-orchestrator/orchestrator.cjs');
    expect(codes(workflow)).toContain('BRIDGE_BYPASS');
  });

  it('rejects a publish path that bypasses Human Approval', () => {
    const workflow = clone(validator.readWorkflow());
    workflow.connections['Telegram User Validation'].main[0].push({ node: 'Build Publish Preview Command', type: 'main', index: 0 });
    expect(codes(workflow)).toContain('PUBLISH_PREVIEW_BYPASS');
  });

  it('rejects removal of Mission Queue idempotency', () => {
    const workflow = clone(validator.readWorkflow());
    const evaluator = workflow.nodes.find((item) => item.name === 'Queue — Evaluate Idempotency');
    evaluator.parameters.jsCode = 'return [{json:{duplicate:false}}];';
    expect(codes(workflow)).toContain('QUEUE_IDEMPOTENCY_MISSING');
  });

  it('rejects removal of the one-retry integration cap', () => {
    const workflow = clone(validator.readWorkflow());
    const failure = workflow.nodes.find((item) => item.name === 'Sanitize Operations Failure');
    failure.parameters.jsCode = failure.parameters.jsCode.replace('Math.min(1,previous+1)', 'previous+1');
    expect(codes(workflow)).toContain('INTEGRATION_RETRY_CAP_MISSING');
  });

  it('rejects Drive report deletion', () => {
    const workflow = clone(validator.readWorkflow());
    workflow.nodes.find((item) => item.name === 'Drive — Update Agent Report').parameters.operation = 'deleteFile';
    expect(codes(workflow)).toContain('DRIVE_DELETE_FORBIDDEN');
  });

  it('rejects a dry-run connection to an external node', () => {
    const workflow = clone(validator.readWorkflow());
    workflow.connections['Build Dry Run Preview'].main[0].push({ node: 'Drive — Search Agent Report', type: 'main', index: 0 });
    expect(codes(workflow)).toContain('DRY_RUN_EXTERNAL_WRITE');
  });

  it('rejects an invented Draft PR claim', () => {
    const workflow = clone(validator.readWorkflow());
    const report = workflow.nodes.find((item) => item.name === 'Build Telegram Completion Message');
    report.parameters.jsCode = report.parameters.jsCode.replace('Publish preview ready. Draft PR execution requires separate GitHub Operator approval.', 'Draft PR created: https://example.invalid/pr/1');
    expect(codes(workflow)).toContain('PUBLISH_STATUS_NOT_HONEST');
  });
});
