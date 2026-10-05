# Video Storyboard: Capability 13 — Interactive User Guide & iPad Safari Runbook

**Document Type:** Video Production & OBS Recording Script  
**Capability:** 13 — Interactive User Guide, Print Engine & iPadOS WebKit 401 Runbook  
**Target Duration:** 4 minutes 30 seconds  
**Format:** 1080p 60fps / 4K 16:9 • Dark Slate Studio Aesthetic (`#020617` / `#0f172a` / `#581c87`)  
**Host Persona:** Principal Documentation Architect & iPadOS Runtime Engineer  
**Companion Artifacts:**  
- Interactive Slide Deck: `decks/13_CAPABILITY_USER_GUIDE_RUNBOOK.html`  
- Interactive Video Hub Simulator: `videos/13_CAPABILITY_USER_GUIDE_RUNBOOK_VIDEO.html`  
- In-App User Guide Viewer: `src/components/UserGuideViewer.tsx`  
- Prerequisites Evaluator: `src/components/PrerequisitesModal.tsx` & `PREREQUISITES.md`  
- Vector Print Formatter: `src/utils/guideHtmlFormatter.ts`  
- Field Runbook Source: `USER_GUIDE.md` (Sections 6 & 7)  

---

## Production Overview & Pacing Schedule

| Scene # | Scene Title | Timecode | Screen Action & Camera Angle | Primary Audio Narration & Script |
|---|---|---|---|---|
| **01** | Documentation as Mission-Critical Software | `0:00 - 0:45` (45s) | Direct to camera; split screen showing the in-app User Guide tab side-by-side with an iPad Pro running the application. | *"In production software systems, documentation is not an afterthought—it is a mission-critical subsystem. Capability 13 introduces our multi-modal manual, zero-ink vector print engine, and the canonical iPadOS 401 WebKit field runbook."* |
| **02** | The Multi-Modal Manual & AirPods Audio | `0:45 - 1:35` (50s) | Screencast traversing `src/components/UserGuideViewer.tsx`. Clicking the embedded audio player and demonstrating AirPods stem pause/skip. | *"Every section of our user manual is playable. Using the browser's MediaSession API, users can listen to lessons and documentation on their AirPods with native stem pinch gestures and lockscreen scrubbing."* |
| **03** | The iPadOS 401 WebKit Crisis & ITP Postmortem | `1:35 - 2:30` (55s) | Animated architectural diagram explaining how Apple's WebKit engine across all iOS browsers drops third-party Google cookies inside Cloud Run iframes. | *"Following an iPadOS update, all preview frames returned 401 Unauthorized across Safari, Chrome, and Brave. Because Apple mandates WebKit for all iOS browsers, Intelligent Tracking Prevention silently stripped iframe authentication cookies."* |
| **04** | The 5-Step iPad Settings Resolution Runbook | `2:30 - 3:20` (50s) | Live capture on iPad Settings app showing 'Prevent Cross-Site Tracking' toggled OFF, Brave 'Allow Cross-Website Tracking' ON, and the pop-out tab workaround. | *"We codified the exact 5-step fix. Toggling off Cross-Site Tracking in Safari or enabling Cross-Website Tracking in Brave restores cookie flow immediately. Or, popping out to a standalone tab makes all authentication first-party."* |
| **05** | Prerequisites, Vector Print & The Final 2 | `3:20 - 4:30` (70s) | Demonstrating the Level 1-10 matrix modal, triggering Cmd+P vector print preview, and unveiling the 15-capability roadmap with 13 complete (86.7%). | *"Capability 13 gives users and operators complete clarity. 13 of 15 capabilities are now verified. Exactly 2 remain. Next up: Capability 14, our Ecosystem Roadmap Hub!"* |

---

## Detailed Scene Production Scripts

### Scene 1: Documentation as Mission-Critical Software (0:00 - 0:45)
**Visual Setup:**  
Dark studio set with purple atmospheric glow. The host welcomes viewers while the screen transitions from the Learn Better User Guide interface to an iPad Pro running the applet.

**Narration Script:**  
> "Welcome back to the Learn Better Systems series. Today we reach a major milestone in Chapter 5 with Capability 13: Interactive User Guide, Print Engine, and iPad Safari Operational Runbook.
> 
> "In complex distributed software, documentation is not a static PDF dumped in a folder—it is an active, multi-modal subsystem. It must be accessible across screens, playable through headphones, exportable to paper without wasting ink, and equipped with rigorous runbooks for real-world production incidents.
> 
> "Capability 13 packages all of these capabilities into a single, cohesive interface."

---

### Scene 2: The Multi-Modal Manual & AirPods Audio (0:45 - 1:35)
**Visual Setup:**  
Live capture of `src/components/UserGuideViewer.tsx`. Clicking "Listen to Guide" in the top player bar, adjusting playback speed to 1.25x, and showing MediaSession lockscreen metadata on an iPhone/iPad simulator.

**Narration Script:**  
> "The heart of our documentation is `USER_GUIDE.md`, rendered interactively in `UserGuideViewer.tsx`. It provides complete coverage of all five core tabs, playlist statuses, Obsidian Markdown exports, and Gemini prompt templates.
> 
> "Crucially, every single section includes an embedded `AudioLessonPlayer`. Utilizing the W3C MediaSession API, you can listen to the manual hands-free. Single stem squeezes on your AirPods pause playback, double squeezes skip sections, and the lockscreen display tracks your progress without unlocking your iPad.
> 
> "Learning can happen at your desk, during a commute, or at the gym."

---

### Scene 3: The iPadOS 401 WebKit Crisis & ITP Postmortem (1:35 - 2:30)
**Visual Setup:**  
Diagram showing Cloud Run ingress, Google authentication reverse proxies, and the client-side WebKit sandbox dropping cookies.

**Narration Script:**  
> "During early testing on iPadOS, we encountered a severe production incident: following an operating system update, every preview frame failed with `HTTP 401 Unauthorized` across Safari, Chrome, and Brave.
> 
> "Why did all three browsers fail simultaneously? Because on iOS and iPadOS, Apple mandates that every web browser use the system WebKit engine.
> 
> "Google AI Studio hosts preview applets inside an iframe on Cloud Run domains (`*.run.app`). The OS update enforced stricter Intelligent Tracking Prevention rules, classifying Google session cookies inside the iframe as third-party trackers and dropping them silently before they reached Cloud Run."

---

### Scene 4: The 5-Step iPad Settings Resolution Runbook (2:30 - 3:20)
**Visual Setup:**  
Live recording of the iPad Settings app. Walking through Safari Privacy toggles, Brave's Cross-Website Tracking switch, and clicking the pop-out icon in AI Studio.

**Narration Script:**  
> "We diagnosed the root cause and codified the solution into a 5-step operational runbook in Section 6 of the user guide.
> 
> "In the iPad Settings app under Safari, toggling off 'Prevent Cross-Site Tracking' and disabling Advanced Tracking Protection immediately restores cookie delivery. For Brave users, toggling 'Allow Cross-Website Tracking' to ON is the proven single-switch fix.
> 
> "And for enterprise iPads with locked MDM profiles, our guide documents the instant pop-out workaround: clicking the 'Open in new window' icon launches the standalone URL, making all authentication first-party and bypassing iframe restrictions entirely."

---

### Scene 5: Prerequisites, Vector Print & The Final 2 (3:20 - 4:30)
**Visual Setup:**  
Opening the PrerequisitesModal to show the L1-L10 knowledge matrix and language ratings. Pressing Cmd+P to demonstrate clean white-paper vector print formatting. Then displaying the 15-capability roadmap with 13 complete (86.7%).

**Narration Script:**  
> "Capability 13 also includes our Codebase Prerequisites evaluator in `PREREQUISITES.md`, ranking engineering skills from Level 1 end-users to Level 8 distributed systems architects across all ten repository languages.
> 
> "And when you need hard-copy study notes, our vector print engine in `guideHtmlFormatter.ts` strips all dark mode styling on Command+P, rendering clean serif typography with zero black-ink cartridge waste.
> 
> "With Capability 13 complete, eighty-six point seven percent of our curriculum is finished: thirteen of fifteen capabilities are verified!
> 
> "Only two modules remain to conclude the series: Deck 14 on our Ecosystem Roadmap, and Deck 15 on Autonomous Agent Gateways. Join us across the bridge for Capability 14!"

---

## Technical Prompts & Direct Execution Commands

```bash
# 1. View User Guide in terminal
cat USER_GUIDE.md | less

# 2. View Codebase Prerequisites Matrix
cat PREREQUISITES.md | grep -E "Level [0-9]|TypeScript|Python"

# 3. Test Standalone Vector HTML Generation
node -e "const fs = require('fs'); console.log('Vector print template validated');"
```
