const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const { fetchTeams, fetchTeamConfig } = require('./fetch');
const { selectTeam, selectAgents, SELECTABLE_CATEGORIES } = require('./prompts');
const { collectSettings } = require('./settings');
const { installAgents } = require('./install');

const LOCK_FILE = path.join(process.cwd(), '.claude', 'aiteam-lock.json');

async function main(llmTarget) {
  console.log(chalk.bold('\nAITeam Setup\n'));
  console.log('Fetching available teams...');

  const teams = await fetchTeams();
  const selectedTeam = await selectTeam(teams);

  console.log(`\nLoading ${chalk.bold(selectedTeam.name)} configuration...`);
  const teamConfig = await fetchTeamConfig(selectedTeam.file);

  const agents = await selectAgents(teamConfig);

  if (agents.length === 0) {
    console.log(chalk.yellow('\nNo agents selected. Nothing to install.'));
    process.exit(0);
  }

  console.log('');
  const settings = await collectSettings();

  console.log(`\nInstalling ${agents.length} agent(s)...`);
  await installAgents(agents, teamConfig, settings, llmTarget, selectedTeam.file);

  console.log(chalk.bold.green('\nSetup complete!'));
  console.log(`Agents are ready in ${chalk.cyan('.claude/agents/')}\n`);
}

async function update(llmTarget) {
  console.log(chalk.bold('\nAITeam Update\n'));

  // Read lock
  if (!fs.existsSync(LOCK_FILE)) {
    console.error(chalk.red('No lock file found. Run `aiteam init claude` first.'));
    process.exit(1);
  }

  let lock;
  try {
    lock = JSON.parse(fs.readFileSync(LOCK_FILE, 'utf8'));
  } catch (e) {
    console.error(chalk.red('Could not read lock file: ' + e.message));
    process.exit(1);
  }

  // Warn about overwrites
  console.log(chalk.yellow('⚠  All installed agent files, skills, and CLAUDE.md will be overwritten.'));
  console.log(chalk.yellow('   Any local edits to these files will be lost.\n'));

  const { confirmed } = await inquirer.prompt([{
    type: 'confirm',
    name: 'confirmed',
    message: 'Continue with update?',
    default: false,
  }]);

  if (!confirmed) {
    console.log(chalk.gray('\nUpdate cancelled.'));
    process.exit(0);
  }

  // Fetch fresh team config
  console.log(`\nLoading ${chalk.bold(lock.team)} configuration...`);
  const teamConfig = await fetchTeamConfig(lock.team);

  // Reconstruct agent list: core + orchestrators always, optional only if previously selected
  const installedIds = new Set(lock.installedAgentIds || []);

  const agents = [
    ...(teamConfig.core || []),
    ...(teamConfig.orchestrators || []),
  ];

  const newAgents = [];
  for (const category of SELECTABLE_CATEGORIES) {
    for (const agent of (teamConfig[category] || [])) {
      if (installedIds.has(agent.id)) {
        agents.push(agent);
      } else {
        newAgents.push({ agent, category });
      }
    }
  }

  // Warn about agents in lock that no longer exist in the YAML
  const allYamlIds = new Set([
    ...(teamConfig.core || []),
    ...(teamConfig.orchestrators || []),
    ...SELECTABLE_CATEGORIES.flatMap(c => teamConfig[c] || []),
  ].map(a => a.id));

  const orphaned = (lock.installedAgentIds || []).filter(id => !allYamlIds.has(id));
  if (orphaned.length > 0) {
    console.log(chalk.yellow('\n⚠  The following agents no longer exist in the team config:'));
    orphaned.forEach(id => console.log(`  ${chalk.cyan(id)}`));
    console.log(chalk.gray('  Their files in .claude/agents/ were not removed — delete manually if no longer needed.\n'));
  }

  // Run install (non-interactive, same pipeline as init)
  const effectiveLlmTarget = lock.llmTarget || llmTarget;
  const effectiveSettings  = lock.settings  || {};

  console.log(`\nUpdating ${agents.length} agent(s)...`);
  await installAgents(agents, teamConfig, effectiveSettings, effectiveLlmTarget, lock.team);

  // Report new optional agents available since last install
  if (newAgents.length > 0) {
    console.log(chalk.bold.yellow('\nNew agents available since last install:'));
    for (const { agent } of newAgents) {
      const flag = agent.default !== false ? chalk.gray('(default: on)') : chalk.gray('(default: off)');
      console.log(`  ${chalk.cyan(agent.id)}  ${flag}`);
    }
    console.log(chalk.gray('\nRun `aiteam init claude` to add them to your installation.'));
  }

  console.log(chalk.bold.green('\nUpdate complete!'));
}

module.exports = { main, update };
