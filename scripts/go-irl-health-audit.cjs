const fs = require("fs");
const path = require("path");
const cp = require("child_process");

const root = process.cwd();
const outDir = path.join(root, "project-audit");
fs.mkdirSync(outDir, { recursive: true });

const run = (cmd) => {
  try {
    return { ok: true, out: cp.execSync(cmd, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }) };
  } catch (e) {
    return { ok: false, out: String((e.stdout || "") + (e.stderr || "") || e.message) };
  }
};

const scanFiles = (dir, acc = []) => {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".git", "dist", "project-audit"].includes(item.name)) continue;
    const full = path.join(dir, item.name);
    if (item.isDirectory()) scanFiles(full, acc);
    else if (/\\.(ts|tsx|js|jsx|json|md|sql|css|html)$/.test(item.name)) acc.push(full);
  }
  return acc;
};

const files = scanFiles(root);
const content = files.map((file) => fs.readFileSync(file, "utf8")).join("\n");

const checks = {
  lint: run("pnpm run lint"),
  build: run("pnpm run build"),
  test: run("pnpm run test"),
};

const indicators = {
  coach: /CoachRequestPanel|coach_requests|coach_profiles/.test(content),
  chat: /ActivityChatPanel|activity_chat/.test(content),
  weather: /Open-Meteo|open-meteo|weather/i.test(content),
  mockMode: /visualDemo|MockAuth|demo-user|Vit_Test/.test(content),
  share: /t\\.me|ShareTemplateService|navigator\\.share/.test(content),
  profile: /profiles|profileAvatar|avatar/.test(content),
  registry: /ActivityRendererRegistry|RendererRegistry/.test(content),
};

const report = "# GO IRL Health Audit\n\n" +
  "Generated: " + new Date().toISOString() + "\n\n" +
  "## Checks\n\n" +
  "| Check | Result |\n|---|---|\n" +
  "| lint | " + (checks.lint.ok ? "PASS" : "FAIL") + " |\n" +
  "| build | " + (checks.build.ok ? "PASS" : "FAIL") + " |\n" +
  "| test | " + (checks.test.ok ? "PASS" : "FAIL") + " |\n\n" +
  "## Feature indicators\n\n" +
  Object.entries(indicators).map(([k, v]) => "- " + k + ": " + (v ? "detected" : "missing")).join("\n") +
  "\n\n## Git\n\n```\n" + (run("git status --short").out || "clean") + "\n```\n\n" +
  "## Recent commits\n\n```\n" + run("git log --oneline -10").out + "\n```\n\n" +
  "## Failed outputs\n\n" +
  (Object.entries(checks).filter(([, v]) => !v.ok).map(([k, v]) => "### " + k + "\n\n```\n" + v.out.slice(-8000) + "\n```").join("\n\n") || "No failed checks.");

fs.writeFileSync(path.join(outDir, "GO_IRL_HEALTH_AUDIT.md"), report, "utf8");
console.log("Health audit written:", path.join(outDir, "GO_IRL_HEALTH_AUDIT.md"));

/* eslint-enable */
