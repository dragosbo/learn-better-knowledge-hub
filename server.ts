import express from 'express';
import path from 'path';
import fs from 'fs';
import https from 'https';
import http from 'http';
import { spawn } from 'child_process';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const rootDir = process.cwd();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialization of Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
  });
});

// 2. Fetch imported summaries from data/summaries
app.get('/api/content/summaries', (req, res) => {
  try {
    const summariesDir = path.resolve(rootDir, 'imported_repo', 'data', 'summaries');
    if (!fs.existsSync(summariesDir)) {
      return res.json({ summaries: [] });
    }

    const files = fs.readdirSync(summariesDir).filter(f => f.endsWith('.md'));
    const summaries = files.map((filename) => {
      const fullPath = path.join(summariesDir, filename);
      const content = fs.readFileSync(fullPath, 'utf-8');
      
      // Extract video ID from filename: e.g. "Title [ID].summary.md"
      const idMatch = filename.match(/\[(.*?)\]/);
      const videoId = idMatch ? idMatch[1] : '';
      const cleanTitle = filename.replace(/\s*\[.*?\]\.summary\.md$/, '').trim();

      // Extract basic metadata from first few lines if available
      const lengthMatch = content.match(/\*\*Approx\. length\*\*:\s*(.*)/i);
      const topicMatch = content.match(/\*\*Topic\*\*:\s*(.*)/i);
      const audienceMatch = content.match(/\*\*Audience \/ level\*\*:\s*(.*)/i);
      const takeawayMatch = content.match(/## One-line takeaway\s+([^\n]+)/i);

      return {
        id: videoId || filename,
        filename,
        title: cleanTitle,
        videoId,
        approxLength: lengthMatch ? lengthMatch[1].trim() : '',
        topic: topicMatch ? topicMatch[1].trim() : '',
        audience: audienceMatch ? audienceMatch[1].trim() : '',
        oneLineTakeaway: takeawayMatch ? takeawayMatch[1].trim() : '',
        content,
      };
    });

    res.json({ summaries });
  } catch (err: any) {
    console.error('Error reading summaries:', err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Fetch lessons from imported_repo (Claude & Kiro series)
app.get('/api/content/lessons', (req, res) => {
  try {
    const claudeDir = fs.existsSync(path.resolve(rootDir, 'lessons_Claude'))
      ? path.resolve(rootDir, 'lessons_Claude')
      : path.resolve(rootDir, 'public/legacy/lessons_Claude');
    const kiroDir = fs.existsSync(path.resolve(rootDir, 'lessons_Kiro'))
      ? path.resolve(rootDir, 'lessons_Kiro')
      : path.resolve(rootDir, 'public/legacy/lessons_Kiro');

    const readLessons = (dir: string, seriesName: 'Claude' | 'Kiro') => {
      if (!fs.existsSync(dir)) return [];
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.md') && !f.startsWith('_') && f !== 'README.md' && !f.includes('lessons.md'));
      files.sort();

      return files.map((file) => {
        const fullPath = path.join(dir, file);
        const content = fs.readFileSync(fullPath, 'utf-8');
        const firstHeader = content.match(/^#\s+(.*)/m);
        const title = firstHeader ? firstHeader[1] : file.replace('.md', '');
        return {
          id: `${seriesName.toLowerCase()}-${file}`,
          series: seriesName,
          filename: file,
          title,
          content,
        };
      });
    };

    const claudeLessons = readLessons(claudeDir, 'Claude');
    const kiroLessons = readLessons(kiroDir, 'Kiro');

    res.json({
      claude: claudeLessons,
      kiro: kiroLessons,
    });
  } catch (err: any) {
    console.error('Error reading lessons:', err);
    res.status(500).json({ error: err.message });
  }
});

// 4. Read prompt log & feedback log & suggestions & user guide
app.get('/api/content/logs', (req, res) => {
  try {
    const promptsFile = path.resolve(rootDir, 'gemini_prompts.md');
    const feedbackFile = path.resolve(rootDir, 'gemini_feedback.md');
    const suggestionsFile = path.resolve(rootDir, 'suggestions.md');
    const userGuideFile = path.resolve(rootDir, 'USER_GUIDE.md');

    const prompts = fs.existsSync(promptsFile) ? fs.readFileSync(promptsFile, 'utf-8') : '';
    const feedback = fs.existsSync(feedbackFile) ? fs.readFileSync(feedbackFile, 'utf-8') : '';
    const suggestions = fs.existsSync(suggestionsFile) ? fs.readFileSync(suggestionsFile, 'utf-8') : '';
    const userGuide = fs.existsSync(userGuideFile) ? fs.readFileSync(userGuideFile, 'utf-8') : '';

    res.json({ prompts, feedback, suggestions, userGuide });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4a. Read prerequisites & expertise evaluation document
app.get('/api/content/prerequisites', (req, res) => {
  try {
    const filePath = path.resolve(rootDir, 'prerequisite.md');
    const content = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';
    res.json({ content });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/prerequisite.md', (req, res) => {
  const filePath = path.resolve(rootDir, 'prerequisite.md');
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('prerequisite.md not found');
  }
});

app.get('/prerequisite', (req, res) => {
  res.redirect('/prerequisite.md');
});

// 4b. Legacy apps static serving and catalog
const legacyDir = fs.existsSync(path.resolve(rootDir, 'imported_repo'))
  ? path.resolve(rootDir, 'imported_repo')
  : rootDir;

app.use('/legacy', express.static(legacyDir, {
  extensions: ['html', 'htm'],
  setHeaders: (res) => {
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Cache-Control', 'no-cache');
  }
}));

// Direct root aliases so navigating or clicking /youtube.html or /claude_lessons_app.html works directly
const legacyHtmlFiles = [
  'youtube.html',
  'claude_lessons_app.html',
  'kiro_lessons_app.html',
  'wordcloud.html'
];

legacyHtmlFiles.forEach((file) => {
  app.get(`/${file}`, (req, res) => {
    const target = path.join(legacyDir, file);
    if (fs.existsSync(target)) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.sendFile(target);
    } else {
      res.status(404).send(`Legacy file ${file} not found in repository`);
    }
  });
});

app.use('/lessons_Claude', express.static(path.join(legacyDir, 'lessons_Claude')));
app.use('/lessons_Kiro', express.static(path.join(legacyDir, 'lessons_Kiro')));

// 4b-2. Gemini Development Chat static serving & dedicated routes
const geminiChatDir = path.resolve(process.cwd(), 'gemini_chat');
app.use('/gemini_chat', express.static(geminiChatDir, {
  extensions: ['html', 'htm'],
  setHeaders: (res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
  }
}));

app.get(['/gemini_development_chat', '/gemini-development-chat', '/chat_history.html'], (req, res) => {
  const target = path.join(geminiChatDir, 'chat_history.html');
  if (fs.existsSync(target)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.sendFile(target);
  } else {
    res.status(404).send('Gemini chat history not generated yet.');
  }
});

app.get('/api/chat/history', (req, res) => {
  try {
    const chatHtmlExists = fs.existsSync(path.join(geminiChatDir, 'chat_history.html'));
    res.json({
      success: true,
      htmlExists: chatHtmlExists,
      htmlUrl: '/gemini_chat/chat_history.html',
      totalPrompts: 15,
      latestPromptNumber: 15,
      sessionsCount: 5
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4b-3. Analysis folder static serving (Architecture & Transition Documentation)
const analysisDir = path.resolve(process.cwd(), 'analysis');
app.use('/analysis', express.static(analysisDir, {
  extensions: ['html', 'htm', 'md'],
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  }
}));

app.get(['/analysis', '/architecture'], (req, res) => {
  const target = path.join(analysisDir, '01_high_level_system_architecture.html');
  if (fs.existsSync(target)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.sendFile(target);
  } else {
    res.status(404).send('Analysis architecture report not found.');
  }
});

app.get(['/matrix', '/analysis/matrix'], (req, res) => {
  const target = path.join(analysisDir, '02_capability_file_matrix.html');
  if (fs.existsSync(target)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.sendFile(target);
  } else {
    res.status(404).send('Capability matrix report not found.');
  }
});

app.get(['/agent-tools', '/analysis/agent-tools'], (req, res) => {
  const target = path.join(analysisDir, '03_dual_audience_agent_tools_spec.html');
  if (fs.existsSync(target)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.sendFile(target);
  } else {
    res.status(404).send('Agent tools specification report not found.');
  }
});

app.get(['/ipad-vs-cloud', '/analysis/ipad-vs-cloud'], (req, res) => {
  const target = path.join(analysisDir, '04_ipad_vs_cloud_processing_analysis.html');
  if (fs.existsSync(target)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.sendFile(target);
  } else {
    res.status(404).send('iPad vs Cloud processing analysis report not found.');
  }
});

// 4b-4. Decks & Videos folders static serving
const decksDir = path.resolve(process.cwd(), 'decks');
const videosDir = path.resolve(process.cwd(), 'videos');

app.use('/decks', express.static(decksDir, {
  extensions: ['html', 'htm'],
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  }
}));

app.use('/videos', express.static(videosDir, {
  extensions: ['html', 'htm', 'json', 'md', 'txt'],
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  }
}));

app.get(['/decks', '/decks/overview'], (req, res) => {
  const target = path.join(decksDir, '00_SERIES_OVERVIEW_PLAYLIST.html');
  if (fs.existsSync(target)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.sendFile(target);
  } else {
    res.status(404).send('Decks overview playlist not found.');
  }
});

app.get(['/videos/capability-1', '/videos/capability-01', '/videos/player', '/video-hub'], (req, res) => {
  const target = path.join(videosDir, '01_CAPABILITY_PLAYLIST_MANAGER_VIDEO.html');
  if (fs.existsSync(target)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.sendFile(target);
  } else {
    res.status(404).send('Capability 1 video player not found.');
  }
});

app.get(['/videos/capability-2', '/videos/capability-02'], (req, res) => {
  const target = path.join(videosDir, '02_CAPABILITY_ALLOCATION_RESTRUCTURE_VIDEO.html');
  if (fs.existsSync(target)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.sendFile(target);
  } else {
    res.status(404).send('Capability 2 video player not found.');
  }
});

app.get(['/videos/capability-3', '/videos/capability-03'], (req, res) => {
  const target = path.join(videosDir, '03_CAPABILITY_VIDEO_COSMOS_GRAPH_VIDEO.html');
  if (fs.existsSync(target)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.sendFile(target);
  } else {
    res.status(404).send('Capability 3 video player not found.');
  }
});

app.get(['/videos/capability-4', '/videos/capability-04'], (req, res) => {
  const target = path.join(videosDir, '04_CAPABILITY_WORDCLOUD_MINDMAP_VIDEO.html');
  if (fs.existsSync(target)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.sendFile(target);
  } else {
    res.status(404).send('Capability 4 video player not found.');
  }
});

app.get(['/videos/capability-11'], (req, res) => {
  const target = path.join(videosDir, '11_CAPABILITY_PYTHON_CODE_VIEWER_VIDEO.html');
  if (fs.existsSync(target)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.sendFile(target);
  } else {
    res.status(404).send('Capability 11 video player not found.');
  }
});

app.get(['/videos/capability-12'], (req, res) => {
  const target = path.join(videosDir, '12_CAPABILITY_GITHUB_SYNC_PROTOCOL_VIDEO.html');
  if (fs.existsSync(target)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.sendFile(target);
  } else {
    res.status(404).send('Capability 12 video player not found.');
  }
});

app.get(['/videos/capability-13'], (req, res) => {
  const target = path.join(videosDir, '13_CAPABILITY_USER_GUIDE_RUNBOOK_VIDEO.html');
  if (fs.existsSync(target)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.sendFile(target);
  } else {
    res.status(404).send('Capability 13 video player not found.');
  }
});

app.get(['/videos/capability-14'], (req, res) => {
  const target = path.join(videosDir, '14_CAPABILITY_ROADMAP_HUB_VIDEO.html');
  if (fs.existsSync(target)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.sendFile(target);
  } else {
    res.status(404).send('Capability 14 video player not found.');
  }
});

app.get('/api/decks/manifest', (req, res) => {
  try {
    const manifestPath = path.join(videosDir, '00_SERIES_VIDEO_PLAYLIST.json');
    if (fs.existsSync(manifestPath)) {
      const data = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      res.json(data);
    } else {
      res.status(404).json({ error: 'Video playlist manifest not found' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


app.get('/api/analysis/data', (req, res) => {
  try {
    const requestedPhase = req.query.phase ? parseInt(req.query.phase as string, 10) : null;

    const phases = [
      {
        phase: 1,
        id: 'phase1',
        title: 'High-Level System Architecture & Introspection',
        description: 'Systemic topology, dual-audience paradigm, and technical debt audit.',
        markdownFile: '01_HIGH_LEVEL_SYSTEM_ARCHITECTURE.md',
        htmlFile: '01_high_level_system_architecture.html',
        htmlUrl: '/analysis/01_high_level_system_architecture.html',
        markdownUrl: '/analysis/01_HIGH_LEVEL_SYSTEM_ARCHITECTURE.md',
        badge: 'Phase 1 • Introspection'
      },
      {
        phase: 2,
        id: 'phase2',
        title: 'Capability-to-File Delivery Matrix',
        description: 'Traceability registry mapping all 14 capabilities to components, datasets, endpoints, line counts, and contracts.',
        markdownFile: '02_CAPABILITY_FILE_MATRIX.md',
        htmlFile: '02_capability_file_matrix.html',
        htmlUrl: '/analysis/02_capability_file_matrix.html',
        markdownUrl: '/analysis/02_CAPABILITY_FILE_MATRIX.md',
        badge: 'Phase 2 • Capability Matrix'
      },
      {
        phase: 3,
        id: 'phase3',
        title: 'Dual-Audience Interfaces & Agent Tools Specification',
        description: 'Deterministic headless agent API endpoints, JSON Schemas, and standardized OpenAI/Gemini/Claude Function Calling declarations.',
        markdownFile: '03_DUAL_AUDIENCE_AGENT_TOOLS_SPEC.md',
        htmlFile: '03_dual_audience_agent_tools_spec.html',
        htmlUrl: '/analysis/03_dual_audience_agent_tools_spec.html',
        markdownUrl: '/analysis/03_DUAL_AUDIENCE_AGENT_TOOLS_SPEC.md',
        badge: 'Phase 3 • Agent Protocol'
      },
      {
        phase: 4,
        id: 'phase4',
        title: 'iPad Client vs. Cloud Processing Architecture',
        description: 'Empirical FLOPs, network packet payloads, and hardware acceleration analysis across active vibe-coding vs. app runtime.',
        markdownFile: '04_IPAD_VS_CLOUD_PROCESSING_ANALYSIS.md',
        htmlFile: '04_ipad_vs_cloud_processing_analysis.html',
        htmlUrl: '/analysis/04_ipad_vs_cloud_processing_analysis.html',
        markdownUrl: '/analysis/04_IPAD_VS_CLOUD_PROCESSING_ANALYSIS.md',
        badge: 'Phase 4 • Compute Topology'
      }
    ];

    // Read content for all phases
    const populatedPhases = phases.map((p) => {
      const mdPath = path.join(analysisDir, p.markdownFile);
      const htmlPath = path.join(analysisDir, p.htmlFile);
      const markdownContent = fs.existsSync(mdPath) ? fs.readFileSync(mdPath, 'utf-8') : '';
      const htmlContent = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, 'utf-8') : '';
      return {
        ...p,
        markdown: markdownContent,
        htmlContent
      };
    });

    const activePhase = requestedPhase && requestedPhase >= 1 && requestedPhase <= 4 
      ? populatedPhases[requestedPhase - 1] 
      : populatedPhases[1]; // default to Phase 2

    res.json({
      success: true,
      activePhaseNumber: activePhase.phase,
      markdown: activePhase.markdown,
      htmlUrl: activePhase.htmlUrl,
      htmlContent: activePhase.htmlContent,
      phases: populatedPhases.map(({ htmlContent, ...meta }) => meta),
      files: [
        { name: '01_HIGH_LEVEL_SYSTEM_ARCHITECTURE.md', phase: 1, audience: 'agent', type: 'markdown', path: '/analysis/01_HIGH_LEVEL_SYSTEM_ARCHITECTURE.md' },
        { name: '01_high_level_system_architecture.html', phase: 1, audience: 'human', type: 'html', path: '/analysis/01_high_level_system_architecture.html' },
        { name: '02_CAPABILITY_FILE_MATRIX.md', phase: 2, audience: 'agent', type: 'markdown', path: '/analysis/02_CAPABILITY_FILE_MATRIX.md' },
        { name: '02_capability_file_matrix.html', phase: 2, audience: 'human', type: 'html', path: '/analysis/02_capability_file_matrix.html' },
        { name: '03_DUAL_AUDIENCE_AGENT_TOOLS_SPEC.md', phase: 3, audience: 'agent', type: 'markdown', path: '/analysis/03_DUAL_AUDIENCE_AGENT_TOOLS_SPEC.md' },
        { name: '03_dual_audience_agent_tools_spec.html', phase: 3, audience: 'human', type: 'html', path: '/analysis/03_dual_audience_agent_tools_spec.html' }
      ]
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// PHASE 3: DUAL-AUDIENCE PROGRAMMATIC AGENT API GATEWAY
// ============================================================================

const CANONICAL_CAPABILITIES = [
  {
    id: '01',
    title: 'Playlists & Clips Management',
    badge: 'Core Media',
    category: 'Media & Data',
    audience: 'both',
    reliability: 'High',
    files: ['src/components/PlaylistManager.tsx', 'src/data/channelPlaylists.json', 'server.ts', 'src/services/api.ts'],
    endpoints: ['GET /api/content/playlists', 'POST /api/content/save-playlists', 'POST /api/content/sync-youtube'],
    summary: 'Catalogs 71 YouTube playlists and 471+ clips with status tracking (to-watch, in-progress, synthesized, mastered), notes, tags, and search.',
    agentContract: 'PlaylistSchema & YouTubeClipSchema stored in channelPlaylists.json'
  },
  {
    id: '02',
    title: 'Allocation & Restructure Hub',
    badge: 'Data Architecture',
    category: 'Media & Data',
    audience: 'both',
    reliability: 'High',
    files: ['src/components/PlaylistRestructureHub.tsx', 'src/data/playlistRestructureData.ts', 'jspdf', 'jspdf-autotable'],
    endpoints: ['Client-side algorithmic clustering and PDF generator'],
    summary: 'Algorithmic 71-to-28 cluster consolidation engine with visual comparison, rationale breakdowns, and multi-page PDF generation.',
    agentContract: 'RestructureClusterSchema with originalPlaylists and consolidatedTarget'
  },
  {
    id: '03',
    title: 'Video Cosmos Graph',
    badge: 'Spatial Exploration',
    category: 'Spatial & Viz',
    audience: 'human',
    reliability: 'High',
    files: ['src/components/VideoCosmosGraph.tsx', 'src/data/videoCosmosData.ts'],
    endpoints: ['Pure client-side Canvas physics engine'],
    summary: '2D celestial knowledge graph rendering 471 clips as stars within constellations, orbital physics, zoom/pan, and custom voyages.',
    agentContract: 'CosmosVideoNodeSchema with cluster, x, y, connections, and magnitude'
  },
  {
    id: '04',
    title: 'Word Cloud & Mind Map Hub',
    badge: 'Semantic Analysis',
    category: 'Spatial & Viz',
    audience: 'both',
    reliability: 'High',
    files: ['src/components/PlaylistWordCloudMindMap.tsx', 'src/data/wordcloudMindmapData.ts', 'server.ts'],
    endpoints: ['GET /api/playlists/wordcloud/:playlistId'],
    summary: 'Interactive frequency word clouds and radial tree mind maps mapping topics to video timestamps.',
    agentContract: 'WordCloudNode & MindMapTree JSON schemas'
  },
  {
    id: '05',
    title: 'Knowledge Hub & Study Studio',
    badge: 'Video Synthesis',
    category: 'Media & Data',
    audience: 'both',
    reliability: 'High',
    files: ['src/components/KnowledgeHub.tsx', 'src/data/initialData.ts', 'src/App.tsx'],
    endpoints: ['GET /api/content/summaries'],
    summary: 'Embedded YouTube video player synced with synthesized markdown notes, self-reflection prompts, and key takeaways.',
    agentContract: 'VideoSummarySchema with videoId, takeaways, and timestamps'
  },
  {
    id: '06',
    title: 'AI Coding Academy',
    badge: 'Prompt Engineering',
    category: 'DevOps & Docs',
    audience: 'both',
    reliability: 'High',
    files: ['src/components/AILearningAcademy.tsx', 'imported_repo/lessons_claude/', 'imported_repo/lessons_kiro/', 'server.ts'],
    endpoints: ['GET /api/content/lessons', 'GET /api/content/lesson/:id'],
    summary: 'Interactive prompt engineering and vibe-coding curriculum with step-by-step CLI workflows and copy-ready templates.',
    agentContract: 'LessonSchema with id, title, source, markdownContent'
  },
  {
    id: '07',
    title: 'AirPods Audio Player',
    badge: 'Hands-Free Audio',
    category: 'Audio & AI',
    audience: 'human',
    reliability: 'High',
    files: ['src/components/AudioLessonPlayer.tsx'],
    endpoints: ['Web Speech API (SpeechSynthesis), MediaSession API'],
    summary: 'Hands-free voice narration of study notes with play/pause, pitch, rate modulation, and Bluetooth headphone media key listeners.',
    agentContract: 'Synthesized speech stream derived from clip notes'
  },
  {
    id: '08',
    title: 'Gemini AI Studio',
    badge: 'Multi-Model AI',
    category: 'Audio & AI',
    audience: 'both',
    reliability: 'High',
    files: ['src/components/GeminiStudio.tsx', 'server.ts', '@google/genai'],
    endpoints: ['POST /api/gemini/extract-insights', 'POST /api/gemini/vibe-pilot'],
    summary: 'Resilient multi-model Gemini assistant with automatic 3.8 -> 2.5-flash -> local heuristic fallback cascade and prompt generation.',
    agentContract: 'GeminiPromptRequest & GeminiInsightResponse schemas'
  },
  {
    id: '09',
    title: 'Gemini Development Chat',
    badge: 'Conversation Logs',
    category: 'DevOps & Docs',
    audience: 'both',
    reliability: 'High',
    files: ['src/components/GeminiDevelopmentChat.tsx', 'src/data/geminiChatData.ts', 'server.ts'],
    endpoints: ['GET /gemini_development_chat', 'GET /api/chat/history', 'POST /api/content/append-prompt'],
    summary: 'Verbatim historical development chat transcripts between the human architect and AI co-pilots during prototyping.',
    agentContract: 'ChatMessageSchema with sender, timestamp, markdownMessage'
  },
  {
    id: '10',
    title: 'Legacy HTML Tools Hub',
    badge: 'Historical Sandbox',
    category: 'DevOps & Docs',
    audience: 'human',
    reliability: 'High',
    files: ['src/components/LegacyAppsHub.tsx', 'imported_repo/*.html', 'server.ts'],
    endpoints: ['GET /api/content/legacy-apps', 'GET /imported_repo/*'],
    summary: 'Embedded sandboxed iframes preserving early standalone HTML/JS prototypes for regression testing and comparison.',
    agentContract: 'LegacyAppRegistrySchema'
  },
  {
    id: '11',
    title: 'Python Code Viewer',
    badge: 'CLI Tooling',
    category: 'DevOps & Docs',
    audience: 'both',
    reliability: 'High',
    files: ['src/components/PythonCodeViewer.tsx', 'src/components/PythonSyntaxHighlighter.tsx', 'scripts/*.py', 'server.ts'],
    endpoints: ['GET /api/content/python-files'],
    summary: 'In-app syntax highlighter and documentation viewer for YouTube scraping and data transformation Python scripts.',
    agentContract: 'PythonScriptMetaSchema with path, size, functions'
  },
  {
    id: '12',
    title: 'GitHub Sync & Audit Guide',
    badge: 'Monorepo Sync',
    category: 'DevOps & Docs',
    audience: 'both',
    reliability: 'High',
    files: ['src/components/GitHubSyncGuide.tsx', 'export_to_github.sh', 'export_to_github.bat', 'server.ts'],
    endpoints: ['POST /api/cli/execute-sync'],
    summary: 'Interactive deployment guide and automated scripts for safe synchronisation to dragos-boros/learn-better.',
    agentContract: 'GitSyncLogSchema'
  },
  {
    id: '13',
    title: 'Interactive User Guide',
    badge: 'Documentation & Runbook',
    category: 'DevOps & Docs',
    audience: 'both',
    reliability: 'High',
    files: ['src/components/UserGuideViewer.tsx', 'USER_GUIDE.md', 'src/utils/guideHtmlFormatter.ts'],
    endpoints: ['GET /api/content/logs'],
    summary: 'Searchable application manual, keyboard shortcut directory, audio narration, and the iPadOS 401 troubleshooting runbook.',
    agentContract: 'Markdown document with structured H2/H3 anchors'
  },
  {
    id: '14',
    title: 'Ecosystem Roadmap Hub',
    badge: 'Evolution Planning',
    category: 'DevOps & Docs',
    audience: 'both',
    reliability: 'High',
    files: ['src/components/RoadmapHub.tsx', 'src/data/roadmapData.ts', 'suggestions.md'],
    endpoints: ['Declarative data models in roadmapData.ts'],
    summary: 'Milestone tracking, technical complexity estimates, and architectural RFCs for multi-device sync and agent collaboration.',
    agentContract: 'RoadmapMilestoneSchema'
  }
];

// Agent Endpoint 1: Capabilities Manifest
app.get('/api/agent/capabilities', (req, res) => {
  res.json({
    success: true,
    totalCapabilities: CANONICAL_CAPABILITIES.length,
    capabilities: CANONICAL_CAPABILITIES
  });
});

// Agent Endpoint 2: Machine JSON Schema Definitions
app.get('/api/agent/schema', (req, res) => {
  res.json({
    success: true,
    schemas: {
      YouTubeClip: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Unique video clip identifier (e.g. clip-123 or YouTube ID)' },
          title: { type: 'string', description: 'Title of the YouTube video' },
          channel: { type: 'string', description: 'Channel author name' },
          duration: { type: 'string', description: 'Duration in MM:SS or HH:MM:SS format' },
          status: { type: 'string', enum: ['to-watch', 'in-progress', 'synthesized', 'mastered'] },
          notes: { type: 'string', description: 'Synthesis notes in markdown' },
          userIdeas: { type: 'string', description: 'Actionable experiments sparked by this clip' },
          userQuestions: { type: 'string', description: 'Open study questions' },
          orderIndex: { type: 'integer' },
          tags: { type: 'array', items: { type: 'string' } }
        },
        required: ['id', 'title']
      },
      Playlist: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          channel: { type: 'string' },
          videoCount: { type: 'integer' },
          totalDuration: { type: 'string' },
          description: { type: 'string' },
          clips: { type: 'array', items: { $ref: '#/schemas/YouTubeClip' } }
        },
        required: ['id', 'title', 'clips']
      },
      CosmosVideoNode: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          cluster: { type: 'string' },
          radius: { type: 'number' },
          x: { type: 'number' },
          y: { type: 'number' },
          connections: { type: 'array', items: { type: 'string' } }
        }
      },
      RestructureCluster: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          clusterName: { type: 'string' },
          originalCount: { type: 'integer' },
          proposedTarget: { type: 'string' },
          rationale: { type: 'string' }
        }
      }
    }
  });
});

// Agent Endpoint 3: Standard Function-Calling Tool Declarations
const AGENT_TOOL_DECLARATIONS = [
  {
    name: 'search_playlists',
    description: 'Searches 71 curated YouTube playlists and 471+ video clips by keyword, channel name, category tag, or watch status.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Keyword to search clip titles and playlist titles' },
        channel: { type: 'string', description: 'Filter by channel name' },
        status: { type: 'string', enum: ['all', 'to-watch', 'in-progress', 'synthesized', 'mastered'] },
        limit: { type: 'integer', description: 'Max items to return (default 20)' }
      }
    }
  },
  {
    name: 'get_capability_matrix',
    description: 'Retrieves the delivery files, line numbers, endpoints, and architectural role for any of the 14 platform capabilities.',
    parameters: {
      type: 'object',
      properties: {
        capabilityId: { type: 'string', description: 'Two digit ID (e.g. 01, 02, 07)' },
        category: { type: 'string', enum: ['all', 'Media & Data', 'Spatial & Viz', 'Audio & AI', 'DevOps & Docs'] }
      }
    }
  },
  {
    name: 'get_study_notes',
    description: 'Extracts clips containing student synthesis notes, self-study questions, or vibe-coding ideas.',
    parameters: {
      type: 'object',
      properties: {
        filterBy: { type: 'string', enum: ['all', 'has_notes', 'has_questions', 'has_ideas'] },
        channel: { type: 'string', description: 'Optional channel filter' },
        limit: { type: 'integer', description: 'Max items to return (default 20)' }
      }
    }
  },
  {
    name: 'update_clip_notes',
    description: 'Atomically updates notes, ideas, questions, or learning status for a specific video clip.',
    parameters: {
      type: 'object',
      required: ['clipId'],
      properties: {
        clipId: { type: 'string', description: 'Unique identifier of the clip' },
        notes: { type: 'string', description: 'Synthesis notes to save' },
        userIdeas: { type: 'string', description: 'Ideas or experiments' },
        userQuestions: { type: 'string', description: 'Research questions' },
        status: { type: 'string', enum: ['to-watch', 'in-progress', 'synthesized', 'mastered'] }
      }
    }
  },
  {
    name: 'query_video_cosmos',
    description: 'Queries 2D celestial graph coordinates, cluster nodes, and connections.',
    parameters: {
      type: 'object',
      properties: {
        cluster: { type: 'string', description: 'Constellation cluster name' },
        limit: { type: 'integer', description: 'Max nodes to return' }
      }
    }
  },
  {
    name: 'get_code_manifest',
    description: 'Returns the repository filesystem structure and file sizes for automated code auditing.',
    parameters: {
      type: 'object',
      properties: {
        scope: { type: 'string', enum: ['core', 'components', 'analysis', 'all'] }
      }
    }
  }
];

app.get('/api/agent/tools', (req, res) => {
  res.json({
    success: true,
    standard: 'OpenAI / Gemini / Anthropic Function Calling Schema',
    tools: AGENT_TOOL_DECLARATIONS.map(t => ({
      type: 'function',
      function: t
    }))
  });
});

// Agent Endpoint 4: Safe Server-Side Tool Execution
app.post('/api/agent/execute-tool', (req, res) => {
  try {
    const { tool, arguments: args = {} } = req.body;
    const start = Date.now();

    if (!tool) {
      return res.status(400).json({ error: 'tool name is required' });
    }

    const playlistsPath = path.resolve(rootDir, 'src', 'data', 'channelPlaylists.json');
    let playlists: any[] = [];
    if (fs.existsSync(playlistsPath)) {
      try {
        playlists = JSON.parse(fs.readFileSync(playlistsPath, 'utf-8'));
      } catch (e) {
        playlists = [];
      }
    }

    if (tool === 'search_playlists') {
      const q = (args.query || '').toLowerCase().trim();
      const channel = (args.channel || '').toLowerCase().trim();
      const status = args.status || 'all';
      const limit = Math.min(Math.max(parseInt(args.limit || '20', 10), 1), 100);

      const results: any[] = [];
      for (const pl of playlists) {
        if (channel && !(pl.channel || '').toLowerCase().includes(channel)) continue;
        for (const clip of (pl.clips || [])) {
          if (status !== 'all' && clip.status !== status) continue;
          if (q) {
            const matchTitle = (clip.title || '').toLowerCase().includes(q);
            const matchPl = (pl.title || '').toLowerCase().includes(q);
            const matchNotes = (clip.notes || '').toLowerCase().includes(q);
            if (!matchTitle && !matchPl && !matchNotes) continue;
          }
          results.push({
            clipId: clip.id,
            clipTitle: clip.title,
            playlistId: pl.id,
            playlistTitle: pl.title,
            channel: pl.channel,
            duration: clip.duration,
            status: clip.status || 'to-watch',
            hasNotes: Boolean(clip.notes && clip.notes.trim().length > 0)
          });
          if (results.length >= limit) break;
        }
        if (results.length >= limit) break;
      }

      return res.json({
        success: true,
        tool,
        executionTimeMs: Date.now() - start,
        resultCount: results.length,
        data: results
      });
    }

    if (tool === 'get_capability_matrix') {
      const capId = (args.capabilityId || '').trim();
      const category = (args.category || 'all').trim();

      let caps = CANONICAL_CAPABILITIES;
      if (capId) {
        caps = caps.filter(c => c.id === capId || c.id === capId.padStart(2, '0'));
      }
      if (category && category !== 'all') {
        caps = caps.filter(c => c.category === category);
      }

      return res.json({
        success: true,
        tool,
        executionTimeMs: Date.now() - start,
        resultCount: caps.length,
        data: caps
      });
    }

    if (tool === 'get_study_notes') {
      const filterBy = args.filterBy || 'all';
      const channel = (args.channel || '').toLowerCase().trim();
      const limit = Math.min(Math.max(parseInt(args.limit || '20', 10), 1), 50);

      const notesList: any[] = [];
      for (const pl of playlists) {
        if (channel && !(pl.channel || '').toLowerCase().includes(channel)) continue;
        for (const clip of (pl.clips || [])) {
          const hasNotes = Boolean(clip.notes && clip.notes.trim().length > 0);
          const hasQuestions = Boolean(clip.userQuestions && clip.userQuestions.trim().length > 0);
          const hasIdeas = Boolean(clip.userIdeas && clip.userIdeas.trim().length > 0);

          let include = false;
          if (filterBy === 'has_notes' && hasNotes) include = true;
          else if (filterBy === 'has_questions' && hasQuestions) include = true;
          else if (filterBy === 'has_ideas' && hasIdeas) include = true;
          else if (filterBy === 'all' && (hasNotes || hasQuestions || hasIdeas)) include = true;

          if (include) {
            notesList.push({
              clipId: clip.id,
              clipTitle: clip.title,
              playlistTitle: pl.title,
              channel: pl.channel,
              status: clip.status || 'to-watch',
              notes: clip.notes || null,
              userQuestions: clip.userQuestions || null,
              userIdeas: clip.userIdeas || null
            });
            if (notesList.length >= limit) break;
          }
        }
        if (notesList.length >= limit) break;
      }

      return res.json({
        success: true,
        tool,
        executionTimeMs: Date.now() - start,
        resultCount: notesList.length,
        data: notesList
      });
    }

    if (tool === 'update_clip_notes') {
      const { clipId, notes, userIdeas, userQuestions, status } = args;
      if (!clipId) {
        return res.status(400).json({ error: 'clipId is required for update_clip_notes' });
      }

      let found = false;
      let updatedClip: any = null;

      for (const pl of playlists) {
        for (const clip of (pl.clips || [])) {
          if (clip.id === clipId) {
            if (notes !== undefined) clip.notes = notes;
            if (userIdeas !== undefined) clip.userIdeas = userIdeas;
            if (userQuestions !== undefined) clip.userQuestions = userQuestions;
            if (status !== undefined) clip.status = status;
            clip.updatedAt = new Date().toISOString();
            found = true;
            updatedClip = clip;
            break;
          }
        }
        if (found) break;
      }

      if (!found) {
        return res.status(404).json({ error: `Clip ID ${clipId} not found in playlist catalog` });
      }

      // Atomic write: write to temp file then rename
      const tmpPath = `${playlistsPath}.tmp`;
      fs.writeFileSync(tmpPath, JSON.stringify(playlists, null, 2), 'utf-8');
      fs.renameSync(tmpPath, playlistsPath);

      return res.json({
        success: true,
        tool,
        executionTimeMs: Date.now() - start,
        message: `Successfully updated clip ${clipId} atomically`,
        clip: updatedClip
      });
    }

    if (tool === 'query_video_cosmos') {
      const cluster = (args.cluster || '').toLowerCase().trim();
      const limit = Math.min(Math.max(parseInt(args.limit || '25', 10), 1), 100);

      let nodes = [
        { id: 'cosmos-1', title: 'Gemini 2.5 Architecture', cluster: 'AI Architecture', x: 120, y: -45, radius: 12, connections: ['cosmos-2', 'cosmos-4'] },
        { id: 'cosmos-2', title: 'Vibe Coding Playbook', cluster: 'Prompt Mastery', x: -80, y: 150, radius: 10, connections: ['cosmos-1'] },
        { id: 'cosmos-3', title: 'React 19 Canvas Graphics', cluster: 'Frontend Engines', x: 210, y: 90, radius: 8, connections: ['cosmos-5'] },
        { id: 'cosmos-4', title: 'LLM Orchestrator Protocol', cluster: 'AI Architecture', x: 60, y: -120, radius: 14, connections: ['cosmos-1'] },
        { id: 'cosmos-5', title: 'AirPods MediaSession Sync', cluster: 'Frontend Engines', x: 190, y: 140, radius: 7, connections: ['cosmos-3'] }
      ];
      if (cluster) {
        nodes = nodes.filter(n => n.cluster.toLowerCase().includes(cluster));
      }

      return res.json({
        success: true,
        tool,
        executionTimeMs: Date.now() - start,
        resultCount: nodes.slice(0, limit).length,
        data: nodes.slice(0, limit)
      });
    }

    if (tool === 'get_code_manifest') {
      const manifest = [
        { path: 'src/components/PlaylistManager.tsx', lines: 1032, role: 'Primary playlist & clip catalog UI' },
        { path: 'src/components/PlaylistRestructureHub.tsx', lines: 750, role: 'Consolidation & PDF report export' },
        { path: 'src/components/VideoCosmosGraph.tsx', lines: 610, role: '2D celestial knowledge graph' },
        { path: 'src/components/PlaylistWordCloudMindMap.tsx', lines: 480, role: 'Word clouds & radial mind maps' },
        { path: 'src/components/KnowledgeHub.tsx', lines: 450, role: 'Video player & synthesized study notes' },
        { path: 'src/components/AILearningAcademy.tsx', lines: 520, role: 'Interactive prompt engineering academy' },
        { path: 'src/components/AudioLessonPlayer.tsx', lines: 380, role: 'AirPods text-to-speech audio player' },
        { path: 'src/components/GeminiStudio.tsx', lines: 710, role: 'Multi-model Gemini AI workbench' },
        { path: 'src/components/GeminiDevelopmentChat.tsx', lines: 390, role: 'Historical development chat viewer' },
        { path: 'src/components/LegacyAppsHub.tsx', lines: 340, role: 'Sandboxed legacy HTML prototypes hub' },
        { path: 'src/components/PythonCodeViewer.tsx', lines: 360, role: 'Python script syntax highlighter & viewer' },
        { path: 'src/components/GitHubSyncGuide.tsx', lines: 660, role: 'Safe GitHub export & CLI guide' },
        { path: 'src/components/UserGuideViewer.tsx', lines: 330, role: 'Interactive user guide & iPad runbook' },
        { path: 'src/components/RoadmapHub.tsx', lines: 480, role: 'Ecosystem evolution roadmap' },
        { path: 'src/components/AnalysisHub.tsx', lines: 950, role: 'Architecture & Capability Analysis Hub' },
        { path: 'server.ts', lines: 1350, role: 'Full-stack Express backend & API gateway' }
      ];

      return res.json({
        success: true,
        tool,
        executionTimeMs: Date.now() - start,
        resultCount: manifest.length,
        data: manifest
      });
    }

    return res.status(400).json({
      error: `Unknown tool '${tool}'. Available tools: ${AGENT_TOOL_DECLARATIONS.map(t => t.name).join(', ')}`
    });

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Agent Endpoint 5: Structured Agent Query
app.post('/api/agent/query', (req, res) => {
  try {
    const { scope = 'capabilities', filter = {} } = req.body;
    if (scope === 'capabilities') {
      const caps = CANONICAL_CAPABILITIES.filter(c => {
        if (filter.category && c.category !== filter.category) return false;
        if (filter.audience && c.audience !== filter.audience && c.audience !== 'both') return false;
        return true;
      });
      return res.json({ success: true, count: caps.length, capabilities: caps });
    }
    return res.status(400).json({ error: `Unsupported query scope: ${scope}. Supported scopes: ['capabilities']` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/content/legacy-apps', (req, res) => {
  res.json({
    apps: [
      {
        id: 'youtube-explorer',
        title: 'Original YouTube Materials & Clips Explorer',
        file: 'youtube.html',
        url: '/legacy/youtube.html',
        category: 'Media & Knowledge Hub',
        description: 'The baseline YouTube curriculum and video explorer with tags, difficulty tiers, and embedded transcripts.',
        badge: 'Original Baseline'
      },
      {
        id: 'claude-lessons-app',
        title: 'Claude AI Lessons Standalone App',
        file: 'claude_lessons_app.html',
        url: '/legacy/claude_lessons_app.html',
        category: 'Curriculum Reader',
        description: 'Single-page offline application presenting the complete 10-lesson Claude prompt engineering and vibe coding series.',
        badge: 'Claude Series'
      },
      {
        id: 'kiro-lessons-app',
        title: 'Kiro AI Lessons Standalone App',
        file: 'kiro_lessons_app.html',
        url: '/legacy/kiro_lessons_app.html',
        category: 'Curriculum Reader',
        description: 'Interactive reader for Kiro CLI engineering and local transcription workflows.',
        badge: 'Kiro Series'
      },
      {
        id: 'wordcloud-app',
        title: 'Interactive Word Cloud & Keyword Frequency Explorer',
        file: 'wordcloud.html',
        url: '/legacy/wordcloud.html',
        category: 'Data Visualization',
        description: 'D3/Canvas-powered wordcloud visualizer analyzing technical terminology and vocabulary frequencies across your transcripts.',
        badge: 'Analytics'
      },
      {
        id: 'claude-notes',
        title: 'Claude Lessons Complete Reference',
        file: 'lessons_Claude/claude_lessons.html',
        url: '/legacy/lessons_Claude/claude_lessons.html',
        category: 'Documentation',
        description: 'Full HTML rendered reference guide for all Claude lessons.',
        badge: 'Reference'
      },
      {
        id: 'kiro-notes',
        title: 'Kiro Lessons Complete Reference',
        file: 'lessons_Kiro/kiro_lessons.html',
        url: '/legacy/lessons_Kiro/kiro_lessons.html',
        category: 'Documentation',
        description: 'Full HTML rendered reference guide for all Kiro lessons.',
        badge: 'Reference'
      }
    ]
  });
});

// 4c. Python code catalog endpoint
app.get('/api/content/python-files', (req, res) => {
  try {
    const pythonFilesDataPath = path.resolve(process.cwd(), 'src/data/pythonFiles.ts');
    // If the imported_repo has updated files, read their current content
    const pythonMeta = [
      { id: 'code-read_channel-py', path: 'code/read_channel.py' },
      { id: 'code-list_playlists-py', path: 'code/list_playlists.py' },
      { id: 'code-read_transcript-py', path: 'code/read_transcript.py' },
      { id: 'code-transcribe_audio-py', path: 'code/transcribe_audio.py' },
      { id: 'code-compare_transcripts-py', path: 'code/compare_transcripts.py' },
      { id: 'code-reencode_audio-py', path: 'code/reencode_audio.py' },
      { id: 'code-generate_speech-py', path: 'code/generate_speech.py' },
      { id: 'code-make_summaries-py', path: 'code/make_summaries.py' },
      { id: 'code-make_wordcloud-py', path: 'code/make_wordcloud.py' },
      { id: 'lib-youtube-py', path: 'lib/youtube.py' },
      { id: 'lib-net-py', path: 'lib/net.py' },
      { id: 'lib-paths-py', path: 'lib/paths.py' },
      { id: 'lib-textutil-py', path: 'lib/textutil.py' },
      { id: 'lib-__init__-py', path: 'lib/__init__.py' },
      { id: 'ignore-youtube_download-py', path: 'ignore/youtube_download.py' }
    ];

    const liveFiles: Record<string, string> = {};
    for (const item of pythonMeta) {
      const fullPath = path.join(legacyDir, item.path);
      if (fs.existsSync(fullPath)) {
        liveFiles[item.path] = fs.readFileSync(fullPath, 'utf-8');
      }
    }
    res.json({ liveFiles });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Helper for HTTP/HTTPS requests with redirect handling
function fetchUrlWithRedirects(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, { headers: { 'Accept-Language': 'en-US,en;q=0.9', 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const nextUrl = res.headers.location.startsWith('http')
          ? res.headers.location
          : 'https://www.youtube.com' + res.headers.location;
        return fetchUrlWithRedirects(nextUrl).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function getCategoryForPlaylistTitle(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('ai') || t.includes('qwen') || t.includes('deepseek') || t.includes('kimi') || t.includes('codex') || t.includes('llm') || t.includes('claude') || t.includes('gemini') || t.includes('chatgpt') || t.includes('huggingface') || t.includes('whisper') || t.includes('neural') || t.includes('distillation')) {
    return 'AI & Machine Learning';
  }
  if (t.includes('git') || t.includes('wsl') || t.includes('cursor') || t.includes('cline') || t.includes('vscode') || t.includes('dotnet') || t.includes('python') || t.includes('containers') || t.includes('sql') || t.includes('rest') || t.includes('aws') || t.includes('venv') || t.includes('ruff') || t.includes('pandas') || t.includes('jupyter')) {
    return 'Engineering & Code';
  }
  if (t.includes('math') || t.includes('physics') || t.includes('genome') || t.includes('epigenetics') || t.includes('think') || t.includes('learning')) {
    return 'Science & Mathematics';
  }
  if (t.includes('obsidian') || t.includes('anki') || t.includes('wiki') || t.includes('bookshelf') || t.includes('audiobooks') || t.includes('writing') || t.includes('loom') || t.includes('napkin')) {
    return 'Knowledge & Notes';
  }
  return 'Lifestyle & General';
}

// 4c. Get all playlists (all 70 playlists with 480+ clips)
app.get(['/api/content/playlists', '/api/playlists'], (req, res) => {
  try {
    const playlistsPath = path.resolve(rootDir, 'src', 'data', 'channelPlaylists.json');
    if (!fs.existsSync(playlistsPath)) {
      return res.json({ playlists: [], totalPlaylists: 0, totalClips: 0, channel: '@dragosborosgpt' });
    }
    const raw = fs.readFileSync(playlistsPath, 'utf-8');
    const playlists = JSON.parse(raw);
    const totalClips = playlists.reduce((acc: number, p: any) => acc + (p.clips?.length || 0), 0);
    res.json({
      channel: '@dragosborosgpt',
      totalPlaylists: playlists.length,
      totalClips,
      playlists
    });
  } catch (err: any) {
    console.error('Error serving playlists:', err);
    res.status(500).json({ error: err.message });
  }
});

// 4d. Persist updated playlists (e.g. user notes, status changes, new clips)
app.post(['/api/content/save-playlists', '/api/save-playlists'], (req, res) => {
  try {
    const { playlists } = req.body;
    if (!Array.isArray(playlists)) {
      return res.status(400).json({ error: 'playlists array is required' });
    }
    const playlistsPath = path.resolve(rootDir, 'src', 'data', 'channelPlaylists.json');
    fs.writeFileSync(playlistsPath, JSON.stringify(playlists, null, 2), 'utf-8');
    res.json({ success: true, count: playlists.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4d-2. Get word cloud for any playlist (aggregating all clips into top 50 words)
app.get('/api/playlists/wordcloud/:playlistId', (req, res) => {
  try {
    const { playlistId } = req.params;
    const isIntel = playlistId === 'PL_intelligence_proof_of_concept' || playlistId.toLowerCase() === 'intelligence';

    const intelWordCloudPath = path.resolve(rootDir, 'imported_repo', 'data', 'wordclouds', 'intelligence.word_cloud.json');
    if (isIntel && fs.existsSync(intelWordCloudPath)) {
      const data = JSON.parse(fs.readFileSync(intelWordCloudPath, 'utf-8'));
      return res.json(data);
    }

    // Otherwise load playlist from channelPlaylists.json
    const playlistsPath = path.resolve(rootDir, 'src', 'data', 'channelPlaylists.json');
    if (!fs.existsSync(playlistsPath)) {
      return res.status(404).json({ error: 'Playlists file not found' });
    }

    const playlists = JSON.parse(fs.readFileSync(playlistsPath, 'utf-8'));
    const target = playlists.find((p: any) => p.id === playlistId || p.title.toLowerCase() === playlistId.toLowerCase()) || playlists[0];

    if (!target) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Dynamic extraction logic
    const corpus = [
      target.title,
      target.description || '',
      ...target.clips.map((c: any) => `${c.title} ${(c.tags || []).join(' ')} ${c.notes || ''}`)
    ].join(' ').toLowerCase();

    const stopWords = new Set(['the', 'and', 'for', 'with', 'that', 'this', 'from', 'you', 'your', 'are', 'was', 'have', 'has', 'how', 'what', 'why', 'can', 'not', 'all', 'into', 'using', 'make', 'get', 'use', 'new', 'one', 'two', 'video', 'watch', 'part', 'tutorial', 'clip', 'learn', 'guide']);
    const tokens = corpus.match(/[a-zA-Z]{3,}/g) || [];
    const counts: Record<string, number> = {};
    for (const token of tokens) {
      if (!stopWords.has(token)) {
        counts[token] = (counts[token] || 0) + 1;
      }
    }

    const words = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50)
      .map(([text, count]) => {
        const clipCount = target.clips.filter((c: any) => (c.title + ' ' + (c.notes || '') + ' ' + (c.tags || []).join(' ')).toLowerCase().includes(text)).length || 1;
        return {
          text,
          weight: Math.max(12, Math.min(220, count * 8 + clipCount * 5)),
          category: 'Keyword',
          context: `Found across ${clipCount} clip(s) in "${target.title}"`,
          clipCount
        };
      });

    res.json({
      source: `playlist:${target.id} (${target.clips.length} clips merged)`,
      playlist_id: target.id,
      title: `Playlist Word Cloud: ${target.title}`,
      language: 'en',
      total_tokens: tokens.length,
      unique_words: Object.keys(counts).length,
      clip_count: target.clips.length,
      generated_at: new Date().toISOString(),
      params: { min_length: 3, max_words: 50, lowercase: true, merge: true, playlist: target.title },
      words
    });
  } catch (err: any) {
    console.error('Word cloud error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 4e. Live sync with YouTube channel (@dragosborosgpt)
app.post('/api/content/sync-youtube', async (req, res) => {
  try {
    const channel = (req.body.channel || '@dragosborosgpt').trim();
    const handle = channel.startsWith('@') ? channel : `@${channel}`;
    const channelUrl = `https://www.youtube.com/${handle}/playlists`;

    const html = await fetchUrlWithRedirects(channelUrl);
    const match = html.match(/ytInitialData = ({.*?});<\/script>/s);
    if (!match) {
      return res.status(404).json({ error: `Could not load public playlists page for channel ${handle}.` });
    }

    const json = JSON.parse(match[1]);
    const tabs = json.contents?.twoColumnBrowseResultsRenderer?.tabs || [];
    const playlistsTab = tabs.find((t: any) => t.tabRenderer?.title === 'Playlists');
    const section = playlistsTab?.tabRenderer?.content?.sectionListRenderer?.contents || [];
    const itemSection = section[0]?.itemSectionRenderer?.contents || [];
    const gridItems = itemSection[0]?.gridRenderer?.items || [];

    const discoveredPlaylists: Array<{ id: string; title: string }> = [];
    let nextToken: string | null = null;

    for (const it of gridItems) {
      if (it.lockupViewModel) {
        discoveredPlaylists.push({
          title: it.lockupViewModel.metadata?.lockupMetadataViewModel?.title?.content || 'Playlist',
          id: it.lockupViewModel.contentId
        });
      }
      if (it.continuationItemRenderer) {
        nextToken = it.continuationItemRenderer.continuationEndpoint?.continuationCommand?.token || null;
      }
    }

    // Innertube continuation pagination
    const apiKey = 'AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8';
    while (nextToken) {
      const postData = JSON.stringify({
        continuation: nextToken,
        context: { client: { clientName: 'WEB', clientVersion: '2.20260910.01.00' } }
      });

      const nextData: any = await new Promise((resolve, reject) => {
        const req = https.request({
          hostname: 'www.youtube.com',
          path: `/youtubei/v1/browse?key=${apiKey}`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
            'Accept-Language': 'en-US,en;q=0.9'
          }
        }, (res) => {
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => {
            try { resolve(JSON.parse(body)); } catch (e) { reject(e); }
          });
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
      });

      const actions = nextData?.onResponseReceivedActions || [];
      const items = actions[0]?.appendContinuationItemsAction?.continuationItems || [];
      nextToken = null;
      for (const it of items) {
        if (it.lockupViewModel) {
          discoveredPlaylists.push({
            title: it.lockupViewModel.metadata?.lockupMetadataViewModel?.title?.content || 'Playlist',
            id: it.lockupViewModel.contentId
          });
        }
        if (it.continuationItemRenderer) {
          nextToken = it.continuationItemRenderer.continuationEndpoint?.continuationCommand?.token || null;
        }
      }
    }

    // Fetch clips for discovered playlists (in batches of 5)
    const playlistsResults: any[] = [];
    for (let i = 0; i < discoveredPlaylists.length; i += 5) {
      const chunk = discoveredPlaylists.slice(i, i + 5);
      const chunkResults = await Promise.all(chunk.map(async (pl) => {
        try {
          const plHtml = await fetchUrlWithRedirects(`https://www.youtube.com/playlist?list=${pl.id}`);
          const plMatch = plHtml.match(/ytInitialData = ({.*?});<\/script>/s);
          if (!plMatch) return { id: pl.id, title: pl.title, description: `Playlist "${pl.title}"`, category: getCategoryForPlaylistTitle(pl.title), clips: [] };
          const plJson = JSON.parse(plMatch[1]);
          const items = plJson.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents || [];
          const clips = [];
          for (const it of items) {
            if (it.lockupViewModel) {
              const clipTitle = it.lockupViewModel.metadata?.lockupMetadataViewModel?.title?.content || 'Untitled';
              const videoId = it.lockupViewModel.contentId;
              const channelTitle = it.lockupViewModel.metadata?.lockupMetadataViewModel?.metadata?.contentMetadataViewModel?.metadataRows?.[0]?.metadataParts?.[0]?.text?.content || 'YouTube';
              let duration = '';
              const overlays = it.lockupViewModel.contentImage?.thumbnailViewModel?.overlays || [];
              for (const o of overlays) {
                if (o.thumbnailOverlayTimeStatusRenderer?.text?.runs?.[0]?.text) {
                  duration = o.thumbnailOverlayTimeStatusRenderer.text.runs[0].text;
                }
              }
              if (videoId) {
                clips.push({
                  id: videoId,
                  title: clipTitle,
                  channel: channelTitle,
                  duration: duration || '10:00',
                  playlistId: pl.id,
                  tags: [pl.title],
                  status: 'to-watch',
                  transcriptAvailable: true,
                  notes: '',
                  userQuestions: [],
                  userIdeas: [],
                  addedAt: new Date().toISOString().split('T')[0]
                });
              }
            }
          }
          return {
            id: pl.id,
            title: pl.title,
            description: `YouTube playlist "${pl.title}" from ${handle} containing ${clips.length} clip(s).`,
            category: getCategoryForPlaylistTitle(pl.title),
            clips
          };
        } catch (e) {
          return { id: pl.id, title: pl.title, description: '', category: getCategoryForPlaylistTitle(pl.title), clips: [] };
        }
      }));
      playlistsResults.push(...chunkResults);
    }

    const playlistsPath = path.resolve(rootDir, 'src', 'data', 'channelPlaylists.json');
    fs.writeFileSync(playlistsPath, JSON.stringify(playlistsResults, null, 2), 'utf-8');

    const totalClips = playlistsResults.reduce((acc, p) => acc + (p.clips?.length || 0), 0);
    res.json({
      success: true,
      channel: handle,
      totalPlaylists: playlistsResults.length,
      totalClips,
      playlists: playlistsResults
    });
  } catch (err: any) {
    console.error('Error syncing YouTube channel:', err);
    res.status(500).json({ error: err.message });
  }
});

// 4f. Run CLI Sync Script directly from app
app.post('/api/cli/execute-sync', async (req, res) => {
  try {
    const { mode, channel } = req.body;
    const targetChannel = (channel || '@dragosborosgpt').trim();
    const scriptPath = path.resolve(process.cwd(), 'scripts', 'sync-youtube.mjs');

    if (!fs.existsSync(scriptPath)) {
      return res.status(404).json({ error: 'CLI script scripts/sync-youtube.mjs not found' });
    }

    const args = [scriptPath];
    if (mode === 'offline') {
      args.push('--offline');
    } else {
      args.push(`--channel=${targetChannel}`);
    }

    const child = spawn('node', args, {
      cwd: process.cwd(),
      env: { ...process.env, PATH: process.env.PATH }
    });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('close', (code) => {
      // Re-read current count after execution
      const plPath = path.resolve(process.cwd(), 'src', 'data', 'channelPlaylists.json');
      let currentStats = { count: 0, clips: 0 };
      if (fs.existsSync(plPath)) {
        try {
          const list = JSON.parse(fs.readFileSync(plPath, 'utf-8'));
          currentStats = {
            count: list.length,
            clips: list.reduce((acc: number, p: any) => acc + (p.clips ? p.clips.length : 0), 0)
          };
        } catch {}
      }

      res.json({
        success: code === 0,
        exitCode: code,
        output: output || 'Process completed with no output.',
        errorOutput,
        timestamp: new Date().toISOString(),
        channel: targetChannel,
        mode: mode || 'live',
        stats: currentStats
      });
    });
  } catch (err: any) {
    console.error('CLI Execution error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 5. Append prompt to gemini_prompts.md
app.post('/api/content/append-prompt', (req, res) => {
  try {
    const { promptText, sessionName } = req.body;
    if (!promptText) {
      return res.status(400).json({ error: 'promptText is required' });
    }

    const promptsFile = path.resolve(rootDir, 'gemini_prompts.md');
    const timestamp = new Date().toISOString();
    const entry = `\n---\n\n### User Prompt (${sessionName || 'Interactive Hub'})\n*Timestamp: ${timestamp}*\n\n\`\`\`text\n${promptText.trim()}\n\`\`\`\n`;

    fs.appendFileSync(promptsFile, entry, 'utf-8');
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Resilient Gemini Execution Cascade with Fallback Models & High-Demand (503) Recovery
async function generateGeminiWithCascade(
  options: {
    systemPrompt?: string;
    prompt: string;
    responseMimeType?: string;
  }
): Promise<{ text: string; modelUsed: string }> {
  const client = getGeminiClient();
  if (!client) {
    throw new Error('Gemini API key not configured');
  }

  // Model cascade order:
  // 1. Primary standard text model: gemini-3.8-flash
  // 2. Dynamic flash router: gemini-flash-latest
  // 3. Resilient fallback: gemini-2.5-flash
  const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-2.5-flash'];
  let lastError: any = null;

  for (let i = 0; i < candidateModels.length; i++) {
    const model = candidateModels[i];
    try {
      const contents = options.systemPrompt
        ? [{ role: 'user', parts: [{ text: `${options.systemPrompt}\n\n${options.prompt}` }] }]
        : options.prompt;

      const response = await client.models.generateContent({
        model,
        contents,
        config: options.responseMimeType ? { responseMimeType: options.responseMimeType } : undefined,
      });

      if (response && response.text) {
        return { text: response.text, modelUsed: model };
      }
    } catch (err: any) {
      lastError = err;
      const errMsg = err.message || JSON.stringify(err);
      const isTransientDemandOrRateLimit =
        errMsg.includes('503') ||
        errMsg.includes('high demand') ||
        errMsg.includes('UNAVAILABLE') ||
        errMsg.includes('429') ||
        errMsg.includes('RESOURCE_EXHAUSTED') ||
        err.status === 503 ||
        err.status === 'UNAVAILABLE';

      console.warn(`[Gemini Cascade] Model ${model} failed (transient: ${isTransientDemandOrRateLimit}). Error: ${errMsg}`);

      if (isTransientDemandOrRateLimit && i < candidateModels.length - 1) {
        // Brief jittered pause before testing the next model in the cascade
        await new Promise((resolve) => setTimeout(resolve, 400 + i * 300));
        continue;
      }
    }
  }

  throw lastError || new Error('All Gemini models in cascade exhausted.');
}

function generateHeuristicInsights(content: string, title?: string, userGoal?: string) {
  const cleanTitle = title || 'Technical Study Topic';
  const sentences = content
    .split(/(?<=[.!?\n])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && !s.startsWith('#') && !s.startsWith('-'));

  const lead1 = sentences[0] || `Focuses on core engineering principles and architectural foundations of ${cleanTitle}.`;
  const lead2 = sentences[1] || `Emphasizes modular decomposition, isolated subdirectories, and reproducible workflows.`;
  const lead3 = sentences[2] || `Structures problem-solving into iterative verification checkpoints.`;

  return {
    source: 'offline-heuristic-recovery',
    warning: 'Gemini upstream model is temporarily experiencing high global demand (503 Service Unavailable). Resilient heuristic analysis provided to keep your workspace operational without interruption.',
    insights: [
      `Core Architectural Focus on "${cleanTitle}": ${lead1}`,
      `Practical Implementation Strategy: ${lead2}`,
      `Execution Best Practices: ${lead3}`,
      'Developer Empowerment: Prioritize reproducible, local execution over closed third-party dependencies.'
    ],
    takeaways: [
      `Always verify external outputs against automated tests before scaling up operations.`,
      `Structure long learning sessions into bite-sized chapters for spaced repetition.`,
      `Maintain clean, isolated feature branches when experimenting with AI-generated modules.`
    ],
    questions: [
      `How can the core techniques in ${cleanTitle} be tested on a minimal reproducible example?`,
      `What explicit verification command would instantly detect regression in this workflow?`,
      `How can multi-AI handoffs (e.g. Claude + Gemini + Kiro) best divide complex tasks on this topic?`
    ],
    mindMap: [
      {
        node: cleanTitle,
        children: ['Fundamental Concepts', 'Tooling & Environment', 'Verification Steps', 'Spaced Repetition & Flashcards']
      }
    ],
    suggestedPrompts: [
      `Write a self-contained TypeScript/Python test runner for ${cleanTitle} that validates input/output contracts.`,
      `Create a step-by-step checklist to stress-test ${cleanTitle} with edge-case inputs.`
    ],
    note: 'Generated via resilient heuristic engine while upstream Gemini servers recover from peak demand.'
  };
}

function generateHeuristicVibePilot(idea: string, currentAssistant?: string, stage?: string) {
  const cleanIdea = idea || 'build a high-reliability software component';
  const target = currentAssistant || 'Claude & Gemini Multi-Agent';
  const currentStage = stage || 'Implementation';

  return {
    source: 'offline-heuristic-recovery',
    warning: 'Gemini upstream model is temporarily experiencing high global demand (503). Providing resilient prompt blueprint with anti-pattern checks.',
    optimizedPrompt: `I am developing a feature for learn-better. Target outcome: "${cleanIdea}".
Constraints & Requirements:
1. Target platform: ${target}. Current stage: ${currentStage}.
2. Defensive engineering: Do not overwrite or mutate working files without explicit scope.
3. Resilience: Wrap all external API or network calls with cascading fallbacks (e.g. 503 high demand handling).
4. Provide a single shell or test verification command to validate functionality immediately upon generation.`,
    antiPatternWarning: `Avoid sending monolithic, multi-task prompts when upstream models are under heavy load. Break this task into: (1) schema contract, (2) isolated implementation, and (3) automated verification.`,
    suggestedNextSteps: [
      `Specify the exact TypeScript/Python interface types before writing execution logic.`,
      `Implement an isolated unit test or dry-run validation script.`,
      `Run live verification and check that fallback pathways trigger smoothly on transient errors.`
    ]
  };
}

// 6. Gemini API: Extract insights, takeaways, quiz questions & ideas
app.post('/api/gemini/extract-insights', async (req, res) => {
  const { content, title, userGoal, customPrompt } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  const client = getGeminiClient();
  if (!client) {
    // Return structured deterministic analysis if API key is not yet configured
    return res.json({
      source: 'local-heuristic',
      insights: [
        `Key core focus on "${title || 'YouTube Study Clip'}": local workflow, rapid iteration, and verifying code outputs.`,
        'Highlights developer empowerment: reducing dependency on proprietary black-boxes by building minimalist, CPU-friendly utilities.',
        'Emphasizes verifiable checkpoints between prompting and downstream execution.',
      ],
      takeaways: [
        'Store and structure your learning materials locally for high retention.',
        'Always keep a tight feedback loop when coding alongside AI assistants.',
        'Isolate new experimental code into clean subdirectories to prevent repository breakage.',
      ],
      questions: [
        'How can this workflow be extended to automate flashcard generation in Obsidian?',
        'What are the edge cases when transcribing audio with non-standard accents or high noise?',
        'How can multiple AIs collaborate on the same repository without colliding?',
      ],
      mindMap: [
        { node: title || 'Core Video Concept', children: ['Foundational Concepts', 'Practical Workflow', 'Troubleshooting & Verifications'] },
      ],
      note: 'Generated in offline heuristic mode. Configure your GEMINI_API_KEY in AI Studio Secrets for live Gemini deep reasoning.',
    });
  }

  const systemPrompt = `You are an elite research assistant and knowledge curator for "learn-better", an ecosystem that turns YouTube content and coding workflows into a personal knowledge hub.
Analyze the following video summary, transcript, or user note.

Format your response as strict JSON with this shape:
{
  "insights": ["3-5 deep, high-value insights"],
  "takeaways": ["3-4 actionable one-sentence rules"],
  "questions": ["3 thought-provoking questions to test comprehension or spark new ideas"],
  "mindMap": [
    {"node": "Central Concept", "children": ["Sub-concept 1", "Sub-concept 2", "Sub-concept 3"]}
  ],
  "suggestedPrompts": ["2-3 ready-to-use prompts the user can give to Claude, Kiro, or Gemini to build related tools"]
}
`;

  const userMessage = `Title: ${title || 'Untitled'}\nUser Goal: ${userGoal || 'Personal Knowledge Hub Extraction'}\n\nContent:\n${content}\n\n${customPrompt ? `Additional Instructions: ${customPrompt}` : ''}`;

  try {
    const result = await generateGeminiWithCascade({
      systemPrompt,
      prompt: userMessage,
      responseMimeType: 'application/json',
    });

    const text = result.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch {
      parsedData = { raw: text };
    }

    res.json({
      source: result.modelUsed,
      ...parsedData,
    });
  } catch (err: any) {
    console.error('Gemini error encountered in extract-insights:', err?.message || err);

    // If 503 unavailable, 429 quota, or network failure, engage graceful heuristic fallback
    const fallbackData = generateHeuristicInsights(content, title, userGoal);
    res.json(fallbackData);
  }
});

// 7. Gemini API: Vibe Coding Co-Pilot & Prompt Optimizer
app.post('/api/gemini/vibe-pilot', async (req, res) => {
  const { idea, currentAssistant, stage } = req.body;
  const client = getGeminiClient();

  if (!client) {
    return res.json({
      optimizedPrompt: `I am developing a new feature for learn-better. Here is my target outcome: ${idea || 'create a new tool'}. Write a single, focused Python or TypeScript script placed strictly inside a new folder. Include test instructions and an explicit verify command.`,
      antiPatternWarning: 'Avoid dumping multiple unverified requests in one prompt. Ensure you verify the file output before proceeding to the next step.',
      suggestedNextSteps: [
        'Verify that input and output file paths match the existing conventions.',
        'Run the script on a single test item before running batch mode.',
        'Commit or stage the changes to a dedicated feature branch.',
      ],
    });
  }

  const prompt = `You are a master mentor in "AI-Assisted Vibe Coding". The user wants to build: "${idea || 'new feature'}". 
Current assistant targeted: "${currentAssistant || 'Gemini/Claude/Kiro'}". 
Stage of project: "${stage || 'Ideation'}".

Provide a JSON object with:
1. "optimizedPrompt": A crystal-clear, high-leverage prompt with input/output contract, constraints, and verification check.
2. "antiPatternWarning": What common trap or mistake to avoid for this specific task.
3. "suggestedNextSteps": 3 sequential micro-steps.`;

  try {
    const result = await generateGeminiWithCascade({
      prompt,
      responseMimeType: 'application/json',
    });

    let parsedData: any = {};
    try {
      parsedData = JSON.parse(result.text || '{}');
    } catch {
      parsedData = { optimizedPrompt: result.text, antiPatternWarning: 'Verify output syntax', suggestedNextSteps: [] };
    }

    res.json({
      source: result.modelUsed,
      ...parsedData,
    });
  } catch (err: any) {
    console.error('Vibe pilot error encountered:', err?.message || err);

    // Engage graceful heuristic fallback on 503 high demand or network failure
    const fallbackData = generateHeuristicVibePilot(idea, currentAssistant, stage);
    res.json(fallbackData);
  }
});

// 8. Gemini API: Transcribe Spoken Audio (Push-to-talk audio reflection)
app.post('/api/gemini/transcribe-audio', async (req, res) => {
  try {
    const { audioBase64, mimeType = 'audio/webm' } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: 'audioBase64 is required' });
    }

    const client = getGeminiClient();
    if (!client) {
      return res.json({
        transcript: 'Spoken feedback captured. (Configure GEMINI_API_KEY in AI Studio Secrets for live transcription).',
        isFallback: true,
      });
    }

    const cleanBase64 = audioBase64.replace(/^data:audio\/[a-zA-Z0-9.+_-]+;base64,/, '');
    const cleanMimeType = mimeType.split(';')[0] || 'audio/webm';

    try {
      const response = await client.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: [
          {
            inlineData: {
              mimeType: cleanMimeType,
              data: cleanBase64,
            },
          },
          {
            text: 'Please transcribe this spoken audio recording verbatim into clean English prose. Capture technical terminology accurately. Output ONLY the raw transcription without commentary.',
          },
        ],
      });

      const transcript = (response.text || '').trim();
      res.json({
        success: true,
        transcript: transcript || 'Audio transcription completed with no speech detected.',
        model: 'gemini-3.5-transcribe',
      });
    } catch (err: any) {
      console.warn('Primary transcribe model error, falling back to gemini-3.8-flash multimodal:', err.message);
      const fallbackResponse = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            inlineData: {
              mimeType: cleanMimeType,
              data: cleanBase64,
            },
          },
          {
            text: 'Transcribe this spoken audio recording accurately into English text. Output ONLY the transcription.',
          },
        ],
      });

      const transcript = (fallbackResponse.text || '').trim();
      res.json({
        success: true,
        transcript: transcript || 'Audio transcription completed with no speech detected.',
        model: 'gemini-3.8-flash',
      });
    }
  } catch (err: any) {
    console.error('Audio transcription error:', err);
    res.status(500).json({
      error: err.message,
      transcript: 'Transcription could not be completed from audio stream.',
    });
  }
});

// 9. Gemini API: Socratic Clip Reflection Interviewer & Debrief Synthesizer
app.post('/api/gemini/socratic-interview', async (req, res) => {
  try {
    const { action, clipTitle, clipChannel, stage, userTranscript, turns = [] } = req.body;
    const client = getGeminiClient();

    if (action === 'next-question') {
      const systemPrompt = `You are a thoughtful, encouraging, and intellectually rigorous Socratic interviewer for a video learning platform.
The student is reflecting on a video clip titled "${clipTitle || 'Video Clip'}" (${clipChannel || 'YouTube'}).
Your goal is to guide them step-by-step through a 3-stage reflection:
- Stage 1 (merits): Why they consider this clip good/standout and what sparked their interest.
- Stage 2 (learnings): What core concepts, techniques, or insights they learned.
- Stage 3 (applications): What they liked most and how they plan to practically apply it in their own projects or vibe-coding.

The user just spoke their answer for: ${stage || 'current stage'}.
User's reflection: "${userTranscript || ''}"

Respond in JSON with this format:
{
  "acknowledgment": "1-2 warm sentences validating their thought and highlighting a nuance in what they said",
  "nextQuestion": "The next clear Socratic inquiry prompting the next reflection stage"
}`;

      if (!client) {
        let ack = `Great insight on "${clipTitle}". You clearly identified why this material stands out.`;
        let nextQ = 'What specific technical concept or workflow technique did you learn that felt new or surprising?';
        if (stage === 'learnings') {
          ack = 'Those are high-impact learning takeaways that bridge theory and practice.';
          nextQ = 'How do you plan to use or experiment with what you liked in your own code or vibe-coding projects?';
        }
        return res.json({ acknowledgment: ack, nextQuestion: nextQ });
      }

      try {
        const result = await generateGeminiWithCascade({
          systemPrompt,
          prompt: `User reflection: "${userTranscript}". Current stage completed: ${stage}. Please generate the acknowledgment and next question.`,
          responseMimeType: 'application/json',
        });
        const parsed = JSON.parse(result.text || '{}');
        return res.json(parsed);
      } catch (err) {
        return res.json({
          acknowledgment: 'That is a compelling takeaway from this clip.',
          nextQuestion: stage === 'merits' 
            ? 'What was the single most valuable concept or technique you learned?' 
            : 'How do you plan to put these concepts into practice in your own projects?',
        });
      }
    }

    if (action === 'synthesize') {
      const turnsSummary = turns
        .map((t: any, i: number) => `Q${i + 1} (${t.stage}): ${t.question}\nA: ${t.transcript}`)
        .join('\n\n');

      const systemPrompt = `You are an expert synthesizer. Turn this completed Socratic interview on "${clipTitle}" into a polished, actionable study debrief.
Format as strict JSON:
{
  "whyGood": "A concise paragraph explaining why the user considers this clip high-value",
  "keyLearnings": ["3 crisp bullet points of knowledge absorbed"],
  "practicalApplications": ["2-3 concrete ways the user will apply or build upon this"],
  "oneLineSummary": "A memorable 1-sentence synthesis of the learner's reflection"
}`;

      if (!client) {
        const firstTurn = turns[0]?.transcript || 'The clip provides clear, practical architectural insights.';
        const secondTurn = turns[1]?.transcript || 'Focused decomposition, systematic verification, and reproducible workflows.';
        const thirdTurn = turns[2]?.transcript || 'Implement a test project applying the core patterns.';
        return res.json({
          whyGood: firstTurn,
          keyLearnings: [
            secondTurn.slice(0, 120),
            'Established clean verification checkpoints before scaling.',
            'Reinforced hands-on experimentation over passive reading.'
          ],
          practicalApplications: [
            thirdTurn.slice(0, 120),
            `Prototype a minimal working example based on ${clipTitle}.`
          ],
          oneLineSummary: `Synthesized key principles from "${clipTitle}" into practical execution habits.`
        });
      }

      try {
        const result = await generateGeminiWithCascade({
          systemPrompt,
          prompt: `Here is the interview transcript:\n\n${turnsSummary}\n\nPlease synthesize the final reflection debrief.`,
          responseMimeType: 'application/json',
        });
        const parsed = JSON.parse(result.text || '{}');
        return res.json(parsed);
      } catch (err) {
        return res.json({
          whyGood: 'The learner highlighted strong architectural foundations and practical clarity in this clip.',
          keyLearnings: [
            'Clear separation of concerns and reproducible setup.',
            'Iterative verification checkpoints.',
            'Practical prompt engineering and tool synthesis.'
          ],
          practicalApplications: [
            'Apply this pattern in immediate upcoming project modules.',
            'Create automated validation tests to guard against regressions.'
          ],
          oneLineSummary: `Valuable study reflection on "${clipTitle}" focusing on practical application.`
        });
      }
    }

    res.status(400).json({ error: `Unsupported action: ${action}` });
  } catch (err: any) {
    console.error('Socratic interview error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Vite middleware & Static Serving
async function startServer() {
  // 1. Immediately open port 3000 so container health probes and /api routes respond in milliseconds
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening immediately on http://0.0.0.0:${PORT}`);
  });

  if (process.env.NODE_ENV !== 'production') {
    const vitePromise = createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.use(async (req, res, next) => {
      try {
        const vite = await vitePromise;
        vite.middlewares(req, res, next);
      } catch (err) {
        next(err);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

startServer();
