import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Sparkles, 
  Clock, 
  RefreshCw, 
  ExternalLink, 
  TrendingUp, 
  Building2, 
  Lightbulb, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';

export default function AdIntelligence({ setActiveTab }) {
  const [groupedAds, setGroupedAds] = useState([]);
  const [totalTracked, setTotalTracked] = useState(0);
  const [loading, setLoading] = useState(true);
  const [crawling, setCrawling] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/ad-intelligence/ads');
      const data = await res.json();
      if (data.success) {
        setGroupedAds(data.grouped || []);
        setTotalTracked(data.totalTrackedAds || 0);
      }
    } catch (err) {
      console.error('Error fetching tracked ads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerCrawl = async () => {
    setCrawling(true);
    try {
      const res = await fetch('http://localhost:5000/api/ad-intelligence/trigger-crawl', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Ad longevity tracking & delayed analysis executed!');
        fetchAds();
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (err) {
      console.error('Error triggering ad crawl:', err);
    } finally {
      setCrawling(false);
    }
  };

  const handleSuggestIdea = async (adId) => {
    try {
      const res = await fetch('http://localhost:5000/api/ad-intelligence/suggest-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Winning ad angle converted & saved to Idea Bank!');
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (err) {
      console.error('Error suggesting idea:', err);
    }
  };

  return (
    <div className="p-8 space-y-8 bg-[#0A0A0C] min-h-screen text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#23232F] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
              <Eye className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-jakarta text-white tracking-tight">
                Ad Intelligence & Longevity Pipeline
              </h1>
              <p className="text-sm text-slate-400">
                Tracks competitor ads on Meta & LinkedIn Ad Libraries. Analyzes conversion hypotheses <span className="text-indigo-400 font-mono">ONLY after days_active ≥ 7</span>.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#121216] border border-[#23232F] rounded-xl px-4 py-2 text-xs font-mono text-slate-300 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{totalTracked} Ads Tracked</span>
          </div>

          <button
            onClick={handleTriggerCrawl}
            disabled={crawling}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-lg shadow-indigo-950/40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${crawling ? 'animate-spin' : ''}`} />
            {crawling ? 'Tracking Ads...' : 'Run Ad Tracker Now'}
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-xl text-xs font-mono flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Main Content: Grouped by Competitor */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 font-mono text-xs animate-pulse">
          Loading competitor ad intelligence pipeline data...
        </div>
      ) : groupedAds.length > 0 ? (
        <div className="space-y-8">
          {groupedAds.map((group) => (
            <div key={group.competitorId} className="bg-[#121216] border border-[#23232F] rounded-2xl p-6 space-y-6">
              {/* Competitor Banner */}
              <div className="flex items-center justify-between border-b border-[#23232F] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold font-mono text-sm">
                    {group.competitorName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-base font-bold font-jakarta text-white flex items-center gap-2">
                      {group.competitorName}
                      {group.websiteUrl && (
                        <a href={group.websiteUrl.startsWith('http') ? group.websiteUrl : `https://${group.websiteUrl}`} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-indigo-400">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </h2>
                    <p className="text-xs text-slate-400 font-mono">
                      {group.ads.length} Tracked Ad(s) • Sorted by Days Active
                    </p>
                  </div>
                </div>

                <div className="text-xs font-mono text-slate-500">
                  Top Active Winner: <span className="text-emerald-400 font-bold">{Math.max(...group.ads.map(a => a.days_active || 1))} Days</span>
                </div>
              </div>

              {/* Grid of Tracked Ads for this Competitor */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.ads.map((ad) => {
                  const isLongRunning = (ad.days_active || 1) >= 7;

                  return (
                    <div key={ad.id} className="bg-[#0A0A0C] border border-[#23232F] rounded-xl p-5 space-y-4 flex flex-col justify-between hover:border-indigo-500/30 transition-all">
                      <div className="space-y-3">
                        {/* Longevity Badge & Source */}
                        <div className="flex items-center justify-between font-mono text-xs">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border flex items-center gap-1.5 ${
                            isLongRunning 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                              : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                          }`}>
                            <Clock className="w-3 h-3" />
                            {ad.days_active || 1} DAYS ACTIVE
                          </span>

                          <span className="text-[10px] text-slate-500 uppercase">
                            {ad.source === 'meta_ad_library' ? 'Meta Ads' : 'LinkedIn Ads'}
                          </span>
                        </div>

                        {/* Creative Image / Thumbnail */}
                        {ad.creative_image_url ? (
                          <div className="rounded-lg overflow-hidden border border-[#23232F] h-40 bg-[#121216] relative group">
                            <img src={ad.creative_image_url} alt="Ad Creative" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                        ) : (
                          <div className="rounded-lg border border-[#23232F] h-28 bg-[#121216] flex items-center justify-center text-slate-600 font-mono text-xs">
                            No Visual Creative Thumbnail
                          </div>
                        )}

                        {/* Ad Copy */}
                        <div className="space-y-1">
                          <div className="text-[10px] font-mono uppercase text-slate-500">Ad Copy Hook:</div>
                          <p className="text-xs text-slate-200 line-clamp-3 leading-relaxed italic">
                            "{ad.ad_copy_text}"
                          </p>
                        </div>

                        {/* AI Analysis (Inference) */}
                        <div className="bg-[#121216] border border-[#23232F] p-3 rounded-lg space-y-1.5 font-mono text-xs">
                          <div className="flex items-center justify-between text-[10px] text-indigo-400 font-semibold">
                            <span className="flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-indigo-400" />
                              AI Analysis (Inference)
                            </span>
                            {!isLongRunning && (
                              <span className="text-amber-400 text-[9px] bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                Too New (&lt;7 days)
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            {ad.ai_analysis || `Ad has run for ${ad.days_active || 1} day(s). Full multimodal conversion hypothesis will unlock after 7 days active.`}
                          </p>
                        </div>
                      </div>

                      {/* Convert to Converge Post Button */}
                      <button
                        onClick={() => handleSuggestIdea(ad.id)}
                        className="w-full bg-indigo-600/15 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 px-3 py-2 rounded-lg font-mono text-xs font-semibold transition-all flex items-center justify-center gap-2 mt-2"
                      >
                        <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                        <span>Suggest Post Idea from Ad</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-slate-500 font-mono text-xs space-y-3 bg-[#121216] border border-[#23232F] rounded-2xl">
          <Eye className="w-8 h-8 text-indigo-400 mx-auto" />
          <div>No competitor ads indexed yet.</div>
          <p className="text-[11px] text-slate-600 max-w-md mx-auto">
            Click "Run Ad Tracker Now" to crawl public Meta & LinkedIn Ad Libraries for your competitors.
          </p>
        </div>
      )}
    </div>
  );
}
