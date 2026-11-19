import Dexie, { type Table } from 'dexie';
import type {
  Project,
  Chapter,
  Scene,
  CharacterEntity,
  TemporalCharacterState,
  LocationEntity,
  WorldLoreEntity,
  PlotThread,
  StoryPromise,
  SceneSnapshot,
  LinterIssue,
  WritingSession,
  WritingGoal,
  StoryMilestone
} from '../types';

export class InkFlowDatabase extends Dexie {
  projects!: Table<Project>;
  chapters!: Table<Chapter>;
  scenes!: Table<Scene>;
  characters!: Table<CharacterEntity>;
  characterStates!: Table<TemporalCharacterState>;
  locations!: Table<LocationEntity>;
  worldLore!: Table<WorldLoreEntity>;
  plotThreads!: Table<PlotThread>;
  promises!: Table<StoryPromise>;
  snapshots!: Table<SceneSnapshot>;
  linterIssues!: Table<LinterIssue>;
  sessions!: Table<WritingSession>;
  goals!: Table<WritingGoal>;
  milestones!: Table<StoryMilestone>;

  constructor() {
    super('InkFlowDatabase_v2');

    this.version(1).stores({
      projects: 'id, title, updatedAt',
      chapters: 'id, projectId, order, updatedAt',
      scenes: 'id, chapterId, projectId, order, povCharacterId, status, updatedAt',
      characters: 'id, projectId, name, role',
      characterStates: 'id, characterId, sceneId',
      locations: 'id, projectId, name',
      worldLore: 'id, projectId, title, category',
      plotThreads: 'id, projectId, status',
      promises: 'id, projectId, status, introducedSceneId',
      snapshots: 'id, sceneId, timestamp',
      linterIssues: 'id, sceneId, status, severity',
      sessions: 'id, projectId, startedAt',
      goals: 'id, projectId, period',
      milestones: 'id, projectId, completed',
    });
  }
}

export const db = new InkFlowDatabase();

// Seed initial demonstration novel database with hierarchical scenes, character knowledge, and linter alerts
export async function seedInitialDemoData(): Promise<{ projectId: string; sceneId: string }> {
  const primaryProjectId = 'project-glass-orchard';
  const primarySceneId = 'sc-02-1';
  const guideSceneId = 'sc-01-1';

  // Clean up all non-primary projects so only ONE default project remains
  try {
    const allProjects = await db.projects.toArray();
    for (const p of allProjects) {
      if (p.id !== primaryProjectId) {
        await db.projects.delete(p.id);
        await db.chapters.where('projectId').equals(p.id).delete();
        await db.scenes.where('projectId').equals(p.id).delete();
        await db.characters.where('projectId').equals(p.id).delete();
        await db.locations.where('projectId').equals(p.id).delete();
        await db.worldLore.where('projectId').equals(p.id).delete();
        await db.plotThreads.where('projectId').equals(p.id).delete();
        await db.promises.where('projectId').equals(p.id).delete();
        await db.snapshots.where('projectId').equals(p.id).delete();
        await db.linterIssues.where('projectId').equals(p.id).delete();
      }
    }
  } catch {
    // Ignore cleanup errors
  }

  const glassOrchardExists = await db.projects.get(primaryProjectId);

  if (!glassOrchardExists) {
    const now = Date.now();

    // 1. Single Primary Hero Project: The Glass Orchard
    await db.projects.add({
      id: primaryProjectId,
      title: 'The Glass Orchard',
      genre: 'Novel',
      targetWordCount: 75000,
      description: 'Elara arrives at the coastal town of Harborwick to uncover the secret of an enigmatic glasshouse orchard.',
      activeSceneId: primarySceneId,
      createdAt: now - 86400000 * 2,
      updatedAt: now,
    });

    // 2. Chapters for The Glass Orchard
    const glassChapters: Chapter[] = [
      {
        id: 'ch-01',
        projectId: primaryProjectId,
        title: 'Chapter 01 — Getting Started & Studio Guide',
        order: 1,
        summary: 'Essential instructions and walkthrough for mastering inkFlow AI writing studio.',
        createdAt: now - 86400000 * 2,
        updatedAt: now - 86400000 * 2,
      },
      {
        id: 'ch-02',
        projectId: primaryProjectId,
        title: 'Chapter 02 — The Quiet Between',
        order: 2,
        summary: 'Elara steps onto the rain-slick platform into the damp salt air of Harborwick.',
        createdAt: now - 3600000,
        updatedAt: now,
      },
    ];
    await db.chapters.bulkAdd(glassChapters);

    // 3. Scenes for The Glass Orchard
    // Guide Scene in Chapter 01
    await db.scenes.add({
      id: guideSceneId,
      chapterId: 'ch-01',
      projectId: primaryProjectId,
      title: 'Getting Started & Studio Guide',
      order: 1,
      povCharacterId: 'char-elara',
      locationId: 'loc-study',
      storyTime: 'Morning',
      sceneGoal: 'Master the inkFlow writing studio workflows',
      conflict: 'Staying in full control while collaborating with AI',
      outcome: 'A clear understanding of inkFlow principles and tools',
      beats: [
        { id: 'b-guide-1', description: 'Review the inkFlow core principles and distraction-free canvas', completed: true },
        { id: 'b-guide-2', description: 'Try Continue, Rewrite, and Expand in the contextual AI Partner panel', completed: false },
        { id: 'b-guide-3', description: 'Explore Skills & AI Studio to craft custom Markdown writing personas', completed: false },
      ],
      charactersPresent: ['char-elara'],
      activePlotThreadIds: ['plot-glass-orchard'],
      contentHtml: `<h1>Welcome to inkFlow</h1>
<p>inkFlow is an <strong>AI-native writing studio</strong> designed so that <em>you remain in complete authorial control</em>. AI is a creative collaborator sitting beside your manuscript, not an intrusive chatbot that takes over your story.</p>

<hr />

<h2>Core Experiences</h2>
<ol>
  <li><strong>Studio (Overview):</strong> Your dashboard for recent documents, project cards, and quick shortcuts (Story, Novel, Short Story, Email, Blog).</li>
  <li><strong>Writing Editor (The Hero):</strong> A distraction-free manuscript canvas with chapter navigation on the left and the contextual <em>Writing Partner</em> panel on the right.</li>
  <li><strong>Skills &amp; AI Studio:</strong> Shape how your writing agent behaves using plain Markdown. No endless confusing settings menus.</li>
</ol>

<hr />

<h2>How to Use Contextual AI</h2>
<ul>
  <li><strong>Continue:</strong> Suggests the next sentence or paragraph matching your tone and pacing.</li>
  <li><strong>Rewrite:</strong> Select any text and click Rewrite to polish phrasing without losing your voice.</li>
  <li><strong>Expand:</strong> Deepens sensory atmosphere, character body language, or world details.</li>
  <li><strong>Brainstorm:</strong> Explores alternative plot directions, motives, or narrative turns.</li>
  <li><strong>Reviewable Cards:</strong> Every continuation provides <strong>Accept</strong>, <strong>Try another</strong>, and <strong>Dismiss</strong>. Your manuscript is never overwritten without your consent.</li>
</ul>

<hr />

<h2>Privacy &amp; Local Intelligence</h2>
<p>inkFlow connects directly to your local <strong>Ollama</strong> instance. All models run 100% locally on your machine—your stories, ideas, and manuscripts stay completely private.</p>`,
      wordCount: 245,
      status: 'drafted',
      createdAt: now - 86400000 * 2,
      updatedAt: now - 86400000 * 2,
    });

    // Sample Manuscript Scene in Chapter 02
    await db.scenes.add({
      id: primarySceneId,
      chapterId: 'ch-02',
      projectId: primaryProjectId,
      title: 'The Quiet Between',
      order: 1,
      povCharacterId: 'char-elara',
      locationId: 'loc-harborwick-station',
      storyTime: 'Late afternoon, October rain',
      sceneGoal: 'Arrive at Harborwick without drawing unwanted eyes',
      conflict: 'The silence of the coastal town feels watchful and heavy with memory',
      outcome: 'Elara steps into Harborwick, determined to uncover the truth',
      beats: [
        { id: 'b-1', description: 'Train halts into rain-slick station', completed: true },
        { id: 'b-2', description: 'Step onto the glistening stone platform', completed: true },
        { id: 'b-3', description: 'Smell salt air and peeling paint of Harborwick sign', completed: true },
        { id: 'b-4', description: 'Look toward the town and choose a direction', completed: false },
      ],
      charactersPresent: ['char-elara'],
      activePlotThreadIds: ['plot-glass-orchard'],
      contentHtml: `<p>The train shuddered to a halt at the coastal station, its brakes hissing into the rain. Elara stepped down onto the glistening platform, her coat already heavy with the sea's damp breath. The station was smaller than she had expected—an aging structure of stone and worn wood, with a faded sign that still read <em>Harborwick</em> in peeling paint.</p>

<p>A cold wind swept in from the docks, carrying the smell of salt and wet timber. Few people lingered under the arched roof; a porter wheeled a trunk across the stones, and somewhere beyond, a gull cried into the gray afternoon.</p>

<p>Elara paused, adjusting the strap of her bag, and looked toward the town beyond the station. It felt both unfamiliar and strangely expected, as if she had arrived at a place she had been moving toward for far longer than she realized.</p>`,
      wordCount: 154,
      status: 'drafted',
      createdAt: now - 3600000,
      updatedAt: now,
    });
  }

  return { projectId: primaryProjectId, sceneId: primarySceneId };
}

// Reset entire database to pristine studio defaults
export async function resetToCleanDefaults(): Promise<{ projectId: string; sceneId: string }> {
  await db.projects.clear();
  await db.chapters.clear();
  await db.scenes.clear();
  await db.characters.clear();
  await db.characterStates.clear();
  await db.locations.clear();
  await db.worldLore.clear();
  await db.plotThreads.clear();
  await db.promises.clear();
  await db.snapshots.clear();
  await db.linterIssues.clear();
  await db.sessions.clear();
  await db.goals.clear();
  await db.milestones.clear();

  return seedInitialDemoData();
}