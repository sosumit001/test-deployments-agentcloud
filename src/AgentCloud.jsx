import React, { useState, useEffect } from "react";
// import { api } from "./api";
import { api } from "./api";
import AllDeploymentsTable from "./AllDeploymentsTable";
import DeploymentDetail from "./DeploymentDetail";
import {
  CloudArrowUpIcon,
  UserGroupIcon,
  Squares2X2Icon,
  KeyIcon,
  ChartBarIcon,
  // BoltIcon,
  CpuChipIcon,
  PlusIcon,
  ArrowPathIcon,
  TagIcon,
  CommandLineIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  PlayIcon,
  StopIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";

const Badge = ({ children, color = "gray" }) => {
  const colors = {
    gray: "bg-vsdk-card text-gray-400 border-vsdk-border",
    purple: "bg-vsdk-primary/10 text-vsdk-primary border-vsdk-primary/20",
    green: "bg-success/10 text-success border-success/20",
    blue: "bg-info/10 text-info border-info/20",
    danger: "bg-danger/10 text-danger border-danger/20",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-[10px] font-medium border ${colors[color]} flex items-center gap-1`}
    >
      {children}
    </span>
  );
};

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-vsdk-card border border-vsdk-border p-6 rounded-xl hover:border-vsdk-primary/30 transition-all duration-300 group relative overflow-hidden">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${color.replace("bg-", "text-")}`} />
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          Live
        </span>
      </div>
    </div>
    <h3 className="text-3xl font-bold text-white mb-1 tracking-tight">
      {value}
    </h3>
    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
      {title}
    </p>
  </div>
);

const SessionsTable = ({ sessions }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b border-vsdk-border bg-vsdk-bg/30 text-gray-500 text-[10px] uppercase tracking-widest font-bold">
          <th className="px-6 py-4">Session ID</th>
          <th className="px-6 py-4">Status</th>
          <th className="px-6 py-4">Duration</th>
          <th className="px-6 py-4">Started At</th>
          <th className="px-6 py-4">Meeting ID</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-vsdk-border">
        {sessions.map((session) => (
          <tr
            key={session.id}
            className="hover:bg-white/5 transition-colors group"
          >
            <td className="px-6 py-4 text-sm font-mono text-vsdk-primary">
              {session.id.slice(0, 8)}...
            </td>
            <td className="px-6 py-4">
              <Badge
                color={
                  session.status === "Active"
                    ? "green"
                    : session.status === "Failed"
                    ? "danger"
                    : "gray"
                }
              >
                {session.status}
              </Badge>
            </td>
            <td className="px-6 py-4 text-sm text-gray-300">
              {session.duration || "-"}
            </td>
            <td className="px-6 py-4 text-sm text-gray-400">
              {new Date(session.startedAt).toLocaleString()}
            </td>
            <td className="px-6 py-4 text-sm text-gray-500 font-mono">
              {session.meetingId || "-"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const MockChart = ({ height = 120, color = "#CDB6FF" }) => (
  <div style={{ height }} className="w-full flex items-end gap-1 px-2">
    {[
      40, 35, 45, 30, 55, 70, 40, 35, 45, 60, 85, 40, 30, 25, 35, 45, 50, 40,
      30, 20,
    ].map((h, i) => (
      <div
        key={i}
        style={{ height: `${h}%`, backgroundColor: color }}
        className="flex-1 rounded-t-sm opacity-20 hover:opacity-60 transition-opacity"
      />
    ))}
  </div>
);

export default function AgentCloud() {
  // Simple hash-based routing: #/deployments, #/sessions, #/logs, #/integrations, #/deployments/:id
  const getInitialView = () => {
    const hash = window.location.hash.replace("#/", "");
    if (hash.startsWith("deployments/")) return "deployments";
    return hash || "deployments";
  };

  const getInitialAgentId = () => {
    const hash = window.location.hash.replace("#/", "");
    if (hash.startsWith("deployments/")) return hash.split("/")[1];
    return null;
  };

  const [view, setViewInternal] = useState(getInitialView());
  const [selectedAgentId, setSelectedAgentId] = useState(getInitialAgentId());
  const [data, setData] = useState({
    agents: [],
    sessions: [],
    integrations: [],
    stats: {},
  });
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [globalConfigs, setGlobalConfigs] = useState([]);
  const [isAddingConfig, setIsAddingConfig] = useState(false);
  const [newConfig, setNewConfig] = useState({
    key: "",
    value: "",
    usage: "Global",
  });

  const setView = (newView) => {
    window.location.hash = `#/${newView}`;
  };

  const navigateToAgent = (agentId) => {
    window.location.hash = `#/deployments/${agentId}`;
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#/", "");
      if (hash.startsWith("deployments/")) {
        setViewInternal("deployments");
        setSelectedAgentId(hash.split("/")[1]);
      } else {
        setViewInternal(hash || "deployments");
        setSelectedAgentId(null);
        setSelectedAgent(null);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Fetch Agents & Stats (Needed for Deployments view and Sidebar stats)
  useEffect(() => {
    if (view === "deployments" || !data.stats.activeAgents) {
      setLoading(true);
      api.getAgents().then((agents) => {
        setData((prev) => ({
          ...prev,
          agents,
          stats: {
            ...prev.stats,
            activeAgents: agents.filter((a) => a.status === "Active").length,
          },
        }));
        setLoading(false);
      });
    }
  }, [view]);

  useEffect(() => {
    if (view === "configuration") {
      setLoading(true);
      api.getGlobalConfig().then((configs) => {
        setGlobalConfigs(configs);
        setLoading(false);
      });
    }
  }, [view]);

  const handleAddConfig = () => {
    if (!newConfig.key || !newConfig.value) return;
    api.addGlobalConfig(newConfig).then((added) => {
      setGlobalConfigs([...globalConfigs, added]);
      setIsAddingConfig(false);
      setNewConfig({ key: "", value: "", usage: "Global" });
    });
  };

  const handleDeleteConfig = (id) => {
    api.deleteGlobalConfig(id).then(() => {
      setGlobalConfigs(globalConfigs.filter((c) => c.id !== id));
    });
  };

  // Fetch Sessions (Only when on Sessions view)
  useEffect(() => {
    if (view === "sessions") {
      setLoading(true);
      api.getSessions().then((sessions) => {
        setData((prev) => ({
          ...prev,
          sessions,
          stats: {
            ...prev.stats,
            activeSessions: sessions.filter((s) => s.status === "Active")
              .length,
            totalSessions: sessions.length,
          },
        }));
        setLoading(false);
      });
    }
  }, [view]);

  // Fetch Integrations (Only when on Integrations view)
  useEffect(() => {
    if (view === "integrations") {
      setLoading(true);
      api.getIntegrations().then((integrations) => {
        setData((prev) => ({
          ...prev,
          integrations,
          stats: {
            ...prev.stats,
            integrations: integrations.length,
          },
        }));
        setLoading(false);
      });
    }
  }, [view]);

  // Fetch Single Agent Detail
  useEffect(() => {
    if (selectedAgentId) {
      setLoading(true);
      api.getAgents().then((agents) => {
        const agent = agents.find((a) => a.id === selectedAgentId);
        setSelectedAgent(agent);
        setLoading(false);
      });
    }
  }, [selectedAgentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vsdk-primary"></div>
      </div>
    );
  }

  if (selectedAgent) {
    return (
      <DeploymentDetail
        deployment={selectedAgent}
        onBack={() => setView("deployments")}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Navigation Tabs */}
      <div className="flex items-center gap-4 border-b border-vsdk-border pb-px">
        {[
          { id: "deployments", label: "Agents", icon: CloudArrowUpIcon },
          {
            id: "configuration",
            label: "Configuration",
            icon: AdjustmentsHorizontalIcon,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all relative ${
              view === tab.id
                ? "text-vsdk-primary"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {view === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-vsdk-primary shadow-[0_0_10px_#CDB6FF]" />
            )}
          </button>
        ))}
      </div>

      {/* View Content */}
      <div className="space-y-8">
        {view === "deployments" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-6">
              <AllDeploymentsTable
                reqState={{
                  isLoading: loading,
                  response: {
                    data: data.agents,
                    pageInfo: { total: data.agents.length },
                  },
                }}
                onRowClick={(row) => navigateToAgent(row.id)}
              />
            </div>
          </div>
        )}

        {view === "configuration" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Global Configuration
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Manage environment variables and secrets across all your
                  agents.
                </p>
              </div>
              {!isAddingConfig && (
                <button
                  onClick={() => setIsAddingConfig(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-vsdk-primary text-black hover:bg-vsdk-primary-hover rounded-lg transition-all text-sm font-bold shadow-[0_0_15px_rgba(205,182,255,0.2)]"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Variable
                </button>
              )}
            </div>

            <div className="bg-vsdk-card border border-vsdk-border rounded-2xl overflow-hidden shadow-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-vsdk-border bg-vsdk-bg/30">
                    <th className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      Key
                    </th>
                    <th className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      Default Value
                    </th>
                    <th className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      Usage
                    </th>
                    <th className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-vsdk-border">
                  {isAddingConfig && (
                    <tr className="bg-vsdk-primary/5 animate-in fade-in slide-in-from-top-2 duration-300">
                      <td className="px-8 py-4">
                        <input
                          autoFocus
                          placeholder="VARIABLE_NAME"
                          className="bg-vsdk-bg border border-vsdk-border rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-vsdk-primary w-full"
                          value={newConfig.key}
                          onChange={(e) =>
                            setNewConfig({
                              ...newConfig,
                              key: e.target.value.toUpperCase(),
                            })
                          }
                        />
                      </td>
                      <td className="px-8 py-4">
                        <input
                          placeholder="Value"
                          className="bg-vsdk-bg border border-vsdk-border rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-vsdk-primary w-full"
                          value={newConfig.value}
                          onChange={(e) =>
                            setNewConfig({
                              ...newConfig,
                              value: e.target.value,
                            })
                          }
                        />
                      </td>
                      <td className="px-8 py-4">
                        <Badge color="purple">Global</Badge>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setIsAddingConfig(false)}
                            className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-300 uppercase tracking-widest"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleAddConfig}
                            className="px-4 py-1.5 bg-vsdk-primary text-black rounded-lg text-xs font-bold hover:bg-vsdk-primary-hover transition-all uppercase tracking-widest"
                          >
                            Save
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                  {globalConfigs.map((config) => (
                    <tr
                      key={config.id}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-vsdk-bg rounded border border-vsdk-border">
                            <KeyIcon className="w-3 h-3 text-vsdk-primary" />
                          </div>
                          <span className="text-sm text-white font-mono font-medium">
                            {config.key}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm text-gray-400 font-mono">
                        {config.value}
                      </td>
                      <td className="px-8 py-5">
                        <Badge
                          color={config.usage === "Global" ? "purple" : "gray"}
                        >
                          {config.usage}
                        </Badge>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="text-xs font-bold text-vsdk-primary hover:text-vsdk-primary-hover uppercase tracking-widest">
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteConfig(config.id)}
                            className="text-xs font-bold text-danger hover:text-red-400 uppercase tracking-widest"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
