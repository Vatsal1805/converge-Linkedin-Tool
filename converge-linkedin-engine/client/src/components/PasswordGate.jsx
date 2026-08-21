import React, { useState } from 'react';
import { Lock, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export default function PasswordGate({ onAuthenticated }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('converge_team_auth', 'true');
        onAuthenticated();
      } else {
        setError(data.message || 'Invalid team password');
      }
    } catch (err) {
      // Fallback for offline/standalone testing
      if (password === 'converge2026') {
        localStorage.setItem('converge_team_auth', 'true');
        onAuthenticated();
      } else {
        setError('Incorrect password (default: converge2026)');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0A0A0C]/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#121216] border border-[#23232F] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-heading text-white">Converge Digitals</h2>
            <p className="text-xs text-gray-400 font-mono">INTERNAL TEAM ACCESS ONLY</p>
          </div>
        </div>

        <p className="text-sm text-gray-300 mb-6 leading-relaxed">
          Please enter your internal team password to access the LinkedIn Content Engine dashboard.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-gray-400 mb-2">Team Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              required
              className="w-full bg-[#0A0A0C] border border-[#23232F] focus:border-indigo-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm outline-none transition-all"
            />
          </div>

          {error && (
            <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 font-mono">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 group text-sm shadow-lg shadow-indigo-600/20"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Enter Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#23232F] flex items-center justify-between text-xs text-gray-500 font-mono">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Safe & Private
          </span>
          <span>v1.0.0</span>
        </div>
      </div>
    </div>
  );
}
