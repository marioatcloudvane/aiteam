const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { fetchAgentFile } = require('./fetch');

const AGENTS_DIR = path.join(process.cwd(), '.claude', 'agents');

async function installAgents(agents) {
  if (!fs.existsSync(AGENTS_DIR)) {
    fs.mkdirSync(AGENTS_DIR, { recursive: true });
    console.log(chalk.gray(`\nCreated .claude/agents/`));
  } else {
    console.log('');
  }

  for (const agent of agents) {
    process.stdout.write(`  Downloading ${chalk.cyan(agent.id)}...`);
    const content = await fetchAgentFile(agent.file);
    const filename = path.basename(agent.file);
    fs.writeFileSync(path.join(AGENTS_DIR, filename), content, 'utf8');
    console.log(chalk.green(' done'));
  }
}

module.exports = { installAgents };
