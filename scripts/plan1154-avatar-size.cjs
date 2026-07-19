const fs = require('node:fs');

const replaceOnce = (path, pattern, replacement, label) => {
  const source = fs.readFileSync(path, 'utf8');
  const next = source.replace(pattern, replacement);
  if (next === source) throw new Error(`missing pattern: ${label} in ${path}`);
  fs.writeFileSync(path, next);
};

replaceOnce(
  'src/styles.css',
  /\.profile-hero \{ position: relative; display: grid