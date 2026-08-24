import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Sparkles, 
  ExternalLink, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  MessageSquare, 
  RefreshCw,
  Search,
  Building2
} from 'lucide-react';

export default function IntentSignals() {
  const [signals, setSignals] = useState([]);
  const [serviceFilter, setServiceFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [mining, setMining] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchSignals();
  }, [serviceFilter, classFilter]);

  const fetchSignals = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/intent-signals/list?service_area=${serviceFilter}&classification=${classFilter}`);
      const data = await res.json();
      if (data.success) {
        setSignals(data.signals || []);
      }
    } catch (err) {
      console.error('Error fetching intent signals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (signalId, status) => {
    try {
      const res = await fetch('http://localhost:5000/api/intent-signals/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signalId, status })
      });
      const data = await res.json();
      if (data.success) {
        setNotification(`Signal status updated to "${status}"!`);
        fetchSignals();
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      console.error('Error updating signal status:', err);
    }
  };

  const handleTriggerMining = async () => {
    setMining(true);
    try {
      const res = await fetch('http://localhost:5000/api/intent-signals/trigger-crawl', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setNotification('Reddit RSS & Grounded Intent Search completed!');
        fetchSignals();
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (err) {
      console.error('Error triggering intent miner:', err);
    } finally {
      setMining(false);
    }
  };

  return (
    <div className="p-8 space-y-8 bg-[#0A0A0C] min-h-screen text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#23232F] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-500/10 border border-violet-500/20 rounded-xl">
              <Radio className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold font-jakarta text-white tracking-tight">
                  Intent Signal Mining Hub
                </h1>
                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold uppercase">
                  Unverified — Review Required
                </span>
              </div>
              <p className="text-sm text-slate-400">
                Parses public Reddit RSS feeds & grounded web queries for real business pain points <span className="text-violet-400 font-mono">BEFORE prospects search for an agency</span>.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTriggerMining}
            disabled={mining}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-lg shadow-violet-950/40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${mining ? 'animate-spin' : ''}`} />
            {mining ? 'Mining RSS Feeds...' : 'Mine Intent Signals Now'}
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className="bg-violet-500/10 border border-violet-500/30 text-violet-300 px-4 py-3 rounded-xl text-xs font-mono flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-violet-400" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-violet-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Controls & Filter Bar */}
      <div className="bg-[#121216] border border-[#23232F] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-400">Service Area:</span>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="bg-[#0A0A0C] border border-[#23232F] rounded-lg px-3 py-1.5 text-white focus:outline-none cursor-pointer"
            >
              <option value="all">All Service Areas</option>
              <option value="web_dev">Web Development</option>
              <option value="branding">Branding</option>
              <option value="aradhya_ai_video">Aradhya AI Video</option>
              <option value="seo">SEO</option>
              <option value="social_media">Social Media</option>
              <option value="general">General Agency</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Classification:</span>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="bg-[#0A0A0C] border border-[#23232F] rounded-lg px-3 py-1.5 text-white focus:outline-none cursor-pointer"
            >
              <option value="all">Genuine Intent & Ambiguous</option>
              <option value="genuine_intent">Genuine Intent Only</option>
              <option value="ambiguous">Ambiguous Signals Only</option>
            </select>
          </div>
        </div>

        <div className="text-slate-500 text-[11px]">
          Showing <span className="text-violet-400 font-bold">{signals.length}</span> unverified public forum signals
        </div>
      </div>

      {/* Signals List View */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 font-mono text-xs animate-pulse">
          Parsing Reddit RSS feeds and grounded intent signals...
        </div>
      ) : signals.length > 0 ? (
        <div className="space-y-4">
          {signals.map((sig) => {
            const isGenuine = sig.ai_relevance_classification === 'genuine_intent';

            return (
              <div 
                key={sig.id} 
                className={`bg-[#121216] border rounded-2xl p-6 space-y-4 transition-all hover:border-violet-500/30 ${
                  isGenuine ? 'border-violet-500/30 bg-violet-950/10' : 'border-[#23232F]'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#23232F] pb-3">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-md text-[10px] font-bold">
                      {sig.subreddit_or_platform}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400 capitalize">{sig.detected_service_area?.replace('_', ' ')}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase border ${
                      isGenuine
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}>
                      {sig.ai_relevance_classification?.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Post Title & Excerpt */}
                <div className="space-y-2">
                  <h3 className="text-base font-bold font-jakarta text-white flex items-center justify-between gap-4">
                    <a href={sig.post_url} target="_blank" rel="noopener noreferrer" className="hover:text-violet-400 transition-colors flex items-center gap-2">
                      <span>{sig.post_title}</span>
                      <ExternalLink className="w-4 h-4 text-slate-500 hover:text-violet-400" />
                    </a>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed bg-[#0A0A0C] border border-[#23232F] p-3 rounded-xl italic">
                    "{sig.post_excerpt}"
                  </p>
                </div>

                {/* AI Reasoning & Action Toggles */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 font-mono text-xs">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                    <span>AI Reasoning: {sig.ai_reasoning}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[11px]">Mark as:</span>
                    <button
                      onClick={() => handleUpdateStatus(sig.id, 'reviewed')}
                      className={`px-3 py-1 rounded-lg border text-[11px] transition-all ${
                        sig.status === 'reviewed' 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold' 
                          : 'bg-[#0A0A0C] text-slate-400 border-[#23232F] hover:text-white'
                      }`}
                    >
                      Reviewed
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(sig.id, 'acted_on')}
                      className={`px-3 py-1 rounded-lg border text-[11px] transition-all ${
                        sig.status === 'acted_on' 
                          ? 'bg-violet-500/20 text-violet-300 border-violet-500/40 font-bold' 
                          : 'bg-[#0A0A0C] text-slate-400 border-[#23232F] hover:text-white'
                      }`}
                    >
                      Acted On
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(sig.id, 'dismissed')}
                      className={`px-3 py-1 rounded-lg border text-[11px] transition-all ${
                        sig.status === 'dismissed' 
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold' 
                          : 'bg-[#0A0A0C] text-slate-400 border-[#23232F] hover:text-white'
                      }`}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center text-slate-500 font-mono text-xs space-y-3 bg-[#121216] border border-[#23232F] rounded-2xl">
          <Radio className="w-8 h-8 text-violet-400 mx-auto" />
          <div>No intent signals matching filters.</div>
          <p className="text-[11px] text-slate-600 max-w-md mx-auto">
            Click "Mine Intent Signals Now" to parse public Reddit RSS feeds (`r/ecommerce`, `r/shopify`, `r/DTC`, `r/smallbusiness`).
          </p>
        </div>
      )}
    </div>
  );
}
