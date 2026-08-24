import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  Copy, 
  Check, 
  MessageSquare, 
  ArrowRight, 
  Zap, 
  Github, 
  Eye, 
  TrendingUp, 
  UserCheck, 
  Bookmark,
  Send,
  X,
  Bot,
  User,
  Sliders,
  CheckCircle2
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : '';

export default function Generator({ setActiveTab }) {
  // Day-to-pillar auto detection
  const days = ['mon', 'tue', 'wed', 'thu', 'fri'];
  const todayIndex = new Date().getDay(); // 0 is Sun, 1 is Mon, 2 is Tue...
  const defaultDaySlot = todayIndex >= 1 && todayIndex <= 5 ? days[todayIndex - 1] : 'tue';
  
  const pillarDayMap = {
    mon: 'authority',
    tue: 'offer',
    wed: 'aradhya',
    thu: 'proof',
    fri: 'offer',
  };

  const [activeDay, setActiveDay] = useState(defaultDaySlot);
  const [selectedPillar, setSelectedPillar] = useState(pillarDayMap[defaultDaySlot]);
  const [formatMode, setFormatMode] = useState('full'); // 'full' or 'outline'
  
  // State
  const [ideas, setIdeas] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [customTopic, setCustomTopic] = useState('');
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  
  // Draft Generation state
  const [generatingDrafts, setGeneratingDrafts] = useState(false);
  const [drafts, setDrafts] = useState(null);
  const [selectedDraftIndex, setSelectedDraftIndex] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [savedPostId, setSavedPostId] = useState(null);
  const [savingPost, setSavingPost] = useState(false);

  // Chat Refinement state (Prompt 3b)
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);

  // Prompt 7 Crawler State
  const [crawling, setCrawling] = useState(false);
  const [crawlMessage, setCrawlMessage] = useState(null);

  const handleRunCrawlerNow = async () => {
    setCrawling(true);
    setCrawlMessage(null);
    try {
      const res = await fetch(`${API_BASE}/api/crawler/run-now`);
      const data = await res.json();
      if (data.success) {
        setCrawlMessage(data.message);
        fetchIdeas(selectedPillar);
        setTimeout(() => setCrawlMessage(null), 5000);
      }
    } catch (err) {
      console.error('Failed to run trend crawler:', err);
    } finally {
      setCrawling(false);
    }
  };

  // Pillar details helper
  const pillarDetails = {
    authority: { name: 'Authority', color: 'border-indigo-500/40 text-indigo-400 bg-indigo-500/10', cta: 'Soft CTA (Engagement)' },
    offer: { name: 'Offer', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10', cta: 'Direct CTA ("DM us") + $X Price & Y Days' },
    aradhya: { name: 'Aradhya / AI Showcase', color: 'border-purple-500/40 text-purple-400 bg-purple-500/10', cta: 'Curiosity CTA (AI Persona)' },
    proof: { name: 'Proof', color: 'border-amber-500/40 text-amber-400 bg-amber-500/10', cta: 'Soft CTA ("Sound familiar?")' },
  };

  // Fetch 5 ideas whenever pillar changes
  useEffect(() => {
    fetchIdeas(selectedPillar);
  }, [selectedPillar]);

  const fetchIdeas = async (pillar) => {
    setLoadingIdeas(true);
    setDrafts(null);
    setSelectedIdea(null);
    try {
      const res = await fetch(`${API_BASE}/api/ideas?pillar=${pillar}`);
      const data = await res.json();
      if (data.success && data.ideas) {
        setIdeas(data.ideas);
      }
    } catch (err) {
      console.error('Failed to fetch ideas:', err);
    } finally {
      setLoadingIdeas(false);
    }
  };

  const handleSelectDay = (day) => {
    setActiveDay(day);
    setSelectedPillar(pillarDayMap[day]);
  };

  const handleGenerate = async (ideaObj) => {
    const textToUse = ideaObj ? ideaObj.idea_text : customTopic;
    if (!textToUse) return;

    setSelectedIdea(ideaObj || { idea_text: customTopic, source: 'manual' });
    setGeneratingDrafts(true);
    setDrafts(null);
    setSelectedDraftIndex(null);

    try {
      const res = await fetch(`${API_BASE}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaText: textToUse,
          pillar: selectedPillar,
          formatMode: formatMode,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setDrafts([data.draft_1, data.draft_2, data.draft_3]);
        // Default select draft 1
        setSelectedDraftIndex(0);
      }
    } catch (err) {
      console.error('Failed to generate drafts:', err);
    } finally {
      setGeneratingDrafts(false);
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSavePost = async (draftText, index) => {
    setSavingPost(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : '';
      const res = await fetch(`${API_BASE}/api/save-post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pillar: selectedPillar,
          daySlot: activeDay,
          ideaText: selectedIdea?.idea_text || customTopic,
          selectedDraft: draftText,
          draft1: drafts[0],
          draft2: drafts[1],
          draft3: drafts[2],
          ideaId: selectedIdea?.id,
        }),
      });
      const data = await res.json();
      if (data.success && data.post) {
        setSavedPostId(data.post.id);
        setSelectedDraftIndex(index);
      }
    } catch (err) {
      console.error('Failed to save post:', err);
    } finally {
      setSavingPost(false);
    }
  };

  // Chat Refinement Handlers (Prompt 3b)
  const openRefineChat = () => {
    if (!drafts || selectedDraftIndex === null) return;
    setIsChatOpen(true);
    if (chatMessages.length === 0) {
      setChatMessages([
        {
          role: 'assistant',
          message: `👋 Hey team! I've loaded your selected draft for the **${selectedPillar.toUpperCase()}** pillar.\n\nHow would you like to refine it? (e.g. "make it 20% shorter", "remove the pricing line", "make the hook punchier", "add more authority").`
        }
      ]);
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || sendingChat) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    
    const newHistory = [...chatMessages, { role: 'user', message: userMsg }];
    setChatMessages(newHistory);
    setSendingChat(true);

    try {
      const currentDraftText = drafts[selectedDraftIndex];
      const res = await fetch(`${API_BASE}/api/refine-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: savedPostId || 'temp-id',
          currentDraft: currentDraftText,
          pillar: selectedPillar,
          userMessage: userMsg,
          chatHistory: newHistory,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setChatMessages(prev => [
          ...prev,
          { role: 'assistant', message: data.message, updatedDraft: data.updatedDraft }
        ]);
      }
    } catch (err) {
      console.error('Failed to refine draft via chat:', err);
    } finally {
      setSendingChat(false);
    }
  };

  const handleApplyChatVersion = (updatedText) => {
    if (!updatedText) return;
    const updatedDrafts = [...drafts];
    updatedDrafts[selectedDraftIndex] = updatedText;
    setDrafts(updatedDrafts);
    setIsChatOpen(false);
  };

  // Helper for source badge
  const renderSourceBadge = (source) => {
    switch (source) {
      case 'github':
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
            <Github className="w-3 h-3" /> From GitHub
          </span>
        );
      case 'crawler_news':
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Trending News
          </span>
        );
      case 'competitor_research':
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
            <Eye className="w-3 h-3" /> Competitor Ad
          </span>
        );
      case 'client':
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
            <UserCheck className="w-3 h-3" /> Client Result
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <Bookmark className="w-3 h-3" /> Idea Bank
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Top Controls: Day & Pillar Selector */}
      <div className="bg-[#121216] border border-[#23232F] rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-gray-400 uppercase">DAY SLOT ROTATION</span>
              <span className="text-xs text-gray-600">•</span>
              <span className="text-xs font-mono text-emerald-400">Auto-Detected</span>
            </div>
            <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2">
              <span>Today's Strategy:</span>
              <span className={`px-3 py-1 rounded-full border text-xs font-mono ${pillarDetails[selectedPillar]?.color}`}>
                {pillarDetails[selectedPillar]?.name}
              </span>
            </h2>
          </div>

          {/* Toggle: Full Draft vs Outline Only */}
          <div className="flex items-center gap-2 bg-[#0A0A0C] p-1 border border-[#23232F] rounded-xl self-start md:self-auto">
            <button
              onClick={() => setFormatMode('full')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                formatMode === 'full'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Full Draft
            </button>
            <button
              onClick={() => setFormatMode('outline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                formatMode === 'outline'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Outline Only
            </button>
          </div>
        </div>

        {/* Mon-Fri Day Navigation Bar */}
        <div className="flex gap-2 pt-2 border-t border-[#23232F] overflow-x-auto pb-1 scrollbar-none">
          {days.map((day) => {
            const pillarKey = pillarDayMap[day];
            const isSelected = activeDay === day;
            return (
              <button
                key={day}
                onClick={() => handleSelectDay(day)}
                className={`p-3 rounded-xl border text-left transition-all shrink-0 min-w-[110px] sm:min-w-0 sm:flex-1 ${
                  isSelected
                    ? 'border-indigo-500/50 bg-indigo-500/10 shadow-lg shadow-indigo-600/10'
                    : 'border-[#23232F] bg-[#0A0A0C] hover:border-gray-700 text-gray-400'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase mb-1">
                  <span className={isSelected ? 'text-indigo-400' : 'text-gray-400'}>{day}</span>
                  {day === defaultDaySlot && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Today" />
                  )}
                </div>
                <div className="text-xs font-bold font-heading text-white capitalize">{pillarKey}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 1: Auto-Sourced Idea Cards */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold font-heading text-white">Select an Idea Card to Generate 3 Drafts</h3>
            <span className="text-xs text-gray-500 font-mono hidden sm:inline">(5 Auto-Mixed Angles)</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRunCrawlerNow}
              disabled={crawling}
              className="text-xs font-mono text-emerald-400 hover:text-emerald-300 bg-[#121216] border border-[#23232F] hover:border-emerald-500/40 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Zap className={`w-3.5 h-3.5 ${crawling ? 'animate-bounce text-emerald-300' : ''}`} />
              <span>{crawling ? 'Crawling...' : 'Crawl Trends'}</span>
            </button>

            <button
              onClick={() => fetchIdeas(selectedPillar)}
              disabled={loadingIdeas}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-mono flex items-center gap-1.5 bg-[#121216] border border-[#23232F] px-3 py-1.5 rounded-xl"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingIdeas ? 'animate-spin' : ''}`} />
              <span>Shuffle Ideas</span>
            </button>
          </div>
        </div>

        {crawlMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl p-3 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{crawlMessage}</span>
          </div>
        )}

        {loadingIdeas ? (
          <div className="p-8 text-center bg-[#121216] border border-[#23232F] rounded-xl text-gray-500 font-mono text-xs">
            Fetching ideas from GitHub org, crawlers & client logs...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {ideas.map((idea) => {
              const isSelected = selectedIdea?.id === idea.id;
              return (
                <div
                  key={idea.id}
                  onClick={() => handleGenerate(idea)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between h-44 group ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-600/10 shadow-xl shadow-indigo-600/20'
                      : 'border-[#23232F] bg-[#121216] hover:border-indigo-500/50 hover:bg-[#1A1A22]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      {renderSourceBadge(idea.source)}
                    </div>
                    <p className="text-xs text-gray-200 font-medium line-clamp-4 leading-relaxed group-hover:text-white">
                      "{idea.idea_text}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 pt-2 border-t border-[#23232F]/50">
                    <span>Used: {idea.times_used || 0}x</span>
                    <span className="text-indigo-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      Generate <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Fallback Manual Override Input */}
        <div className="bg-[#121216] border border-[#23232F] rounded-xl p-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="text-xs text-gray-400 font-mono shrink-0">Manual Fallback:</div>
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            placeholder="Or type a custom topic manually..."
            className="flex-1 w-full bg-[#0A0A0C] border border-[#23232F] focus:border-indigo-500 rounded-xl px-4 py-2 text-xs text-white placeholder-gray-600 outline-none"
          />
          <button
            onClick={() => handleGenerate(null)}
            disabled={!customTopic.trim() || generatingDrafts}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-medium transition-all shrink-0 flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Drafts</span>
          </button>
        </div>
      </div>

      {/* STEP 2: 3 Generated Draft Variations */}
      {generatingDrafts && (
        <div className="bg-[#121216] border border-[#23232F] rounded-2xl p-12 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto animate-pulse">
            <Sparkles className="w-5 h-5 animate-spin" />
          </div>
          <h3 className="text-base font-bold font-heading text-white">Generating 3 AI Draft Variations...</h3>
          <p className="text-xs text-gray-400 font-mono">
            Applying Converge Digitals' tone rules, pricing anchors, and pillar CTAs via Qwen 2.5
          </p>
        </div>
      )}

      {drafts && !generatingDrafts && (
        <div className="space-y-4 pt-4 border-t border-[#23232F]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold font-heading text-white">2. Select & Refine Your Post Draft</h3>
              <p className="text-xs text-gray-400 font-mono">3 variations generated for "{selectedIdea?.idea_text}"</p>
            </div>

            {/* AI Refine Chat Button (Prompt 3b) */}
            <button
              onClick={openRefineChat}
              className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 shadow-lg shadow-purple-600/10"
            >
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <span>Refine with AI Copywriter</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {drafts.map((draftText, idx) => {
              const isSelected = selectedDraftIndex === idx;
              return (
                <div
                  key={idx}
                  className={`bg-[#121216] border rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all relative ${
                    isSelected
                      ? 'border-indigo-500 shadow-xl shadow-indigo-600/15 ring-1 ring-indigo-500/50'
                      : 'border-[#23232F] hover:border-gray-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-[#23232F] pb-3">
                      <span className="text-xs font-mono font-bold text-indigo-400">
                        Variation #{idx + 1}
                      </span>
                      <button
                        onClick={() => handleCopy(draftText, idx)}
                        className="text-gray-400 hover:text-white text-xs font-mono flex items-center gap-1 bg-[#0A0A0C] border border-[#23232F] px-2.5 py-1 rounded-lg"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-xs text-gray-300 font-sans leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto pr-1">
                      {draftText}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#23232F] flex items-center justify-between">
                    <button
                      onClick={() => handleSavePost(draftText, idx)}
                      disabled={savingPost}
                      className={`w-full py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                        isSelected && savedPostId
                          ? 'bg-emerald-600 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      }`}
                    >
                      {isSelected && savedPostId ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Saved to Calendar</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-4 h-4" />
                          <span>Save as Selected Draft</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PROMPT 3B: Conversational Draft Refinement Chat Drawer */}
      {isChatOpen && (
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[#121216] border-l border-[#23232F] shadow-2xl z-50 flex flex-col justify-between">
          {/* Chat Header */}
          <div className="p-4 border-b border-[#23232F] flex items-center justify-between bg-[#0A0A0C]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold font-heading text-white">AI Copywriter Assistant</h4>
                <p className="text-[10px] text-gray-400 font-mono">Refining Draft #{selectedDraftIndex + 1}</p>
              </div>
            </div>

            <button
              onClick={() => setIsChatOpen(false)}
              className="text-gray-400 hover:text-white p-1 rounded-lg bg-[#121216]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="p-4 flex-1 overflow-y-auto space-y-4 font-sans text-xs">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className={`max-w-[85%] rounded-2xl p-3 space-y-2 ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-[#0A0A0C] border border-[#23232F] text-gray-200 rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>

                  {/* "Use This Version" action button if assistant emitted updated draft */}
                  {msg.role === 'assistant' && msg.updatedDraft && (
                    <button
                      onClick={() => handleApplyChatVersion(msg.updatedDraft)}
                      className="mt-2 w-full bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Use This Version</span>
                    </button>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {sendingChat && (
              <div className="flex gap-3 items-center text-gray-500 font-mono text-[11px]">
                <Bot className="w-4 h-4 text-purple-400 animate-spin" />
                <span>AI Copywriter is rewriting...</span>
              </div>
            )}
          </div>

          {/* Quick Edit Suggestions */}
          <div className="px-4 py-2 border-t border-[#23232F]/50 flex items-center gap-2 overflow-x-auto text-[10px] font-mono text-gray-400 bg-[#0A0A0C]/50">
            <button onClick={() => setChatInput("Make it 20% shorter and punchier")} className="hover:text-purple-400 whitespace-nowrap bg-[#121216] px-2 py-1 rounded border border-[#23232F]">
              ⚡ Make 20% shorter
            </button>
            <button onClick={() => setChatInput("Remove the pricing line")} className="hover:text-purple-400 whitespace-nowrap bg-[#121216] px-2 py-1 rounded border border-[#23232F]">
              🏷️ Remove pricing
            </button>
            <button onClick={() => setChatInput("Make the hook more aggressive")} className="hover:text-purple-400 whitespace-nowrap bg-[#121216] px-2 py-1 rounded border border-[#23232F]">
              🔥 Stronger hook
            </button>
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendChat} className="p-4 border-t border-[#23232F] bg-[#0A0A0C] flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Tell AI how to refine draft..."
              className="flex-1 bg-[#121216] border border-[#23232F] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 outline-none"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || sendingChat}
              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white p-2.5 rounded-xl text-xs font-medium transition-all shrink-0 shadow-lg shadow-purple-600/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
