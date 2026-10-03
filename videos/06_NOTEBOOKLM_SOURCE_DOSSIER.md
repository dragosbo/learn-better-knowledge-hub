# Google NotebookLM Source Dossier: Learn Better — Capability 06 (AI Coding Academy)
## Deep-Dive Technical Briefing & Audio Overview Source Material

*Instructions for Google NotebookLM:*
*1. Visit https://notebooklm.google.com and create a new notebook: "Learn Better: AI Coding Academy & Vibe Coding Mastery".*
*2. Add this markdown text document as a Source.*
*3. In the Notebook Guide sidebar, click "Generate Audio Overview" (or "Deep Dive Conversation") to produce an engaging podcast discussion between the two AI hosts.*
*4. Export the resulting audio/video and load it into the Learn Better Video Hub (`/videos/06_CAPABILITY_AI_CODING_ACADEMY_VIDEO.html`).*

---

## 1. Executive Summary: The AI Pair Programming Revolution & The Developer Paradox

The emergence of Large Language Model coding agents (Claude 3.7 Sonnet, Gemini 2.5 Flash / Pro, Cursor, Kiro, Codex) has fundamentally disrupted software engineering. Yet, 90% of developers fall into the **Vibe Coding Pitfall**:
- **Unstructured Prompting**: Asking an AI to "build me an app" with no schemas, no boundary constraints, and no acceptance criteria.
- **Context Rot & Token Bankruptcy**: Pasting entire monolithic files into context windows until models hallucinate, overwrite unrelated modules, and hit token rate limits.
- **Verification Paralysis**: Trusting code without running deterministic compilation or linting commands, resulting in silent runtime breakage.

**Capability 06 of `learn-better`** provides the complete pedagogical antidote: the **AI Coding Academy**, an interactive 19-lesson dual-track curriculum plus a Gemini Vibe Coding Masterclass that teaches engineers how to steer, constrain, and verify autonomous AI agents from an empty directory to production deployment.

---

## 2. The Dual-Track Curriculum Architecture

Rather than treating AI assistance as a monolithic autocomplete feature, the curriculum separates software creation into two complementary engineering dialects:

### Track A: The Claude Series — Top-Down Architectural Specification (10 Lessons)
Framed around *system architecture, contract-first design, and deployment*, Claude leads the learner through structured milestones:
1. **Lesson 01 (First Contact)**: Prompt formulation, coherent technical explanations, and re-orienting an AI when context is reset.
2. **Lesson 02 (Project Scaffold)**: Folder boundaries, `.gitignore` isolation, initial `README.md`, and clean GitHub repository initialization.
3. **Lesson 03 (Environment Setup)**: Reproducible Python 3.12 environment, dependency pinning, ffmpeg binaries, and centralized path management via `lib/paths.py`.
4. **Lesson 04 (First Working Script)**: Building `list_playlists.py` with single-key runner shortcuts (`p.bat` / `p.sh`) and mastering the "iterate and fix" error diagnostic loop.
5. **Lesson 05 (Audio & Transcripts)**: Ingesting media streams with `read_channel.py` and `read_transcript.py`, anchored by declarative `config_transcribe.json`.
6. **Lesson 06 (Local Whisper Transcription)**: GPU/CPU-accelerated speech-to-text with `faster-whisper`, generating deterministic artifacts under `data/generated_transcripts/`.
7. **Lesson 07 (Runners & Automation)**: Establishing unified root PATH aliases (`init.bat` / `init.sh`), and authoring `compare_transcripts.py` for automated quality benchmarking.
8. **Lesson 08 (Summaries & Word Clouds)**: NLP tokenization, frequency-weighted stopword filtering, `lib/textutil.py`, and treating the AI as an autonomous technical author.
9. **Lesson 09 (TTS & End-to-End Pipeline)**: Voice synthesis via Piper TTS, audio re-encoding, `lib/net.py` network abstractions, and running the complete data pipeline end-to-end.
10. **Lesson 10 (Deployment & Handoff)**: Dockerfile standalone builds, devcontainers, GitHub Actions CI validation, Google Colab notebooks, and production documentation handoff.

### Track B: The Kiro Series — Bottom-Up Iterative Scripting & Automation (9 Lessons)
Framed around *rapid terminal velocity, local tool execution, and modular refactoring*, Kiro delivers rapid tactical wins:
1. **Lesson 01 (First Contact + Minimal Setup)**: Spin up an empty repository with lightweight Python 3.12 and terminal validation.
2. **Lesson 02 (Early Win Script)**: Authoring a zero-API-key script downloading audio and transcripts within 45 minutes.
3. **Lesson 03 (Environment Done Right)**: Hardening virtual environments, requirements pinning, and cross-platform path portability.
4. **Lesson 04 (Playlists & Transcripts)**: Config-driven ingestion loops with batch status tracking and error recovery.
5. **Lesson 05 (Whisper Transcription)**: Local automated transcription with beam search decoding and timestamp segmentation.
6. **Lesson 06 (Runners & Reusable `lib/`)**: Refactoring one-off scripts into reusable library modules (`lib/textutil.py`, `lib/net.py`) and PATH aliases.
7. **Lesson 07 (Summaries & Word Clouds)**: Generating interactive HTML reports, concept mind maps, and markdown briefing dossiers.
8. **Lesson 08 (TTS & Pipeline Polish)**: Integrating client and server speech synthesis with organized directory structures.
9. **Lesson 09 (Deploy, CI & Handoff)**: Containerized deployment, continuous integration checks, and long-term project maintainability.

---

## 3. The 4 Laws of Vibe Coding (Gemini Masterclass)

The Academy codifies four strict engineering laws that transform unpredictable AI prompting into reliable software output:

### Law 1: The Contract-First Principle
Never prompt an AI with "build me an app" or "write a feature." Always define:
- Inputs: Explicit types, schemas, and file sources.
- Outputs: Deterministic JSON or Markdown schemas.
- Boundaries: Dedicated experiment directories (e.g., `/webapp/`) to prevent overwriting stable core files.

### Law 2: Context Window Conservation & Daily Free Quotas
Never paste 2,000 lines of code into a prompt. Reference exact file paths and line ranges (`src/services/api.ts:85-115`). Break large tasks into single-outcome micro-sprints to operate entirely within free daily token tiers.

### Law 3: Multi-AI Specialization Matrix
Leverage the distinct cognitive sweet spots of each model:
- **Kiro / CLI Agents**: Fast bash/powershell scripting, local file manipulation, and package management.
- **Claude**: Deep algorithmic architecture, pedagogical tutorials, and markdown documentation.
- **Gemini 2.5 Flash / Pro**: Ultra-fast front-end synthesis, real-time multimodal processing, and massive context cross-referencing.

### Law 4: The Deterministic Verification Gate
Every prompt must conclude with an executable verification step:
`"Run npm run build and npm run lint, then report the exact exit code."`
Code is never accepted until the verification command succeeds with code 0.

---

## 4. Platform Implementation: Audio Player & Progress Engine

The Learn Better AI Coding Academy is implemented in React with:
- **Web Speech Narration**: Client-side speech synthesis with pause/resume, rate selection (0.8x, 1.0x, 1.25x), and live animated waveform bars.
- **Persistent Progress Tracking**: Lesson completion state saved across sessions via `localStorage` and synchronized with the backend.
- **Instant Copyable Prompts**: Pre-engineered prompts with one-click clipboard copying, syntax-highlighted code blocks, and clear expected terminal outputs.
- **Interactive Markdown Renderer**: Tabular formatting, terminal command blocks, and collapsible sections for smooth reading on desktop and mobile.

---

## 5. Host Dialogue Sparks for Google NotebookLM Audio Overview

When NotebookLM generates the 2-host audio overview, the hosts should explore:
1. **The Myth of the 10x Developer vs. The 10x Prompt Engineer**: How structuring prompts like technical contracts enables junior engineers to ship senior-grade systems.
2. **Claude's Architectural Rigor vs. Kiro's Terminal Velocity**: Why learning both top-down design and bottom-up scripting creates a complete full-stack engineer.
3. **The Anti-Slop Protocol**: Why automated verification commands and schema constraints prevent the common trap of bloated, broken AI-generated code.
4. **The Bridge to Audio Automation**: How mastering the AI Coding Academy prepares learners for Day 7's AirPods Audio Player and MediaSession remote controls.
