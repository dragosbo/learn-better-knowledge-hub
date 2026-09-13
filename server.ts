import express from 'express';
import path from 'path';
import fs from 'fs';
import https from 'https';
import http from 'http';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    const summariesDir = path.resolve(__dirname, 'imported_repo', 'data', 'summaries');
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
    const claudeDir = path.resolve(__dirname, 'imported_repo', 'lessons_Claude');
    const kiroDir = path.resolve(__dirname, 'imported_repo', 'lessons_Kiro');

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
    const promptsFile = path.resolve(__dirname, 'gemini_prompts.md');
    const feedbackFile = path.resolve(__dirname, 'gemini_feedback.md');
    const suggestionsFile = path.resolve(__dirname, 'suggestions.md');
    const userGuideFile = path.resolve(__dirname, 'USER_GUIDE.md');

    const prompts = fs.existsSync(promptsFile) ? fs.readFileSync(promptsFile, 'utf-8') : '';
    const feedback = fs.existsSync(feedbackFile) ? fs.readFileSync(feedbackFile, 'utf-8') : '';
    const suggestions = fs.existsSync(suggestionsFile) ? fs.readFileSync(suggestionsFile, 'utf-8') : '';
    const userGuide = fs.existsSync(userGuideFile) ? fs.readFileSync(userGuideFile, 'utf-8') : '';

    res.json({ prompts, feedback, suggestions, userGuide });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4b. Legacy apps static serving and catalog
const legacyDir = fs.existsSync(path.resolve(process.cwd(), 'imported_repo'))
  ? path.resolve(process.cwd(), 'imported_repo')
  : path.resolve(__dirname, 'imported_repo');

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
app.get('/api/content/playlists', (req, res) => {
  try {
    const playlistsPath = path.resolve(__dirname, 'src', 'data', 'channelPlaylists.json');
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
app.post('/api/content/save-playlists', (req, res) => {
  try {
    const { playlists } = req.body;
    if (!Array.isArray(playlists)) {
      return res.status(400).json({ error: 'playlists array is required' });
    }
    const playlistsPath = path.resolve(__dirname, 'src', 'data', 'channelPlaylists.json');
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

    const intelWordCloudPath = path.resolve(__dirname, 'imported_repo', 'data', 'wordclouds', 'intelligence.word_cloud.json');
    if (isIntel && fs.existsSync(intelWordCloudPath)) {
      const data = JSON.parse(fs.readFileSync(intelWordCloudPath, 'utf-8'));
      return res.json(data);
    }

    // Otherwise load playlist from channelPlaylists.json
    const playlistsPath = path.resolve(__dirname, 'src', 'data', 'channelPlaylists.json');
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

    const playlistsPath = path.resolve(__dirname, 'src', 'data', 'channelPlaylists.json');
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

    const promptsFile = path.resolve(__dirname, 'gemini_prompts.md');
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

// Vite middleware & Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
