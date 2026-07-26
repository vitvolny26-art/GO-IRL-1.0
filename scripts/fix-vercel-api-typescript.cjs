const fs = require("node:fs");

function replace(path, from, to) {
  const source = fs.readFileSync(path, "utf8");

  if (!source.includes(from)) {
    console.error(`Не найден ожидаемый код в ${path}:\n${from}`);
    process.exit(1);
  }

  fs.writeFileSync(path, source.replace(from, to));
  console.log(`Исправлен: ${path}`);
}

replace(
  "api/_shared/telegram-share-card-svg.ts",
  'const current = lines.at(-1) || "";',
  'const current = lines.length > 0 ? lines[lines.length - 1] : "";',
);

replace(
  "api/_shared/telegram-share-card-svg.ts",
  'lines[lines.length - 1] = `${lines.at(-1) || ""}…`.slice(0, maxChars);',
  'const lastLine = lines.length > 0 ? lines[lines.length - 1] : "";\n      lines[lines.length - 1] = `${lastLine}…`.slice(0, maxChars);',
);

const eventCardPath = "api/_shared/telegram-event-card.ts";
let eventCard = fs.readFileSync(eventCardPath, "utf8");

if (eventCard.includes("const buttons = [")) {
  eventCard = eventCard.replace(
    "const buttons = [",
    "const buttons: Array<{ text: string; url: string }> = [",
  );
  fs.writeFileSync(eventCardPath, eventCard);
  console.log(`Исправлен: ${eventCardPath}`);
} else if (eventCard.includes("const buttons: Array<{ text: string; url: string }> = [")) {
  console.log(`Уже исправлен: ${eventCardPath}`);
} else {
  console.error(`Не найден const buttons в ${eventCardPath}`);
  process.exit(1);
}
