const inquirer = require('inquirer');
const chalk = require('chalk');

const SELECTABLE_CATEGORIES = ['architects', 'developers', 'testers', 'support'];

async function selectTeam(teams) {
  const { teamId } = await inquirer.prompt([{
    type: 'list',
    name: 'teamId',
    message: 'Select your team:',
    choices: teams.map(t => ({
      name: `${t.name}  ${chalk.gray(t.description)}`,
      value: t.id,
      short: t.name,
    })),
  }]);
  return teams.find(t => t.id === teamId);
}

async function selectAgents(teamConfig) {
  const coreAgents = teamConfig.core || [];

  if (coreAgents.length > 0) {
    console.log('\n' + chalk.bold('Core agents (always included):'));
    coreAgents.forEach(a => console.log(`  ${chalk.cyan(a.id)}`));
  }

  const choices = [];
  for (const category of SELECTABLE_CATEGORIES) {
    const agents = teamConfig[category];
    if (!agents || agents.length === 0) continue;

    choices.push(new inquirer.Separator(`\n  -- ${capitalize(category)} --`));
    agents.forEach(agent => {
      choices.push({
        name: agent.id,
        value: agent,
        checked: agent.default !== false,
      });
    });
  }

  if (choices.length === 0) {
    console.log(chalk.gray('\nNo optional agents for this team.'));
    return coreAgents;
  }

  const { selected } = await inquirer.prompt([{
    type: 'checkbox',
    name: 'selected',
    message: 'Select optional agents to include:',
    choices,
  }]);

  return [...coreAgents, ...selected];
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = { selectTeam, selectAgents };
