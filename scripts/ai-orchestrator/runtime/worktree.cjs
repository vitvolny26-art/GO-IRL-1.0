const fs = require('node:fs');
const path = require('node:path');
const { isSensitivePath, normalizeRepoPath, sha256 } = require('./core.cjs');

const SKIPPED_DIRECTORIES = new Set(['.git', '.ai-orchestrator', '.vercel', 'dist', 'node_modules', 'GO IRL DOC', 'GO IRL DOC FULL']);

function isInside(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function captureWorktreeSnapshot(repoRoot, excludedDirectory) {
  const root = path.resolve(repoRoot);
  const excluded = excludedDirectory ? path.resolve(excludedDirectory) : null;
  const snapshot = {};
  const visit = (directory) => {
    if (excluded && isInside(excluded, directory)) return;
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory() && SKIPPED_DIRECTORIES.has(entry.name)) continue;
      const absolute = path.join(directory, entry.name);
      if (excluded && isInside(excluded, absolute)) continue;
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) {
        visit(absolute);
      } else if (entry.isFile()) {
        const repoPath = normalizeRepoPath(path.relative(root, absolute).replaceAll('\\', '/'));
        const stat = fs.statSync(absolute);
        snapshot[repoPath] = isSensitivePath(repoPath)
          ? `sensitive:${stat.size}:${stat.mtimeMs}`
          : `sha256:${sha256(fs.readFileSync(absolute))}`;
      }
    }
  };
  visit(root);
  return snapshot;
}

function diffWorktreeSnapshots(before, after) {
  const paths = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);
  return [...paths].filter((repoPath) => before?.[repoPath] !== after?.[repoPath]).sort();
}

module.exports = { captureWorktreeSnapshot, diffWorktreeSnapshots };
