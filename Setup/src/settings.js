const inquirer = require('inquirer');

async function collectSettings() {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'autonomyLevel',
      message: 'What level of autonomy do you want?',
      choices: [
        { name: 'Fully Autonomous  — agents act without asking', value: 'auto' },
        { name: 'Balanced          — agents ask on important decisions', value: 'balanced' },
        { name: 'Human in the Loop — agents ask before every action', value: 'hil' },
      ],
      default: 'balanced',
    },
  ]);

  return answers;
}

module.exports = { collectSettings };
