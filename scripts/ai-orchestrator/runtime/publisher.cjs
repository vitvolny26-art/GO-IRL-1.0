const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const {
  OrchestratorError,
  assertPathsAllowed,
  loadState,
  normalizeRepoPath,
  requireMission,
  saveState,
  sha256,
  transition,
} = require('./core.cjs');

function defaultPublisherRunner(command, args, cwd) {
  const executable = process.platform === 'win32' && command === 'pnpm' ? 'pnpm.cmd' : command;
  const result = spawnSync(executable, args, { cwd, encoding: 'utf8', shell: false });
  if ((result.status ?? 1) !== 0) {
    const block = [result.stdout, result.stderr, result.error?.message].filter(Boolean).join('\n').trim();
    throw new OrchestratorError('PUBLISH_COMMAND_FAILED', `Publish command failed: ${command} ${args.join(' ')}`, {
      command: [command, ...args].join(' '),
      error_block: block,
    });
  }
  return (result.stdout || '').trim();
}

function uniqueSorted(paths) {
  return [...new Set(paths.map(normalizeRepoPath))].sort();
}

function requiredPublishFiles(record) {
  const changedFiles = record.agent_executions.implementer?.result.changed_files || [];
  const reportPath = record.artifacts.agent_report?.path;
  if (!reportPath) throw new OrchestratorError('AGENT_REPORT_REQUIRED', 'Publisher requires an Agent Report in the checked diff.');
  return uniqueSorted([...changedFiles, reportPath]);
}

function validatePublishRequest({ record, repoRoot, selectedFiles, branch, dirtyFiles }) {
  if (record.state !== 'report_ready' || !record.change_approval) {
    throw new OrchestratorError('CHANGE_APPROVAL_REQUIRED', 'Publishing requires report_ready state and Change Approval.');
  }
  if (!record.checks.final?.green) {
    throw new OrchestratorError('FINAL_QA_REQUIRED', 'Publishing requires a green final quality gate including the Agent Report.');
  }
  if (!/^agent\/[A-Za-z0-9._/-]+$/.test(branch)) {
    throw new OrchestratorError('AGENT_BRANCH_REQUIRED', 'Publisher may push only an agent/* branch.', { branch });
  }
  const selected = uniqueSorted(selectedFiles);
  const required = requiredPublishFiles(record);
  assertPathsAllowed(selected, record.mission);
  if (JSON.stringify(selected) !== JSON.stringify(required)) {
    throw new OrchestratorError('PUBLISH_SELECTION_MISMATCH', 'Selected files must exactly match implementer changes plus the Agent Report.', {
      required,
      selected,
    });
  }
  if (dirtyFiles) {
    const dirty = new Set(uniqueSorted(dirtyFiles));
    const missing = selected.filter((file) => !dirty.has(file));
    if (missing.length > 0) {
      throw new OrchestratorError('PUBLISH_FILE_NOT_DIRTY', 'A selected file is not present in the worktree diff.', { missing });
    }
  }
  const reportAbsolute = path.resolve(repoRoot, ...record.artifacts.agent_report.path.split('/'));
  if (!fs.existsSync(reportAbsolute) || sha256(fs.readFileSync(reportAbsolute)) !== record.artifacts.agent_report.sha256) {
    throw new OrchestratorError('AGENT_REPORT_CHANGED', 'Agent Report content changed after it was recorded.');
  }
  return selected;
}

function readDirtyFiles(repoRoot, runner) {
  const tracked = runner('git', ['diff', '--name-only', '--relative', 'HEAD'], repoRoot).split(/\r?\n/).filter(Boolean);
  const untracked = runner('git', ['ls-files', '--others', '--exclude-standard'], repoRoot).split(/\r?\n/).filter(Boolean);
  return uniqueSorted([...tracked, ...untracked]);
}

function readStagedFiles(repoRoot, runner) {
  const output = runner('git', ['diff', '--cached', '--name-only', '--relative'], repoRoot);
  return uniqueSorted(output.split(/\r?\n/).filter(Boolean));
}

function assertExactStagedSelection(stagedFiles, selectedFiles) {
  const staged = uniqueSorted(stagedFiles);
  const selected = uniqueSorted(selectedFiles);
  if (JSON.stringify(staged) !== JSON.stringify(selected)) {
    throw new OrchestratorError('STAGED_SELECTION_MISMATCH', 'Git index must contain exactly the selected publish files.', {
      selected,
      staged,
    });
  }
  return staged;
}

function publishDraft({
  missionId,
  stateDir,
  repoRoot,
  selectedFiles,
  commitMessage,
  prTitle,
  prBody,
  execute = false,
  branch,
  dirtyFiles,
  runner = defaultPublisherRunner,
  now = new Date(),
}) {
  const state = loadState(stateDir);
  const record = requireMission(state, missionId);
  const currentBranch = branch || runner('git', ['branch', '--show-current'], repoRoot);
  const currentDirtyFiles = dirtyFiles || readDirtyFiles(repoRoot, runner);
  const selected = validatePublishRequest({ record, repoRoot, selectedFiles, branch: currentBranch, dirtyFiles: currentDirtyFiles });
  if (!commitMessage || !prTitle) {
    throw new OrchestratorError('PUBLISH_METADATA_REQUIRED', 'Commit message and Draft PR title are required.');
  }

  const plan = {
    branch: currentBranch,
    selected_files: selected,
    commit_message: commitMessage,
    pr_title: prTitle,
    draft: true,
    merge: false,
    deploy: false,
    commands: [
      ['git', 'diff', '--cached', '--name-only', '--relative'],
      ['git', 'add', '--', ...selected],
      ['git', 'diff', '--cached', '--name-only', '--relative'],
      ['git', 'diff', '--cached', '--check'],
      ['git', 'commit', '-m', commitMessage],
      ['git', 'push', '-u', 'origin', currentBranch],
      ['gh', 'pr', 'create', '--draft', '--base', 'main', '--head', currentBranch, '--title', prTitle],
    ],
  };
  if (!execute) return { executed: false, plan };

  const preexistingStagedFiles = readStagedFiles(repoRoot, runner);
  if (preexistingStagedFiles.length > 0) {
    throw new OrchestratorError('PREEXISTING_STAGED_FILES', 'Git index must be empty before selected files are staged.', {
      staged: preexistingStagedFiles,
    });
  }
  runner('git', ['add', '--', ...selected], repoRoot);
  assertExactStagedSelection(readStagedFiles(repoRoot, runner), selected);
  runner('git', ['diff', '--cached', '--check'], repoRoot);
  runner('git', ['commit', '-m', commitMessage], repoRoot);
  transition(record, 'committed', now);
  saveState(stateDir, state);

  runner('git', ['push', '-u', 'origin', currentBranch], repoRoot);
  transition(record, 'pushed', now);
  saveState(stateDir, state);

  const body = prBody || `Mission: ${missionId}\n\nQuality gate: PASS\n\nDraft only. No merge or deploy.`;
  const url = runner('gh', [
    'pr', 'create', '--draft', '--base', 'main', '--head', currentBranch,
    '--title', prTitle, '--body', body,
  ], repoRoot);
  record.draft_pr = { url, created_at: now.toISOString() };
  transition(record, 'draft_pr', now);
  saveState(stateDir, state);
  return { executed: true, plan, url, record };
}

module.exports = {
  assertExactStagedSelection,
  defaultPublisherRunner,
  publishDraft,
  readDirtyFiles,
  readStagedFiles,
  requiredPublishFiles,
  validatePublishRequest,
};
