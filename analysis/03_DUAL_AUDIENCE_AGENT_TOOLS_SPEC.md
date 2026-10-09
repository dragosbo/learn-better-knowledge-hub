# Dual-Audience Interfaces & Agent Tools Specification (Phase 3)

**Project:** `learn-better` Personal Knowledge Hub & Multi-AI Vibe Coding Platform  
**Document Type:** Programmatic Agent Interface & Tool-Calling Protocol Specification  
**Audience:** Human Architects, Autonomous AI Agents, LLM Orchestrators (Claude, Gemini, ChatGPT)  
**Date:** September 2026  
**Status:** Canonical Implementation Ledger (Phase 3 Executable Contract)

---

## 1. Executive Summary & Phase 3 Mandate

### The Vibe-Coding Transition Journey
- **Phase 1 (Introspection & Architecture):** Cataloged the 14 vibe-coded capabilities, established the high-level system topology, and articulated the Dual-Audience Paradigm (Human vs. Agent).
- **Phase 2 (Capability-to-File Delivery Matrix):** Mapped every single capability to its exact deliverable files, line counts, endpoints, data contracts, and dependency graphs.
- **Phase 3 (Dual-Audience Interfaces & Agent Tools):** Transforms `learn-better` into a **bilingual, agent-accessible knowledge platform**. Phase 3 delivers:
  1. **Strict Machine Contracts:** JSON Schemas for all domain objects (Playlists, Clips, Cosmos Nodes, Clusters, Notes).
  2. **Programmatic Agent Gateway:** Real, executable server-side endpoints (`/api/agent/capabilities`, `/api/agent/schema`, `/api/agent/tools`, `/api/agent/query`, `/api/agent/execute-tool`).
  3. **Standardized Tool-Calling Declarations:** Production-ready OpenAI/Gemini/Claude function-calling schemas enabling external autonomous agents to search, inspect, update, and cluster knowledge without UI interaction.
  4. **Human-Agent Co-Existence UI:** An interactive Agent Tool Simulator in the frontend Analysis Hub where human developers can trigger agent queries, inspect raw JSON schemas, and test function calls with instant feedback.

---

## 2. The Dual-Audience Protocol Architecture

```
                                  ┌────────────────────────────────────────────────────────┐
                                  │             learn-better Knowledge Core                │
                                  │      (71 Playlists • 471+ Clips • Audio • Graph)       │
                                  └───────────────────────────┬────────────────────────────┘
                                                              │
                            ┌─────────────────────────────────┴─────────────────────────────────┐
                            ▼                                                                   ▼
       ┌───────────────────────────────────────────────┐               ┌───────────────────────────────────────────────┐
       │             HUMAN AUDIENCE (UX)               │               │             AGENT AUDIENCE (API)              │
       ├───────────────────────────────────────────────┤               ├───────────────────────────────────────────────┤
       │ • Responsive React Tabs (PlaylistManager)     │               │ • GET /api/agent/capabilities                 │
       │ • Visual Video Cosmos 2D Canvas Graph         │               │ • GET /api/agent/schema                       │
       │ • AirPods Audio Synthesizer Controls          │               │ • GET /api/agent/tools (Function Calling JSON)│
       │ • Rich PDF Export Reports (jspdf-autotable)   │               │ • POST /api/agent/query                       │
       │ • Word Cloud & Radial Mind Map Canvas         │               │ • POST /api/agent/execute-tool                │
       │ • Markdown Reader & Syntax Highlighting       │               │ • Atomic JSON file operations with validation │
       └───────────────────────────────────────────────┘               └───────────────────────────────────────────────┘
```

### Audience Contracts
| Dimension | Human Interface (UX) | Autonomous Agent Interface (API) |
|---|---|---|
| **Primary Protocol** | DOM rendering, React 19 hooks, Tailwind CSS | HTTP REST, Strict JSON Schemas, Idempotent Operations |
| **Data Format** | Visual cards, progress bars, audio streams | Flat, normalized JSON payloads, RFC 8259 compliant |
| **Error Handling** | In-app toasts, visual error boundary banners | HTTP status codes, machine-readable `{ error, code, details }` |
| **State Mutation** | Mouse clicks, touch gestures, keyboard shortcuts | Structured tool calls with parameter validation |
| **Rate & Latency** | Optimized for 60fps UI rendering | Optimized for minimal token overhead & deterministic responses |

---

## 3. Programmatic Agent API Endpoints

The server provides a dedicated suite of zero-friction, headless endpoints under `/api/agent/*`.

### 3.1 `GET /api/agent/capabilities`
Returns the complete machine-readable manifest of all 15 platform capabilities.

**Response Schema (`application/json`):**
```json
{
  "success": true,
  "totalCapabilities": 15,
  "capabilities": [
    {
      "id": "01",
      "title": "Playlists & Clips Management",
      "badge": "Core Media",
      "category": "Media & Data",
      "audience": "both",
      "reliability": "High",
      "files": [
        "src/components/PlaylistManager.tsx",
        "src/data/channelPlaylists.json",
        "server.ts"
      ],
      "endpoints": [
        "GET /api/content/playlists",
        "POST /api/content/save-playlists",
        "POST /api/content/sync-youtube"
      ],
      "dataContracts": {
        "primaryModel": "Playlist",
        "childModel": "YouTubeClip",
        "storageFile": "src/data/channelPlaylists.json"
      }
    }
  ]
}
```

---

### 3.2 `GET /api/agent/schema`
Exposes the formal JSON Schemas for domain data structures.

**Key Schemas Included:**
- `YouTubeClipSchema`: id, title, channel, duration, notes, userQuestions, userIdeas, status (`to-watch` | `in-progress` | `synthesized` | `mastered`), orderIndex, tags.
- `PlaylistSchema`: id, title, channel, videoCount, totalDuration, description, clips array.
- `CosmosNodeSchema`: id, title, cluster, radius, x, y, connections, semanticTokens.
- `RestructureClusterSchema`: id, originalCount, targetCluster, proposedPlaylists, rationale.
- `StudyNoteSchema`: clipId, clipTitle, playlistTitle, notes, userQuestions, userIdeas, updatedAt.

---

### 3.3 `GET /api/agent/tools`
Returns production-ready tool/function declarations formatted for **OpenAI Function Calling**, **Gemini Tools (`functionDeclarations`)**, and **Anthropic Claude Tool Use**.

#### Declared Tools:
1. `search_playlists`
   - **Purpose:** Search playlists and video clips by keyword, channel name, category tag, or watch status.
   - **Parameters:** `query` (string, optional), `channel` (string, optional), `status` (enum: `to-watch`, `in-progress`, `synthesized`, `mastered`, `all`), `limit` (integer, default 20).
2. `get_capability_matrix`
   - **Purpose:** Retrieve the full delivery file map, line ranges, and architectural role for any of the 15 capabilities.
   - **Parameters:** `capabilityId` (string, optional: e.g. "01", "07", "15"), `category` (string, optional).
3. `query_video_cosmos`
   - **Purpose:** Inspect semantic cluster nodes, connections, and coordinates from the 2D celestial knowledge graph.
   - **Parameters:** `clusterName` (string, optional), `limit` (integer, default 25).
4. `get_study_notes`
   - **Purpose:** Extract all clips containing user notes, questions, or ideas for synthesis or RAG workflows.
   - **Parameters:** `filterBy` (enum: `has_notes`, `has_questions`, `has_ideas`, `all`), `channel` (optional).
5. `update_clip_notes`
   - **Purpose:** Programmatically append or update notes, user ideas, questions, or status for a given clip ID.
   - **Parameters:** `clipId` (string, required), `notes` (string, optional), `userIdeas` (string, optional), `userQuestions` (string, optional), `status` (enum: `to-watch`, `in-progress`, `synthesized`, `mastered`).
6. `get_code_manifest`
   - **Purpose:** Returns the repository structure, core entry points, and component hierarchy for automated code auditing.
   - **Parameters:** `directory` (string, optional, e.g. "src/components", "server").

---

### 3.4 `POST /api/agent/execute-tool`
Executes an agent tool call securely server-side.

**Request Payload:**
```json
{
  "tool": "search_playlists",
  "arguments": {
    "query": "React",
    "status": "all",
    "limit": 5
  }
}
```

**Response Payload:**
```json
{
  "success": true,
  "tool": "search_playlists",
  "executionTimeMs": 8,
  "resultCount": 5,
  "data": [
    {
      "clipId": "clip-react-01",
      "clipTitle": "React 19 Server Components Deep Dive",
      "playlistTitle": "Modern Frontend Architecture",
      "channel": "Tech Lead Academy",
      "duration": "18:45",
      "status": "synthesized"
    }
  ]
}
```

---

### 3.5 `POST /api/agent/query`
Flexible query engine for ad-hoc agent filtering.

---

## 4. Standardized Tool-Calling Declaration (OpenAI / Claude / Gemini)

Below is the canonical JSON Schema exported by `GET /api/agent/tools`:

```json
{
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "search_playlists",
        "description": "Searches the curated library of 71 YouTube playlists and 471+ video clips by keyword, channel name, category tag, or watch status.",
        "parameters": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "description": "Keyword to match against clip titles, playlist titles, and video descriptions."
            },
            "channel": {
              "type": "string",
              "description": "Filter strictly to clips from this YouTube channel."
            },
            "status": {
              "type": "string",
              "enum": ["all", "to-watch", "in-progress", "synthesized", "mastered"],
              "description": "Filter by watch/learning status."
            },
            "limit": {
              "type": "integer",
              "description": "Maximum number of results to return (1-50, default 20)."
            }
          }
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "get_capability_matrix",
        "description": "Retrieves the exact code delivery files, line numbers, endpoints, and data contracts for any of the 14 platform capabilities in learn-better.",
        "parameters": {
          "type": "object",
          "properties": {
            "capabilityId": {
              "type": "string",
              "description": "Two-digit ID of the capability (e.g. '01' for Playlists, '03' for Video Cosmos, '07' for AirPods Audio)."
            },
            "category": {
              "type": "string",
              "enum": ["all", "Media & Data", "Spatial & Viz", "Audio & AI", "DevOps & Docs"],
              "description": "Filter capabilities by category domain."
            }
          }
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "get_study_notes",
        "description": "Extracts clips containing student notes, self-study questions, or synthesized vibe-coding ideas.",
        "parameters": {
          "type": "object",
          "properties": {
            "filterBy": {
              "type": "string",
              "enum": ["all", "has_notes", "has_questions", "has_ideas"],
              "description": "Filter criteria for extracted learning annotations."
            },
            "channel": {
              "type": "string",
              "description": "Optional channel filter."
            }
          }
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "update_clip_notes",
        "description": "Atomically updates or appends student notes, ideas, questions, or learning status for a specific video clip.",
        "parameters": {
          "type": "object",
          "required": ["clipId"],
          "properties": {
            "clipId": {
              "type": "string",
              "description": "Unique identifier of the video clip."
            },
            "notes": {
              "type": "string",
              "description": "Markdown-formatted synthesis notes to append or set."
            },
            "userIdeas": {
              "type": "string",
              "description": "Actionable ideas or experiments sparked by this clip."
            },
            "userQuestions": {
              "type": "string",
              "description": "Open questions for deeper research or model prompting."
            },
            "status": {
              "type": "string",
              "enum": ["to-watch", "in-progress", "synthesized", "mastered"],
              "description": "New learning progression status."
            }
          }
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "query_video_cosmos",
        "description": "Queries the 2D celestial knowledge graph for semantic video nodes, clusters, celestial coordinates, and relationship links.",
        "parameters": {
          "type": "object",
          "properties": {
            "cluster": {
              "type": "string",
              "description": "Cosmic constellation cluster name (e.g. 'AI Architecture', 'Prompt Mastery', 'Frontend Engines')."
            },
            "limit": {
              "type": "integer",
              "description": "Maximum nodes to return (default 25)."
            }
          }
        }
      }
    }
  ]
}
```

---

## 5. Security, Concurrency & Idempotency Rules

When autonomous agents interact with `learn-better` via Phase 3 endpoints:

1. **Atomic Disk Writes:** When mutations occur (e.g. `update_clip_notes`), the server writes to a temporary file (`channelPlaylists.json.tmp`) before renaming it atomically to prevent JSON truncation if the process is interrupted.
2. **Deterministic Responses:** Response ordering is stable (sorted by index or alphanumeric ID) to allow caching and deterministic LLM evaluation.
3. **Bounded Payloads:** All agent endpoints default to a safe page size (`limit=25`, maximum `100`) preventing massive token consumption when external models query the catalog.
4. **Read-Authoritative:** Read endpoints never mutate server state; status mutations require explicit `POST /api/agent/execute-tool` with a valid `clipId`.

---

## 6. Verification & Automated Agent Test Suite

To verify Phase 3 compliance, the following automated verification suite is executed:
- **Test 1:** `GET /api/agent/capabilities` returns HTTP 200 and schema array of length 14.
- **Test 2:** `GET /api/agent/tools` returns standard function-calling definitions with non-empty descriptions and valid parameter schemas.
- **Test 3:** `POST /api/agent/execute-tool` with `{"tool":"search_playlists", "arguments":{"query":"AI"}}` returns matching playlists without server errors.
- **Test 4:** `POST /api/agent/execute-tool` with `{"tool":"get_capability_matrix", "arguments":{"capabilityId":"02"}}` returns file mapping for the Allocation & Restructure Hub.

---

*Phase 3 Dual-Audience Interfaces & Agent Tools Specification complete. Preserved in `/analysis/03_DUAL_AUDIENCE_AGENT_TOOLS_SPEC.md`.*
