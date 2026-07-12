const path = require('node:path');
const { readJson, runContractCli, validateAgainstSchema } = require('./validate-mission.cjs');

const agentResultSchemaPath = path.join(__dirname, 'schemas', 'agent-result.schema.json');

function validateAgentResult(agentResult) {
  return validateAgainstSchema(agentResult, readJson(agentResultSchemaPath));
}

function runCli(argv) {
  return runContractCli(argv, {
    argument: 'agent-result.json',
    command: 'validate-agent-result.cjs',
    validate: validateAgentResult,
  });
}

if (require.main === module) {
  process.exitCode = runCli(process.argv.slice(2));
}

module.exports = { runCli, validateAgentResult };
