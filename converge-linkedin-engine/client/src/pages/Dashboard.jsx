import React from 'react';
import { Sparkles, Calendar, TrendingUp, Github, Eye, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';

export default function Dashboard({ setActiveTab }) {
  const schedule = [
    { day: 'Mon', pillar: 'Authority', focus: 'AI & Marketing Trends', status: 'ready', color: 'border-indigo-500/30 bg-indigo-500/5 text-indigo-400' },
    { day: 'Tue', pillar: 'Offer', focus: 'Web Dev starting at $1,500', status: 'today', color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' },
    { day: 'Wed', pillar: 'Aradhya / AI', focus: 'AI Persona Video Demo', status: 'draft', color: 'border-purple-500/30 bg-purple-500/5 text-purple-400' },
    { day: 'Thu', pillar: 'Proof', focus: 'Gelato Case Study Results', status: 'pending', color: 'border-amber-500/30 bg-amber-500/5 text-amber-400' },
    { day: 'Fri', pillar: 'Offer / Story', focus: 'SEO Package Offer', status: 'pending', color: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Banner / Hero Section */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-[#121216] to-[#121216] border border-[#23232F] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Today's Strategy: Tuesday Offer Pillar</span>
            </div>
            <h1 className="text-2xl font-bold font-heading text-white">Converge LinkedIn Content Engine</h1>
            <p className="text-sm text-gray-400 max-w-xl">
              Consistent, high-authority LinkedIn content powered by live trend crawlers, GitHub org sync, and autonomous competitor intelligence.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('generator')}
            className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium px-5 py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-xl shadow-indigo-600/25 shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Today's 3 Drafts</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121216] border border-[#23232F] rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
            <span>TOTAL IMPRESSIONS</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold font-heading text-white">24.5k</p>
          <p className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
            <span>+18.2%</span> from last week
          </p>
        </div>

        <div className="bg-[#121216] border border-[#23232F] rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
            <span>INBOUND DMs</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold font-heading text-white">12</p>
          <p className="text-[11px] text-gray-400 font-mono">
            7 International, 5 Local
          </p>
        </div>

        <div className="bg-[#121216] border border-[#23232F] rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
            <span>GITHUB REPOS SYNCED</span>
            <Github className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold font-heading text-white">8</p>
          <p className="text-[11px] text-purple-400 font-mono">
            100% Metadata safe
          </p>
        </div>

        <div className="bg-[#121216] border border-[#23232F] rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
            <span>COMPETITORS TRACKED</span>
            <Eye className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold font-heading text-white">5</p>
          <p className="text-[11px] text-amber-400 font-mono">
            Meta & Google Ad Libraries
          </p>
        </div>
      </div>

      {/* Weekly Rotation Grid */}
      <div className="bg-[#121216] border border-[#23232F] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold font-heading text-white">Weekly Content Rotation</h3>
            <p className="text-xs text-gray-400">Monday–Friday pillar sequence designed for self-qualifying lead acquisition</p>
          </div>
          <button 
            onClick={() => setActiveTab('calendar')} 
            className="text-xs text-indigo-400 hover:text-indigo-300 font-mono flex items-center gap-1"
          >
            <span>View Full Calendar</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {schedule.map((item, idx) => (
            <div 
              key={idx} 
              className={`p-4 rounded-xl border ${item.color} flex flex-col justify-between h-36 relative transition-all hover:border-opacity-100`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold uppercase">{item.day}</span>
                  {item.status === 'today' && (
                    <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-emerald-500 text-black rounded-full uppercase">
                      Today
                    </span>
                  )}
                </div>
                <h4 className="font-heading font-bold text-sm text-white mb-1">{item.pillar}</h4>
                <p className="text-[11px] text-gray-400 line-clamp-2">{item.focus}</p>
              </div>

              <div className="text-[10px] font-mono text-gray-500 uppercase flex items-center gap-1">
                {item.status === 'ready' && <CheckCircle2 className="w-3 h-3 text-indigo-400" />}
                {item.status === 'today' && <Sparkles className="w-3 h-3 text-emerald-400" />}
                {item.status === 'draft' && <Clock className="w-3 h-3 text-purple-400" />}
                <span>Status: {item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
