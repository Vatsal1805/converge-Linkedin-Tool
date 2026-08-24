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
import { Sparkles, CalendarDays, BarChart3, Eye, Github, Settings as SettingsIcon } from 'lucide-react';

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const isAuth = localStorage.getItem('converge_team_auth');
    if (isAuth === 'true') {
      setAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('converge_team_auth');
    setAuthenticated(false);
  };

  if (!authenticated) {
    return <PasswordGate onAuthenticated={() => setAuthenticated(true)} />;
  }

  return (
    <div className="flex min-h-screen bg-[#0A0A0C] text-[#F3F4F6] selection:bg-indigo-500 selection:text-white">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="p-6 md:p-8 flex-1 max-w-[1400px] w-full mx-auto">
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
            <div className="bg-[#121216] border border-[#23232F] rounded-2xl p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <SettingsIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold font-heading text-white">System Settings & Configuration</h2>
                  <p className="text-xs text-gray-400 font-mono">Environment variables & API status</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-[#23232F]">
                <div className="flex items-center justify-between p-4 bg-[#0A0A0C] border border-[#23232F] rounded-xl text-sm font-mono">
                  <span>Supabase Database (Postgres)</span>
                  <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 text-xs border border-amber-500/20">Pending Schema Seed</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#0A0A0C] border border-[#23232F] rounded-xl text-sm font-mono">
                  <span>OpenRouter API (Qwen / DeepSeek)</span>
                  <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">Ready</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#0A0A0C] border border-[#23232F] rounded-xl text-sm font-mono">
                  <span>Perplexity Sonar API</span>
                  <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">Ready</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#0A0A0C] border border-[#23232F] rounded-xl text-sm font-mono">
                  <span>Team Password Gate</span>
                  <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">Active (converge2026)</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
