import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import Header from './components/Header/Header';
import AgentCloud from './AgentCloud';

// Mock Contexts
export const AuthContext = React.createContext({
    state: { user: { discontinued: false } }
});

export const SidebarContext = React.createContext({
    annoucementVisible: false,
    userDiscontinuedannoucementVisible: { visible: false },
    otherAnnouncementVisible: false,
    toggleSidebarCollapse: () => { }
});

export const useAuthContext = () => React.useContext(AuthContext);

function App() {
    const getInitialView = () => {
        const hash = window.location.hash.replace('#/', '');
        if (hash.startsWith('dashboard')) return 'dashboard';
        return 'agent-cloud'; // Default to Agent Cloud
    };

    const [currentView, setCurrentView] = useState(getInitialView());

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#/', '');
            if (hash.startsWith('dashboard')) setCurrentView('dashboard');
            else setCurrentView('agent-cloud');
        };

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const handleNavigate = (route) => {
        if (route === '/agents') window.location.hash = '#/deployments';
        else if (route === '/dashboard') window.location.hash = '#/dashboard';
    };

    return (
        <AuthContext.Provider value={{ state: { user: { discontinued: false } } }}>
            <SidebarContext.Provider value={{
                annoucementVisible: false,
                userDiscontinuedannoucementVisible: { visible: false },
                otherAnnouncementVisible: false,
                toggleSidebarCollapse: () => { }
            }}>
                <div className="min-h-screen bg-vsdk-bg text-white font-sans antialiased selection:bg-vsdk-primary selection:text-black">
                    <Sidebar onNavigate={handleNavigate} />
                    <Header />
                    <main style={{ marginLeft: '256px', paddingTop: '60px' }} className="min-h-screen">
                        <div className="p-8">
                            {currentView === 'agent-cloud' && (
                                <AgentCloud />
                            )}
                            {currentView === 'dashboard' && (
                                <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
                                    <h2 className="text-2xl font-bold mb-2">Main Dashboard</h2>
                                    <p>Select "AI Agent" from the sidebar to see the Agent Cloud features.</p>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </SidebarContext.Provider>
        </AuthContext.Provider>
    );
}

export default App;
