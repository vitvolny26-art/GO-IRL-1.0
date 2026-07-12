const os = require('node:os');
const path = require('node:path');

function defaultStateDirectory() {
  if (process.env.GO_IRL_ORCHESTRATOR_STATE_DIR) return path.resolve(process.env.GO_IRL_ORCHESTRATOR_STATE_DIR);
  if (process.platform === 'win32' && process.env.LOCALAPPDATA) {
    return path.join(process.env.LOCALAPPDATA, 'GO-IRL', 'ai-orchestrator');
  }
  if (process.env.XDG_STATE_HOME) return path.join(process.env.XDG_STATE_HOME, 'go-irl', 'ai-orchestrator');
  return path.join(os.homedir(), '.local', 'state', 'go-irl', 'ai-orchestrator');
}

module.exports = { defaultStateDirectory };
