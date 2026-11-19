# InkFlow 2.0 — Product Specification, Technical Architecture & UX Blueprint
### *The IDE for Stories: Plan, Write, Remember, and Revise with Authorial Control*

> **"Your manuscript is the source code.**  
> **Your Story Brain is the database.**  
> **Your Story Runtime maintains state.**  
> **Gemini is the reasoning engine.**  
> **You are the author."**

---

## 1. Executive Summary & Core Product Manifesto

InkFlow 2.0 transforms long-form prose authoring into an intuitive, modular, stateful craft. Unlike traditional text processors that treat a novel as one monolithic document or first-generation AI prompt wrappers that generate ungrounded prose, InkFlow operates like a modern software IDE tailored for narrative fiction.

### 1.1 The InkFlow 2.0 Manifesto
1. **Don't build an AI Word processor. Build an IDE for stories.**  
   Fiction writing has syntax, state, dependencies, subplots, and timelines. The application must treat the story as a living, stateful system.
2. **Complexity should exist in the system, not in the author's workflow.**  
   The Story Runtime, Context Engine, entity extractors, and temporal graphs run quietly beneath the surface. The author experiences a calm, beautiful writing workbench.
3. **AI may suggest story changes. Only the author changes the story.**  
   Every AI action generates a side-by-side diff (`Removed` / `Changed` / `Added`). AI never silently overwrites manuscript prose or story state.
4. **The 10-Second Rule.**  
   - *Returning Author*: Opening the app immediately resumes the last active scene with cursor centered.
   - *New Author*: From app launch to first sentence written takes under 10 seconds. No mandatory forms, no API-key barriers, no configuration wizards.
5. **AI is an enhancement, never a dependency.**  
   The writing studio, chapter hierarchy, outline, and persistence work 100% offline with zero cloud configuration.
6. **The Invisible Complexity Principle.**  
   InkFlow may contain a sophisticated Story Runtime, Context Engine, temporal knowledge graph, AI routing system, story linter, and version-control system, but the writer should not be required to understand any of them to write a story:
   - *Default*: Write.
   - *When needed*: Ask (<kbd>Ctrl+J</kbd>).
   - *When organizing*: Plan.
   - *When something feels wrong*: Review.
   - *When publishing*: Publish.

---

## 2. Progressive Disclosure: Simplicity on Top, Power Underneath

InkFlow 2.0 rejects the "cockpit of panels" antipattern. The interface progressively reveals depth only when the author demands it:

```
┌────────────────────────────────────────────────────────────────────────┐
│ LEVEL 1: The Daily Writer (Default Experience)                         │
│ • Pure writing canvas (Serif typography, generous margins, auto-save)  │
│ • Simple chapter/scene navigator                                       │
│ • Inline AI actions (Rewrite, Expand, Make Tense, Continue)            │
├────────────────────────────────────────────────────────────────────────┤
│ LEVEL 2: The Organized Novelist (One Click Away)                       │
│ • Scene Context Panel (POV, Goal, Conflict, Characters Present)         │
│ • Scene Beats checklist                                                │
│ • Hierarchical Story Outline                                           │
│ • "Peek, don't navigate" character/location cards                      │
├────────────────────────────────────────────────────────────────────────┤
│ LEVEL 3: The Worldbuilder & Architect (DevTools Mental Model)          │
│ • Story Brain (Entity registry, Temporal Character States)             │
│ • Story Linter (Continuity checks, Knowledge conflicts, Broken clues)  │
│ • Visual Plot Grid & Timeline Matrix                                   │
│ • Snapshot History & Branching                                         │
├────────────────────────────────────────────────────────────────────────┤
│ LEVEL 4: Power Users & Developers (Settings & Inspectors)               │
│ • Context Engine Inspector (StoryContextPack token budgets)            │
│ • Model Router (Gemini Cloud vs. Ollama Local switching)               │
│ • Custom AI Task Contracts & JSON schemas                              │
└────────────────────────────────────────────────────────────────┘
```

---

## 3. The Momentum Engine: Writer Retention Without Gamification

InkFlow 2.1 introduces a purposeful retention architecture designed around creative momentum rather than manipulative gamification:

```
CONTINUE ➔ WRITE ➔ SESSION ➔ PROGRESS & STORY STATE ➔ MILESTONE ➔ RETURN
```

### 3.1 The 4 Retention Pillars + Story Momentum
1. **Workflow Retention (Reedsy-style)**: The entire novel lifecycle lives in one place—Plan, Write, Remember, Revise, and Format.
2. **Habit Retention (Novlr-style)**: Session duration, words added, and gentle weekly momentum targets without shame-based broken streak penalties.
3. **Story Investment (Novelcrafter-style)**: As the writer develops characters, locations, and clues, InkFlow becomes the living story memory.
4. **Project Ownership (Scrivener-style)**: Manuscripts, scene cards, snapshots, and research live in a local, private workspace.
5. **The Differentiator — Story Momentum**: When the author returns, they are presented with an immediate cognitive snapshot of where they left off:
   - *Last scene & last paragraph written*: Reminds the author of the narrative voice and tone.
   - *Current scene goal & conflict*: Re-anchors dramatic intent.
   - *Unresolved clues & active plot threads*: Surfs open narrative questions.
   - *Weekly momentum tally*: e.g., `1,240 / 2,000 words this week · 3 scenes completed`.
   - *One-click action*: `[ Continue Writing ➔ ]` immediately centers cursor in the editor.

### 3.2 Non-Gamified Ethics
- ❌ No XP, coins, badges, loot boxes, or levels.
- ❌ No manipulative guilt notifications ("You missed your streak!").
- ✅ Literary milestones (Act I completed, scene drafted, draft completed).
- ✅ Objective: **Finish your story**, not produce maximum word volume.

---

## 4. High-Level System Architecture

```mermaid
graph TD
    subgraph UI_Surface [Calm Presentation Layer (React 19 + Tailwind CSS v4)]
        HomeView[1. Home Mode]
        WriteView[2. Write Mode (Primary)]
        PlanView[3. Plan Mode]
        BrainView[4. Story Brain Mode]
        ReviewView[5. Review Mode / Linter]
        PublishView[6. Publish Mode]
    end

    subgraph State_Bus [Global Reactive State (Zustand)]
        ActiveState[Active Project & Scene State]
        UIState[Mode, Panels, Focus Mode, Overlays]
    end

    subgraph Core_Engine [Deep Story Engine (Underneath the Surface)]
        StoryRuntime[Story Runtime Engine]
        ContextEngine[Context Pack Engine]
        StoryLinter[Story Linter & Diagnostics]
        SceneParser[Background Scene Parser]
    end

    subgraph Intelligence [AI Runtime Layer]
        ModelRouter[Model Router]
        Gemini[Google Gemini API (Default Cloud)]
        Ollama[Ollama Instance (Local Offline)]
    end

    subgraph Storage [Offline-First Local Storage (Dexie.js / IndexedDB)]
        DB[(InkFlow Database)]
        ManuscriptsTable[Manuscripts / Scenes]
        EntitiesTable[Characters / Locations / Lore]
        EventsTable[Event Store / Timeline]
        SnapshotsTable[Scene Version Snapshots]
    end

    WriteView --> ActiveState
    ActiveState --> StoryRuntime
    StoryRuntime --> SceneParser
    SceneParser --> DB
    StoryRuntime --> ContextEngine
    ContextEngine --> ModelRouter
    ModelRouter --> Gemini
    ModelRouter --> Ollama
    ModelRouter --> WriteView
    StoryRuntime --> StoryLinter
    StoryLinter --> ReviewView
```

---

## 4. Screen-by-Screen Wireframes & UX Flow Specifications

### 4.1 Screen 1: Home Mode (The Return Gateway)
The Home screen answers three questions immediately:
1. *What was I writing?*
2. *Where did I stop?*
3. *How do I continue?*

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  InkFlow                                                         [Settings]  │
│                                                                              │
│  Good evening, Author.                                                      │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  CURRENT STORY                                                         │  │
│  │  The Shadow of Castle Black                                            │  │
│  │  Chapter 7 · Scene 2 — The Alchemist's Crypt                           │  │
│  │                                                                        │  │
│  │  "Emma gripped the cold iron talisman as footsteps echoed above..."    │  │
│  │  Last edited 18 minutes ago · 34,820 words total                       │  │
│  │                                                                        │  │
│  │  [ Continue Writing ➔ ]                                               │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  RECENT STORIES                     TEMPLATES & STARTERS                     │
│  ┌───────────────────────────────┐  ┌──────────────────────────────────────┐ │
│  │ Whispers in the Deep          │  │ [ + Start New Story ]                │ │
│  │ 12,400 words · Ch 3           │  │ ○ Blank Story (Start writing now)    │ │
│  └───────────────────────────────┘  │ ○ Three-Act Structure (Classic)      │ │
│  ┌───────────────────────────────┐  │ ○ Hero's Journey (Mythic Adventure)  │ │
│  │ Neon Syndicate (Cyberpunk)    │  │ ○ 10-Chapter Novel (Focused Novella) │ │
│  │ 48,150 words · Ch 9           │  │ ○ Mystery / Detective Arc            │ │
│  └───────────────────────────────┘  └──────────────────────────────────────┘ │
│                                                                              │
│  DAILY HABIT: 780 / 1,000 words today   ● ● ● ● ○ (4-day streak)             │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

### 4.2 Screen 2: New Story Flow (The 10-Second Launch)
Writers can either start typing on a blank canvas or provide a one-sentence idea for lightweight automated scaffolding:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Start a New Story                                                  [ Close ] │
│                                                                              │
│  Tell InkFlow what you're imagining:                                        │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ A disgraced clockmaker discovers that the imperial clocks are being    │  │
│  │ used to steal five minutes from everyone's lifespan each day.           │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ✨ InkFlow detected:                                                        │
│  • Genre: Steampunk Fantasy / Mystery                                        │
│  • Protagonist: The Disgraced Clockmaker                                     │
│  • Core Conflict: Time theft via imperial infrastructure                     │
│                                                                              │
│  How would you like to start?                                                │
│  [ Start Writing Scene 1 Now ]    [ Build Quick Story Plan ]    [ Blank Page ]│
└──────────────────────────────────────────────────────────────────────────────┘
```

---

### 4.3 Screen 3: Write Mode (The Core Workbench)
The primary screen where 90% of the author's time is spent. Clean, quiet, and spacious.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [≡] The Shadow of Castle Black    Ch 7 / Scene 2    [Focus]  [✨ AI]  [Review ⚠ 1]│
├─────────────┬──────────────────────────────────────────────────┬─────────────┤
│ CHAPTERS    │              Chapter 7: The Crypt                │ SCENE INFO  │
│             │                                                  │             │
│ ▸ Ch 5 (2)  │  The heavy iron hinges groaned as Emma leaned    │ POV         │
│ ▸ Ch 6 (3)  │  her full weight against the subterranean door.  │ Emma        │
│ ▾ Ch 7 (2)  │  The air that rushed to meet her was thick with  │             │
│   Sc 1: Gate│  the scent of wet stone and ancient sulfur.      │ LOCATION    │
│  ▶Sc 2: Crypt│                                                  │ Castle Crypt│
│ ▸ Ch 8 (1)  │  "Victor isn't alone down here," she whispered,  │             │
│             │  her fingers finding the silver seal in her      │ GOAL        │
│             │  pocket. The metal was burning hot.              │ Find altar  │
│             │                                                  │             │
│             │  Across the vaulted hall, an obsidian brazier    │ CONFLICT    │
│             │  flared to life without flint or spark. A figure │ Victor has  │
│             │  stepped into the light—not Victor, but someone  │ sentinels   │
│             │  wearing the ceremonial robes of the High Guild. │             │
│             │                                                  │ CHARACTERS  │
│             │  "You shouldn't have opened that door, Detective."│ • Emma      │
│             │                                                  │ • Sentinel  │
│             │                                                  │ • Victor (M)│
│             │                                                  │             │
│             │                                                  │ [Collapse ❯]│
├─────────────┴──────────────────────────────────────────────────┴─────────────┤
│ 2,410 words in scene · 34,820 total · 12 min read        ● Saved to IndexedDB│
└──────────────────────────────────────────────────────────────────────────────┘
```

---

### 4.4 Screen 4: Focus Mode (<kbd>Ctrl+Shift+F</kbd>)
Inspired by *iA Writer*. All UI chrome disappears. Only the centered manuscript text and the typewriter cursor remain.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│                                                                              │
│                                                                              │
│             The heavy iron hinges groaned as Emma leaned her                 │
│             full weight against the subterranean door. The air              │
│             that rushed to meet her was thick with the scent of              │
│             wet stone and ancient sulfur.                                    │
│                                                                              │
│             "Victor isn't alone down here," she whispered,                   │
│             her fingers finding the silver seal in her pocket.               │
│             The metal was burning hot.                                       │
│                                                                              │
│             Across the vaulted hall, an obsidian brazier flared              │
│             to life without flint or spark. [|]                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│  [Esc or Ctrl+Shift+F to exit focus]                      2,410 words · Saved │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

### 4.5 Screen 5: Inline AI Actions & Side-by-Side Diff Preview
Selecting text triggers an unobtrusive floating palette. Changes are **never** committed without explicit author approval.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│             Across the vaulted hall, an obsidian brazier flared to life.     │
│             ┌─────────────────────────────────────────────────────────┐      │
│             │ ✨ [Improve]  [Deepen Subtext]  [Tension]  [Expand]  ⋯ │      │
│             └─────────────────────────────────────────────────────────┘      │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ AI SUGGESTION PREVIEW                                                  │  │
│  ├────────────────────────────────────┬───────────────────────────────────┤  │
│  │ ORIGINAL                           │ SUGGESTED REVISION                │  │
│  │                                    │                                   │  │
│  │ Across the vaulted hall, an        │ Across the flooded nave, an       │  │
│  │ obsidian brazier flared to life.   │ obsidian brazier flared to life,  │  │
│  │                                    │ casting twin shadows that         │  │
│  │                                    │ stretched unnaturally toward her. │  │
│  ├────────────────────────────────────┴───────────────────────────────────┤  │
│  │ Rationale: Heightens environmental gothic tension before sentinel entrance │  │
│  │ [ Replace Selection ]     [ Insert Below ]     [ Discard ]    [ Explain ] │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

### 4.6 Screen 6: Plan Mode (Outline, Corkboard, Plot Grid)
Writers switch between three views depending on whether they are organizing scenes, checking beats, or tracking subplots:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [≡] Story Plan: The Shadow of Castle Black    [Outline]  [Cards]  [Plot Grid] │
├──────────────────────────────────────────────────────────────────────────────┤
│ PLOTTR-STYLE TIMELINE GRID                                                   │
│                                                                              │
│ PLOTLINE          ACT I: The Arrival          ACT II: The Blood Crypt        │
│ ───────────────────────────────────────────────────────────────────────────  │
│ Main Mystery      [Sc 1: Gatehouse Entry] ─── [Sc 2: Subterranean Altar]     │
│                   Emma senses Victor inside   Discovers High Guild betrayal  │
│                                                                              │
│ Character Arc     [Sc 1: Grandfather Memory]  [Sc 2: Seal Activates]         │
│ (Emma)            Grips silver ring           Ring burns with magic          │
│                                                                              │
│ Subplot: Guild    [Sc 1: Empty Guards Post] ─ [Sc 2: Guild Sentinel]         │
│ Conspiracy        No imperial guards present  Confrontation with robed monk  │
│                                                                              │
│ Clue Ledger       [Clue: Wagon wheel ruts] ── [Clue: Alchemical sulfur]      │
│                                                                              │
│ [ + Add Plotline ]                                                           │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

### 4.7 Screen 7: Story Brain ("Peek, Don't Navigate" & In-Place Inspector)
Hovering over any character, location, or clue in the editor or outline displays an instant peek card. Clicking opens an in-place side drawer without losing the author's cursor position.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ WRITE CANVAS                      │ IN-PLACE BRAIN INSPECTOR     [ Close ✕ ] │
├───────────────────────────────────┼──────────────────────────────────────────┤
│ Emma stepped into the crypt. Her  │ CHARACTER: Detective Emma                │
│ grandfather's silver ring grew    │ Protagonist · Age 29 · Northern Division │
│ searing hot.                      │                                          │
│                                   │ TEMPORAL KNOWLEDGE STATE (At Ch 7 / Sc 2)│
│                                   │ • Knows: Victor is inside Castle Black   │
│                                   │ • Knows: The Silver Ring is an alchemical│
│                                   │   key to subterranean vaults             │
│                                   │ • DOES NOT KNOW: Her grandfather was     │
│                                   │   a founding member of the Blood Guild   │
│                                   │                                          │
│                                   │ RELATIONSHIPS & TRUST                    │
│                                   │ ➔ Victor (Antagonist): Hostile (-90)     │
│                                   │ ➔ Coachman Caleb: Neutral (+10)          │
│                                   │                                          │
│                                   │ SCENE APPEARANCES                        │
│                                   │ Ch 1 · Ch 2 · Ch 4 · Ch 6 · Ch 7 (Active)│
│                                   │                                          │
│                                   │ [ Edit Full Profile ] [ View Timeline ]  │
└───────────────────────────────────┴──────────────────────────────────────────┘
```

---

### 4.8 Screen 8: Review Mode (The Story Linter)
Static analysis for narrative continuity and dramatic consistency. Alerts are presented calmly as constructive authorial suggestions, not compile failures.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [≡] Story Linter: 2 Items Worth Checking                           [ Re-run ]│
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ ⚠ KNOWLEDGE CONFLICT · Medium Severity                                        │
│   Chapter 7, Scene 2 (The Crypt):                                            │
│   "Emma recognized the insignia of the High Guild immediately."              │
│                                                                              │
│   Why this was flagged:                                                      │
│   In Chapter 3, Scene 1, Emma explicitly tells Detective Vance she has       │
│   never seen a High Guild insignia before.                                   │
│                                                                              │
│   [ Compare Scenes Side-by-Side ]   [ This is Intentional ]   [ Suggest Fix ]│
│                                                                              │
│ ──────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│ ℹ UNRESOLVED PROMISE (Chekhov's Gun) · Low Severity                          │
│   The Silver Letter Opener introduced in Chapter 2, Scene 3 has not been     │
│   mentioned for 5 chapters (14,200 words).                                   │
│                                                                              │
│   [ View Introduction Scene ]       [ Mark as Ongoing Mystery ] [ Dismiss ]  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

### 4.9 Screen 9: Publish Mode (Atticus-Grade Formatting Studio)
One-click compilation into distributor-ready formats with professional typographic controls.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [≡] Publish Studio: The Shadow of Castle Black              [ Export Book ➔ ]│
├──────────────────────────┬───────────────────────────────────────────────────┤
│ FORMATTING CONTROLS      │ LIVE PRINT PREVIEW                                │
│                          │                                                   │
│ Book Theme               │                                                   │
│ [ Classic Serif ▾ ]      │                   CHAPTER VII                     │
│                          │                                                   │
│ Trim Size                │                The Blood Crypt                    │
│ [ 6" x 9" Trade PB ▾ ]   │                                                   │
│                          │      HE heavy iron hinges groaned as Emma leaned  │
│ Ornamental Glyphs        │  T   her full weight against the subterranean     │
│ [ Fleur-de-lis (❦) ▾ ]   │  door. The air that rushed to meet her was        │
│                          │  thick with the scent of wet stone and ancient    │
│ Front Matter             │  sulfur.                                          │
│ [✓] Title Page           │      "Victor isn't alone down here," she whis-    │
│ [✓] Copyright Notice     │  pered, her fingers finding the silver seal in    │
│ [ ] Dedication           │  her pocket. The metal was burning hot.           │
│                          │                                                   │
│ Output Formats           │                                                   │
│ [✓] Standard EPUB 3.0    │                                                   │
│ [✓] Print-Ready PDF      │                                                   │
│ [✓] Word Manuscript (.doc│                                                   │
│                          │                                          — 142 —  │
└──────────────────────────┴───────────────────────────────────────────────────┘
```

---

## 5. Responsive & Mobile Viewport Strategy

Writers frequently capture ideas and draft scenes on mobile devices or tablets. Rather than shrinking the desktop layout, InkFlow shifts into a **Write-First Drawer Architecture**:

```
┌──────────────────────────────────────┐
│ ≡  The Shadow of Castle Black    ✨  │
├──────────────────────────────────────┤
│                                      │
│ Emma stepped into the crypt. The     │
│ cold stone walls dripped with dark   │
│ condensation.                        │
│                                      │
│ "Victor," she whispered.             │
│                                      │
│ A sound answered her from the        │
│ shadows—not footsteps, but the       │
│ slow scraping of metal against bone. │
│                                      │
│                                      │
├──────────────────────────────────────┤
│ [Keyboard Toolbar]  Bold  Italic  ✨ │
├──────────────────────────────────────┤
│ ✍ Write   🗺 Plan   🧠 Brain   ✓ Lint │
└──────────────────────────────────────┘
```
- **Mobile Write Canvas**: 100% full-screen distraction-free input.
- **Swipe-up Scene Context**: Bottom drawer reveals active POV, goal, conflict, and character peek cards.
- **Quick Voice/Text Idea Capture**: Instant floating action button to dictate a character note or scene beat directly into the Story Brain.

---

## 6. Complete Domain Model & Dexie Schemas (v2 Specification)

The Dexie.js database schema is upgraded to support the full hierarchical model:

```typescript
import Dexie, { type Table } from 'dexie';

export interface Project {
  id: string;
  title: string;
  genre: string;
  targetWordCount: number;
  description: string;
  activeSceneId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Part {
  id: string;
  projectId: string;
  title: string;
  order: number;
}

export interface Act {
  id: string;
  projectId: string;
  partId?: string;
  title: string;
  order: number;
}

export interface Chapter {
  id: string;
  projectId: string;
  actId?: string;
  title: string;
  order: number;
  summary?: string;
}

export interface Scene {
  id: string;
  chapterId: string;
  projectId: string;
  title: string;
  order: number;
  contentHtml: string;
  wordCount: number;
  povCharacterId?: string;
  locationId?: string;
  storyTime?: string;
  sceneGoal?: string;
  conflict?: string;
  outcome?: string;
  beats: { id: string; description: string; completed: boolean }[];
  charactersPresent: string[];
  activePlotThreadIds: string[];
  status: 'empty' | 'drafted' | 'revised' | 'completed';
  createdAt: number;
  updatedAt: number;
}

export interface CharacterEntity {
  id: string;
  projectId: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  age?: string;
  occupation?: string;
  voiceNotes?: string;
  relationships: { targetCharacterId: string; relationshipType: string; trustScore: number }[];
  status: 'alive' | 'deceased' | 'unknown';
  updatedAt: number;
}

export interface TemporalCharacterState {
  id: string;
  characterId: string;
  sceneId: string;
  knownFacts: string[];
  falseBeliefs: string[];
  emotionalState: string;
}

export interface StoryPromise {
  id: string;
  projectId: string;
  introducedSceneId: string;
  resolvedSceneId?: string;
  title: string; // E.g., "The Silver Letter Opener"
  promiseType: 'chekhov_gun' | 'mystery_question' | 'prophecy' | 'vow';
  status: 'open' | 'progressing' | 'resolved' | 'abandoned';
}

export interface SceneSnapshot {
  id: string;
  sceneId: string;
  label: string; // E.g., "Pre-AI Rewrite", "First Draft"
  contentHtml: string;
  timestamp: number;
}

export class InkFlowDatabase extends Dexie {
  projects!: Table<Project>;
  parts!: Table<Part>;
  acts!: Table<Act>;
  chapters!: Table<Chapter>;
  scenes!: Table<Scene>;
  characters!: Table<CharacterEntity>;
  characterStates!: Table<TemporalCharacterState>;
  promises!: Table<StoryPromise>;
  snapshots!: Table<SceneSnapshot>;

  constructor() {
    super('InkFlowDatabase_v2');
    this.version(1).stores({
      projects: 'id, title, updatedAt',
      parts: 'id, projectId, order',
      acts: 'id, projectId, partId, order',
      chapters: 'id, projectId, actId, order',
      scenes: 'id, chapterId, projectId, order, povCharacterId, status',
      characters: 'id, projectId, name, role',
      characterStates: 'id, characterId, sceneId',
      promises: 'id, projectId, status, introducedSceneId',
      snapshots: 'id, sceneId, timestamp',
    });
  }
}

export const db = new InkFlowDatabase();
```

---

## 7. Context Engine: Precision Context Packs

The **Context Engine** assembles lean, high-signal prompt packages dynamically:

```typescript
export interface StoryContextPack {
  project: { title: string; genre: string; tone: string };
  sceneMeta: {
    title: string;
    goal?: string;
    conflict?: string;
    currentBeats: string[];
    povCharacterName?: string;
  };
  immediatePrecedingProse: string; // Last 500-1000 words for stylistic continuity
  charactersInScene: {
    name: string;
    role: string;
    voiceGuideline?: string;
    whatTheyCurrentlyKnow: string[];
  }[];
  activeCluesAndPromises: string[];
  styleProfile: {
    povTense: 'past' | 'present';
    povPerspective: 'first' | 'third_limited' | 'third_omniscient';
    forbiddenClichés: string[];
  };
}
```

---

## 8. Multi-Provider AI Runtime

```typescript
export interface AIRuntimeTask<TInput, TOutput> {
  task: string;
  input: TInput;
  schema: object; // Strict JSON schema for structured outputs
  execute: (provider: 'gemini' | 'ollama') => Promise<TOutput>;
}
```
- **Gemini Provider (Cloud Default)**: Utilizes `gemini-2.5-flash` for rapid parsing, entity extraction, and linter scanning; utilizes `gemini-2.5-pro` for deep structural story doctor reviews.
- **Ollama Provider (Local Offline)**: Connects to `http://localhost:11434` for 100% private, off-grid writing with automatic reasoning `<think>` tag stripping.

---

## 9. Phased Implementation Roadmap

| Phase | Milestone | Deliverables |
| :--- | :--- | :--- |
| **Phase 0** | **Domain & Navigation Foundation** | Implement Dexie v2 schema (Parts, Acts, Chapters, Scenes); setup 5-mode header navigation. |
| **Phase 1** | **The Calm Workbench (Write Mode)** | Refactor TipTap editor to bind to `Scene`; build smart collapsible Scene Info panel; implement <kbd>Ctrl+Shift+F</kbd> Focus Mode with centered typewriter scrolling. |
| **Phase 2** | **Story Plan Studio** | Build hierarchical Outliner, Corkboard scene cards, and Plottr-style Timeline Grid with draggable scene cards and beats checklist. |
| **Phase 3** | **Story Brain & In-Place Inspector** | Build peek-cards and flyout drawer for Characters, Locations, Lore; implement temporal character state tracking. |
| **Phase 4** | **Context Engine & AI Runtime** | Implement Context Pack builder; establish Gemini API + Ollama provider router with strict JSON schema outputs. |
| **Phase 5** | **Action-Oriented AI & Diff Previews** | Build floating inline AI toolbar (`[Improve]`, `[Tension]`, `[Expand]`) with side-by-side diff previews and one-click accept/reject. |
| **Phase 6** | **The Story Linter** | Build automated background diagnostics for character knowledge conflicts, timeline discrepancies, and Chekhov gun promises. |
| **Phase 7** | **Publish Studio** | Atticus-grade theme formatter with front/back matter and export to EPUB, print PDF, and Word `.docx`. |
