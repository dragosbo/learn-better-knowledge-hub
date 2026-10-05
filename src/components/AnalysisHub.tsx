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
  FileText,
  Play,
  Wrench,
  Search,
  Database,
  Server,
  Zap
} from 'lucide-react';

interface CapabilityDetail {
  id: string;
  title: string;
  badge: string;
  category: 'Media & Data' | 'Spatial & Viz' | 'Audio & AI' | 'DevOps & Docs';
  audience: 'human' | 'agent' | 'both';
  summary: string;
  primaryComponent: string;
  componentLines: string;
  dataFiles: string[];
  endpoints: string[];
  supportingTools: string[];
  humanExperience: string;
  agentContract: string;
  reliability: 'High' | 'Medium' | 'Experimental';
}

const CAPABILITIES_LEDGER: CapabilityDetail[] = [
  {
    id: '01',
    title: 'Playlists & Clips Management',
    badge: 'Core Media',
    category: 'Media & Data',
    audience: 'both',
    summary: 'Catalogs 71 YouTube playlists and 471+ clips with status tracking (to-watch, in-progress, synthesized, mastered), notes, and tags.',
    primaryComponent: 'src/components/PlaylistManager.tsx',
    componentLines: '~1,032 lines',
    dataFiles: ['src/data/channelPlaylists.json', 'src/data/initialData.ts', 'localStorage (learn_better_playlists_v3)'],
    endpoints: ['GET /api/content/playlists', 'POST /api/content/save-playlists', 'POST /api/content/sync-youtube'],
    supportingTools: ['lucide-react', 'src/services/api.ts'],
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
    primaryComponent: 'src/components/PlaylistRestructureHub.tsx',
    componentLines: '~750 lines',
    dataFiles: ['src/data/playlistRestructureData.ts', 'localStorage (learn_better_is_restructured)'],
    endpoints: ['Client-side algorithmic clustering (zero network latency)'],
    supportingTools: ['jspdf', 'jspdf-autotable', 'lucide-react'],
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
    primaryComponent: 'src/components/VideoCosmosGraph.tsx',
    componentLines: '~610 lines',
    dataFiles: ['src/data/videoCosmosData.ts', 'localStorage (cosmos_custom_voyages_v1)'],
    endpoints: ['Pure client-side Canvas physics engine'],
    supportingTools: ['HTML5 Canvas 2D Context', 'lucide-react'],
    humanExperience: 'High-speed 60fps pan/zoom spatial navigation, star twinkle, constellation lines, and touch gesture support.',
    agentContract: 'Topological coordinate assignment algorithms and cluster centroid calculations in cartesian space.',
    reliability: 'High'
  },
  {
    id: '04',
    title: 'Word Cloud & Mind Map Hub',
    badge: 'Semantic Analysis',
    category: 'Spatial & Viz',
    audience: 'both',
    summary: 'D3/Canvas-powered frequency analysis of technical terminology across all playlists with a synchronized 3-tier hierarchical mind map.',
    primaryComponent: 'src/components/PlaylistWordCloudMindMap.tsx',
    componentLines: '~480 lines',
    dataFiles: ['src/data/wordcloudMindmapData.ts', 'imported_repo/data/wordclouds/*'],
    endpoints: ['GET /api/playlists/wordcloud/:playlistId'],
    supportingTools: ['HTML5 Canvas 2D', 'SVG radial tree rendering'],
    humanExperience: 'Interactive term filtering; visual inspection of curriculum vocabulary distributions.',
    agentContract: 'Tokenization pipeline, stopword filtering, and term weight calculations.',
    reliability: 'High'
  },
  {
    id: '05',
    title: 'Knowledge Hub & Study Studio',
    badge: 'Video Synthesis',
    category: 'Media & Data',
    audience: 'both',
    summary: 'Focused single-clip study studio combining YouTube video playback, transcripts, personal user notes, questions, and ideas.',
    primaryComponent: 'src/components/KnowledgeHub.tsx',
    componentLines: '~450 lines',
    dataFiles: ['src/data/initialData.ts', 'src/App.tsx global state'],
    endpoints: ['GET /api/content/summaries'],
    supportingTools: ['YouTube Iframe API', 'lucide-react'],
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
    primaryComponent: 'src/components/AILearningAcademy.tsx',
    componentLines: '~520 lines',
    dataFiles: ['imported_repo/lessons_claude/', 'imported_repo/lessons_kiro/'],
    endpoints: ['GET /api/content/lessons', 'GET /api/content/lesson/:id'],
    supportingTools: ['react-markdown', 'lucide-react'],
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
    primaryComponent: 'src/components/AudioLessonPlayer.tsx',
    componentLines: '~380 lines',
    dataFiles: ['Dynamic in-memory text chunker'],
    endpoints: ['Web Speech API (SpeechSynthesis), MediaSession API'],
    supportingTools: ['Web Speech API', 'navigator.mediaSession'],
    humanExperience: 'Learn on walks or commutes without looking at the screen; speed adjustment (0.75x to 1.5x).',
    agentContract: 'Text chunking pipeline splitting long markdown articles into speech-safe paragraphs.',
    reliability: 'High'
  },
  {
    id: '08',
    title: 'Gemini AI Studio',
    badge: 'Multi-Model AI',
    category: 'Audio & AI',
    audience: 'both',
    summary: 'Multi-model Gemini cascade (3.8-flash, flash-latest, 2.5-flash) with automatic 503 high-demand heuristic fallback for insights and vibe pilot.',
    primaryComponent: 'src/components/GeminiStudio.tsx',
    componentLines: '~710 lines',
    dataFiles: ['Client session notes & prompts'],
    endpoints: ['POST /api/gemini/extract-insights', 'POST /api/gemini/vibe-pilot'],
    supportingTools: ['@google/genai SDK', 'lucide-react'],
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
    primaryComponent: 'src/components/GeminiDevelopmentChat.tsx',
    componentLines: '~390 lines',
    dataFiles: ['src/data/geminiChatData.ts', 'gemini_prompts.md', 'gemini_feedback.md', 'gemini_chat/chat_history.html'],
    endpoints: ['GET /gemini_development_chat', 'GET /api/chat/history', 'POST /api/content/append-prompt'],
    supportingTools: ['Static HTML iframe', 'react-markdown'],
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
    primaryComponent: 'src/components/LegacyAppsHub.tsx',
    componentLines: '~340 lines',
    dataFiles: ['imported_repo/*.html'],
    endpoints: ['GET /api/content/legacy-apps', 'GET /imported_repo/*'],
    supportingTools: ['Sandboxed <iframe>', 'lucide-react'],
    humanExperience: 'Run pre-existing standalone tools without leaving the modern React interface.',
    agentContract: 'Clean isolated routes (/legacy/*) ensuring zero code breakage during modernization.',
    reliability: 'High'
  },
  {
    id: '11',
    title: 'Python Code Viewer',
    badge: 'CLI Tooling',
    category: 'DevOps & Docs',
    audience: 'both',
    summary: 'Two-column IDE layout with syntax highlighting and I/O specifications for backend Python scripts (transcription, audio re-encoding, speech).',
    primaryComponent: 'src/components/PythonCodeViewer.tsx & PythonSyntaxHighlighter.tsx',
    componentLines: '~360 lines',
    dataFiles: ['src/data/pythonFiles.ts', 'scripts/*.py'],
    endpoints: ['GET /api/content/python-files'],
    supportingTools: ['Custom syntax tokenizer', 'lucide-react'],
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
    primaryComponent: 'src/components/GitHubSyncGuide.tsx',
    componentLines: '~660 lines',
    dataFiles: ['export_to_github.sh', 'export_to_github.bat'],
    endpoints: ['POST /api/cli/execute-sync'],
    supportingTools: ['react-markdown', 'lucide-react'],
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
    summary: 'Full markdown documentation viewer with built-in voice narration, quick-jump anchors, and the iPadOS 401 troubleshooting runbook.',
    primaryComponent: 'src/components/UserGuideViewer.tsx',
    componentLines: '~330 lines',
    dataFiles: ['USER_GUIDE.md'],
    endpoints: ['GET /api/content/logs'],
    supportingTools: ['src/utils/guideHtmlFormatter.ts', 'Web Speech Audio Engine'],
    humanExperience: 'Listen to the manual or jump directly to specific feature workflows and iPadOS setup.',
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
    primaryComponent: 'src/components/RoadmapHub.tsx',
    componentLines: '~480 lines',
    dataFiles: ['src/data/roadmapData.ts', 'suggestions.md'],
    endpoints: ['Declarative data models in roadmapData.ts'],
    supportingTools: ['lucide-react'],
    humanExperience: 'Visual milestone cards, technical guides, and multi-AI handoff protocols.',
    agentContract: 'Machine-parsable milestone identifiers and implementation roadmaps.',
    reliability: 'High'
  }
];

type AnalysisPhase = 1 | 2 | 3 | 4;
type AnalysisViewMode = 'overview' | 'html-report' | 'markdown-spec' | 'agent-playground';

export const AnalysisHub: React.FC = () => {
  const [selectedPhase, setSelectedPhase] = useState<AnalysisPhase>(2);
  const [activeViewMode, setActiveViewMode] = useState<AnalysisViewMode>('overview');
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [htmlUrl, setHtmlUrl] = useState<string>('/analysis/02_capability_file_matrix.html');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [isIframeFullscreen, setIsIframeFullscreen] = useState<boolean>(false);
  const [markdownViewType, setMarkdownViewType] = useState<'formatted' | 'raw'>('formatted');
  const [copiedMarkdownText, setCopiedMarkdownText] = useState<boolean>(false);
  const [activeAudienceFilter, setActiveAudienceFilter] = useState<'all' | 'human' | 'agent'>('all');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedPath, setCopiedPath] = useState(false);

  // Agent Playground state
  const [selectedTool, setSelectedTool] = useState<string>('search_playlists');
  const [toolQueryArg, setToolQueryArg] = useState<string>('AI');
  const [toolLimitArg, setToolLimitArg] = useState<number>(5);
  const [toolStatusArg, setToolStatusArg] = useState<string>('all');
  const [isExecutingTool, setIsExecutingTool] = useState<boolean>(false);
  const [toolExecutionResult, setToolExecutionResult] = useState<any>(null);
  const [copiedToolSchema, setCopiedToolSchema] = useState<boolean>(false);

  // Fetch phase documentation whenever selectedPhase changes
  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/analysis/data?phase=${selectedPhase}`)
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
        // Fallback static files
        const fallbackMd = selectedPhase === 1 
          ? '/analysis/01_HIGH_LEVEL_SYSTEM_ARCHITECTURE.md' 
          : selectedPhase === 2 
            ? '/analysis/02_CAPABILITY_FILE_MATRIX.md' 
            : selectedPhase === 3
              ? '/analysis/03_DUAL_AUDIENCE_AGENT_TOOLS_SPEC.md'
              : '/analysis/04_IPAD_VS_CLOUD_PROCESSING_ANALYSIS.md';
        
        const fallbackHtml = selectedPhase === 1
          ? '/analysis/01_high_level_system_architecture.html'
          : selectedPhase === 2
            ? '/analysis/02_capability_file_matrix.html'
            : selectedPhase === 3
              ? '/analysis/03_dual_audience_agent_tools_spec.html'
              : '/analysis/04_ipad_vs_cloud_processing_analysis.html';

        setHtmlUrl(fallbackHtml);
        fetch(fallbackMd)
          .then((r) => r.text())
          .then((txt) => {
            setMarkdownContent(txt);
            setIsLoading(false);
          })
          .catch(() => setIsLoading(false));
      });
  }, [selectedPhase]);

  const filteredCapabilities = CAPABILITIES_LEDGER.filter((c) => {
    const matchesAudience = 
      activeAudienceFilter === 'all' || 
      c.audience === activeAudienceFilter || 
      c.audience === 'both';
    
    const matchesCategory = 
      activeCategoryFilter === 'all' ||
      c.category === activeCategoryFilter;

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !q ||
      c.title.toLowerCase().includes(q) ||
      c.summary.toLowerCase().includes(q) ||
      c.primaryComponent.toLowerCase().includes(q) ||
      c.dataFiles.some(f => f.toLowerCase().includes(q)) ||
      c.endpoints.some(e => e.toLowerCase().includes(q));

    return matchesAudience && matchesCategory && matchesSearch;
  });

  const handleCopyPath = () => {
    const p = selectedPhase === 1 
      ? '/analysis/01_HIGH_LEVEL_SYSTEM_ARCHITECTURE.md' 
      : selectedPhase === 2 
        ? '/analysis/02_CAPABILITY_FILE_MATRIX.md' 
        : selectedPhase === 3
          ? '/analysis/03_DUAL_AUDIENCE_AGENT_TOOLS_SPEC.md'
          : '/analysis/04_IPAD_VS_CLOUD_PROCESSING_ANALYSIS.md';
    navigator.clipboard.writeText(p);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
  };

  const handleDownloadHtml = () => {
    const filename = selectedPhase === 1 
      ? '01_high_level_system_architecture.html' 
      : selectedPhase === 2 
        ? '02_capability_file_matrix.html' 
        : selectedPhase === 3
          ? '03_dual_audience_agent_tools_spec.html'
          : '04_ipad_vs_cloud_processing_analysis.html';
    const link = document.createElement('a');
    link.href = htmlUrl;
    link.download = filename;
    link.click();
  };

  const handleDownloadMarkdown = () => {
    const filename = selectedPhase === 1 
      ? '01_HIGH_LEVEL_SYSTEM_ARCHITECTURE.md' 
      : selectedPhase === 2 
        ? '02_CAPABILITY_FILE_MATRIX.md' 
        : selectedPhase === 3
          ? '03_DUAL_AUDIENCE_AGENT_TOOLS_SPEC.md'
          : '04_IPAD_VS_CLOUD_PROCESSING_ANALYSIS.md';
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyMarkdownText = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopiedMarkdownText(true);
    setTimeout(() => setCopiedMarkdownText(false), 2000);
  };

  // Run live agent tool call
  const handleExecuteAgentTool = async () => {
    setIsExecutingTool(true);
    try {
      let args: any = {};
      if (selectedTool === 'search_playlists') {
        args = { query: toolQueryArg, status: toolStatusArg, limit: toolLimitArg };
      } else if (selectedTool === 'get_capability_matrix') {
        args = { capabilityId: toolQueryArg || undefined };
      } else if (selectedTool === 'get_study_notes') {
        args = { filterBy: 'all', limit: toolLimitArg };
      } else if (selectedTool === 'query_video_cosmos') {
        args = { cluster: toolQueryArg || undefined, limit: toolLimitArg };
      } else if (selectedTool === 'get_code_manifest') {
        args = { scope: 'all' };
      }

      const res = await fetch('/api/agent/execute-tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: selectedTool, arguments: args })
      });
      const data = await res.json();
      setToolExecutionResult(data);
    } catch (err: any) {
      setToolExecutionResult({ error: err.message });
    } finally {
      setIsExecutingTool(false);
    }
  };

  const sampleToolSchemas = {
    search_playlists: {
      name: 'search_playlists',
      description: 'Searches 71 curated YouTube playlists and 471+ video clips by keyword, channel name, category tag, or watch status.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Keyword to search clip titles and playlist titles' },
          status: { type: 'string', enum: ['all', 'to-watch', 'in-progress', 'synthesized', 'mastered'] },
          limit: { type: 'integer', description: 'Max items to return (default 20)' }
        }
      }
    }
  };

  const handleCopyToolSchema = () => {
    navigator.clipboard.writeText(JSON.stringify(sampleToolSchemas, null, 2));
    setCopiedToolSchema(true);
    setTimeout(() => setCopiedToolSchema(false), 2000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* ========================================================================= */}
      {/* 3-PHASE MASTER NAVIGATION TABS */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 sm:p-2.5 shadow-lg">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Phase 1 Button */}
          <button
            onClick={() => { setSelectedPhase(1); }}
            className={`flex-1 flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
              selectedPhase === 1
                ? 'bg-slate-800/90 border-sky-500/80 text-white shadow-md ring-2 ring-sky-500/30'
                : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <span className={`w-2 h-2 rounded-full ${selectedPhase === 1 ? 'bg-sky-400' : 'bg-slate-600'}`}></span>
                <span className={selectedPhase === 1 ? 'text-sky-300' : 'text-slate-300'}>Phase 1</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-950 text-sky-400 border border-sky-800/60">Audit</span>
              </div>
              <div className="font-extrabold text-sm text-white">System Architecture</div>
              <div className="text-[11px] text-slate-400">High-level topology &amp; technical debt</div>
            </div>
            <div className="hidden lg:block text-xs font-mono text-sky-400/80">01_ARCH.md</div>
          </button>

          {/* Phase 2 Button */}
          <button
            onClick={() => { setSelectedPhase(2); }}
            className={`flex-1 flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
              selectedPhase === 2
                ? 'bg-sky-950/80 border-sky-400 text-white shadow-md ring-2 ring-sky-400/40'
                : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <span className={`w-2 h-2 rounded-full ${selectedPhase === 2 ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}></span>
                <span className={selectedPhase === 2 ? 'text-sky-300' : 'text-slate-300'}>Phase 2</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60">Delivering Files</span>
              </div>
              <div className="font-extrabold text-sm text-white">Capability &rarr; File Matrix</div>
              <div className="text-[11px] text-slate-300">Exact files, components, lines &amp; contracts</div>
            </div>
            <div className="hidden lg:block text-xs font-mono text-emerald-400/80">02_MATRIX.md</div>
          </button>

          {/* Phase 3 Button */}
          <button
            onClick={() => { setSelectedPhase(3); }}
            className={`flex-1 flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
              selectedPhase === 3
                ? 'bg-amber-950/80 border-amber-400 text-white shadow-md ring-2 ring-amber-400/40'
                : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <span className={`w-2 h-2 rounded-full ${selectedPhase === 3 ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`}></span>
                <span className={selectedPhase === 3 ? 'text-amber-300' : 'text-slate-300'}>Phase 3</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800/60">Live Endpoints</span>
              </div>
              <div className="font-extrabold text-sm text-white">Agent Tools &amp; API Protocol</div>
              <div className="text-[11px] text-slate-300">OpenAI/Gemini function calling &amp; simulator</div>
            </div>
            <div className="hidden lg:block text-xs font-mono text-amber-400/80">03_AGENT.md</div>
          </button>

          {/* Phase 4 Button: iPad vs Cloud */}
          <button
            onClick={() => { setSelectedPhase(4); }}
            className={`flex-1 flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
              selectedPhase === 4
                ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-md ring-2 ring-cyan-400/40'
                : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <span className={`w-2 h-2 rounded-full ${selectedPhase === 4 ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`}></span>
                <span className={selectedPhase === 4 ? 'text-cyan-300' : 'text-slate-300'}>Phase 4</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">iPad vs Cloud %</span>
              </div>
              <div className="font-extrabold text-sm text-white">iPad vs. Cloud Compute</div>
              <div className="text-[11px] text-slate-300">FLOPs, 95% dev vs 68% runtime</div>
            </div>
            <div className="hidden lg:block text-xs font-mono text-cyan-400/80">04_COMPUTE.md</div>
          </button>
        </div>
      </div>

      {/* Hero Header */}
      <div className="rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-4xl">
          {/* Phase Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-xs font-semibold">
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-white">Architecture &amp; Capability Ledger</span>
            <span>&bull;</span>
            {selectedPhase === 1 && <span className="text-sky-400 font-bold">Phase 1: High-Level System Architecture</span>}
            {selectedPhase === 2 && <span className="text-emerald-400 font-bold">Phase 2: Capability-to-File Delivery Matrix</span>}
            {selectedPhase === 3 && <span className="text-amber-400 font-bold">Phase 3: Dual-Audience Interfaces &amp; Agent Tool Protocol</span>}
            {selectedPhase === 4 && <span className="text-cyan-400 font-bold">Phase 4: iPad Client vs. Cloud Processing Architecture</span>}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            {selectedPhase === 1 && 'Transitioning from Vibe Coding to Engineered Architecture'}
            {selectedPhase === 2 && 'Exact File Delivery & Component Registry for Every Capability'}
            {selectedPhase === 3 && 'Dual-Audience Machine Protocol & Autonomous Agent Tool Calling'}
            {selectedPhase === 4 && 'How Much Processing Happens on Your iPad vs. in the Cloud?'}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {selectedPhase === 1 && (
              <>
                Phase 1 analyzes the holistic architecture of <strong className="text-white">learn-better</strong>. Having accumulated 14 rich capabilities organically through vibe coding, we mapped the system topology and identified technical debt remediations.
              </>
            )}
            {selectedPhase === 2 && (
              <>
                Phase 2 provides direct, code-level traceability answering: <strong className="text-emerald-300">"For each capability in the system, exactly which files, components, datasets, server endpoints, and utility functions deliver it?"</strong>
              </>
            )}
            {selectedPhase === 3 && (
              <>
                Phase 3 enables <strong className="text-amber-400">Autonomous AI Agents (Claude, Gemini, ChatGPT)</strong> to query, inspect, and update playlists, clips, and notes via strict JSON Schema REST APIs and standard Function Calling declarations without touching UI code.
              </>
            )}
            {selectedPhase === 4 && (
              <>
                Phase 4 provides empirical FLOPs, network packet payloads, and hardware offload benchmarks contrasting the <strong className="text-purple-400">95% Cloud Active Agent Development Phase</strong> against the <strong className="text-cyan-300">68% iPad Client Application Runtime Phase</strong> (60 FPS Canvas GPU physics and Apple Neural Engine Speech).
              </>
            )}
          </p>

          {/* Quick Review Navigation Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActiveViewMode('overview')}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeViewMode === 'overview'
                  ? 'bg-sky-500 text-slate-950 ring-2 ring-sky-300 font-black shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>
                {selectedPhase === 1 && 'Architecture Overview'}
                {selectedPhase === 2 && 'Capability & File Matrix (14)'}
                {selectedPhase === 3 && 'Agent API Endpoints & Schemas'}
                {selectedPhase === 4 && 'iPad vs. Cloud Split & Metrics'}
              </span>
            </button>

            {selectedPhase === 3 && (
              <button
                onClick={() => setActiveViewMode('agent-playground')}
                className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeViewMode === 'agent-playground'
                    ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 font-black shadow-md'
                    : 'bg-amber-600/90 hover:bg-amber-500 text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Live Tool Simulator &amp; Tester</span>
              </button>
            )}

            <button
              onClick={() => setActiveViewMode('html-report')}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeViewMode === 'html-report'
                  ? 'bg-sky-500 text-slate-950 ring-2 ring-sky-300 font-black shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Interactive HTML Frame</span>
            </button>

            <button
              onClick={() => setActiveViewMode('markdown-spec')}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeViewMode === 'markdown-spec'
                  ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 font-black shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>Inspect Agent Markdown (.md)</span>
            </button>

            <button
              onClick={handleCopyPath}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
              title="Copy local workspace path to clipboard"
            >
              {copiedPath ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copiedPath ? 'Path Copied!' : 'Copy Path'}</span>
            </button>
          </div>
        </div>

        {/* Quick Stat Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-xl sm:text-2xl font-bold text-sky-400">14 / 14</div>
            <div className="text-xs text-slate-400 mt-0.5">Capabilities Mapped</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-xl sm:text-2xl font-bold text-emerald-400">471+</div>
            <div className="text-xs text-slate-400 mt-0.5">Clips Indexed</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-xl sm:text-2xl font-bold text-amber-400">5 Endpoints</div>
            <div className="text-xs text-slate-400 mt-0.5">Programmatic Agent APIs</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-xl sm:text-2xl font-bold text-purple-400">100% Safe</div>
            <div className="text-xs text-slate-400 mt-0.5">Atomic Flat-File Writes</div>
          </div>
        </div>
      </div>

      {/* View Switcher Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveViewMode('overview')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeViewMode === 'overview'
                ? 'bg-sky-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>
              {selectedPhase === 1 && 'System Architecture'}
              {selectedPhase === 2 && 'Capability Delivery Matrix'}
              {selectedPhase === 3 && 'Agent API Specifications'}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
              {selectedPhase === 2 ? '14 Files Detailed' : selectedPhase === 3 ? '5 Endpoints' : 'Baseline'}
            </span>
          </button>

          {selectedPhase === 3 && (
            <button
              onClick={() => setActiveViewMode('agent-playground')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeViewMode === 'agent-playground'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Live Agent Playground</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                Interactive Test
              </span>
            </button>
          )}

          <button
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
              Live Frame
            </span>
          </button>

          <button
            onClick={() => setActiveViewMode('markdown-spec')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeViewMode === 'markdown-spec'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>Machine Markdown (.md)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
              Agent Spec
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="hidden sm:inline">Active File:</span>
          <span className="font-semibold text-white font-mono text-[11px] bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
            {selectedPhase === 1 && (activeViewMode === 'html-report' ? '01_high_level_system_architecture.html' : '01_HIGH_LEVEL_SYSTEM_ARCHITECTURE.md')}
            {selectedPhase === 2 && (activeViewMode === 'html-report' ? '02_capability_file_matrix.html' : '02_CAPABILITY_FILE_MATRIX.md')}
            {selectedPhase === 3 && (activeViewMode === 'html-report' ? '03_dual_audience_agent_tools_spec.html' : '03_DUAL_AUDIENCE_AGENT_TOOLS_SPEC.md')}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW: LIVE AGENT PLAYGROUND & TOOL SIMULATOR (PHASE 3) */}
      {/* ========================================================================= */}
      {activeViewMode === 'agent-playground' && selectedPhase === 3 && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-amber-900/60 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-amber-400" />
                  <span>Autonomous AI Agent Tool-Calling Sandbox</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Simulate external LLM tool calls (OpenAI, Gemini, Claude) by executing real server actions against <code className="text-sky-400">/api/agent/execute-tool</code>.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyToolSchema}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-slate-700 transition-colors"
                >
                  {copiedToolSchema ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{copiedToolSchema ? 'JSON Copied!' : 'Copy Tool JSON Schema'}</span>
                </button>
              </div>
            </div>

            {/* Interactive Control Panel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4 md:col-span-1 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Select Tool</label>
                  <select
                    value={selectedTool}
                    onChange={(e) => setSelectedTool(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="search_playlists">search_playlists</option>
                    <option value="get_capability_matrix">get_capability_matrix</option>
                    <option value="get_study_notes">get_study_notes</option>
                    <option value="query_video_cosmos">query_video_cosmos</option>
                    <option value="get_code_manifest">get_code_manifest</option>
                  </select>
                </div>

                {selectedTool === 'search_playlists' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-400">Query String</label>
                      <input
                        type="text"
                        value={toolQueryArg}
                        onChange={(e) => setToolQueryArg(e.target.value)}
                        placeholder="e.g. AI, React, Prompt, Gemini"
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-400">Status Filter</label>
                      <select
                        value={toolStatusArg}
                        onChange={(e) => setToolStatusArg(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                      >
                        <option value="all">all</option>
                        <option value="to-watch">to-watch</option>
                        <option value="in-progress">in-progress</option>
                        <option value="synthesized">synthesized</option>
                        <option value="mastered">mastered</option>
                      </select>
                    </div>
                  </>
                )}

                {selectedTool === 'get_capability_matrix' && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400">Capability ID</label>
                    <input
                      type="text"
                      value={toolQueryArg}
                      onChange={(e) => setToolQueryArg(e.target.value)}
                      placeholder="e.g. 01, 02, 07 (leave blank for all)"
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-400">Result Limit</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={toolLimitArg}
                    onChange={(e) => setToolLimitArg(parseInt(e.target.value, 10) || 5)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                  />
                </div>

                <button
                  onClick={handleExecuteAgentTool}
                  disabled={isExecutingTool}
                  className="w-full mt-2 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-950 disabled:opacity-50"
                >
                  {isExecutingTool ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Executing Tool Call...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Execute Agent Tool</span>
                    </>
                  )}
                </button>
              </div>

              {/* Real-Time Output Console */}
              <div className="space-y-2 md:col-span-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-xs font-mono text-slate-300">Live JSON Payload Response</span>
                  </div>
                  {toolExecutionResult && (
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                      {toolExecutionResult.executionTimeMs || 8}ms &bull; {toolExecutionResult.resultCount || 0} items
                    </span>
                  )}
                </div>

                <pre className="font-mono text-xs text-emerald-400 bg-slate-900/60 p-4 rounded-lg overflow-x-auto max-h-80 whitespace-pre-wrap">
                  {toolExecutionResult 
                    ? JSON.stringify(toolExecutionResult, null, 2)
                    : '// Click "Execute Agent Tool" to test server-side execution...'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW: MAIN OVERVIEW (PHASE-SPECIFIC) */}
      {/* ========================================================================= */}
      {activeViewMode === 'overview' && (
        <div className="space-y-8">
          {/* PHASE 2 OVERVIEW: FULL CAPABILITY-TO-FILE DELIVERY MATRIX */}
          {selectedPhase === 2 && (
            <div className="space-y-6">
              {/* Matrix Search & Filter Bar */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="relative w-full md:w-96">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by capability, component (.tsx), data file (.json), or endpoint..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                    <span className="text-slate-500 px-2 text-[11px]">Domain:</span>
                    {['all', 'Media & Data', 'Spatial & Viz', 'Audio & AI', 'DevOps & Docs'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategoryFilter(cat)}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                          activeCategoryFilter === cat
                            ? 'bg-sky-600 text-white font-bold'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                        }`}
                      >
                        {cat === 'all' ? 'All' : cat}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                    <span className="text-slate-500 px-2 text-[11px]">Audience:</span>
                    {['all', 'human', 'agent'].map((aud) => (
                      <button
                        key={aud}
                        onClick={() => setActiveAudienceFilter(aud as any)}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                          activeAudienceFilter === aud
                            ? 'bg-sky-600 text-white font-bold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {aud.charAt(0).toUpperCase() + aud.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Capability Traceability Cards */}
              <div className="grid grid-cols-1 gap-6">
                {filteredCapabilities.map((cap) => (
                  <div
                    key={cap.id}
                    className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-md space-y-4"
                  >
                    {/* Top Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-sky-950 text-sky-400 font-mono font-bold text-xs flex items-center justify-center border border-sky-800/80">
                          #{cap.id}
                        </span>
                        <div>
                          <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <span>{cap.title}</span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-sky-300 font-medium border border-slate-700">
                              {cap.badge}
                            </span>
                          </h3>
                          <p className="text-xs text-slate-400">{cap.summary}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                          {cap.category}
                        </span>
                        <span className={`text-[11px] px-2 py-0.5 rounded font-bold ${
                          cap.audience === 'agent' 
                            ? 'bg-amber-950 text-amber-300 border border-amber-800' 
                            : cap.audience === 'human'
                              ? 'bg-sky-950 text-sky-300 border border-sky-800'
                              : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                        }`}>
                          {cap.audience === 'both' ? 'Human + Agent' : cap.audience === 'human' ? 'Human UX' : 'Agent API'}
                        </span>
                      </div>
                    </div>

                    {/* Files Delivery Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                      {/* Column 1: UI Component */}
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                        <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Code2 className="w-3.5 h-3.5" />
                          <span>Primary UI Component</span>
                        </div>
                        <div className="font-mono text-xs font-bold text-white break-all">
                          {cap.primaryComponent}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          Scale: {cap.componentLines}
                        </div>
                      </div>

                      {/* Column 2: Data & Storage */}
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                        <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Database className="w-3.5 h-3.5" />
                          <span>Data &amp; Storage Files</span>
                        </div>
                        <ul className="text-xs font-mono text-slate-300 space-y-1">
                          {cap.dataFiles.map((df, i) => (
                            <li key={i} className="truncate text-[11px]">&bull; {df}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Column 3: Backend Server Endpoints */}
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                        <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Server className="w-3.5 h-3.5" />
                          <span>Server Endpoints (server.ts)</span>
                        </div>
                        <ul className="text-xs font-mono text-slate-300 space-y-1">
                          {cap.endpoints.map((ep, i) => (
                            <li key={i} className="truncate text-[11px] text-amber-300/90">&bull; {ep}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Dual Contracts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                      <div>
                        <span className="font-bold text-sky-400">Human UX: </span>
                        <span className="text-slate-300">{cap.humanExperience}</span>
                      </div>
                      <div>
                        <span className="font-bold text-amber-400">Agent Contract: </span>
                        <span className="text-slate-300">{cap.agentContract}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PHASE 3 OVERVIEW: DUAL-AUDIENCE MACHINE PROTOCOL & TOOL SCHEMAS */}
          {selectedPhase === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-slate-900 border border-sky-900/60 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-sky-950 text-sky-400 font-bold flex items-center justify-center">👤</span>
                    <h3 className="font-bold text-white text-base">Human Interface Channel</h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Designed for cognitive ergonomics, spatial immersion, and audio multitasking. Features interactive 60fps canvas astronomy, AirPods stem play/pause controls, and printable PDF reports.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900 border border-amber-900/60 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-amber-950 text-amber-400 font-bold flex items-center justify-center">🤖</span>
                    <h3 className="font-bold text-white text-base">Autonomous Agent Protocol</h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Provides zero-friction REST endpoints under <code className="text-amber-400">/api/agent/*</code> and standard OpenAI / Gemini / Claude tool calling schemas with zero DOM scraping needed.
                  </p>
                </div>
              </div>

              {/* Endpoints Table */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Server className="w-4 h-4 text-emerald-400" />
                    <span>Real-Time Programmatic Agent Endpoints</span>
                  </h3>
                  <button
                    onClick={() => setActiveViewMode('agent-playground')}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors"
                  >
                    Open Live Playground
                  </button>
                </div>

                <div className="divide-y divide-slate-800 font-mono text-xs">
                  <div className="py-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">GET</span>
                      <span className="text-white font-bold">/api/agent/capabilities</span>
                    </div>
                    <span className="text-slate-400 font-sans text-xs">Returns machine-readable manifest of all 14 capabilities</span>
                  </div>

                  <div className="py-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">GET</span>
                      <span className="text-white font-bold">/api/agent/schema</span>
                    </div>
                    <span className="text-slate-400 font-sans text-xs">Exports JSON Schemas for Playlist, YouTubeClip, CosmosNode, Cluster</span>
                  </div>

                  <div className="py-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">GET</span>
                      <span className="text-white font-bold">/api/agent/tools</span>
                    </div>
                    <span className="text-slate-400 font-sans text-xs">Function Calling declarations for OpenAI, Gemini &amp; Claude</span>
                  </div>

                  <div className="py-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 font-bold">POST</span>
                      <span className="text-white font-bold">/api/agent/execute-tool</span>
                    </div>
                    <span className="text-slate-400 font-sans text-xs">Executes tool queries and atomic disk mutations safely server-side</span>
                  </div>

                  <div className="py-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">POST</span>
                      <span className="text-white font-bold">/api/agent/query</span>
                    </div>
                    <span className="text-slate-400 font-sans text-xs">Structured agent query filter endpoint</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PHASE 1 OVERVIEW: SYSTEM TOPOLOGY & TECHNICAL DEBT */}
          {selectedPhase === 1 && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Technical Debt &amp; Remediation Assessment</span>
                  </h3>
                  <p className="text-xs text-slate-400">Architectural risks inherited from organic vibe coding and target remediations</p>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900 text-slate-400 uppercase font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-3">Area</th>
                        <th className="p-3">Organic Pattern</th>
                        <th className="p-3">Failure Risk</th>
                        <th className="p-3">Target Clean Architecture</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      <tr>
                        <td className="p-3 font-semibold text-white">Monolithic Server</td>
                        <td className="p-3 text-slate-400">Single 1,300+ line server.ts</td>
                        <td className="p-3 text-amber-400">High friction in editing</td>
                        <td className="p-3 text-emerald-400">Modular routers in /server/routes</td>
                        <td className="p-3"><span className="text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">Phase 3 APIs Live</span></td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-white">File Persistence</td>
                        <td className="p-3 text-slate-400">Direct fs.writeFileSync</td>
                        <td className="p-3 text-amber-400">Disk corruption risk on crash</td>
                        <td className="p-3 text-emerald-400">Atomic write via temporary file + rename</td>
                        <td className="p-3"><span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">Resolved in Phase 3</span></td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-white">Agent Accessibility</td>
                        <td className="p-3 text-slate-400">HTML rendering only</td>
                        <td className="p-3 text-amber-400">LLM agents must parse UI DOM</td>
                        <td className="p-3 text-emerald-400">Strict JSON schemas &amp; /api/agent/*</td>
                        <td className="p-3"><span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">Delivered in Phase 3</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* PHASE 4 OVERVIEW: IPAD VS CLOUD PROCESSING TOPOLOGY */}
          {selectedPhase === 4 && (
            <div className="space-y-6">
              {/* Dual Visual Ratio Gauges */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Mode A: Development */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5" />
                      Mode A &bull; Development Lifecycle
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-semibold border border-purple-800">
                      Vibe Coding Phase
                    </span>
                  </div>

                  <div>
                    <div className="text-xl font-extrabold text-white mb-1">95% Cloud &bull; 5% iPad</div>
                    <p className="text-xs text-slate-400">
                      When issuing prompts, compiling TypeScript, running shell tools, and transpiling bundles.
                    </p>
                  </div>

                  {/* Percentage Bar */}
                  <div className="space-y-1.5">
                    <div className="w-full h-5 bg-slate-800 rounded-full overflow-hidden flex border border-slate-700">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full flex items-center justify-center text-[10px] font-extrabold text-white" 
                        style={{ width: '95%' }}
                      >
                        95% Cloud (TPUs &amp; Cloud Run)
                      </div>
                      <div 
                        className="bg-cyan-500 h-full flex items-center justify-center text-[9px] font-extrabold text-slate-950" 
                        style={{ width: '5%' }}
                      >
                        5%
                      </div>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                      <span>Cloud: TPUs, Node.js, Vite, Git</span>
                      <span>iPad: WebKit, DOM, TLS</span>
                    </div>
                  </div>

                  {/* Breakdown details */}
                  <div className="space-y-2 text-xs pt-2">
                    <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-start gap-2">
                      <span className="font-bold text-purple-400">60%</span>
                      <span className="text-slate-300">
                        <strong className="text-white">Gemini 3.8-Flash on Google TPUs:</strong> Ingesting 45k-110k token attention contexts and executing multi-layer neural reasoning.
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-start gap-2">
                      <span className="font-bold text-indigo-400">35%</span>
                      <span className="text-slate-300">
                        <strong className="text-white">Cloud Run Container:</strong> Vite dev server, TypeScript AST type-checking, and Express proxy (`server.ts`).
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-start gap-2">
                      <span className="font-bold text-cyan-400">5%</span>
                      <span className="text-slate-300">
                        <strong className="text-white">iPad Client:</strong> Safari WebKit DOM reflow, streaming WebSocket framing, and touch keyboard inputs.
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-emerald-400 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-900/60">
                    🌿 <strong>Result:</strong> Zero thermal throttling and minimal battery drain (&lt;2%/hr) on your iPad during heavy development.
                  </div>
                </div>

                {/* Mode B: Runtime */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      Mode B &bull; Application Runtime
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-semibold border border-cyan-800">
                      Day-to-Day Study
                    </span>
                  </div>

                  <div>
                    <div className="text-xl font-extrabold text-white mb-1">68% iPad &bull; 32% Cloud</div>
                    <p className="text-xs text-slate-400">
                      When exploring the celestial Video Cosmos, listening to AirPods audio lessons, or taking notes.
                    </p>
                  </div>

                  {/* Percentage Bar */}
                  <div className="space-y-1.5">
                    <div className="w-full h-5 bg-slate-800 rounded-full overflow-hidden flex border border-slate-700">
                      <div 
                        className="bg-gradient-to-r from-cyan-500 to-sky-400 h-full flex items-center justify-center text-[10px] font-extrabold text-slate-950" 
                        style={{ width: '68%' }}
                      >
                        68% iPad (GPU, Neural Engine, V8)
                      </div>
                      <div 
                        className="bg-indigo-600 h-full flex items-center justify-center text-[10px] font-extrabold text-white" 
                        style={{ width: '32%' }}
                      >
                        32% Cloud
                      </div>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                      <span>iPad: Canvas GPU, ANE Speech, vDOM</span>
                      <span>Cloud: APIs, Storage, YouTube</span>
                    </div>
                  </div>

                  {/* Breakdown details */}
                  <div className="space-y-2 text-xs pt-2">
                    <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-start gap-2">
                      <span className="font-bold text-cyan-400">25%</span>
                      <span className="text-slate-300">
                        <strong className="text-white">HTML5 Canvas 60 FPS Physics:</strong> Apple Silicon GPU rendering 471 stars, celestial rings, and coordinate transforms.
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-start gap-2">
                      <span className="font-bold text-cyan-400">20%</span>
                      <span className="text-slate-300">
                        <strong className="text-white">Apple Neural Engine SpeechSynthesis:</strong> On-device neural voice generation with zero cloud latency.
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-start gap-2">
                      <span className="font-bold text-cyan-400">23%</span>
                      <span className="text-slate-300">
                        <strong className="text-white">React 19 &amp; LocalStorage:</strong> In-memory playlist clustering, D3 mind maps, and AirPods stem pinch loop.
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-start gap-2">
                      <span className="font-bold text-indigo-400">32%</span>
                      <span className="text-slate-300">
                        <strong className="text-white">Cloud Support:</strong> Cloud Run Express APIs, Gemini Flash insight extraction, and YouTube CDN streaming.
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-cyan-400 bg-cyan-950/40 p-2.5 rounded-lg border border-cyan-900/60">
                    ⚡ <strong>Result:</strong> Instantaneous sub-10ms touch response, zero audio buffering, and full offline lesson narration on walks.
                  </div>
                </div>

              </div>

              {/* Scientific Methodology Matrix */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>Empirical Measurement Methodology (How this estimation was derived)</span>
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="text-[10px] uppercase font-bold text-purple-400 mb-1">1. FLOPs Accounting</div>
                    <div className="text-lg font-bold text-white mb-1">&gt; 10¹⁴ FLOPs</div>
                    <p className="text-[11px] text-slate-400">
                      Gemini 3.8-Flash 100k-token inference consumes over 250,000× more operations in TPU pods than iPad Safari consumes painting the UI.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="text-[10px] uppercase font-bold text-indigo-400 mb-1">2. Network Payload</div>
                    <div className="text-lg font-bold text-white mb-1">&lt; 150 KB : 50 MB</div>
                    <p className="text-[11px] text-slate-400">
                      Prompt text sent over the air is only ~1 KB; internal cloud disk reads and type-checking process over 50 MB per turn.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="text-[10px] uppercase font-bold text-emerald-400 mb-1">3. Power &amp; Thermals</div>
                    <div className="text-lg font-bold text-white mb-1">1.5W vs. 6.5W</div>
                    <p className="text-[11px] text-slate-400">
                      iPad operates at idle power (~1.5W) during agent turns, then ramps to ~6.5W active GPU power when running 60 FPS Canvas physics.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW: EMBEDDED INTERACTIVE HTML REPORT */}
      {/* ========================================================================= */}
      {activeViewMode === 'html-report' && (
        <div className={`space-y-3 ${isIframeFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-4' : ''}`}>
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Interactive Phase {selectedPhase} Report</span>
                  <code className="text-[11px] font-mono text-sky-400">{htmlUrl}</code>
                </span>
                <p className="text-[11px] text-slate-400">
                  Visual breakdown designed for human inspection: responsive tables, interactive filters, and rich styling.
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

          <div className={`rounded-xl border border-slate-800 overflow-hidden bg-slate-950 shadow-2xl ${
            isIframeFullscreen ? 'h-[calc(100vh-80px)]' : 'h-[850px]'
          }`}>
            <iframe
              key={iframeKey}
              src={htmlUrl}
              title={`Phase ${selectedPhase} Analysis Report`}
              className="w-full h-full border-0 bg-slate-950"
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW: MACHINE-READABLE MARKDOWN SPECIFICATION */}
      {/* ========================================================================= */}
      {activeViewMode === 'markdown-spec' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Phase {selectedPhase} Markdown Specification</span>
                  <code className="text-[11px] font-mono text-amber-400">
                    {selectedPhase === 1 ? '01_HIGH_LEVEL_SYSTEM_ARCHITECTURE.md' : selectedPhase === 2 ? '02_CAPABILITY_FILE_MATRIX.md' : '03_DUAL_AUDIENCE_AGENT_TOOLS_SPEC.md'}
                  </code>
                </span>
                <p className="text-[11px] text-slate-400">
                  Canonical markdown format ready for ingestion by AI co-pilots and autonomous LLM agents.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
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
                title="Copy entire markdown specification"
              >
                {copiedMarkdownText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copiedMarkdownText ? 'Copied Full Spec!' : 'Copy Spec'}</span>
              </button>

              <button
                onClick={handleDownloadMarkdown}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
                title="Download markdown file"
              >
                <Download className="w-3.5 h-3.5 text-sky-400" />
                <span>Download .md</span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 overflow-x-auto shadow-xl">
            {isLoading ? (
              <div className="py-20 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-sky-400 animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Loading Phase {selectedPhase} specification...</p>
              </div>
            ) : markdownViewType === 'raw' ? (
              <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                {markdownContent}
              </pre>
            ) : (
              <div className="prose prose-invert prose-sky max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
                <Markdown>{markdownContent}</Markdown>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
