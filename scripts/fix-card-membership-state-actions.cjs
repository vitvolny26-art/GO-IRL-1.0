const fs = require('node:fs');

const files = ['src/App.tsx', 'src/verticals/SportVertical.tsx'];

for (const file of files) {
  let source = fs.readFileSync(file, 'utf8');

  const actionLine = '  const action = t[eventActionTranslationKey(interaction.primaryAction, "card")];';
  if (!source.includes(actionLine)) throw new Error(`Missing action line in ${file}`);
  source