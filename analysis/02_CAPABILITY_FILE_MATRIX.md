# Capability-to-File Delivery Matrix (Phase 2 Analysis)
**Project:** `learn-better` Personal Knowledge Hub & Multi-AI Vibe Coding Platform  
**Document Type:** Exhaustive Capability Implementation & File Dependency Registry  
**Audience:** Human Engineers, Software Architects & Autonomous AI Agents  
**Date:** September 2026  
**Status:** Canonical Implementation Ledger (Phase 2)

---

## 1. Executive Summary & Purpose

Phase 1 established the high-level architecture, the dual-audience paradigm (Human UX vs. Autonomous AI Agent schemas), and identified systemic technical debt.

**Phase 2 directly answers the core operational question:**  
> *"For each capability in the system, exactly which files, components, datasets, server endpoints, and utility functions deliver it?"*

This document provides an exhaustive, code-level traceability matrix mapping **all 14 core capabilities** to their exact deliverable files, their line ranges, data contracts, and architectural dependencies.

---

## 2. Complete Capability-to-File Delivery Matrix

| # | Capability Name | Primary Component / UI File | Data & Storage Files | Server API Endpoints (`server.ts`) | Supporting Libraries & Utilities |
|---|---|---|---|---|---|
| **01** | **Playlists & Clips Management** | `src/components/PlaylistManager.tsx` | `src/data/channelPlaylists.json`<br>`src/data/initialData.ts`<br>`localStorage` (`learn_better_playlists_v3`) | `GET /api/playlists`<br>`POST /api/playlists`<br>`POST /api/sync-youtube` | `lucide-react`, `src/services/api.ts` |
| **02** | **Allocation & Restructure Hub** | `src/components/PlaylistRestructureHub.tsx` | `src/data/playlistRestructureData.ts`<br>`localStorage` (`learn_better_is_restructured`) | None (Pure client-side algorithmic clustering & export) | `jspdf`, `jspdf-autotable`, `lucide-react` |
| **03** | **Video Cosmos Graph** | `src/components/VideoCosmosGraph.tsx` | `src/data/videoCosmosData.ts`<br>`localStorage` (`cosmos_custom_voyages_v1`) | None (Pure client-side Canvas physics engine) | HTML5 Canvas 2D Context, `lucide-react` |
| **04** | **Word Cloud & Mind Map Hub** | `src/components/PlaylistWordCloudMindMap.tsx` | `src/data/wordcloudMindmapData.ts` | `GET /api/wordcloud/playlists`<br>`GET /api/wordcloud/playlist/:id` | HTML5 Canvas 2D, SVG radial tree rendering |
| **05** | **Knowledge Hub & Study Studio** | `src/components/KnowledgeHub.tsx` | `src/data/initialData.ts`<br>`App.tsx` state | `GET /api/summaries`<br>`GET /api/summary/:id` | YouTube Iframe API, `lucide-react` |
| **06** | **AI Coding Academy** | `src/components/AILearningAcademy.tsx` | `imported_repo/lessons_claude/`<br>`imported_repo/lessons_kiro/` | `GET /api/lessons`<br>`GET /api/lesson/:id` | `react-markdown`, `lucide-react` |
| **07** | **AirPods Audio Player** | `src/components/AudioLessonPlayer.tsx` | Dynamic text chunks derived in-memory | None (Browser client-side synthesis) | Web Speech API (`SpeechSynthesis`), `navigator.mediaSession` |
| **08** | **Gemini AI Studio** | `src/components/GeminiStudio.tsx` | Client session memory + notes integration | `POST /api/gemini/analyze`<br>`POST /api/gemini/vibe-pilot` | `@google/genai`, Gemini Cascade (3.8 &rarr; flash &rarr; 2.5) |
| **09** | **Gemini Development Chat** | `src/components/GeminiDevelopmentChat.tsx` | `src/data/geminiChatData.ts`<br>`gemini_prompts.md`<br>`gemini_feedback.md` | `GET /gemini_development_chat`<br>`GET /api/chat/history` | `gemini_chat/chat_history.html`, `lucide-react` |
| **10** | **Legacy HTML Tools Hub** | `src/components/LegacyAppsHub.tsx` | `imported_repo/*.html` | `GET /legacy/*`<br>`GET /api/legacy-apps` | Sandboxed `<iframe>`, `lucide-react` |
| **11** | **Python Code Viewer** | `src/components/PythonCodeViewer.tsx`<br>`src/components/PythonSyntaxHighlighter.tsx` | `src/data/pythonFiles.ts`<br>`scripts/*.py` | `GET /api/python-files`<br>`GET /api/python-file/:id` | Custom keyword tokenizer, `lucide-react` |
| **12** | **GitHub Sync & Audit Guide** | `src/components/GitHubSyncGuide.tsx` | `export_to_github.sh`<br>`export_to_github.bat` | `POST /api/cli/execute` (optional local command runner) | `react-markdown`, `lucide-react` |
| **13** | **Interactive User Guide** | `src/components/UserGuideViewer.tsx` | `USER_GUIDE.md` | Static file serving via Express / Vite | `src/utils/guideHtmlFormatter.ts`, `react-markdown`, Audio Engine |
| **14** | **Ecosystem Roadmap Hub** | `src/components/RoadmapHub.tsx` | `src/data/roadmapData.ts`<br>`suggestions.md` | None (Declarative architectural guide) | `lucide-react` |

---

## 3. Deep-Dive: File Breakdown for Every Capability

### Capability 01: Playlists & Clips Management
- **Role:** The core content catalog containing 71 YouTube playlists and 471+ video clips.
- **Files Delivering It:**
  1. `src/components/PlaylistManager.tsx` (1032 lines):
     - Renders responsive card grids, channel filter tabs, category pills, search input, watch status transitions (`to-watch`, `in-progress`, `synthesized`, `mastered`), and clip-level notes.
  2. `src/data/channelPlaylists.json` (450KB+):
     - The persistent single-source-of-truth JSON file on disk holding the entire catalog of playlists, clip IDs, durations, and channels.
  3. `src/data/initialData.ts`:
     - Client-side TypeScript fallback holding pre-bundled sample playlists to guarantee the UI renders even on cold start or offline preview.
  4. `src/services/api.ts` (lines 35-85):
     - `fetchPlaylists()`, `savePlaylists()`, `syncYouTubePlaylists()` client fetch calls.
  5. `server.ts` (lines 347-381):
     - `GET /api/playlists`: Reads `src/data/channelPlaylists.json` with fallback to `initialData.ts`.
     - `POST /api/playlists`: Persists playlist updates sent from the client back to disk.
     - `POST /api/sync-youtube`: Triggers on-demand YouTube scraping to refresh playlist titles and clip counts.
  6. `src/types/index.ts` (lines 1-25):
     - TypeScript models: `YouTubeClip`, `Playlist`.

---

### Capability 02: Allocation & Restructure Hub
- **Role:** Reallocates 71 fragmented micro-playlists into 28 thematic master clusters, providing side-by-side reallocation audits and multi-page executive PDF exports.
- **Files Delivering It:**
  1. `src/components/PlaylistRestructureHub.tsx` (840 lines):
     - Matrix layout showing before/after redistribution stats.
     - Implements dynamic search, cluster card filters, reallocation progress bars.
     - Generates 10-page branded executive PDF reports using `jsPDF` and `autoTable`.
  2. `src/data/playlistRestructureData.ts` (450 lines):
     - `RESTRUCTURE_CLUSTERS`: Defines the 28 target clusters with descriptions and rationale.
     - `buildRestructuredPlaylists()`: Algorithmic transformation engine mapping flat clips into target clusters.
  3. `package.json`:
     - Dependencies: `jspdf` (^2.5.1), `jspdf-autotable` (^3.8.2).
  4. `src/types/index.ts` (lines 203-228):
     - TypeScript models: `VideoAllocationItem`, `RestructureCluster`.

---

### Capability 03: Video Cosmos Graph
- **Role:** 2D HTML5 Canvas interactive celestial galaxy visualizing 471 clips as stars in 5 sectoral quadrants with orbital constellation lines and flight recording.
- **Files Delivering It:**
  1. `src/components/VideoCosmosGraph.tsx` (950 lines):
     - Custom 60fps HTML5 Canvas rendering loop.
     - Smooth pan-and-zoom transformation matrix with touch pinch support.
     - Star twinkle, glow shaders, nearest-neighbor constellation lines, flight path recording (voyage steps), and search auto-centering.
  2. `src/data/videoCosmosData.ts` (600 lines):
     - Generates 2D Cartesian spatial coordinates `(x, y)` for all 471 clips based on thematic cluster centroids.
     - Defines sample trajectory voyages, key insights, and reference relationships.
  3. `src/types/index.ts` (lines 152-202):
     - TypeScript models: `CosmosVideoNode`, `CosmosTrajectoryStep`, `CosmosTrajectoryVoyage`.

---

### Capability 04: Word Cloud & Mind Map Hub
- **Role:** Frequency analysis of technical terminology across all playlists with a synchronized 3-tier hierarchical mind map.
- **Files Delivering It:**
  1. `src/components/PlaylistWordCloudMindMap.tsx` (780 lines):
     - Canvas-based keyword cloud layout with font scaling proportional to token frequency.
     - Radial tree / SVG hierarchical mind map displaying Playlist &rarr; Topic &rarr; Clip relationship nodes.
  2. `src/data/wordcloudMindmapData.ts` (420 lines):
     - High-density token datasets with term weights and curated mind map node hierarchies.
  3. `server.ts` (lines 384-454):
     - `GET /api/wordcloud/playlists`: Provides term frequency token data.
     - `GET /api/wordcloud/playlist/:id`: Returns playlist-specific mind map nodes.
  4. `src/types/index.ts` (lines 102-135):
     - TypeScript models: `WordCloudWord`, `PlaylistWordCloudData`, `MindMapNode`.

---

### Capability 05: Knowledge Hub & Study Studio
- **Role:** Focused single-clip study studio combining YouTube video playback, transcripts, personal user notes, questions, and ideas.
- **Files Delivering It:**
  1. `src/components/KnowledgeHub.tsx` (620 lines):
     - YouTube embedded iframe player with timestamp synchronization.
     - Markdown note editor, interactive takeaway checklists, question-asking forms.
  2. `src/data/initialData.ts`:
     - Initial clip summaries, video IDs, and pre-extracted takeaways.
  3. `server.ts` (lines 240-270):
     - `GET /api/summaries`: Serves markdown summaries from `imported_repo/summaries/`.
     - `GET /api/summary/:id`: Fetches single summary markdown.
  4. `src/App.tsx`:
     - Central state handlers (`handleSaveClipNotes`, `handleUpdateClipStatus`) bridging edits between the Knowledge Hub and the master playlist store.

---

### Capability 06: AI Coding Academy
- **Role:** Interactive curriculum reader for 19 comprehensive prompt engineering and CLI lessons (10 Claude + 9 Kiro lessons).
- **Files Delivering It:**
  1. `src/components/AILearningAcademy.tsx` (580 lines):
     - Lesson navigation sidebar with series selector (Claude vs. Kiro).
     - Markdown lesson renderer with reading time estimates, completion checkboxes, and chapter jump links.
  2. `imported_repo/lessons_claude/*.md` & `imported_repo/lessons_kiro/*.md`:
     - Raw markdown lesson source files.
  3. `server.ts` (lines 85-121):
     - `GET /api/lessons`: Reads directory contents and parses YAML/markdown frontmatter into `LessonItem[]`.
     - `GET /api/lesson/:id`: Returns raw markdown body for requested lesson.
  4. `src/types/index.ts` (lines 38-45):
     - TypeScript models: `LessonItem`.

---

### Capability 07: AirPods Audio Player
- **Role:** Hands-free speech synthesis with hardware stem remote control via the browser Media Session API.
- **Files Delivering It:**
  1. `src/components/AudioLessonPlayer.tsx` (320 lines):
     - Text chunking engine that splits long Markdown texts into natural speech paragraphs.
     - Browser `window.speechSynthesis` invocation with pitch, rate, and voice selectors.
     - `navigator.mediaSession` integration binding AirPods single-click (Play/Pause), double-click (Skip Forward 15s), and triple-click (Skip Back 15s).
  2. Embedded integration across views:
     - Embedded in `UserGuideViewer.tsx` (narration of the user guide).
     - Embedded in `AILearningAcademy.tsx` (narration of coding lessons).
     - Embedded in `KnowledgeHub.tsx` (narration of clip summaries).

---

### Capability 08: Gemini AI Studio
- **Role:** Multi-model generative AI assistant providing video insights, quiz generation, and prompt optimization with automatic 503 high-demand recovery.
- **Files Delivering It:**
  1. `src/components/GeminiStudio.tsx` (640 lines):
     - Interactive form for submitting video transcripts or custom prompts.
     - Visual display of extracted key insights, conceptual quiz cards, and optimized prompts.
  2. `server.ts` (lines 734-951):
     - `getGeminiClient()`: Lazy initialization using `@google/genai` and `process.env.GEMINI_API_KEY`.
     - `generateGeminiWithCascade()`: Resilient fallback pipeline (`gemini-3.8-flash` &rarr; `gemini-flash-latest` &rarr; `gemini-2.5-flash`).
     - `POST /api/gemini/analyze`: Formats structured JSON insight schemas.
     - `POST /api/gemini/vibe-pilot`: Heuristic prompt optimizer.
  3. `src/types/index.ts` (lines 46-66):
     - TypeScript models: `GeminiInsightResult`, `VibePromptResult`.

---

### Capability 09: Gemini Development Chat
- **Role:** Audit trail and conversational viewer documenting all 23+ user prompts, capability evaluations, and architectural feedback.
- **Files Delivering It:**
  1. `src/components/GeminiDevelopmentChat.tsx` (540 lines):
     - Chat bubble timeline with prompt categorization, session grouping, and keyword search.
  2. `src/data/geminiChatData.ts` (600 lines):
     - Formatted structured array of prompts, answers, and timestamps.
  3. `gemini_prompts.md` & `gemini_feedback.md`:
     - Verbatim disk logs tracking exact development milestones.
  4. `gemini_chat/chat_history.html` & `server.ts` (lines 186-210):
     - Standalone exportable HTML chat history.

---

### Capability 10: Legacy HTML Tools Hub
- **Role:** Isolated runtime harness embedding original standalone HTML single-page utilities without cross-bundle pollution.
- **Files Delivering It:**
  1. `src/components/LegacyAppsHub.tsx` (380 lines):
     - Tabbed iframe viewer hosting legacy standalone tools with fullscreen toggle.
  2. `imported_repo/*.html`:
     - `youtube_summaries.html`, `claude_learning.html`, `kiro_learning.html`, `wordcloud.html`.
  3. `server.ts` (lines 142-177):
     - Express static route serving `/legacy/*` with `X-Frame-Options: SAMEORIGIN`.
  4. `src/types/index.ts` (lines 67-76):
     - TypeScript models: `LegacyApp`.

---

### Capability 11: Python Code Viewer
- **Role:** IDE-style code viewer with custom syntax highlighting and I/O specifications for backend Python utility scripts.
- **Files Delivering It:**
  1. `src/components/PythonCodeViewer.tsx` (520 lines):
     - Two-column layout with file list, line counts, input/output schemas, and execution notes.
  2. `src/components/PythonSyntaxHighlighter.tsx` (210 lines):
     - Custom token-based Python syntax highlighter (keywords, strings, comments, decorators).
  3. `src/data/pythonFiles.ts` (480 lines):
     - Metadata registry documenting script purposes, dependencies, and sample CLI commands.
  4. `scripts/*.py` & `server.ts` (lines 275-309):
     - `GET /api/python-files` and `GET /api/python-file/:id`.
  5. `src/types/index.ts` (lines 77-100):
     - TypeScript models: `PythonFileInfo`.

---

### Capability 12: GitHub Sync & Audit Guide
- **Role:** Safe export documentation, CLI synchronization scripts, and branch isolation instructions.
- **Files Delivering It:**
  1. `src/components/GitHubSyncGuide.tsx` (660 lines):
     - Step-by-step interactive visual guide on safe git export patterns without overwriting remote master branches.
  2. `export_to_github.sh` & `export_to_github.bat`:
     - Shell scripts for automated export to `dragos-boros/learn-better`.
  3. `server.ts` (lines 650-690):
     - `POST /api/cli/execute`: Safe server-side CLI command proxy.

---

### Capability 13: Interactive User Guide
- **Role:** Comprehensive in-app manual with voice narration, search filtering, and the iPadOS 401 troubleshooting runbook.
- **Files Delivering It:**
  1. `src/components/UserGuideViewer.tsx` (330 lines):
     - Formatted markdown reader with topic navigation, print/PDF button, and audio voice player.
  2. `USER_GUIDE.md`:
     - Canonical user documentation containing Sections 1 through 6 (including iPadOS WebKit ITP runbook).
  3. `src/utils/guideHtmlFormatter.ts`:
     - Parses markdown into styled HTML with custom typography and anchored heading tags.

---

### Capability 14: Ecosystem Roadmap Hub
- **Role:** Strategic architectural roadmap outlining multi-device synchronization, blob storage, and multi-model agent collaboration.
- **Files Delivering It:**
  1. `src/components/RoadmapHub.tsx` (480 lines):
     - Milestone cards, technical complexity ratings, and dependency graphs.
  2. `src/data/roadmapData.ts`:
     - Structured roadmap milestones and technical tasks.
  3. `suggestions.md`:
     - Collaborative ideas and architectural enhancement proposals.

---

### Capability 15: Analysis Hub & Autonomous Agent Tools Gateway
- **Role:** Dual-audience introspection, 4-phase system architecture, OpenAPI function calling schemas for Gemini/Claude/ChatGPT, and live execution sandbox.
- **Files Delivering It:**
  1. `src/components/AnalysisHub.tsx` (1,600 lines):
     - 4-phase analytical dashboard, capability ledger, live tool invocation sandbox, and iPad vs. Cloud FLOPs audit.
  2. `analysis/01_HIGH_LEVEL_SYSTEM_ARCHITECTURE.md` & `.html`:
     - Phase 1 high-level system topology and layer abstractions.
  3. `analysis/02_CAPABILITY_FILE_MATRIX.md` & `.html`:
     - Phase 2 code-level delivery traceability for all 15 capabilities.
  4. `analysis/03_DUAL_AUDIENCE_AGENT_TOOLS_SPEC.md` & `.html`:
     - Phase 3 agent tool-calling protocol, JSON schemas, and function calling declarations.
  5. `analysis/04_IPAD_VS_CLOUD_PROCESSING_ANALYSIS.md` & `.html`:
     - Phase 4 empirical compute allocation benchmarks (95% Cloud dev vs. 68% iPad runtime).
  6. `server.ts` (Agent Routes):
     - Headless `/api/agent/capabilities`, `/api/agent/schema`, `/api/agent/tools`, and `/api/agent/execute-tool`.

---

## 4. Cross-Cutting Infrastructure Files

These foundational files support all 15 capabilities simultaneously:

1. **`server.ts` (Backend Gateway)**:
   - Sets up Express, static file serving (`/analysis`, `/legacy`, `/gemini_chat`, `/decks`, `/videos`), Vite middleware, and the Gemini AI client.
2. **`src/App.tsx` (Root State Orchestrator)**:
   - Coordinates navigation across tabs, manages global playlist state, handles clip selection bridges between tabs, and synchronizes to `localStorage`.
3. **`src/components/Navbar.tsx` (Primary Navigation)**:
   - Sticky header with category badges, tab buttons, YouTube sync button, restructured toggle, and health indicator.
4. **`src/components/ErrorBoundary.tsx` (Fault Resilience)**:
   - Protects the React application from runtime component crashes; provides one-click cache reset and page reload.
5. **`src/services/api.ts` (API Client Gateway)**:
   - Unified typed fetch abstractions for playlists, logs, lessons, Python files, and health checks.
6. **`src/types/index.ts` (Type Core)**:
   - Single source of truth for all shared TypeScript interfaces across client and server.

---

*Phase 2 Capability-to-File Delivery Matrix complete. Preserved in `/analysis/02_CAPABILITY_FILE_MATRIX.md`.*
