import React, { useState } from "react";
import { GetRoutes } from "../../routes";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

const MenuItem = ({ item, isSubItem = false, isAdditional = false, onNavigate }) => {
    const [isOpen, setIsOpen] = useState(true); // Default open for demo

    const getIsActive = () => {
        const hash = window.location.hash.replace('#/', '');
        if (item.route === '/dashboard' && hash === 'dashboard') return true;
        if (item.route === '/agents' && (hash === 'deployments' || hash === 'sessions' || hash === 'logs' || hash === 'integrations' || hash.startsWith('deployments/'))) return true;
        if (item.label === 'Deployments' && (hash === 'deployments' || hash.startsWith('deployments/'))) return true;
        if (item.label === 'Sessions' && hash === 'sessions') return true;
        if (item.label === 'Logs' && hash === 'logs') return true;
        if (item.label === 'Integrations' && hash === 'integrations') return true;
        return item.active;
    };

    const isActive = getIsActive();
    const hasChildren = (item.subRoutes && item.subRoutes.length > 0) || (item.additionalRoutes && item.additionalRoutes.length > 0);

    const handleClick = (e) => {
        if (item.route) {
            e.preventDefault();
            onNavigate(item.route);
        } else if (item.label === 'Deployments') {
            e.preventDefault();
            window.location.hash = '#/deployments';
        } else if (item.label === 'Sessions') {
            e.preventDefault();
            window.location.hash = '#/sessions';
        } else if (item.label === 'Logs') {
            e.preventDefault();
            window.location.hash = '#/logs';
        } else if (item.label === 'Integrations') {
            e.preventDefault();
            window.location.hash = '#/integrations';
        } else if (hasChildren) {
            e.preventDefault();
            setIsOpen(!isOpen);
        }
    };

    return (
        <div className="w-full">
            <a
                href={item.href || "#"}
                onClick={handleClick}
                className={`flex items-center justify-between w-full ${isSubItem ? "pl-9 pr-3 py-2" : "px-3 py-2.5"} mt-1 rounded-lg text-sm transition-all duration-200 group ${isActive
                    ? "bg-vsdk-primary/10 text-vsdk-primary"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                    } cursor-pointer`}
            >
                <div className="flex items-center">
                    {item.Icon && !isSubItem && (
                        <item.Icon
                            className={`w-5 h-5 mr-3 transition-colors duration-200 ${isActive ? "text-vsdk-primary" : "text-gray-500 group-hover:text-white"
                                }`}
                        />
                    )}
                    {item.Icon && isSubItem && (
                        <item.Icon
                            className={`w-4 h-4 mr-3 transition-colors duration-200 ${isActive ? "text-vsdk-primary" : "text-gray-500 group-hover:text-white"
                                }`}
                        />
                    )}
                    <span className={`font-medium ${isActive ? "text-vsdk-primary" : ""}`}>{item.label}</span>
                    {item.newLabel && (
                        <span className="ml-2 px-2 py-0.5 text-[10px] font-bold bg-vsdk-primary/20 text-vsdk-primary rounded-full uppercase tracking-wider">
                            {item.newLabel}
                        </span>
                    )}
                </div>
                {hasChildren && (
                    <ChevronDownIcon
                        className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                            } text-gray-600 group-hover:text-white`}
                    />
                )}
            </a>

            {isOpen && hasChildren && (
                <div className="mt-1">
                    {item.subRoutes?.map((subItem, idx) => (
                        <MenuItem key={`sub-${idx}`} item={subItem} isSubItem={true} onNavigate={onNavigate} />
                    ))}
                    {item.subRoutes?.length > 0 && item.additionalRoutes?.length > 0 && (
                        <div className="my-2 border-t border-vsdk-border mx-4"></div>
                    )}
                    {item.additionalRoutes?.map((addItem, idx) => (
                        <MenuItem key={`add-${idx}`} item={addItem} isSubItem={true} isAdditional={true} onNavigate={onNavigate} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default function Sidebar({ onNavigate }) {
    const routes = GetRoutes();

    return (
        <div style={{ position: 'fixed', left: 0, top: 0, width: '256px', height: '100vh', zIndex: 30 }} className="flex flex-col bg-vsdk-sidebar border-r border-vsdk-border flex-shrink-0">
            {/* Logo Area */}
            <div className="flex items-center h-[60px] px-6 border-b border-vsdk-border shrink-0 bg-vsdk-sidebar">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-vsdk-primary rounded-lg flex items-center justify-center text-black font-bold text-xl shadow-[0_0_15px_rgba(205,182,255,0.3)]">V</div>
                    <span className="text-white font-bold text-lg tracking-tight">VideoSDK</span>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-6 px-3 scrollbar-hide">
                <nav className="space-y-1">
                    {Object.values(routes).map((route, idx) => (
                        <MenuItem key={idx} item={route} onNavigate={onNavigate} />
                    ))}
                </nav>
            </div>

            {/* Bottom Section Mock */}
            <div className="p-4 border-t border-vsdk-border bg-vsdk-sidebar">
                <div className="bg-vsdk-card border border-vsdk-border rounded-xl p-4">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Usage</p>
                    <div className="w-full bg-vsdk-bg h-1.5 rounded-full overflow-hidden">
                        <div className="bg-vsdk-primary h-full w-[45%]" />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2">4.5k / 10k minutes</p>
                </div>
            </div>
        </div>
    );
}
