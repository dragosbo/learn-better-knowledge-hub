import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import { 
  FileSearch, 
  Cpu, 
  Layers, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Code2, 
  Terminal, 
  Users, 
  Bot, 
  Sparkles, 
  Copy, 
  Check, 
  BookOpen, 
  Orbit, 
  Network, 
  FolderTree, 
  RefreshCw, 
  Maximize2, 
  Minimize2, 
  Download, 
  Eye, 
  FileCode2, 
  FileText 
} from 'lucide-react';

interface CapabilityItem {
  id: string;
  title: string;
  badge: string;
  category: 'Media & Data' | 'Spatial & Viz' | 'Audio & AI' | 'DevOps & Docs';
  audience: 'human' | 'agent' | 'both';
  summary: string;
  files: string[];
  humanExperience: string;
  agentContract: string;
  reliability: 'High' | 'Medium' | 'Experimental';
}

const CAPABILITIES: CapabilityItem[] = [
  {
    id: '01',
    title: 'Playlists & Clips Management',
    badge: 'Core Media',
    category: 'Media & Data',
    audience: 'both',
    summary: 'Catalogs 71 YouTube playlists and 471+ clips with status tracking (to-watch, in-progress, synthesized, mastered), notes, and tags.',
    files: ['src/components/PlaylistManager.tsx', 'src/data/channelPlaylists.json', 'server.ts (lines 347-381)'],
    humanExperience: 'Visual card grid with search, tag filters, clip status dropdowns, and one-click launch into the study studio.',
    agentContract: 'Deterministic JSON schema with id, title, channel, duration, notes, userQuestions, and userIdeas attributes.',
    reliability: 'High'
  },
  {
    id: '02',
    title: 'Allocation & Restructure Hub',
    badge: 'Data Architecture',
    category: 'Media & Data',
    audience: 'both',
    summary: 'Re-aggregates 71 fragmented micro-playlists into 28 balanced clusters with live side-by-side reallocation and automated multi-page PDF generation.',
    files: ['src/components/PlaylistRestructureHub.tsx', 'src/data/playlistRestructureData.ts', 'jspdf & autotable'],
    humanExperience: 'Color-coded reallocation matrix, cluster breakdown cards, and 1-click executive PDF report export with table styling.',
    agentContract: 'Algorithmic cluster mapping specification (RESTRUCTURE_CLUSTERS) with unambiguous string matching rules.',
    reliability: 'High'
  },
  {
    id: '03',
    title: 'Video Cosmos Graph',
    badge: 'Spatial Navigation',
    category: 'Spatial & Viz',
    audience: 'human',
    summary: '2D HTML5 Canvas celestial galaxy rendering 471 clips as stars in 5 sectoral quadrants with orbital constellation rings and flight recording.',
    files: ['src/components/VideoCosmosGraph.tsx', 'src/data/videoCosmosData.ts'],
    humanExperience: 'High-speed 60fps pan/zoom spatial navigation, star twinkle, constellation lines, and touch gesture support.',
    agentContract: 'Topological coordinate assignment algorithms and cluster centroid calculations in cartesian space.',
    reliability: 'High'
  },
  {
    id: '04',
    title: 'Word Cloud & Mind Map Hub',
    badge: 'Analytics',
    category: 'Spatial & Viz',
    audience: 'both',
    summary: 'D3/Canvas-powered frequency analysis of technical terminology across all playlists with a synchronized 3-tier hierarchical mind map.',
    files: ['src/components/PlaylistWordCloudMindMap.tsx', 'src/data/wordcloudMindmapData.ts', 'server.ts (lines 384-454)'],
    humanExperience: 'Interactive term filtering; visual inspection of curriculum vocabulary distributions.',
    agentContract: 'Tokenization pipeline, stopword filtering, and term weight calculations.',
    reliability: 'High'
  },
  {
    id: '05',
    title: 'Knowledge Hub & Study Studio',
    badge: 'Active Recall',
    category: 'Media & Data',
    audience: 'both',
    summary: 'Focused single-clip study studio combining YouTube video playback, transcripts, personal user notes, questions, and ideas.',
    files: ['src/components/KnowledgeHub.tsx', 'src/data/initialData.ts', 'App.tsx'],
    humanExperience: 'Split-screen video watching and note taking; question-and-answer tracking.',
    agentContract: 'Array structures for userQuestions and userIdeas ready for automated LLM quiz generation.',
    reliability: 'High'
  },
  {
    id: '06',
    title: 'AI Coding Academy',
    badge: 'Curriculum',
    category: 'DevOps & Docs',
    audience: 'both',
    summary: '19 structured lessons (Claude prompt engineering + Kiro CLI workflows) rendered from markdown into an interactive course viewer.',
    files: ['src/components/AILearningAcademy.tsx', 'imported_repo/lessons_*', 'server.ts (lines 85-121)'],
    humanExperience: 'Formatted lesson reading, completion progress tracking, and chapter jump menu.',
    agentContract: 'Raw markdown lesson files accessible for prompt distillation and agent learning.',
    reliability: 'High'
  },
  {
    id: '07',
    title: 'AirPods Audio Player',
    badge: 'Hands-Free Audio',
    category: 'Audio & AI',
    audience: 'human',
    summary: 'Zero-cost client-side speech synthesis with Media Session API remote controls (play, pause, skip on AirPods stem while walking).',
    files: ['src/components/AudioLessonPlayer.tsx', 'Web Speech API', 'navigator.mediaSession'],
    humanExperience: 'Learn on walks or commutes without looking at the screen; speed adjustment (0.75x to 1.5x).',
    agentContract: 'Text chunking pipeline splitting long markdown articles into speech-safe paragraphs.',
    reliability: 'High'
  },
  {
    id: '08',
    title: 'Gemini AI Studio',
    badge: 'Generative AI',
    category: 'Audio & AI',
    audience: 'both',
    summary: 'Multi-model Gemini cascade (3.8-flash, flash-latest, 2.5-flash) with automatic 503 high-demand heuristic fallback for insights and vibe pilot.',
    files: ['src/components/GeminiStudio.tsx', 'server.ts (lines 694-951)', '@google/genai'],
    humanExperience: 'One-click extraction of insights, quiz questions, and prompt optimization directly into notes.',
    agentContract: 'Strict JSON schema generation (responseMimeType: application/json) and heuristic fallback resilience.',
    reliability: 'High'
  },
  {
    id: '09',
    title: 'Gemini Development Chat',
    badge: 'Audit Trail',
    category: 'DevOps & Docs',
    audience: 'both',
    summary: 'Complete audit trail and visual viewer for all project prompts, capability evaluations, and session logs (100% coverage).',
    files: ['src/components/GeminiDevelopmentChat.tsx', 'src/data/geminiChatData.ts', 'gemini_chat/chat_history.html'],
    humanExperience: 'Searchable conversational history with capability breakdowns and code changes.',
    agentContract: 'Verbatim prompt ledger (gemini_prompts.md) serving as prompt regression baseline.',
    reliability: 'High'
  },
  {
    id: '10',
    title: 'Legacy HTML Tools Hub',
    badge: 'Compatibility',
    category: 'DevOps & Docs',
    audience: 'human',
    summary: 'Sandboxed iframe runner for original standalone HTML tools (YouTube explorer, standalone Claude reader, Kiro reader, wordcloud).',
    files: ['src/components/LegacyAppsHub.tsx', 'server.ts (lines 142-177)', 'imported_repo/*.html'],
    humanExperience: 'Run pre-existing standalone tools without leaving the modern React interface.',
    agentContract: 'Clean isolated routes (/legacy/*) ensuring zero code breakage during modernization.',
    reliability: 'High'
  },
  {
    id: '11',
    title: 'Python Code Viewer',
    badge: 'Engineering',
    category: 'DevOps & Docs',
    audience: 'both',
    summary: 'Two-column IDE layout with syntax highlighting and I/O specifications for backend Python scripts (transcription, audio re-encoding, speech).',
    files: ['src/components/PythonCodeViewer.tsx', 'src/data/pythonFiles.ts', 'server.ts (lines 275-309)'],
    humanExperience: 'Side-by-side code inspection, line counts, function signatures, and vibe-coding rationale.',
    agentContract: 'Structured I/O and dependency mapping metadata for each Python file.',
    reliability: 'High'
  },
  {
    id: '12',
    title: 'GitHub Sync & Audit Guide',
    badge: 'DevOps',
    category: 'DevOps & Docs',
    audience: 'both',
    summary: 'Safe export guides, .bat/.sh synchronization scripts, and branch isolation instructions preventing repository overwrite.',
    files: ['src/components/GitHubSyncGuide.tsx', 'export_to_github.sh', 'export_to_github.bat'],
    humanExperience: 'One-click copyable git commands with visual conflict avoidance explanations.',
    agentContract: 'Exact CLI arguments and non-destructive git push procedures.',
    reliability: 'High'
  },
  {
    id: '13',
    title: 'Interactive User Guide',
    badge: 'Documentation',
    category: 'DevOps & Docs',
    audience: 'both',
    summary: 'Full markdown documentation viewer with built-in voice narration and quick-jump anchor navigation.',
    files: ['src/components/UserGuideViewer.tsx', 'USER_GUIDE.md', 'src/utils/guideHtmlFormatter.ts'],
    humanExperience: 'Listen to the manual or jump directly to specific feature workflows.',
    agentContract: 'Comprehensive natural-language specification of all application capabilities.',
    reliability: 'High'
  },
  {
    id: '14',
    title: 'Ecosystem Roadmap Hub',
    badge: 'Architecture',
    category: 'DevOps & Docs',
    audience: 'both',
    summary: 'Strategic architecture guide detailing multi-device sync, blob asset strategies, and multi-model agent collaboration blueprints.',
    files: ['src/components/RoadmapHub.tsx', 'src/data/roadmapData.ts', 'suggestions.md'],
    humanExperience: 'Visual milestone cards, technical guides, and multi-AI handoff protocols.',
    agentContract: 'Machine-parsable milestone identifiers and implementation roadmaps.',
    reliability: 'High'
  }
];

type AnalysisViewMode = 'overview' | 'html-report' | 'markdown-spec';

export const AnalysisHub: React.FC = () => {
  const [activeViewMode, setActiveViewMode] = useState<AnalysisViewMode>('overview');
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [htmlUrl, setHtmlUrl] = useState<string>('/analysis/01_high_level_system_architecture.html');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [isIframeFullscreen, setIsIframeFullscreen] = useState<boolean>(false);
  const [markdownViewType, setMarkdownViewType] = useState<'formatted' | 'raw'>('formatted');
  const [copiedMarkdownText, setCopiedMarkdownText] = useState<boolean>(false);
  const [activeAudienceFilter, setActiveAudienceFilter] = useState<'all' | 'human' | 'agent'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);

  useEffect(() => {
    fetch('/api/analysis/data')
      .then((res) => {
        if (!res.ok) throw new Error('API fetch failed');
        return res.json();
      })
      .then((data) => {
        if (data.markdown) setMarkdownContent(data.markdown);
        if (data.htmlUrl) setHtmlUrl(data.htmlUrl);
        setIsLoading(false);
      })
      .catch(() => {
        // Fallback to static serving
        fetch('/analysis/01_HIGH_LEVEL_SYSTEM_ARCHITECTURE.md')
          .then((r) => r.text())
          .then((txt) => {
            setMarkdownContent(txt);
            setIsLoading(false);
          })
          .catch(() => setIsLoading(false));
      });
  }, []);

  const filteredCapabilities = CAPABILITIES.filter((c) => {
    const matchesAudience = 
      activeAudienceFilter === 'all' || 
      c.audience === activeAudienceFilter || 
      c.audience === 'both';
    const matchesSearch = 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.files.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesAudience && matchesSearch;
  });

  const handleCopyMarkdownPath = () => {
    navigator.clipboard.writeText('/analysis/01_HIGH_LEVEL_SYSTEM_ARCHITECTURE.md');
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2000);
  };

  const handleDownloadHtml = () => {
    const link = document.createElement('a');
    link.href = htmlUrl;
    link.download = '01_high_level_system_architecture.html';
    link.click();
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '01_HIGH_LEVEL_SYSTEM_ARCHITECTURE.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyMarkdownText = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopiedMarkdownText(true);
    setTimeout(() => setCopiedMarkdownText(false), 2000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Header */}
      <div className="rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/80 text-sky-400 border border-sky-800 text-xs font-semibold">
            <Cpu className="w-3.5 h-3.5" />
            <span>Architecture &amp; Capability Introspection</span>
            <span>&bull;</span>
            <span className="text-emerald-400">Phase 1 Baseline</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Transitioning from Vibe Coding to Engineered Architecture
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            This module provides a comprehensive high-level analysis of <strong className="text-white">learn-better</strong>. 
            Having proven high capability density through fast-paced human + AI vibe coding, we are now laying the 
            architectural foundation to make the system robust, modular, easily maintainable, and natively accessible to both <strong className="text-sky-400">humans</strong> and <strong className="text-amber-400">autonomous AI agents</strong>.
          </p>

          {/* Quick Review Navigation Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="analysis-hero-html-btn"
              onClick={() => setActiveViewMode('html-report')}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all shadow-md ${
                activeViewMode === 'html-report'
                  ? 'bg-sky-500 text-slate-950 ring-2 ring-sky-300'
                  : 'bg-sky-600 hover:bg-sky-500 text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Review Interactive HTML Report</span>
            </button>

            <button
              id="analysis-hero-md-btn"
              onClick={() => setActiveViewMode('markdown-spec')}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all shadow-md ${
                activeViewMode === 'markdown-spec'
                  ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                  : 'bg-amber-600/90 hover:bg-amber-500 text-white'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>Inspect Agent Markdown (.md)</span>
            </button>

            <button
              id="analysis-hero-overview-btn"
              onClick={() => setActiveViewMode('overview')}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeViewMode === 'overview'
                  ? 'bg-slate-700 text-white border border-slate-600'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Overview &amp; 14 Capabilities</span>
            </button>

            <a
              href="/analysis/01_high_level_system_architecture.html"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
              title="Open standalone report in external tab if supported"
            >
              <span>External Tab</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            <button
              onClick={handleCopyMarkdownPath}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
              title="Copy local workspace path to clipboard"
            >
              {copiedMarkdown ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copiedMarkdown ? 'Path Copied!' : 'Copy Path'}</span>
            </button>
          </div>
        </div>

        {/* Quick Stat Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-xl sm:text-2xl font-bold text-sky-400">14</div>
            <div className="text-xs text-slate-400 mt-0.5">Critical Capabilities</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-xl sm:text-2xl font-bold text-emerald-400">471+</div>
            <div className="text-xs text-slate-400 mt-0.5">Clips Indexed</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-xl sm:text-2xl font-bold text-amber-400">71 &rarr; 28</div>
            <div className="text-xs text-slate-400 mt-0.5">Cluster Rebalance</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-xl sm:text-2xl font-bold text-purple-400">Dual Audience</div>
            <div className="text-xs text-slate-400 mt-0.5">Human UX + Agent Schemas</div>
          </div>
        </div>
      </div>

      {/* View Switcher Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="tab-view-overview"
            onClick={() => setActiveViewMode('overview')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeViewMode === 'overview'
                ? 'bg-sky-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Architecture &amp; Capabilities</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
              14 Modules
            </span>
          </button>

          <button
            id="tab-view-html"
            onClick={() => setActiveViewMode('html-report')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeViewMode === 'html-report'
                ? 'bg-sky-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Interactive HTML Report</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              Human UX &bull; Live Frame
            </span>
          </button>

          <button
            id="tab-view-markdown"
            onClick={() => setActiveViewMode('markdown-spec')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeViewMode === 'markdown-spec'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>Machine-Readable Markdown</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
              Agent Spec
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="hidden sm:inline">Active View:</span>
          <span className="font-semibold text-white font-mono text-[11px] bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
            {activeViewMode === 'overview' && 'System Architecture Catalog & Technical Debt'}
            {activeViewMode === 'html-report' && '01_high_level_system_architecture.html'}
            {activeViewMode === 'markdown-spec' && '01_HIGH_LEVEL_SYSTEM_ARCHITECTURE.md'}
          </span>
        </div>
      </div>

      {/* VIEW 1: Embedded Interactive HTML Report */}
      {activeViewMode === 'html-report' && (
        <div className={`space-y-3 ${isIframeFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-4' : ''}`}>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Interactive Architecture Guide</span>
                  <code className="text-[11px] font-mono text-sky-400">/analysis/01_high_level_system_architecture.html</code>
                </span>
                <p className="text-[11px] text-slate-400">
                  Visual breakdown designed for humans: system layers, component relationships, and transition roadmap.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIframeKey((k) => k + 1)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
                title="Reload interactive frame"
              >
                <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
                <span>Reload</span>
              </button>

              <button
                onClick={handleDownloadHtml}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
                title="Download HTML report file"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Download HTML</span>
              </button>

              <a
                href={htmlUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
                title="Open in new window"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                <span>Open in Tab</span>
              </a>

              <button
                onClick={() => setIsIframeFullscreen((f) => !f)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors shadow-sm"
                title="Toggle Fullscreen"
              >
                {isIframeFullscreen ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span>Exit Fullscreen</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Fullscreen</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Embedded Frame */}
          <div className={`rounded-xl border border-slate-800 overflow-hidden bg-slate-950 shadow-2xl ${
            isIframeFullscreen ? 'h-[calc(100vh-80px)]' : 'h-[850px]'
          }`}>
            <iframe
              key={iframeKey}
              src={htmlUrl}
              title="System Architecture & Capability Analysis (Phase 1)"
              className="w-full h-full border-0 bg-slate-950"
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
          </div>
        </div>
      )}

      {/* VIEW 2: Machine-Readable Markdown Specification */}
      {activeViewMode === 'markdown-spec' && (
        <div className="space-y-4">
          {/* Markdown Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Autonomous AI Agent Specification</span>
                  <code className="text-[11px] font-mono text-amber-400">/analysis/01_HIGH_LEVEL_SYSTEM_ARCHITECTURE.md</code>
                </span>
                <p className="text-[11px] text-slate-400">
                  Machine-parsable markdown: complete capability inventory, strict contracts, and engineering roadmap for autonomous LLMs.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Formatted vs Raw */}
              <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setMarkdownViewType('formatted')}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    markdownViewType === 'formatted'
                      ? 'bg-slate-800 text-amber-300 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Formatted</span>
                </button>
                <button
                  onClick={() => setMarkdownViewType('raw')}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    markdownViewType === 'raw'
                      ? 'bg-slate-800 text-sky-300 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Raw Markdown</span>
                </button>
              </div>

              <button
                onClick={handleCopyMarkdownText}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
                title="Copy entire markdown specification text to clipboard"
              >
                {copiedMarkdownText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copiedMarkdownText ? 'Copied Full Spec!' : 'Copy Spec'}</span>
              </button>

              <button
                onClick={handleDownloadMarkdown}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors shadow-sm"
                title="Download 01_HIGH_LEVEL_SYSTEM_ARCHITECTURE.md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .md</span>
              </button>
            </div>
          </div>

          {/* Markdown Content */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-sm">
            {isLoading ? (
              <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-3">
                <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
                <span className="text-xs">Loading machine-readable specification from /analysis/...</span>
              </div>
            ) : markdownViewType === 'raw' ? (
              <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {markdownContent}
              </pre>
            ) : (
              <div className="prose prose-invert max-w-none text-slate-200 text-sm sm:text-base leading-relaxed space-y-4">
                <Markdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-4 mb-5 pb-3 border-b border-slate-800 tracking-tight">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-xl sm:text-2xl font-bold text-sky-400 mt-8 mb-4 pb-2 border-b border-slate-800/80 tracking-tight flex items-center gap-2">
                        <span>#</span>
                        <span>{children}</span>
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-lg font-bold text-amber-300 mt-6 mb-3">
                        {children}
                      </h3>
                    ),
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-6 border border-slate-800 rounded-xl bg-slate-950/60 shadow-sm">
                        <table className="min-w-full text-xs sm:text-sm text-left border-collapse">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }) => (
                      <thead className="bg-slate-900 border-b border-slate-800 text-slate-300 font-bold uppercase text-[11px] tracking-wider">
                        {children}
                      </thead>
                    ),
                    th: ({ children }) => (
                      <th className="px-4 py-3 border-r border-slate-800 last:border-r-0">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="px-4 py-3 border-t border-slate-800 border-r border-slate-800 last:border-r-0 text-slate-300">
                        {children}
                      </td>
                    ),
                    code: ({ children, className }) => {
                      const isInline = !className;
                      if (isInline) {
                        return (
                          <code className="px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 font-mono text-xs border border-slate-700/60">
                            {children}
                          </code>
                        );
                      }
                      return (
                        <code className="block p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto my-4 leading-relaxed">
                          {children}
                        </code>
                      );
                    },
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-amber-500/80 pl-4 py-1 italic bg-amber-950/20 text-slate-300 rounded-r-lg my-4">
                        {children}
                      </blockquote>
                    )
                  }}
                >
                  {markdownContent}
                </Markdown>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: Architecture Dashboard & 14 Capabilities Matrix */}
      {activeViewMode === 'overview' && (
        <div className="space-y-10">
          {/* The Dual-Audience Section */}
          <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-400" />
              <span>The Dual-Audience Paradigm</span>
            </h2>
            <p className="text-xs text-slate-400">Designing software for human cognitive ergonomics and AI agent predictability simultaneously</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-sky-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                <Users className="w-4 h-4" />
                <span>Audience 1: The Human (Learner &amp; Developer)</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-800 font-medium">Cognitive UX</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Focuses on visual delight, spatial intuition, audio ergonomics, and effortless physical interactions.
            </p>
            <div className="space-y-2 pt-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <span className="text-sky-400 font-bold">&check;</span>
                <span><strong>AirPods Speech Synthesis:</strong> Zero-cost audio consumption via Web Speech API and stem hardware controls.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-sky-400 font-bold">&check;</span>
                <span><strong>Video Cosmos 2D Graph:</strong> Spatial coordinate-based exploration of video content as a celestial map.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-sky-400 font-bold">&check;</span>
                <span><strong>Interactive Word Clouds &amp; Mindmaps:</strong> Fast visual thematic scanning across technical domains.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-sky-400 font-bold">&check;</span>
                <span><strong>Executive PDF Reports:</strong> Downloadable, multi-page branded PDF documentation for offline human study.</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/70 border border-amber-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Bot className="w-4 h-4" />
                <span>Audience 2: The Agent (LLMs, Copilots &amp; Tooling)</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 font-medium">Machine Schemas</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Requires deterministic contracts, structured JSON payloads, verifiable audit logs, and zero UI ambiguity.
            </p>
            <div className="space-y-2 pt-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">&check;</span>
                <span><strong>Structured JSON Data Core:</strong> All 71 playlists stored with explicit schemas in <code>src/data/</code>.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">&check;</span>
                <span><strong>Verbatim Prompt Audit Ledger:</strong> <code>gemini_prompts.md</code> serving as an immutable record for regression checks.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">&check;</span>
                <span><strong>Headless CLI &amp; Python Modules:</strong> Direct script invocation (<code>scripts/sync-youtube.mjs</code>) with exit codes.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">&check;</span>
                <span><strong>Deterministic Heuristic Fallback:</strong> Synthetic takeaway generation when upstream LLMs trigger 503 load errors.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Architecture Flow Diagram */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <span>Runtime Architecture &amp; Data Flow Topology</span>
            </h2>
            <p className="text-xs text-slate-400">How client state, the Express server, disk persistence, and external APIs communicate</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            {/* Layer 1 */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="font-bold text-sky-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                <span>1. Presentation Layer</span>
              </div>
              <p className="text-slate-400 text-[11px]">React 19 + Tailwind CSS + Lucide Icons + Motion</p>
              <ul className="text-slate-300 space-y-1 text-[11px] list-disc pl-3.5">
                <li>14 dynamic tabs with zero reload</li>
                <li>HTML5 2D Canvas for Cosmos map</li>
                <li>Web Speech API + Media Session</li>
                <li>jsPDF table compilation engine</li>
              </ul>
            </div>

            {/* Layer 2 */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="font-bold text-indigo-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                <span>2. Client State &amp; Cache</span>
              </div>
              <p className="text-slate-400 text-[11px]">App.tsx Root State + LocalStorage v3</p>
              <ul className="text-slate-300 space-y-1 text-[11px] list-disc pl-3.5">
                <li>Instant local storage hydration</li>
                <li>Deduplicated uniqueClips index</li>
                <li>Optimistic note and tag updates</li>
                <li>Cross-tab clip selection bridge</li>
              </ul>
            </div>

            {/* Layer 3 */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="font-bold text-amber-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>3. Server Services</span>
              </div>
              <p className="text-slate-400 text-[11px]">Express 4.21 on Port 3000 (0.0.0.0)</p>
              <ul className="text-slate-300 space-y-1 text-[11px] list-disc pl-3.5">
                <li>Gemini API cascade (3.8 &rarr; flash &rarr; 2.5)</li>
                <li>503 high-demand heuristic recovery</li>
                <li>YouTube Innertube scraper &amp; sync</li>
                <li>child_process CLI execution</li>
              </ul>
            </div>

            {/* Layer 4 */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>4. Persistence &amp; Files</span>
              </div>
              <p className="text-slate-400 text-[11px]">Local File System Storage</p>
              <ul className="text-slate-300 space-y-1 text-[11px] list-disc pl-3.5">
                <li><code>src/data/channelPlaylists.json</code></li>
                <li><code>gemini_prompts.md</code> ledger</li>
                <li><code>/analysis/</code> documentation files</li>
                <li><code>/legacy/</code> sandboxed HTML tools</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Capabilities Filter & Catalog */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <FileSearch className="w-5 h-5 text-sky-400" />
              <span>Capability Catalog ({filteredCapabilities.length} / 14 Modules)</span>
            </h2>
            <p className="text-xs text-slate-400">Detailed examination of business logic, supporting files, and dual-audience utility</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              placeholder="Search capability or file..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setActiveAudienceFilter('all')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${activeAudienceFilter === 'all' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                All
              </button>
              <button
                onClick={() => setActiveAudienceFilter('human')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${activeAudienceFilter === 'human' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Human
              </button>
              <button
                onClick={() => setActiveAudienceFilter('agent')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${activeAudienceFilter === 'agent' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Agent
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCapabilities.map((c) => (
            <div key={c.id} className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">#{c.id}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                      {c.badge}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      c.audience === 'human' 
                        ? 'bg-sky-950 text-sky-300 border border-sky-800' 
                        : c.audience === 'agent' 
                        ? 'bg-amber-950 text-amber-300 border border-amber-800' 
                        : 'bg-purple-950 text-purple-300 border border-purple-800'
                    }`}>
                      {c.audience === 'human' ? '👤 Human' : c.audience === 'agent' ? '🤖 Agent' : '👤+🤖 Dual'}
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-white text-base">{c.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{c.summary}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Supporting Files</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {c.files.map((file, i) => (
                      <code key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 text-sky-300 border border-slate-800">
                        {file}
                      </code>
                    ))}
                  </div>
                </div>

                <div className="text-[11px] text-slate-400">
                  <span className="text-sky-400 font-semibold">Human UX:</span> {c.humanExperience}
                </div>

                <div className="text-[11px] text-slate-400">
                  <span className="text-amber-400 font-semibold">Agent Schema:</span> {c.agentContract}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vulnerabilities & Technical Debt Assessment */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>Technical Debt &amp; Fragility Assessment</span>
          </h2>
          <p className="text-xs text-slate-400">Architectural risks inherited from spontaneous vibe coding and target clean-engineering remediations</p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Area</th>
                <th className="p-3.5">Current Pattern</th>
                <th className="p-3.5">Failure Mode / Risk</th>
                <th className="p-3.5">Target Clean State</th>
                <th className="p-3.5">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              <tr className="hover:bg-slate-800/30">
                <td className="p-3.5 font-semibold text-white">Monolithic Server (<code>server.ts</code>)</td>
                <td className="p-3.5">Single file with routing, YouTube scraping, child processes, and Gemini API cascades (&gt;970 lines).</td>
                <td className="p-3.5 text-amber-400">High friction; uncaught exception risks entire dev server downtime.</td>
                <td className="p-3.5 text-emerald-400">Decompose into modular router controllers: <code>/server/routes/*</code>.</td>
                <td className="p-3.5"><span className="px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 font-bold">HIGH</span></td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="p-3.5 font-semibold text-white">Unatomic Flat-File Persistence</td>
                <td className="p-3.5">Direct <code>fs.writeFileSync</code> overwriting <code>channelPlaylists.json</code>.</td>
                <td className="p-3.5 text-amber-400">Process kill or disk race condition can truncate dataset to 0 bytes.</td>
                <td className="p-3.5 text-emerald-400">Write to temporary file, atomic rename, and timestamped rolling backups.</td>
                <td className="p-3.5"><span className="px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 font-bold">HIGH</span></td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="p-3.5 font-semibold text-white">Client Root State Dispersion</td>
                <td className="p-3.5"><code>App.tsx</code> holds 15+ states and drills callbacks across 14 tabs.</td>
                <td className="p-3.5 text-amber-400">Unnecessary re-renders, state sync divergence between tabs.</td>
                <td className="p-3.5 text-emerald-400">Introduce lightweight domain context (<code>PlaylistsContext</code>, <code>AudioContext</code>).</td>
                <td className="p-3.5"><span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 font-bold">MEDIUM</span></td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="p-3.5 font-semibold text-white">DOM Scraping Fragility</td>
                <td className="p-3.5">Regex and DOM parsing against public YouTube HTML for playlist updates.</td>
                <td className="p-3.5 text-amber-400">YouTube markup changes will break live synchronization silently.</td>
                <td className="p-3.5 text-emerald-400">Encapsulate behind resilient adapter with schema validation and test fixtures.</td>
                <td className="p-3.5"><span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 font-bold">MEDIUM</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Strategic Transition Roadmap */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-emerald-400" />
            <span>Strategic Engineering Roadmap (From Vibe to Robust)</span>
          </h2>
          <p className="text-xs text-slate-400">Preserving 100% existing functionality while methodically raising architectural resilience</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-sky-500/50 space-y-3 relative shadow-md shadow-sky-950/40">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">PHASE 1 (ACTIVE)</span>
              <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">&check; Current</span>
            </div>
            <h3 className="font-bold text-white text-sm">System Introspection &amp; Baseline</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Create <code>/analysis/</code> documentation, build in-app review dashboard, catalog all 14 capabilities, and map data flows without mutating existing code.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">PHASE 2</span>
              <span className="text-slate-500 text-xs">Upcoming</span>
            </div>
            <h3 className="font-bold text-white text-sm">Modular Decoupling &amp; Schemas</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Extract <code>server.ts</code> routes into modular controllers; implement atomic file persistence; formalize strict domain schemas.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">PHASE 3</span>
              <span className="text-slate-500 text-xs">Upcoming</span>
            </div>
            <h3 className="font-bold text-white text-sm">Dual-Audience Agent Tooling</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Expose structured programmatic agent endpoints, machine-readable tool contracts (JSON schema), and enhance human audio/canvas ergonomics.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">PHASE 4</span>
              <span className="text-slate-500 text-xs">Upcoming</span>
            </div>
            <h3 className="font-bold text-white text-sm">Verification, Tests &amp; Monorepo</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Implement automated regression test harness (contract validation, API tests), telemetry tracking, and export-ready GitHub monorepo.
            </p>
          </div>
        </div>
      </div>
    </div>
  )}
</div>
  );
};
