# VoiceReflectionInterviewer Component for KnowledgeHub

Create a dedicated `VoiceReflectionInterviewer` component embedded side-by-side with the notes editor in `KnowledgeHub`. It provides a visual linear progress bar, collapsible Socratic question cards, and a dual-mode push-to-talk recording interface for spoken reflections.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and UX choices were confirmed during the interactive interview:
> - **Placement**: Side-by-side split panel alongside the notes editor, enabling the student to simultaneously view/edit their written study notes and interact with the AI Socrates interviewer.
> - **Progress Rendering**: Clean linear progress bar with step-by-step collapsible question cards (active question expanded with focus, completed stages collapsed as expandable review summaries).
> - **Voice Interaction**: Dual-mode push-to-talk button supporting both click-to-toggle and hold-to-talk gestures with live audio waveform bars and instant speech transcription.

- **Confirmed Decision 1 (Split Panel Architecture)**: In `KnowledgeHub`, provide a toggleable side-by-side layout (`Editor + Socratic Interviewer`) so the student doesn't lose sight of their notes while speaking.
- **Confirmed Decision 2 (Linear Progress & Collapsible Cards)**: Top progress bar indicating percentage completed (33% → 66% → 100%) paired with accordion-style question cards showing historical turns and active inquiry.
- **Confirmed Decision 3 (Dual-Mode Push-to-Talk)**: Supports rapid desktop and mobile touch gestures (click to start/stop or hold down to record) with Gemini speech transcription and browser speech preview.

---

## 1. Overview & Core Concept

- **What It Does**: Builds a dedicated `VoiceReflectionInterviewer` component that renders adjacent to the study notes canvas. It leads the learner through the 3-stage Socratic inquiry (Merits, Learnings, Applications), displays active AI inquiries with warm conversational guidance, accepts spoken feedback via dual-mode push-to-talk, and compiles a complete reflection debrief without modal interruptions.
- **Target Audience / Persona**: Visual and auditory learners who prefer seeing their notes, transcript, and interviewer prompts simultaneously in a focused split workstation.
- **Key Value**: Provides an unconstrained, non-modal reflection workspace where notes and verbal debriefs coexist and cross-pollinate.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Activating the Split Interviewer**:
   - In `KnowledgeHub`'s active view bar or notes header, user clicks **"Split Voice Interview"** or **"Launch Interviewer"**.
   - The workspace smoothly expands into a 2-column layout: Left column contains the Study Notes / Takeaways, Right column hosts the `VoiceReflectionInterviewer`.
2. **Visual Progress & Socratic Progression**:
   - At the top of `VoiceReflectionInterviewer`, a smooth gradient linear progress bar tracks completion (`Step 1 of 3: Value & Merits`, `33%`).
   - Stage 1 Card is expanded: Socrates asks what makes the clip standout and valuable.
   - User speaks their answer using the dual-mode push-to-talk button.
   - Upon confirming the answer, Stage 1 collapses into a completed badge with summary, and Stage 2 (Key Learnings) smoothly expands with an AI acknowledgment and the next inquiry.
3. **Dual-Mode Recording Experience**:
   - **Click Mode**: Click once to start recording; audio wave animates; click again to stop and transcribe.
   - **Hold Mode**: Hold down mouse/touch to speak, release to stop and transcribe immediately.
   - Transcribed text appears in real-time in an editable area.
4. **Completion & Direct Note Enrichment**:
   - At Stage 3, the final debrief is generated.
   - User clicks **"Save & Append to Notes"**, which immediately writes the debrief into the left-hand editor without leaving the screen.

### Visual Identity & Theme
- **Color Discipline**: Deep slate background (`slate-950/70`), subtle borders (`slate-800`), indigo accents for Socrates guidance (`indigo-400`), rose accents for recording states (`rose-500`), and emerald accents for completed stages (`emerald-400`).
- **Collapsible Cards**: Accordion headers displaying question number, stage title, and status checkmark. Active card features an indigo ring and illuminated prompt.
- **Audio Meter**: Live 16-bar responsive frequency spectrum during active recording.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Side-by-Side Split Panel vs. Full-Screen Modal**
  - *Chosen Approach*: Implement `VoiceReflectionInterviewer` as a standalone component that mounts side-by-side with the notes editor inside `KnowledgeHub`.
  - *Why*: Allows simultaneous reference to video timestamps, summary takeaways, and personal notes while speaking into the mic.
  - *Alternatives Considered*: Modal overlay was implemented initially; the split panel provides superior productivity and zero context loss. Both will coexist harmoniously.
- **Decision 2: Linear Progress Bar with Collapsible Cards**
  - *Chosen Approach*: Top horizontal progress bar tracking completion percentage with collapsible step cards below.
  - *Why*: Gives clear spatial awareness of interview length while maintaining a clean, compact layout that fits neatly into a split column.
- **Decision 3: Dual-Mode Push-to-Talk Handling**
  - *Chosen Approach*: Single smart button bound to `onClick`, `onMouseDown`, `onMouseUp`, `onTouchStart`, and `onTouchEnd` with threshold detection.
  - *Why*: Caters naturally to both quick push-to-talk talkers and hands-free spoken reflectors.

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                              KnowledgeHub                              │
│                                                                        │
│  ┌─────────────────────────────────┐  ┌─────────────────────────────┐  │
│  │ Left: Notes & Insights Editor   │  │ Right: VoiceReflection      │  │
│  │ - Title, Tags, Channel          │  │        Interviewer           │  │
│  │ - Markdown Notes Textarea       │  │ - Linear Progress Bar (66%)  │  │
│  │ - Key Takeaways / Summaries     │  │ - [✔ Step 1: Merits (Coll)]  │  │
│  │                                 │  │ - [▶ Step 2: Learnings (Act)]│  │
│  │                                 │  │   - AI Socrates Question    │  │
│  │                                 │  │   - Dual-Mode Mic Button    │  │
│  │                                 │  │   - Live Waveform + Editor  │  │
│  │                                 │  │ - [⏳ Step 3: Applications]  │  │
│  │                                 │  │ - [Save & Sync to Notes]    │  │
│  └─────────────────────────────────┘  └─────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Model & State
- `VoiceReflectionInterviewerProps`:
  ```typescript
  interface VoiceReflectionInterviewerProps {
    clip: YouTubeClip;
    onSaveReflection: (clipId: string, session: VoiceReflectionSession, appendToNotes: boolean) => void;
    onClose?: () => void;
  }
  ```
- Component State:
  - `activeStep`: 1 | 2 | 3 | 4 (summary)
  - `expandedCard`: number (which step card is expanded)
  - `turns`: `VoiceInterviewTurn[]`
  - `isRecording`: boolean
  - `transcript`: string

### Interactive Component & State Mapping
- `src/components/VoiceReflectionInterviewer.tsx`:
  - New modular component containing linear progress bar, collapsible accordion cards, dual-mode push-to-talk button, audio waveform canvas, and final synthesis.
- `src/components/KnowledgeHub.tsx`:
  - Adds split-pane state `isInterviewerOpen: boolean` and a toggle button in the notes toolbar.
  - Dynamically splits the grid from single-column to `grid-cols-1 lg:grid-cols-2` when the interviewer is active.
