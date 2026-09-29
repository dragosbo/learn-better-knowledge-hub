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
  voiceReflections?: VoiceReflectionSession[];
  addedAt: string;
}

export interface VoiceInterviewTurn {
  stage: 'merits' | 'learnings' | 'applications';
  question: string;
  transcript: string;
  timestamp: string;
}

export interface VoiceReflectionSession {
  id: string;
  clipId: string;
  clipTitle: string;
  date: string;
  turns: VoiceInterviewTurn[];
  synthesis: {
    whyGood: string;
    keyLearnings: string[];
    practicalApplications: string[];
    oneLineSummary: string;
  };
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
  warning?: string;
  error?: string;
}

export interface VibePromptResult {
  source?: string;
  optimizedPrompt: string;
  antiPatternWarning: string;
  suggestedNextSteps: string[];
  warning?: string;
  error?: string;
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
  | 'video-cosmos'
  | 'wordcloud-mindmap' 
  | 'knowledge' 
  | 'python-code' 
  | 'academy' 
  | 'gemini' 
  | 'gemini-chat'
  | 'legacy-apps' 
  | 'github-sync' 
  | 'guide'
  | 'roadmap'
  | 'analysis';

export interface CosmosVideoNode {
  id: string; // YouTube Video ID
  title: string;
  channel: string;
  duration: string;
  originalPlaylistTitle: string;
  clusterId: string;
  clusterTitle: string;
  category: string;
  categoryColor: string;
  tags: string[];
  status: 'to-watch' | 'in-progress' | 'synthesized' | 'mastered';
  notes?: string;
  summary?: string;
  // Canvas coordinate & physical simulation properties
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  // Semantic relationships
  relatedVideoIds: string[];
  // Insights & References
  keyInsights: string[];
  keyReferences: Array<{
    type: 'Paper' | 'Author/Thinker' | 'Tool/Library' | 'Book' | 'Concept' | 'Sibling Video';
    title: string;
    detail: string;
    url?: string;
  }>;
}

export interface CosmosTrajectoryStep {
  stepIndex: number;
  videoId: string;
  videoTitle: string;
  clusterTitle: string;
  timestamp: number;
  customNote?: string;
}

export interface CosmosTrajectoryVoyage {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  steps: CosmosTrajectoryStep[];
  color: string;
}

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
