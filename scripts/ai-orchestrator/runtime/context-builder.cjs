const fs = require('node:fs');
const path = require('node:path');
const {
  OrchestratorError,
  assertPathsAllowed,
  isSensitivePath,
  matchesAny,
  normalizeRepoPath,
  sha256,
} = require('./core.cjs');
const { validateContextPack } = require('../validate-context-pack.cjs');

const SKIPPED_DIRECTORIES = new Set(['.git', '.ai-orchestrator', '.vercel', 'dist', 'node_modules', 'GO IRL DOC', 'GO IRL DOC FULL']);
const SECRET_PATTERNS = [
  { code: 'private_key', pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/i },
  { code: 'credential_assignment', pattern: /\b(?:api[_-]?key|secret|password|passwd|token|credential)\b\s*[:=]\s*[^\s'"`]+/i },
  { code: 'bearer_token', pattern: /\bBearer\s+[A-Za-z0-9._~+/-]{12,}/i },
  { code: 'jwt', pattern: /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/ },
];

function listRepositoryFiles(repoRoot) {
  const root = path.resolve(repoRoot);
  const files = [];
  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory() && SKIPPED_DIRECTORIES.has(entry.name)) continue;
      const absolute = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) visit(absolute);
      if (entry.isFile()) files.push(path.relative(root, absolute).replaceAll('\\', '/'));
    }
  };
  visit(root);
  return files.sort();
}

function resolveSafeFile(repoRoot, repoPath) {
  const root = fs.realpathSync(path.resolve(repoRoot));
  const normalized = normalizeRepoPath(repoPath);
  const absolute = path.resolve(root, ...normalized.split('/'));
  if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) {
    throw new OrchestratorError('CONTEXT_FILE_NOT_FOUND', 'A requested Context Pack file does not exist.', { path: normalized });
  }
  const real = fs.realpathSync(absolute);
  const relative = path.relative(root, real);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new OrchestratorError('CONTEXT_PATH_ESCAPE', 'A Context Pack file resolves outside the repository.', { path: normalized });
  }
  return { absolute: real, path: relative.replaceAll('\\', '/') };
}

function expandIncludePatterns(repoRoot, patterns) {
  if (!Array.isArray(patterns) || patterns.length === 0) {
    throw new OrchestratorError('CONTEXT_ALLOWLIST_REQUIRED', 'Context Builder requires an explicit include allowlist.');
  }
  const repositoryFiles = listRepositoryFiles(repoRoot);
  const selected = new Set();
  for (const rawPattern of patterns) {
    const pattern = normalizeRepoPath(rawPattern);
    const matches = repositoryFiles.filter((repoPath) => matchesAny(repoPath, [pattern]));
    if (matches.length === 0) {
      throw new OrchestratorError('CONTEXT_PATTERN_EMPTY', 'A Context Pack include pattern matched no files.', { pattern });
    }
    for (const match of matches) selected.add(match);
  }
  return [...selected].sort();
}

function redactLine(line) {
  let redacted = line;
  for (const { pattern } of SECRET_PATTERNS) {
    redacted = redacted.replace(pattern, '[REDACTED]');
  }
  return redacted.slice(0, 1000);
}

function findSecrets(content, repoPath) {
  const findings = [];
  const lines = content.split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const { code, pattern } of SECRET_PATTERNS) {
      if (pattern.test(line)) findings.push({ code, path: repoPath, line: index + 1 });
    }
  });
  return findings;
}

function collectGrepEvidence(files, queries) {
  const normalizedQueries = [...new Set((queries || []).map((query) => String(query).trim()).filter(Boolean))];
  if (normalizedQueries.length === 0) {
    throw new OrchestratorError('GREP_QUERY_REQUIRED', 'Context Builder requires at least one grep query.');
  }
  const evidence = [];
  for (const query of normalizedQueries) {
    const lowered = query.toLocaleLowerCase('en-US');
    for (const file of files) {
      const lines = file.content.split(/\r?\n/);
      for (let index = 0; index < lines.length; index += 1) {
        if (lines[index].toLocaleLowerCase('en-US').includes(lowered)) {
          evidence.push({ query, path: file.path, line: index + 1, excerpt: redactLine(lines[index]) || '[EMPTY LINE]' });
          if (evidence.length >= 100) return evidence;
        }
      }
    }
  }
  if (evidence.length === 0) {
    throw new OrchestratorError('GREP_EVIDENCE_EMPTY', 'No grep evidence matched the bounded Context Pack.');
  }
  return evidence;
}

function buildContextPack({ mission, repoRoot, includePatterns, grepQueries, maxBytes = 50_000, maxFiles = 50 }) {
  const selectedPaths = expandIncludePatterns(repoRoot, [...mission.source_of_truth_refs, ...(includePatterns || [])]);
  if (selectedPaths.length > maxFiles) {
    throw new OrchestratorError('CONTEXT_FILE_LIMIT', 'Context Pack exceeds the configured file count limit.', {
      file_count: selectedPaths.length,
      max_files: maxFiles,
    });
  }

  const sourceRefs = new Set(mission.source_of_truth_refs.map(normalizeRepoPath));
  const files = selectedPaths.map((repoPath) => {
    if (isSensitivePath(repoPath)) {
      throw new OrchestratorError('SECRET_PATH_BLOCKED', 'Sensitive files cannot enter a Context Pack.', { path: repoPath });
    }
    if (!sourceRefs.has(repoPath)) assertPathsAllowed([repoPath], mission);
    const resolved = resolveSafeFile(repoRoot, repoPath);
    const bytes = fs.readFileSync(resolved.absolute);
    return { path: resolved.path, bytes, content: bytes.toString('utf8') };
  });

  const totalBytes = files.reduce((total, file) => total + file.bytes.length, 0);
  if (totalBytes > maxBytes) {
    throw new OrchestratorError('CONTEXT_SIZE_LIMIT', 'Context Pack exceeds the configured byte limit.', {
      total_bytes: totalBytes,
      max_bytes: maxBytes,
    });
  }

  const findings = files.flatMap((file) => findSecrets(file.content, file.path));
  const contextPack = {
    schema_version: '1.0',
    mission_id: mission.mission_id,
    source_of_truth_refs: mission.source_of_truth_refs,
    file_manifest: files.map((file) => ({ path: file.path, sha256: sha256(file.bytes), size_bytes: file.bytes.length })),
    grep_evidence: collectGrepEvidence(files, grepQueries),
    constraints: {
      allowed_paths: mission.allowed_paths,
      forbidden_paths: mission.forbidden_paths,
      no_dependency_addition: true,
      no_architecture_rewrite: true,
    },
    acceptance_criteria: mission.acceptance_criteria,
    size_metadata: {
      file_count: files.length,
      total_bytes: totalBytes,
      max_bytes: maxBytes,
      within_limit: true,
    },
    secret_redaction: {
      status: findings.length > 0 ? 'redacted' : 'clean',
      findings: findings.map((finding) => `${finding.code} at ${finding.path}:${finding.line}`),
      redacted_fields: [...new Set(findings.map((finding) => `${finding.path}:${finding.line}`))],
    },
  };

  const errors = validateContextPack(contextPack);
  if (errors.length > 0) {
    throw new OrchestratorError('CONTEXT_PACK_INVALID', 'Generated Context Pack failed contract validation.', { errors });
  }
  return contextPack;
}

module.exports = {
  buildContextPack,
  collectGrepEvidence,
  expandIncludePatterns,
  findSecrets,
  listRepositoryFiles,
  redactLine,
  resolveSafeFile,
};
