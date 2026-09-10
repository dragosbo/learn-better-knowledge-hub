import { SummaryData, LessonItem, GeminiInsightResult, VibePromptResult } from '../types';

export async function fetchHealth(): Promise<{ status: string; hasGeminiKey: boolean }> {
  try {
    const res = await fetch('/api/health');
    return await res.json();
  } catch (err) {
    return { status: 'error', hasGeminiKey: false };
  }
}

export async function fetchSummaries(): Promise<SummaryData[]> {
  try {
    const res = await fetch('/api/content/summaries');
    const data = await res.json();
    return data.summaries || [];
  } catch (err) {
    console.error('Failed to fetch summaries', err);
    return [];
  }
}

export async function fetchLessons(): Promise<{ claude: LessonItem[]; kiro: LessonItem[] }> {
  try {
    const res = await fetch('/api/content/lessons');
    const data = await res.json();
    return {
      claude: data.claude || [],
      kiro: data.kiro || [],
    };
  } catch (err) {
    console.error('Failed to fetch lessons', err);
    return { claude: [], kiro: [] };
  }
}

export async function fetchLogs(): Promise<{ prompts: string; feedback: string }> {
  try {
    const res = await fetch('/api/content/logs');
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch logs', err);
    return { prompts: '', feedback: '' };
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
