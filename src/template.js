/**
 * Processes agent markdown templates.
 *
 * Supported block tags:
 *   <%if agent "agent-id"%>            ... <%endif%>
 *   <%if not agent "agent-id"%>        ... <%endif%>
 *   <%if settings.key == value%>       ... <%endif%>
 *   <%if not settings.key == value%>   ... <%endif%>
 *
 * Supported inline tags:
 *   <%agent role%>   — resolves to the agent ID that carries that role
 *                      e.g. <%agent architect%> → "swift-app-architect"
 *   <%varname%>      — resolves any key from the variables map
 *                      e.g. <%model%> → "opus"
 *
 * Other:
 *   <%roster%>  — replaced with the full AGENT_ROSTER.md content
 */

const IF_AGENT    = /^<%if\s+(not\s+)?agent\s+"([^"]+)"%>\s*$/;
const IF_SETTING  = /^<%if\s+(not\s+)?settings\.(\w+)\s*==\s*(\w+)%>\s*$/;
const IF_CLOSE    = /^<%endif%>\s*$/;
const AGENT_ROLE  = /<%agent\s+([\w-]+)%>/g;
const ROSTER_TAG  = /<%roster%>/g;
const VARIABLE    = /<%(\w+)%>/g;

/**
 * Build a role → agent-id map from the selected agents list.
 */
function buildRoleMap(agents) {
  const map = {};
  for (const agent of agents) {
    if (agent.role) map[agent.role] = agent.id;
  }
  return map;
}

function processTemplate(content, selectedAgentIds, rosterContent, settings = {}, roleMap = {}, variables = {}) {
  const lines = content.split('\n');
  const output = [];
  let skip = false;

  for (const line of lines) {
    const trimmed = line.trim();

    const agentMatch   = trimmed.match(IF_AGENT);
    const settingMatch = trimmed.match(IF_SETTING);
    const closeMatch   = trimmed.match(IF_CLOSE);

    if (agentMatch) {
      const negate  = Boolean(agentMatch[1]);
      const agentId = agentMatch[2];
      const present = selectedAgentIds.includes(agentId);
      skip = negate ? present : !present;
      continue;
    }

    if (settingMatch) {
      const negate   = Boolean(settingMatch[1]);
      const key      = settingMatch[2];
      const expected = settingMatch[3];
      const matches  = String(settings[key] ?? '') === expected;
      skip = negate ? matches : !matches;
      continue;
    }

    if (closeMatch) {
      skip = false;
      continue;
    }

    if (!skip) {
      const resolved = line
        .replace(AGENT_ROLE, (_, role) => roleMap[role] ?? role)
        .replace(ROSTER_TAG, rosterContent)
        .replace(VARIABLE, (match, key) => {
          // Only substitute known variable keys — leave unknown tags untouched
          return key in variables ? variables[key] : match;
        });
      output.push(resolved);
    }
  }

  return output.join('\n');
}

module.exports = { buildRoleMap, processTemplate };
