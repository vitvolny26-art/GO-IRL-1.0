const { execFileSync } = require("node:child_process");
const { readFileSync, writeFileSync, unlinkSync } = require("node:fs");
const { join } = require("node:path");
const { gunzipSync } = require("node:zlib");

const root = process.cwd();
const payloadPath = join(root, "scripts/patch-glass-event-card.cjs.gz.b64");
const patchPath = join(root, "scripts/patch-glass-event-card.cjs");

const payload = readFileSync(payloadPath, "utf8").trim();
writeFileSync(patchPath, gunzipSync(Buffer.from(payload, "base64")));

try {
  execFileSync(process.execPath, [patchPath], { cwd: root, stdio: "inherit" });
} finally {
  unlinkSync(patchPath);
}
