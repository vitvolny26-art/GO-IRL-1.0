const { execFileSync } = require("node:child_process");

const branch = process.env.VERCEL_GIT_COMMIT_REF ?? "";
const deployableBranch =
  branch === "main" || branch.startsWith("preview/");

if (!deployableBranch) {
  console.log(`Skipping Vercel build for non-deployable branch: ${branch || "unknown"}`);
  process.exit(0);
}

const currentSha = process.env.VERCEL_GIT_COMMIT_SHA ?? "HEAD";
const previousSha = process.env.VERCEL_GIT_PREVIOUS_SHA;
const baseSha = previousSha || `${currentSha}^`;

let changedFiles;

try {
  changedFiles = execFileSync(
    "git",
    ["diff", "--name-only", baseSha, currentSha, "--"],
    { encoding: "utf8" },
  )
    .split(/\r?\n/u)
    .filter(Boolean);
} catch {
  console.log("Unable to determine a safe diff; continuing with the build.");
  process.exit(1);
}

const docsOnly =
  changedFiles.length > 0 &&
  changedFiles.every(
    (file) => file.startsWith("docs/") || file.endsWith(".md"),
  );

if (docsOnly) {
  console.log("Skipping Vercel build for docs-only changes.");
  process.exit(0);
}

console.log("Runtime changes detected; continuing with the Vercel build.");
process.exit(1);
