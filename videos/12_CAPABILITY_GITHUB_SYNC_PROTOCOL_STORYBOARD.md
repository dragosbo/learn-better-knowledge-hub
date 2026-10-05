# Video Storyboard: Capability 12 — Safe GitHub Sync & Multi-AI Monorepo Protocol

**Document Type:** Video Production & OBS Recording Script  
**Capability:** 12 — Safe GitHub Sync & Multi-AI Monorepo Protocol  
**Target Duration:** 4 minutes 30 seconds  
**Format:** 1080p 60fps / 4K 16:9 • Dark Slate Studio Aesthetic (`#020617` / `#0f172a` / `#0369a1`)  
**Host Persona:** Principal DevOps Engineer & Multi-Agent Git Architect  
**Companion Artifacts:**  
- Interactive Slide Deck: `decks/12_CAPABILITY_GITHUB_SYNC_PROTOCOL.html`  
- Interactive Video Hub Simulator: `videos/12_CAPABILITY_GITHUB_SYNC_PROTOCOL_VIDEO.html`  
- Sync Guide Component: `src/components/GitHubSyncGuide.tsx` (666 lines)  
- GitHub REST API Service: `src/services/githubApi.ts` (944 lines)  
- Automated Shell Engine: `export_to_github.sh` & `export_to_github.bat`  

---

## Production Overview & Pacing Schedule

| Scene # | Scene Title | Timecode | Screen Action & Camera Angle | Primary Audio Narration & Script |
|---|---|---|---|---|
| **01** | The Multi-AI Collaboration Dilemma | `0:00 - 0:45` (45s) | Direct to camera; split screen showing Claude Code CLI, Kiro terminal agent, and Gemini AI Studio running simultaneously. | *"When three different AI coding agents contribute to a single GitHub monorepo, standard git workflows collapse. In Capability 12, we introduce our safe branch isolation protocol and non-destructive subfolder quarantine."* |
| **02** | Three AI Agents, One Repository | `0:45 - 1:35` (50s) | Visual comparison of the roles of Claude Code, Kiro AI, and Gemini AI Studio on `dragosbo/learn-better`. | *"Claude writes terminal Python scripts. Kiro manages study workflows and transcripts. Gemini builds full-stack React SPAs. Without quarantine, merging web apps directly into root destroys the Python environment."* |
| **03** | The Safe Sync Quarantine Topology | `1:35 - 2:25` (50s) | Screencast traversing `src/components/GitHubSyncGuide.tsx` displaying the `webapp/` directory layout. | *"Our solution is simple and foolproof: the AI Studio web app is strictly quarantined inside `webapp/`. Root scripts in `code/` and data in `data/` remain 100% untouched. Audit logs sit at root for full GitHub visibility."* |
| **04** | Automated Shell & Batch Sync Scripts | `2:25 - 3:15` (50s) | Terminal screencast running `./export_to_github.sh /path/to/repo` followed by `git status` showing clean staging. | *"No manual copying required. Our single-command bash and batch scripts validate git repositories, check out clean feature branches, copy web assets, and stage pull requests safely in seconds."* |
| **05** | In-App GitHub REST API & The Final 3 | `3:15 - 4:30` (75s) | Demonstrating `githubApi.ts` live repository tree import in browser, followed by the 15-capability roadmap with 12 complete (80%). | *"Capability 12 guarantees seamless teamwork between human engineers and autonomous AI. 12 of 15 capabilities are now verified. Exactly 3 remain. Next up: Capability 13, our iPad Safari Runbook!"* |

---

## Detailed Scene Production Scripts

### Scene 1: The Multi-AI Collaboration Dilemma (0:00 - 0:45)
**Visual Setup:**  
Dark studio backdrop. The host speaks directly into camera while an animated split-screen shows Claude Code compiling CLI scripts on the left, Kiro agent parsing audio in the center, and Google Gemini AI Studio rendering interactive React slides on the right.

**Narration Script:**  
> "Welcome back to the Learn Better Systems series. Today we continue Chapter 5 with Capability 12: Safe GitHub Sync and Multi-AI Monorepo Protocol.
> 
> "Modern development rarely involves a single programmer or even a single AI. In our project, `dragosbo/learn-better`, we orchestrate three distinct AI engines: Claude Code in the CLI, Kiro AI for automated workflows, and Google Gemini AI Studio for web application generation.
> 
> "If you've ever watched two different AI models commit changes to the same Git repository, you know it's a recipe for merge conflicts and corrupted working trees. Capability 12 solves this once and for all."

---

### Scene 2: Three AI Agents, One Repository (0:45 - 1:35)
**Visual Setup:**  
Graphic illustrating the conflicting priorities of the three tools. Highlighting that Claude edits root Python code, Kiro edits markdown transcripts, and Gemini produces a complete web app bundle.

**Narration Script:**  
> "Let's examine why multi-AI monorepos break so easily. Claude Code is a terminal-based agent that modifies root-level Python scripts in `code/` and shared modules in `lib/`. Kiro automates transcription runs, updating files in `data/` and generating documentation.
> 
> "Meanwhile, Gemini AI Studio in the cloud generates complete, production-grade React 19 web applications with Vite, Tailwind CSS, and Express server routes.
> 
> "If Gemini blindly exports its code into the root of the repository, it overwrites the root `package.json`, pollutes Python working directories, and conflicts with existing git tracking. We need strict architectural isolation."

---

### Scene 3: The Safe Sync Quarantine Topology (1:35 - 2:25)
**Visual Setup:**  
Screen capture of the file hierarchy diagram in `GitHubSyncGuide.tsx`. Zooming in on the `webapp/` directory and root markdown audit logs.

**Narration Script:**  
> "Our protocol establishes the Safe Sync Topology. The rule is simple: the AI Studio web application lives entirely inside a dedicated subfolder named `webapp/`.
> 
> "All existing Python scripts in `code/`, core libraries in `lib/`, and Jupyter notebooks remain one hundred percent untouched. Relative paths for data ingestion stay completely intact.
> 
> "Crucially, our audit logs—`gemini_prompts.md` and `gemini_feedback.md`—sit at the repository root. Anyone browsing the GitHub repository can immediately read the verbatim prompts and architectural decisions that created the app."

---

### Scene 4: Automated Shell & Batch Sync Scripts (2:25 - 3:15)
**Visual Setup:**  
Live terminal demonstration. Running `./export_to_github.sh ~/repos/learn-better`. Inspecting git branch creation, copy logs, and clean `git status` output.

**Narration Script:**  
> "To prevent human error, we automate this entire workflow. We provide `export_to_github.sh` for macOS, Linux, and WSL, as well as `export_to_github.bat` for Windows.
> 
> "Pass the path to your local clone, and the script takes over: it validates the `.git` directory, checks out a clean `feature/gemini-knowledge-hub` branch, creates `webapp/`, copies all source assets, syncs the audit logs, and prints clean pull request instructions.
> 
> "When you run `git status`, exactly zero root Python files are modified. It is completely safe, auditable, and non-destructive."

---

### Scene 5: In-App GitHub REST API & The Final 3 (3:15 - 4:30)
**Visual Setup:**  
Demonstration of `src/services/githubApi.ts` in browser. Showing Personal Access Token validation and recursive tree ingestion. Then transitioning to the series progress roadmap showing 12 of 15 completed (80%).

**Narration Script:**  
> "Synchronization is a two-way street. In addition to pushing code out, our application features an in-app GitHub REST API integration in `githubApi.ts`. Spanning nearly one thousand lines, it allows users to provide a GitHub Personal Access Token, monitor rate limits, and recursively import remote transcripts and playlists directly into browser state.
> 
> "With Capability 12 verified, eighty percent of our curriculum is complete: twelve of fifteen capabilities are now finished!
> 
> "That leaves exactly three modules remaining: Deck 13 on our iPad Safari Runbook, Deck 14 on our multi-device roadmap, and Deck 15 on autonomous agent gateways.
> 
> "Join us across the bridge for Capability 13: iPad Safari Runbook and Offline Vector Print Engine!"

---

## Technical Prompts & Direct Execution Commands

```bash
# 1. Automated Bash Sync (macOS / Linux / WSL)
./export_to_github.sh /path/to/your/local/learn-better

# 2. Automated Windows Batch Sync (CMD / PowerShell)
export_to_github.bat C:\repos\learn-better

# 3. Manual Step-by-Step Git Commands
git checkout -b feature/gemini-knowledge-hub
mkdir -p webapp
cp -r src/ public/ package.json vite.config.ts server.ts webapp/
cp gemini_prompts.md gemini_feedback.md USER_GUIDE.md .
git add webapp/ gemini_prompts.md gemini_feedback.md USER_GUIDE.md
git commit -m "feat: add Learn Better Knowledge Hub webapp & multi-AI vibe coding guide"
git push -u origin feature/gemini-knowledge-hub
```
