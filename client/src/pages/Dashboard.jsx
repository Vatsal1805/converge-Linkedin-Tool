import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, TrendingUp, Github, Eye, ArrowUpRight, CheckCircle2, Clock, Database, RefreshCw, Zap, ShieldCheck } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : '';

export default function Dashboard({ setActiveTab }) {
  const [cronStatus, setCronStatus] = useState(null);
  const [loadingCron, setLoadingCron] = useState(true);
  const [runningRoutine, setRunningRoutine] = useState(false);
  const [routineMessage, setRoutineMessage] = useState(null);

  useEffect(() => {
    fetchCronStatus();
  }, []);

  const fetchCronStatus = async () => {
    setLoadingCron(true);
    try {
      const res = await fetch(`${API_BASE}/api/cron/status`);
      const data = await res.json();
      if (data.success) setCronStatus(data);
    } catch (err) {
      console.error('Failed to fetch cron status:', err);
    } finally {
      setLoadingCron(false);
    }
  };

  const handleRunFullCrawlRoutine = async () => {
    setRunningRoutine(true);
    setRoutineMessage(null);
    try {
      const res = await fetch(`${API_BASE}/api/cron/run-full`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setRoutineMessage(`Success! Crawled trends, competitors & leads. Supabase updated.`);
        fetchCronStatus();
        setTimeout(() => setRoutineMessage(null), 5000);
      }
    } catch (err) {
      console.error('Failed to run full crawl routine:', err);
    } finally {
      setRunningRoutine(false);
    }
  };

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

      {/* Live Cron & Supabase Database Audit Health Card */}
      <div className="bg-[#121216] border border-[#23232F] rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#23232F] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <h3 className="text-base font-bold font-heading text-white">Cron Engine & Supabase Database Audit</h3>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Scheduled 3x Daily (8am, 2pm, 8pm)
              </span>
            </div>
            <p className="text-xs text-gray-400 font-mono">
              Live audit showing real data stored in your Supabase PostgreSQL database tables.
            </p>
          </div>

          <button
            onClick={handleRunFullCrawlRoutine}
            disabled={runningRoutine}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 shrink-0"
          >
            <Zap className={`w-4 h-4 ${runningRoutine ? 'animate-bounce' : ''}`} />
            <span>{runningRoutine ? 'Running Full Auto-Crawl...' : '⚡ Run Full Auto-Crawl Routine Now'}</span>
          </button>
        </div>

        {routineMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl p-3 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{routineMessage}</span>
          </div>
        )}

        {/* Database Counts Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#0A0A0C] border border-[#23232F] rounded-xl p-4 space-y-1">
            <span className="text-[10px] font-mono text-gray-500 uppercase">Idea Bank (Real Ideas)</span>
            <p className="text-xl font-bold font-heading text-white">
              {cronStatus?.databaseAudit?.ideasInBank || 0}
            </p>
            <span className="text-[10px] text-indigo-400 font-mono">Table: idea_bank</span>
          </div>

          <div className="bg-[#0A0A0C] border border-[#23232F] rounded-xl p-4 space-y-1">
            <span className="text-[10px] font-mono text-gray-500 uppercase">Real Competitors</span>
            <p className="text-xl font-bold font-heading text-rose-400">
              {cronStatus?.databaseAudit?.competitorsDiscovered || 0}
            </p>
            <span className="text-[10px] text-rose-400 font-mono">Table: competitors</span>
          </div>

          <div className="bg-[#0A0A0C] border border-[#23232F] rounded-xl p-4 space-y-1">
            <span className="text-[10px] font-mono text-gray-500 uppercase">Discovered Leads</span>
            <p className="text-xl font-bold font-heading text-emerald-400">
              {cronStatus?.databaseAudit?.leadsDiscovered || 0}
            </p>
            <span className="text-[10px] text-emerald-400 font-mono">Table: leads</span>
          </div>

          <div className="bg-[#0A0A0C] border border-[#23232F] rounded-xl p-4 space-y-1">
            <span className="text-[10px] font-mono text-gray-500 uppercase">Synced GitHub Repos</span>
            <p className="text-xl font-bold font-heading text-purple-400">
              {cronStatus?.databaseAudit?.githubProjectsSynced || 0}
            </p>
            <span className="text-[10px] text-purple-400 font-mono">Table: github_projects</span>
          </div>
        </div>
      </div>

      {/* Weekly Schedule Grid */}
      <div className="bg-[#121216] border border-[#23232F] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <h3 className="text-base font-bold font-heading text-white">This Week's Pillar Strategy</h3>
          </div>
          <button
            onClick={() => setActiveTab('calendar')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-mono flex items-center gap-1"
          >
            <span>View Calendar</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {schedule.map((item) => (
            <div
              key={item.day}
              className={`p-4 rounded-xl border space-y-2 transition-all ${item.color}`}
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold">{item.day}</span>
                <span className="uppercase text-[10px]">{item.pillar}</span>
              </div>
              <p className="text-xs font-sans text-white font-medium line-clamp-2">{item.focus}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
