# Video Storyboard: Capability 11 — Python Code Viewer & Ingestion Engine

**Document Type:** Video Production & OBS Recording Script  
**Capability:** 11 — Python Code Viewer & Autonomous Ingestion Engine  
**Target Duration:** 4 minutes 30 seconds  
**Format:** 1080p 60fps / 4K 16:9 • Dark Slate Studio Aesthetic (`#020617` / `#0f172a` / `#065f46`)  
**Host Persona:** Principal Backend Systems Engineer & Ingestion Pipeline Architect  
**Companion Artifacts:**  
- Interactive Slide Deck: `decks/11_CAPABILITY_PYTHON_CODE_VIEWER.html`  
- Interactive Video Hub Simulator: `videos/11_CAPABILITY_PYTHON_CODE_VIEWER_VIDEO.html`  
- Frontend Component: `src/components/PythonCodeViewer.tsx` (726 lines)  
- Syntax Highlighter: `src/components/PythonSyntaxHighlighter.tsx`  
- Static/Dynamic AST Dataset: `src/data/pythonFiles.ts` & `/api/python-files`  

---

## Production Overview & Pacing Schedule

| Scene # | Scene Title | Timecode | Screen Action & Camera Angle | Primary Audio Narration & Script |
|---|---|---|---|---|
| **01** | The Engine Room Behind the React UI | `0:00 - 0:45` (45s) | Direct to camera; split screen showing animated React SPA on iPad transitioning to the terminal running `python code/read_channel.py`. | *"Behind every responsive web application is an engine room. In Capability 11, we explore our Python processing backbone: an in-app AST code inspector and syntax workspace for all 15 operational backend modules."* |
| **02** | 15 Operational Modules & 6 Domains | `0:45 - 1:35` (50s) | Screencast traversing `PythonCodeViewer.tsx` collapsible category tree on the left column. | *"From playlist scraping in `read_channel.py` to Whisper speech-to-text, D3 keyword frequency matrices, and our core shared library in `lib/youtube.py`, every single script is documented and executable."* |
| **03** | React 19 AST Inspector & Regex Tokenizer | `1:35 - 2:25` (50s) | Close-up on the 3-column layout: TOC, code view with syntax coloring, and the AST drawer showing function signatures and CLI recipes. | *"Our custom AST analyzer extracts docstrings, function contracts, and dependencies without heavy external libraries. Developers can copy exact terminal commands with one click."* |
| **04** | Zero-Quota Ingestion & Network Resilience | `2:25 - 3:15` (50s) | Animated architectural pipeline showing flat-playlist traversal, WebVTT cue stripping, and `lib/net.py` cookie auto-detection. | *"How do we ingest 70 playlists without exhausting Google API quotas? `yt-dlp` flat traversal, automatic cookie detection, and proxy isolation keep our ingestion immune to bot challenges and network blocks."* |
| **05** | iPad Touch, Vector Print & Bridge to Git | `3:15 - 4:30` (75s) | Live demonstration on iPad Safari with kinetic touch scrolling, clean white-paper Cmd+P print preview, and bridge roadmap to Deck 12. | *"Capability 11 is built for developers on the go. 11 of 15 capabilities are now verified. Exactly 4 remain. Up next: Capability 12, our Safe GitHub Sync Protocol!"* |

---

## Detailed Scene Production Scripts

### Scene 1: The Engine Room Behind the React UI (0:00 - 0:45)
**Visual Setup:**  
Dark slate studio setting. The host welcomes viewers while the screen transitions from the Learn Better visual dashboard to a split view of raw terminal execution and the in-app Python Code Viewer.

**Narration Script:**  
> "Welcome back to the Learn Better Systems series. Today we dive into Chapter 5 with Capability 11: Python Code Viewer and Autonomous Ingestion Engine.
> 
> "Modern web apps often hide their backend mechanics behind black boxes. But in the Learn Better ecosystem, developer transparency is a primary architectural pillar. Behind our interactive React 19 UI is a collection of 15 battle-tested Python scripts handling YouTube ingestion, Whisper transcription, audio re-encoding, and NLP summarization.
> 
> "Capability 11 brings that entire engine room directly into the application, giving you an interactive, syntax-highlighted code inspector with full AST metadata."

---

### Scene 2: The 15 Operational Modules & 6 Domains (0:45 - 1:35)
**Visual Setup:**  
Live capture of `src/components/PythonCodeViewer.tsx`. The cursor expands each category accordion in the left-hand navigation rail.

**Narration Script:**  
> "Our Python codebase is organized into six functional domains following the 'Thin Entry Point' design pattern.
> 
> "First, Ingestion and Playlists: `read_channel.py`, `list_playlists.py`, and `read_transcript.py`. Second, Audio and Transcription: `transcribe_audio.py` for Whisper AI models, `compare_transcripts.py` for diff analysis, and `reencode_audio.py` for high-efficiency MP3 conversion.
> 
> "Third, Speech and Synthesis with `generate_speech.py`. Fourth, NLP Summarization with `make_summaries.py`. Fifth, Visual Analytics with `make_wordcloud.py`. And sixth, our core shared library in `lib/`, featuring `youtube.py`, `net.py`, `paths.py`, and `textutil.py`.
> 
> "Each entry script stays under 150 lines, cleanly delegating low-level mechanics to reusable modules."

---

### Scene 3: React 19 AST Inspector & Regex Tokenizer (1:35 - 2:25)
**Visual Setup:**  
Screen focus on the code editor. Clicking line numbers to toggle highlights, toggling the line wrap button, and expanding the AST metadata drawer on the right side.

**Narration Script:**  
> "Let's inspect how the viewer works under the hood. In `src/components/PythonCodeViewer.tsx`, we implement a three-column workspace.
> 
> "In the center, our custom `PythonSyntaxHighlighter` uses regex tokenization to color Python keywords, function names, docstrings, and decorators with zero external bundle bloat. You can toggle line wrapping, click any line number to highlight critical blocks, and download the raw `.py` file.
> 
> "On the right, our AST metadata drawer automatically parses input-output contracts, dependency graphs, and exact terminal CLI recipes with a one-click copy button. It even displays 'vibe coding' refactoring notes detailing each script's engineering lineage."

---

### Scene 4: Zero-Quota Ingestion & Network Resilience (2:25 - 3:15)
**Visual Setup:**  
Animated graphic showing the `yt-dlp` flat-playlist extraction flow, cookie detection, and subtitle cue stripping.

**Narration Script:**  
> "A core strength of our Python backend is zero-API-key ingestion. Official YouTube Data API keys enforce a 10,000-unit daily quota—scraping 70 playlists would burn that in minutes.
> 
> "Instead, `lib/youtube.py` leverages `yt-dlp`'s `extract_flat` mode to parse channel tabs and playlist collections in milliseconds. It extracts raw WebVTT caption streams, strips timestamps and cue headers, and saves pure, readable text transcripts.
> 
> "Furthermore, our `lib/net.py` module solves corporate proxy and anti-bot challenges. It automatically detects exported cookies, rotates user agents, and unsets conflicting system proxy environment variables with `apply_no_proxy_env()`."

---

### Scene 5: iPad Touch, Vector Print & Bridge to Git (3:15 - 4:30)
**Visual Setup:**  
Switching to an iPad Pro running Safari. Demonstrating fluid touch gestures, selecting scripts, and triggering Print Preview to show clean white-paper formatting. Then displaying the 15-capability roadmap with 11 checked off.

**Narration Script:**  
> "Like every capability in Learn Better, the Python Code Viewer is first-class on iPadOS Safari. It features 44-pixel touch targets, kinetic momentum scrolling, and responsive layout folding.
> 
> "And when you need offline study sheets, pressing Command+P triggers our custom vector print stylesheet—stripping dark mode backgrounds to produce crisp, ink-efficient printouts with clean line numbers.
> 
> "With Capability 11 verified, eleven of our fifteen core capabilities are now complete. That leaves exactly four remaining modules in Chapter 5.
> 
> "Join us in our next session as we tackle Capability 12: our Safe GitHub Sync Protocol for merging multi-AI monorepo changes. See you across the bridge!"

---

## Technical Prompts & Direct Execution Commands

```bash
# Ingest entire playlist without API key
python code/read_channel.py --playlist-id PLsWyhklHwjExuXrXjJktcdYkCFL0PNdW7

# List all channel playlists with video counts
python code/list_playlists.py --channel @dragosborosgpt --save-json data/playlists.json

# Transcribe audio with Whisper AI
python code/transcribe_audio.py --model medium.en --audio data/audio/sample.mp3

# Generate D3 keyword frequency data
python code/make_wordcloud.py --input data/transcripts/
```
