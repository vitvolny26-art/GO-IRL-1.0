const fs = require('node:fs');

const files = ['src/App.tsx', 'src/verticals/SportVertical.tsx'];

for (const file of files) {
  let source = fs.readFileSync(file, 'utf8');
  const marker = '<button onClick={() => openBugReport(activity, language)} type="button"><Bug size={18} />{t.report}</button>';
  if (!source.includes(marker)) {
    throw new Error(`Marker not found in ${file}`);
  }

  const membershipAction = `${marker}\n              {!isOrganizer && (joined || waiting || pending) &&