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

export interface LegacyApp {
  id: string;
  title: string;
  file: string;
  url: string;
  category: string;
  description: string;
  badge: string;
}

export interface PythonFileInfo {
  id: string;
  path: string;
  category: string;
  name: string;
  lineCount: number;
  size: number;
  docstring: string;
  functions: string[];
  classes: string[];
  purpose: string;
  inputsOutputs: {
    inputs: string[];
    outputs: string[];
    configs?: string[];
  };
  dependencies: {
    internal: string[];
    external: string[];
  };
  usageExample: string;
  vibeCodingNotes: string;
  content: string;
}

export interface WordCloudWord {
  text: string;
  weight: number;
  category?: string;
  context?: string;
  clipCount?: number;
}

export interface PlaylistWordCloudData {
  source: string;
  playlistId: string;
  playlistTitle: string;
  totalTokens: number;
  uniqueWords: number;
  clipCount: number;
  generatedAt: string;
  words: WordCloudWord[];
}

export interface MindMapNode {
  id: string;
  label: string;
  level: 1 | 2 | 3;
  description?: string;
  clipId?: string;
  clipTitle?: string;
  channel?: string;
  duration?: string;
  keyTakeaway?: string;
  keywords?: string[];
  children?: MindMapNode[];
  color?: string;
}

export type ActiveTab = 
  | 'playlists' 
  | 'restructure'
  | 'wordcloud-mindmap' 
  | 'knowledge' 
  | 'python-code' 
  | 'academy' 
  | 'gemini' 
  | 'gemini-chat'
  | 'legacy-apps' 
  | 'github-sync' 
  | 'guide';

export interface VideoAllocationItem {
  index: number;
  videoId: string;
  videoTitle: string;
  channel: string;
  duration: string;
  originalPlaylistId: string;
  originalPlaylistTitle: string;
  proposedClusterId: string;
  proposedClusterTitle: string;
  category: string;
  status: 'to-watch' | 'in-progress' | 'synthesized' | 'mastered';
  transcriptAvailable: boolean;
  notes?: string;
  tags: string[];
}

export interface RestructureCluster {
  id: string;
  title: string;
  category: string;
  description: string;
  rationale: string;
  sourcePlaylistTitles: string[];
}
