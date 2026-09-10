import React from 'react';
import { 
  PlaySquare, 
  BrainCircuit, 
  Sparkles, 
  GraduationCap, 
  GitBranch, 
  Zap, 
  ShieldCheck 
} from 'lucide-react';
import { ActiveTab } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  hasGeminiKey: boolean;
  totalClips: number;
  totalNotes: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  hasGeminiKey,
  totalClips,
  totalNotes,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'playlists',
      label: 'Playlists & Clips',
      icon: <PlaySquare className="w-4 h-4" />,
      badge: `${totalClips}`,
    },
    {
      id: 'knowledge',
      label: 'Knowledge Hub',
      icon: <BrainCircuit className="w-4 h-4" />,
      badge: `${totalNotes} notes`,
    },
    {
      id: 'gemini',
      label: 'Gemini AI Studio',
      icon: <Sparkles className="w-4 h-4 text-amber-500" />,
      badge: hasGeminiKey ? 'Active' : 'Offline Mode',
    },
    {
      id: 'academy',
      label: 'AI Coding Academy',
      icon: <GraduationCap className="w-4 h-4" />,
      badge: '19 Lessons',
    },
    {
      id: 'github-sync',
      label: 'GitHub Sync & Logs',
      icon: <GitBranch className="w-4 h-4" />,
      badge: 'Safe Push',
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-sky-900/40">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">learn-better</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-sky-950 text-sky-400 border border-sky-800">
                  Hub v2.0
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                YouTube Playlists &bull; Knowledge Consolidation &bull; Multi-AI Vibe Coding
              </p>
            </div>
          </div>

          {/* Right Status */}
          <div className="flex items-center gap-2.5">
            <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${
              hasGeminiKey 
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80' 
                : 'bg-amber-950/40 text-amber-300 border-amber-800/60'
            }`}>
              {hasGeminiKey ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Gemini 2.5/Flash Connected</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Free-Quota Friendly Mode</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 overflow-x-auto py-2 border-t border-slate-800/70 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-sky-400 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-sky-950 text-sky-300 border border-sky-800' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
