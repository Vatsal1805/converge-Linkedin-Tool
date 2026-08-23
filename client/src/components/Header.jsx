import React from 'react';
import { Calendar, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function Header({ activeTab, setActiveTab }) {
  // Determine current day pillar logic
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = days[new Date().getDay()];
  
  const pillarMap = {
    Monday: { name: 'Authority', color: 'border-indigo-500/40 text-indigo-400 bg-indigo-500/10', desc: 'AI & Marketing Tips' },
    Tuesday: { name: 'Offer', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10', desc: 'Services & Pricing' },
    Wednesday: { name: 'Aradhya / AI Showcase', color: 'border-purple-500/40 text-purple-400 bg-purple-500/10', desc: 'Flagship AI Persona' },
    Thursday: { name: 'Proof', color: 'border-amber-500/40 text-amber-400 bg-amber-500/10', desc: 'Real Client Case Studies' },
    Friday: { name: 'Offer / Personal Profile', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10', desc: 'Direct Sales or Personal Story' },
  };

  const todayPillar = pillarMap[todayName] || pillarMap.Tuesday;

  return (
    <header className="h-16 border-b border-[#23232F] bg-[#121216]/50 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <h2 className="text-base font-bold font-heading text-white capitalize">{activeTab.replace('-', ' ')}</h2>
        <span className="text-gray-600">/</span>
        
        {/* Today's Active Pillar Tag */}
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono font-medium ${todayPillar.color}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          <span>Today ({todayName}): {todayPillar.name}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Sync Status Badge */}
        <div className="flex items-center gap-2 text-xs text-gray-400 font-mono bg-[#0A0A0C] border border-[#23232F] px-3 py-1.5 rounded-xl">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Crawler Idle</span>
        </div>

        {/* Quick Action Button */}
        {activeTab !== 'generator' && (
          <button
            onClick={() => setActiveTab('generator')}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all shadow-md shadow-indigo-600/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Today's Draft</span>
          </button>
        )}
      </div>
    </header>
  );
}
