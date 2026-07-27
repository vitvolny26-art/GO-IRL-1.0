import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { describe, expect, it } from 'vitest';
import archivist from './runtime/chief-archivist-evidence.cjs';

const source = (id, content, authorityRank = 3) => ({
  id,
  content,
  authority_rank: authorityRank,
});

function report({
  status = 'COMPLETED',
  blockers = [],
  finding = 'Проверки пройдены.',
  rows = [
    ['Проверки пройдены.', 'GH:CHECKS@abc123', 'checks at abc123'],
    ['Current main verified.', 'GH:README.md@abc123', 'README.md at abc123'],
    ['Workflow evidence inspected.', 'RUNTIME:workflow-1', 'workflow-1 execution 10'],
  ],
} = {}) {
  const ledger = rows.map((row) => `| ${row.join(' | ')} |`).join('\n');
  return {
    status,
    blockers,
    report: [
      '# Agent Report',
      '## Findings',
      finding,
      '## Evidence ledger',
      '| Claim | Evidence | Scope |',
      '| --- | --- | --- |',
      ledger,
    ].join('\n'),
  };
}

const allowed = ['GH:CHECKS@abc123', 'GH:README.md@abc123', 'RUNTIME:workflow-1'];

describe('Chief Archivist deterministic evidence selection', () => {
  it('enforces source-count and character budgets', () => {
    const selected = archivist.selectArchivistEvidence({
      sources: [
        source('GH:C@abc', 'cccc', 3),
        source('GH:A@abc', 'aaaa', 1),
        source('GH:B@abc', 'bbbbbb', 2),
      ],
      maxSources: 2,
      maxCharacters: 7,
    });
    expect(selected.allowed_evidence_ids).toEqual(['GH:A@abc', 'GH:B@abc']);
    expect(selected.selected.map((item) => item.content)).toEqual(['aaaa', 'bbb']);
    expect(selected.selected[1].truncated).toBe(true);
    expect(selected.size).toEqual({
      source_count: 2,
      character_count: 7,
      max_sources: 2,
      max_characters: 7,
      within_limit: true,
    });
  });

  it('uses deterministic authority-rank and evidence-ID ordering', () => {
    const sources = [
      source('DRIVE:z', 'drive z', 4),
      source('GH:b@abc', 'github b', 1),
      source('GH:a@abc', 'github a', 1),
      source('RUNTIME:x', 'runtime', 0),
    ];
    const forward = archivist.selectArchivistEvidence({ sources });
    const reversed = archivist.selectArchivistEvidence({ sources: [...sources].reverse() });
    expect(forward).toEqual(reversed);
    expect(forward.allowed_evidence_ids).toEqual(['RUNTIME:x', 'GH:a@abc', 'GH:b@abc', 'DRIVE:z']);
  });

  it('selects only requested IDs and fails closed for unavailable IDs', () => {
    const sources = [source('GH:a@abc', 'a'), source('GH:b@abc', 'b')];
    const selected = archivist.selectArchivistEvidence({
      sources,
      requestedEvidenceIds: ['GH:b@abc'],
    });
    expect(selected.allowed_evidence_ids).toEqual(['GH:b@abc']);
    expect(() => archivist.selectArchivistEvidence({
      sources,
      requestedEvidenceIds: ['GH:missing@abc'],
    })).toThrowError(expect.objectContaining({ code: 'ARCHIVIST_EVIDENCE_UNAVAILABLE' }));
  });
});

describe('Chief Archivist versioned prompt loading', () => {
  it('loads all required versioned prompts with stable hashes', () => {
    const prompts = archivist.loadVersionedArchivistPrompts({ repoRoot: process.cwd() });
    expect(Object.keys(prompts)).toEqual(archivist.REQUIRED_PROMPTS);
    expect(Object.values(prompts).every((prompt) => /^[0-9a-f]{64}$/.test(prompt.sha256))).toBe(true);
  });

  it('fails closed when a required prompt is missing', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'go-irl-archivist-prompts-'));
    const directory = path.join(root, 'scripts', 'ai-orchestrator', 'prompts');
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(path.join(directory, 'chief-archivist.md'), 'role', 'utf8');
    fs.writeFileSync(path.join(directory, 'evidence-contract.md'), 'contract', 'utf8');
    expect(() => archivist.loadVersionedArchivistPrompts({ repoRoot: root }))
      .toThrowError(expect.objectContaining({ code: 'ARCHIVIST_PROMPT_MISSING' }));
  });
});

describe('Chief Archivist report validation', () => {
  it('accepts a bounded COMPLETED report with three selected evidence rows', () => {
    expect(archivist.validateArchivistResult({
      result: report(),
      allowedEvidenceIds: allowed,
    })).toEqual({
      valid: true,
      status: 'COMPLETED',
      ledger_rows: 3,
      strong_claims: 1,
    });
  });

  it('rejects COMPLETED with fewer than three ledger rows', () => {
    expect(() => archivist.validateArchivistResult({
      result: report({
        rows: [
          ['Проверки пройдены.', 'GH:CHECKS@abc123', 'checks at abc123'],
          ['Current main verified.', 'GH:README.md@abc123', 'README.md at abc123'],
        ],
      }),
      allowedEvidenceIds: allowed,
    })).toThrowError(expect.objectContaining({ code: 'ARCHIVIST_LEDGER_TOO_SMALL' }));
  });

  it('rejects unselected evidence IDs', () => {
    expect(() => archivist.validateArchivistResult({
      result: report({
        rows: [
          ['Проверки пройдены.', 'GH:CHECKS@abc123', 'checks at abc123'],
          ['Current main verified.', 'GH:UNSELECTED@abc123', 'README.md at abc123'],
          ['Workflow evidence inspected.', 'RUNTIME:workflow-1', 'workflow-1 execution 10'],
        ],
      }),
      allowedEvidenceIds: allowed,
    })).toThrowError(expect.objectContaining({ code: 'ARCHIVIST_EVIDENCE_NOT_SELECTED' }));
  });

  it.each(['all', 'all files', 'entire project', 'project-wide review', 'everything', 'весь проект', 'без ограничений'])(
    'rejects global scope %s',
    (scope) => {
      expect(() => archivist.validateArchivistResult({
        result: report({
          rows: [
            ['Проверки пройдены.', 'GH:CHECKS@abc123', scope],
            ['Current main verified.', 'GH:README.md@abc123', 'README.md at abc123'],
            ['Workflow evidence inspected.', 'RUNTIME:workflow-1', 'workflow-1 execution 10'],
          ],
        }),
        allowedEvidenceIds: allowed,
      })).toThrowError(expect.objectContaining({ code: 'ARCHIVIST_SCOPE_GLOBAL' }));
    },
  );

  it('rejects a strong claim without a matching ledger claim', () => {
    expect(() => archivist.validateArchivistResult({
      result: report({
        finding: 'Проверки пройдены.',
        rows: [
          ['Quality evidence inspected.', 'GH:CHECKS@abc123', 'checks at abc123'],
          ['Current main verified.', 'GH:README.md@abc123', 'README.md at abc123'],
          ['Workflow evidence inspected.', 'RUNTIME:workflow-1', 'workflow-1 execution 10'],
        ],
      }),
      allowedEvidenceIds: allowed,
    })).toThrowError(expect.objectContaining({ code: 'ARCHIVIST_STRONG_CLAIM_UNSUPPORTED' }));
  });

  it('rejects duplicate completed-report ledger claims', () => {
    expect(() => archivist.validateArchivistResult({
      result: report({
        rows: [
          ['Проверки пройдены.', 'GH:CHECKS@abc123', 'checks at abc123'],
          ['Проверки пройдены.', 'GH:README.md@abc123', 'README.md at abc123'],
          ['Workflow evidence inspected.', 'RUNTIME:workflow-1', 'workflow-1 execution 10'],
        ],
      }),
      allowedEvidenceIds: allowed,
    })).toThrowError(expect.objectContaining({ code: 'ARCHIVIST_LEDGER_DUPLICATE' }));
  });

  it('accepts a BLOCKED report with one bounded ledger row and exact blocker', () => {
    expect(archivist.validateArchivistResult({
      result: report({
        status: 'BLOCKED',
        blockers: ['Drive evidence is unavailable.'],
        finding: 'Drive evidence is unavailable.',
        rows: [['Drive source missing.', 'GH:README.md@abc123', 'requested Drive source for mission 1']],
      }),
      allowedEvidenceIds: allowed,
    }).status).toBe('BLOCKED');
  });
});
