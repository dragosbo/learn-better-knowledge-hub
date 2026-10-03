import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  Layers, 
  Code2, 
  Cpu, 
  CheckCircle2, 
  Search,
  Sparkles,
  ArrowRight,
  BookOpen
} from 'lucide-react';

interface PrerequisitesModalProps {
  isOpen: boolean;
  onClose: () => void;
  markdownContent: string;
}

export const PrerequisitesModal: React.FC<PrerequisitesModalProps> = ({
  isOpen,
  onClose,
  markdownContent,
}) => {
  const [activeTab, setActiveTab] = useState<'levels' | 'languages' | 'interactions' | 'raw'>('levels');
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState<'all' | 'high' | 'mid' | 'low'>('all');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'prerequisite.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  const EXPERTISE_LEVELS = [
    {
      level: 1,
      rank: 'Absolute Beginner',
      category: 'End-User',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
      focusArea: 'UI Navigation & Video Watching',
      competencies: 'Can navigate the user interface, click playlist links, launch YouTube videos, read lesson notes, and listen to synthesized audio.',
      evidence: 'Navbar tabs, Video modal player, Audio narration play button',
    },
    {
      level: 2,
      rank: 'Computer Operator',
      category: 'Runner User',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
      focusArea: 'CLI Runner Shortcuts',
      competencies: 'Understands basic terminal commands (cd, ls, dir). Can run single-key batch scripts (init.bat, p.bat, r.bat, w.bat) and Unix shell scripts (./scripts/p.sh).',
      evidence: 'init.bat, scripts/p.bat, scripts/r.sh, init.sh',
    },
    {
      level: 3,
      rank: 'Novice Scripter',
      category: 'Documenter',
      badgeColor: 'bg-sky-950 text-sky-300 border-sky-800',
      focusArea: 'HTML Structure & Markdown Notes',
      competencies: 'Understands basic HTML5 tags (div, button, iframe), Tailwind utility classes, and Markdown syntax used for curriculum cards and Obsidian note templates.',
      evidence: 'USER_GUIDE.md, public/legacy/*.html, claude_lessons.md',
    },
    {
      level: 4,
      rank: 'Junior Frontend Developer',
      category: 'React Builder',
      badgeColor: 'bg-sky-950 text-sky-300 border-sky-800',
      focusArea: 'React UI & Component Tree',
      competencies: 'Understands React 19 JSX components, props, conditional rendering, local state hooks (useState, useEffect, useMemo), and Lucide icon systems.',
      evidence: 'src/components/Navbar.tsx, src/components/UserGuideViewer.tsx',
    },
    {
      level: 5,
      rank: 'Intermediate Web Engineer',
      category: 'Full-Stack',
      badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-800',
      focusArea: 'TypeScript Contracts & Express APIs',
      competencies: 'Understands TypeScript static typing (LessonItem, YouTubeClip, VoiceReflectionSession), Express REST endpoints (/api/content/*), fetch requests, and localStorage state persistence.',
      evidence: 'src/types/index.ts, src/services/api.ts, server.ts endpoints',
    },
    {
      level: 6,
      rank: 'Systems & Python Engineer',
      category: 'Backend & Automation',
      badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-800',
      focusArea: 'Python CLI & Ingestion Pipelines',
      competencies: 'Understands Python 3.12 architecture: lib/paths.py, read_channel.py, read_transcript.py, config_transcribe.json, regex AST parsing, subprocess execution, and native file I/O.',
      evidence: 'code/read_channel.py, code/list_playlists.py, lib/paths.py',
    },
    {
      level: 7,
      rank: 'Audio & Applied ML Engineer',
      category: 'Machine Learning',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-800',
      focusArea: 'Local Speech-to-Text & Neural TTS',
      competencies: 'Comprehends local ML inference: faster-whisper (CTranslate2, int8 quantization, beam search, VAD filtering), Piper neural TTS, Word-Error-Rate (WER) calculation, and frequency-weighted n-gram tokenization.',
      evidence: 'code/transcribe_audio.py, make_wordcloud.py, lib/textutil.py',
    },
    {
      level: 8,
      rank: 'Graphics & Mathematical Modeler',
      category: 'Spatial Physics',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-800',
      focusArea: '2D Canvas Physics & Vector PDF Geometry',
      competencies: 'Understands procedural 2D Canvas rendering: Euler numerical integration (velocity damping, gravitational attraction, repulsion forces), constellation quadtree clustering, and vector PDF geometry in academicPdfGenerator.ts (7.5mm rule, point transforms).',
      evidence: 'src/components/VideoCosmosGraph.tsx, src/utils/academicPdfGenerator.ts',
    },
    {
      level: 9,
      rank: 'Resilience & Systems Architect',
      category: 'Distributed Systems',
      badgeColor: 'bg-rose-950 text-rose-300 border-rose-800',
      focusArea: 'API Cascades & Fault Recovery',
      competencies: 'Understands multi-tier resilience: Gemini API cascade routing (gemini-3.8-flash -> gemini-flash-latest -> gemini-2.5-flash), HTTP 503 high-demand heuristic recovery, Web Speech vs MediaRecorder fallback, and multi-model agent prompt orchestration.',
      evidence: 'server.ts (generateGeminiWithCascade), VoiceReflectionInterviewer.tsx',
    },
    {
      level: 10,
      rank: 'Top Expert / Principal Systems Architect',
      category: 'Principal Architect',
      badgeColor: 'bg-purple-950 text-purple-300 border-purple-800 font-bold',
      focusArea: 'Total System Synthesis & Zero-Latency Polyglot Cohesion',
      competencies: 'Has complete mental model mastery of the entire ecosystem: can effortlessly trace data flow from raw YouTube video packets through Python CLI extractors, through Node.js Express middleware, into React 60 FPS Canvas renderers, out to Web Speech APIs, and across multi-model AI agent contracts. Can re-architect any subsystem from memory without introducing regressions.',
      evidence: 'Complete codebase synthesis, multi-track curriculum alignment, and zero-quota local-first design.',
    },
  ];

  interface LanguageSpec {
    name: string;
    version: string;
    badge: string;
    role: string;
    files: string;
    requiredLevel: number;
    entryLevel: number;
    levelTitle: string;
    levelBadgeColor: string;
    highestComplexity: string;
    whyDetailed: string;
    why: string;
  }

  const LANGUAGES: LanguageSpec[] = [
    {
      name: 'TypeScript',
      version: 'v5.x',
      badge: 'Strict Static Typing',
      role: 'Frontend Application & Express Gateway',
      files: 'src/**/*.tsx, src/**/*.ts, server.ts',
      requiredLevel: 8,
      entryLevel: 4,
      levelTitle: 'Level 8 — Graphics & Mathematical Modeler / Systems Architect',
      levelBadgeColor: 'bg-amber-950 text-amber-300 border-amber-700',
      highestComplexity: 'Euler physics integration in VideoCosmosGraph.tsx, millimeter vector transforms in academicPdfGenerator.ts, and multi-model Gemini fallback cascade in server.ts.',
      whyDetailed: 'Lower levels can edit basic JSX or simple endpoints, but Level 8 is required to model 2D differential celestial physics, vector PDF rule geometry (7.5mm spacing), complex TypeScript generics, and resilient async retry state machines.',
      why: 'Guarantees strict type safety across complex structures (70 playlists, 486 clips, 19 lessons, Socratic dialogues). Eliminates runtime errors and enforces deterministic API interfaces.',
    },
    {
      name: 'Python',
      version: '3.12+',
      badge: 'Media & Local ML Inference',
      role: 'CLI Tooling, Audio Extraction & Local ML',
      files: 'code/*.py, scripts/*.py, lib/*.py',
      requiredLevel: 7,
      entryLevel: 4,
      levelTitle: 'Level 7 — Audio & Applied ML Engineer',
      levelBadgeColor: 'bg-amber-950 text-amber-300 border-amber-700',
      highestComplexity: 'faster-whisper CTranslate2 int8, beam search decoding, acoustic VAD thresholds, Piper neural ONNX models, and TF-IDF tokenization.',
      whyDetailed: 'Lower levels (3–5) can run scripts or edit paths, but Level 7 is required to tune acoustic VAD thresholds, debug CTranslate2 quantization memory leaks, compute WER, and manage subprocess streaming pipes.',
      why: 'Unrivaled ecosystem for local media manipulation (yt-dlp, ffmpeg) and zero-cost local AI inference (faster-whisper int8, Piper TTS, wordcloud NLP) with zero cloud API keys.',
    },
    {
      name: 'JavaScript / ES2024',
      version: 'Modern ECMAScript',
      badge: 'Browser Hardware & Web APIs',
      role: 'Hardware Web APIs, Vite Tooling, Standalone Decks',
      files: 'vite.config.ts, decks/*.html, videos/*.html, public/legacy/*.html',
      requiredLevel: 6,
      entryLevel: 3,
      levelTitle: 'Level 6 — Hardware Web APIs & Runtime Systems',
      levelBadgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-700',
      highestComplexity: 'Web Speech API speech synthesis lifecycle, MediaRecorder audio blob streaming, MediaSession lockscreen controls, and event-driven deck engines.',
      whyDetailed: 'Browser hardware APIs exhibit notorious asynchronous timing bugs across browsers. Level 6 expertise is required to manage audio buffer boundaries, media stream memory reclamation, and standalone presentation keyframe state machines without external runtime libraries.',
      why: 'Direct execution in all modern browsers without bundle overhead. Direct access to window.speechSynthesis, navigator.mediaDevices, and MediaSession.',
    },
    {
      name: 'CSS3 / Tailwind CSS',
      version: 'v4',
      badge: 'GPU Animations & Anti-Slop',
      role: 'Utility Styling & Waveform Animations',
      files: 'src/index.css, decks/ styles',
      requiredLevel: 5,
      entryLevel: 2,
      levelTitle: 'Level 5 — GPU Animation & Architectural Styling',
      levelBadgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-700',
      highestComplexity: 'GPU-accelerated keyframe animation (@keyframes wave, pulse-ring), Tailwind v4 utility composition, and WCAG AA contrast compliance.',
      whyDetailed: 'Modern styling in this app coordinates hardware-accelerated animations synchronized to audio decibels and maintains responsiveness across multi-pane split workspaces without layout thrashing.',
      why: 'Utility-first styling with zero runtime CSS bundle overhead, GPU keyframe animations for audio waveforms, and strict WCAG AA accessibility.',
    },
    {
      name: 'Dockerfile / YAML',
      version: 'OCI Standard',
      badge: 'Deterministic CI & Deploy',
      role: 'Containerization & CI Validation',
      files: 'Dockerfile.standalone, .devcontainer/devcontainer.json, .github/workflows/*.yml',
      requiredLevel: 5,
      entryLevel: 2,
      levelTitle: 'Level 5 — Multi-Runtime Systems Packaging',
      levelBadgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-700',
      highestComplexity: 'Dual-runtime Debian packaging (Node 22 + Python 3.12), shared CTranslate2 C++ binaries, ffmpeg, and non-root security isolation.',
      whyDetailed: 'Packaging both a Node.js full-stack app and a local C-accelerated Python ML pipeline inside one deterministic container requires understanding Linux package management, shared library linking, and Docker caching layers.',
      why: 'Pins exact operating system dependencies (Python 3.12, Node 22, ffmpeg, CTranslate2) for reproducible single-command cloud and CI deployment.',
    },
    {
      name: 'HTML5',
      version: 'Living Standard',
      badge: 'Semantic Document & Canvas',
      role: 'SPA Entry, Presentation Decks & Sandboxed Iframes',
      files: 'index.html, decks/*.html, videos/*.html',
      requiredLevel: 4,
      entryLevel: 2,
      levelTitle: 'Level 4 — Spatial Canvas & Sandboxed DOM',
      levelBadgeColor: 'bg-sky-950 text-sky-300 border-sky-700',
      highestComplexity: 'Procedural <canvas> surface contexts, strict sandboxed <iframe> boundary isolation, accessible dialog landmarks.',
      whyDetailed: 'Understanding HTML in this application requires knowledge of browser execution contexts, high-DPI canvas scaling, and secure iframe encapsulation.',
      why: 'Standardized document structure, high-performance Canvas 2D contexts for 60 FPS physics, and secure iframes for legacy HTML prototypes.',
    },
    {
      name: 'POSIX Bash Shell',
      version: 'Bourne-Again Shell',
      badge: 'Unix CLI Velocity',
      role: 'Single-Key Terminal Shortcuts',
      files: 'scripts/*.sh, init.sh',
      requiredLevel: 3,
      entryLevel: 2,
      levelTitle: 'Level 3 — Unix CLI Scripter',
      levelBadgeColor: 'bg-sky-950 text-sky-300 border-sky-700',
      highestComplexity: 'set -e failure propagation, shebang declarations, argument forwarding ("$@"), and virtual environment detection.',
      whyDetailed: 'Comprehending the shell scripts requires basic understanding of Unix processes, standard streams (stdin, stdout, stderr), and environment variable exports.',
      why: 'Provides single-key developer velocity (./scripts/p.sh, ./scripts/w.sh) without typing verbose flags or virtual environment activation strings.',
    },
    {
      name: 'Windows Batch',
      version: 'Command Shell (.bat)',
      badge: 'Native Windows Portability',
      role: 'Windows PATH Injection & Shortcuts',
      files: 'init.bat, p.bat, r.bat, w.bat',
      requiredLevel: 3,
      entryLevel: 2,
      levelTitle: 'Level 3 — Windows CLI Scripter',
      levelBadgeColor: 'bg-sky-950 text-sky-300 border-sky-700',
      highestComplexity: 'setlocal enabledelayedexpansion, %~dp0 directory resolution, argument expansion (%*), errorlevel checking.',
      whyDetailed: 'Understands Windows CMD environment isolation and dynamic PATH modification without corrupting global system environment variables.',
      why: 'Ensures native Windows users can run all commands without needing WSL or Git Bash by injecting scripts into the current command environment PATH.',
    },
    {
      name: 'JSON / Schema',
      version: 'RFC 8259',
      badge: 'Declarative Data Exchange',
      role: 'Pipeline Configs & Series Manifests',
      files: 'config_transcribe.json, 00_SERIES_VIDEO_PLAYLIST.json, channelPlaylists.json',
      requiredLevel: 2,
      entryLevel: 1,
      levelTitle: 'Level 2 — Data Operator',
      levelBadgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-700',
      highestComplexity: 'Nested 70-playlist hierarchy, 00_SERIES_VIDEO_PLAYLIST.json synchronization, UUIDs and status enums.',
      whyDetailed: 'Requires strict JSON syntax adherence, escaping rules, and understanding data exchange schemas across Python, Node.js, and client state.',
      why: 'Universal, language-agnostic data exchange format seamlessly parsed across Python, Node.js, and browser JavaScript.',
    },
    {
      name: 'Markdown (GFM)',
      version: 'CommonMark',
      badge: 'Universal Knowledge Vault',
      role: 'Curriculum Plans, User Guides & Dossiers',
      files: 'prerequisite.md, USER_GUIDE.md, lessons_Claude/*.md, videos/*.md',
      requiredLevel: 2,
      entryLevel: 1,
      levelTitle: 'Level 2 — Document Architect',
      levelBadgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-700',
      highestComplexity: 'GitHub Flavored Markdown tables, Obsidian #tags and [[wikilinks]], Cornell note layouts, NotebookLM prompt source dossiers.',
      whyDetailed: 'Requires understanding Markdown AST formatting, metadata frontmatter, code fence language specifiers, and note link topology.',
      why: 'Human-readable documentation that doubles as executable source material for Google NotebookLM, Obsidian personal knowledge graphs, and LLM prompts.',
    },
  ];

  const filteredLevels = EXPERTISE_LEVELS.filter(l => 
    searchQuery === '' ||
    l.rank.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.focusArea.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.competencies.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.evidence.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="prereq-modal-title"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-sky-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="prereq-modal-title" className="text-base sm:text-lg font-bold text-white">
                  Technical Prerequisites &amp; Expertise Evaluation
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700">
                  prerequisite.md
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Comprehensive 10-tier expertise scale &bull; 10 programming languages &bull; System interaction loops
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title="Copy entire prerequisite.md markdown to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy MD'}</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title="Download prerequisite.md file"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Download</span>
            </button>

            <a
              href="/prerequisite.md"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
              title="Open raw prerequisite.md in new browser tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
              title="Close modal (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Switcher Bar */}
        <div className="px-4 sm:px-5 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('levels')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'levels' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Level 1–10 Table</span>
            </button>
            <button
              onClick={() => setActiveTab('languages')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'languages' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Languages (10)</span>
            </button>
            <button
              onClick={() => setActiveTab('interactions')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'interactions' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Interaction Loops</span>
            </button>
            <button
              onClick={() => setActiveTab('raw')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'raw' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Raw Markdown</span>
            </button>
          </div>

          {activeTab === 'levels' && (
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search level or skill..."
                className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Modal Body Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: Level 1 to 10 Table */}
          {activeTab === 'levels' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Showing {filteredLevels.length} of 10 competency tiers</span>
                <span className="text-indigo-400 font-medium">Spectrum: Beginner ➔ Principal Systems Architect</span>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300 divide-y divide-slate-800">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-3 sm:px-4 font-bold">Tier / Rank</th>
                      <th className="py-3 px-3 sm:px-4 font-bold">Focus Area in this App</th>
                      <th className="py-3 px-3 sm:px-4 font-bold hidden md:table-cell">Required Competencies</th>
                      <th className="py-3 px-3 sm:px-4 font-bold">Code Evidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 bg-slate-900/40">
                    {filteredLevels.map((lvl) => (
                      <tr key={lvl.level} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${lvl.badgeColor}`}>
                              L{lvl.level}
                            </span>
                            <div>
                              <div className="font-bold text-white text-xs">{lvl.rank}</div>
                              <div className="text-[10px] text-slate-500">{lvl.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 sm:px-4">
                          <span className="font-semibold text-slate-200">{lvl.focusArea}</span>
                          <p className="text-[11px] text-slate-400 mt-0.5 md:hidden">{lvl.competencies}</p>
                        </td>
                        <td className="py-3 px-3 sm:px-4 hidden md:table-cell text-slate-300 leading-relaxed text-[11px]">
                          {lvl.competencies}
                        </td>
                        <td className="py-3 px-3 sm:px-4 font-mono text-[10px] text-sky-400">
                          {lvl.evidence}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pathway Guide */}
              <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Recommended Mastery Sequence
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  To understand the complete codebase, start with the <strong>Interactive Slide Decks</strong> (Levels 1–3), progress through the <strong>19-Lesson AI Coding Academy</strong> (Levels 4–6), explore the <strong>Python CLI scripts</strong> (Levels 6–7), audit the <strong>Canvas 2D Physics</strong> in <code>VideoCosmosGraph.tsx</code> (Level 8), and examine the <strong>Gemini Cascade Gateway</strong> in <code>server.ts</code> (Levels 9–10).
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: 10 Programming Languages & Required Levels */}
          {activeTab === 'languages' && (() => {
            const filteredLanguages = LANGUAGES.filter(l => {
              if (languageFilter === 'high') return l.requiredLevel >= 6;
              if (languageFilter === 'mid') return l.requiredLevel >= 4 && l.requiredLevel <= 5;
              if (languageFilter === 'low') return l.requiredLevel <= 3;
              return true;
            });

            return (
              <div className="space-y-5">
                {/* Header & Filter Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-sky-400" />
                      Required Knowledge Level per Programming Language (1 to 10 Scale)
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Evaluates exact comprehension tier required to audit, maintain, and extend each language subsystem.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => setLanguageFilter('all')}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-colors ${
                        languageFilter === 'all'
                          ? 'bg-sky-600 text-white border-sky-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      All (10)
                    </button>
                    <button
                      onClick={() => setLanguageFilter('high')}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-colors ${
                        languageFilter === 'high'
                          ? 'bg-amber-600 text-white border-amber-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      Core (L6–L8)
                    </button>
                    <button
                      onClick={() => setLanguageFilter('mid')}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-colors ${
                        languageFilter === 'mid'
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      Systems (L4–L5)
                    </button>
                    <button
                      onClick={() => setLanguageFilter('low')}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-colors ${
                        languageFilter === 'low'
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      Scripts (L2–L3)
                    </button>
                  </div>
                </div>

                {/* Comparative Table */}
                <div className="border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs text-slate-300 divide-y divide-slate-800">
                    <thead className="bg-slate-950/90 text-slate-400 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3 sm:px-4 font-bold">Language / Tool</th>
                        <th className="py-2.5 px-3 sm:px-4 font-bold text-center">Required Level</th>
                        <th className="py-2.5 px-3 sm:px-4 font-bold text-center">Entry Level</th>
                        <th className="py-2.5 px-3 sm:px-4 font-bold hidden lg:table-cell">Primary Domain</th>
                        <th className="py-2.5 px-3 sm:px-4 font-bold">Highest Complexity Feature</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 bg-slate-900/40">
                      {filteredLanguages.map((lang) => (
                        <tr key={lang.name} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-2.5 px-3 sm:px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-xs">{lang.name}</span>
                              <span className="text-[10px] font-mono text-slate-500">{lang.version}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 sm:px-4 whitespace-nowrap text-center">
                            <div className="inline-flex flex-col items-center gap-1">
                              <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${lang.levelBadgeColor}`}>
                                Level {lang.requiredLevel} / 10
                              </span>
                              {/* 10-Segment Mini Meter */}
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: 10 }).map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-1.5 h-1.5 rounded-xs ${
                                      i < lang.requiredLevel
                                        ? lang.requiredLevel >= 7
                                          ? 'bg-amber-400'
                                          : lang.requiredLevel >= 5
                                          ? 'bg-indigo-400'
                                          : 'bg-emerald-400'
                                        : 'bg-slate-800'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 sm:px-4 whitespace-nowrap text-center">
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              L{lang.entryLevel}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 sm:px-4 hidden lg:table-cell text-slate-300 text-[11px]">
                            {lang.role}
                          </td>
                          <td className="py-2.5 px-3 sm:px-4 text-[11px] text-slate-400 leading-snug">
                            {lang.highestComplexity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Deep Dive Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredLanguages.map((lang, idx) => (
                    <div 
                      key={idx} 
                      className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm"
                    >
                      <div className="space-y-2.5">
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-white">{lang.name}</span>
                              <span className="text-[10px] font-mono text-slate-400">{lang.version}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 font-medium">{lang.role}</div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${lang.levelBadgeColor}`}>
                              Req: Level {lang.requiredLevel}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              Entry: L{lang.entryLevel}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar Rating */}
                        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden flex border border-slate-800">
                          <div
                            className={`h-full ${
                              lang.requiredLevel >= 7
                                ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                                : lang.requiredLevel >= 5
                                ? 'bg-gradient-to-r from-sky-500 to-indigo-500'
                                : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                            }`}
                            style={{ width: `${(lang.requiredLevel / 10) * 100}%` }}
                          />
                        </div>

                        {/* Why this level is required */}
                        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            Why Level {lang.requiredLevel} is Strictly Required:
                          </span>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {lang.whyDetailed}
                          </p>
                        </div>

                        {/* High-complexity feature */}
                        <div className="text-[11px] text-slate-400 space-y-0.5">
                          <div className="text-slate-500 text-[10px] font-medium">Highest-Complexity Feature:</div>
                          <div className="text-slate-300 italic">{lang.highestComplexity}</div>
                        </div>

                        <div className="font-mono text-[10px] text-slate-500 truncate">
                          Files: {lang.files}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* TAB 3: Interaction Architecture & Rationale */}
          {activeTab === 'interactions' && (
            <div className="space-y-5">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-sky-400" />
                  The 3 Synchronized System Feedback Loops
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  How Python, TypeScript, Node.js, and browser Web APIs interact to deliver zero-latency local-first intelligence:
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 pt-1">
                  <div className="p-3.5 rounded-lg bg-slate-900 border border-indigo-900/50 space-y-1.5">
                    <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold">Loop 1 &bull; Ingestion</span>
                    <h4 className="text-xs font-bold text-white">Offline Python &amp; ML</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      <code>yt-dlp</code> extracts audio; <code>faster-whisper</code> transcribes locally; <code>Piper TTS</code> renders speech; all saved to <code>data/</code> with zero API costs.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-900 border border-sky-900/50 space-y-1.5">
                    <span className="text-[10px] font-mono text-sky-400 uppercase font-bold">Loop 2 &bull; Presentation</span>
                    <h4 className="text-xs font-bold text-white">Express &amp; React SPA</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Express serves JSON REST endpoints; React executes 60 FPS Canvas celestial physics, 3-tier hierarchical mind maps, and Cornell vector PDF export.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-900 border border-emerald-900/50 space-y-1.5">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Loop 3 &bull; Multimodal AI</span>
                    <h4 className="text-xs font-bold text-white">Speech &amp; Gemini SDK</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      User voice is captured via Web Speech + MediaRecorder; server cascades to Gemini 2.5/3.8 models, synthesizing Socratic takeaways back into Obsidian notes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Architectural Rationale Questions */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Why Are They Used As Is? Architectural Rationale
                </h4>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <div className="text-xs font-bold text-white">Why Python for ML instead of Node.js?</div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Python provides direct, high-throughput access to optimized C++ binaries (<code>CTranslate2</code> for Whisper, <code>ffmpeg</code>, and <code>onnxruntime</code> for Piper TTS) without unstable Node native addon bindings.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <div className="text-xs font-bold text-white">Why TypeScript for the Frontend &amp; Gateway?</div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    The platform manages high-dimensional states (70 playlists, 486 clips, Socratic dialogues, audio playback timestamps). TypeScript eliminates subtle type mismatches and guarantees deterministic state persistence in localStorage.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <div className="text-xs font-bold text-white">Why Markdown instead of a Relational Database for Notes?</div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Markdown is portable, human-readable, and zero-cost. It integrates directly with Obsidian, GitHub, and Google NotebookLM without requiring database server daemons.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Raw Markdown Document */}
          {activeTab === 'raw' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Raw content of <code>prerequisite.md</code> at root</span>
                <button
                  onClick={handleCopyMarkdown}
                  className="px-2.5 py-1 text-xs bg-slate-800 text-slate-200 rounded border border-slate-700 hover:bg-slate-700 flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy Full File'}</span>
                </button>
              </div>

              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[500px]">
                {markdownContent}
              </pre>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Root file: <code>/prerequisite.md</code></span>
            <span>&bull;</span>
            <span className="text-emerald-400">10 Levels Evaluated</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg border border-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
