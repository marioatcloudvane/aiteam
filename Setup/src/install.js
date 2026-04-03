const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { fetchAgentFile } = require('./fetch');
const { processTemplate } = require('./template');
const { writeRoster } = require('./roster');
const { generateClaudeMd } = require('./claudemd');

const AGENTS_DIR = path.join(process.cwd(), '.claude', 'agents');

async function installAgents(agents, teamConfig, settings = {}) {
  if (!fs.existsSync(AGENTS_DIR)) {
    fs.mkdirSync(AGENTS_DIR, { recursive: true });
    console.log(chalk.gray(`\nCreated .claude/agents/`));
  } else {
    console.log('');
  }

  const selectedIds = agents.map(a => a.id);

  // Download all agent files first
  for (const agent of agents) {
    process.stdout.write(`  Downloading ${chalk.cyan(agent.id)}...`);
    const raw = await fetchAgentFile(agent.file);
    const filename = path.basename(agent.file);
    fs.writeFileSync(path.join(AGENTS_DIR, filename), raw, 'utf8');
    console.log(chalk.green(' done'));
  }

  // Build roster (reads written files for frontmatter)
  process.stdout.write(`\n  Generating AGENT_ROSTER.md...`);
  const rosterContent = writeRoster(agents, AGENTS_DIR);
  console.log(chalk.green(' done'));

  // Process templates in all agent files
  process.stdout.write(`  Processing agent templates...`);
  for (const agent of agents) {
    const filename = path.basename(agent.file);
    const filePath = path.join(AGENTS_DIR, filename);
    const raw = fs.readFileSync(filePath, 'utf8');
    const processed = processTemplate(raw, selectedIds, rosterContent, settings);
    fs.writeFileSync(filePath, processed, 'utf8');
  }
  console.log(chalk.green(' done'));

  // Generate CLAUDE.md from team template
  await generateClaudeMd(teamConfig, selectedIds, rosterContent, settings);
}

module.exports = { installAgents };
