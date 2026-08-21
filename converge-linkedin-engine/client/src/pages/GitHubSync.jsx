import React, { useState, useEffect } from 'react';
import { 
  Github, 
  RefreshCw, 
  ShieldCheck, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  Code, 
  Layers,
  Clock,
  Lock
} from 'lucide-react';

export default function GitHubSync() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/github/projects');
      const data = await res.json();
      if (data.success) {
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error('Failed to fetch github projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerSync = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch('/api/github/sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSyncMessage(data.message);
        await fetchProjects();
      }
    } catch (err) {
      console.error('Failed to sync GitHub repos:', err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="bg-[#121216] border border-[#23232F] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-purple-400">ORGANIZATION METADATA CRAWLER</span>
            <span className="text-xs text-gray-600">•</span>
            <span className="text-xs font-mono text-emerald-400">Read-Only PAT Connected</span>
          </div>
          <h1 className="text-xl font-bold font-heading text-white">GitHub Shipped Projects Sync</h1>
        </div>

        <button
          onClick={handleTriggerSync}
          disabled={syncing}
          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-medium px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Syncing Repositories...' : 'Trigger Sync Now'}</span>
        </button>
      </div>

      {/* Sync Status Toast Notice */}
      {syncMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl p-4 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* 100% Security Assurance Banner */}
      <div className="bg-[#0A0A0C] border border-[#23232F] rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold font-heading text-white flex items-center gap-2">
            <span>100% Safe Metadata Extraction</span>
            <span className="px-2 py-0.5 text-[9px] font-mono bg-emerald-500/20 text-emerald-300 rounded-full">
              Zero Code Exposure
            </span>
          </h4>
          <p className="text-xs text-gray-400 leading-relaxed font-sans">
            The crawler reads only repository names, tech stack arrays, README summaries, and live URLs to generate authentic **Proof** and **Aradhya** post ideas. Your actual proprietary source code, secrets, and environment variables are **never** downloaded, read, or exposed.
          </p>
        </div>
      </div>

      {/* Synced Repositories Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold font-heading text-white">Synced Repositories ({projects.length})</h3>
          <span className="text-xs text-gray-500 font-mono">Auto-feeds Proof & Aradhya Pillars</span>
        </div>

        {loading ? (
          <div className="p-8 text-center bg-[#121216] border border-[#23232F] rounded-2xl text-xs font-mono text-gray-500">
            Loading synced GitHub projects...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {projects.map((repo) => (
              <div
                key={repo.id}
                className="bg-[#121216] border border-[#23232F] hover:border-purple-500/40 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#23232F] pb-3">
                    <div className="flex items-center gap-2">
                      <Github className="w-4 h-4 text-purple-400" />
                      <h4 className="text-sm font-bold font-heading text-white truncate max-w-[180px]">{repo.repo_name}</h4>
                    </div>

                    {repo.client_name && (
                      <span className="px-2 py-0.5 text-[9px] font-mono rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {repo.client_name}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-300 font-sans leading-relaxed line-clamp-3">
                    {repo.description || 'Shipped digital marketing and web application repository.'}
                  </p>

                  {/* Tech Stack Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {Array.isArray(repo.tech_stack) && repo.tech_stack.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 text-[10px] font-mono rounded bg-[#0A0A0C] text-gray-400 border border-[#23232F]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#23232F] flex items-center justify-between text-[10px] font-mono text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-purple-400" />
                    Synced: {new Date(repo.last_synced_at).toLocaleDateString()}
                  </span>

                  {repo.live_url && (
                    <a
                      href={repo.live_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-purple-400 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" /> Live Demo
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
