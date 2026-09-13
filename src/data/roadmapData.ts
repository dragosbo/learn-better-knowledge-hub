export interface RoadmapItem {
  id: string;
  title: string;
  category: 'Multi-AI Integration' | 'Cross-Device Topology' | 'Large Media & Blobs' | 'Sync & Architecture' | 'Audio & UX';
  status: 'done' | 'in-progress' | 'planned' | 'exploration';
  priority: 'High' | 'Medium' | 'Low' | 'Critical';
  devices: ('iPad' | 'Windows Desktop' | 'iPhone')[];
  aiModels: ('Gemini' | 'Claude' | 'ChatGPT' | 'Kiro' | 'NotebookLM')[];
  summary: string;
  implementationDetails: string[];
  keyBenefits: string[];
  nextAction: string;
}

export interface ArchitecturalTopic {
  id: string;
  title: string;
  badge: string;
  question: string;
  verdict: string;
  comparison: {
    approach: string;
    pros: string[];
    cons: string[];
    recommended: boolean;
  }[];
  stepByStepPlaybook: string[];
  concreteCodeExample?: string;
}

export const ROADMAP_ITEMS: RoadmapItem[] = [
  {
    id: 'rm-01',
    title: 'Multi-Model Fallback Cascade & Transient 503 Auto-Recovery',
    category: 'Multi-AI Integration',
    status: 'done',
    priority: 'Critical',
    devices: ['iPad', 'Windows Desktop', 'iPhone'],
    aiModels: ['Gemini'],
    summary: 'Prevent API 503 high-demand exceptions through automated model cascades (3.8-flash → flash-latest → 2.5-flash) and heuristic offline backup.',
    implementationDetails: [
      'Configured jittered retry backoff in server.ts',
      'Automated cascade to secondary flash endpoints before raising errors',
      'Engineered structured heuristic analysis generator to maintain 100% UI uptime'
    ],
    keyBenefits: ['Zero application crashes', 'Continuous uptime regardless of Google cloud traffic spikes'],
    nextAction: 'Completed and verified in Prompt 16.'
  },
  {
    id: 'rm-02',
    title: 'Standardized External AI Model Intake Pipeline (Claude, ChatGPT, Kiro)',
    category: 'Multi-AI Integration',
    status: 'in-progress',
    priority: 'High',
    devices: ['iPad', 'Windows Desktop', 'iPhone'],
    aiModels: ['Claude', 'ChatGPT', 'Kiro', 'Gemini'],
    summary: 'Define a clean file intake convention (`/intake/claude/`, `/intake/chatgpt/`, `/intake/kiro/`) so transcripts, code snippets, and lessons from any model can be dropped in and indexed automatically.',
    implementationDetails: [
      'Intake JSON schema: { model, prompt, response, timestamp, tags, audioUrl }',
      'Automated watcher in Express server to ingest any new file placed in `/intake/`',
      'Unified Knowledge Hub search that queries across Gemini, Claude, and ChatGPT contributions seamlessly'
    ],
    keyBenefits: ['No model lock-in', 'Combines Claude analytical code with ChatGPT natural voice and Gemini speed'],
    nextAction: 'Build an Ingest Dropzone UI in the app to paste or upload JSON/Markdown files from external models.'
  },
  {
    id: 'rm-03',
    title: 'Large Blob & Audio Hosting: GitHub Releases Asset Pipeline',
    category: 'Large Media & Blobs',
    status: 'in-progress',
    priority: 'High',
    devices: ['iPad', 'Windows Desktop', 'iPhone'],
    aiModels: ['NotebookLM', 'ChatGPT'],
    summary: 'Host large MP3s (NotebookLM Audio Overviews, ChatGPT voice recordings) and MP4s (OBS screen recordings) on GitHub Releases without bloating git repo clone size.',
    implementationDetails: [
      'GitHub Releases allow up to 2GB per asset with zero impact on git history',
      'Create tag `v1.0-media` and attach .mp3/.m4a/.mp4 files via gh release upload or GitHub web UI',
      'Direct permanent asset URLs format: https://github.com/{user}/{repo}/releases/download/{tag}/{filename}.mp3',
      'Integrate audio player to stream directly from these release URLs with native iOS/iPad lockscreen controls'
    ],
    keyBenefits: [
      'Keep Git repository lightning fast (under 30MB clone time)',
      'Free high-speed CDN delivery worldwide',
      'Never hit the Git 100MB file reject limit'
    ],
    nextAction: 'Add audio URL binding field in Playlist Restructure Hub and Knowledge Hub notes.'
  },
  {
    id: 'rm-04',
    title: 'Cross-Device Topology: iPad Touch + Desktop OBS/Python + iPhone Voice',
    category: 'Cross-Device Topology',
    status: 'in-progress',
    priority: 'High',
    devices: ['iPad', 'Windows Desktop', 'iPhone'],
    aiModels: ['ChatGPT', 'Claude', 'Kiro'],
    summary: 'Harmonize device capabilities: iPhone for human voice transcription & reading aloud, Desktop for OBS capture & heavy Python runs, iPad for app interaction.',
    implementationDetails: [
      'iPhone workflow: Use ChatGPT Advanced Voice Mode to discuss a video topic, request bullet-point summary + high-quality audio file export',
      'Windows Desktop workflow: Capture OBS walk-throughs, run YouTube yt-dlp or Innertube scraper scripts, commit code to GitHub',
      'iPad workflow: Open AI Studio web preview, review word clouds, test AirPods playback, organize 28 clusters'
    ],
    keyBenefits: [
      'Play to each device physical strengths',
      'Natural-sounding audio playback on iOS instead of robotic browser TTS',
      'Full desktop compute power without sacrificing iPad mobility'
    ],
    nextAction: 'Provide one-click copy templates optimized for ChatGPT mobile voice sessions.'
  },
  {
    id: 'rm-05',
    title: 'Unified Monorepo with Model-Specific Folders vs Multi-Repo Strategy',
    category: 'Sync & Architecture',
    status: 'done',
    priority: 'Critical',
    devices: ['iPad', 'Windows Desktop'],
    aiModels: ['Claude', 'Kiro', 'Gemini'],
    summary: 'Architectural determination: Maintain a single GitHub repository with dedicated folders rather than multi-repo sprawl.',
    implementationDetails: [
      'Folder structure: /lessons_Claude/, /lessons_Kiro/, /gemini_chat/, /external_models/chatgpt/',
      'Eliminates Git submodule complexity, branch drift, and multi-repo auth management',
      'Allows AI Studio to view all models outputs in a single unified workspace'
    ],
    keyBenefits: ['Single source of truth', 'AI Studio can read and cross-reference all model contributions at once'],
    nextAction: 'Completed architecture structure; continue expanding subdirectories.'
  },
  {
    id: 'rm-06',
    title: 'Google Drive as an Interim Bridge: Evaluation & Lightweight Sync',
    category: 'Sync & Architecture',
    status: 'planned',
    priority: 'Medium',
    devices: ['iPad', 'Windows Desktop', 'iPhone'],
    aiModels: ['NotebookLM', 'ChatGPT'],
    summary: 'Evaluate Google Drive as an interim scratchpad for files exported on iPad/iPhone before committing to GitHub.',
    implementationDetails: [
      'Drive Pros: Native Files app integration on iPad/iPhone, instant AirDrop/Files save for NotebookLM audio',
      'Drive Cons: OAuth friction, rate limits, non-versioned binary storage',
      'Recommended Pattern: Use Drive/iCloud Files as temporary buffer on mobile, then push to GitHub Release or repo'
    ],
    keyBenefits: ['Frictionless mobile saving without needing mobile terminal'],
    nextAction: 'Document the 3-tap iPad Files to GitHub Release workflow.'
  },
  {
    id: 'rm-07',
    title: 'NotebookLM Podcast Audio Integration with Synced Transcript View',
    category: 'Audio & UX',
    status: 'planned',
    priority: 'High',
    devices: ['iPad', 'iPhone', 'Windows Desktop'],
    aiModels: ['NotebookLM'],
    summary: 'Embed NotebookLM 2-host deep dive audio conversations alongside YouTube playlist clusters with interactive playback scrubbing.',
    implementationDetails: [
      'Download NotebookLM audio overview (.m4a / .mp3)',
      'Host on GitHub Releases or stream locally',
      'Add dedicated audio player with 0.75x - 2.0x playback speed, 15s skip, and chapter marks'
    ],
    keyBenefits: ['Ultra-engaging human podcast conversations explaining dense technical concepts on commute'],
    nextAction: 'Create an Audio Hub tab or drawer capable of playing remote MP3 streams.'
  },
  {
    id: 'rm-08',
    title: 'Desktop Screenshot & OBS Visual Ingestion via Gemini Multimodal',
    category: 'Multi-AI Integration',
    status: 'exploration',
    priority: 'Medium',
    devices: ['Windows Desktop'],
    aiModels: ['Gemini'],
    summary: 'Ingest Windows desktop screenshots and OBS video keyframes into Gemini 3.8 Flash to auto-generate markdown step-by-step guides.',
    implementationDetails: [
      'Desktop script captures screenshots of code errors or software diagrams',
      'Uploads image directly to Gemini API endpoint for OCR, architectural breakdown, and bug identification'
    ],
    keyBenefits: ['Instant translation from desktop visual bug to automated fix'],
    nextAction: 'Add multimodal image dropzone to Gemini Studio tab.'
  }
];

export const ARCHITECTURAL_TOPICS: ArchitecturalTopic[] = [
  {
    id: 'repo-strategy',
    title: 'Single Repository vs. One Repo Per Model vs. Multi-Repo',
    badge: 'Core Architecture',
    question: 'Shall I clone this repository and bring in inputs from other models? Can you read inputs from several repos? What about using one repo per model?',
    verdict: 'Maintain ONE Central Monorepo with dedicated model directories (`/lessons_Claude/`, `/lessons_Kiro/`, `/external_models/chatgpt/`). Avoid one-repo-per-model.',
    comparison: [
      {
        approach: 'Single Central Monorepo with Subdirectories (Recommended)',
        pros: [
          'AI Studio can inspect, cross-reference, and synthesize files from all models simultaneously in one workspace',
          'Zero git submodule friction or multi-repo sync conflicts',
          'Single deployable artifact that contains the whole knowledge base',
          'Atomic commits: one commit can update both Claude lesson and Gemini chat history'
        ],
        cons: [
          'Repository can grow large if media blobs are improperly committed (avoided via GitHub Releases)'
        ],
        recommended: true
      },
      {
        approach: 'One Repo Per Model (Multi-Repo)',
        pros: [
          'Clean git log isolated exclusively to one model tool'
        ],
        cons: [
          'AI Studio cannot easily read across multiple repositories without configuring multiple GitHub PAT tokens and running complex clone scripts',
          'Context fragmentation: Gemini does not know what Claude updated unless manually synced',
          'High management overhead on mobile/iPad (managing 4-5 repo branches on iPad is painful)'
        ],
        recommended: false
      }
    ],
    stepByStepPlaybook: [
      'Keep `learn-better` as your single master repository.',
      'On Windows Desktop, Claude and Kiro write directly into their designated folders: `/lessons_Claude/` and `/lessons_Kiro/`.',
      'For ChatGPT outputs, create `/external_models/chatgpt/` for audio summaries, transcripts, and prompt logs.',
      'Commit and push to `main` (or dedicated feature branches like `feat/chatgpt-summaries`).',
      'In AI Studio, we simply run `git pull` or sync to instantly see all contributions in one unified dashboard!'
    ],
    concreteCodeExample: `# Recommended Directory Topology inside learn-better:
learn-better/
├── src/                  # Unified React + Vite Application
├── server.ts             # Express API & Multi-Model Cascade
├── lessons_Claude/       # Lessons authored with Claude on Desktop
├── lessons_Kiro/         # Lessons authored with Kiro on Desktop
├── gemini_chat/          # Full verbatim chronicle of Gemini Sessions
├── external_models/
│   └── chatgpt/          # ChatGPT transcripts & audio notes
└── scripts/              # Python scrapers & automation utilities`
  },
  {
    id: 'github-artifacts-blobs',
    title: 'Handling Large Blobs (MP3s, OBS Recordings, NotebookLM Audio)',
    badge: 'Media Storage',
    question: 'How do I use GitHub artifacts or releases to load large blob files like MP3 audio or OBS videos without hitting Git 100MB limits?',
    verdict: 'Use GitHub Releases Assets or Cloudflare R2 / Google Drive Direct Links. NEVER commit large MP3s or MP4s directly into the git repository tree.',
    comparison: [
      {
        approach: 'GitHub Releases Assets (Recommended for free, durable hosting)',
        pros: [
          'Up to 2GB per file, completely free on public & private repos',
          'Does not bloat git clone size or git history',
          'Provides permanent direct CDN download/stream URLs',
          'Easy to upload from iPad/iPhone via web browser or Desktop via gh CLI'
        ],
        cons: [
          'Assets must be attached to a git release/tag (e.g. tag "media-v1")'
        ],
        recommended: true
      },
      {
        approach: 'Committing raw .mp3/.mp4 to Git repo directly',
        pros: ['Direct file path in local directory'],
        cons: [
          'Git repo will balloon in size (a few OBS videos can make the repo 5GB)',
          'GitHub rejects files over 100MB completely',
          'AI Studio container cloning will become slow or fail'
        ],
        recommended: false
      },
      {
        approach: 'GitHub Actions Artifacts',
        pros: ['Created automatically during CI builds'],
        cons: [
          'Expire automatically after 90 days (not permanent)',
          'Download requires authentication (cannot be streamed directly by HTML <audio> tags in the browser)'
        ],
        recommended: false
      }
    ],
    stepByStepPlaybook: [
      'Step 1: On GitHub, go to your repository → Releases → "Draft a new release".',
      'Step 2: Create a tag named `media-assets` and release title `Audio & Video Blobs`.',
      'Step 3: Drag and drop your NotebookLM .mp3, ChatGPT voice summaries, or OBS clips into the "Attach binaries" box.',
      'Step 4: Click "Publish release". Right click the uploaded file and copy its link: `https://github.com/{user}/{repo}/releases/download/media-assets/notebooklm_summary_01.mp3`.',
      'Step 5: Reference that URL directly in `learn-better` playlists or Knowledge Hub! The HTML5 `<audio>` player will stream it with native scrub bars and lockscreen controls!'
    ],
    concreteCodeExample: `// Example metadata entry in learn-better referencing a GitHub Release MP3:
{
  "videoId": "rec-01",
  "title": "NotebookLM Deep Dive: Multi-Agent Vibe Coding",
  "audioUrl": "https://github.com/dragos-boros/learn-better/releases/download/media-assets/notebooklm_vibe_coding.mp3",
  "audioType": "notebooklm-2host-podcast",
  "duration": "14:22"
}`
  },
  {
    id: 'google-drive-interim',
    title: 'Google Drive as an Interim Step vs Direct Git',
    badge: 'Mobile Storage Bridge',
    question: 'Shall I use Google Drive as an interim step?',
    verdict: 'Yes, as a mobile scratchpad/staging area for iPad and iPhone, but not as the primary database.',
    comparison: [
      {
        approach: 'Drive as Interim Mobile Staging Area (Recommended workflow)',
        pros: [
          'iOS/iPadOS Files app integrates seamlessly with Google Drive & iCloud Drive',
          'When ChatGPT or NotebookLM produces an audio file on iPhone, you can save to Drive in 2 taps',
          'Acts as an unconstrained temporary holding bin until files are curated or uploaded to GitHub Releases'
        ],
        cons: [
          'Requires manual batch transfer to GitHub or permanent storage periodically'
        ],
        recommended: true
      },
      {
        approach: 'Drive as Live Backend Database for the App',
        pros: ['Easy to browse in Drive UI'],
        cons: [
          'Requires Google OAuth consent setup, token refresh handling, and rate limits',
          'Binary streaming from Drive often blocked by CORS or requires Google user login in iframe'
        ],
        recommended: false
      }
    ],
    stepByStepPlaybook: [
      'Use a dedicated folder on Google Drive: `LearnBetter_Staging/`.',
      'When on iPhone/iPad: Save ChatGPT voice transcripts, NotebookLM podcasts, and quick audio memos into `LearnBetter_Staging/`.',
      'When on Windows Desktop: Open Drive, drag the media files into GitHub Releases, and copy the markdown text into `/external_models/chatgpt/`.',
      'This keeps your production repository pristine and avoids mobile friction!'
    ]
  },
  {
    id: 'cross-device-multi-ai',
    title: 'Operating in a World of Multiple Devices & AI Providers',
    badge: 'Ecosystem Playbook',
    question: 'How to best work in a world of multiple input/output devices (iPad, Desktop Windows, iPhone) and AI providers (Gemini, Claude, ChatGPT, Kiro)?',
    verdict: 'Assign each device and model to its distinct superpower, unified through a single contract-first knowledge hub.',
    comparison: [
      {
        approach: 'Asymmetric Specialization (The Master Vibe-Coder Model)',
        pros: [
          'iPhone: Human-cadence voice synthesis (ChatGPT voice is 10x more natural than browser speech), instant audio transcription on the go',
          'iPad: Fluid visual thinking, word clouds, cluster allocation, reviewing code & tests from the couch',
          'Windows Desktop: Heavy execution, OBS recording, screen OCR, multi-file Kiro/Claude refactoring',
          'Gemini in AI Studio: Massive 1M+ token context, full-stack live container, instant deployment, server-side automation'
        ],
        cons: ['Requires clear division of responsibilities'],
        recommended: true
      }
    ],
    stepByStepPlaybook: [
      '1. Ideation & Voice Phase (iPhone): Speak freely into ChatGPT Voice Mode to brainstorm a new cluster or analyze a video. Ask ChatGPT: "Summarize this into 3 actionable rules and 5 study questions".',
      '2. Audio Synthesis Phase (iPhone/NotebookLM): Export the audio or generate a NotebookLM 2-host deep dive. Save to Drive or GitHub Releases.',
      '3. Heavy Development Phase (Desktop Windows): Use Claude or Kiro to write complex local scripts (e.g. YouTube scrapers) into `/lessons_Claude/` or `/scripts/`. Test locally with mouse and screenshots.',
      '4. Synthesis & Integration Phase (iPad in AI Studio): Use Gemini here to weave all code, playlists, and audio into `learn-better`. Deploy and review anytime from any device!'
    ]
  }
];
