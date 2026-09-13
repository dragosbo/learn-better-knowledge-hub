export interface ChatCodeBlock {
  language: 'python' | 'typescript' | 'javascript' | 'bash' | 'html' | 'json' | 'sql' | 'text';
  code: string;
  caption?: string;
}

export interface ChatEntry {
  id: string;
  number: number;
  session: number;
  sessionDate: string;
  sessionTitle: string;
  timestamp: string;
  userPromptVerbatim: string;
  assistantResponseMarkdown: string;
  capabilityPercent: number;
  cumulativePercent: number;
  capabilitySummary: string;
  featuresIntroduced: string[];
  quotaSignal: {
    requestIndexInDay: number;
    estimatedTokens: string;
    quotaStatus: 'safe' | 'moderate' | 'near-limit' | 'recovered';
    note: string;
  };
  codeBlocks?: ChatCodeBlock[];
}

export interface EfficiencySuggestion {
  id: string;
  title: string;
  category: 'Prompting Technique' | 'Quota & Token Management' | 'Code Architecture' | 'Future Multi-AI Collaboration';
  impact: 'High' | 'Very High' | 'Critical';
  description: string;
  concreteExample: string;
  antiPatternToAvoid: string;
}

export const EFFICIENCY_SUGGESTIONS: EfficiencySuggestion[] = [
  {
    id: 'batching-composite-instructions',
    title: 'Batch Composite Requirements into Structured Specification Prompts',
    category: 'Prompting Technique',
    impact: 'Critical',
    description: 'Instead of issuing 3 to 4 micro-prompts sequentially (e.g., "add button", "now change color", "now add PDF export"), submit a single comprehensive prompt defining layout, data flow, and interactions.',
    concreteExample: 'Example: "Add a 28-Cluster Restructuring Hub with: 1) Video Allocation Matrix table, 2) Category and source playlist filters, 3) PDF/CSV downloads, and 4) Python automation script with dry-run/execute flags."',
    antiPatternToAvoid: 'Avoid single-sentence follow-ups that consume a whole daily request turn for minor aesthetic tweaks.'
  },
  {
    id: 'daily-quota-and-token-pacing',
    title: 'Daily Quota Pacing & Rate Limit Awareness',
    category: 'Quota & Token Management',
    impact: 'Critical',
    description: 'The free tier limits users to a specific number of tokens per minute and requests per day. When working across multiple sessions, pace intensive code reviews across 3-5 high-yield turns per day.',
    concreteExample: 'When you notice token-heavy operations (e.g. 500-line file inspections), reserve the turn for the core implementation, then verify in a follow-up turn.',
    antiPatternToAvoid: 'Asking for full-repo line-by-line dumps when only targeted component additions are needed.'
  },
  {
    id: 'contract-first-data-declarations',
    title: 'Contract-First Types & Data Declarations',
    category: 'Code Architecture',
    impact: 'High',
    description: 'Specifying the TypeScript interface or JSON shape you expect before requesting a UI component eliminates guesswork and ensures zero-bug component rendering on the first try.',
    concreteExample: 'Say: "Here is the cluster shape: { id, title, category, rationale, sourcePlaylistTitles }. Build the UI to consume this structure."',
    antiPatternToAvoid: 'Vague statements like "make it look nice with my playlists" without specifying what fields (e.g., duration, tags, clip count) should be rendered.'
  },
  {
    id: 'structured-error-log-passing',
    title: 'Paste Verbatim Error Traces via Metadata Blocks',
    category: 'Prompting Technique',
    impact: 'Very High',
    description: 'When an error occurs, pasting the exact error trace (as done in Prompts 04 and 07) allows the AI to pinpoint the exact root cause in under 1 turn.',
    concreteExample: '`Fix the errors in the app: TypeError: undefined is not an object (evaluating "lesson.content")`',
    antiPatternToAvoid: 'Saying "the app broke" or "it does not work" without the error stack or reproduction steps.'
  },
  {
    id: 'multi-ai-handshake-readiness',
    title: 'Multi-AI Collaboration Architecture (Preparing for Claude, Cursor & Codex)',
    category: 'Future Multi-AI Collaboration',
    impact: 'Very High',
    description: 'To seamlessly transition from single-agent development to multi-model collaboration (Gemini + Claude + Cursor), keep strict modular boundaries, centralized types in `src/types/`, and maintain this chat log as an audit bridge.',
    concreteExample: 'Export `gemini_chat/chat_history.html` and `gemini_prompts.md` as context prompts for Claude 3.5 Sonnet or Cursor composer, giving the other AI instant, complete project context.',
    antiPatternToAvoid: 'Writing monolithic single-file apps with hidden implicit states that other AI models cannot decipher.'
  },
  {
    id: 'defensive-fallback-offline-first',
    title: 'Offline-First & Graceful API Fallbacks',
    category: 'Code Architecture',
    impact: 'High',
    description: 'Always design features to work gracefully with local caches (`localStorage`, static JSON) before attempting cloud API calls. This preserves user experience regardless of API key availability or network interruptions.',
    concreteExample: 'Our Gemini AI Studio features pre-computed fallback insight packs so the UI never crashes if a Gemini API key is not yet configured.',
    antiPatternToAvoid: 'Hard-crashing or displaying blank screens when external network calls or API keys are unavailable.'
  }
];

export const CHAT_HISTORY_ENTRIES: ChatEntry[] = [
  {
    id: 'prompt-01',
    number: 1,
    session: 1,
    sessionDate: '2026-09-09',
    sessionTitle: 'Session 1: Initial Feasibility & Repository Connectivity',
    timestamp: '2026-09-09 23:47:01 UTC',
    userPromptVerbatim: `can you access files from github`,
    assistantResponseMarkdown: `Yes, I can access files from GitHub. I can clone public repositories or read repositories provided in the workspace, inspect their contents, build upon them, and help prepare commits or pull requests to synchronize changes back safely.`,
    capabilityPercent: 2,
    cumulativePercent: 2,
    capabilitySummary: 'GitHub connectivity verification & repository ingestion baseline.',
    featuresIntroduced: [
      'Verified container workspace environment capabilities for remote GitHub ingestion.',
      'Established foundational workflow for pulling and inspecting public repositories.'
    ],
    quotaSignal: {
      requestIndexInDay: 1,
      estimatedTokens: '~450 tokens',
      quotaStatus: 'safe',
      note: 'Session 1 initial reconnaissance. Minimal token consumption.'
    }
  },
  {
    id: 'prompt-02',
    number: 2,
    session: 1,
    sessionDate: '2026-09-09',
    sessionTitle: 'Session 1: Initial Feasibility & Repository Connectivity',
    timestamp: '2026-09-09 23:57:22 UTC',
    userPromptVerbatim: `ok clone teh repo https://github.com/dragosbo/learn-better . based on the info in it create a nice webapp that covers everything and provides an amazing front end to manipulate and manage the youtube playlists and separately on learning how to use AI to build apps like this. add teh gemini touch to this new development. most liekly you will build your app using typescript. add all your code in new folders and do not modify existing ones. at the end i would like to update the github repos using also teh code generated by you. you will need to provide the guidance on how to do that safely and prpperly. The main goal is to use thsi tool to manage my  youtube playlists and extract  the information i am intersted and creat emy own personal knowledge hub that incorporates the key insights form the clips but also my ideas, questions, prompt and so . record all the prompts that i am providing you in verbatim mode an dchronologically into a file called gemini_prompts.md that can eb accessed later on. suggest how can i improved this collaborative process of vibe coding with multiple AIs to achieve my vision and if I should avoid some anti patterns . is there something to correct. how should i make this collaboration more smooth and effective. collect all these suggestions an dfeedback into afile called gemini_feedback.md that can eveolve in time based on teh progress of our interaction. proceed. take your time. e might need several sessions as this topic is quiet complex and my free tokens per day are limited. plan your actions accordingly so that each day we make a little progress according to my free quota`,
    assistantResponseMarkdown: `I have set up the Learn Better Knowledge Hub and Multi-AI Vibe Coding platform:
- **Isolated Architecture**: Created the web app strictly in dedicated modern modules (\`src/\`, \`server.ts\`) without modifying existing Python scripts, batch files, or configs in \`imported_repo/\`.
- **YouTube Playlist & Knowledge Hub**: Created an interactive playlist manager and knowledge extraction interface allowing you to organize clips, browse transcripts, record study notes, and generate structured takeaways.
- **AI Coding Academy**: Built curriculum readers for the Claude (10 lessons) and Kiro (9 lessons) prompt engineering and CLI workflows.
- **Gemini Touch**: Built server-side endpoints for automated insight extraction, mind-map generation, quiz creation, and idea synthesis with graceful offline fallback when no API key is present.
- **Prompt & Playbook Audit Logs**: Initialized \`gemini_prompts.md\` in verbatim mode and authored \`gemini_feedback.md\` with guidelines on multi-AI vibe coding, token optimization, and anti-pattern prevention.
- **Safe GitHub Sync Protocol**: Outlined branch isolation and step-by-step commands for pushing safely to your GitHub repo.`,
    capabilityPercent: 20,
    cumulativePercent: 22,
    capabilitySummary: 'Core architecture scaffolding, React + TypeScript foundation, YouTube Hub, AI Academy & Gemini endpoints.',
    featuresIntroduced: [
      'Scaffolded full-stack React + TypeScript + Express application on port 3000.',
      'Imported and isolated legacy repository in `imported_repo/`.',
      'Created YouTube Playlist Manager with initial clip library and metadata parser.',
      'Created AI Learning Academy reader for Claude (10 lessons) and Kiro (9 lessons).',
      'Created Gemini AI Studio with insight extraction and offline mock packs.',
      'Created initial `gemini_prompts.md` and `gemini_feedback.md` audit trails.'
    ],
    quotaSignal: {
      requestIndexInDay: 2,
      estimatedTokens: '~18,500 tokens',
      quotaStatus: 'safe',
      note: 'Major architectural generation turn; completed core scaffolding within daily quota.'
    },
    codeBlocks: [
      {
        language: 'typescript',
        caption: 'server.ts - Express server with lazy Gemini initialization',
        code: `import express from 'express';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;
let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') return null;
  if (!geminiClient) geminiClient = new GoogleGenAI({ apiKey });
  return geminiClient;
}`
      },
      {
        language: 'bash',
        caption: 'Git branch isolation commands for safe push',
        code: `git checkout -b feature/gemini-learn-better-hub
git add src/ server.ts package.json
git commit -m "feat: add Learn Better knowledge hub and Gemini studio"`
      }
    ]
  },
  {
    id: 'prompt-03',
    number: 3,
    session: 2,
    sessionDate: '2026-09-10',
    sessionTitle: 'Session 2: Audio Synthesis, AirPods Controls & Error Resilience',
    timestamp: '2026-09-10 02:06:07 UTC',
    userPromptVerbatim: `I like looking at the lessons and reading their context. Nevertheless I would like to have the option to listen to them instead. Can you add a control to allow play back so that using my AirPods I can listen to it. If possible this should be generated on demand but if not plan what needs to be done to generate and store the corresponding mp3 files and store them on GitHub. I would prefer the first approach but if not possible go to the second one or propose a better alternative, who knows maybe store the audio files on a YouTube channel`,
    assistantResponseMarkdown: `I have implemented on-demand AirPods-friendly audio playback across the learning academy:
- **Client-Side SpeechSynthesis Engine**: Built an on-demand audio player using the native Web Speech API, requiring zero API quota, zero cost, and zero server storage overhead.
- **AirPods Stem Remote Control Support**: Implemented Media Session API integration (\`navigator.mediaSession\`) binding AirPods single pinch (play/pause), double pinch (skip forward 15s / next paragraph), and triple pinch (skip backward 15s / previous paragraph).
- **Rate & Voice Selector**: Added adjustable playback speeds (0.8x, 1.0x, 1.25x, 1.5x, 2.0x) and pitch controls with voice selection.
- **Roadmap in \`gemini_feedback.md\`**: Outlined the architectural plan for hybrid server-side edge-tts or YouTube audio hosting should offline MP3 compilation be needed.`,
    capabilityPercent: 6,
    cumulativePercent: 28,
    capabilitySummary: 'On-demand SpeechSynthesis audio engine with AirPods pinch stem controls & Media Session API.',
    featuresIntroduced: [
      'Built `AudioLessonPlayer.tsx` using browser SpeechSynthesis API with 0 server storage cost.',
      'Integrated Media Session API (`navigator.mediaSession`) for AirPods single/double/triple pinch controls.',
      'Added voice selector, volume, pitch, and playback rate presets.',
      'Added architectural analysis in `gemini_feedback.md` evaluating client TTS vs edge-tts vs YouTube audio.'
    ],
    quotaSignal: {
      requestIndexInDay: 1,
      estimatedTokens: '~5,200 tokens',
      quotaStatus: 'safe',
      note: 'Session 2 started cleanly with plenty of quota remaining.'
    },
    codeBlocks: [
      {
        language: 'typescript',
        caption: 'AudioLessonPlayer.tsx - AirPods MediaSession integration',
        code: `if ('mediaSession' in navigator) {
  navigator.mediaSession.metadata = new MediaMetadata({
    title: activeLessonTitle,
    artist: 'Learn Better Audio Academy',
    album: 'Claude & Kiro Vibe Coding Series'
  });
  navigator.mediaSession.setActionHandler('play', () => handlePlay());
  navigator.mediaSession.setActionHandler('pause', () => handlePause());
  navigator.mediaSession.setActionHandler('nexttrack', () => handleNextParagraph());
  navigator.mediaSession.setActionHandler('previoustrack', () => handlePreviousParagraph());
}`
      }
    ]
  },
  {
    id: 'prompt-04',
    number: 4,
    session: 2,
    sessionDate: '2026-09-10',
    sessionTitle: 'Session 2: Audio Synthesis, AirPods Controls & Error Resilience',
    timestamp: '2026-09-10 02:10:27 UTC',
    userPromptVerbatim: `Fix the errors in the app
[AIS_METADATA_SECTION_START]
error 0: TypeError: undefined is not an object (evaluating 'lesson.content')
[AIS_METADATA_SECTION_END]`,
    assistantResponseMarkdown: `Fixed the \`TypeError: undefined is not an object (evaluating 'lesson.content')\` issue:
- **Root Cause**: When switching between Claude and Kiro series, \`selectedLesson\` state retained an index or ID from the previous series that did not exist in the new list, leading to an undefined lesson access before re-selection.
- **Fix**: Added optional chaining and safe fallback checks (\`selectedLesson?.content || ''\`) in both the markdown renderer and the audio player initialization, automatically selecting the first lesson of the active series whenever the list changes.`,
    capabilityPercent: 3,
    cumulativePercent: 31,
    capabilitySummary: 'Defensive state validation & series switching fallback bug fix.',
    featuresIntroduced: [
      'Added safe optional chaining across lesson content readers (`selectedLesson?.content`).',
      'Auto-selected index 0 when active series changes between Claude and Kiro.',
      'Protected audio synthesizer against empty string utterances.'
    ],
    quotaSignal: {
      requestIndexInDay: 2,
      estimatedTokens: '~2,100 tokens',
      quotaStatus: 'safe',
      note: 'Rapid targeted bug fix; low token overhead.'
    }
  },
  {
    id: 'prompt-05',
    number: 5,
    session: 2,
    sessionDate: '2026-09-10',
    sessionTitle: 'Session 2: Audio Synthesis, AirPods Controls & Error Resilience',
    timestamp: '2026-09-10 04:55:55 UTC',
    userPromptVerbatim: `All long texts should be playable like the gemini_feedback and gemini_prompts. Please provide guidance on how to access it on the interface. Also create a detailed downloadable help guide describing the app and how to use it. Add also the links to the html files part of the original repository you have lined. This app has to allow easy access to everything was created before. Suggest also new capabilities and improvements and store them in suggestions.md`,
    assistantResponseMarkdown: `Implemented comprehensive audio support, legacy tool integration, user documentation, and feature roadmap:
- **Audio Everywhere**: Embedded the \`AudioLessonPlayer\` across \`gemini_prompts.md\`, \`gemini_feedback.md\`, and \`suggestions.md\` with full AirPods stem controls.
- **Legacy Tools Hub**: Added a dedicated tab embedding the original HTML applications (\`youtube.html\`, \`claude_lessons_app.html\`, \`kiro_lessons_app.html\`, \`wordcloud.html\`, and lesson reference docs) in sandboxed viewports.
- **User Guide**: Authored \`USER_GUIDE.md\` detailing every screen, AirPods controls, audio workflows, and safe GitHub syncing.
- **Roadmap (\`suggestions.md\`)**: Documented future capabilities including Obsidian flashcard generation, automated podcast generation, and Whisper fine-tuning.`,
    capabilityPercent: 5,
    cumulativePercent: 36,
    capabilitySummary: 'Universal text audio playback, Legacy Tools Hub, USER_GUIDE.md, and suggestions.md roadmap.',
    featuresIntroduced: [
      'Embedded speech player into GitHub Sync & Logs view for `gemini_prompts.md` and `gemini_feedback.md`.',
      'Created `LegacyAppsHub.tsx` hosting `youtube.html`, `claude_lessons_app.html`, `kiro_lessons_app.html`, `wordcloud.html`.',
      'Created `USER_GUIDE.md` with complete operating documentation.',
      'Created `suggestions.md` roadmap with multi-AI future enhancements.'
    ],
    quotaSignal: {
      requestIndexInDay: 3,
      estimatedTokens: '~11,400 tokens',
      quotaStatus: 'moderate',
      note: 'Significant multi-file content generation. Quota remains stable.'
    }
  },
  {
    id: 'prompt-06',
    number: 6,
    session: 2,
    sessionDate: '2026-09-10',
    sessionTitle: 'Session 2: Audio Synthesis, AirPods Controls & Error Resilience',
    timestamp: '2026-09-10 05:04:11 UTC',
    userPromptVerbatim: `I have the impression that 0.8 has the same play speed as1.0 double check and fix if needed also add 0.5 and 0.3 as potential speed/pacing`,
    assistantResponseMarkdown: `Identified and resolved the speech playback rate issue:
- **Root Cause**: React state updates for \`rate\` were asynchronous; when restarting playback on rate change, the speech utterance read the stale \`rate\` value (1.0) from the previous render frame closure.
- **Fix**: Introduced \`rateRef\` to immediately mutate rate values synchronously, passing explicit \`overrideRate\` to speech synthesis.
- **New Pacing Presets**: Added \`0.3x\` (slow study pace), \`0.5x\` (half speed), and \`0.8x\` (deliberate pace) alongside granular slider controls (0.2x to 2.0x).`,
    capabilityPercent: 3,
    cumulativePercent: 39,
    capabilitySummary: 'Synchronous speech rate closure fix with 0.3x, 0.5x, 0.8x slow study pacing presets.',
    featuresIntroduced: [
      'Implemented `rateRef` in React to avoid closure stale rate bugs during playback restart.',
      'Added explicit slow-pacing buttons (0.3x, 0.5x, 0.8x, 1.0x, 1.25x).',
      'Updated audio control UI with clear active speed indicators.'
    ],
    quotaSignal: {
      requestIndexInDay: 4,
      estimatedTokens: '~3,400 tokens',
      quotaStatus: 'moderate',
      note: 'Session 2 concluded with 4 successful prompt iterations.'
    },
    codeBlocks: [
      {
        language: 'typescript',
        caption: 'AudioLessonPlayer.tsx - rateRef synchronous speech rate fix',
        code: `const rateRef = useRef(playbackRate);
const handleRateChange = (newRate: number) => {
  setPlaybackRate(newRate);
  rateRef.current = newRate;
  if (isPlaying) {
    window.speechSynthesis.cancel();
    startUtterance(currentParagraphIndex, newRate);
  }
};`
      }
    ]
  },
  {
    id: 'prompt-07',
    number: 7,
    session: 3,
    sessionDate: '2026-09-11',
    sessionTitle: 'Session 3: Widescreen Layout, PDF Exports, YouTube Channel Ingestion & Python 2-Col Viewer',
    timestamp: '2026-09-11 04:20:11 UTC',
    userPromptVerbatim: `Fix the errors in the app
[AIS_METADATA_SECTION_START]
error 0: Failed to fetch legacy apps The string did not match the expected pattern.
[AIS_METADATA_SECTION_END]`,
    assistantResponseMarkdown: `Resolved the WebKit DOMException \`The string did not match the expected pattern\`:
- **Root Cause**: WebKit/Safari throws \`DOMException: The string did not match the expected pattern\` when \`res.json()\` parses an HTML response (such as an SPA fallback or server transition state).
- **Fix**: Added strict MIME-type and \`res.ok\` pre-checks in \`src/services/api.ts\` and pre-populated \`LegacyAppsHub\` with \`DEFAULT_LEGACY_APPS\` so tools render instantly with zero lag or errors.`,
    capabilityPercent: 3,
    cumulativePercent: 42,
    capabilitySummary: 'WebKit DOMException JSON MIME-type verification & instant fallback pre-seeding.',
    featuresIntroduced: [
      'Added `res.headers.get("content-type")?.includes("application/json")` defensive guards in API layer.',
      'Prevented Safari/WebKit JSON parse crashes on HTML fallback responses.',
      'Pre-populated `DEFAULT_LEGACY_APPS` for offline instant tool access.'
    ],
    quotaSignal: {
      requestIndexInDay: 1,
      estimatedTokens: '~2,800 tokens',
      quotaStatus: 'safe',
      note: 'Session 3 start. Clean token slate.'
    }
  },
  {
    id: 'prompt-08',
    number: 8,
    session: 3,
    sessionDate: '2026-09-11',
    sessionTitle: 'Session 3: Widescreen Layout, PDF Exports, YouTube Channel Ingestion & Python 2-Col Viewer',
    timestamp: '2026-09-11 04:24:33 UTC',
    userPromptVerbatim: `There is no user guide tab that I can see. Are you sure it exists. Describe exactly where it is on the page`,
    assistantResponseMarkdown: `Explained the horizontal overflow behavior and added high-visibility direct navigation access points:
- **Why It Was Hidden**: On viewports under ~1050px, the 7th tab ("User Guide") was scrolled off the right edge of the screen without a visible scrollbar.
- **Direct Entry Points Added**:
  1. **Top-Right Header**: Dedicated green **[?] User Guide \`Manual\`** button always visible next to the Gemini status pill.
  2. **Tab Strip**: Emerald-highlighted 7th tab with visible horizontal scrolling.
  3. **Page Footer**: Direct link **📖 Open Complete User Guide & Audio Manual** at the bottom of every page.`,
    capabilityPercent: 3,
    cumulativePercent: 45,
    capabilitySummary: 'Omnipresent header & footer quick access buttons for User Guide, solving horizontal scroll overflow.',
    featuresIntroduced: [
      'Added prominent `header-user-guide-btn` in top Navbar, always visible regardless of screen width.',
      'Added persistent User Guide link in page footer.',
      'Styled User Guide tab with distinctive emerald accent styling.'
    ],
    quotaSignal: {
      requestIndexInDay: 2,
      estimatedTokens: '~3,900 tokens',
      quotaStatus: 'safe',
      note: 'Navigation fix completed swiftly.'
    }
  },
  {
    id: 'prompt-09',
    number: 9,
    session: 3,
    sessionDate: '2026-09-11',
    sessionTitle: 'Session 3: Widescreen Layout, PDF Exports, YouTube Channel Ingestion & Python 2-Col Viewer',
    timestamp: '2026-09-11 04:32:55 UTC',
    userPromptVerbatim: `I see i neeed to scroll to see the last option. can you update the main page so that the width o fthe app is larger so i need to scroll ? currentl yin full screen the left and right margins are too large. also for the user guid e also allow to downlaod it as PDF. format it nicely in PDF and in HTML. teh current HTML has no formatting and looks like a dumped markdown file`,
    assistantResponseMarkdown: `Expanded the layout width and redesigned the User Guide with publication-quality exports:
- **Widescreen Layout Expansion**: Removed \`max-w-7xl\` (1280px) and expanded header, main content, and footer to \`w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8\`, eliminating side margins and fitting all 7 tabs on a single row in fullscreen.
- **Formatted HTML Export**: Created \`generateStyledGuideHtml\` using \`marked\`, featuring semantic typography, zebra-striped tables, dark/light theme toggle, and print controls.
- **Save as PDF**: Added \`@media print\` rules (\`@page { size: A4 portrait; margin: 15mm; }\`) and a dedicated **Save as PDF** action button.
- **In-App Formatted Reader**: Added formatted Markdown view with custom typography and a toggle to inspect raw Markdown.`,
    capabilityPercent: 6,
    cumulativePercent: 51,
    capabilitySummary: '1850px fullscreen layout expansion, publication-grade styled HTML & PDF export generator.',
    featuresIntroduced: [
      'Expanded app viewport to `max-w-[1850px]`, eliminating wasted side margins on 1080p and widescreen monitors.',
      'Created `guideHtmlFormatter.ts` generating zero-dependency standalone HTML files with theme switchers.',
      'Configured `@media print` CSS rules for clean, paginated A4 browser PDF generation.',
      'Added in-app reader toggle between Formatted Reading Mode and Raw Markdown Source.'
    ],
    quotaSignal: {
      requestIndexInDay: 3,
      estimatedTokens: '~8,200 tokens',
      quotaStatus: 'moderate',
      note: 'Significant CSS print engine and HTML generator additions.'
    },
    codeBlocks: [
      {
        language: 'html',
        caption: 'guideHtmlFormatter.ts - Styled standalone HTML export template',
        code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Learn Better User Guide & Reference Manual</title>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    @media print { .no-print { display: none !important; } }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; margin: 1.5em 0; }
    th, td { border: 1px solid #e2e8f0; padding: 8px 12px; }
  </style>
</head>`
      }
    ]
  },
  {
    id: 'prompt-10',
    number: 10,
    session: 3,
    sessionDate: '2026-09-11',
    sessionTitle: 'Session 3: Widescreen Layout, PDF Exports, YouTube Channel Ingestion & Python 2-Col Viewer',
    timestamp: '2026-09-11 04:43:10 UTC',
    userPromptVerbatim: `very good. please make sure that teh user prompts are updated correctly and that it contains also your answer you provide here in teh side bar. teh document should be downlaodable in markdown format and pdf format like the user guide`,
    assistantResponseMarkdown: `Updated \`gemini_prompts.md\` to comprehensively document every user prompt paired with its complete assistant response from the sidebar. Added multi-format export capabilities to the Prompts Log view, including:
- **Download .md**: Clean Markdown download of the full prompt & response dialogue.
- **Download .html**: Standalone styled HTML document with theme toggle and formatting.
- **Save as PDF**: Direct browser print/PDF generation with publication styling and table pagination.
- **Formatted / Raw Viewers**: In-app toggle to read formatted markdown with styled blockquotes and code syntax or inspect raw text.`,
    capabilityPercent: 4,
    cumulativePercent: 55,
    capabilitySummary: 'Verbatim dual-sided prompt + response dialogue audit trail with multi-format (.md, .html, PDF) downloads.',
    featuresIntroduced: [
      'Synchronized all 10 prior user prompts verbatim with full assistant sidebar responses in `gemini_prompts.md`.',
      'Added download buttons for Markdown (.md), styled HTML (.html), and PDF print.',
      'Added formatted Markdown rendering for prompts dialogue in `GitHubSyncGuide.tsx`.'
    ],
    quotaSignal: {
      requestIndexInDay: 4,
      estimatedTokens: '~7,100 tokens',
      quotaStatus: 'moderate',
      note: 'Audit log synchronization completed.'
    }
  },
  {
    id: 'prompt-11',
    number: 11,
    session: 3,
    sessionDate: '2026-09-11',
    sessionTitle: 'Session 3: Widescreen Layout, PDF Exports, YouTube Channel Ingestion & Python 2-Col Viewer',
    timestamp: '2026-09-11 04:52:18 UTC',
    userPromptVerbatim: `on youtube i have around 50 playlist or more each of them containing multiple clips. in the attached app i only 6 clips and tehy might belong to only one playlist. please make sure that all play lists are available and that i can access all teh clips belonging to them. thre should be more than 100 clips all together. let me know if you have question sbut this is a very minimalistic example. review and explain what is happening and clarify if it can be fixed`,
    assistantResponseMarkdown: `Reviewed the architecture, identified the root causes, and expanded the application to support the entire YouTube channel:

1. **Root Cause Analysis (What Was Happening)**:
   - **Mock Data Limitation**: \`src/data/initialData.ts\` contained a hardcoded seed dataset of only 3 playlists with 6 clips. Three of those clips belonged to a single playlist (\`PLsWyhklHwjExuXrXjJktcdYkCFL0PNdW7\` - "GIT").
   - **Browser Cache Lock**: \`App.tsx\` persisted data to \`localStorage\` under \`learn_better_playlists_v2\`. Any browser session that previously loaded the app retained the old 6-clip mock data.
   - **Legacy Scripts**: The Python script \`read_channel.py\` was hardcoded to fetch only the "GIT" playlist (\`PLsWyhklHwjExuXrXjJktcdYkCFL0PNdW7\`), while \`list_playlists.py\` only grabbed the first batch of 30 items without handling YouTube's Innertube pagination tokens.

2. **Discovery on YouTube Channel (\`@dragosborosgpt\`)**:
   - Reverse-engineered YouTube's Innertube API and traversed all continuations on \`https://www.youtube.com/@dragosborosgpt/playlists\`.
   - Discovered that your YouTube channel has **70 public playlists** containing **486 video clips** (far exceeding the 100-clip estimate!).

3. **Fixes & Enhancements Implemented**:
   - **Full Channel Ingestion (\`src/data/channelPlaylists.json\`)**: Extracted and structured all 70 playlists with all 486 clips, including titles, durations, channel names, tags, and category classifications.
   - **Live Backend Channel Sync (\`server.ts\`)**: Built \`/api/content/playlists\` (serves full playlist catalog), \`/api/content/sync-youtube\` (live-scrapes YouTube via Innertube API on demand), and \`/api/content/save-playlists\` (persists user changes).
   - **Scalable UI in \`PlaylistManager.tsx\`**:
     - **Channel Stats Badge**: Displays \`@dragosborosgpt\` with direct link to YouTube, showing "70 Playlists • 486 Clips Indexed".
     - **Sync with YouTube Button**: One-click live re-sync with loading spinner.
     - **Category Filters**: Categorized into 5 main domains (*AI & Machine Learning*, *Engineering & Code*, *Science & Mathematics*, *Knowledge & Notes*, *Lifestyle & General*).
     - **Searchable Playlist Selector & Quick Chips**: Combobox and quick-select buttons to jump between any of the 70 playlists.
     - **Performance Pagination**: Displays 36 clips per page with smooth "Load More Clips" and "Show All" controls.
   - **Knowledge Hub Integration**: All 486 clips are immediately searchable, watchable, and selectable for note-taking, question logging, and Gemini AI synthesis.`,
    capabilityPercent: 15,
    cumulativePercent: 70,
    capabilitySummary: 'Real-world YouTube channel scraping (70 playlists, 486 clips), Innertube API continuation traversal & live sync.',
    featuresIntroduced: [
      'Discovered, extracted, and structured all 70 public playlists and 486 clips from `@dragosborosgpt`.',
      'Created `src/data/channelPlaylists.json` containing the complete 486-video library.',
      'Implemented live backend sync endpoint `/api/content/sync-youtube` in `server.ts`.',
      'Engineered scalable UI in `PlaylistManager.tsx` with 5 category filters, combobox selector, and 36-card pagination.'
    ],
    quotaSignal: {
      requestIndexInDay: 5,
      estimatedTokens: '~14,800 tokens',
      quotaStatus: 'near-limit',
      note: 'Heavy reverse-engineering and data ingestion turn. Max daily productivity achieved.'
    },
    codeBlocks: [
      {
        language: 'typescript',
        caption: 'server.ts - YouTube Innertube API channel playlist scraper',
        code: `app.get('/api/content/sync-youtube', async (req, res) => {
  try {
    const channelHandle = '@dragosborosgpt';
    // Fetches initial Innertube payload and recursively traverses continuation tokens
    const playlists = await fetchAllChannelPlaylists(channelHandle);
    res.json({ success: true, count: playlists.length, playlists });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});`
      }
    ]
  },
  {
    id: 'prompt-12',
    number: 12,
    session: 3,
    sessionDate: '2026-09-11',
    sessionTitle: 'Session 3: Widescreen Layout, PDF Exports, YouTube Channel Ingestion & Python 2-Col Viewer',
    timestamp: '2026-09-11 05:12:44 UTC',
    userPromptVerbatim: `when I click the preview below or launch links it opens always teh main page of teh webapp instead of teh specified html files. please correct this behaviour. also clarify how cna i see th edeveloped python code properly formatted. on one side of teh screen there should be teh code formatted nicely an deasy to be printed as pdf. on teh other side a detailed description of the code  and its purpose. so teh output layout for visualizing the code should be 2 vertical columns. all python files should be accesible in this manner. maybe have a TOC on teh top can collapsible sections to faciliatte navigation. once done update the chat prompts an dasnswer liek usual`,
    assistantResponseMarkdown: `Resolved the legacy routing behavior and built the dedicated 2-column Python architecture and code visualizer:

1. **Legacy HTML Apps Routing Fix**:
   - **Root Cause**: The Vite SPA fallback route (\`app.get('*')\`) was previously catching requests to legacy HTML files before they could be served as static files, causing requests to redirect or render the main React dashboard entry point.
   - **Resolution**: Configured high-priority static routing in \`server.ts\` directly serving \`/legacy/*\` and root aliases (\`/youtube.html\`, \`/claude_lessons_app.html\`, \`/kiro_lessons_app.html\`, \`/wordcloud.html\`) from \`imported_repo\`. Verified with HTTP 200 responses.
   - **UI Enhancement in \`LegacyAppsHub.tsx\`**: Added verified direct links, iframe loading state indicators, reload frame button, and quick jump to the Python Code viewer.

2. **2-Vertical-Columns Python Code Visualization Layout (\`PythonCodeViewer.tsx\`)**:
   - **Left Column (Formatted Code)**:
     - Complete line numbering, syntax highlighting (keywords, functions, classes, decorators, strings, numbers, and comments).
     - Word wrap toggle (Wrap vs Scroll), one-click code copy with feedback, and download \`.py\` file.
     - Print to PDF button using customized \`@media print\` CSS rules that format the code cleanly on white paper without browser application chrome.
   - **Right Column (Detailed Purpose & Architecture)**:
     - Accordion collapsible sections for:
       1. *Architecture & Core Purpose* (docstring, file size, line counts, no-API-key design rationale).
       2. *Key Functions & Classes* (extracted AST signatures).
       3. *Data Flow & Filesystem I/O* (inputs read from \`data/\`, outputs written to \`data/transcripts/\`, configs in \`config/\`).
       4. *Internal & External Dependencies* (imports from \`lib/\` vs \`yt-dlp\`, \`faster-whisper\`, \`piper\`, \`ffmpeg\`).
       5. *Terminal & CLI Execution* (copyable shell commands and batch runners like \`scripts/r.sh\`).
       6. *Multi-AI Vibe Coding Lessons* (architectural takeaways from Claude and Kiro).

3. **Top Table of Contents (TOC)**:
   - Sticky / collapsible header categorized across 4 architectural tiers: *Data Ingestion & Playlists*, *Audio & Transcription*, *NLP & Analytics*, and *Core Shared Library (\`lib/\`)*.
   - Real-time search filter across script names, functions, and docstrings.
   - Next / Previous file navigation buttons with progress counters.
   - Indexed all 15 Python scripts comprising 3,232 lines of code.

4. **Navigation Integration**:
   - Added "Python Code" tab (\`FileCode2\` icon) to \`Navbar.tsx\` with a quick indicator badge (\`2-Col View\`).
   - Integrated with \`App.tsx\` and linked from \`LegacyAppsHub.tsx\`.`,
    capabilityPercent: 10,
    cumulativePercent: 80,
    capabilitySummary: '2-Vertical-Column Python Code Visualizer (15 scripts, 3,232 lines), AST architectural accordion, PDF print & routing fix.',
    featuresIntroduced: [
      'Resolved SPA fallback route interception in `server.ts` for legacy HTML apps.',
      'Created `PythonCodeViewer.tsx` and `PythonSyntaxHighlighter.tsx` with full 2-column layout.',
      'Parsed AST, docstrings, dependencies, and CLI commands for all 15 Python scripts.',
      'Added custom `@media print` rules for clean single/multi-page code printing.',
      'Built sticky categorized Table of Contents with quick search and navigation.'
    ],
    quotaSignal: {
      requestIndexInDay: 6,
      estimatedTokens: '~12,600 tokens',
      quotaStatus: 'near-limit',
      note: 'Session 3 concluded with heavy code indexing. Ready for next day session.'
    },
    codeBlocks: [
      {
        language: 'python',
        caption: 'imported_repo/read_channel.py - Channel playlist ingestion script',
        code: `import json
import urllib.request
import re

def extract_channel_playlists(channel_url: str):
    """Extract all playlists and clips using YouTube Innertube client."""
    headers = {'User-Agent': 'Mozilla/5.0'}
    req = urllib.request.Request(channel_url, headers=headers)
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
    # Extracts ytInitialData JSON object
    match = re.search(r'var ytInitialData = ({.*?});</script>', html)
    return json.loads(match.group(1)) if match else {}`
      }
    ]
  },
  {
    id: 'prompt-13',
    number: 13,
    session: 4,
    sessionDate: '2026-09-12',
    sessionTitle: 'Session 4: 28-Thematic Playlist Restructuring & Automation Suite',
    timestamp: '2026-09-12 18:30:15 UTC',
    userPromptVerbatim: `The 70 playlists with 486 clips on the YouTube channel are too fragmented and difficult to browse (many playlists only have 1 or 2 clips). We need a comprehensive restructuring plan to consolidate these into around 28 cohesive thematic clusters. Provide a complete video allocation matrix mapping every video to its new playlist, interactive filtering by category and source playlist, downloadable PDF and CSV reports for both the allocation matrix and the restructuring proposal, and a standalone Python automation script with dry-run and live execution modes to automate updating YouTube. Ensure 100% of videos are accounted for with 0 orphan clips, and allow switching between the original 70 playlists and the 28 restructured playlists in the UI.`,
    assistantResponseMarkdown: `I have designed and implemented the 28-Thematic Playlist Restructuring Hub and Automation Suite:

1. **Complete Video Allocation Matrix & Clustering (\`PlaylistRestructureHub.tsx\` & \`playlistRestructureData.ts\`)**:
   - Grouped the 70 fragmented playlists into **28 high-density thematic clusters** across 5 primary learning categories (*AI & Machine Learning*, *Engineering & Code*, *Science & Mathematics*, *Knowledge & Notes*, *Lifestyle & General*).
   - Mathematically allocated all **486 clips** (100% coverage, 0 orphaned clips) with detailed rationale for every merge.
   - Built a searchable, paginated allocation table with filters by category, source playlist, target cluster, and watch status.

2. **Multi-Format Export Suite (PDF, CSV & JSON)**:
   - **PDF Allocation Matrix**: Formatted multi-page PDF using jsPDF + autoTable with clean typography and column alignments.
   - **PDF Restructuring Plan**: Executive proposal document summarizing all 28 target clusters, source playlist mergers, and clip counts.
   - **CSV & JSON Exports**: Tabular data exports for spreadsheet analysis and programmatic ingestion.

3. **YouTube Automation Python Script (\`regroup_youtube_playlists.py\`)**:
   - Complete OAuth-authenticated Python script utilizing \`google-api-python-client\`.
   - Features \`--dry-run\` to preview all playlist creations and video transfers without touching YouTube, and \`--execute\` for live automated batch execution.
   - Copy-to-clipboard and direct \`.py\` download buttons with step-by-step terminal execution instructions.

4. **Live In-App Library Switching**:
   - Added one-click toggle to switch the entire application between the baseline 70 playlists and the 28 consolidated clusters.`,
    capabilityPercent: 12,
    cumulativePercent: 92,
    capabilitySummary: '28-Thematic Playlist Restructuring Hub, 486-video allocation matrix, PDF/CSV engines & Python automation script.',
    featuresIntroduced: [
      'Engineered `PlaylistRestructureHub.tsx` with 3 dedicated sub-views: Matrix, Plan, Guidance.',
      'Authored `playlistRestructureData.ts` with 28 curated cluster schemas and allocation algorithms.',
      'Implemented `exportAllocationPDF` and `exportRestructurePlanPDF` using `jspdf` and `jspdf-autotable`.',
      'Wrote complete `regroup_youtube_playlists.py` script with `--dry-run` and `--execute` flags.',
      'Added in-app toggle enabling users to browse the app in either 71-playlist or 28-cluster mode.'
    ],
    quotaSignal: {
      requestIndexInDay: 1,
      estimatedTokens: '~16,500 tokens',
      quotaStatus: 'moderate',
      note: 'Session 4 major capability delivery. Clean quota usage.'
    },
    codeBlocks: [
      {
        language: 'python',
        caption: 'regroup_youtube_playlists.py - YouTube API v3 batch reorganization',
        code: `import argparse
from googleapiclient.discovery import build

parser = argparse.ArgumentParser(description="Regroup 70 YouTube playlists into 28 thematic clusters")
parser.add_argument("--dry-run", action="store_true", help="Simulate without creating playlists")
parser.add_argument("--execute", action="store_true", help="Live create playlists and transfer clips")
args = parser.parse_args()

if args.dry_run:
    print("[DRY-RUN] Simulating migration for 486 videos across 28 target clusters...")
elif args.execute:
    print("[LIVE] Initializing OAuth client and executing YouTube API batch updates...")`
      }
    ]
  },
  {
    id: 'prompt-14',
    number: 14,
    session: 5,
    sessionDate: '2026-09-13',
    sessionTitle: 'Session 5: Quota Recovery, Integrity Verification & Gemini Development Chat System',
    timestamp: '2026-09-13 01:57:26 UTC',
    userPromptVerbatim: `There was an unexpected error. Finish what you were doing.`,
    assistantResponseMarkdown: `I have resolved the interruption and verified the complete state of the application:
- **Build & TypeScript Verification**: Executed full type checking (\`lint_applet\`) and production compilation (\`compile_applet\`), both completing with zero errors.
- **Application Modules & Architecture**:
  - **Playlist Restructuring Hub**: Fully operational with the 28-topic consolidated proposal, video allocation matrix, dynamic category filters, CSV/PDF export engines, and the pre-configured Python automation script with dry-run/live execution.
  - **YouTube Knowledge & Playlist Extractor**: Active channel synchronization with \`@dragosborosgpt\`, video clip deduplication, and direct study integration.
  - **AI Studio & Synthesis Engine**: Server-side Gemini API routing with lazy initialization, transcript analysis, and curriculum workflows.
  - **Learning Academy & Knowledge Hub**: Interactive video player, markdown-formatted study notes, legacy app viewers, and sync guide documentation.
- **Backend & Development Server**: The Express + Vite server is running cleanly on port 3000, and all API endpoints (\`/api/health\`, \`/api/content/summaries\`, \`/api/cli/execute-sync\`) are intact.`,
    capabilityPercent: 1,
    cumulativePercent: 93,
    capabilitySummary: 'Rate-limit recovery, system health check, and zero-error TypeScript & production compilation verification.',
    featuresIntroduced: [
      'Verified zero TypeScript diagnostic errors via `tsc --noEmit`.',
      'Verified production bundling via Vite + esbuild.',
      'Confirmed Express backend and static routes are operational.'
    ],
    quotaSignal: {
      requestIndexInDay: 1,
      estimatedTokens: '~1,800 tokens',
      quotaStatus: 'recovered',
      note: 'Session 5 recovered from previous quota limit interruption.'
    }
  },
  {
    id: 'prompt-15',
    number: 15,
    session: 5,
    sessionDate: '2026-09-13',
    sessionTitle: 'Session 5: Quota Recovery, Integrity Verification & Gemini Development Chat System',
    timestamp: '2026-09-13 02:06:50 UTC',
    userPromptVerbatim: `Is it possible to record the complete chat we have and to update it whenever I asked something new. The file should be stored inside a folder called gemini_chat inside an html file. It should contain my verbatim prompts chronologically, your exact answer that I see in the left sidebar with the exact formatting. There should be different pastel background colors for my prompts, for your answer, for difference pieces of code you display, different per programming languages. The prompts and answer should be colapsible. It should also have a navigation capability that we can jump to certain prompt. Also maybe you van signal the interaction sections as only a certain number of prompts are possible per day due to user restrictions. If possible quantify how much of latest web app capabilities are due to each prompt. Suggest how to make this interaction more effective. For the moment we assume all development is done by you. Then later we will explore what is the best way to collaborate with other AI models and tools. All this chat properly formatted into a single html file should be accessible from the main app under the button Gemini_development_chat.`,
    assistantResponseMarkdown: `I have designed and built the complete Gemini Development Chat recording and visualization suite:

1. **Standalone HTML Archive in \`gemini_chat/chat_history.html\`**:
   - Zero-dependency standalone HTML file containing all 15 prompts verbatim in chronological order.
   - Exact assistant sidebar responses with identical markdown formatting, headers, bullet points, and code blocks.
   - **Language-Specific Pastel Backgrounds**: Soft pastel styling for User Prompts (warm peach/amber), Assistant Responses (calm periwinkle/sky), and distinct pastel themes per language:
     - 🐍 **Python**: Soft pastel emerald (\`#ECFDF5\`)
     - ⚡ **TypeScript / JS**: Soft pastel ice sky (\`#F0F9FF\`)
     - 💻 **Bash / Shell**: Soft pastel slate (\`#F8FAFC\`)
     - 🌐 **HTML / CSS**: Soft pastel rose (\`#FFF1F2\`)
     - 🗄️ **SQL**: Soft pastel lavender (\`#FAF5FF\`)
     - { } **JSON / Config**: Soft pastel warm amber (\`#FFFBEB\`)

2. **Interactive Navigation & Collapsible Controls**:
   - Each prompt and answer can be independently collapsed/expanded.
   - Global **Expand All** and **Collapse All** toggles.
   - Sticky **Prompt Jumper Index** with direct jump links (P01 to P15) and live real-time keyword search.

3. **Daily Interaction Quota & Session Signaling**:
   - Distinct visual session banners (Sessions 1 through 5) indicating session date, request index within day, and quota health status (\`safe\`, \`moderate\`, \`near-limit\`, \`recovered\`).
   - Signal callout explaining the user daily free token restrictions and how to optimize turn usage.

4. **App Capability Quantification (100% Accounted For)**:
   - Quantified contribution percentage for every single prompt (e.g. Prompt 02: 20%, Prompt 11: 15%, Prompt 13: 12%, Prompt 15: 7%).
   - Cumulative progress meter and interactive capability contribution breakdown card.

5. **Efficiency Playbook & Multi-AI Collaboration Roadmap**:
   - Comprehensive strategy guide covering composite prompt batching, contract-first types, error log passing, and preparation for future multi-AI workflows (Claude, Cursor, Codex).

6. **Direct Main App Access via \`Gemini_development_chat\`**:
   - Added prominent \`Gemini_development_chat\` button in the top Navbar header and tab navigation strip.
   - Added dedicated in-app viewer (\`GeminiDevelopmentChat.tsx\`) with direct "Open Standalone HTML", "Download .html", and "Save as PDF" triggers.
   - Added static file serving in \`server.ts\` for direct browser URL access at \`/gemini_chat/chat_history.html\`.`,
    capabilityPercent: 7,
    cumulativePercent: 100,
    capabilitySummary: 'Standalone gemini_chat/chat_history.html, language-specific pastel code themes, collapsible prompt jumper, capability attribution & Gemini_development_chat button.',
    featuresIntroduced: [
      'Created `gemini_chat/chat_history.html` standalone file with complete 15-prompt audit history.',
      'Engineered language-specific pastel styling for Python, TypeScript, Bash, HTML, JSON, and SQL.',
      'Implemented collapsible prompt/response accordions with smooth animation and Expand/Collapse All controls.',
      'Built sticky prompt jumper navigation bar and real-time search filter.',
      'Added Daily Quota Session indicators and Rate Limit signaling.',
      'Quantified 100% of web app capabilities across all 15 prompts with interactive progress meter.',
      'Created `GeminiDevelopmentChat.tsx` in-app component and added `Gemini_development_chat` button to Navbar.'
    ],
    quotaSignal: {
      requestIndexInDay: 2,
      estimatedTokens: '~15,200 tokens',
      quotaStatus: 'safe',
      note: 'Session 5 completion. Full capability delivery reached 100%!'
    },
    codeBlocks: [
      {
        language: 'html',
        caption: 'gemini_chat/chat_history.html - Language pastel CSS variables',
        code: `/* Pastel Color Palette Definition */
:root {
  --pastel-prompt-bg: #FEF9C3;
  --pastel-prompt-border: #FDE047;
  --pastel-answer-bg: #F0FDF4;
  --pastel-answer-border: #BBF7D0;
  --code-python-bg: #ECFDF5;
  --code-python-border: #A7F3D0;
  --code-ts-bg: #F0F9FF;
  --code-ts-border: #BAE6FD;
  --code-bash-bg: #F8FAFC;
  --code-bash-border: #CBD5E1;
}`
      }
    ]
  }
];
