const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { fetchRaw } = require('./fetch');
const { processTemplate } = require('./template');

async function generateClaudeMd(teamConfig, selectedAgentIds, rosterContent, settings, roleMap = {}) {
  if (!teamConfig.claude_md) return;

  process.stdout.write(`  Generating CLAUDE.md...`);

  const raw = await fetchRaw(teamConfig.claude_md);
  const processed = processTemplate(raw, selectedAgentIds, rosterContent, settings, roleMap);
  fs.writeFileSync(path.join(process.cwd(), '.claude', 'CLAUDE.md'), processed, 'utf8');

  console.log(chalk.green(' done'));
}

module.exports = { generateClaudeMd };
