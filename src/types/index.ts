export interface YouTubeClip {
  id: string; // YouTube Video ID (e.g., tRZGeaHPoaw)
  title: string;
  channel: string;
  duration?: string;
  playlistId?: string;
  tags: string[];
  status: 'to-watch' | 'in-progress' | 'synthesized' | 'mastered';
  summary?: string;
  transcriptAvailable?: boolean;
  notes?: string;
  userQuestions?: string[];
  userIdeas?: string[];
  addedAt: string;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  category: string;
  clipCount?: number;
  clips: YouTubeClip[];
}

export interface SummaryData {
  id: string;
  filename: string;
  title: string;
  videoId: string;
  approxLength?: string;
  topic?: string;
  audience?: string;
  oneLineTakeaway?: string;
  content: string;
}

export interface LessonItem {
  id: string;
  series: 'Claude' | 'Kiro';
  filename: string;
  title: string;
  content: string;
}

export interface GeminiInsightResult {
  source: string;
  insights: string[];
  takeaways: string[];
  questions: string[];
  mindMap?: Array<{ node: string; children: string[] }>;
  suggestedPrompts?: string[];
  note?: string;
}

export interface VibePromptResult {
  optimizedPrompt: string;
  antiPatternWarning: string;
  suggestedNextSteps: string[];
}

export type ActiveTab = 'playlists' | 'knowledge' | 'gemini' | 'academy' | 'github-sync';
