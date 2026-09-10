# Gemini Collaborative Feedback & Multi-AI Vibe Coding Playbook

*Document purpose: A living reference of architectural advice, anti-pattern warnings, multi-AI collaboration practices, and token-efficient strategies tailored for the `learn-better` ecosystem.*

---

## 1. Executive Summary & Philosophy

You are embarking on a high-leverage software experiment: orchestrating multiple AI assistants (Claude, Kiro, Gemini) around a unified knowledge base and utility toolkit (`learn-better`). 

"Vibe coding" is liberating, but when scaled across multiple agents or extended over multiple daily quota cycles, unguided vibe coding degenerates into **architectural entropy** — inconsistent styles, duplicate utilities, broken imports, and hallucinated state.

To succeed, transition from **passive vibe coding** to **spec-driven agentic steering**: you provide strict contracts and verify checkpoints, while the AI does the heavy typing.

---

## 2. Anti-Patterns to Avoid

### ⚠️ Anti-Pattern 1: The Monolithic Multi-Goal Prompt
- **The Issue**: Combining 5–7 complex goals (clone, build frontend, add Gemini AI, create tutorials, design knowledge hub, audit prompts, write feedback) into a single turn burns a large chunk of your daily token budget on planning rather than iterative execution.
- **The Correction**: Use **"Micro-Sprints"**. Break work into 1 prompt = 1 verifiable outcome:
  - *Sprint 1*: Clone & set up base workspace + logs + core UI shell.
  - *Sprint 2*: YouTube Playlist & Clip Inspector with metadata parsing.
  - *Sprint 3*: Personal Knowledge Hub (notes, tags, flashcards, questions).
  - *Sprint 4*: Gemini AI Assistant integration (summarization & synthesis).
  - *Sprint 5*: Git sync workflow & export scripts.

### ⚠️ Anti-Pattern 2: Multi-AI Context Collision
- **The Issue**: Claude, Kiro, and Gemini each have different preferred idioms (e.g., Kiro preferring single-file scripts or Python CLI; Claude preferring structured modules or Markdown lessons; Gemini excelling at multimodal reasoning, TypeScript web interfaces, and large-context synthesis). Asking one AI to edit another AI's active file without a shared interface specification causes churn and regression.
- **The Correction**: **Contract-First Architecture**:
  - Keep backend/Python tools in `code/` and `lib/` (as originally established).
  - Keep web applications in dedicated subfolders (e.g., `src/` or `webapp/`).
  - Use JSON data (`data/*.json`) or standard Markdown schemas (`data/summaries/*.md`) as the universal contract between the Python backend tools and the TypeScript frontend.

### ⚠️ Anti-Pattern 3: Unbounded Token Depletion
- **The Issue**: Re-sending full file contents, giant transcripts, or re-explaining the entire project in every prompt wastes tokens rapidly.
- **The Correction**:
  - Keep persistent system files (`gemini_prompts.md`, `gemini_feedback.md`, and architectural summaries) in the root.
  - Reference files by path rather than pasting their contents.
  - Ask for targeted component edits rather than full-file rewrites whenever possible.

### ⚠️ Anti-Pattern 4: "Blind Trust" vs. "Steer & Verify"
- **The Issue**: Assuming generated code works without checking preview or logs, leading to stacked errors that become expensive to untangle later.
- **The Correction**: Follow the lesson methodology already established in your repo: every step must have an explicit **Verify** check before moving to the next.

---

## 3. How to Optimize Collaboration Across Multiple AIs

| Assistant | Optimal Sweet Spot in this Project | Best Task Delegation |
|---|---|---|
| **Kiro** | Fast, focused terminal scripts & CLI workflows | Python downloaders, local Whisper transcription, Piper TTS scripts (`w.bat`, `s.bat`) |
| **Claude** | Deep architectural critique, pedagogical tutorials, structural refactoring | Maintaining the `lessons_Claude/` series, deep documentation, edge-case analysis |
| **Gemini** | Interactive web apps, TypeScript/React interfaces, large-context synthesis, Gemini 2.5/Flash knowledge extraction | Building the live Knowledge Hub UI, playlist visualizers, transcript Q&A, and real-time synthesis |

### Smooth Multi-AI Workflow:
1. **The Shared Data Layer**: The Python scripts produce clean `.json` and `.md` files in `data/`.
2. **The Shared UI Layer**: The TypeScript/Vite web application reads and interacts with this data, allowing you to visually browse, search, annotate, and trigger AI prompts.
3. **The Synchronization Bridge**: Provide a safe export/commit script so everything generated here can be reviewed as a clean branch or pull request in GitHub without touching legacy files.

---

## 4. Phased Milestone Plan (Conserving Daily Free Quota)

To ensure tangible, working progress in each session without hitting token exhaustion:

- **Day / Session 1 (Today)**:
  - Repository cloned into isolated workspace (`imported_repo/`).
  - Audit logs established (`gemini_prompts.md`, `gemini_feedback.md`).
  - Full-featured, responsive TypeScript Web Application built in `src/` featuring:
    1. **Playlist & Clip Explorer**: Interactive visual player & manager for YouTube playlists and clips from the repo.
    2. **Personal Knowledge Hub**: Notes, key insights, personal questions, and mind-map concepts.
    3. **AI Learning Studio**: Interactive module on how to build apps with AI (incorporating the Kiro & Claude lessons + Gemini vibe coding principles).
    4. **Gemini Assistant Studio**: Interactive prompt sandbox and insight generator for transcripts.
    5. **GitHub Sync Guide & Tools**: Step-by-step instructions and export script to safely merge back into your GitHub repo.
  - Verify app compiles cleanly and live preview runs.

- **Day / Session 2**:
  - Deepen YouTube API / yt-dlp playlist import tooling (paste any playlist/channel URL to parse and stage for download).
  - Expand local notes export to Obsidian-compatible Markdown and Anki flashcards.

- **Day / Session 3**:
  - Connect live Gemini 2.5 Flash API calls via server routes for automated transcript distillation, custom persona querying, and concept clustering.

---

## 5. GitHub Repository Update Protocol (Safe Merging)

To safely incorporate the generated code into your GitHub repo `dragosbo/learn-better` without breaking any existing files:

1. **Isolation Rule**: All web application code resides in `webapp/` (or `frontend/`), completely separate from `code/`, `lib/`, and `notebooks/`.
2. **Branching Strategy**:
   - Create a feature branch: `git checkout -b feature/gemini-knowledge-hub`
   - Copy the new files into a new `webapp/` folder in your repo.
   - Stage only new files: `git add webapp/ gemini_prompts.md gemini_feedback.md`
   - Verify existing files are untouched: `git status`
   - Commit & push: `git commit -m "Add Gemini Knowledge Hub webapp and AI vibe coding guide"`
   - Open a Pull Request or merge locally into `main`.
