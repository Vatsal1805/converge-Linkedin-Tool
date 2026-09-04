import React, { useState, useEffect, useRef } from 'react';
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
  Mail,
  X,
  FileSpreadsheet
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : '';

// Global World Cities Preset for Autocomplete
const VERIFIED_LOCATIONS = [
  'Dubai, UAE',
  'Delhi, India',
  'Mumbai, India',
  'Bengaluru, India',
  'Miami, FL, USA',
  'London, UK',
  'Los Angeles, CA, USA',
  'Austin, TX, USA',
  'New York, NY, USA',
  'Chicago, IL, USA',
  'San Francisco, CA, USA',
  'Toronto, Canada',
  'Sydney, Australia',
  'Melbourne, Australia',
  'Singapore',
  'Tokyo, Japan',
  'Paris, France',
  'Berlin, Germany'
];

export default function CompetitorResearch({ setActiveTab }) {
  const [activeSubTab, setActiveSubTab] = useState('competitors'); // 'competitors', 'web_leads', 'aradhya_leads'
  
  // Competitors State (Tab 1)
  const [competitors, setCompetitors] = useState([]);
  const [loadingCompetitors, setLoadingCompetitors] = useState(true);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualComp, setManualComp] = useState({ name: '', website_url: '', industry_tag: 'Web Dev & AI', notes: '' });
  const [suggestingId, setSuggestingId] = useState(null);
  const [suggestedSuccessId, setSuggestedSuccessId] = useState(null);

  // Web Dev Leads State (Tab 2)
  const [webLeads, setWebLeads] = useState([]);
  const [loadingWebLeads, setLoadingWebLeads] = useState(false);

  // Aradhya Video Leads State (Tab 3)
  const [aradhyaLeads, setAradhyaLeads] = useState([]);
  const [loadingAradhyaLeads, setLoadingAradhyaLeads] = useState(false);

  const [generatingPitchId, setGeneratingPitchId] = useState(null);
  const [pitchSuccessId, setPitchSuccessId] = useState(null);

  // Live Discovery State
  const [discoveringLive, setDiscoveringLive] = useState(false);
  const [discoverMessage, setDiscoverMessage] = useState(null);

  // DYNAMIC LOCATION STATE PER SUB-TAB
  const [cityCompetitors, setCityCompetitors] = useState('Dubai, UAE');
  const [cityWeb, setCityWeb] = useState('Dubai, UAE');
  const [cityAradhya, setCityAradhya] = useState('Dubai, UAE');

  // Autocomplete UI State
  const [locationInput, setLocationInput] = useState('Dubai, UAE');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef(null);

  // DYNAMIC DEDICATED CATEGORIES STATE PER SUB-TAB
  const [catCompetitors, setCatCompetitors] = useState([]);
  const [catWeb, setCatWeb] = useState([]);
  const [catAradhya, setCatAradhya] = useState([]);
  const [activeNiche, setActiveNiche] = useState('');

  // Add Category inline input state
  const [showAddCatInput, setShowAddCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // PERSISTENCE ON MOUNT
  useEffect(() => {
    const savedLoc = localStorage.getItem('converge_selected_location');
    if (savedLoc) {
      setLocationInput(savedLoc);
      setCityCompetitors(savedLoc);
      setCityWeb(savedLoc);
      setCityAradhya(savedLoc);
    }
  }, []);

  // Sync active input location with current active subtab & restore niche
  useEffect(() => {
    const savedLoc = localStorage.getItem('converge_selected_location');
    if (savedLoc) {
      setLocationInput(savedLoc);
    } else {
      if (activeSubTab === 'competitors') setLocationInput(cityCompetitors);
      if (activeSubTab === 'web_leads') setLocationInput(cityWeb);
      if (activeSubTab === 'aradhya_leads') setLocationInput(cityAradhya);
    }

    const scope = activeSubTab === 'competitors' ? 'competitor_research' : activeSubTab === 'web_leads' ? 'web_dev' : 'aradhya';
    const savedNiche = localStorage.getItem(`converge_selected_niche_${scope}`);
    if (savedNiche) {
      setActiveNiche(savedNiche);
    } else {
      const list = activeSubTab === 'competitors' ? catCompetitors : activeSubTab === 'web_leads' ? catWeb : catAradhya;
      const active = list.find(c => c.is_active);
      if (active) setActiveNiche(active.category_name);
    }
  }, [activeSubTab, catCompetitors, catWeb, catAradhya]);

  // Handle Outside Click for Autocomplete Dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const STARTER_CATEGORIES = {
    competitor_research: [
      { id: 'c1', category_name: 'Digital Marketing Agencies', is_active: true },
      { id: 'c2', category_name: 'Web Development Agencies', is_active: false },
      { id: 'c3', category_name: 'Branding & Design Studios', is_active: false },
      { id: 'c4', category_name: 'AI/Automation Agencies', is_active: false },
      { id: 'c5', category_name: 'Social Media Management Agencies', is_active: false },
      { id: 'c6', category_name: 'SEO Agencies', is_active: false },
      { id: 'c7', category_name: 'Video Production Studios', is_active: false }
    ],
    web_dev: [
      { id: 'w1', category_name: 'Dental Clinics', is_active: true },
      { id: 'w2', category_name: 'Law Firms', is_active: false },
      { id: 'w3', category_name: 'Real Estate Agencies', is_active: false },
      { id: 'w4', category_name: 'Restaurants & Hospitality', is_active: false },
      { id: 'w5', category_name: 'Medical & Aesthetic Practices', is_active: false },
      { id: 'w6', category_name: 'Fitness Studios & Gyms', is_active: false },
      { id: 'w7', category_name: 'Accounting & Tax Firms', is_active: false }
    ],
    aradhya: [
      { id: 'a1', category_name: 'D2C Skincare & Beauty', is_active: true },
      { id: 'a2', category_name: 'Luxury Real Estate', is_active: false },
      { id: 'a3', category_name: 'MedSpas & Aesthetics', is_active: false },
      { id: 'a4', category_name: 'Fitness & Wellness Studios', is_active: false },
      { id: 'a5', category_name: 'Fashion & Apparel D2C', is_active: false },
      { id: 'a6', category_name: 'Jewelry Brands', is_active: false }
    ]
  };

  // Fetch Categories for dedicated scopes
  const fetchScopeCategories = async (scope) => {
    try {
      const res = await fetch(`${API_BASE}/api/settings/categories?scope=${scope}`);
      const data = await res.json();
      let list = (data.success && data.categories && data.categories.length > 0) ? data.categories : STARTER_CATEGORIES[scope];
      
      const savedNiche = localStorage.getItem(`converge_selected_niche_${scope}`);

      if (scope === 'competitor_research') {
        setCatCompetitors(list);
        if (savedNiche) setActiveNiche(savedNiche);
        else {
          const active = list.find(c => c.is_active);
          if (active && !activeNiche) setActiveNiche(active.category_name);
        }
      } else if (scope === 'web_dev') {
        setCatWeb(list);
        if (savedNiche) setActiveNiche(savedNiche);
        else {
          const active = list.find(c => c.is_active);
          if (active && !activeNiche) setActiveNiche(active.category_name);
        }
      } else if (scope === 'aradhya') {
        setCatAradhya(list);
        if (savedNiche) setActiveNiche(savedNiche);
        else {
          const active = list.find(c => c.is_active);
          if (active && !activeNiche) setActiveNiche(active.category_name);
        }
      }
    } catch (err) {
      console.warn(`Failed to load ${scope} categories:`, err);
      const fallbackList = STARTER_CATEGORIES[scope] || [];
      if (scope === 'competitor_research') setCatCompetitors(fallbackList);
      if (scope === 'web_dev') setCatWeb(fallbackList);
      if (scope === 'aradhya') setCatAradhya(fallbackList);
    }
  };

  useEffect(() => {
    fetchScopeCategories('competitor_research');
    fetchScopeCategories('web_dev');
    fetchScopeCategories('aradhya');
    fetchCompetitors();
  }, []);

  useEffect(() => {
    if (activeSubTab === 'web_leads') fetchLeads('web_dev');
    if (activeSubTab === 'aradhya_leads') fetchLeads('aradhya_video');
  }, [activeSubTab]);

  // SEGMENTED AUTOCOMPLETE: Extract current segment after last comma
  const getActiveSegment = (inputStr) => {
    if (!inputStr) return '';
    const parts = inputStr.split(',');
    return parts[parts.length - 1].trim();
  };

  const activeSegment = getActiveSegment(locationInput);

  // Filter recommendations matching the current segment
  const filteredSuggestions = activeSegment
    ? VERIFIED_LOCATIONS.filter(loc => loc.toLowerCase().includes(activeSegment.toLowerCase()))
    : VERIFIED_LOCATIONS;

  // Handle Location Selection or Typing (with Multi-City Comma Append)
  const handleSelectLocation = async (chosenLoc) => {
    let finalLocationStr = chosenLoc;

    if (locationInput.includes(',')) {
      const parts = locationInput.split(',').map(s => s.trim()).filter(Boolean);
      if (parts.length > 1) {
        parts.pop(); // remove incomplete active segment
        finalLocationStr = [...parts, chosenLoc].join(', ');
      }
    }

    setLocationInput(finalLocationStr);
    setShowSuggestions(false);

    if (activeSubTab === 'competitors') setCityCompetitors(finalLocationStr);
    if (activeSubTab === 'web_leads') setCityWeb(finalLocationStr);
    if (activeSubTab === 'aradhya_leads') setCityAradhya(finalLocationStr);

    // PERSIST TO LOCALSTORAGE
    localStorage.setItem('converge_selected_location', finalLocationStr);

    // PERSIST TO SUPABASE DATABASE (discovery_locations table for background cron job)
    try {
      await fetch(`${API_BASE}/api/settings/locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location_name: finalLocationStr, scope: 'global' })
      });
    } catch (e) {
      console.warn('Could not save location setting:', e.message);
    }
  };

  // Single Category Selector (Radio behavior: ONLY 1 category active at a time)
  const handleSelectSingleCategory = async (catItem, scope) => {
    setActiveNiche(catItem.category_name);

    // PERSIST SELECTED NICHE TO LOCALSTORAGE
    localStorage.setItem(`converge_selected_niche_${scope}`, catItem.category_name);

    // Update local state list so ONLY catItem.category_name is active
    const updateList = (list) => list.map(c => ({
      ...c,
      is_active: c.category_name === catItem.category_name
    }));

    if (scope === 'competitor_research') setCatCompetitors(updateList);
    if (scope === 'web_dev') setCatWeb(updateList);
    if (scope === 'aradhya') setCatAradhya(updateList);

    // Sync to DB: set selected catItem to is_active=true, all others to false
    try {
      const list = scope === 'competitor_research' ? catCompetitors : scope === 'web_dev' ? catWeb : catAradhya;
      for (const c of list) {
        if (c.id && typeof c.id === 'string' && c.id.length > 5) {
          const shouldBeActive = c.category_name === catItem.category_name;
          if (c.is_active !== shouldBeActive) {
            fetch(`${API_BASE}/api/settings/categories/${c.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ is_active: shouldBeActive })
            }).catch(e => console.warn('Category update warning:', e.message));
          }
        }
      }
    } catch (e) {
      console.warn('Failed to update category DB status:', e.message);
    }
  };

  // Add New Category to active scope
  const handleAddCategory = async (e, scope) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/settings/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_name: newCatName.trim(), scope })
      });
      const data = await res.json();
      if (data.success) {
        setNewCatName('');
        setShowAddCatInput(false);
        setActiveNiche(data.category.category_name);
        localStorage.setItem(`converge_selected_niche_${scope}`, data.category.category_name);
        fetchScopeCategories(scope);
      }
    } catch (e) {
      console.warn('Failed to add category:', e.message);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (id, scope) => {
    try {
      const res = await fetch(`${API_BASE}/api/settings/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchScopeCategories(scope);
      }
    } catch (e) {
      console.warn('Failed to delete category:', e.message);
    }
  };

  // Live Discovery Execution Trigger
  const handleDiscoverLiveCompetitors = async () => {
    setDiscoveringLive(true);
    setDiscoverMessage(null);
    try {
      const currentCat = activeNiche || 'Digital Marketing Agencies';
      const res = await fetch(`${API_BASE}/api/competitors/discover-live`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: currentCat, location: locationInput })
      });
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

  const handleDiscoverLiveLeads = async (leadType) => {
    setDiscoveringLive(true);
    setDiscoverMessage(null);
    const currentNiche = activeNiche || (leadType === 'web_dev' ? 'Dental Clinics' : 'D2C Skincare & Beauty');
    try {
      const res = await fetch(`${API_BASE}/api/leads/discover-live`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadType, niche: currentNiche, location: locationInput })
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

  // Helper: Active scope categories based on current active subtab
  const currentScope = activeSubTab === 'competitors' ? 'competitor_research' : activeSubTab === 'web_leads' ? 'web_dev' : 'aradhya';
  const currentCategoryList = activeSubTab === 'competitors' ? catCompetitors : activeSubTab === 'web_leads' ? catWeb : catAradhya;

  return (
    <div className="space-y-6">
      {/* Top Banner & Sub-tab Navigation */}
      <div className="bg-[#121216] border border-[#23232F] rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-rose-400">AUTONOMOUS INTELLIGENCE ENGINE</span>
              <span className="text-xs text-gray-600">•</span>
              <span className="text-xs font-mono text-gray-400">Gemini 2.5 Flash Grounding & Google Places API</span>
            </div>
            <h1 className="text-xl font-bold font-heading text-white">Competitor & Lead Intelligence</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (activeSubTab === 'competitors') handleDiscoverLiveCompetitors();
                if (activeSubTab === 'web_leads') handleDiscoverLiveLeads('web_dev');
                if (activeSubTab === 'aradhya_leads') handleDiscoverLiveLeads('aradhya_video');
              }}
              disabled={discoveringLive}
              className="text-xs font-medium px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20"
            >
              <Sparkles className={`w-4 h-4 ${discoveringLive ? 'animate-spin' : ''}`} />
              <span>{discoveringLive ? 'Searching Verified Web...' : '⚡ Discover Real Competitors & Leads Now'}</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 rounded-xl">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Google Sheets Auto-Sync Active</span>
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

      {/* DYNAMIC LOCATION & CATEGORY CONTROL TOOLBAR (FOR ACTIVE TAB) */}
      <div className="bg-[#121216] border border-[#23232F] rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#23232F] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase text-indigo-400 tracking-wider">
              {activeSubTab === 'competitors' ? 'COMPETITOR DISCOVERY SETTINGS' : activeSubTab === 'web_leads' ? 'WEB DEV LEADS SETTINGS' : 'ARADHYA AI VIDEO SETTINGS'}
            </span>
          </div>

          {/* SMART SEGMENTED LOCATION AUTOCOMPLETE INPUT */}
          <div className="relative" ref={dropdownRef}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (locationInput.trim()) {
                  handleSelectLocation(activeSegment || locationInput.trim());
                }
              }}
              className="flex items-center gap-2 bg-[#0A0A0C] border border-[#2B2B3A] rounded-xl px-3 py-1.5 focus-within:border-indigo-500 transition"
            >
              <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="text-xs font-mono text-gray-400">Target Location:</span>
              <input
                type="text"
                value={locationInput}
                onChange={(e) => {
                  setLocationInput(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Type city/country (e.g. Dubai, Delhi, Miami)..."
                className="bg-transparent text-xs font-medium text-white outline-none w-56 sm:w-64"
              />
            </form>

            {/* AUTOCOMPLETE SUGGESTIONS DROPDOWN */}
            {showSuggestions && (
              <div className="absolute right-0 top-full mt-1.5 w-72 bg-[#1A1A22] border border-[#2B2B3A] rounded-xl shadow-2xl z-50 overflow-hidden max-h-64 overflow-y-auto">
                {/* Dynamic Free-Form Option: Allows picking ANY typed location */}
                {activeSegment.length > 0 && (
                  <button
                    onClick={() => handleSelectLocation(activeSegment)}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-indigo-300 hover:bg-indigo-500/20 flex items-center justify-between border-b border-[#2B2B3A] bg-indigo-500/10"
                  >
                    <span className="truncate">➕ Use typed: "{activeSegment}"</span>
                    <Plus className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  </button>
                )}

                <div className="p-2 text-[10px] font-mono text-gray-400 border-b border-[#2B2B3A]">
                  World Location Suggestions:
                </div>
                {filteredSuggestions.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => handleSelectLocation(loc)}
                    className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-indigo-500/20 flex items-center justify-between border-b border-[#2B2B3A]/30 transition"
                  >
                    <span>{loc}</span>
                    {locationInput.toLowerCase().includes(loc.toLowerCase()) && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* DEDICATED 7-DAY ROTATION CATEGORY PILLS FOR ACTIVE TAB */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-gray-400 tracking-wider">
              ACTIVE 7-DAY NICHE FOCUS ({currentCategoryList.length} Categories):
            </span>

            {/* Add inline category button */}
            {!showAddCatInput ? (
              <button
                onClick={() => setShowAddCatInput(true)}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono"
              >
                <Plus className="w-3.5 h-3.5" /> Add Niche
              </button>
            ) : (
              <form onSubmit={(e) => handleAddCategory(e, currentScope)} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="New niche name..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="bg-[#0A0A0C] border border-[#2B2B3A] rounded-lg px-2.5 py-1 text-xs text-white outline-none w-40"
                  autoFocus
                />
                <button type="submit" className="text-xs bg-indigo-600 px-2.5 py-1 rounded-lg text-white font-medium">
                  Save
                </button>
                <button type="button" onClick={() => setShowAddCatInput(false)} className="text-gray-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {currentCategoryList.map((cat) => {
              const isSelected = activeNiche === cat.category_name;

              return (
                <div
                  key={cat.id || cat.category_name}
                  className={`group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-md shadow-indigo-500/10 font-bold'
                      : 'bg-[#0A0A0C] text-gray-400 border-[#23232F] hover:border-gray-600 hover:text-white'
                  }`}
                  onClick={() => handleSelectSingleCategory(cat, currentScope)}
                >
                  <span>{cat.category_name}</span>
                  {cat.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(cat.id, currentScope);
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-rose-400 transition"
                      title="Remove category"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
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
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                    {res.source || 'meta_ad_library'}
                                  </span>
                                  <span className="text-xs text-gray-400 font-mono">
                                    {res.date_added ? new Date(res.date_added).toLocaleDateString() : 'Active Today'}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-300 font-mono">{res.content_notes}</p>
                              </div>

                              <button
                                onClick={() => handleSuggestIdea(comp.name, res.content_notes, res.id)}
                                disabled={isSuggesting}
                                className={`text-xs font-medium px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
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
                                    <span>{isSuggesting ? 'Adapting...' : 'Adapt Hook to Post'}</span>
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
          {loadingWebLeads ? (
            <div className="p-8 text-center bg-[#121216] border border-[#23232F] rounded-2xl text-xs font-mono text-gray-500">
              Loading qualified web development leads...
            </div>
          ) : webLeads.length === 0 ? (
            <div className="p-8 text-center bg-[#121216] border border-[#23232F] rounded-2xl space-y-3">
              <Code className="w-8 h-8 text-indigo-400 mx-auto opacity-60" />
              <p className="text-sm font-bold text-white">No Web Dev Leads Found Yet</p>
              <p className="text-xs text-gray-400 max-w-sm mx-auto font-mono">
                Click "⚡ Discover Real Competitors & Leads Now" to crawl local businesses in {locationInput}!
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

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono flex items-center gap-1">
                          <FileSpreadsheet className="w-3 h-3" /> Synced to Sheets
                        </span>
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-xs font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{lead.rating} Stars</span>
                        </div>
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
          {loadingAradhyaLeads ? (
            <div className="p-8 text-center bg-[#121216] border border-[#23232F] rounded-2xl text-xs font-mono text-gray-500">
              Loading qualified AI Video leads...
            </div>
          ) : aradhyaLeads.length === 0 ? (
            <div className="p-8 text-center bg-[#121216] border border-[#23232F] rounded-2xl space-y-3">
              <Video className="w-8 h-8 text-purple-400 mx-auto opacity-60" />
              <p className="text-sm font-bold text-white">No Aradhya AI Video Leads Found Yet</p>
              <p className="text-xs text-gray-400 max-w-sm mx-auto font-mono">
                Click "⚡ Discover Real Competitors & Leads Now" to crawl visual D2C brands in {locationInput}!
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

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono flex items-center gap-1">
                          <FileSpreadsheet className="w-3 h-3" /> Synced to Sheets
                        </span>
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 font-mono text-xs font-bold">
                          <Star className="w-3.5 h-3.5 fill-purple-400" />
                          <span>{lead.rating} Stars</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-mono uppercase text-gray-500">AI Video Qualification Angle:</span>
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
                        className="text-purple-400 hover:underline flex items-center gap-1 bg-[#0A0A0C] border border-[#23232F] px-2.5 py-1 rounded-lg"
                      >
                        <MapPin className="w-3.5 h-3.5 text-purple-400" /> View Google Maps
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
                          <ExternalLink className="w-3.5 h-3.5" /> View Brand Site
                        </a>
                      ) : (
                        <span className="text-xs text-gray-500 font-mono">No Website</span>
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
                            <span>Angle Saved to Idea Bank!</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{isGenerating ? 'Generating...' : 'Generate AI Video Pitch'}</span>
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
