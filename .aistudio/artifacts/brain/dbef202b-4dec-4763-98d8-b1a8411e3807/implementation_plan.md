# Implementation Plan: Capability 1 NotebookLM Dossier & Video Player Hub

Create an optimized **NotebookLM Source Dossier Generator** and a **Dedicated Video Player Hub** for Capability 1 (Playlist Manager), enabling users to generate NotebookLM audio/video overviews and upload or stream them directly inside the Decks & Videos suite.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed:
> - **NotebookLM Strategy**: Since Google NotebookLM does not offer an external public API, generate a specialized, high-yield **NotebookLM Source Dossier** (`videos/01_NOTEBOOKLM_SOURCE_DOSSIER.md`) optimized for NotebookLM's deep-dive audio/video engine.
> - **Video Player Hub Location**: Build a **Dedicated Video Hub** inside the Decks and Videos suite (`videos/01_CAPABILITY_PLAYLIST_MANAGER_VIDEO.html`), accessible directly from `decks/00_SERIES_OVERVIEW_PLAYLIST.html`, the in-app navigation, and Deck 1.
> - **Dual Playback Modes**:
>   1. **Interactive Scene-by-Scene Simulator**: Out-of-the-box animated video simulator playing through the 5 storyboard scenes with synchronized Web Speech voiceover and visual cards.
>   2. **NotebookLM Media Uploader & Streamer**: Drag-and-drop or file picker allowing the user to upload their exported NotebookLM MP4/MP3 or paste an external URL, with automatic local persistence and synchronized transcript tracking.

---

## 1. System Architecture & Components

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 Capability 1 Video & NotebookLM Pipeline                    │
│                                                                             │
│  ┌─────────────────────────────────┐   Upload   ┌────────────────────────┐  │
│  │ videos/01_NOTEBOOKLM_DOSSIER.md │ ─────────> │ Google NotebookLM      │  │
│  │ (Curated source text & prompts) │            │ (notebooklm.google.com)│  │
│  └─────────────────────────────────┘            └───────────┬────────────┘  │
│                                                             │ Generate      │
│                                                             ▼ MP4 / MP3     │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ videos/01_CAPABILITY_PLAYLIST_MANAGER_VIDEO.html (Dedicated Video Hub)│  │
│  │                                                                       │  │
│  │  ├─ Mode A: Built-in Scene-by-Scene Video Simulator (Instant Play)    │  │
│  │  ├─ Mode B: NotebookLM Upload / URL Dropzone (IndexedDB Persistence)  │  │
│  │  ├─ Synchronized Transcript & Storyboard Cue Sheet Drawer             │  │
│  │  └─ 1-Click Copy Dossier for NotebookLM                              │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Deliverables Specification

### A. NotebookLM Source Dossier (`videos/01_NOTEBOOKLM_SOURCE_DOSSIER.md`)
- Formatted specifically to trigger high-engagement, pedagogical deep-dive podcasts when uploaded to NotebookLM:
  - **Persona & Context Header**: Defines the technical domain and learning goals of Learn Better.
  - **The Narrative Arc**: The journey from 70 chaotic YouTube playlists to a structured 5-domain knowledge engine.
  - **Technical Architecture**: Data models (`YouTubeClip`, `Playlist`), continuation scraping, and non-destructive sync.
  - **Discussion Questions for AI Hosts**: Targeted questions prompting the NotebookLM hosts to discuss why continuation token traps happen, why 5 domains work better than infinite scroll, and how zero-mutation guarantees protect user notes.
  - **Quick Copy Button & Download**: In-browser 1-click copy action for immediate pasting into NotebookLM.

### B. Dedicated Video Player Hub (`videos/01_CAPABILITY_PLAYLIST_MANAGER_VIDEO.html`)
- **Visual Design**: Dark-mode theater interface with 16:9 responsive video viewport, animated waveform audio spectrum, chapter scrubber, and synchronized transcript reader.
- **Playback Engine**:
  - **Mode 1: Automated Storyboard Simulator**:
    - Plays the 5 scenes from `videos/01_CAPABILITY_PLAYLISTS_AND_CLIPS_STORYBOARD.md` sequentially.
    - Synchronized visual slide transitions with animated zoom, focus highlights, and per-scene voice narration.
  - **Mode 2: User Video/Audio Player (NotebookLM Dropzone)**:
    - Drag-and-drop zone supporting `.mp4`, `.webm`, `.mp3`, `.wav`, and `.m4a` files.
    - URL input for streaming direct video links or YouTube embeds.
    - Persists uploaded media in browser `IndexedDB` (`learn_better_videos_v1`) so your video remains loaded on reload.
- **Synchronized Transcript & Cue Drawer**:
  - Displays the active timestamped scene, highlighting lines as speech progresses.
  - Allows clicking any scene timestamp (e.g. `01:25`) to jump the video directly to that chapter.

### C. Server Routes & Manifest Synchronization
- Update `server.ts` to route `/videos/capability-1` and `/videos/player` directly to the new video hub.
- Update `videos/00_SERIES_VIDEO_PLAYLIST.json` with the video player URL (`videos/01_CAPABILITY_PLAYLIST_MANAGER_VIDEO.html`) and dossier path.
- Add "Watch Video" buttons to `decks/00_SERIES_OVERVIEW_PLAYLIST.html` and `decks/01_CAPABILITY_PLAYLIST_MANAGER.html`.

---

## 3. Testing & Verification Protocol

1. **NotebookLM Dossier Test**:
   - Verify `videos/01_NOTEBOOKLM_SOURCE_DOSSIER.md` is accessible via HTTP and renders clean markdown with zero syntax errors.
2. **Video Simulator Test**:
   - Open `/videos/01_CAPABILITY_PLAYLIST_MANAGER_VIDEO.html` in browser.
   - Click "Play Video Simulation" to verify that Scene 1 transitions to Scene 2 with synchronized narration and chapter highlight.
3. **NotebookLM Uploader Test**:
   - Drag and drop a sample video/audio file into the dropzone to verify HTML5 `<video>` / `<audio>` playback and IndexedDB caching.
4. **Applet Compilation**:
   - Run `compile_applet` and `lint_applet` to confirm clean builds.
