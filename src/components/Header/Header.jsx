import React from "react";
import { ChevronRightIcon, BellIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

export default function Header({ selectedDeployment }) {
    return (
        <header style={{ position: 'fixed', top: 0, right: 0, left: '256px', height: '60px', zIndex: 20 }} className="bg-vsdk-bg border-b border-vsdk-border px-6 flex items-center justify-between backdrop-blur-md bg-opacity-80">
            {/* Left Side: Breadcrumbs / Title */}
            <div className="flex items-center">
                <div className="flex items-center text-sm font-medium">
                    <span className="text-gray-500 hover:text-gray-300 cursor-pointer transition-colors">AI Agent</span>
                    <ChevronRightIcon className="w-3 h-3 mx-3 text-gray-700" />
                    <span className={selectedDeployment ? "text-gray-500" : "text-white font-bold"}>Deployments</span>
                    {selectedDeployment && (
                        <>
                            <ChevronRightIcon className="w-3 h-3 mx-3 text-gray-700" />
                            <span className="text-white font-bold">{selectedDeployment.id.slice(0, 12)}...</span>
                        </>
                    )}
                </div>
            </div>

            {/* Right Side: Actions */}
            <div className="flex items-center gap-6">
                {/* Search Mock */}
                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-vsdk-card border border-vsdk-border rounded-lg text-gray-500 text-xs cursor-text hover:border-gray-700 transition-all">
                    <span>Search anything...</span>
                    <span className="px-1.5 py-0.5 bg-vsdk-bg border border-vsdk-border rounded text-[10px]">⌘K</span>
                </div>

                {/* Icons */}
                <div className="flex items-center gap-4 text-gray-500">
                    <QuestionMarkCircleIcon className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
                    <div className="relative">
                        <BellIcon className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
                        <div className="absolute top-0 right-0 w-2 h-2 bg-vsdk-primary rounded-full border-2 border-vsdk-bg" />
                    </div>
                </div>

                {/* Org Selector Mock */}
                <div className="flex items-center gap-3 pl-6 border-l border-vsdk-border">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-vsdk-card border border-vsdk-border rounded-lg cursor-pointer hover:border-gray-700 transition-all group">
                        <div className="w-6 h-6 bg-gradient-to-tr from-vsdk-primary to-info rounded-md flex items-center justify-center text-[10px] text-black font-bold">JD</div>
                        <span className="text-sm font-bold text-white">John's Project</span>
                        <ChevronRightIcon className="w-3 h-3 rotate-90 text-gray-500 group-hover:text-white transition-colors" />
                    </div>
                </div>
            </div>
        </header>
    );
}
