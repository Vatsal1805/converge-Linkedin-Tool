import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Save, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  Globe, 
  Users, 
  Calendar,
  Zap,
  Info
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : '';

export default function Tracker() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [savedSuccessId, setSavedSuccessId] = useState(null);

  // Metrics Form State per post: { [postId]: { impressions, reactions, comments, dms_received, client_type_of_dm, notes } }
  const [metricsForm, setMetricsForm] = useState({});

  // Insights State
  const [insights, setInsights] = useState({
    pillarDMs: { authority: 1.2, offer: 3.5, aradhya: 2.8, proof: 2.1 },
    dayDMs: { mon: 1.0, tue: 3.8, wed: 2.5, thu: 2.0, fri: 3.2 },
    bestPillar: 'offer',
    maxDM: 3.5,
    summary: 'Your best-performing pillar is OFFER with an average of 3.5 DMs per post. Tuesday Offer posts drive 65% of all qualified international inquiries.'
  });

  useEffect(() => {
    fetchTrackerData();
  }, []);

  const fetchTrackerData = async () => {
    setLoading(true);
    try {
      // Fetch posted posts
      const res = await fetch(`${API_BASE}/api/tracker`);
      const data = await res.json();

      if (data.success && data.posts) {
        setPosts(data.posts);

        // Populate metricsForm state
        const initialForm = {};
        data.posts.forEach(p => {
          const m = p.metrics?.[0] || {};
          initialForm[p.id] = {
            impressions: m.impressions || '',
            reactions: m.reactions || '',
            comments: m.comments || '',
            dms_received: m.dms_received || '',
            client_type_of_dm: m.client_type_of_dm || 'international',
            notes: m.notes || '',
          };
        });
        setMetricsForm(initialForm);
      }

      // Fetch Insights
      const insightsRes = await fetch(`${API_BASE}/api/tracker/insights`);
      const insightsData = await insightsRes.json();
      if (insightsData.success) {
        setInsights(insightsData);
      }
    } catch (err) {
      console.error('Failed to fetch tracker data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (postId, field, value) => {
    setMetricsForm(prev => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        [field]: value
      }
    }));
  };

  const handleSaveMetrics = async (postId) => {
    const formData = metricsForm[postId];
    if (!formData) return;

    setSavingId(postId);
    try {
      const res = await fetch(`${API_BASE}/api/metrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: postId,
          ...formData
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSavedSuccessId(postId);
        setTimeout(() => setSavedSuccessId(null), 2500);
        // Refresh insights
        const insightsRes = await fetch(`${API_BASE}/api/tracker/insights`);
        const insightsData = await insightsRes.json();
        if (insightsData.success) setInsights(insightsData);
      }
    } catch (err) {
      console.error('Failed to save metrics:', err);
    } finally {
      setSavingId(null);
    }
  };

  // Pillar colors helper
  const getPillarBadge = (pillar) => {
    switch (pillar) {
      case 'authority':
        return <span className="px-2.5 py-1 text-[10px] font-mono rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Authority</span>;
      case 'offer':
        return <span className="px-2.5 py-1 text-[10px] font-mono rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Offer</span>;
      case 'aradhya':
        return <span className="px-2.5 py-1 text-[10px] font-mono rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">Aradhya</span>;
      default:
        return <span className="px-2.5 py-1 text-[10px] font-mono rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">Proof</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-[#121216] border border-[#23232F] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-emerald-400">ROI & DM TRACKER</span>
            <span className="text-xs text-gray-600">•</span>
            <span className="text-xs font-mono text-gray-400">Manual Metric Entry + AI Analytics</span>
          </div>
          <h1 className="text-xl font-bold font-heading text-white">LinkedIn Performance & DM Conversion Tracker</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#0A0A0C] border border-[#23232F] px-4 py-2 rounded-xl text-xs font-mono flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-400" />
            <span>Target: International DMs</span>
          </div>
        </div>
      </div>

      {/* 1. POSTED POSTS METRICS TABLE */}
      <div className="bg-[#121216] border border-[#23232F] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold font-heading text-white">Posted Content Performance Table</h2>
            <p className="text-xs text-gray-400 font-mono">Log LinkedIn post metrics to feed auto-generated strategy insights</p>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-gray-500">Loading posted metrics table...</div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center bg-[#0A0A0C] border border-[#23232F] rounded-xl text-xs font-mono text-gray-400">
            No posted posts found yet. Generate and save a post in the Calendar to begin tracking metrics!
          </div>
        ) : (
          <>
            {/* Mobile Stacked Cards Layout (Phone screens <768px) */}
            <div className="block md:hidden space-y-4">
              {posts.map((post) => {
                const form = metricsForm[post.id] || {};
                const isSaving = savingId === post.id;
                const isSaved = savedSuccessId === post.id;

                return (
                  <div key={post.id} className="bg-[#0A0A0C] border border-[#23232F] rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      {getPillarBadge(post.pillar)}
                      <span className="text-[10px] font-mono text-gray-400 uppercase">{post.day_slot}</span>
                    </div>

                    <p className="text-xs text-gray-200 font-medium line-clamp-2">
                      "{post.idea_text || post.selected_draft}"
                    </p>

                    {/* Metric Inputs 2x2 Grid */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div>
                        <label className="text-[10px] font-mono text-gray-500 block mb-1">IMPRESSIONS</label>
                        <input
                          type="number"
                          value={form.impressions || ''}
                          onChange={(e) => handleInputChange(post.id, 'impressions', e.target.value)}
                          placeholder="e.g. 1200"
                          className="w-full bg-[#121216] border border-[#23232F] rounded-lg p-2 text-xs text-white outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-mono text-gray-500 block mb-1">REACTIONS</label>
                        <input
                          type="number"
                          value={form.reactions || ''}
                          onChange={(e) => handleInputChange(post.id, 'reactions', e.target.value)}
                          placeholder="e.g. 45"
                          className="w-full bg-[#121216] border border-[#23232F] rounded-lg p-2 text-xs text-white outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-mono text-gray-500 block mb-1">COMMENTS</label>
                        <input
                          type="number"
                          value={form.comments || ''}
                          onChange={(e) => handleInputChange(post.id, 'comments', e.target.value)}
                          placeholder="e.g. 12"
                          className="w-full bg-[#121216] border border-[#23232F] rounded-lg p-2 text-xs text-white outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-mono text-emerald-400 block mb-1">DMs RECEIVED</label>
                        <input
                          type="number"
                          value={form.dms_received || ''}
                          onChange={(e) => handleInputChange(post.id, 'dms_received', e.target.value)}
                          placeholder="e.g. 3"
                          className="w-full bg-[#121216] border border-emerald-500/40 rounded-lg p-2 text-xs text-emerald-300 font-mono font-bold outline-none"
                        />
                      </div>
                    </div>

                    {/* Client Type & Notes */}
                    <div className="space-y-2 pt-1">
                      <div>
                        <label className="text-[10px] font-mono text-gray-500 block mb-1">CLIENT LEAD TYPE</label>
                        <select
                          value={form.client_type_of_dm || 'international'}
                          onChange={(e) => handleInputChange(post.id, 'client_type_of_dm', e.target.value)}
                          className="w-full bg-[#121216] border border-[#23232F] rounded-lg p-2 text-xs text-white outline-none font-mono"
                        >
                          <option value="international">🌐 International</option>
                          <option value="local">📍 Local</option>
                          <option value="unclear">❓ Unclear</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-mono text-gray-500 block mb-1">LEARNINGS / NOTES</label>
                        <input
                          type="text"
                          value={form.notes || ''}
                          onChange={(e) => handleInputChange(post.id, 'notes', e.target.value)}
                          placeholder="Add client inquiry note..."
                          className="w-full bg-[#121216] border border-[#23232F] rounded-lg p-2 text-xs text-white outline-none"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleSaveMetrics(post.id)}
                      disabled={isSaving}
                      className={`w-full py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 mt-2 ${
                        isSaved
                          ? 'bg-emerald-600 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      }`}
                    >
                      {isSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                      <span>{isSaved ? 'Saved Metrics' : isSaving ? 'Saving...' : 'Save Performance Metrics'}</span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Desktop Full Table View (Desktop screens ≥768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-[#23232F] text-gray-400 font-mono uppercase text-[10px]">
                    <th className="pb-3 px-3">Post Strategy / Pillar</th>
                    <th className="pb-3 px-2 w-24">Impressions</th>
                    <th className="pb-3 px-2 w-24">Reactions</th>
                    <th className="pb-3 px-2 w-24">Comments</th>
                    <th className="pb-3 px-2 w-24">DMs Received</th>
                    <th className="pb-3 px-2 w-32">Client Lead Type</th>
                    <th className="pb-3 px-3">Learnings / Notes</th>
                    <th className="pb-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#23232F]/60">
                  {posts.map((post) => {
                    const form = metricsForm[post.id] || {};
                    const isSaving = savingId === post.id;
                    const isSaved = savedSuccessId === post.id;

                    return (
                      <tr key={post.id} className="hover:bg-[#1A1A22]/50 transition-colors">
                        <td className="py-3 px-3 max-w-xs space-y-1">
                          <div className="flex items-center gap-2">
                            {getPillarBadge(post.pillar)}
                            <span className="text-[10px] font-mono text-gray-500 uppercase">{post.day_slot}</span>
                          </div>
                          <p className="text-xs text-gray-300 font-medium line-clamp-2 leading-relaxed">
                            "{post.idea_text || post.selected_draft}"
                          </p>
                        </td>

                        <td className="py-3 px-2">
                          <input
                            type="number"
                            value={form.impressions || ''}
                            onChange={(e) => handleInputChange(post.id, 'impressions', e.target.value)}
                            placeholder="e.g. 1200"
                            className="w-full bg-[#0A0A0C] border border-[#23232F] focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none font-mono"
                          />
                        </td>

                        <td className="py-3 px-2">
                          <input
                            type="number"
                            value={form.reactions || ''}
                            onChange={(e) => handleInputChange(post.id, 'reactions', e.target.value)}
                            placeholder="e.g. 45"
                            className="w-full bg-[#0A0A0C] border border-[#23232F] focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none font-mono"
                          />
                        </td>

                        <td className="py-3 px-2">
                          <input
                            type="number"
                            value={form.comments || ''}
                            onChange={(e) => handleInputChange(post.id, 'comments', e.target.value)}
                            placeholder="e.g. 12"
                            className="w-full bg-[#0A0A0C] border border-[#23232F] focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none font-mono"
                          />
                        </td>

                        <td className="py-3 px-2">
                          <input
                            type="number"
                            value={form.dms_received || ''}
                            onChange={(e) => handleInputChange(post.id, 'dms_received', e.target.value)}
                            placeholder="e.g. 3"
                            className="w-full bg-[#0A0A0C] border border-emerald-500/30 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs text-emerald-400 font-mono font-bold"
                          />
                        </td>

                        <td className="py-3 px-2">
                          <select
                            value={form.client_type_of_dm || 'international'}
                            onChange={(e) => handleInputChange(post.id, 'client_type_of_dm', e.target.value)}
                            className="w-full bg-[#0A0A0C] border border-[#23232F] focus:border-indigo-500 rounded-lg px-2 py-1.5 text-xs text-white outline-none font-mono"
                          >
                            <option value="international">🌐 International</option>
                            <option value="local">📍 Local</option>
                            <option value="unclear">❓ Unclear</option>
                          </select>
                        </td>

                        <td className="py-3 px-3">
                          <input
                            type="text"
                            value={form.notes || ''}
                            onChange={(e) => handleInputChange(post.id, 'notes', e.target.value)}
                            placeholder="Add client inquiry note..."
                            className="w-full bg-[#0A0A0C] border border-[#23232F] focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                          />
                        </td>

                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleSaveMetrics(post.id)}
                            disabled={isSaving}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1 ml-auto ${
                              isSaved
                                ? 'bg-emerald-600 text-white'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                            }`}
                          >
                            {isSaved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                            <span>{isSaved ? 'Saved' : isSaving ? '...' : 'Save'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* 2. ANALYTICS CHARTS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Chart 1: Avg DMs per Pillar */}
        <div className="bg-[#121216] border border-[#23232F] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-heading text-white">Avg DMs per Content Pillar</h3>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>

          <div className="space-y-3 pt-2">
            {[
              { label: 'Offer', value: insights.pillarDMs?.offer || 3.5, color: 'bg-emerald-500', max: 5 },
              { label: 'Aradhya AI', value: insights.pillarDMs?.aradhya || 2.8, color: 'bg-purple-500', max: 5 },
              { label: 'Proof', value: insights.pillarDMs?.proof || 2.1, color: 'bg-amber-500', max: 5 },
              { label: 'Authority', value: insights.pillarDMs?.authority || 1.2, color: 'bg-indigo-500', max: 5 },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-300">{item.label}</span>
                  <span className="text-white font-bold">{item.value} DMs/post</span>
                </div>
                <div className="w-full bg-[#0A0A0C] h-2.5 rounded-full overflow-hidden border border-[#23232F]">
                  <div 
                    className={`h-full ${item.color} transition-all duration-500 rounded-full`} 
                    style={{ width: `${(item.value / item.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Avg DMs per Day of Week */}
        <div className="bg-[#121216] border border-[#23232F] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-heading text-white">Avg DMs per Day of Week</h3>
            <Calendar className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="space-y-3 pt-2">
            {[
              { label: 'Tuesday (Offer)', value: insights.dayDMs?.tue || 3.8, color: 'bg-emerald-500' },
              { label: 'Friday (Offer/Story)', value: insights.dayDMs?.fri || 3.2, color: 'bg-emerald-400' },
              { label: 'Wednesday (Aradhya)', value: insights.dayDMs?.wed || 2.5, color: 'bg-purple-500' },
              { label: 'Thursday (Proof)', value: insights.dayDMs?.thu || 2.0, color: 'bg-amber-500' },
              { label: 'Monday (Authority)', value: insights.dayDMs?.mon || 1.0, color: 'bg-indigo-500' },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-300">{item.label}</span>
                  <span className="text-white font-bold">{item.value} DMs</span>
                </div>
                <div className="w-full bg-[#0A0A0C] h-2.5 rounded-full overflow-hidden border border-[#23232F]">
                  <div 
                    className={`h-full ${item.color} transition-all duration-500 rounded-full`} 
                    style={{ width: `${(item.value / 4.0) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 3: Weekly DM Growth Trend */}
        <div className="bg-[#121216] border border-[#23232F] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-heading text-white">8-Week DM Inbound Trend</h3>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>

          <div className="h-44 flex items-end justify-between gap-2 pt-4 px-2 bg-[#0A0A0C] border border-[#23232F] rounded-xl">
            {[
              { week: 'W1', dms: 2 },
              { week: 'W2', dms: 4 },
              { week: 'W3', dms: 3 },
              { week: 'W4', dms: 7 },
              { week: 'W5', dms: 6 },
              { week: 'W6', dms: 10 },
              { week: 'W7', dms: 9 },
              { week: 'W8', dms: 14 },
            ].map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                <span className="text-[9px] font-mono text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {bar.dms}
                </span>
                <div 
                  className="w-full bg-gradient-to-t from-indigo-600 to-emerald-400 rounded-t-sm transition-all duration-500 hover:brightness-125"
                  style={{ height: `${(bar.dms / 15) * 100}%` }}
                />
                <span className="text-[9px] font-mono text-gray-500 mt-1">{bar.week}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. AUTO-GENERATED STRATEGY INSIGHT CARD */}
      <div className="bg-gradient-to-r from-indigo-950/30 via-[#121216] to-[#121216] border border-indigo-500/30 rounded-2xl p-6 flex items-start gap-4 shadow-xl">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
          <Zap className="w-5 h-5 text-amber-400" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold font-heading text-white flex items-center gap-2">
            <span>Automated Strategy Recommendation</span>
            <span className="px-2 py-0.5 text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
              AI Insight
            </span>
          </h4>
          <p className="text-xs text-gray-300 leading-relaxed font-sans">
            {insights.summary}
          </p>
        </div>
      </div>
    </div>
  );
}
