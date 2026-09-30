# Learn Better Knowledge Hub — Complete User Guide & Manual

> **Comprehensive Guide to the Learn Better Platform**  
> *Manage YouTube Playlists, Extract Actionable Knowledge, Master Multi-AI Vibe Coding, and Listen On-Demand with AirPods.*

---

## 1. Introduction & Core Philosophy

**Learn Better** transforms passive video watching into an active, compound learning ecosystem. Instead of letting technical video tutorials accumulate in forgotten watchlists, this application empowers you to:
1. **Curate & Track**: Organize your YouTube learning playlists by tech stack, difficulty, and study status.
2. **Synthesize & Retain**: Review concise AI summaries, capture personal reflections, track unanswered questions, and brainstorm project prompts.
3. **Listen Anywhere**: Turn any lesson, summary, prompt log, or architectural playbook into an on-demand audio experience for your AirPods with native stem controls.
4. **Master Vibe Coding**: Study the pedagogical curriculums developed with Claude and Kiro, and use Gemini 2.5 to craft hardened, anti-pattern-free prompts.
5. **Preserve Legacy Assets**: Launch and explore the original standalone HTML applications (`youtube.html`, `claude_lessons_app.html`, `kiro_lessons_app.html`, `wordcloud.html`) directly inside this modern dashboard.

---

## 2. Navigating the Interface

The top navigation bar provides instant access to the five primary modules of the platform:

| Module Name | Icon | Purpose |
|---|---|---|
| **Playlists & Clips** | `PlaySquare` | Browse and manage playlists, search videos, watch with embedded player, and track study statuses (*To Watch*, *In Progress*, *Synthesized*, *Mastered*). |
| **Knowledge Hub** | `Brain` | Deep study interface for individual clips: view summaries, write notes, log questions, record ideas, export to Obsidian, and listen to summaries. |
| **AI Academy** | `GraduationCap` | Interactive classroom featuring the Claude 10-lesson track, Kiro 9-lesson track, and Gemini Masterclass with full audio playback. |
| **Gemini Studio** | `Sparkles` | Knowledge distillation engine (extract takeaways/quizzes) and Vibe Coding Co-Pilot (prompt generator & anti-pattern checker). |
| **GitHub Sync & Logs** | `GitBranch` | Safe git sync instructions, verbatim prompt logs (`gemini_prompts.md`), collaborative playbook (`gemini_feedback.md`), and future suggestions (`suggestions.md`). |
| **Legacy Tools** | `ExternalLink` | Direct launcher and embedded viewer for all original standalone HTML tools from the repository. |
| **User Guide** | `HelpCircle` | This comprehensive downloadable and playable documentation manual. |

---

## 3. How to Use On-Demand Audio Playback with AirPods

### 3.1 Where Audio Playback is Available
Audio playback controls (`AudioLessonPlayer`) are embedded across all long-text sections of the platform:
- **AI Academy**: Above every Claude and Kiro lesson.
- **Knowledge Hub**: Above video summaries in the study view.
- **GitHub Sync & Logs**:
  - In the **Verbatim Prompts Log** tab (listen to your prompt history!).
  - In the **Multi-AI Vibe Playbook** tab (listen to collaborative guidance!).
  - In the **Future Suggestions** tab (listen to architectural proposals!).
- **User Guide**: Listen to this entire manual on-demand!

### 3.2 AirPods & Bluetooth Controls
When audio is playing, the browser activates the W3C **MediaSession API**:
- **Single Stem Squeeze / Button Click**: Pause or resume playback.
- **Double Stem Squeeze**: Skip forward to the next paragraph or section.
- **Triple Stem Squeeze**: Jump back to the previous section.
- **Lock Screen / Control Center**: View the lesson title, series artwork, and scrub progress without unlocking your device.

### 3.3 Customizing Voice and Playback Speed
- **Speed Multipliers**: Click **0.3x (Slow Study), 0.5x (Half Speed), 0.8x (Deliberate), 1.0x, 1.25x, 1.5x, 1.75x, or 2.0x** to adjust speed instantly.
- **Voice & Speed Settings**: Click **"Voice & Speed"** to choose among installed system voices (e.g. Apple Siri, Samantha, Google US/UK English, Daniel), fine-tune pacing with a continuous 0.2x-2.0x slider, and adjust voice pitch.

---

## 4. Module Deep Dives

### 4.1 Playlists & Clips Studio
- **Filter by Status**: Filter videos by *To Watch*, *In Progress*, *Synthesized*, or *Mastered*.
- **Add New Clip**: Click **"+ Add Clip"** to paste any YouTube URL, assign it to a playlist, add tags, and enter study notes.
- **Create Playlist**: Click **"+ New Playlist"** to create a fresh study category.
- **Direct Study Link**: Click **"Open in Hub"** on any video card to immediately focus on its notes and summaries.

### 4.2 Personal Knowledge Hub
- **4 Study Pillars**:
  1. *Video Summary*: Consolidated key points and takeaways from `data/summaries/`.
  2. *My Notes*: Auto-saving markdown reflection scratchpad.
  3. *Inquiries & Doubts*: Personal questions to investigate or ask AI mentors.
  4. *Project Prompts*: Actionable prompts inspired by the video.
- **Obsidian & Markdown Export**: Click **"Export to Markdown / Obsidian"** to download a clean `.md` file pre-configured with YAML frontmatter, backlinks, and callouts for your knowledge vault.
- **Send to Gemini**: Click **"Send to Gemini Studio"** to run deep reasoning or generate flashcard questions.

### 4.3 AI Vibe Coding Academy
- **Lesson Switcher**: Toggle between the **Claude Series** (10 lessons), the **Kiro Series** (9 lessons), and the **Gemini Playbook** (4 modular rules).
- **Completion Tracking**: Click the circle next to any lesson to mark it complete. Your progress is saved locally.
- **Copyable Prompts**: Click the copy icon on any suggested prompt to paste it directly into your AI assistant.

### 4.4 Gemini AI Intelligence Studio
- **Knowledge Distiller Tab**:
  - Paste any transcript, video summary, or study note.
  - Set a custom learning goal (e.g. *"Extract practical CLI commands and 3 quiz questions"*).
  - Click **"Distill with Gemini"** to receive architectural insights, golden takeaways, reflection questions, and suggested prompts.
  - Click **"Save to Clip Hub"** to push these directly into your active video's notes!
- **Vibe Coding Co-Pilot Tab**:
  - Enter any feature idea (e.g. *"Build an auto-transcriber using Faster-Whisper and Python"*).
  - Select your target assistant (Claude, Kiro, or Gemini) and stage (Scaffolding, Implementation, Debugging).
  - Receive an optimized, token-efficient prompt and specific anti-pattern warnings.

### 4.5 Original Tools & Legacy Apps Hub
- Access the original HTML applications created before this web application:
  1. **`youtube.html`**: The original YouTube playlist browser.
  2. **`claude_lessons_app.html`**: Standalone Claude interactive reader.
  3. **`kiro_lessons_app.html`**: Standalone Kiro interactive reader.
  4. **`wordcloud.html`**: Dynamic keyword frequency word cloud.
- Launch them in a new browser tab or preview them directly within an embedded frame.

---

## 5. Safe GitHub Update Protocol

To bring all the newly generated web code into your GitHub repository safely without altering existing Python scripts or configs:

```bash
# 1. In your local clone of learn-better, create a clean branch:
git checkout -b feature/gemini-knowledge-hub

# 2. Copy the web application into a new 'webapp/' folder:
mkdir -p webapp
cp -r /path/to/downloaded/src /path/to/downloaded/package.json /path/to/downloaded/server.ts webapp/

# 3. Copy documentation files to repo root:
cp gemini_prompts.md gemini_feedback.md suggestions.md USER_GUIDE.md .

# 4. Verify existing python code was untouched:
git status

# 5. Commit and push:
git add webapp/ gemini_prompts.md gemini_feedback.md suggestions.md USER_GUIDE.md
git commit -m "feat: add Learn Better Web Hub, AirPods player, and multi-AI vibe coding guides"
git push -u origin feature/gemini-knowledge-hub
```

---

## 6. Troubleshooting & Operational Runbook: iPadOS & Cross-Site 401 Authorization Errors

### 6.1 Incident Summary & Root Cause
- **Symptoms**: Following an iPadOS system update, all web applets and preview frames fail to load, consistently returning `401 Unauthorized` errors across **all browsers** (Safari, Chrome, Brave, Edge).
- **Underlying Cause**:
  1. **WebKit Engine Ubiquity**: On iOS and iPadOS, Apple mandates that every browser uses the system WebKit engine. A privacy or security policy change at the OS level impacts all browsers uniformly.
  2. **Intelligent Tracking Prevention (ITP) & Cross-Origin Cookies**: Google AI Studio hosts preview applets inside an `<iframe>` under Cloud Run domains (`*.run.app`). When iPadOS updates, it resets or enforces stricter **"Prevent Cross-Site Tracking"** rules. Safari and WebKit classify the authentication tokens/cookies sent into the iframe as third-party tracking cookies and silently drop them.
  3. **Gateway Rejection**: The Cloud Run ingress reverse proxy receives the HTTP request without valid authorization credentials and rejects it with `HTTP 401 Unauthorized` before reaching the application code.

### 6.2 Step-by-Step Resolution Runbook

If this occurs again after a future iOS/iPadOS update, follow these steps:

#### Step 1: Open the iPad "Settings" App
1. Go to the Home Screen (swipe up from bottom edge).
2. Tap the grey icon with mechanical gear wheels (**Settings**), or swipe down on the home screen to search for "Settings".

#### Step 2: Configure System Safari & WebKit Settings (Affects All Browsers)
1. In the Settings left sidebar, scroll down to **Safari** (or **Apps > Safari** in iPadOS 18+).
2. Under **Privacy & Security**:
   - Toggle **"Prevent Cross-Site Tracking"** to **OFF** (grey/white).
   - Ensure **"Block All Cookies"** is **OFF**.
3. Scroll to the bottom and tap **Advanced**:
   - Tap **"Advanced Tracking and Fingerprinting Protection"**.
   - Change setting from *"All Browsing"* to **"Off"** (or *"Private Browsing Only"*).

#### Step 3: Configure Third-Party Browsers (Chrome / Brave / Edge)
1. In the iPad Settings sidebar, select the browser (e.g., **Chrome** or **Brave**, or **Apps > Brave** on iPadOS 18+).
2. Ensure **"Allow Cross-Website Tracking"** is toggled **ON** (green). *(Confirmed: This is the primary fix for the 401 error in Brave on iPad).*
3. If using **Brave**, you can also tap the Lion icon in the address bar on AI Studio to toggle Shields off for the domain if needed.

#### Step 4: Re-Authenticate Google Account
1. Open a browser tab to `https://accounts.google.com` and ensure your Google account is verified with a fresh login session.
2. Return to Google AI Studio and hard-refresh the workspace.

#### Step 5: Instant Workaround (Standalone URL)
If you need immediate access without changing device settings:
- Tap the **"Open in new window" / "Pop out"** icon in the upper-right corner of the AI Studio preview pane, or navigate directly to the standalone Cloud Run URL (`https://ais-pre-...run.app`).
- Running outside the `<iframe>` as a top-level tab makes all authentication first-party, completely bypassing cross-site cookie restrictions.

---

### Section 7: iPad Fullscreen & Immersive Mode (Brave / Safari / Chrome)

On iPadOS, Apple restricts native DOM fullscreen (`requestFullscreen`) inside embedded `<iframe>` views and third-party WebKit wrappers. Learn Better provides three methods to achieve a completely distraction-free, full-screen learning environment:

#### Method 1: The In-App Immersive Fullscreen Button (Instant)
- Located in the top navigation bar next to "Decks & Videos".
- Look for the **Fullscreen icon** button (`[ ⛶ ]`).
- **How it works**:
  - Attempts the WebKit native `webkitRequestFullscreen()` API.
  - Automatically activates **CSS Immersive Viewport Mode** (`fixed inset-0 z-50 w-screen h-screen`), eliminating surrounding page chrome, paddings, and scrolls.
  - Tap the button again (now showing `Exit Fullscreen` with a purple ring) or press Escape to restore regular mode.

#### Method 2: Brave on iPad Toolbar Collapse (Settings)
- In the Brave app on your iPad:
  1. Tap the **three dots menu (`...`)** in the navigation bar.
  2. Tap **Settings > Display** (or **Appearance**).
  3. Turn on **"Hide Toolbar on Scroll"** (or enable Compact Toolbar).
  4. When you scroll through playlists or transcripts, Brave automatically slides its address bar and tab bar off-screen.

#### Method 3: 100% True Edge-to-Edge Fullscreen (Add to Home Screen / PWA)
- To eliminate 100% of browser bars (address bar, tab strips, navigation buttons):
  1. Open the app in its own standalone tab via the **"Open in new window"** pop-out icon in AI Studio (or browse directly to the app's `*.run.app` URL).
  2. In Brave or Safari, tap the **Share button** (square with an arrow pointing up).
  3. Tap **"Add to Home Screen"**.
  4. Give it a name (e.g., "Learn Better") and tap **Add**.
  5. Tap the new Learn Better icon on your iPad home screen: it launches with Apple's standalone PWA engine with **zero browser UI**, giving you true edge-to-edge native app full screen.

---

*Enjoy learning better! Use the top-right button in this guide to download this manual anytime.*
