import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Plus, 
  X, 
  Copy, 
  Check, 
  MessageSquare,
  AlertCircle,
  Eye,
  FileText
} from 'lucide-react';

export default function Calendar({ setActiveTab }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal / Detail Drawer state
  const [selectedPost, setSelectedPost] = useState(null);
  const [editedDraft, setEditedDraft] = useState('');
  const [editedStatus, setEditedStatus] = useState('draft');
  const [postUrl, setPostUrl] = useState('');
  const [visualType, setVisualType] = useState('none');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const days = [
    { key: 'mon', name: 'Monday', pillar: 'Authority', focus: 'AI & Marketing Trends', color: 'border-indigo-500/40 text-indigo-400 bg-indigo-500/10' },
    { key: 'tue', name: 'Tuesday', pillar: 'Offer', focus: 'Services & $X Pricing', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' },
    { key: 'wed', name: 'Wednesday', pillar: 'Aradhya / AI', focus: 'AI Persona Video Demo', color: 'border-purple-500/40 text-purple-400 bg-purple-500/10' },
    { key: 'thu', name: 'Thursday', pillar: 'Proof', focus: 'Real Case Study Results', color: 'border-amber-500/40 text-amber-400 bg-amber-500/10' },
    { key: 'fri', name: 'Friday', pillar: 'Offer / Story', focus: 'Direct Sales or Personal Story', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' },
  ];

  useEffect(() => {
    fetchCalendarPosts();
  }, []);

  const fetchCalendarPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/calendar');
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error('Failed to fetch calendar posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = (post) => {
    setSelectedPost(post);
    setEditedDraft(post.selected_draft || post.draft_1 || '');
    setEditedStatus(post.status || 'draft');
    setPostUrl(post.post_url || '');
    setVisualType(post.visual_type || 'none');
  };

  const handleSavePostDetails = async () => {
    if (!selectedPost) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/posts/${selectedPost.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selected_draft: editedDraft,
          status: editedStatus,
          post_url: postUrl,
          visual_type: visualType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Refresh calendar
        await fetchCalendarPosts();
        setSelectedPost(null);
      }
    } catch (err) {
      console.error('Failed to update post:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post draft?')) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchCalendarPosts();
        if (selectedPost?.id === id) setSelectedPost(null);
      }
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper: Status badge
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'posted':
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Posted
          </span>
        );
      case 'ready':
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" /> Ready
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-slate-500/20 text-slate-300 border border-slate-500/30 rounded-full flex items-center gap-1">
            <FileText className="w-3 h-3 text-slate-400" /> Draft
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header Banner */}
      <div className="bg-[#121216] border border-[#23232F] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-indigo-400">WEEKLY CONTENT STRATEGY</span>
            <span className="text-xs text-gray-600">•</span>
            <span className="text-xs font-mono text-gray-400">Monday – Friday Schedule</span>
          </div>
          <h1 className="text-xl font-bold font-heading text-white">Content Calendar & Publishing Queue</h1>
        </div>

        <button
          onClick={() => setActiveTab('generator')}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate New Post</span>
        </button>
      </div>

      {/* Mon-Fri Grid Columns */}
      {loading ? (
        <div className="p-12 text-center bg-[#121216] border border-[#23232F] rounded-2xl text-gray-400 font-mono text-xs">
          Loading calendar posts...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {days.map((day) => {
            // Find posts for this day slot
            const dayPosts = posts.filter(p => p.day_slot === day.key);
            const mainPost = dayPosts[0]; // Active post for this day

            return (
              <div
                key={day.key}
                className="bg-[#121216] border border-[#23232F] rounded-2xl p-4 flex flex-col justify-between min-h-[420px] space-y-4"
              >
                {/* Column Header */}
                <div className="space-y-2 pb-3 border-b border-[#23232F]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase text-gray-300">{day.name}</span>
                    <span className={`px-2 py-0.5 text-[9px] font-mono rounded border ${day.color}`}>
                      {day.pillar}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-tight">{day.focus}</p>
                </div>

                {/* Column Content Area */}
                <div className="flex-1 space-y-3">
                  {dayPosts.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-[#23232F] rounded-xl hover:border-gray-700 transition-colors group">
                      <p className="text-xs text-gray-500 font-mono mb-3">No post scheduled</p>
                      <button
                        onClick={() => setActiveTab('generator')}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-mono flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Post</span>
                      </button>
                    </div>
                  ) : (
                    dayPosts.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => handleOpenDetail(post)}
                        className="bg-[#0A0A0C] border border-[#23232F] hover:border-indigo-500/50 rounded-xl p-4 cursor-pointer transition-all space-y-3 group shadow-md"
                      >
                        <div className="flex items-center justify-between">
                          {renderStatusBadge(post.status)}
                          <span className="text-[10px] font-mono text-gray-500">
                            {post.visual_type !== 'none' ? `📷 ${post.visual_type}` : ''}
                          </span>
                        </div>

                        <p className="text-xs font-medium text-gray-200 line-clamp-3 leading-relaxed group-hover:text-white">
                          {post.selected_draft || post.idea_text}
                        </p>

                        <div className="pt-2 border-t border-[#23232F] flex items-center justify-between text-[10px] font-mono text-indigo-400">
                          <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            <Edit3 className="w-3 h-3" /> Edit / View
                          </span>
                          {post.post_url && (
                            <a
                              href={post.post_url}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-emerald-400 hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" /> Link
                            </a>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* POST DETAIL MODAL / DRAWER */}
      {selectedPost && (
        <div className="fixed inset-0 bg-[#0A0A0C]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121216] border border-[#23232F] rounded-2xl w-full max-w-2xl p-6 space-y-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#23232F] pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-indigo-400 uppercase">
                    Pillar: {selectedPost.pillar}
                  </span>
                  <span className="text-xs text-gray-600">•</span>
                  <span className="text-xs font-mono text-gray-400 uppercase">
                    Slot: {selectedPost.day_slot}
                  </span>
                </div>
                <h3 className="text-lg font-bold font-heading text-white">Post Detail & Editing</h3>
              </div>

              <button
                onClick={() => setSelectedPost(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg bg-[#0A0A0C] border border-[#23232F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Idea Reference */}
            <div className="bg-[#0A0A0C] border border-[#23232F] rounded-xl p-4 space-y-1">
              <span className="text-[10px] font-mono text-gray-500 uppercase">Original Strategy / Idea:</span>
              <p className="text-xs font-medium text-gray-200">"{selectedPost.idea_text}"</p>
            </div>

            {/* Editable Post Draft Text */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase text-gray-400">Selected Post Copy (Editable):</label>
                <button
                  onClick={() => handleCopyText(editedDraft)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-mono flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Copy'}</span>
                </button>
              </div>

              <textarea
                rows={8}
                value={editedDraft}
                onChange={(e) => setEditedDraft(e.target.value)}
                className="w-full bg-[#0A0A0C] border border-[#23232F] focus:border-indigo-500 rounded-xl p-4 text-xs text-white placeholder-gray-600 font-sans leading-relaxed outline-none"
              />
            </div>

            {/* Variations Switcher */}
            {(selectedPost.draft_1 || selectedPost.draft_2 || selectedPost.draft_3) && (
              <div className="space-y-2 pt-2 border-t border-[#23232F]">
                <span className="text-[11px] font-mono text-gray-400 uppercase">Switch to Original Variations:</span>
                <div className="grid grid-cols-3 gap-2">
                  {selectedPost.draft_1 && (
                    <button
                      onClick={() => setEditedDraft(selectedPost.draft_1)}
                      className="p-2.5 bg-[#0A0A0C] border border-[#23232F] hover:border-indigo-500 rounded-xl text-left text-[11px] text-gray-300 line-clamp-2"
                    >
                      <span className="font-mono text-indigo-400 block text-[9px]">Draft #1</span>
                      {selectedPost.draft_1}
                    </button>
                  )}
                  {selectedPost.draft_2 && (
                    <button
                      onClick={() => setEditedDraft(selectedPost.draft_2)}
                      className="p-2.5 bg-[#0A0A0C] border border-[#23232F] hover:border-indigo-500 rounded-xl text-left text-[11px] text-gray-300 line-clamp-2"
                    >
                      <span className="font-mono text-indigo-400 block text-[9px]">Draft #2</span>
                      {selectedPost.draft_2}
                    </button>
                  )}
                  {selectedPost.draft_3 && (
                    <button
                      onClick={() => setEditedDraft(selectedPost.draft_3)}
                      className="p-2.5 bg-[#0A0A0C] border border-[#23232F] hover:border-indigo-500 rounded-xl text-left text-[11px] text-gray-300 line-clamp-2"
                    >
                      <span className="font-mono text-indigo-400 block text-[9px]">Draft #3</span>
                      {selectedPost.draft_3}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Post Metadata Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#23232F]">
              <div>
                <label className="block text-xs font-mono uppercase text-gray-400 mb-2">Publishing Status</label>
                <select
                  value={editedStatus}
                  onChange={(e) => setEditedStatus(e.target.value)}
                  className="w-full bg-[#0A0A0C] border border-[#23232F] focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                >
                  <option value="draft">Draft (In Progress)</option>
                  <option value="ready">Ready for Posting</option>
                  <option value="posted">Posted to LinkedIn</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-gray-400 mb-2">Visual Asset Type</label>
                <select
                  value={visualType}
                  onChange={(e) => setVisualType(e.target.value)}
                  className="w-full bg-[#0A0A0C] border border-[#23232F] focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                >
                  <option value="none">None (Text Only)</option>
                  <option value="ai">AI Visual / Concept Graphic</option>
                  <option value="real">Real Client Screenshot / Proof</option>
                </select>
              </div>
            </div>

            {/* LinkedIn Post URL Input */}
            <div>
              <label className="block text-xs font-mono uppercase text-gray-400 mb-2">Live LinkedIn Post URL (Optional)</label>
              <input
                type="url"
                value={postUrl}
                onChange={(e) => setPostUrl(e.target.value)}
                placeholder="https://linkedin.com/posts/convergedigitals_..."
                className="w-full bg-[#0A0A0C] border border-[#23232F] focus:border-indigo-500 rounded-xl px-4 py-2 text-xs text-white placeholder-gray-600 outline-none font-mono"
              />
            </div>

            {/* Actions Footer */}
            <div className="pt-4 border-t border-[#23232F] flex items-center justify-between">
              <button
                onClick={() => handleDeletePost(selectedPost.id)}
                className="text-xs text-rose-400 hover:text-rose-300 font-mono flex items-center gap-1 px-3 py-2 rounded-xl hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Post</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedPost(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white bg-[#0A0A0C] border border-[#23232F]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePostDetails}
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-xs font-medium transition-all shadow-lg shadow-indigo-600/20"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
