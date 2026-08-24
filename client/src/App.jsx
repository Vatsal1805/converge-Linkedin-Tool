import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import PasswordGate from './components/PasswordGate';
import Dashboard from './pages/Dashboard';
import Generator from './pages/Generator';
import Calendar from './pages/Calendar';
import Tracker from './pages/Tracker';
import CompetitorResearch from './pages/CompetitorResearch';
import GitHubSync from './pages/GitHubSync';
import Verification from './pages/Verification';
import AdIntelligence from './pages/AdIntelligence';
import IntentSignals from './pages/IntentSignals';

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  
  // Persist Active Tab across page reloads & URL hashes
  const getInitialTab = () => {
    const hash = window.location.hash.replace('#', '');
    const validTabs = ['dashboard', 'generator', 'calendar', 'tracker', 'competitors', 'ad-intelligence', 'intent-signals', 'verification', 'github'];
    if (hash && validTabs.includes(hash)) return hash;
    const saved = localStorage.getItem('converge_active_tab');
    if (saved && validTabs.includes(saved)) return saved;
    return 'dashboard';
  };

  const [activeTab, setActiveTabState] = useState(getInitialTab);
  const [mobileOpen, setMobileOpen] = useState(false);

  const setActiveTab = (tab) => {
    window.location.hash = tab;
    localStorage.setItem('converge_active_tab', tab);
    setActiveTabState(tab);
  };

  useEffect(() => {
    const isAuth = localStorage.getItem('converge_team_auth');
    if (isAuth === 'true') {
      setAuthenticated(true);
    }

    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) setActiveTabState(hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('converge_team_auth');
    setAuthenticated(false);
  };

  if (!authenticated) {
    return <PasswordGate onAuthenticated={() => setAuthenticated(true)} />;
  }

  return (
    <div className="flex min-h-[100dvh] bg-[#0A0A0C] text-[#F3F4F6] selection:bg-indigo-500 selection:text-white relative">
      {/* Sidebar (Desktop + Mobile Drawer) */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          setMobileOpen={setMobileOpen}
        />

        <main className="p-4 sm:p-6 md:p-8 flex-1 max-w-[1400px] w-full mx-auto">
          {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
          
          {activeTab === 'generator' && <Generator setActiveTab={setActiveTab} />}

          {activeTab === 'calendar' && <Calendar setActiveTab={setActiveTab} />}

          {activeTab === 'tracker' && <Tracker />}

          {activeTab === 'competitors' && <CompetitorResearch setActiveTab={setActiveTab} />}

          {activeTab === 'ad_intelligence' && <AdIntelligence setActiveTab={setActiveTab} />}

          {activeTab === 'intent_signals' && <IntentSignals />}

          {activeTab === 'verification' && <Verification />}

          {activeTab === 'github' && <GitHubSync />}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold font-heading text-white">System Settings & Integrations</h1>
                <p className="text-xs sm:text-sm text-gray-400">Environment status and API integrations.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-[#121216] border border-[#23232F] rounded-xl text-sm font-mono">
                  <span>Supabase PostgreSQL</span>
                  <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">Connected</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#121216] border border-[#23232F] rounded-xl text-sm font-mono">
                  <span>OpenRouter (Multi-LLM)</span>
                  <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">Connected</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#121216] border border-[#23232F] rounded-xl text-sm font-mono">
                  <span>Perplexity Sonar API</span>
                  <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">Ready</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#121216] border border-[#23232F] rounded-xl text-sm font-mono">
                  <span>Team Password Gate</span>
                  <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">Active (Configured in .env)</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
