# inkFlow

**An AI-native writing studio designed for authors, essayists, and storytellers.**

inkFlow positions artificial intelligence as a quiet creative collaborator sitting beside the manuscript rather than a chatbot that takes over the interface. Built on a warm, editorial visual language, inkFlow keeps the writer in full control of their craft.

---

## Key Experiences

### 1. Studio
- Central overview for manuscripts, stories, drafts, and recent activity.
- Instant shortcuts to start new formats: **Story**, **Novel**, **Short Story**, **Email**, and **Blog**.
- **Pick up where you left off** hero card with dynamic procedural cover artwork.
- Minimal Ollama connectivity indicator and automatic model routing.

### 2. Writing Editor
- **Left**: Chapter and act navigation tree for deep long-form organization.
- **Center**: Distraction-free, serif manuscript editor powered by TipTap.
- **Right**: Contextual AI writing partner offering targeted creative actions:
  - *Continue*, *Rewrite*, *Expand*, *Brainstorm*, *Suggest*, and *Write for me*.
- **Inline Suggestions**: Non-destructive continuation cards with *Accept*, *Try another*, and *Dismiss*.

### 3. Skills & AI Studio
- Natural-language and Markdown skill definitions defining tone, style, voice, and rules.
- Live agent preview showing active persona and behavior parameters.
- Reusable skills library with instant search, template presets, and session overrides.

### 4. Projects
- Structured organization for long-form works, series, and collections.
- Filter by category (*Novels*, *Stories*, *Blogs*, *Series*, *Others*) and sort by recency, title, or words.
- Dynamic procedural SVG cover art generated on demand for every title.
- Prominent chapter counts and word counts (clean layout with no progress bars).

### 5. Templates
- Ready-to-write scaffolds for Novels, Short Stories, Blog Posts, Emails, and Story Series.
- Direct "Turn an idea into a template" generator powered by local Ollama models.

---

## Design System

- **Warm Paper Theme**: `#F5F1E9` background with `#25251F` charcoal ink typography.
- **Editorial Accents**: Muted sage (`#3F5236` / `#A7B69A`) and terracotta (`#C77B5B`).
- **Typography**: Editorial serif headings and manuscript canvas paired with clean sans-serif controls.
- **Local-First & Private**: Powered by Dexie (IndexedDB) for local persistence and local Ollama inference without cloud dependencies.

---

## Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **Editor**: TipTap with StarterKit & CharacterCount
- **Storage**: Dexie.js (IndexedDB local database)
- **State**: Zustand
- **Local AI**: Direct Ollama REST integration with dynamic model discovery and task routing

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- [Ollama](https://ollama.com/) running locally (default: `http://localhost:11434`)
  ```bash
  ollama pull gemma2:2b
  # or qwen2.5:3b, granite3.2:2b, mistral, etc.
  ```

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser at `http://localhost:5173`.
