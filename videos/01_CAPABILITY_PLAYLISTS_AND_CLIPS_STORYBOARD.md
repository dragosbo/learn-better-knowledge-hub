# Capability 01 Video Storyboard: Playlists & Clips Management
## The Scalable Content Foundation for Multi-AI Learning

- **Module ID**: `cap-01`
- **Corresponding Deck**: `decks/01_CAPABILITY_PLAYLISTS_AND_CLIPS.html`
- **Target Video Duration**: 4 minutes 30 seconds (270 seconds)
- **Target Audience**: Human Learners, Vibe Coders & Technical Curators
- **Recording Tools Recommended**: OBS Studio (1080p60 or 4K30), AirPods / Dynamic USB Mic

---

## Technical Setup & OBS Directives

| Parameter | Recommended Setting |
|---|---|
| **Canvas Resolution** | 1920 × 1080 (16:9) |
| **Capture Source** | Browser Window (`decks/01_CAPABILITY_PLAYLISTS_AND_CLIPS.html` or live app on `0.0.0.0:3000`) |
| **Audio Bitrate** | 192 kbps AAC |
| **Cursor Capture** | Enabled with subtle yellow highlight ring |
| **Presentation Hotkeys** | `Right Arrow` (Next Slide), `Left Arrow` (Prev Slide), `Space` (Toggle Web Speech Narration), `F` (Fullscreen) |

---

## Scene-by-Scene Storyboard & Narration Script

### Scene 1: The YouTube Playlist Sprawl Challenge
- **Timestamp**: `00:00 - 00:35` (Duration: 35s)
- **Visual Cue**: 
  - Slide 1 transitions to Slide 2.
  - Split-screen comparison graphic: On the left, a chaotic endless YouTube playlist page with missing search and hidden continuation items; on the right, the clean, categorized Learn Better application interface.
- **On-Screen Text**: *"From 70 Scattered Playlists to One Structured Knowledge Engine"*
- **Spoken Narration (Voiceover / Web Speech)**:
  > *"Welcome to Capability 01 of the Learn Better platform: Playlists and Clips Management. If you have ever curated dozens of YouTube playlists over months or years, you know the frustration: YouTube buries items behind continuation tokens, limits cross-playlist search, and provides zero structured note-taking. In this video, we explore how Learn Better ingests 70 distinct playlists and 486 video clips into a high-performance, domain-categorized learning foundation."*

---

### Scene 2: Architectural Anatomy & Data Contracts
- **Timestamp**: `00:35 - 01:25` (Duration: 50s)
- **Visual Cue**:
  - Slide 3. Diagram highlighting the data flow:
  - `YouTube Innertube Continuation API` ──> `src/data/channelPlaylists.json` ──> `server.ts (/api/content/playlists)` ──> `PlaylistManager.tsx`.
  - Code callout highlighting the TypeScript contracts: `YouTubeClip` and `Playlist`.
- **On-Screen Text**: *"Contract-First Architecture: Universal JSON Persistence"*
- **Spoken Narration**:
  > *"Architecturally, this capability is grounded in a contract-first design. We avoid brittle ad-hoc scraping by utilizing a normalized data model: each `Playlist` carries an ID, title, and domain category, hosting an array of `YouTubeClip` records. Each clip maintains an immutable YouTube ID, title, extracted duration, timestamp, notes, user questions, and study status. The entire catalog is persisted locally in `channelPlaylists.json`, meaning the application functions at lightning speed with zero external API latency."*

---

### Scene 3: The 5 Learning Domains & Rapid Search
- **Timestamp**: `01:25 - 02:20` (Duration: 55s)
- **Visual Cue**:
  - Slide 4 & live application capture on the `Playlists & Clips` tab.
  - Mouse hovers over the 5 colored category tabs: Cyan for *AI & Machine Learning*, Emerald for *Engineering & Code*, Amber for *Science & Math*, Purple for *Knowledge & Notes*, and Rose for *Lifestyle & General*.
  - Demonstrator types *"Fridman"* or *"Kellis"* into the search input; grid filters instantly across 486 items with zero lag.
- **On-Screen Text**: *"Instant 5-Domain Taxonomy & Client-Side Filtering"*
- **Spoken Narration**:
  > *"When dealing with nearly 500 clips, infinite scrolling is an anti-pattern. We organized the 70 playlists into five intuitive learning domains. Selecting a domain immediately filters the catalog. Notice the search bar: it performs sub-millisecond, multi-token fuzzy matching across titles, playlist names, and personal notes. You can also jump directly to any specific playlist using the searchable dropdown combobox."*

---

### Scene 4: Clip Lifecycle & Study Status Transition
- **Timestamp**: `02:20 - 03:15` (Duration: 55s)
- **Visual Cue**:
  - Slide 5 & live interaction.
  - Mouse clicks on a clip's status pill: transitioning from grey (`To Watch`) to blue (`Watching`), emerald (`Reviewed`), and violet (`Synthesized`).
  - Demonstrator clicks the "Notes" button on a clip, opening the quick notes drawer and entering key takeaways.
- **On-Screen Text**: *"Progressive Study Workflow: From Ingestion to Synthesis"*
- **Spoken Narration**:
  > *"A curated video is only valuable if it leads to retention. Every clip features a four-stage study lifecycle: To Watch, Watching, Reviewed, and Synthesized. As you study, updating this status immediately updates global counts across the navbar and persists to localStorage and the server. Clicking 'Study in KnowledgeHub' teleports the clip directly into the rich notes editor, while 'Study in Video Cosmos' centers the 3D starfield on its exact celestial node."*

---

### Scene 5: Live YouTube Synchronization Pipeline
- **Timestamp**: `03:15 - 03:55` (Duration: 40s)
- **Visual Cue**:
  - Slide 6. Visual flow showing the "Sync with YouTube" button action.
  - Backend route `/api/content/sync-youtube` firing continuation tokens to pull newly added videos without overwriting user notes or statuses.
- **On-Screen Text**: *"Resilient Innertube Sync: Never Lose Notes on Refresh"*
- **Spoken Narration**:
  > *"What happens when you add new videos to your YouTube channel? The 'Sync with YouTube' button triggers a server-side continuation crawler against channel `@dragosborosgpt`. Crucially, the sync pipeline performs a non-destructive merge: newly discovered clips are appended, but existing user notes, personal questions, and study statuses are preserved with zero mutation."*

---

### Scene 6: Key Takeaways & The Hemingway Bridge to Deck 02
- **Timestamp**: `03:55 - 04:30` (Duration: 35s)
- **Visual Cue**:
  - Slide 7. Summary cards with checkmarks.
  - Teaser graphic for Capability 02: The 71-to-28 Restructure Plan with cluster matrix table.
- **On-Screen Text**: *"Up Next: Capability 02 — Allocation & Restructure Hub (71➔28 Plan)"*
- **Spoken Narration**:
  > *"To recap: Capability 01 transforms raw YouTube playlists into a structured, searchable, and annotated knowledge database. But having 71 scattered playlists is still cognitively demanding. In our next video and slide deck, Capability 02, we explore the Allocation and Restructure Hub, which algorithmically maps these 71 playlists into 28 balanced thematic master clusters. You can open Deck 01 right now in your browser to explore the interactive slides and listen to the audio narration. See you in Episode 02!"*

---

## Production Checklist for Recording

- [ ] Open `decks/01_CAPABILITY_PLAYLISTS_AND_CLIPS.html` in browser.
- [ ] Set browser window to 1080p (or fullscreen via `F`).
- [ ] Test audio voice synthesis (click speaker icon on top-right).
- [ ] Have sample playlist "Intelligence & Genetics" ready for live demo.
- [ ] Record in single take using the timestamp milestones above.
