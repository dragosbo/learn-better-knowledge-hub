# Architectural Suggestions & Future Capabilities for Learn Better

> **Document Version:** 1.0.0  
> **Last Updated:** 2026-09-10  
> **Target Repository:** `dragosbo/learn-better`  
> **Scope:** Evolution of the Personal Knowledge Hub, Multi-AI Collaboration, and Media Processing  

---

## 1. Executive Summary & Vision

The `learn-better` ecosystem bridges dense YouTube technical video content with structured personal comprehension. By integrating automated local transcription (Faster-Whisper), lightweight summarization, offline speech synthesis (Piper TTS), and multi-AI vibe coding, `learn-better` empowers individuals to build an enduring personal knowledge graph rather than passively consuming video feeds.

This document outlines high-leverage architectural capabilities and improvements proposed for subsequent development iterations.

---

## 2. Audio & AirPods Listening Evolution

### 2.1 Automated Lesson Podcast Generator (`scripts/build_podcasts.py`)
- **Capability:** An automated script that renders every markdown lesson in `lessons_Claude` and `lessons_Kiro` into an episodic MP3 podcast using your local Piper TTS engine (`en_US-lessac-medium` or `en_GB-southern_english_female-low`).
- **Chapter Markers:** Embed ID3v2 chapter marks corresponding to markdown headings (`#`, `##`) so you can jump between lesson sections using your AirPods stem controls.
- **Audio Intros & Outros:** Add subtle audio chimes between sections to separate code explanations from conceptual rules.

### 2.2 Unlisted YouTube Podcast Channel Workflow
- **Capability:** A batch rendering script (`scripts/export_to_youtube_video.py`) using `ffmpeg` or `moviepy` that combines:
  1. High-resolution typography slides generated from the lesson markdown.
  2. The synthesized Piper TTS audio track.
  3. Dynamic waveform or visual subtitle overlays.
- **Outcome:** Uploaded as an unlisted YouTube playlist. This enables native streaming on your phone with background audio, CarPlay, and immediate integration back into this web app's **Playlist & Clips Studio**.

### 2.3 Interactive Voice Q&A / Flashcard Quizzer
- **Capability:** Using the Web Speech Recognition API (`webkitSpeechRecognition`), allow the user to speak their answers to the self-test questions in the Knowledge Hub while walking or exercising with AirPods, with Gemini evaluating the answer vocally.

---

## 3. Knowledge Graph & Personal Synthesizer

### 3.1 Bi-Directional Obsidian Vault Synchronization
- **Capability:** Direct export or automatic symlink to your local Obsidian vault (`~/Documents/ObsidianVault/LearnBetter`).
- **Features:**
  - Automatic YAML frontmatter (`tags: [git, devops, ai-engineering]`, `date`, `source_url`, `status`).
  - Automatic Wikipedia-style backlinks (`[[Git Rebase]]`, `[[FastAPI Scaffolding]]`, `[[Whisper Transcription]]`).
  - Native Obsidian Callouts (`> [!NOTE]`, `> [!WARNING]`).

### 3.2 Automated Anki Spaced-Repetition Deck Export (`.apkg`)
- **Capability:** Convert the "Self-Reflection Questions" and "Comprehension Checks" generated in the Knowledge Hub into importable Anki flashcards via `genanki`.

### 3.3 Semantic Concept Clustering (Local Vector Search)
- **Capability:** Embed all transcripts and summaries using a small, local embedding model (e.g. `all-MiniLM-L6-v2` via ONNX runtime in Node or Python).
- **Features:**
  - Ask: *"What clips talked about fixing detached HEAD states in Git?"*
  - Instant semantic matching across all your YouTube transcripts with exact video timestamp links (`t=142s`).

---

## 4. Multi-AI Vibe Coding Architecture

### 4.1 "Three-Tier Agent Separation of Concerns"
To make vibe coding frictionless and avoid AI collisions, enforce strict domain boundaries:
1. **Tier 1 — Kiro (CLI & Local Runners):**
   - Pure Python command-line utilities: `download_audio.py`, `transcribe.py`, `generate_speech.py`, `clean_text.py`.
   - Runs locally in terminal or DevContainer without browser overhead.
2. **Tier 2 — Claude (Pedagogy & System Architecture):**
   - High-level curriculum design, step-by-step markdown tutorials, architectural specifications, and comprehensive code audits.
3. **Tier 3 — Gemini (Frontend & Knowledge Synthesis):**
   - Interactive React + TypeScript user interfaces, large-context synthesis (processing 50-page transcripts simultaneously), and instant audio-enabled dashboards.

### 4.2 Automated Prompt Testing & Regression Guardrails
- **Capability:** A GitHub Actions workflow (`.github/workflows/verify_apps.yml`) that:
  - Runs `npm run lint` and `npm run build` on `webapp/`.
  - Runs `python -m pytest tests/` on Python scripts in `code/`.
  - Verifies that new AI prompts did not alter legacy baseline files.

---

## 5. YouTube Playlist & Content Ingestion Enhancements

### 5.1 Real-Time Playlist Sync via YouTube Data API v3
- **Capability:** Connect via OAuth or API Key to automatically pull newly added videos from your personal playlists without manual copy-pasting.

### 5.2 Auto-Transcription Queue
- **Capability:** When a new video URL is pasted into the Playlist Studio:
  1. Trigger backend `yt-dlp` to download audio only (opus/m4a).
  2. Pipe audio through local Faster-Whisper.
  3. Generate summary markdown in `data/summaries/`.
  4. Notify the web frontend that new knowledge is ready for study and listening!

---

## 6. Legacy Tools Preservation

All legacy standalone tools created prior to this web application must remain fully operable:
- `youtube.html`: Standalone playlist browser.
- `claude_lessons_app.html`: Single-page interactive Claude lesson reader.
- `kiro_lessons_app.html`: Single-page interactive Kiro lesson reader.
- `wordcloud.html`: D3 dynamic keyword frequency cloud.

These legacy HTML applications are now accessible directly from the **Legacy Tools & Original Apps** navigation hub inside this modern web interface!
