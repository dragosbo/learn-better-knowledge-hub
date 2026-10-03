import { LessonItem } from '../types';

export const DEFAULT_CLAUDE_LESSONS: LessonItem[] = [
  {
    id: 'claude-01_first_contact.md',
    series: 'Claude',
    filename: '01_first_contact.md',
    title: 'Lesson 01: First Contact & Orientation',
    content: `# Lesson 01: First Contact & Orientation

## Goal
Establish a reliable collaboration routine with your AI assistant. Master prompt formulation, coherent technical explanations, and re-orienting the assistant when context is lost or after a restart.

## AI Tasks
- Long-form architectural explanation
- Context restoration protocol
- Error recovery guidance

## Key Concepts
1. **The Re-Orient Prompt**: Always begin fresh sessions with project boundaries and rules.
2. **Deterministic Responses**: Request clear, concise explanations without conversational filler.
3. **Recovery Routine**: When the assistant stalls, verify file integrity before retrying.

\`\`\`bash
# Verification
echo "Verifying environment setup"
python3 --version
\`\`\`
`
  },
  {
    id: 'claude-02_project_scaffold.md',
    series: 'Claude',
    filename: '02_project_scaffold.md',
    title: 'Lesson 02: Project Scaffold & Boundaries',
    content: `# Lesson 02: Project Scaffold & Boundaries

## Goal
Establish clear directory boundaries, configure \`.gitignore\` to protect raw data and API credentials, and author the initial \`README.md\` and \`plan.md\` before writing code.

## AI Tasks
- Multi-file repository scaffolding
- Git configuration and ignore rules
- Initial documentation drafting

## Directory Layout
\`\`\`text
learn-better/
├── data/
│   ├── raw_audio/
│   └── generated_transcripts/
├── lib/
├── scripts/
└── .gitignore
\`\`\`
`
  },
  {
    id: 'claude-03_environment_setup.md',
    series: 'Claude',
    filename: '03_environment_setup.md',
    title: 'Lesson 03: Environment Setup & lib/paths.py',
    content: `# Lesson 03: Environment Setup & lib/paths.py

## Goal
Configure a reproducible Python 3.12 environment with conda or venv, install ffmpeg binaries, and author a centralized \`lib/paths.py\` to eliminate hardcoded path errors across platforms.

## AI Tasks
- Dependency pinning (\`requirements.txt\`)
- System path isolation
- Binary path verification (ffmpeg)

\`\`\`python
# lib/paths.py pattern
from pathlib import Path
REPO_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = REPO_ROOT / "data"
\`\`\`
`
  },
  {
    id: 'claude-04_first_script.md',
    series: 'Claude',
    filename: '04_first_script.md',
    title: 'Lesson 04: First Working Script & Diagnostic Loop',
    content: `# Lesson 04: First Working Script & Diagnostic Loop

## Goal
Write \`list_playlists.py\` to inspect YouTube channels, create the first single-key runner shortcut (\`p.bat\` / \`p.sh\`), and practice the iterative "observe, diagnose, fix" cycle with the AI assistant.

## AI Tasks
- Script authoring with error handling
- CLI runner shortcut creation
- Iterative debugging from terminal stack traces

\`\`\`bash
# Runner shortcut execution
./scripts/p.sh
\`\`\`
`
  },
  {
    id: 'claude-05_audio_and_transcripts.md',
    series: 'Claude',
    filename: '05_audio_and_transcripts.md',
    title: 'Lesson 05: Audio & Transcript Pipeline Ingestion',
    content: `# Lesson 05: Audio & Transcript Pipeline Ingestion

## Goal
Author \`read_channel.py\` and \`read_transcript.py\` driven by \`config_transcribe.json\`, implementing rate-limiting, error logging, and single-key runners (\`r\` and \`t\`).

## AI Tasks
- Config-driven batch processing
- Network error recovery and retry loops
- Media stream extraction via yt-dlp
`
  },
  {
    id: 'claude-06_whisper_transcription.md',
    series: 'Claude',
    filename: '06_whisper_transcription.md',
    title: 'Lesson 06: Local Whisper Speech-to-Text',
    content: `# Lesson 06: Local Whisper Speech-to-Text

## Goal
Deploy local GPU/CPU speech-to-text with \`faster-whisper\` via \`transcribe_audio.py\`, producing timestamped transcript artifacts under \`data/generated_transcripts/\`.

## AI Tasks
- Machine learning model configuration (int8 quantization)
- Batch transcription processing
- Quality comparison against YouTube captions
`
  },
  {
    id: 'claude-07_runners_and_automation.md',
    series: 'Claude',
    filename: '07_runners_and_automation.md',
    title: 'Lesson 07: Runners, Automation & Quality Benchmarking',
    content: `# Lesson 07: Runners, Automation & Quality Benchmarking

## Goal
Establish a unified root PATH environment via \`init.bat\` / \`init.sh\`, and write \`compare_transcripts.py\` to score transcription word-error rates (WER).

## AI Tasks
- PATH environment configuration
- Levenshtein distance benchmarking
- CLI runner suite consolidation
`
  },
  {
    id: 'claude-08_summaries_and_wordclouds.md',
    series: 'Claude',
    filename: '08_summaries_and_wordclouds.md',
    title: 'Lesson 08: Summaries, Word Clouds & AI as Author',
    content: `# Lesson 08: Summaries, Word Clouds & AI as Author

## Goal
Author \`make_summaries.py\` and \`make_wordcloud.py\` with stopword filtering in \`lib/textutil.py\`. Treat the AI coding assistant as an author producing executive briefing dossiers.

## AI Tasks
- Natural language tokenization
- HTML visual generation
- Markdown summary synthesis
`
  },
  {
    id: 'claude-09_tts_and_full_pipeline.md',
    series: 'Claude',
    filename: '09_tts_and_full_pipeline.md',
    title: 'Lesson 09: TTS Synthesis & End-to-End Pipeline',
    content: `# Lesson 09: TTS Synthesis & End-to-End Pipeline

## Goal
Integrate Piper neural text-to-speech via \`generate_speech.py\`, author audio re-encoding utilities, and execute the full ingest-to-narration pipeline in a single automated command.

## AI Tasks
- Synthetic voice pipeline integration
- Audio bitrate and format standardization
- Full pipeline orchestration
`
  },
  {
    id: 'claude-10_deployment_and_handoff.md',
    series: 'Claude',
    filename: '10_deployment_and_handoff.md',
    title: 'Lesson 10: Deployment, CI & Project Handoff',
    content: `# Lesson 10: Deployment, CI & Project Handoff

## Goal
Package the complete system into a standalone Dockerfile, configure VS Code devcontainers, set up GitHub Actions CI, create a Google Colab notebook, and finalize project handoff.

## AI Tasks
- Containerization (\`Dockerfile.standalone\`)
- CI workflow creation (\`.github/workflows/ci.yml\`)
- Cloud notebook deployment (\`colab_setup.ipynb\`)
`
  }
];

export const DEFAULT_KIRO_LESSONS: LessonItem[] = [
  {
    id: 'kiro-01_first_contact_and_setup.md',
    series: 'Kiro',
    filename: '01_first_contact_and_setup.md',
    title: 'Lesson 01: First Contact + Minimal Setup',
    content: `# Lesson 01: First Contact + Minimal Setup

## Goal
Spin up an empty repository with lightweight Python 3.12 and terminal validation in under 30 minutes.

## AI Tasks
- Lightweight CLI orientation
- Terminal command validation
`
  },
  {
    id: 'kiro-02_first_working_tool.md',
    series: 'Kiro',
    filename: '02_first_working_tool.md',
    title: 'Lesson 02: Early Win Working Script',
    content: `# Lesson 02: Early Win Working Script

## Goal
Build a zero-API-key script that downloads a YouTube video's audio stream and transcript in under 45 minutes.

## AI Tasks
- Fast script prototyping
- Handling network exceptions
`
  },
  {
    id: 'kiro-03_environment_done_right.md',
    series: 'Kiro',
    filename: '03_environment_done_right.md',
    title: 'Lesson 03: Environment Done Right',
    content: `# Lesson 03: Environment Done Right

## Goal
Harden virtual environments, write clean requirements, and create \`lib/paths.py\` for reliable cross-platform execution.

## AI Tasks
- Requirements freezing
- Centralized path constants
`
  },
  {
    id: 'kiro-04_playlists_and_transcripts.md',
    series: 'Kiro',
    filename: '04_playlists_and_transcripts.md',
    title: 'Lesson 04: Config-Driven Playlists & Transcripts',
    content: `# Lesson 04: Config-Driven Playlists & Transcripts

## Goal
Automate channel scanning and transcript extraction using clean JSON configuration files and runner shortcuts.

## AI Tasks
- JSON schema validation
- Batch runner scripts
`
  },
  {
    id: 'kiro-05_whisper_transcription.md',
    series: 'Kiro',
    filename: '05_whisper_transcription.md',
    title: 'Lesson 05: Local Whisper Transcription',
    content: `# Lesson 05: Local Whisper Transcription

## Goal
Transcribe offline audio with \`faster-whisper\`, saving structured text and segment timestamps locally.

## AI Tasks
- Model size optimization
- Timestamped transcription parsing
`
  },
  {
    id: 'kiro-06_runners_and_lib.md',
    series: 'Kiro',
    filename: '06_runners_and_lib.md',
    title: 'Lesson 06: Runners, PATH & Reusable lib/',
    content: `# Lesson 06: Runners, PATH & Reusable lib/

## Goal
Consolidate repeated helper code into \`lib/textutil.py\` and \`lib/net.py\`, and inject shortcuts into system PATH via \`init.bat\`.

## AI Tasks
- Code refactoring into modules
- Shell environment configuration
`
  },
  {
    id: 'kiro-07_summaries_and_wordclouds.md',
    series: 'Kiro',
    filename: '07_summaries_and_wordclouds.md',
    title: 'Lesson 07: Summaries + Word Clouds (AI as Author)',
    content: `# Lesson 07: Summaries + Word Clouds (AI as Author)

## Goal
Build automated summarizers and visual word clouds with stopword frequency pruning.

## AI Tasks
- NLP frequency counting
- HTML cloud visualization
`
  },
  {
    id: 'kiro-08_tts_and_full_pipeline.md',
    series: 'Kiro',
    filename: '08_tts_and_full_pipeline.md',
    title: 'Lesson 08: TTS + Full Pipeline Polish',
    content: `# Lesson 08: TTS + Full Pipeline Polish

## Goal
Wire Piper neural voice synthesis into the workflow to convert study summaries into narrated MP3 podcasts.

## AI Tasks
- Audio normalization and encoding
- Full automated test run
`
  },
  {
    id: 'kiro-09_deploy_ci_handoff.md',
    series: 'Kiro',
    filename: '09_deploy_ci_handoff.md',
    title: 'Lesson 09: Deploy, CI & Final Handoff',
    content: `# Lesson 09: Deploy, CI & Final Handoff

## Goal
Lock down containerized deployment with Docker and automated GitHub Actions verification.

## AI Tasks
- CI workflow verification
- Final repo handoff
`
  }
];
