import { execFileSync, spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import validator from './validate-mission.cjs';

const directory = path.dirname(fileURLToPath(import.meta.url));
const fixture = (kind, name) => path.join(directory, 'fixtures', kind, `${name}.json`);
const schema = (name) => validator.readJson(path.join(directory, 'schemas', `${name}.schema.json`));

const matrix = [
  ['mission', 'valid', 'mission-approved-low-risk', true],
  ['mission', 'valid', 'mission-docs-only', true],
  ['mission', 'invalid', 'mission-missing-objective', false],
  ['mission', 'invalid', 'mission-forbidden-scope', false],
  ['context-pack', 'valid', 'context-pack-bounded', true],
  ['context-pack', 'valid', 'context-pack-redacted', true],
  ['context-pack', 'invalid', 'context-pack-size-exceeded', false],
  ['context-pack', 'invalid', 'context-pack-secret-blocked', false],
  ['agent-result', 'valid', 'agent-result-pass', true],
  ['agent-result', 'valid', 'agent-result-blocked', true],
  ['agent-result', 'invalid', 'agent-result-multiple-next-actions', false],
  ['agent-result', 'invalid', 'agent-result-undeclared-field', false],
];

describe('AI developer orchestrator Phase 0 fixture matrix', () => {
  for (const [contract, kind, name, expectedValid] of matrix) {
    it(`${expectedValid ? 'accepts' : 'rejects'} ${name}`, () => {
      const errors = validator.validateAgainstSchema(validator.readJson(fixture(kind, name)), schema(contract));
      expect(errors.length === 0).toBe(expectedValid);
    });
  }

  it('returns structured errors with exact paths and codes', () => {
    const errors = validator.validateMission(validator.readJson(fixture('invalid', 'mission-missing-objective')));
    expect(errors).toContainEqual({ path: '$', code: 'required', message: 'missing required property "objective"' });
  });

  it('rejects forbidden scope and bypassed approval', () => {
    const errors = validator.validateMission(validator.readJson(fixture('invalid', 'mission-forbidden-scope')));
    expect(validator.formatErrors(errors)).toContain('$.allowed_paths[0]: must match pattern');
    expect(validator.formatErrors(errors)).toContain('$.requires_human_approval: must equal true');
  });

  it('rejects an oversized Context Pack', () => {
    const errors = validator.validateAgainstSchema(validator.readJson(fixture('invalid', 'context-pack-size-exceeded')), schema('context-pack'));
    expect(validator.formatErrors(errors)).toContain('$.size_metadata.within_limit: must equal true');
  });

  it('enforces exactly one scalar next action', () => {
    const errors = validator.validateAgainstSchema(validator.readJson(fixture('invalid', 'agent-result-multiple-next-actions')), schema('agent-result'));
    expect(validator.formatErrors(errors)).toContain('$.next_action: expected string, received array');
  });

  it('returns zero for a valid mission CLI invocation', () => {
    const output = execFileSync(process.execPath, [path.join(directory, 'validate-mission.cjs'), fixture('valid', 'mission-approved-low-risk')], { encoding: 'utf8' });
    expect(output).toContain('PASS');
  });

  it('returns the complete validation block for an invalid mission CLI invocation', () => {
    const result = spawnSync(process.execPath, [path.join(directory, 'validate-mission.cjs'), fixture('invalid', 'mission-missing-objective')], { encoding: 'utf8' });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('FAIL');
    expect(result.stderr).toContain('$: missing required property "objective"');
  });
});
