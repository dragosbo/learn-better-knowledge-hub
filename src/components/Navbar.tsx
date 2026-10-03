import React from 'react';
import { 
  PlaySquare, 
  BrainCircuit, 
  Sparkles, 
  GraduationCap, 
  GitBranch, 
  Zap, 
  ShieldCheck,
  Compass,
  HelpCircle,
  FileCode2,
  Network,
  FolderTree,
  MessageSquareCode,
  Milestone,
  Orbit,
  FileSearch,
  Maximize2,
  Minimize2,
  Presentation,
  BookOpen
} from 'lucide-react';
import { ActiveTab } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  hasGeminiKey: boolean;
  totalClips: number;
  totalNotes: number;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onOpenPrerequisites?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  hasGeminiKey,
  totalClips,
  totalNotes,
  isFullscreen,
  onToggleFullscreen,
  onOpenPrerequisites,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'playlists',
      label: 'Playlists & Clips',
      icon: <PlaySquare className="w-4 h-4" />,
      badge: `${totalClips}`,
    },
    {
      id: 'restructure',
      label: 'Allocation & Restructure',
      icon: <FolderTree className="w-4 h-4 text-indigo-400" />,
      badge: '71➔28 Plan • PDF',
    },
    {
      id: 'video-cosmos',
      label: 'Video Cosmos Graph',
      icon: <Orbit className="w-4 h-4 text-cyan-400" />,
      badge: 'Constellations & Trajectories',
    },
    {
      id: 'wordcloud-mindmap',
      label: 'Word Cloud & Mindmap',
      icon: <Network className="w-4 h-4 text-indigo-400" />,
      badge: 'Top 50 • 3-Tier',
    },
    {
      id: 'knowledge',
      label: 'Knowledge Hub',
      icon: <BrainCircuit className="w-4 h-4" />,
      badge: `${totalNotes} notes`,
    },
    {
      id: 'academy',
      label: 'AI Coding Academy',
      icon: <GraduationCap className="w-4 h-4" />,
      badge: '19 Lessons',
    },
    {
      id: 'gemini',
      label: 'Gemini AI Studio',
      icon: <Sparkles className="w-4 h-4 text-amber-500" />,
      badge: hasGeminiKey ? 'Active' : 'Offline Mode',
    },
    {
      id: 'gemini-chat',
      label: 'Gemini_development_chat',
      icon: <MessageSquareCode className="w-4 h-4 text-amber-400" />,
      badge: '22 Prompts • 100%',
    },
    {
      id: 'legacy-apps',
      label: 'Legacy Tools',
      icon: <Compass className="w-4 h-4 text-sky-400" />,
      badge: 'HTML Apps',
    },
    {
      id: 'python-code',
      label: 'Python Code',
      icon: <FileCode2 className="w-4 h-4 text-emerald-400" />,
      badge: '2-Col View',
    },
    {
      id: 'github-sync',
      label: 'GitHub Sync & Logs',
      icon: <GitBranch className="w-4 h-4" />,
      badge: 'Safe Push',
    },
    {
      id: 'guide',
      label: 'User Guide',
      icon: <HelpCircle className="w-4 h-4 text-emerald-400" />,
      badge: 'Audio Manual',
    },
    {
      id: 'roadmap',
      label: 'Roadmap & Multi-AI',
      icon: <Milestone className="w-4 h-4 text-emerald-400" />,
      badge: 'Architecture',
    },
    {
      id: 'analysis',
      label: 'Analysis',
      icon: <FileSearch className="w-4 h-4 text-sky-400" />,
      badge: 'Phases 1-3 • System Map',
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-100">
      <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8">
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

          {/* Right Actions & Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Analysis Button - Prominent for Transition Review */}
            <button
              id="header-analysis-btn"
              onClick={() => setActiveTab('analysis')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all shadow-sm ${
                activeTab === 'analysis'
                  ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-sky-950/60 ring-2 ring-sky-400/40'
                  : 'bg-sky-950/80 text-sky-300 border-sky-600/80 hover:bg-sky-900 hover:text-white'
              }`}
              title="Open the System Architecture, Capability Matrix & Agent Protocol (Phases 1-3)"
            >
              <FileSearch className="w-3.5 h-3.5 text-sky-300" />
              <span>Analysis</span>
              <span className="hidden md:inline text-[10px] px-1.5 py-0.2 bg-sky-900/90 text-sky-200 rounded font-semibold border border-sky-700/60">
                Phases 1-3
              </span>
            </button>

            {/* Gemini Development Chat Button - High priority action */}
            <button
              id="header-gemini-chat-btn"
              onClick={() => setActiveTab('gemini-chat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all shadow-sm ${
                activeTab === 'gemini-chat'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-amber-950/60 ring-2 ring-amber-400/40'
                  : 'bg-amber-950/70 text-amber-300 border-amber-600/80 hover:bg-amber-900/90 hover:text-white'
              }`}
              title="Open the complete Gemini Development Chat history & capability quantification"
            >
              <MessageSquareCode className="w-3.5 h-3.5 text-amber-300" />
              <span>Gemini_development_chat</span>
              <span className="hidden lg:inline text-[10px] px-1.5 py-0.2 bg-amber-900/90 text-amber-200 rounded font-semibold border border-amber-700/60">
                P01-P22
              </span>
            </button>

            {/* Quick Access User Guide Button */}
            <button
              id="header-user-guide-btn"
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all shadow-sm ${
                activeTab === 'guide'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-950/60'
                  : 'bg-emerald-950/70 text-emerald-300 border-emerald-700/80 hover:bg-emerald-900/80 hover:text-white'
              }`}
              title="Open the complete Learn Better User Guide & Audio Manual"
            >
              <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>User Guide</span>
              <span className="hidden md:inline text-[10px] px-1 py-0.2 bg-emerald-900/90 text-emerald-200 rounded">
                Manual
              </span>
            </button>

            {/* Prerequisites & Expertise Evaluation Button */}
            {onOpenPrerequisites && (
              <button
                id="header-prerequisites-btn"
                onClick={onOpenPrerequisites}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border bg-indigo-950/70 text-indigo-300 border-indigo-700/80 hover:bg-indigo-900/80 hover:text-white transition-all shadow-sm"
                title="Evaluate Level 1 to Level 10 codebase expertise & polyglot architecture (prerequisite.md)"
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span>Prerequisites</span>
                <span className="hidden md:inline text-[10px] px-1 py-0.2 bg-indigo-900/90 text-indigo-200 rounded">
                  L1–L10
                </span>
              </button>
            )}

            {/* Capability Slide Decks & Videos Launcher Button */}
            <a
              id="header-slide-decks-btn"
              href="/decks/00_SERIES_OVERVIEW_PLAYLIST.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border bg-gradient-to-r from-indigo-950 to-sky-950 text-sky-200 border-indigo-700/80 hover:border-sky-400 hover:text-white transition-all shadow-sm"
              title="Open the 15-Capability Slide Decks & Video Series"
            >
              <Presentation className="w-3.5 h-3.5 text-sky-400" />
              <span>Decks & Videos</span>
              <span className="hidden lg:inline text-[10px] px-1 py-0.2 bg-indigo-900/90 text-indigo-200 rounded font-semibold border border-indigo-700/60">
                15 Series
              </span>
            </a>

            {/* iPad / Web Fullscreen Toggle Button */}
            {onToggleFullscreen && (
              <button
                id="header-fullscreen-toggle-btn"
                onClick={onToggleFullscreen}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all shadow-sm ${
                  isFullscreen
                    ? 'bg-purple-600 text-white border-purple-400 shadow-purple-950/60 ring-2 ring-purple-400/40'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
                }`}
                title={isFullscreen ? 'Exit Fullscreen / Immersive Mode' : 'Toggle Fullscreen / Immersive iPad Viewport'}
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5 text-purple-200" />
                    <span className="hidden sm:inline">Exit Fullscreen</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 text-slate-300" />
                    <span className="hidden sm:inline">Fullscreen</span>
                  </>
                )}
              </button>
            )}

            <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border ${
              hasGeminiKey 
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80' 
                : 'bg-amber-950/40 text-amber-300 border-amber-800/60'
            }`}>
              {hasGeminiKey ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="hidden sm:inline">Gemini 2.5/Flash Connected</span>
                  <span className="sm:hidden">Gemini</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Free-Quota Friendly Mode</span>
                  <span className="sm:hidden">Offline</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation with horizontal scroll support */}
        <div className="flex space-x-1 overflow-x-auto py-2 border-t border-slate-800/70 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? item.id === 'analysis'
                      ? 'bg-sky-500 text-slate-950 font-bold border border-sky-400 shadow-sm'
                      : item.id === 'gemini-chat'
                      ? 'bg-amber-500 text-slate-950 font-bold border border-amber-400 shadow-sm'
                      : item.id === 'guide'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700 shadow-sm'
                      : 'bg-slate-800 text-sky-400 border border-slate-700 shadow-sm'
                    : item.id === 'analysis'
                    ? 'text-sky-300/90 hover:text-sky-100 hover:bg-sky-950/40 border border-sky-900/50'
                    : item.id === 'gemini-chat'
                    ? 'text-amber-300/90 hover:text-amber-100 hover:bg-amber-950/40 border border-amber-900/50'
                    : item.id === 'guide'
                    ? 'text-emerald-400/90 hover:text-emerald-200 hover:bg-emerald-950/40 border border-emerald-900/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                    isActive 
                      ? item.id === 'analysis' ? 'bg-slate-900 text-sky-300 border border-sky-600' : item.id === 'gemini-chat' ? 'bg-slate-900 text-amber-300 border border-amber-600' : item.id === 'guide' ? 'bg-emerald-900 text-emerald-200 border border-emerald-700' : 'bg-sky-950 text-sky-300 border border-sky-800' 
                      : item.id === 'analysis' ? 'bg-sky-950 text-sky-300 border border-sky-900' : item.id === 'gemini-chat' ? 'bg-amber-950 text-amber-300 border border-amber-900' : item.id === 'guide' ? 'bg-emerald-950 text-emerald-300 border border-emerald-900' : 'bg-slate-800 text-slate-400'
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
