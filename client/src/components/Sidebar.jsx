import React from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  CalendarDays, 
  BarChart3, 
  Eye, 
  Github, 
  ShieldCheck,
  TrendingUp,
  Radio,
  Settings, 
  LogOut,
  Zap,
  X
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onLogout, mobileOpen, setMobileOpen }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'generator', label: 'Generator', icon: Sparkles, badge: 'AI' },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'tracker', label: 'Tracker', icon: BarChart3 },
    { id: 'competitors', label: 'Competitor Research', icon: Eye },
    { id: 'ad_intelligence', label: 'Ad Intelligence', icon: TrendingUp, badge: 'Longevity' },
    { id: 'intent_signals', label: 'Intent Signals', icon: Radio, badge: 'RSS' },
    { id: 'verification', label: 'Verification', icon: ShieldCheck, badge: 'Audit' },
    { id: 'github', label: 'GitHub Sync', icon: Github },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSelectTab = (id) => {
    setActiveTab(id);
    if (setMobileOpen) setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full">
      <div>
        {/* Header / Brand */}
        <div className="p-6 border-b border-[#23232F] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-heading font-bold text-sm shadow-lg shadow-indigo-600/30">
              CD
            </div>
            <div>
              <h1 className="font-heading font-bold text-sm text-white tracking-tight">Converge Digitals</h1>
              <p className="text-[11px] text-gray-500 font-mono">LinkedIn Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Active" />
            {mobileOpen && (
              <button
                onClick={() => setMobileOpen(false)}
                className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1A1A22]"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
          <div className="px-3 py-2 text-[10px] font-mono uppercase text-gray-500 tracking-wider">
            Internal Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-[#1A1A22]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-indigo-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Logout */}
      <div className="p-4 border-t border-[#23232F] space-y-3">
        <div className="bg-[#0A0A0C] border border-[#23232F] rounded-xl p-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-gray-300 font-mono text-[11px]">Today: Tue (Offer)</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
        </div>

        <button
          onClick={() => {
            if (setMobileOpen) setMobileOpen(false);
            onLogout();
          }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all font-mono"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Lock Dashboard</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#121216] border-r border-[#23232F] flex-col justify-between min-h-screen sticky top-0 z-30 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer Content */}
          <div className="relative w-72 max-w-[80vw] bg-[#121216] border-r border-[#23232F] h-full z-10 flex flex-col shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
