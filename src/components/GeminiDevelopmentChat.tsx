import React, { useState, useMemo } from 'react';
import { 
  MessageSquareCode, 
  ExternalLink, 
  Download, 
  Printer, 
  Search, 
  ChevronDown, 
  ChevronRight, 
  Copy, 
  Check, 
  Sparkles, 
  User, 
  Layers, 
  CheckCircle2, 
  ShieldAlert,
  Flame,
  FileCode2,
  Calendar,
  Clock,
  Maximize2
} from 'lucide-react';
import { 
  CHAT_HISTORY_ENTRIES, 
  EFFICIENCY_SUGGESTIONS, 
  ChatEntry,
  ChatCodeBlock 
} from '../data/geminiChatData';

export const GeminiDevelopmentChat: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSession, setSelectedSession] = useState<number | 'all'>('all');
  const [collapsedPrompts, setCollapsedPrompts] = useState<Record<string, boolean>>({});
  const [collapsedAnswers, setCollapsedAnswers] = useState<Record<string, boolean>>({});
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'interactive' | 'iframe'>('interactive');

  // Filter entries
  const filteredEntries = useMemo(() => {
    return CHAT_HISTORY_ENTRIES.filter(entry => {
      if (selectedSession !== 'all' && entry.session !== selectedSession) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        entry.userPromptVerbatim.toLowerCase().includes(q) ||
        entry.assistantResponseMarkdown.toLowerCase().includes(q) ||
        entry.capabilitySummary.toLowerCase().includes(q) ||
        entry.featuresIntroduced.some(f => f.toLowerCase().includes(q)) ||
        entry.id.toLowerCase().includes(q) ||
        `prompt ${entry.number}`.includes(q)
      );
    });
  }, [searchQuery, selectedSession]);

  // Toggle individual prompt / answer collapse
  const togglePromptCollapse = (id: string) => {
    setCollapsedPrompts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAnswerCollapse = (id: string) => {
    setCollapsedAnswers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    setCollapsedPrompts({});
    setCollapsedAnswers({});
  };

  const collapseAll = () => {
    const allPrompts: Record<string, boolean> = {};
    const allAnswers: Record<string, boolean> = {};
    CHAT_HISTORY_ENTRIES.forEach(e => {
      allPrompts[e.id] = true;
      allAnswers[e.id] = true;
    });
    setCollapsedPrompts(allPrompts);
    setCollapsedAnswers(allAnswers);
  };

  // Copy code helper
  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // Download HTML file trigger
  const handleDownloadHtml = () => {
    const link = document.createElement('a');
    link.href = '/gemini_chat/chat_history.html';
    link.download = 'gemini_chat_history.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render language-specific pastel code block
  const renderCodeBlock = (block: ChatCodeBlock, idx: number, parentId: string) => {
    const blockId = `${parentId}-code-${idx}`;
    const lang = block.language.toLowerCase();

    let langColorClass = 'bg-slate-50 border-slate-300 text-slate-900';
    let headerColorClass = 'bg-slate-200/70 text-slate-800 border-slate-300';
    let icon = '📄';
    let label = block.language.toUpperCase();

    if (lang === 'python') {
      langColorClass = 'bg-emerald-50/80 border-emerald-300 text-emerald-950';
      headerColorClass = 'bg-emerald-100 text-emerald-900 border-emerald-300';
      icon = '🐍';
      label = 'Python';
    } else if (lang === 'typescript' || lang === 'javascript') {
      langColorClass = 'bg-sky-50/80 border-sky-300 text-sky-950';
      headerColorClass = 'bg-sky-100 text-sky-900 border-sky-300';
      icon = '⚡';
      label = 'TypeScript';
    } else if (lang === 'bash') {
      langColorClass = 'bg-slate-100/90 border-slate-300 text-slate-900';
      headerColorClass = 'bg-slate-200 text-slate-800 border-slate-300';
      icon = '💻';
      label = 'Bash / CLI';
    } else if (lang === 'html' || lang === 'css') {
      langColorClass = 'bg-rose-50/80 border-rose-300 text-rose-950';
      headerColorClass = 'bg-rose-100 text-rose-900 border-rose-300';
      icon = '🌐';
      label = 'HTML / CSS';
    } else if (lang === 'json') {
      langColorClass = 'bg-amber-50/80 border-amber-300 text-amber-950';
      headerColorClass = 'bg-amber-100 text-amber-900 border-amber-300';
      icon = '{ }';
      label = 'JSON / Config';
    } else if (lang === 'sql') {
      langColorClass = 'bg-purple-50/80 border-purple-300 text-purple-950';
      headerColorClass = 'bg-purple-100 text-purple-900 border-purple-300';
      icon = '🗄️';
      label = 'SQL';
    }

    return (
      <div key={blockId} className={`my-3 rounded-lg border overflow-hidden shadow-sm ${langColorClass}`}>
        <div className={`flex items-center justify-between px-3 py-1.5 border-b text-xs font-semibold ${headerColorClass}`}>
          <div className="flex items-center gap-2">
            <span>{icon}</span>
            <span>{label}</span>
            {block.caption && <span className="opacity-75 font-normal text-[11px]">&bull; {block.caption}</span>}
          </div>
          <button
            onClick={() => handleCopyCode(block.code, blockId)}
            className="flex items-center gap-1 px-2 py-0.5 rounded border border-current hover:opacity-80 transition-opacity"
            title="Copy code snippet"
          >
            {copiedCodeId === blockId ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        <pre className="p-3 font-mono text-xs overflow-x-auto whitespace-pre leading-relaxed">
          <code>{block.code}</code>
        </pre>
      </div>
    );
  };

  return (
    <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner & Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md text-slate-100">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-950/40">
                <MessageSquareCode className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  Gemini_development_chat
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                    Standalone HTML &bull; gemini_chat/chat_history.html
                  </span>
                </h1>
                <p className="text-xs text-slate-400">
                  Verbatim chronological audit chronicle of all 15 user prompts paired with exact assistant sidebar responses.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="/gemini_chat/chat_history.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md shadow-amber-950/40"
              title="Open the standalone HTML file in a new browser tab"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open Standalone HTML</span>
            </a>

            <button
              onClick={handleDownloadHtml}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow-sm"
              title="Download chat_history.html directly to disk"
            >
              <Download className="w-4 h-4 text-sky-400" />
              <span>Download .html</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow-sm"
              title="Print dialogue to formatted PDF"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Save as PDF</span>
            </button>

            <button
              onClick={() => setViewMode(viewMode === 'interactive' ? 'iframe' : 'interactive')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow-sm"
              title="Toggle between native React interactive view and embedded standalone HTML file"
            >
              <Maximize2 className="w-4 h-4 text-purple-400" />
              <span>{viewMode === 'interactive' ? 'Embedded HTML Frame' : 'Interactive App View'}</span>
            </button>
          </div>
        </div>

        {/* Capability Attribution Progress Bar */}
        <div className="mt-6 pt-6 border-t border-slate-800 space-y-3">
          <div className="flex flex-wrap justify-between items-center text-xs">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-400" />
              Total Web App Capability Attribution: 100% Fully Accounted Across 15 Prompts
            </span>
            <span className="text-amber-400 font-bold">
              15 Prompts &bull; 5 Working Sessions &bull; 486 YouTube Clips &bull; 28 Clusters
            </span>
          </div>

          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex border border-slate-700 shadow-inner">
            <div className="h-full bg-indigo-500" style={{ width: '22%' }} title="Session 1: Core Scaffolding (22%)"></div>
            <div className="h-full bg-emerald-500" style={{ width: '17%' }} title="Session 2: Audio Synthesis & Pacing (17%)"></div>
            <div className="h-full bg-sky-500" style={{ width: '41%' }} title="Session 3: 70-Playlist Scraper, 2-Col Code & Exports (41%)"></div>
            <div className="h-full bg-purple-500" style={{ width: '12%' }} title="Session 4: 28-Thematic Restructuring Hub & Python Script (12%)"></div>
            <div className="h-full bg-amber-400" style={{ width: '8%' }} title="Session 5: Quota Recovery & Chat History Suite (8%)"></div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-[11px] text-slate-400 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span>S1: Core App (22%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>S2: AirPods Audio (17%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span>
              <span>S3: YouTube &amp; Code (41%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              <span>S4: 28-Cluster Hub (12%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>S5: Chat Suite (8%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Iframe View (if toggled) */}
      {viewMode === 'iframe' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-lg">
          <div className="bg-slate-800 text-slate-200 px-4 py-2 text-xs flex justify-between items-center">
            <span>Direct Render of <code>/gemini_chat/chat_history.html</code></span>
            <button 
              onClick={() => setViewMode('interactive')}
              className="text-amber-400 hover:underline"
            >
              Switch Back to Interactive View
            </button>
          </div>
          <iframe 
            src="/gemini_chat/chat_history.html" 
            title="Gemini Chat History Standalone" 
            className="w-full h-[800px] border-none"
          />
        </div>
      )}

      {/* Interactive In-App View */}
      {viewMode === 'interactive' && (
        <>
          {/* Filter & Jumper Bar */}
          <div className="sticky top-16 z-30 bg-slate-950/90 backdrop-blur border border-slate-800 rounded-xl p-3 shadow-md flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[260px]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search prompts, answers, code, tags..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Sessions (1-5)</option>
                <option value="1">Session 1 (2026-09-09)</option>
                <option value="2">Session 2 (2026-09-10)</option>
                <option value="3">Session 3 (2026-09-11)</option>
                <option value="4">Session 4 (2026-09-12)</option>
                <option value="5">Session 5 (2026-09-13)</option>
              </select>
            </div>

            {/* Quick Jumper Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-400 font-semibold hidden md:inline">Jump:</span>
              {CHAT_HISTORY_ENTRIES.map(e => (
                <a
                  key={e.id}
                  href={`#${e.id}`}
                  className="px-1.5 py-0.5 text-[11px] font-bold rounded bg-slate-800 hover:bg-amber-950 hover:text-amber-300 text-slate-300 border border-slate-700 hover:border-amber-700 transition-colors"
                  title={`Prompt ${e.number}: ${e.capabilitySummary}`}
                >
                  P{e.number < 10 ? '0' + e.number : e.number}
                </a>
              ))}
            </div>

            {/* Expand / Collapse All */}
            <div className="flex items-center gap-2">
              <button
                onClick={expandAll}
                className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Daily Quota Notice Alert */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3 text-amber-200 text-xs">
            <Flame className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300 font-bold block mb-1">
                Daily Interaction Quota Pacing &amp; Rate-Limit Signaling:
              </strong>
              <span>
                Free-tier developers are subject to daily token and request boundaries (~25M tokens/day and 10,000 requests/day). 
                Each prompt below indicates its session date, turn index, and estimated token footprint. By clustering composite requests 
                into structured, multi-requirement prompts (as demonstrated in Prompts 02, 11, 13, and 15), you achieve maximum capability gain per daily interaction turn.
              </span>
            </div>
          </div>

          {/* Prompt Cards List */}
          <div className="space-y-6">
            {filteredEntries.map((entry) => {
              const isPromptCollapsed = collapsedPrompts[entry.id] || false;
              const isAnswerCollapsed = collapsedAnswers[entry.id] || false;

              const quotaStatusBadge = 
                entry.quotaSignal.quotaStatus === 'safe' 
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800' 
                  : entry.quotaSignal.quotaStatus === 'moderate'
                  ? 'bg-sky-950/80 text-sky-300 border-sky-800'
                  : entry.quotaSignal.quotaStatus === 'near-limit'
                  ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                  : 'bg-purple-950/80 text-purple-300 border-purple-800';

              return (
                <div 
                  key={entry.id} 
                  id={entry.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-md transition-all hover:border-slate-700"
                >
                  {/* Card Meta Bar */}
                  <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 text-xs font-black rounded bg-amber-400 text-slate-950">
                        Prompt #{entry.number < 10 ? '0' + entry.number : entry.number}
                      </span>
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        Session {entry.session} &bull; {entry.sessionDate}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-600" />
                        {entry.timestamp}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full border ${quotaStatusBadge}`} title={entry.quotaSignal.note}>
                        Quota: {entry.quotaSignal.quotaStatus.toUpperCase()} ({entry.quotaSignal.estimatedTokens})
                      </span>
                      <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                        🎯 +{entry.capabilityPercent}% Capability ({entry.cumulativePercent}% Total)
                      </span>
                    </div>
                  </div>

                  {/* Capability Deliverable Summary */}
                  <div className="bg-slate-900/60 px-4 py-3 border-b border-slate-800/80 text-xs">
                    <div className="font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Key Outcome: {entry.capabilitySummary}</span>
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-400 pl-1">
                      {entry.featuresIntroduced.map((feat, fIdx) => (
                        <li key={fIdx}>{feat}</li>
                      ))}
                    </ul>
                  </div>

                  {/* 1. User Verbatim Prompt (Pastel Butter / Peach) */}
                  <div className="border-b border-slate-800">
                    <button
                      onClick={() => togglePromptCollapse(entry.id)}
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-amber-100/90 hover:bg-amber-100 border-l-4 border-amber-400 text-amber-950 text-left transition-colors"
                    >
                      <div className="flex items-center gap-2 font-bold text-xs">
                        <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-[10px]">
                          <User className="w-3 h-3" />
                        </span>
                        <span>User Verbatim Prompt</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-900">
                        <span>{isPromptCollapsed ? 'Expand' : 'Collapse'}</span>
                        {isPromptCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </div>
                    </button>

                    {!isPromptCollapsed && (
                      <div className="p-4 bg-amber-50/90 text-amber-950 font-mono text-xs leading-relaxed whitespace-pre-wrap border-l-4 border-amber-400">
                        {entry.userPromptVerbatim}
                      </div>
                    )}
                  </div>

                  {/* 2. Assistant Sidebar Response (Pastel Mint / Soft Ice Periwinkle) */}
                  <div>
                    <button
                      onClick={() => toggleAnswerCollapse(entry.id)}
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-emerald-100/80 hover:bg-emerald-100 border-l-4 border-emerald-500 text-emerald-950 text-left transition-colors"
                    >
                      <div className="flex items-center gap-2 font-bold text-xs">
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px]">
                          <Sparkles className="w-3 h-3" />
                        </span>
                        <span>Gemini Assistant Exact Sidebar Response</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-900">
                        <span>{isAnswerCollapsed ? 'Expand' : 'Collapse'}</span>
                        {isAnswerCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </div>
                    </button>

                    {!isAnswerCollapsed && (
                      <div className="p-4 bg-emerald-50/70 text-slate-900 text-xs leading-relaxed border-l-4 border-emerald-500 space-y-3">
                        <div className="whitespace-pre-wrap font-sans text-slate-800 leading-relaxed">
                          {entry.assistantResponseMarkdown}
                        </div>

                        {/* Code Blocks with Language-Specific Pastel Colors */}
                        {entry.codeBlocks && entry.codeBlocks.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-emerald-200/60">
                            <span className="text-[11px] font-bold text-emerald-900 block mb-2">
                              Code Artifacts Implemented in this Turn:
                            </span>
                            {entry.codeBlocks.map((cb, cIdx) => renderCodeBlock(cb, cIdx, entry.id))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Efficiency Playbook & Future Collaboration */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md text-slate-100 space-y-4">
            <div>
              <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                <FileCode2 className="w-5 h-5 text-indigo-400" />
                Vibe Coding Efficiency Playbook &amp; Multi-AI Collaboration
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Best practices for single-model pacing today, and blueprints for collaborating with Claude, Cursor, and Codex tomorrow.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {EFFICIENCY_SUGGESTIONS.map((sug) => {
                const impactBadge = 
                  sug.impact === 'Critical' ? 'bg-red-950 text-red-300 border-red-800' :
                  sug.impact === 'Very High' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                  'bg-emerald-950 text-emerald-300 border-emerald-800';

                return (
                  <div key={sug.id} className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-indigo-400 uppercase tracking-wider">{sug.category}</span>
                        <span className={`px-2 py-0.5 rounded-full border font-bold ${impactBadge}`}>{sug.impact}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-100">{sug.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{sug.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px]">
                      <div className="bg-slate-900 p-2 rounded border border-slate-800 font-mono text-slate-300">
                        <strong className="text-emerald-400 block font-sans text-[10px] uppercase font-bold mb-0.5">Recommended Pattern:</strong>
                        {sug.concreteExample}
                      </div>
                      <div className="text-red-400 text-[10px]">
                        <strong>⚠️ Avoid:</strong> {sug.antiPatternToAvoid}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

    </div>
  );
};
