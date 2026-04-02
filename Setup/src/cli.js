const chalk = require('chalk');
const { fetchTeams, fetchTeamConfig } = require('./fetch');
const { selectTeam, selectAgents } = require('./prompts');
const { collectSettings } = require('./settings');
const { installAgents } = require('./install');

async function main() {
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
  await installAgents(agents, settings);

  console.log(chalk.bold.green('\nSetup complete!'));
  console.log(`Agents are ready in ${chalk.cyan('.claude/agents/')}\n`);
}

main().catch(err => {
  console.error(chalk.red('\nError: ' + err.message));
  process.exit(1);
});
