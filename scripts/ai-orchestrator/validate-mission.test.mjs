import { spawnSync } from 'node:child_process';
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
  ['mission', 'invalid', 'mission-sensitive-auth-rls', false],
  ['mission', 'invalid', 'mission-sensitive-sql-migration', false],
  ['mission', 'invalid', 'mission-sensitive-deployment', false],
  ['mission', 'invalid', 'mission-sensitive-production-data', false],
  ['mission', 'invalid', 'mission-sensitive-secrets-credentials', false],
  ['context-pack', 'valid', 'context-pack-bounded', true],
  ['context-pack', 'valid', 'context-pack-redacted', true],
  ['context-pack', 'invalid', 'context-pack-size-exceeded', false],
  ['context-pack', 'invalid', 'context-pack-secret-blocked', false],
  ['agent-result', 'valid', 'agent-result-pass', true],
  ['agent-result', 'valid', 'agent-result-blocked', true],
  ['agent-result', 'invalid', 'agent-result-multiple-next-actions', false],
  ['agent-result', 'invalid', 'agent-result-undeclared-field', false],
];

const sensitiveMissionCases = [
  ['mission-sensitive-auth-rls', ['$.allowed_paths[0]', '$.allowed_paths[1]']],
  ['mission-sensitive-sql-migration', ['$.allowed_paths[0]', '$.allowed_paths[1]']],
  ['mission-sensitive-deployment', ['$.allowed_paths[0]', '$.allowed_paths[1]']],
  ['mission-sensitive-production-data', ['$.allowed_paths[0]']],
  ['mission-sensitive-secrets-credentials', ['$.allowed_paths[0]', '$.allowed_paths[1]']],
];

const cliCases = [
  {
    command: 'validate-mission.cjs',
    valid: fixture('valid', 'mission-approved-low-risk'),
    invalid: fixture('invalid', 'mission-missing-objective'),
  },
  {
    command: 'validate-context-pack.cjs',
    valid: fixture('valid', 'context-pack-bounded'),
    invalid: fixture('invalid', 'context-pack-secret-blocked'),
  },
  {
    command: 'validate-agent-result.cjs',
    valid: fixture('valid', 'agent-result-pass'),
    invalid: fixture('invalid', 'agent-result-undeclared-field'),
  },
];

function runCli(command, args = []) {
  return spawnSync(process.execPath, [path.join(directory, command), ...args], { encoding: 'utf8' });
}

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

  for (const [name, paths] of sensitiveMissionCases) {
    it(`rejects every sensitive path in ${name}`, () => {
      const errors = validator.validateMission(validator.readJson(fixture('invalid', name)));
      for (const expectedPath of paths) {
        expect(errors).toContainEqual({
          path: expectedPath,
          code: 'not',
          message: 'matches a forbidden sensitive-scope pattern',
        });
      }
    });
  }

  it('rejects an oversized Context Pack', () => {
    const errors = validator.validateAgainstSchema(validator.readJson(fixture('invalid', 'context-pack-size-exceeded')), schema('context-pack'));
    expect(validator.formatErrors(errors)).toContain('$.size_metadata.within_limit: must equal true');
  });

  it('enforces exactly one scalar next action', () => {
    const errors = validator.validateAgainstSchema(validator.readJson(fixture('invalid', 'agent-result-multiple-next-actions')), schema('agent-result'));
    expect(validator.formatErrors(errors)).toContain('$.next_action: expected string, received array');
  });

  for (const cli of cliCases) {
    it(`${cli.command} returns 0 for valid input`, () => {
      const result = runCli(cli.command, [cli.valid]);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('PASS');
      expect(result.stderr).toBe('');
    });

    it(`${cli.command} returns 1 with structured errors for invalid input`, () => {
      const result = runCli(cli.command, [cli.invalid]);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('FAIL');
      expect(result.stderr).toContain('$');
      expect(result.stderr).not.toContain('Secret-like content detected.');
    });

    it(`${cli.command} returns 2 when the file path is missing`, () => {
      const result = runCli(cli.command);
      expect(result.status).toBe(2);
      expect(result.stderr).toContain(`Usage: node scripts/ai-orchestrator/${cli.command}`);
    });
  }
});
