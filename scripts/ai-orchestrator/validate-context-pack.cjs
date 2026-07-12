const path = require('node:path');
const { readJson, runContractCli, validateAgainstSchema } = require('./validate-mission.cjs');

const contextPackSchemaPath = path.join(__dirname, 'schemas', 'context-pack.schema.json');

function validateContextPack(contextPack) {
  return validateAgainstSchema(contextPack, readJson(contextPackSchemaPath));
}

function runCli(argv) {
  return runContractCli(argv, {
    argument: 'context-pack.json',
    command: 'validate-context-pack.cjs',
    validate: validateContextPack,
  });
}

if (require.main === module) {
  process.exitCode = runCli(process.argv.slice(2));
}

module.exports = { runCli, validateContextPack };
