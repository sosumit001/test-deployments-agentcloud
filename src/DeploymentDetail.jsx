import React, { useState, useEffect } from "react";
import {
    ChevronLeftIcon,
    TrashIcon,
    PlusIcon,
    PencilSquareIcon,
    EyeIcon,
    EyeSlashIcon,
    CloudArrowUpIcon,
    CpuChipIcon,
    TagIcon,
    GlobeAltIcon,
    ArrowPathIcon,
    CommandLineIcon,
    ClockIcon,
    KeyIcon,
    ChartBarIcon,
    BoltIcon,
    AdjustmentsHorizontalIcon,
    Squares2X2Icon,
    PlayIcon,
    StopIcon,
    UserGroupIcon,
    ArrowsRightLeftIcon,
    CheckCircleIcon,
    XMarkIcon
} from "@heroicons/react/24/outline";
import { FormatDate } from "./AllDeploymentsTable";
import secretsData from "./secrets.json";
import { api } from "./api";

const BRANCH_COLORS = [
    '#3B82F6', // Blue (info)
    '#10B981', // Emerald (success)
    '#F59E0B', // Amber (warning)
    '#EF4444', // Red (danger)
    '#8B5CF6', // Violet
    '#EC4899', // Pink
    '#F97316', // Orange
    '#14B8A6', // Teal
];

const Badge = ({ children, color = "gray" }) => {
    const colors = {
        gray: "bg-vsdk-card text-gray-400 border-vsdk-border",
        purple: "bg-vsdk-primary/10 text-vsdk-primary border-vsdk-primary/20",
        green: "bg-success/10 text-success border-success/20",
        blue: "bg-info/10 text-info border-info/20",
        danger: "bg-danger/10 text-danger border-danger/20",
    };
    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${colors[color]} flex items-center gap-1`}>
            {children}
        </span>
    );
};

export default function DeploymentDetail({ deployment, onBack }) {
    const [activeTab, setActiveTab] = useState('overview'); // overview, sessions, versions, configuration
    const [secrets, setSecrets] = useState(secretsData.data);
    const [logs, setLogs] = useState([]);
    const [showValue, setShowValue] = useState({});
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [localAgent, setLocalAgent] = useState(deployment);
    const [isCreatingBranch, setIsCreatingBranch] = useState(false);
    const [branchForm, setBranchForm] = useState({ name: '', image: '', version: '', resourceProfile: 'cpu-small', replicas: { min: 1, max: 5 } });

    useEffect(() => {
        setLocalAgent(deployment);
    }, [deployment]);

    const updateAgentOnServer = (updatedData) => {
        api.updateAgent(localAgent.id, updatedData)
            .then(res => {
                setLocalAgent(res);
            })
            .catch(err => {
                console.error("Failed to update agent:", err);
                alert("Failed to update agent. Please check if the API server is running on port 3005.");
            });
    };

    const handleCreateBranch = () => {
        const newBranch = {
            id: `br_${Date.now()}`,
            ...branchForm,
            status: 'Healthy',
            health: 'Healthy',
            trafficWeight: 0,
            activeSessions: 0,
            createdAt: new Date().toISOString()
        };
        const updatedBranches = [...(localAgent.branches || []), newBranch];
        updateAgentOnServer({ branches: updatedBranches });
        setIsCreatingBranch(false);
    };

    const handleSetTraffic = (branchId, weight) => {
        const newWeight = parseInt(weight);
        const branches = localAgent.branches || [];
        const otherBranches = branches.filter(b => b.id !== branchId);
        const otherWeightSum = otherBranches.reduce((acc, b) => acc + b.trafficWeight, 0);

        let updatedBranches;
        if (newWeight + otherWeightSum > 100) {
            // If the new weight plus other branches exceeds 100%, 
            // we need to reduce other branches proportionally.
            const availableForOthers = 100 - newWeight;
            updatedBranches = branches.map(b => {
                if (b.id === branchId) return { ...b, trafficWeight: newWeight };
                if (otherWeightSum === 0) return { ...b, trafficWeight: 0 };

                // Proportional reduction of other branches
                const newOtherWeight = Math.floor((b.trafficWeight / otherWeightSum) * availableForOthers);
                return { ...b, trafficWeight: newOtherWeight };
            });
        } else {
            // Otherwise, just update the target branch. 
            // The "Primary" deployment will naturally take the remainder.
            updatedBranches = branches.map(b =>
                b.id === branchId ? { ...b, trafficWeight: newWeight } : b
            );
        }

        updateAgentOnServer({ branches: updatedBranches });
    };

    const handleMergeBranch = (branchId) => {
        const branch = localAgent.branches.find(b => b.id === branchId);
        if (!branch) return;

        const newVersion = {
            tag: branch.version,
            image: branch.image,
            resourceProfile: branch.resourceProfile,
            replicas: branch.replicas.min,
            createdAt: new Date().toISOString()
        };

        const updatedData = {
            currentTag: branch.version,
            image: branch.image,
            resourceProfile: branch.resourceProfile,
            replicas: branch.replicas,
            versions: [newVersion, ...(localAgent.versions || [])],
            branches: localAgent.branches.filter(b => b.id !== branchId),
            lastUpdated: new Date().toISOString()
        };
        updateAgentOnServer(updatedData);
    };

    const handleAbortBranch = (branchId) => {
        const updatedBranches = localAgent.branches.filter(b => b.id !== branchId);
        updateAgentOnServer({ branches: updatedBranches });
    };

    useEffect(() => {
        if (activeTab === 'logs') {
            setLoadingLogs(true);
            // Fetch logs for the first session of this agent as a mock
            api.getSessions().then(sessions => {
                const agentSession = sessions.find(s => s.agentId === deployment.id);
                if (agentSession) {
                    api.getLogs(agentSession.id).then(logData => {
                        if (logData && logData.length > 0) {
                            setLogs(logData[0].lines);
                        }
                        setLoadingLogs(false);
                    });
                } else {
                    setLoadingLogs(false);
                }
            });
        }
    }, [activeTab, deployment.id]);

    const toggleValue = (id) => {
        setShowValue(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Breadcrumbs */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 bg-vsdk-card border border-vsdk-border hover:border-gray-700 rounded-lg transition-all text-gray-400 hover:text-white"
                    >
                        <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">
                            <CloudArrowUpIcon className="w-3 h-3" />
                            <span>Agent Cloud</span>
                            <span>/</span>
                            <span className="text-gray-400">{deployment.name}</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                            {localAgent.name}
                            <div className="flex gap-2">
                                <Badge color={localAgent.health === 'Unhealthy' ? 'danger' : 'green'}>
                                    {localAgent.health || 'Healthy'}
                                </Badge>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-vsdk-primary/10 border border-vsdk-primary/20 rounded text-[10px] font-bold text-vsdk-primary uppercase tracking-widest">
                                    {localAgent.currentTag}
                                </div>
                            </div>
                        </h1>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-vsdk-primary text-black hover:bg-vsdk-primary-hover rounded-lg transition-all text-sm font-bold shadow-[0_0_15px_rgba(205,182,255,0.2)]">
                        <ArrowPathIcon className="w-4 h-4" />
                        Deploy Update
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-vsdk-card border border-vsdk-border hover:border-danger hover:text-danger rounded-lg transition-all text-sm font-bold text-gray-400">
                        <StopIcon className="w-4 h-4" />
                        Stop Agent
                    </button>
                </div>
            </div>



            {/* Tabs Navigation */}
            <div className="flex items-center gap-8 border-b border-vsdk-border">
                {[
                    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
                    { id: 'branch', label: 'Branch', icon: ArrowsRightLeftIcon },
                    { id: 'logs', label: 'Logs', icon: CommandLineIcon },
                    { id: 'versions', label: 'Versions', icon: ClockIcon },
                    { id: 'configuration', label: 'Configuration', icon: AdjustmentsHorizontalIcon },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-2 py-4 text-sm font-bold transition-all relative ${activeTab === tab.id ? 'text-vsdk-primary' : 'text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-vsdk-primary shadow-[0_0_10px_#CDB6FF]" />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Current Deployment Card */}
                        <div className="bg-vsdk-card border border-vsdk-border rounded-2xl p-6 shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-white tracking-tight flex items-center gap-2">
                                    <CloudArrowUpIcon className="w-4 h-4 text-vsdk-primary" />
                                    Current Deployment
                                </h3>
                                <Badge color="purple">{localAgent.currentTag}</Badge>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Docker Image</p>
                                    <p className="text-sm text-white font-mono truncate">{localAgent.image}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Resource Profile</p>
                                    <p className="text-sm text-white font-bold uppercase">{localAgent.resourceProfile}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Replicas</p>
                                    <p className="text-sm text-white font-bold">{localAgent.replicas?.current} / {localAgent.replicas?.max} Running</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Last Updated</p>
                                    <p className="text-sm text-white font-bold">{FormatDate(localAgent.lastUpdated)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Live Metrics Grid */}
                        <div className="grid grid-cols-1 gap-8">
                            <div className="bg-vsdk-card border border-vsdk-border rounded-2xl p-6 shadow-2xl">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-white tracking-tight flex items-center gap-2">
                                        <CpuChipIcon className="w-4 h-4 text-info" />
                                        Resource Usage
                                    </h3>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Real-time</span>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between text-xs mb-2">
                                            <span className="text-gray-400 font-medium uppercase tracking-wider">CPU Usage</span>
                                            <span className="text-white font-bold">24%</span>
                                        </div>
                                        <div className="w-full bg-vsdk-bg h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-info h-full w-[24%]" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs mb-2">
                                            <span className="text-gray-400 font-medium uppercase tracking-wider">Memory Usage</span>
                                            <span className="text-white font-bold">42%</span>
                                        </div>
                                        <div className="w-full bg-vsdk-bg h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-vsdk-primary h-full w-[42%]" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Current Deployment Summary */}
                        <div className="bg-vsdk-card border border-vsdk-border rounded-2xl overflow-hidden shadow-2xl">
                            <div className="p-6 border-b border-vsdk-border bg-vsdk-bg/20">
                                <h3 className="font-bold text-white tracking-tight">Current Deployment</h3>
                            </div>
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Image & Tag</p>
                                    <p className="text-sm text-white font-mono">{deployment.image}</p>
                                    <p className="text-xs text-vsdk-primary font-bold mt-1">{deployment.currentTag}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Resource Profile</p>
                                    <div className="flex items-center gap-2">
                                        <CpuChipIcon className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-white font-medium">{deployment.resourceProfile}</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Scaling Config</p>
                                    <p className="text-sm text-white font-medium">{deployment.replicas?.min} - {deployment.replicas?.max} Replicas</p>
                                    <p className="text-xs text-gray-500 mt-1">{deployment.replicas?.current} currently running</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Last Deployment</p>
                                    <p className="text-sm text-white font-medium">{FormatDate(deployment.lastUpdated)}</p>
                                    <Badge color="green">Success</Badge>
                                </div>
                            </div>
                        </div>

                        {/* Recent Events */}
                        <div className="bg-vsdk-card border border-vsdk-border rounded-2xl overflow-hidden shadow-2xl">
                            <div className="p-6 border-b border-vsdk-border bg-vsdk-bg/20">
                                <h3 className="font-bold text-white tracking-tight">Recent Events</h3>
                            </div>
                            <div className="divide-y divide-vsdk-border">
                                {[
                                    { event: 'Deployment Succeeded', detail: 'v2.0 successfully rolled out to all replicas', time: '2 hours ago', type: 'success' },
                                    { event: 'Scaling Event', detail: 'Scaled up to 3 replicas due to high traffic', time: '4 hours ago', type: 'info' },
                                    { event: 'Health Check Failed', detail: 'Replica agent-xyz-1 reported unhealthy', time: '6 hours ago', type: 'warning' },
                                ].map((ev, i) => (
                                    <div key={i} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-2 h-2 rounded-full ${ev.type === 'success' ? 'bg-success' : ev.type === 'warning' ? 'bg-warning' : 'bg-info'}`} />
                                            <div>
                                                <p className="text-sm font-bold text-white">{ev.event}</p>
                                                <p className="text-xs text-gray-500">{ev.detail}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-500 font-medium">{ev.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'branch' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Traffic Overview */}
                        <div className="bg-vsdk-card border border-vsdk-border rounded-2xl p-8 shadow-2xl">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-xl font-bold text-white tracking-tight">Traffic Splitting</h2>
                                    <p className="text-sm text-gray-500 mt-1">Manage how new sessions are routed between Primary and Branches.</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setIsCreatingBranch(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-vsdk-primary text-black hover:bg-vsdk-primary-hover rounded-lg transition-all text-sm font-bold shadow-[0_0_15px_rgba(205,182,255,0.2)]"
                                    >
                                        <PlusIcon className="w-4 h-4" />
                                        Create Branch
                                    </button>
                                </div>
                            </div>

                            {/* Traffic Visualization */}
                            <div className="space-y-6">
                                <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden flex">
                                    <div
                                        className="h-full bg-vsdk-primary transition-all duration-500 relative group"
                                        style={{ width: `${100 - (localAgent.branches?.reduce((acc, b) => acc + b.trafficWeight, 0) || 0)}%` }}
                                    >
                                        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-black opacity-0 group-hover:opacity-100 transition-opacity">
                                            Primary ({100 - (localAgent.branches?.reduce((acc, b) => acc + b.trafficWeight, 0) || 0)}%)
                                        </div>
                                    </div>
                                    {localAgent.branches?.map((branch, idx) => (
                                        <div
                                            key={idx}
                                            className="h-full transition-all duration-500 relative group border-l border-black/20"
                                            style={{
                                                width: `${branch.trafficWeight}%`,
                                                backgroundColor: BRANCH_COLORS[idx % BRANCH_COLORS.length]
                                            }}
                                        >
                                            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-black opacity-0 group-hover:opacity-100 transition-opacity">
                                                {branch.name} ({branch.trafficWeight}%)
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center px-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-vsdk-primary rounded-sm" />
                                        <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Primary ({localAgent.currentTag})</span>
                                        <span className="text-xs font-bold text-white">{100 - (localAgent.branches?.reduce((acc, b) => acc + b.trafficWeight, 0) || 0)}%</span>
                                    </div>
                                    <div className="flex gap-6 flex-wrap justify-end">
                                        {localAgent.branches?.map((branch, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-sm"
                                                    style={{ backgroundColor: BRANCH_COLORS[idx % BRANCH_COLORS.length] }}
                                                />
                                                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">{branch.name} ({branch.version})</span>
                                                <span className="text-xs font-bold text-white">{branch.trafficWeight}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Create Branch Form */}
                        {isCreatingBranch && (
                            <div className="bg-vsdk-card border border-vsdk-border rounded-2xl p-8 shadow-2xl animate-in slide-in-from-top-4 duration-300">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-white">Create New Branch</h3>
                                    <button onClick={() => setIsCreatingBranch(false)} className="text-gray-500 hover:text-white">
                                        <XMarkIcon className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Branch Name</label>
                                        <input
                                            placeholder="e.g. canary"
                                            className="w-full bg-vsdk-bg border border-vsdk-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-vsdk-primary"
                                            value={branchForm.name}
                                            onChange={e => setBranchForm({ ...branchForm, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Version Tag</label>
                                        <input
                                            placeholder="e.g. v2.1"
                                            className="w-full bg-vsdk-bg border border-vsdk-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-vsdk-primary"
                                            value={branchForm.version}
                                            onChange={e => setBranchForm({ ...branchForm, version: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Docker Image</label>
                                        <input
                                            placeholder="sumitso/my-agent:v2.1"
                                            className="w-full bg-vsdk-bg border border-vsdk-border rounded-lg px-4 py-2 text-sm text-white font-mono focus:outline-none focus:border-vsdk-primary"
                                            value={branchForm.image}
                                            onChange={e => setBranchForm({ ...branchForm, image: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 mt-8">
                                    <button
                                        onClick={() => setIsCreatingBranch(false)}
                                        className="px-6 py-2 text-sm font-bold text-gray-400 hover:text-white uppercase tracking-widest"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleCreateBranch}
                                        className="px-6 py-2 bg-vsdk-primary text-black rounded-lg text-sm font-bold hover:bg-vsdk-primary-hover transition-all uppercase tracking-widest"
                                    >
                                        Create Branch
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Branches Table */}
                        <div className="bg-vsdk-card border border-vsdk-border rounded-2xl overflow-hidden shadow-2xl">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-vsdk-border bg-vsdk-bg/30">
                                        <th className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Branch Name</th>
                                        <th className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Version</th>
                                        <th className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Traffic</th>
                                        <th className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Sessions</th>
                                        <th className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-vsdk-border">
                                    {localAgent.branches?.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-8 py-12 text-center text-gray-500 text-sm italic">
                                                No active branches. Create one to start canary rollouts or A/B experiments.
                                            </td>
                                        </tr>
                                    ) : (
                                        localAgent.branches?.map((branch, idx) => (
                                            <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-1.5 bg-vsdk-bg rounded border border-vsdk-border">
                                                            <ArrowsRightLeftIcon
                                                                className="w-3 h-3"
                                                                style={{ color: BRANCH_COLORS[idx % BRANCH_COLORS.length] }}
                                                            />
                                                        </div>
                                                        <span className="text-sm text-white font-bold">{branch.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <Badge color="gray">{branch.version}</Badge>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <Badge color={branch.health === 'Healthy' ? 'green' : 'danger'}>
                                                        {branch.health}
                                                    </Badge>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="100"
                                                            value={branch.trafficWeight}
                                                            onChange={(e) => handleSetTraffic(branch.id, e.target.value)}
                                                            className="w-24"
                                                            style={{ accentColor: BRANCH_COLORS[idx % BRANCH_COLORS.length] }}
                                                        />
                                                        <span className="text-xs font-bold text-white w-8">{branch.trafficWeight}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-sm text-gray-400 font-bold">{branch.activeSessions}</td>
                                                <td className="px-8 py-5 text-right">
                                                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleMergeBranch(branch.id)}
                                                            className="text-xs font-bold text-success hover:text-green-400 uppercase tracking-widest"
                                                        >
                                                            Merge
                                                        </button>
                                                        <button
                                                            onClick={() => handleAbortBranch(branch.id)}
                                                            className="text-xs font-bold text-danger hover:text-red-400 uppercase tracking-widest"
                                                        >
                                                            Abort
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {activeTab === 'logs' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-tight">Agent Logs</h2>
                                <p className="text-sm text-gray-500 mt-1">Real-time output and system events for this agent.</p>
                            </div>
                            <div className="flex gap-3">
                                <button className="flex items-center gap-2 px-4 py-2 bg-vsdk-card border border-vsdk-border hover:border-gray-700 text-gray-300 rounded-lg transition-all text-sm font-bold">
                                    <ArrowPathIcon className="w-4 h-4" />
                                    Refresh
                                </button>
                            </div>
                        </div>
                        <div className="bg-vsdk-bg border border-vsdk-border rounded-2xl p-8 font-mono text-sm shadow-2xl min-h-[500px]">
                            <div className="space-y-3">
                                <div className="flex gap-4 opacity-50">
                                    <span className="text-gray-600">2024-12-23 11:40:01</span>
                                    <span className="text-success">[SYSTEM]</span>
                                    <span className="text-gray-400">Log streaming initialized for {deployment.name}...</span>
                                </div>
                                <div className="flex gap-4">
                                    <span className="text-gray-600">2024-12-23 11:40:05</span>
                                    <span className="text-info">[INFO]</span>
                                    <span className="text-gray-300">Agent image {deployment.image} loaded successfully</span>
                                </div>
                                <div className="flex gap-4">
                                    <span className="text-gray-600">2024-12-23 11:40:12</span>
                                    <span className="text-info">[INFO]</span>
                                    <span className="text-gray-300">Connected to VideoSDK Meeting: abcd-1234-xyzw</span>
                                </div>
                                <div className="flex gap-4">
                                    <span className="text-gray-600">2024-12-23 11:41:05</span>
                                    <span className="text-warning">[WARN]</span>
                                    <span className="text-gray-300">High latency detected in audio stream (150ms)</span>
                                </div>
                                <div className="flex gap-4">
                                    <span className="text-gray-600">2024-12-23 11:42:10</span>
                                    <span className="text-info">[INFO]</span>
                                    <span className="text-gray-300">LLM Response generated in 450ms</span>
                                </div>
                                <div className="animate-pulse flex gap-4">
                                    <span className="text-vsdk-primary">_</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                {activeTab === 'versions' && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Deployment History</h2>
                            <div className="flex items-center gap-3 mt-1">
                                <p className="text-sm text-gray-500">Previous versions of this agent that you can rollback to.</p>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-vsdk-primary/10 border border-vsdk-primary/20 rounded text-[10px] font-bold text-vsdk-primary uppercase tracking-widest">
                                    Current: {deployment.currentTag}
                                </div>
                            </div>
                        </div>

                        <div className="bg-vsdk-card border border-vsdk-border rounded-2xl overflow-hidden shadow-2xl">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-vsdk-border bg-vsdk-bg/30">
                                        <th className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Version Tag</th>
                                        <th className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Image</th>
                                        <th className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Resource</th>
                                        <th className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Replicas</th>
                                        <th className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Deployed At</th>
                                        <th className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-vsdk-border">
                                    {deployment.versions
                                        ?.sort((a, b) => {
                                            if (a.tag === deployment.currentTag) return -1;
                                            if (b.tag === deployment.currentTag) return 1;
                                            return new Date(b.createdAt) - new Date(a.createdAt);
                                        })
                                        .map((v, idx) => (
                                            <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <Badge color={v.tag === deployment.currentTag ? "purple" : "gray"}>
                                                            {v.tag}
                                                        </Badge>
                                                        {v.tag === deployment.currentTag && <span className="text-[10px] text-vsdk-primary font-bold uppercase">Active</span>}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-xs text-gray-400 font-mono truncate max-w-[150px]">{v.image}</td>
                                                <td className="px-8 py-5 text-xs text-gray-400">{v.resourceProfile}</td>
                                                <td className="px-8 py-5 text-xs text-gray-400">{v.replicas}</td>
                                                <td className="px-8 py-5 text-sm text-gray-500">{FormatDate(v.createdAt)}</td>
                                                <td className="px-8 py-5 text-right">
                                                    {v.tag !== deployment.currentTag && (
                                                        <button className="text-xs font-bold text-vsdk-primary hover:text-vsdk-primary-hover uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                                            Rollback
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'configuration' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Environment Variables */}
                        <div className="bg-vsdk-card border border-vsdk-border rounded-2xl overflow-hidden shadow-2xl">
                            <div className="p-6 border-b border-vsdk-border bg-vsdk-bg/20 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-white tracking-tight">Environment Variables</h3>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Agent-specific and linked global variables</p>
                                </div>
                                <div className="flex gap-3">
                                    <button className="text-xs font-bold text-gray-400 hover:text-white uppercase tracking-widest border border-vsdk-border px-3 py-1.5 rounded-lg">Link Global</button>
                                    <button className="text-xs font-bold text-vsdk-primary hover:text-vsdk-primary-hover uppercase tracking-widest bg-vsdk-primary/10 px-3 py-1.5 rounded-lg">Add Variable</button>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                {secrets.map((secret, idx) => (
                                    <div key={idx} className="flex items-center gap-4 group">
                                        <div className="flex-1 relative">
                                            <input
                                                readOnly
                                                value={secret.name}
                                                className="w-full bg-vsdk-bg border border-vsdk-border rounded-lg px-4 py-2 text-sm text-white font-mono focus:outline-none"
                                            />
                                            {idx < 2 && (
                                                <span className="absolute -left-2 -top-2 px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-[8px] font-bold rounded uppercase tracking-tighter border border-purple-500/30">Global</span>
                                            )}
                                        </div>
                                        <div className="flex-1 relative">
                                            <input
                                                type={showValue[secret.id] ? "text" : "password"}
                                                readOnly
                                                value={secret.value}
                                                className={`w-full bg-vsdk-bg border border-vsdk-border rounded-lg px-4 py-2 text-sm font-mono focus:outline-none ${idx < 2 ? 'text-purple-400/70' : 'text-gray-400'}`}
                                            />
                                            <button
                                                onClick={() => toggleValue(secret.id)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                                            >
                                                {showValue[secret.id] ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <button className="p-2 text-gray-500 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Scaling & Resources */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-vsdk-card border border-vsdk-border rounded-2xl p-6 shadow-2xl">
                                <h3 className="font-bold text-white tracking-tight mb-6">Scaling Configuration</h3>
                                <div className="space-y-8">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Min Replicas</label>
                                        <input type="range" min="1" max="10" defaultValue={deployment.replicas?.min} className="w-full accent-vsdk-primary" />
                                        <div className="flex justify-between text-[10px] text-gray-500 mt-2">
                                            <span>1</span>
                                            <span>10</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Max Replicas</label>
                                        <input type="range" min="1" max="20" defaultValue={deployment.replicas?.max} className="w-full accent-vsdk-primary" />
                                        <div className="flex justify-between text-[10px] text-gray-500 mt-2">
                                            <span>1</span>
                                            <span>20</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-vsdk-card border border-vsdk-border rounded-2xl p-6 shadow-2xl">
                                <h3 className="font-bold text-white tracking-tight mb-6">Resource Profile</h3>
                                <div className="space-y-6">
                                    <select
                                        defaultValue="cpu-medium"
                                        className="w-full bg-vsdk-bg border border-vsdk-border rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-vsdk-primary transition-all"
                                    >
                                        <option value="cpu-small">cpu-small (1 vCPU, 2GB RAM)</option>
                                        <option value="cpu-medium">cpu-medium (2 vCPU, 4GB RAM)</option>
                                        <option value="cpu-large">cpu-large (4 vCPU, 8GB RAM)</option>
                                    </select>
                                    <div className="p-4 bg-vsdk-primary/5 border border-vsdk-primary/20 rounded-xl">
                                        <p className="text-xs text-gray-400 leading-relaxed">
                                            Selecting a larger profile will increase the cost per hour but provide better performance for LLM processing and audio streaming.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Save Actions */}
                        <div className="flex justify-end gap-4 pt-4">
                            <button className="px-6 py-2.5 bg-vsdk-card border border-vsdk-border text-gray-400 hover:text-white rounded-xl transition-all text-sm font-bold">
                                Discard Changes
                            </button>
                            <button className="px-8 py-2.5 bg-vsdk-primary text-black hover:bg-vsdk-primary-hover rounded-xl transition-all text-sm font-bold shadow-[0_0_20px_rgba(205,182,255,0.3)]">
                                Save & Redeploy
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
