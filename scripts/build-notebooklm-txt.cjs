const fs = require("fs");
const path = require("path");

const root = process.cwd();

const outputs = {
  readme: "GO_IRL_NOTEBOOKLM_00_READ_ME.txt",
  core: "GO_IRL_NOTEBOOKLM_01_CORE_DOCS.txt",
  bible: "GO_IRL_NOTEBOOKLM_02_BIBLE_GOVERNANCE.txt",
  market: "GO_IRL_NOTEBOOKLM_03_MARKET_REPORTS.txt",
  code: "GO_IRL_NOTEBOOKLM_04_CODE.txt",
  supabase: "GO_IRL_NOTEBOOKLM_05_SUPABASE.txt",
  index: "GO_IRL_NOTEBOOKLM_06_INDEX.txt",
};

const blockedDirs = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  ".vercel",
  "GO IRL DOC",
  "GO IRL DOC FULL",
]);

const blockedFiles = new Set([
  "package-lock.json",
  "pnpm-lock.yaml",
]);

const binaryExt = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".ico",
  ".svg",
  ".zip",
  ".gz",
  ".pdf",
  ".docx",
  ".pptx",
  ".xlsx",
]);

const textExt = new Set([
  ".md",
  ".txt",
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".cjs",
  ".mjs",
  ".json",
  ".css",
  ".html",
  ".sql",
  ".toml",
  ".yml",
  ".yaml",
]);

const groups = {
  core: [],
  bible: [],
  market: [],
  code: [],
  supabase: [],
};

const indexRows = [];

function isGeneratedOutput(name) {
  return /^GO_IRL_NOTEBOOKLM_.*\.txt$/.test(name);
}

function isBlockedFile(name) {
  return name.startsWith(".env") || name.endsWith(".local") || blockedFiles.has(name) || isGeneratedOutput(name);
}

function classify(rel, ext) {
  if (rel.startsWith("supabase/")) return "supabase";

  if (
    rel.startsWith("docs/bible/") ||
    rel.startsWith("docs/governance/") ||
    rel.startsWith("docs/onboarding/")
  ) {
    return "bible";
  }

  if (
    rel.startsWith("docs/market/") ||
    rel.startsWith("docs/reports/") ||
    rel === "docs/MARKET_POSITIONING.md" ||
    rel === "docs/COMPETITOR_WATCH.md"
  ) {
    return "market";
  }

  if (rel.startsWith("docs/") || ext === ".md" || ext === ".txt") return "core";

  if (
    rel.startsWith("src/") ||
    rel.startsWith("scripts/") ||
    textExt.has(ext)
  ) {
    return "code";
  }

  return null;
}

function add(group, file) {
  const rel = path.relative(root, file).replace(/\\/g, "/");
  const content = fs.readFileSync(file, "utf8");

  groups[group].push(`\n\n===== FILE: ${rel} =====\n\n${content}`);
  indexRows.push({ file: rel, group, output: outputs[group] });
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!blockedDirs.has(entry.name)) walk(fullPath);
      continue;
    }

    if (!entry.isFile() || isBlockedFile(entry.name)) continue;

    const ext = path.extname(entry.name);
    if (binaryExt.has(ext) || !textExt.has(ext)) continue;

    const rel = path.relative(root, fullPath).replace(/\\/g, "/");
    const group = classify(rel, ext);
    if (group) add(group, fullPath);
  }
}

function writeOutput(file, title, body) {
  fs.writeFileSync(file, [`# ${title}`, "", ...body].join("\n"));
}

for (const file of Object.values(outputs)) {
  fs.rmSync(path.join(root, file), { force: true });
}

walk(root);

const generatedAt = new Date().toISOString();

writeOutput(outputs.readme, "GO IRL NotebookLM Export", [
  `Generated at: ${generatedAt}`,
  "",
  "Upload these TXT files to NotebookLM individually. Do not upload ZIP archives.",
  "",
  "GitHub remains the source of truth. NotebookLM is an analysis assistant only.",
  "",
  "Recommended reading order:",
  "",
  `1. ${outputs.readme}`,
  `2. ${outputs.core}`,
  `3. ${outputs.bible}`,
  `4. ${outputs.market}`,
  `5. ${outputs.code}`,
  `6. ${outputs.supabase}`,
  `7. ${outputs.index}`,
  "",
  "Export groups:",
  "",
  `- Core docs: ${groups.core.length} files`,
  `- Bible / governance / onboarding: ${groups.bible.length} files`,
  `- Market / reports: ${groups.market.length} files`,
  `- Code / config / scripts: ${groups.code.length} files`,
  `- Supabase: ${groups.supabase.length} files`,
  "",
  "Safety exclusions:",
  "",
  "- .git",
  "- node_modules",
  "- dist/build output",
  "- .vercel",
  "- .env*",
  "- package-lock.json",
  "- pnpm-lock.yaml",
  "- binary files and archives",
]);

writeOutput(outputs.core, "GO IRL Core Documentation", groups.core);
writeOutput(outputs.bible, "GO IRL Bible, Governance, and AI Onboarding", groups.bible);
writeOutput(outputs.market, "GO IRL Market and Reports", groups.market);
writeOutput(outputs.code, "GO IRL Code and Config Snapshot", groups.code);
writeOutput(outputs.supabase, "GO IRL Supabase Snapshot", groups.supabase);

writeOutput(outputs.index, "GO IRL NotebookLM Source Index", [
  "| File | Group | Output |",
  "|---|---|---|",
  ...indexRows
    .sort((a, b) => a.file.localeCompare(b.file))
    .map((row) => `| ${row.file} | ${row.group} | ${row.output} |`),
]);

console.log("NotebookLM TXT export ready:");
for (const file of Object.values(outputs)) console.log(`- ${file}`);
console.log(`Files exported: ${indexRows.length}`);
