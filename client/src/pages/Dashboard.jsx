import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, TrendingUp, Github, Eye, ArrowUpRight, CheckCircle2, Clock, Database, RefreshCw, Zap, ShieldCheck, AlertTriangle, XCircle, Activity, FileText } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : '';

export default function Dashboard({ setActiveTab }) {
  const [cronStatus, setCronStatus] = useState(null);
  const [loadingCron, setLoadingCron] = useState(true);
  const [runningRoutine, setRunningRoutine] = useState(false);
  const [routineMessage, setRoutineMessage] = useState(null);
  const [showLogsModal, setShowLogsModal] = useState(false);

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
      if (data.ok || data.success) {
        setRoutineMessage(`Background auto-crawl routine triggered successfully!`);
        fetchCronStatus();
        setTimeout(() => setRoutineMessage(null), 5000);
      }
    } catch (err) {
      console.error('Failed to run full crawl routine:', err);
    } finally {
      setRunningRoutine(false);
    }
  };

  // Helper: Format Time Ago (e.g. "2 hours ago", "5 mins ago")
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'No runs logged yet';
    const seconds = Math.floor((Date.now() - new Date(timestamp)) / 1000);
    if (seconds < 60) return `${Math.max(1, seconds)}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const lastRun = cronStatus?.lastRun;
  const isHanging = lastRun?.status === 'running' && (Date.now() - new Date(lastRun.started_at)) > 10 * 60 * 1000;

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

      {/* Observability: System Health Widget */}
      <div className="bg-[#121216] border border-[#23232F] rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#23232F] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold font-jakarta text-white flex items-center gap-2">
                System Health & Observability
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Automated background cron run execution status and Supabase table audit.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLogsModal(true)}
              className="bg-[#1A1A24] hover:bg-[#23232F] text-slate-300 text-xs font-mono px-3.5 py-2 rounded-xl border border-[#23232F] transition-all flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>View Full Cron Logs</span>
            </button>

            <button
              onClick={handleRunFullCrawlRoutine}
              disabled={runningRoutine}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-950/40"
            >
              <Zap className={`w-3.5 h-3.5 ${runningRoutine ? 'animate-bounce' : ''}`} />
              <span>{runningRoutine ? 'Triggering...' : '⚡ Trigger Full Auto-Crawl'}</span>
            </button>
          </div>
        </div>

        {routineMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl p-3 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{routineMessage}</span>
          </div>
        )}

        {/* Most Recent Run Indicator Bar */}
        <div className="bg-[#0A0A0C] border border-[#23232F] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-3">
            {/* Status Icon */}
            {isHanging ? (
              <div className="w-3 h-3 rounded-full bg-amber-400 animate-ping shrink-0" title="Running >10m" />
            ) : lastRun?.status === 'success' ? (
              <div className="w-3 h-3 rounded-full bg-emerald-400 shrink-0" title="Success" />
            ) : lastRun?.status === 'partial' || lastRun?.status === 'running' ? (
              <div className="w-3 h-3 rounded-full bg-amber-400 shrink-0" title="Partial/Running" />
            ) : lastRun?.status === 'failed' ? (
              <div className="w-3 h-3 rounded-full bg-rose-500 shrink-0" title="Failed" />
            ) : (
              <div className="w-3 h-3 rounded-full bg-slate-600 shrink-0" />
            )}

            <div>
              <div className="text-white font-bold flex items-center gap-2">
                <span>{lastRun ? `${lastRun.job_name}` : 'No cron runs logged yet'}</span>
                {lastRun && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase border ${
                    isHanging
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : lastRun.status === 'success'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : lastRun.status === 'failed'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {isHanging ? 'Hanging (>10m)' : lastRun.status}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {lastRun ? (
                  <>
                    Ran {formatTimeAgo(lastRun.started_at)} • Processed: <strong className="text-white">{lastRun.records_processed || 0} records</strong> • Duration: {lastRun.duration_ms ? `${(lastRun.duration_ms / 1000).toFixed(1)}s` : 'In progress...'}
                  </>
                ) : (
                  'Background cron jobs automatically update cron_run_logs table'
                )}
              </p>
            </div>
          </div>

          {lastRun?.error_message && (
            <div className="text-[11px] text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg max-w-sm line-clamp-1">
              Error: {lastRun.error_message}
            </div>
          )}
        </div>

        {/* Database Audit Counts Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#0A0A0C] border border-[#23232F] rounded-xl p-4 space-y-1">
            <span className="text-[10px] font-mono text-gray-500 uppercase">Idea Bank (Real Ideas)</span>
            <p className="text-xl font-bold font-heading text-white">
              {cronStatus?.audit?.databaseAudit?.ideasInBank || 0}
            </p>
            <span className="text-[10px] text-indigo-400 font-mono">Table: idea_bank</span>
          </div>

          <div className="bg-[#0A0A0C] border border-[#23232F] rounded-xl p-4 space-y-1">
            <span className="text-[10px] font-mono text-gray-500 uppercase">Real Competitors</span>
            <p className="text-xl font-bold font-heading text-rose-400">
              {cronStatus?.audit?.databaseAudit?.competitorsDiscovered || 0}
            </p>
            <span className="text-[10px] text-rose-400 font-mono">Table: competitors</span>
          </div>

          <div className="bg-[#0A0A0C] border border-[#23232F] rounded-xl p-4 space-y-1">
            <span className="text-[10px] font-mono text-gray-500 uppercase">Discovered Leads</span>
            <p className="text-xl font-bold font-heading text-emerald-400">
              {cronStatus?.audit?.databaseAudit?.leadsDiscovered || 0}
            </p>
            <span className="text-[10px] text-emerald-400 font-mono">Table: leads</span>
          </div>

          <div className="bg-[#0A0A0C] border border-[#23232F] rounded-xl p-4 space-y-1">
            <span className="text-[10px] font-mono text-gray-500 uppercase">Synced GitHub Repos</span>
            <p className="text-xl font-bold font-heading text-purple-400">
              {cronStatus?.audit?.databaseAudit?.githubProjectsSynced || 0}
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

      {/* Full Cron Run Logs History Modal */}
      {showLogsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121216] border border-[#23232F] rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#23232F] flex items-center justify-between bg-[#0A0A0C]">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold font-jakarta text-white">
                  Cron Run Execution History (`cron_run_logs`)
                </h3>
              </div>
              <button
                onClick={() => setShowLogsModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-[#1A1A24]"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Logs Table */}
            <div className="p-5 overflow-y-auto space-y-3 font-mono text-xs">
              {cronStatus?.logs?.length > 0 ? (
                <div className="space-y-2">
                  {cronStatus.logs.map((log) => (
                    <div key={log.id} className="bg-[#0A0A0C] border border-[#23232F] p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{log.job_name}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase border ${
                            log.status === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                            log.status === 'failed' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                            'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}>
                            {log.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Started: {new Date(log.started_at).toLocaleString()} • Duration: {log.duration_ms ? `${(log.duration_ms / 1000).toFixed(1)}s` : 'Running'}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-emerald-400 font-bold">
                          {log.records_processed !== null ? `${log.records_processed} Records` : '0 Records'}
                        </div>
                        {log.error_message && (
                          <div className="text-[10px] text-rose-400 max-w-xs truncate" title={log.error_message}>
                            {log.error_message}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500">
                  No cron run logs recorded yet. Run a routine to see logs.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#23232F] bg-[#0A0A0C] text-right">
              <button
                onClick={() => setShowLogsModal(false)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-semibold"
              >
                Close Logs Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
