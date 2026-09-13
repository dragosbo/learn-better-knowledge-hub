import { SummaryData, LessonItem, GeminiInsightResult, VibePromptResult, LegacyApp, Playlist, PythonFileInfo } from '../types';
import { PYTHON_FILES_DATA } from '../data/pythonFiles';

export const DEFAULT_LEGACY_APPS: LegacyApp[] = [
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
];

export async function fetchHealth(): Promise<{ status: string; hasGeminiKey: boolean }> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return { status: 'error', hasGeminiKey: false };
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return { status: 'error', hasGeminiKey: false };
    return await res.json();
  } catch (err) {
    return { status: 'error', hasGeminiKey: false };
  }
}

export async function fetchSummaries(): Promise<SummaryData[]> {
  try {
    const res = await fetch('/api/content/summaries');
    if (!res.ok) return [];
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return [];
    const data = await res.json();
    return data.summaries || [];
  } catch (err) {
    console.warn('Failed to fetch summaries', err);
    return [];
  }
}

export async function fetchLessons(): Promise<{ claude: LessonItem[]; kiro: LessonItem[] }> {
  try {
    const res = await fetch('/api/content/lessons');
    if (!res.ok) return { claude: [], kiro: [] };
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return { claude: [], kiro: [] };
    const data = await res.json();
    return {
      claude: data.claude || [],
      kiro: data.kiro || [],
    };
  } catch (err) {
    console.warn('Failed to fetch lessons', err);
    return { claude: [], kiro: [] };
  }
}

export async function fetchLogs(): Promise<{ prompts: string; feedback: string; suggestions: string; userGuide: string }> {
  try {
    const res = await fetch('/api/content/logs');
    if (!res.ok) return { prompts: '', feedback: '', suggestions: '', userGuide: '' };
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return { prompts: '', feedback: '', suggestions: '', userGuide: '' };
    return await res.json();
  } catch (err) {
    console.warn('Failed to fetch logs', err);
    return { prompts: '', feedback: '', suggestions: '', userGuide: '' };
  }
}

export async function fetchLegacyApps(): Promise<LegacyApp[]> {
  try {
    const res = await fetch('/api/content/legacy-apps');
    if (!res.ok) {
      return DEFAULT_LEGACY_APPS;
    }
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return DEFAULT_LEGACY_APPS;
    }
    const data = await res.json();
    return (data && Array.isArray(data.apps) && data.apps.length > 0) ? data.apps : DEFAULT_LEGACY_APPS;
  } catch (err) {
    console.warn('Failed to fetch legacy apps, falling back to default catalog:', err);
    return DEFAULT_LEGACY_APPS;
  }
}

export async function appendPromptLog(promptText: string, sessionName?: string): Promise<boolean> {
  try {
    const res = await fetch('/api/content/append-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ promptText, sessionName }),
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to append prompt log', err);
    return false;
  }
}

export async function extractInsightsWithGemini(
  content: string,
  title?: string,
  userGoal?: string,
  customPrompt?: string
): Promise<GeminiInsightResult> {
  try {
    const res = await fetch('/api/gemini/extract-insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, title, userGoal, customPrompt }),
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to extract insights', err);
    throw err;
  }
}

export async function getVibePilotAdvice(
  idea: string,
  currentAssistant: string,
  stage: string
): Promise<VibePromptResult> {
  try {
    const res = await fetch('/api/gemini/vibe-pilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea, currentAssistant, stage }),
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to get vibe pilot advice', err);
    throw err;
  }
}

export async function fetchPlaylists(): Promise<{
  channel: string;
  totalPlaylists: number;
  totalClips: number;
  playlists: Playlist[];
}> {
  try {
    const res = await fetch('/api/content/playlists');
    if (!res.ok) throw new Error('Failed to fetch playlists');
    return await res.json();
  } catch (err) {
    console.warn('Using local playlist fallback', err);
    return {
      channel: '@dragosborosgpt',
      totalPlaylists: 0,
      totalClips: 0,
      playlists: []
    };
  }
}

export async function syncYouTubePlaylists(channel = '@dragosborosgpt'): Promise<{
  success: boolean;
  channel: string;
  totalPlaylists: number;
  totalClips: number;
  playlists: Playlist[];
}> {
  const res = await fetch('/api/content/sync-youtube', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channel }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Sync failed' }));
    throw new Error(err.error || 'YouTube channel sync failed');
  }
  return await res.json();
}

export async function savePlaylists(playlists: Playlist[]): Promise<{ success: boolean; count: number }> {
  const res = await fetch('/api/content/save-playlists', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playlists }),
  });
  if (!res.ok) throw new Error('Failed to save playlists');
  return await res.json();
}

export async function fetchPythonFiles(): Promise<PythonFileInfo[]> {
  try {
    const res = await fetch('/api/content/python-files');
    if (!res.ok) return PYTHON_FILES_DATA;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return PYTHON_FILES_DATA;
    const data = await res.json();
    if (data && data.liveFiles) {
      return PYTHON_FILES_DATA.map((item) => {
        if (data.liveFiles[item.path]) {
          const liveContent = data.liveFiles[item.path];
          const lines = liveContent.split('\n');
          return {
            ...item,
            content: liveContent,
            lineCount: lines.length,
            size: liveContent.length,
          };
        }
        return item;
      });
    }
    return PYTHON_FILES_DATA;
  } catch (err) {
    console.warn('Failed to fetch live python files, using cached metadata:', err);
    return PYTHON_FILES_DATA;
  }
}

export interface CliSyncResponse {
  success: boolean;
  exitCode: number;
  output: string;
  errorOutput: string;
  timestamp: string;
  channel: string;
  mode: string;
  stats: {
    count: number;
    clips: number;
  };
}

export async function executeCliSync(channel = '@dragosborosgpt', mode: 'live' | 'offline' = 'live'): Promise<CliSyncResponse> {
  const res = await fetch('/api/cli/execute-sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channel, mode }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'CLI Execution failed' }));
    throw new Error(err.error || 'Failed to trigger CLI sync process');
  }
  return await res.json();
}

