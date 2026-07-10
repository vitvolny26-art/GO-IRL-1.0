const fs = require("fs");
const path = require("path");

const root = process.cwd();

const outputs = {
  docs: "GO_IRL_NOTEBOOKLM_01_DOCS.txt",
  code: "GO_IRL_NOTEBOOKLM_02_CODE.txt",
  supabase: "GO_IRL_NOTEBOOKLM_03_SUPABASE.txt",
  index: "GO_IRL_NOTEBOOKLM_04_INDEX.txt",
};

const blockedDirs = new Set([".git", "node_modules", "dist", "build", ".vercel", "GO IRL DOC", "GO IRL DOC FULL"]);
const blockedFiles = new Set(["package-lock.json", "pnpm-lock.yaml"]);

const isBlocked = (name) => name.startsWith(".env") || name.endsWith(".local") || blockedFiles.has(name);

const groups = {
  docs: [],
  code: [],
  supabase: [],
  index: [],
};

function add(group, file) {
  const rel = path.relative(root, file);
  const content = fs.readFileSync(file, "utf8");
  groups[group].push(`\n\n===== FILE: ${rel} =====\n\n${content}`);
  groups.index.push(`- ${rel} -> ${outputs[group]}`);
}

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (!blockedDirs.has(e.name)) walk(path.join(dir, e.name));
      continue;
    }

    if (!e.isFile() || isBlocked(e.name)) continue;

    const file = path.join(dir, e.name);
    const rel = path.relative(root, file);
    const ext = path.extname(e.name);

    if ([".png", ".jpg", ".jpeg", ".webp", ".gif", ".ico", ".svg", ".zip"].includes(ext)) continue;

    if (rel.startsWith("docs/") || [".md", ".txt"].includes(ext)) add("docs", file);
    else if (rel.startsWith("src/")) add("code", file);
    else if (rel.startsWith("supabase/")) add("supabase", file);
    else if ([".json", ".ts", ".js", ".cjs", ".yml", ".yaml", ".toml", ".css", ".sql"].includes(ext)) add("code", file);
  }
}

walk(root);

fs.writeFileSync(outputs.docs, groups.docs.join("\n"));
fs.writeFileSync(outputs.code, groups.code.join("\n"));
fs.writeFileSync(outputs.supabase, groups.supabase.join("\n"));
fs.writeFileSync(outputs.index, ["# GO IRL NotebookLM Index", "", ...groups.index.sort()].join("\n"));

console.log("NotebookLM TXT export ready:");
for (const file of Object.values(outputs)) console.log(file);
