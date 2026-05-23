const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { fetchAgentFile } = require('./fetch');
const { buildRoleMap, processTemplate } = require('./template');
const { writeRoster } = require('./roster');
const { generateClaudeMd } = require('./claudemd');

const AGENTS_DIR = path.join(process.cwd(), '.claude', 'agents');

const ENV_HOOK_SCRIPT = `#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
CMD=$(echo "$INPUT" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(d.get('tool_input', {}).get('command', ''))
" 2>/dev/null || echo "")

if ! echo "$CMD" | grep -qE '(pytest|playwright)'; then
  exit 0
fi

ERRORS=()

if [ -z "\${TEST_BASE_URL:-}" ]; then
  ERRORS+=("TEST_BASE_URL is not set. Set it to your test/staging environment URL.")
else
  if echo "$TEST_BASE_URL" | grep -qiE '(//app\\.[^/]|//api\\.[^/]|\\.prod\\.|//prod\\.|production\\.)' && \\
     ! echo "$TEST_BASE_URL" | grep -qiE '(staging|test|dev|localhost|127\\.0\\.0\\.1)'; then
    ERRORS+=("TEST_BASE_URL looks like a production URL: $TEST_BASE_URL")
    ERRORS+=("Tests must never run against production.")
  fi
fi

if echo "$CMD" | grep -qE '(-m integration)'; then
  if [ -z "\${TEST_DATABASE_URL:-}" ]; then
    ERRORS+=("TEST_DATABASE_URL is not set. Integration tests require a test database.")
  fi
fi

if echo "$CMD" | grep -qE '(playwright|-m ui)'; then
  if [ -z "\${TEST_USER:-}" ]; then
    ERRORS+=("TEST_USER is not set. Playwright tests require a test user email.")
  fi
  if [ -z "\${TEST_PASSWORD:-}" ]; then
    ERRORS+=("TEST_PASSWORD is not set. Playwright tests require a test user password.")
  fi
fi

if [ \${#ERRORS[@]} -gt 0 ]; then
  echo "" >&2
  echo "⛔ TEST ENVIRONMENT NOT CONFIGURED — test run blocked." >&2
  echo "" >&2
  for err in "\${ERRORS[@]}"; do
    echo "  • $err" >&2
  done
  echo "" >&2
  echo "Set the required environment variables and retry." >&2
  exit 1
fi

exit 0
`;

async function installAgents(agents, teamConfig, settings = {}, llmTarget = 'claude') {
  if (!fs.existsSync(AGENTS_DIR)) {
    fs.mkdirSync(AGENTS_DIR, { recursive: true });
    console.log(chalk.gray(`\nCreated .claude/agents/`));
  } else {
    console.log('');
  }

  const selectedIds = agents.map(a => a.id);
  const roleMap     = buildRoleMap(agents);

  // Download all agent files — use agent.id as filename to avoid basename collisions
  // (e.g. research/orchestrator.md, plan/orchestrator.md, implement/orchestrator.md
  // all share the basename "orchestrator.md" and would overwrite each other)
  for (const agent of agents) {
    process.stdout.write(`  Downloading ${chalk.cyan(agent.id)}...`);
    const raw = await fetchAgentFile(agent.file);
    const filename = `${agent.id}.md`;
    fs.writeFileSync(path.join(AGENTS_DIR, filename), raw, 'utf8');
    console.log(chalk.green(' done'));
  }

  // Build roster (reads written files for frontmatter — before template processing
  // so frontmatter is still raw; roster only reads name/description, not model)
  process.stdout.write(`\n  Generating AGENT_ROSTER.md...`);
  const rosterContent = writeRoster(agents, AGENTS_DIR);
  console.log(chalk.green(' done'));

  // Process templates in all agent files
  process.stdout.write(`  Processing agent templates...`);
  for (const agent of agents) {
    const filename  = `${agent.id}.md`;
    const filePath  = path.join(AGENTS_DIR, filename);
    const raw       = fs.readFileSync(filePath, 'utf8');
    const model     = (agent.models ?? {})[llmTarget] ?? '';
    const variables = { model };
    const processed = processTemplate(raw, selectedIds, rosterContent, settings, roleMap, variables);
    fs.writeFileSync(filePath, processed, 'utf8');
  }
  console.log(chalk.green(' done'));

  // Download skill files — these are read as documents by agents at runtime,
  // not invoked as sub-agents. Install at their original relative paths so
  // all path references inside agent prompts resolve without modification.
  const skills = teamConfig.skills || [];
  if (skills.length > 0) {
    process.stdout.write(`  Downloading ${skills.length} skill file(s)...`);
    for (const skillPath of skills) {
      const raw      = await fetchAgentFile(skillPath);
      const destPath = path.join(process.cwd(), skillPath);
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.writeFileSync(destPath, raw, 'utf8');
    }
    console.log(chalk.green(' done'));
  }

  // Generate CLAUDE.md from team template
  await generateClaudeMd(teamConfig, selectedIds, rosterContent, settings, roleMap);

  // Scaffold .aiteam/ directory for session artifacts
  scaffoldAiteam();

  // Install environment safety hook if this team uses integration or UI tests
  const needsEnvHook = agents.some(a => ['integration-tester', 'ui-tester'].includes(a.role));
  if (needsEnvHook) {
    installEnvHook();
  }
}

function scaffoldAiteam() {
  const aiteamDir = path.join(process.cwd(), '.aiteam');
  if (!fs.existsSync(aiteamDir)) {
    fs.mkdirSync(aiteamDir, { recursive: true });
    // Keep the directory tracked in git
    fs.writeFileSync(path.join(aiteamDir, '.gitkeep'), '', 'utf8');
    console.log(chalk.gray('  Scaffolded .aiteam/ (session artifacts will go here)'));
  }
}

function installEnvHook() {
  const hooksDir = path.join(process.cwd(), '.claude', 'hooks');
  if (!fs.existsSync(hooksDir)) {
    fs.mkdirSync(hooksDir, { recursive: true });
  }

  const hookPath = path.join(hooksDir, 'check-test-env.sh');
  fs.writeFileSync(hookPath, ENV_HOOK_SCRIPT, 'utf8');
  fs.chmodSync(hookPath, '755');

  // Merge hook config into .claude/settings.json
  const settingsPath = path.join(process.cwd(), '.claude', 'settings.json');
  let settings = {};
  if (fs.existsSync(settingsPath)) {
    try { settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8')); } catch (_) {}
  }

  settings.hooks = settings.hooks || {};
  settings.hooks.PreToolUse = settings.hooks.PreToolUse || [];

  const hookEntry = { matcher: 'Bash', hooks: [{ type: 'command', command: '.claude/hooks/check-test-env.sh' }] };
  const alreadyInstalled = settings.hooks.PreToolUse.some(
    h => h.hooks?.some(hh => hh.command === hookEntry.hooks[0].command)
  );
  if (!alreadyInstalled) {
    settings.hooks.PreToolUse.push(hookEntry);
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n', 'utf8');
    console.log(chalk.gray('  Installed environment safety hook → .claude/hooks/check-test-env.sh'));
  }
}

module.exports = { installAgents };
