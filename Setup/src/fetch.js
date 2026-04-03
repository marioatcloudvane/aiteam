const yaml = require('js-yaml');

const REPO_BASE = 'https://raw.githubusercontent.com/marioatcloudvane/aiteam/main';

async function fetchRaw(path) {
  const url = `${REPO_BASE}/${path}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${path} (HTTP ${response.status})`);
  }
  return response.text();
}

async function fetchYaml(path) {
  const text = await fetchRaw(path);
  return yaml.load(text);
}

async function fetchTeams() {
  const data = await fetchYaml('Teams/teams.yaml');
  return data.teams;
}

async function fetchTeamConfig(filePath) {
  return fetchYaml(filePath);
}

async function fetchAgentFile(filePath) {
  return fetchRaw(filePath);
}

module.exports = { fetchRaw, fetchTeams, fetchTeamConfig, fetchAgentFile };
