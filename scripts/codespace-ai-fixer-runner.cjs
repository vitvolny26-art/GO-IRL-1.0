#!/usr/bin/env node

const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const REPO = '/workspaces/GO-IRL-1.0';
const ALLOWED_BRANCH = /^(fix|feat|chore|docs|test)\/[a-z0-9._/-]+$/;
const DEFAULT_COMMIT = 'fix: apply AI Fixer mission';
const DEFAULT_PR_TITLE = 'fix: apply AI Fixer mission';

function fail(message, code = 1) {
  process.stderr.write(`${message}\n`);
  process.exit(code);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: REPO,
    encoding: 'utf8',
    stdio: options.capture ? 'pipe' : 'inherit',
    env: process.env,
  });

  if (options.capture) {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
  }

  if (result.error) fail(`${command}: ${result.error.message}`);
  if (result.status !== 0 && !options.allowFailure) process.exit(result.status ?? 1);
  return result;
}

function value(name) {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1 || !process.argv[index + 1]) fail(`MISSING_${name.toUpperCase()}`);
  return process.argv[index + 1];
}

function validateBranch(branch) {
  if (!ALLOWED_BRANCH.test(branch)) fail('UNSAFE_BRANCH');
}

function ensureRepo() {
  if (!fs.existsSync(path.join(REPO, '.git'))) fail('GO_IRL_REPO_NOT_FOUND');
}

function prepare() {
  const branch = value('branch');
  validateBranch(branch);
  ensureRepo();

  const status = run('git', ['status', '--porcelain'], { capture: true });
  if (status.stdout.trim()) fail('WORKTREE_NOT_CLEAN');

  run('git', ['fetch', 'origin', 'main']);
  run('git', ['switch', 'main']);
  run('git', ['pull', '--ff-only', 'origin', 'main']);
  run('git', ['switch', '-c', branch, 'origin/main']);
  run('pnpm', ['install', '--frozen-lockfile']);
  process.stdout.write('GO_IRL_BRANCH_READY_IN_CODESPACE\n');
}

function codex() {
  ensureRepo();
  const promptB64 = value('prompt-b64');
  const prompt = Buffer.from(promptB64, 'base64').toString('utf8').trim();
  if (!prompt) fail('EMPTY_PROMPT');

  run('codex', ['exec', '--full-auto', '--sandbox', 'workspace-write', '-C', REPO, prompt]);
  run('git', ['diff', '--check']);
  run('git', ['diff', '--stat']);
  process.stdout.write('GO_IRL_CODEX_GREEN\n');
}

function checks() {
  ensureRepo();
  const commands = [
    ['lint', ['run', 'lint']],
    ['build', ['run', 'build']],
    ['test', ['run', 'test']],
  ];

  let failed = false;
  for (const [name, args] of commands) {
    const result = run('pnpm', args, { allowFailure: true });
    if (result.status !== 0) {
      process.stderr.write(`GO_IRL_${name.toUpperCase()}_RED\n`);
      failed = true;
    }
  }

  if (failed) fail('GO_IRL_CHECKS_RED');
  process.stdout.write('GO_IRL_CHECKS_GREEN\n');
}

function publish() {
  ensureRepo();
  const branch = value('branch');
  validateBranch(branch);

  run('git', ['add', '-A']);
  const staged = run('git', ['diff', '--cached', '--quiet'], { allowFailure: true });
  if (staged.status === 0) fail('NO_CHANGES');
  if (staged.status !== 1) process.exit(staged.status ?? 1);

  run('git', ['commit', '-m', DEFAULT_COMMIT]);
  run('git', ['push', '-u', 'origin', branch]);

  const existing = spawnSync('gh', ['pr', 'view', branch, '--json', 'url', '-q', '.url'], {
    cwd: REPO,
    encoding: 'utf8',
  });

  let prUrl = existing.status === 0 ? existing.stdout.trim() : '';
  if (!prUrl) {
    const created = spawnSync(
      'gh',
      [
        'pr',
        'create',
        '--base',
        'main',
        '--head',
        branch,
        '--title',
        DEFAULT_PR_TITLE,
        '--body',
        '## Summary\n- AI Fixer mission applied\n\n## Checks\n- pnpm run lint\n- pnpm run build\n- pnpm run test\n\n## Safety\n- human review and merge required',
      ],
      { cwd: REPO, encoding: 'utf8' },
    );
    if (created.stderr) process.stderr.write(created.stderr);
    if (created.status !== 0) process.exit(created.status ?? 1);
    prUrl = created.stdout.trim();
  }

  if (!/^https:\/\/github\.com\//.test(prUrl)) fail('PR_URL_MISSING');
  process.stdout.write(`PR_URL=${prUrl}\n`);
}

const command = process.argv[2];
if (command === 'prepare') prepare();
else if (command === 'codex') codex();
else if (command === 'checks' || command === 'q') checks();
else if (command === 'publish' || command === 'r') publish();
else fail('USAGE: prepare | codex | checks | publish');
