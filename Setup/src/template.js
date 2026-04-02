/**
 * Processes agent markdown templates.
 *
 * Supported tags (block-level only):
 *   <%if agent "agent-id"%>            ... <%endif%>
 *   <%if not agent "agent-id"%>        ... <%endif%>
 *   <%if settings.key == value%>       ... <%endif%>
 *   <%if not settings.key == value%>   ... <%endif%>
 *   <%roster%>  — replaced with the full AGENT_ROSTER.md content
 */

const IF_AGENT    = /^<%if\s+(not\s+)?agent\s+"([^"]+)"%>\s*$/;
const IF_SETTING  = /^<%if\s+(not\s+)?settings\.(\w+)\s*==\s*(\w+)%>\s*$/;
const IF_CLOSE    = /^<%endif%>\s*$/;
const ROSTER_TAG  = /<%roster%>/g;

function processTemplate(content, selectedAgentIds, rosterContent, settings = {}) {
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
      output.push(line);
    }
  }

  return output
    .join('\n')
    .replace(ROSTER_TAG, rosterContent);
}

module.exports = { processTemplate };
