import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Sparkles, 
  Globe, 
  ExternalLink, 
  Plus, 
  CheckCircle2, 
  ShieldAlert, 
  Video, 
  Code, 
  Star, 
  Building2, 
  MapPin, 
  Search,
  Filter,
  Check,
  Send,
  UserCheck,
  Phone,
  Mail
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : '';

export default function CompetitorResearch({ setActiveTab }) {
  const [activeSubTab, setActiveSubTab] = useState('competitors'); // 'competitors', 'web_leads', 'aradhya_leads'
  
  // Competitors State
  const [competitors, setCompetitors] = useState([]);
  const [loadingCompetitors, setLoadingCompetitors] = useState(true);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualComp, setManualComp] = useState({ name: '', website_url: '', industry_tag: 'Web Dev & AI', notes: '' });
  const [suggestingId, setSuggestingId] = useState(null);
  const [suggestedSuccessId, setSuggestedSuccessId] = useState(null);

  // Web Dev Leads State (Tab 2)
  const [webLeads, setWebLeads] = useState([]);
  const [loadingWebLeads, setLoadingWebLeads] = useState(false);
  const [activeNicheWeb, setActiveNicheWeb] = useState('Dental Clinics');
  const [activeCityWeb, setActiveCityWeb] = useState('Dubai, UAE');

  // Aradhya Video Leads State (Tab 3)
  const [aradhyaLeads, setAradhyaLeads] = useState([]);
  const [loadingAradhyaLeads, setLoadingAradhyaLeads] = useState(false);
  const [activeNicheAradhya, setActiveNicheAradhya] = useState('D2C Skincare & Beauty');

  const [generatingPitchId, setGeneratingPitchId] = useState(null);
  const [pitchSuccessId, setPitchSuccessId] = useState(null);

  // Live Gemini Grounding Search State (Prompt 8)
  const [discoveringLive, setDiscoveringLive] = useState(false);
  const [discoverMessage, setDiscoverMessage] = useState(null);

  const handleDiscoverLiveCompetitors = async () => {
    setDiscoveringLive(true);
    setDiscoverMessage(null);
    try {
      const res = await fetch(`${API_BASE}/api/competitors/discover-live`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setDiscoverMessage(data.message);
        if (data.discovered && data.discovered.length > 0) {
          setCompetitors(prev => [...data.discovered, ...prev]);
        } else {
          fetchCompetitors();
        }
        setTimeout(() => setDiscoverMessage(null), 5000);
      }
    } catch (err) {
      console.error('Failed to discover competitors:', err);
    } finally {
      setDiscoveringLive(false);
    }
  };

  const handleDiscoverLiveLeads = async (leadType, niche, location) => {
    setDiscoveringLive(true);
    setDiscoverMessage(null);
    try {
      const res = await fetch(`${API_BASE}/api/leads/discover-live`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadType, niche, location })
      });
      const data = await res.json();
      if (data.success) {
        setDiscoverMessage(data.message);
        if (data.discovered && data.discovered.length > 0) {
          if (leadType === 'aradhya_video') setAradhyaLeads(prev => [...data.discovered, ...prev]);
          if (leadType === 'web_dev') setWebLeads(prev => [...data.discovered, ...prev]);
        } else {
          fetchLeads(leadType);
        }
        setTimeout(() => setDiscoverMessage(null), 5000);
      }
    } catch (err) {
      console.error('Failed to discover leads:', err);
    } finally {
      setDiscoveringLive(false);
    }
  };

  useEffect(() => {
    fetchCompetitors();
  }, []);

  useEffect(() => {
    if (activeSubTab === 'web_leads') fetchLeads('web_dev');
    if (activeSubTab === 'aradhya_leads') fetchLeads('aradhya_video');
  }, [activeSubTab]);

  const fetchCompetitors = async () => {
    setLoadingCompetitors(true);
    try {
      const res = await fetch(`${API_BASE}/api/competitors`);
      const data = await res.json();
      if (data.success) setCompetitors(data.competitors || []);
    } catch (err) {
      console.error('Failed to fetch competitors:', err);
    } finally {
      setLoadingCompetitors(false);
    }
  };

  const fetchLeads = async (leadType) => {
    if (leadType === 'web_dev') setLoadingWebLeads(true);
    if (leadType === 'aradhya_video') setLoadingAradhyaLeads(true);
    try {
      const res = await fetch(`${API_BASE}/api/leads?lead_type=${leadType}`);
      const data = await res.json();
      if (data.success) {
        if (leadType === 'web_dev') setWebLeads(data.leads || []);
        if (leadType === 'aradhya_video') setAradhyaLeads(data.leads || []);
      }
    } catch (err) {
      console.error(`Failed to fetch ${leadType} leads:`, err);
    } finally {
      setLoadingWebLeads(false);
      setLoadingAradhyaLeads(false);
    }
  };

  const handleToggleActive = async (id, currentActive) => {
    const nextActive = currentActive === false ? true : false;
    try {
      setCompetitors(prev => prev.map(c => c.id === id ? { ...c, active: nextActive } : c));
      await fetch(`${API_BASE}/api/competitors/${id}/toggle-active`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: nextActive }),
      });
    } catch (err) {
      console.error('Failed to toggle active status:', err);
    }
  };

  const handleSuggestIdea = async (compName, contentNotes, researchId) => {
    setSuggestingId(researchId);
    try {
      const res = await fetch(`${API_BASE}/api/competitors/suggest-idea`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitorName: compName, contentNotes, researchId }),
      });
      const data = await res.json();
      if (data.success) {
        setSuggestedSuccessId(researchId);
        setTimeout(() => setSuggestedSuccessId(null), 3000);
      }
    } catch (err) {
      console.error('Failed to suggest idea:', err);
    } finally {
      setSuggestingId(null);
    }
  };

  const handleGenerateLeadPitch = async (lead) => {
    setGeneratingPitchId(lead.id);
    try {
      const res = await fetch(`${API_BASE}/api/leads/generate-pitch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: lead.business_name,
          niche: lead.niche,
          qualificationReason: lead.qualification_reason,
          leadType: lead.lead_type
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPitchSuccessId(lead.id);
        setTimeout(() => setPitchSuccessId(null), 3000);
      }
    } catch (err) {
      console.error('Failed to generate lead pitch:', err);
    } finally {
      setGeneratingPitchId(null);
    }
  };

  const handleAddManualCompetitor = async (e) => {
    e.preventDefault();
    if (!manualComp.name.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/api/competitors/manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manualComp),
      });
      const data = await res.json();
      if (data.success) {
        fetchCompetitors();
        setShowManualForm(false);
        setManualComp({ name: '', website_url: '', industry_tag: 'Web Dev & AI', notes: '' });
      }
    } catch (err) {
      console.error('Failed to add competitor manually:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Sub-tab Navigation */}
      <div className="bg-[#121216] border border-[#23232F] rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-rose-400">AUTONOMOUS INTELLIGENCE ENGINE</span>
              <span className="text-xs text-gray-600">•</span>
              <span className="text-xs font-mono text-gray-400">Gemini 3.5 Flash Grounding & Public Ad Libraries</span>
            </div>
            <h1 className="text-xl font-bold font-heading text-white">Competitor & Lead Intelligence</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (activeSubTab === 'competitors') handleDiscoverLiveCompetitors();
                if (activeSubTab === 'web_leads') handleDiscoverLiveLeads('web_dev', activeNicheWeb, activeCityWeb);
                if (activeSubTab === 'aradhya_leads') handleDiscoverLiveLeads('aradhya_video', activeNicheAradhya, 'USA');
              }}
              disabled={discoveringLive}
              className="text-xs font-medium px-4 py-2 rounded-xl transition-all flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20"
            >
              <Sparkles className={`w-3.5 h-3.5 ${discoveringLive ? 'animate-spin' : ''}`} />
              <span>{discoveringLive ? 'Gemini 3.5 Searching Live Web...' : '⚡ Discover Real Competitors & Leads Now'}</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-gray-400 bg-[#0A0A0C] border border-[#23232F] px-3.5 py-2 rounded-xl">
              <Search className="w-3.5 h-3.5 text-indigo-400" />
              <span>Limit: 5 Competitors / 10 Leads</span>
            </div>
          </div>
        </div>

        {discoverMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl p-3 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{discoverMessage}</span>
          </div>
        )}

        {/* 3 Sub-tab Switchers */}
        <div className="flex items-center gap-2 pt-2 border-t border-[#23232F] overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('competitors')}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
              activeSubTab === 'competitors'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-lg shadow-rose-500/10'
                : 'bg-[#0A0A0C] text-gray-400 hover:text-white border border-[#23232F]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>1. Competitor Ad Libraries</span>
          </button>

          <button
            onClick={() => setActiveSubTab('web_leads')}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
              activeSubTab === 'web_leads'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-lg shadow-indigo-500/10'
                : 'bg-[#0A0A0C] text-gray-400 hover:text-white border border-[#23232F]'
            }`}
          >
            <Code className="w-3.5 h-3.5 text-indigo-400" />
            <span>2. Web Dev & Branding Leads</span>
          </button>

          <button
            onClick={() => setActiveSubTab('aradhya_leads')}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
              activeSubTab === 'aradhya_leads'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-500/10'
                : 'bg-[#0A0A0C] text-gray-400 hover:text-white border border-[#23232F]'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-purple-400" />
            <span>3. Aradhya AI Video Leads (Visual/D2C Only)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: COMPETITOR AD LIBRARIES */}
      {activeSubTab === 'competitors' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold font-heading text-white">Discovered Competitor Agencies</h3>
              <p className="text-xs text-gray-400 font-mono">
                Pulls active ad campaign notes from Meta Ad Library, LinkedIn Ad Library, and Google Ads Transparency
              </p>
            </div>

            <button
              onClick={() => setShowManualForm(!showManualForm)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-mono bg-[#121216] border border-[#23232F] px-3.5 py-2 rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Manual Add Fallback</span>
            </button>
          </div>

          {/* Manual Competitor Form Modal */}
          {showManualForm && (
            <form onSubmit={handleAddManualCompetitor} className="bg-[#121216] border border-[#23232F] rounded-2xl p-5 space-y-4">
              <h4 className="text-sm font-bold font-heading text-white">Add Competitor Agency Manually</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Agency Name (e.g. Nexus Digital)"
                  value={manualComp.name}
                  onChange={(e) => setManualComp({ ...manualComp, name: e.target.value })}
                  className="bg-[#0A0A0C] border border-[#23232F] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  required
                />
                <input
                  type="url"
                  placeholder="Website URL (https://...)"
                  value={manualComp.website_url}
                  onChange={(e) => setManualComp({ ...manualComp, website_url: e.target.value })}
                  className="bg-[#0A0A0C] border border-[#23232F] rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
                <input
                  type="text"
                  placeholder="Industry Tag (e.g. Web Dev & AI)"
                  value={manualComp.industry_tag}
                  onChange={(e) => setManualComp({ ...manualComp, industry_tag: e.target.value })}
                  className="bg-[#0A0A0C] border border-[#23232F] rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowManualForm(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-gray-400 bg-[#0A0A0C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500"
                >
                  Add Competitor
                </button>
              </div>
            </form>
          )}

          {loadingCompetitors ? (
            <div className="p-8 text-center bg-[#121216] border border-[#23232F] rounded-2xl text-xs font-mono text-gray-500">
              Loading discovered competitor agencies...
            </div>
          ) : competitors.length === 0 ? (
            <div className="p-8 text-center bg-[#121216] border border-[#23232F] rounded-2xl space-y-3">
              <Eye className="w-8 h-8 text-rose-400 mx-auto opacity-60" />
              <p className="text-sm font-bold text-white">No Competitors Crawled Yet</p>
              <p className="text-xs text-gray-400 max-w-sm mx-auto font-mono">
                Click "⚡ Discover Real Competitors & Leads Now" above to crawl live agencies via Gemini Google Search!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {competitors.map((comp) => {
                const isActive = comp.active !== false;

                return (
                  <div
                    key={comp.id || comp.name}
                    className={`bg-[#121216] border rounded-2xl p-6 space-y-4 transition-all ${
                      isActive ? 'border-[#23232F]' : 'border-gray-800 opacity-60'
                    }`}
                  >
                    {/* Competitor Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#23232F] pb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h4 className="text-base font-bold font-heading text-white">{comp.name}</h4>
                          <span className="px-2.5 py-0.5 text-[10px] font-mono rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            {comp.industry_tag || 'Digital Marketing'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 font-mono">{comp.notes}</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {comp.website_url && (
                          <a
                            href={comp.website_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-indigo-400 hover:text-indigo-300 font-mono flex items-center gap-1 bg-[#0A0A0C] border border-[#23232F] px-3 py-1.5 rounded-xl"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Site
                          </a>
                        )}
                        
                        <button
                          onClick={() => handleToggleActive(comp.id, isActive)}
                          className={`text-xs font-mono px-3 py-1.5 rounded-xl border transition-all ${
                            isActive
                              ? 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
                              : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
                          }`}
                        >
                          {isActive ? 'Active' : 'Ignored'}
                        </button>
                      </div>
                    </div>

                    {/* Ad Library Entries */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">
                        Active Ad Transparency Findings:
                      </span>

                      {!comp.competitor_research || comp.competitor_research.length === 0 ? (
                        <p className="text-xs text-gray-500 font-mono italic">No active ad campaigns detected today.</p>
                      ) : (
                        comp.competitor_research.map((res) => {
                          const isSuggesting = suggestingId === res.id;
                          const isSuggested = suggestedSuccessId === res.id;

                          return (
                            <div
                              key={res.id || res.content_notes}
                              className="bg-[#0A0A0C] border border-[#23232F] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                              <div className="space-y-1 max-w-2xl">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                    {(res.source || 'meta_ad_library').replace('_', ' ')}
                                  </span>
                                  <span className="text-[10px] text-gray-500 font-mono">
                                    Detected: {res.date_added ? new Date(res.date_added).toLocaleDateString() : 'Today'}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-300 font-sans leading-relaxed">
                                  "{res.content_notes}"
                                </p>
                              </div>

                              <button
                                onClick={() => handleSuggestIdea(comp.name, res.content_notes, res.id)}
                                disabled={isSuggesting}
                                className={`shrink-0 text-xs font-medium px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                                  isSuggested
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                                }`}
                              >
                                {isSuggested ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Saved to Idea Bank!</span>
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>{isSuggesting ? 'Analyzing...' : 'Suggest Converge Post Idea'}</span>
                                  </>
                                )}
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: WEB DEV & BRANDING LEADS */}
      {activeSubTab === 'web_leads' && (
        <div className="space-y-6">
          {/* Niche & Location Selector Bar */}
          <div className="bg-[#121216] border border-[#23232F] rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-mono text-indigo-400 uppercase">WEEKLY NICHE CRAWLER ROTATOR</span>
                <h3 className="text-base font-bold font-heading text-white">Active Niche Focus (7-Day Rotation)</h3>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-[#0A0A0C] border border-[#23232F] px-3 py-1.5 rounded-xl text-xs font-mono text-gray-300">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Target: {activeCityWeb}</span>
                </div>
              </div>
            </div>

            {/* Niche Selector Pills */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-[#23232F]">
              {['Dental Clinics', 'Law Firms', 'Real Estate Agencies', 'Restaurants & Hospitality', 'Medical Practices'].map((niche) => (
                <button
                  key={niche}
                  onClick={() => setActiveNicheWeb(niche)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all ${
                    activeNicheWeb === niche
                      ? 'bg-indigo-600 text-white font-bold shadow-md'
                      : 'bg-[#0A0A0C] text-gray-400 hover:text-white border border-[#23232F]'
                  }`}
                >
                  {niche}
                </button>
              ))}
            </div>
          </div>

          {/* Qualified Web Dev Lead Cards */}
          {loadingWebLeads ? (
            <div className="p-8 text-center text-xs font-mono text-gray-500">Crawling Google listings & website speed metrics...</div>
          ) : webLeads.length === 0 ? (
            <div className="p-8 text-center bg-[#121216] border border-[#23232F] rounded-2xl space-y-3">
              <Code className="w-8 h-8 text-indigo-400 mx-auto opacity-60" />
              <p className="text-sm font-bold text-white">No Web Dev Leads Crawled Yet</p>
              <p className="text-xs text-gray-400 max-w-sm mx-auto font-mono">
                Click "⚡ Discover Real Competitors & Leads Now" above to crawl Google listings for target business leads!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {webLeads.map((lead) => {
                const isGenerating = generatingPitchId === lead.id;
                const isPitchSaved = pitchSuccessId === lead.id;
                const mapUrl = lead.google_map_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.business_name + ' ' + lead.city_state)}`;

                return (
                  <div
                    key={lead.id}
                    className="bg-[#121216] border border-[#23232F] rounded-2xl p-5 space-y-4 hover:border-indigo-500/40 transition-all"
                  >
                    <div className="flex items-center justify-between border-b border-[#23232F] pb-3">
                      <div>
                        <h4 className="text-base font-bold font-heading text-white">{lead.business_name}</h4>
                        <p className="text-xs text-gray-400 font-mono">{lead.niche} • {lead.city_state}</p>
                      </div>

                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{lead.rating} Stars</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-mono uppercase text-gray-500">Qualification Filters Triggered:</span>
                      <p className="text-xs text-gray-300 font-sans leading-relaxed bg-[#0A0A0C] border border-[#23232F] rounded-xl p-3">
                        ⚠️ {lead.qualification_reason}
                      </p>
                    </div>

                    {/* Verification & Contact Bar */}
                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-gray-400 pt-1 border-t border-[#23232F]/50">
                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-rose-400 hover:underline flex items-center gap-1 bg-[#0A0A0C] border border-[#23232F] px-2.5 py-1 rounded-lg"
                      >
                        <MapPin className="w-3.5 h-3.5 text-rose-400" /> View on Google Maps
                      </a>

                      {lead.phone_number && (
                        <a href={`tel:${lead.phone_number}`} className="text-emerald-400 hover:underline flex items-center gap-1">
                          <Phone className="w-3 h-3 text-emerald-400" /> {lead.phone_number}
                        </a>
                      )}

                      {lead.email && (
                        <a href={`mailto:${lead.email}`} className="text-indigo-400 hover:underline flex items-center gap-1">
                          <Mail className="w-3 h-3 text-indigo-400" /> {lead.email}
                        </a>
                      )}
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      {lead.website_url ? (
                        <a
                          href={lead.website_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-mono flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Inspect Site
                        </a>
                      ) : (
                        <span className="text-xs text-rose-400 font-mono">⚠️ No Website Found</span>
                      )}

                      <button
                        onClick={() => handleGenerateLeadPitch(lead)}
                        disabled={isGenerating}
                        className={`text-xs font-medium px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                          isPitchSaved
                            ? 'bg-emerald-600 text-white'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                        }`}
                      >
                        {isPitchSaved ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Pitch Saved to Idea Bank!</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{isGenerating ? 'Generating...' : 'Generate Web Dev Pitch'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ARADHYA AI VIDEO LEADS */}
      {activeSubTab === 'aradhya_leads' && (
        <div className="space-y-6">
          {/* Niche Bar (Visual / D2C ONLY) */}
          <div className="bg-[#121216] border border-[#23232F] rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-mono text-purple-400 uppercase">HIGH-VISUAL & D2C NICHES ONLY</span>
                <h3 className="text-base font-bold font-heading text-white">Aradhya AI 4K Video Target Brands</h3>
              </div>

              <div className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono rounded-xl">
                ✨ Static Ad ➔ Video Ad Conversion
              </div>
            </div>

            {/* Visual Niches Selector */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-[#23232F]">
              {['D2C Skincare & Beauty', 'Luxury Real Estate', 'MedSpas & Aesthetics', 'High-Ticket SaaS', 'EdTech & Courses'].map((niche) => (
                <button
                  key={niche}
                  onClick={() => setActiveNicheAradhya(niche)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all ${
                    activeNicheAradhya === niche
                      ? 'bg-purple-600 text-white font-bold shadow-md'
                      : 'bg-[#0A0A0C] text-gray-400 hover:text-white border border-[#23232F]'
                  }`}
                >
                  {niche}
                </button>
              ))}
            </div>
          </div>

          {/* Qualified Aradhya Leads */}
          {loadingAradhyaLeads ? (
            <div className="p-8 text-center text-xs font-mono text-gray-500">Crawling Meta ad transparency for static-image ad brands...</div>
          ) : aradhyaLeads.length === 0 ? (
            <div className="p-8 text-center bg-[#121216] border border-[#23232F] rounded-2xl space-y-3">
              <Video className="w-8 h-8 text-purple-400 mx-auto opacity-60" />
              <p className="text-sm font-bold text-white">No Aradhya AI Video Leads Crawled Yet</p>
              <p className="text-xs text-gray-400 max-w-sm mx-auto font-mono">
                Click "⚡ Discover Real Competitors & Leads Now" above to crawl Meta Ad Library for visual brands running static image ads!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aradhyaLeads.map((lead) => {
                const isGenerating = generatingPitchId === lead.id;
                const isPitchSaved = pitchSuccessId === lead.id;
                const mapUrl = lead.google_map_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.business_name + ' ' + lead.city_state)}`;

                return (
                  <div
                    key={lead.id}
                    className="bg-[#121216] border border-[#23232F] rounded-2xl p-5 space-y-4 hover:border-purple-500/40 transition-all"
                  >
                    <div className="flex items-center justify-between border-b border-[#23232F] pb-3">
                      <div>
                        <h4 className="text-base font-bold font-heading text-white">{lead.business_name}</h4>
                        <p className="text-xs text-purple-400 font-mono">{lead.niche} • {lead.city_state}</p>
                      </div>

                      <span className="px-2.5 py-1 text-[10px] font-mono rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {lead.ad_status}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-mono uppercase text-gray-500">Aradhya AI Video Opportunity:</span>
                      <p className="text-xs text-gray-300 font-sans leading-relaxed bg-[#0A0A0C] border border-[#23232F] rounded-xl p-3">
                        🎬 {lead.qualification_reason}
                      </p>
                    </div>

                    {/* Verification & Contact Bar */}
                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-gray-400 pt-1 border-t border-[#23232F]/50">
                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-rose-400 hover:underline flex items-center gap-1 bg-[#0A0A0C] border border-[#23232F] px-2.5 py-1 rounded-lg"
                      >
                        <MapPin className="w-3.5 h-3.5 text-rose-400" /> View on Google Maps
                      </a>

                      {lead.phone_number && (
                        <a href={`tel:${lead.phone_number}`} className="text-emerald-400 hover:underline flex items-center gap-1">
                          <Phone className="w-3 h-3 text-emerald-400" /> {lead.phone_number}
                        </a>
                      )}

                      {lead.email && (
                        <a href={`mailto:${lead.email}`} className="text-indigo-400 hover:underline flex items-center gap-1">
                          <Mail className="w-3 h-3 text-indigo-400" /> {lead.email}
                        </a>
                      )}
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      {lead.website_url ? (
                        <a
                          href={lead.website_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-purple-400 hover:text-purple-300 font-mono flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Visit Brand Site
                        </a>
                      ) : (
                        <span className="text-xs text-rose-400 font-mono">⚠️ No Website Found</span>
                      )}

                      <button
                        onClick={() => handleGenerateLeadPitch(lead)}
                        disabled={isGenerating}
                        className={`text-xs font-medium px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                          isPitchSaved
                            ? 'bg-emerald-600 text-white'
                            : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md'
                        }`}
                      >
                        {isPitchSaved ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Script Saved to Idea Bank!</span>
                          </>
                        ) : (
                          <>
                            <Video className="w-3.5 h-3.5" />
                            <span>{isGenerating ? 'Writing Script...' : 'Generate 4K Aradhya Video Script'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
