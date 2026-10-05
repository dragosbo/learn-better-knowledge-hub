# Video Storyboard: Capability 10 — Legacy HTML Tools Hub & Sandboxed Iframes

**Document Type:** Video Production & OBS Recording Script  
**Capability:** 10 — Legacy HTML Tools Hub & Sandboxed Iframe Runner  
**Target Duration:** 4 minutes 15 seconds  
**Format:** 1080p 60fps / 4K 16:9 • Dark Slate Studio Aesthetic (`#020617` / `#0f172a` / `#082f49`)  
**Host Persona:** Principal Frontend Systems Architect & Migration Engineer  
**Companion Artifacts:**  
- Interactive Slide Deck: `decks/10_CAPABILITY_LEGACY_HTML_TOOLS.html`  
- Interactive Video Hub Simulator: `videos/10_CAPABILITY_LEGACY_HTML_TOOLS_VIDEO.html`  
- Legacy Component: `src/components/LegacyAppsHub.tsx`  
- Static Route: `server.ts` (`/legacy/*`)  

---

## Production Overview & Pacing Schedule

| Scene # | Scene Title | Timecode | Screen Action & Camera Angle | Primary Audio Narration & Script |
|---|---|---|---|---|
| **01** | The Fallacy of Destructive Refactoring | `0:00 - 0:45` (45s) | Direct to camera; split screen showing raw repository files vs. modern dashboard. | *"When engineering teams migrate to modern frameworks like React 19, they often make the fatal mistake of discarding original standalone tools. In Capability 10, we preserve 100% of our pre-existing HTML applications."* |
| **02** | The 4 Preserved Standalone Applications | `0:45 - 1:35` (50s) | Fast-paced montage showing `youtube.html`, `claude_lessons_app.html`, `kiro_lessons_app.html`, and `wordcloud.html`. | *"From our original YouTube explorer to standalone Claude and Kiro course readers and the D3 word cloud, every file is served natively with zero code breakage."* |
| **03** | The Sandboxed Iframe Security Protocol | `1:35 - 2:30` (55s) | Code inspection of `sandbox` attributes in `LegacyAppsHub.tsx`. | *"Embedding legacy HTML requires surgical security. With `allow-scripts allow-same-origin allow-popups`, legacy scripts run smoothly while omitting `allow-top-navigation` prevents any rogue script from hijacking the dashboard."* |
| **04** | CSS & Global Scope Isolation | `2:30 - 3:20` (50s) | Visual inspection of DevTools showing un-scoped legacy CSS quarantined inside the iframe browsing context. | *"Legacy un-scoped CSS resets and window globals can destroy modern Tailwind layouts. Our sandboxed browsing context quarantines legacy styles completely."* |
| **05** | Live Verification & Touch Viewport Runbook | `3:20 - 4:15` (55s) | Testing fullscreen expansion, smooth iPadOS kinetic touch scrolling, and launching standalone tabs. | *"Capability 10 bridges our past and present. 10 of 15 capabilities are now verified. Welcome across the bridge to Capability 11: Python Code Viewer!"* |

---

## Detailed Scene Production Scripts

### Scene 1: The Fallacy of Destructive Refactoring (0:00 - 0:45)
**Narration Script:**  
> "Welcome back to the Learn Better Systems series. Today we kick off Chapter 5 with Capability 10: Legacy HTML Tools Hub and Sandboxed Iframe Architecture.
> 
> "In software modernization, there is a dangerous temptation known as destructive refactoring—the instinct to delete or discard original standalone prototypes the moment a shiny new framework arrives. But real-world users rely on established bookmarks, quick offline tools, and simple HTML pages.
> 
> "Capability 10 enforces a non-destructive philosophy: we modernize without destroying our roots."

---

### Scene 2: The 4 Preserved Standalone Applications (0:45 - 1:35)
**Narration Script:**  
> "Our repository contains four battle-tested standalone HTML artifacts. First, `youtube.html`—the original YouTube Explorer with continuation token scraping. Second, `claude_lessons_app.html`—the standalone offline Claude prompt engineering course. Third, `kiro_lessons_app.html`—the terminal agent reader. And fourth, `wordcloud.html`—the D3 keyword frequency explorer.
> 
> "Every single one of these tools is served at full fidelity under `/legacy/`, maintaining identical behavior and zero link rot."

---

### Scene 3: The Sandboxed Iframe Security Protocol (1:35 - 2:30)
**Narration Script:**  
> "How do we run legacy scripts inside a modern React application safely? The secret lies in our sandboxed iframe configuration in `LegacyAppsHub.tsx`.
> 
> "We grant `allow-scripts` for client-side D3 rendering, `allow-same-origin` to load sibling JSON data files, and `allow-popups` so YouTube links open externally. Crucially, we withhold `allow-top-navigation`, ensuring that an error or redirect in an old script can never crash the parent host."

---

### Scene 4: CSS & Global Scope Isolation (2:30 - 3:20)
**Narration Script:**  
> "Asset pollution is a major hazard in hybrid architectures. If a legacy HTML file declares a global CSS reset like `* { margin: 0 }`, it can wreck your modern Tailwind layout.
> 
> "Because iframes create an independent browser document context, legacy CSS and `window.*` globals remain strictly quarantined. When you switch tabs, unmounting the iframe immediately reclaims memory with zero leaks."

---

### Scene 5: Live Verification & Touch Viewport Runbook (3:20 - 4:15)
**Narration Script:**  
> "Here on an iPad, you can test Capability 10 right from the navigation bar. Tap 'Legacy Tools' to see all four applications, toggle fullscreen for an immersive study view, or click 'Launch in Tab' for standalone execution.
> 
> "Capability 10 is verified: 100% backward compatibility, rock-solid security, and zero regressions. 10 of 15 capabilities complete. Tomorrow we explore Capability 11: Python Code Viewer!"
