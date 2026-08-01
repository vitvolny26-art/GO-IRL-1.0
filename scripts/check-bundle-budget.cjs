const { readdirSync, readFileSync, statSync } = require("node:fs");
const { join } = require("node:path");
const { gzipSync } = require("node:zlib");

const assetsDir = join(process.cwd(), "dist", "assets");
const maxRawBytes = 500 * 1024;
const maxGzipBytes = 100 * 1024;
const preferredEntryGzipBytes = 10 * 1024;

const files = readdirSync(assetsDir)
  .filter((file) => file.endsWith(".js"))
  .map((file) => {
    const path = join(assetsDir, file);
    const rawBytes = statSync(path).size;
    const gzipBytes = gzipSync(readFileSync(path)).length;
    return { file, rawBytes, gzipBytes };
  })
  .sort((a, b) => b.rawBytes - a.rawBytes);

if (files.length === 0) {
  console.error("Bundle budget check failed: no production JavaScript chunks found.");
  process.exit(1);
}

const violations = files.filter(
  ({ rawBytes, gzipBytes }) => rawBytes > maxRawBytes || gzipBytes > maxGzipBytes,
);

const entry = files.find(({ file }) => file.startsWith("index-"));
if (entry && entry.gzipBytes > preferredEntryGzipBytes) {
  console.warn(
    `Bundle budget warning: ${entry.file} is ${(entry.gzipBytes / 1024).toFixed(2)} KiB gzip; preferred entry target is 10 KiB.`,
  );
}

for (const { file, rawBytes, gzipBytes } of files) {
  console.log(
    `${file}: ${(rawBytes / 1024).toFixed(2)} KiB raw / ${(gzipBytes / 1024).toFixed(2)} KiB gzip`,
  );
}

if (violations.length > 0) {
  console.error("Bundle budget violations:");
  for (const { file, rawBytes, gzipBytes } of violations) {
    console.error(
      `- ${file}: ${(rawBytes / 1024).toFixed(2)} KiB raw / ${(gzipBytes / 1024).toFixed(2)} KiB gzip`,
    );
  }
  process.exit(1);
}

console.log(`Bundle budget PASS (${files.length} JavaScript chunks checked).`);
