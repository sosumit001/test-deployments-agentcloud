const BASE_URL = "https://test-deployments-agentcloud-production.up.railway.app";

export const api = {
  getProjects: () => fetch(`${BASE_URL}/projects`).then((res) => res.json()),
  getAgents: () => fetch(`${BASE_URL}/agents`).then((res) => res.json()),
  getSessions: () => fetch(`${BASE_URL}/sessions`).then((res) => res.json()),
  getIntegrations: () =>
    fetch(`${BASE_URL}/integrations`).then((res) => res.json()),
  getSecrets: () => fetch(`${BASE_URL}/secrets`).then((res) => res.json()),
  getLogs: (sessionId) =>
    fetch(`${BASE_URL}/logs?sessionId=${sessionId}`).then((res) => res.json()),
  getUser: () => fetch(`${BASE_URL}/user`).then((res) => res.json()),
  getGlobalConfig: () =>
    fetch(`${BASE_URL}/globalConfig`).then((res) => res.json()),
  addGlobalConfig: (config) =>
    fetch(`${BASE_URL}/globalConfig`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    }).then((res) => res.json()),
  deleteGlobalConfig: (id) =>
    fetch(`${BASE_URL}/globalConfig/${id}`, { method: "DELETE" }).then((res) =>
      res.json()
    ),
  updateAgent: (id, data) =>
    fetch(`${BASE_URL}/agents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((res) => res.json()),
};
