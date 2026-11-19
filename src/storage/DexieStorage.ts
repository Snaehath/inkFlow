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
  // 1. Clean up legacy demo-project-1 and studio essay if present from earlier runs
  try {
    const oldDemo = await db.projects.get('demo-project-1');
    if (oldDemo) {
      await db.projects.delete('demo-project-1');
      await db.chapters.where('projectId').equals('demo-project-1').delete();
      await db.scenes.where('projectId').equals('demo-project-1').delete();
      await db.characters.where('projectId').equals('demo-project-1').delete();
      await db.locations.where('projectId').equals('demo-project-1').delete();
      await db.worldLore.where('projectId').equals('demo-project-1').delete();
      await db.plotThreads.where('projectId').equals('demo-project-1').delete();
      await db.promises.where('projectId').equals('demo-project-1').delete();
      await db.snapshots.where('projectId').equals('demo-project-1').delete();
      await db.linterIssues.where('projectId').equals('demo-project-1').delete();
    }
    const oldEssay = await db.projects.get('project-studio-essay');
    if (oldEssay) {
      await db.projects.delete('project-studio-essay');
      await db.chapters.where('projectId').equals('project-studio-essay').delete();
      await db.scenes.where('projectId').equals('project-studio-essay').delete();
    }
  } catch {
    // Ignore cleanup errors
  }

  const primaryProjectId = 'project-glass-orchard';
  const primarySceneId = 'sc-04-1';
  const guideSceneId = 'sc-01-1';
  const glassOrchardExists = await db.projects.get(primaryProjectId);

  if (!glassOrchardExists) {
    const now = Date.now();

    // 1. Primary Hero Project: The Glass Orchard
    await db.projects.add({
      id: primaryProjectId,
      title: 'The Glass Orchard',
      genre: 'Novel',
      targetWordCount: 75000,
      description: 'Elara investigates the mysterious coastal town of Harborwick and an enigmatic glasshouse orchard.',
      activeSceneId: primarySceneId,
      createdAt: now,
      updatedAt: now,
    });

    // 2. Chapters for The Glass Orchard
    const glassChapters: Chapter[] = [
      {
        id: 'ch-01',
        projectId: primaryProjectId,
        title: 'Chapter 01 — The Letter & Studio Guide',
        order: 1,
        summary: 'A stained envelope arrives bearing news from the coast, plus inkFlow quick start instructions.',
        createdAt: now - 86400000 * 4,
        updatedAt: now - 86400000 * 4,
      },
      {
        id: 'ch-02',
        projectId: primaryProjectId,
        title: 'Chapter 02 — Crossing',
        order: 2,
        summary: 'The long northern train journey across fogged estuaries.',
        createdAt: now - 86400000 * 3,
        updatedAt: now - 86400000 * 3,
      },
      {
        id: 'ch-03',
        projectId: primaryProjectId,
        title: 'Chapter 03 — The Town',
        order: 3,
        summary: 'First impressions of the salt-crusted alleys of Harborwick.',
        createdAt: now - 86400000 * 2,
        updatedAt: now - 86400000 * 2,
      },
      {
        id: 'ch-04',
        projectId: primaryProjectId,
        title: 'Chapter 04 — The Quiet Between',
        order: 4,
        summary: 'Elara steps onto the rain-slick platform into the damp salt air.',
        createdAt: now - 3600000,
        updatedAt: now,
      },
      {
        id: 'ch-05',
        projectId: primaryProjectId,
        title: 'Chapter 05 — New Rooms',
        order: 5,
        summary: 'Unpacking beside high leaded windows overlooking the sea.',
        createdAt: now,
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
      title: 'Chapter 01 — The Letter & Studio Guide',
      order: 1,
      povCharacterId: 'char-elara',
      locationId: 'loc-study',
      storyTime: 'Early morning, rainy autumn',
      sceneGoal: 'Understand inkFlow capabilities and begin the investigation',
      conflict: 'Balancing authorial voice with contextual AI assistance',
      outcome: 'Confidence in crafting manuscripts with inkFlow',
      beats: [
        { id: 'b-guide-1', description: 'Review the letter from Harborwick', completed: true },
        { id: 'b-guide-2', description: 'Experiment with Continue, Rewrite, and Expand in the AI Partner panel', completed: false },
        { id: 'b-guide-3', description: 'Explore Skills & AI Studio to customize writing persona', completed: false },
      ],
      charactersPresent: ['char-elara'],
      activePlotThreadIds: ['plot-glass-orchard'],
      contentHtml: `<p>The wax on the envelope seal had cracked during the journey, but the impression remained clear: an orchard branch entwined with an iron key.</p><p><em>“If you are reading this, Elara, the glasshouse has begun to whisper again. Come to Harborwick before the autumn tides turn.”</em></p><hr /><h3>How to Use inkFlow Writing Studio</h3><p>Welcome to inkFlow. This workspace is designed so that <strong>you remain in control</strong>. AI is a creative collaborator sitting beside your manuscript, not an intrusive chatbot.</p><ul><li><strong>Distraction-Free Canvas:</strong> Write directly in this central editor. Use <kbd>Ctrl+B</kbd> for bold, <kbd>Ctrl+I</kbd> for italic, or click the expand icon in the top bar for full focus mode.</li><li><strong>Contextual AI Writing Partner (Right Panel):</strong> Select any passage and click <em>Rewrite</em> to polish prose, <em>Expand</em> to deepen sensory detail, or <em>Continue</em> to explore natural next lines.</li><li><strong>Inline Reviewable Cards:</strong> Every continuation provides <em>Accept</em>, <em>Try another</em>, or <em>Dismiss</em>. Your draft is never changed without explicit approval.</li><li><strong>Skills &amp; AI Studio:</strong> Shape your assistant in plain Markdown under the <em>Skills</em> tab. Define voice, style, and rules.</li><li><strong>Local &amp; Private:</strong> inkFlow communicates directly with your local Ollama instance—no cloud tokens or third-party servers.</li></ul>`,
      wordCount: 382,
      status: 'drafted',
      createdAt: now - 86400000 * 4,
      updatedAt: now - 86400000 * 4,
    });

    // Primary Scene in Chapter 04
    await db.scenes.add({
      id: primarySceneId,
      chapterId: 'ch-04',
      projectId: primaryProjectId,
      title: 'The Quiet Between',
      order: 1,
      povCharacterId: 'char-elara',
      locationId: 'loc-harborwick-station',
      storyTime: 'Late afternoon, October rain',
      sceneGoal: 'Arrive at Harborwick without drawing unwanted eyes',
      conflict: 'The silence of the town feels watchful and heavy with memory',
      outcome: 'Elara steps into Harborwick, determined to uncover the truth',
      beats: [
        { id: 'b-1', description: 'Train halts into rain-slick station', completed: true },
        { id: 'b-2', description: 'Step onto the glistening stone platform', completed: true },
        { id: 'b-3', description: 'Smell salt air and peeling paint of Harborwick sign', completed: true },
        { id: 'b-4', description: 'Look toward the town and choose a direction', completed: false },
      ],
      charactersPresent: ['char-elara'],
      activePlotThreadIds: ['plot-glass-orchard'],
      contentHtml: `<p>The train shuddered to a halt at the coastal station, its brakes hissing into the rain. Elara stepped down onto the glistening platform, her coat already heavy with the sea's damp breath. The station was smaller than she had expected—an aging structure of stone and worn wood, with a faded sign that still read Harborwick in peeling paint.</p><p>A cold wind swept in from the docks, carrying the smell of salt and wet timber. Few people lingered under the arched roof; a porter wheeled a trunk across the stones, and somewhere beyond, a gull cried into the gray afternoon.</p><p>Elara paused, adjusting the strap of her bag, and looked toward the town beyond the station. It felt both unfamiliar and strangely expected, as if she had arrived at a place she had been moving toward for far longer than she realized.</p>`,
      wordCount: 1247,
      status: 'drafted',
      createdAt: now - 3600000,
      updatedAt: now,
    });

    // 4. City Letters (Short Story)
    await db.projects.add({
      id: 'project-city-letters',
      title: 'City Letters',
      genre: 'Short Story',
      targetWordCount: 25000,
      description: 'Epistolary dispatches across shifting European capitals.',
      createdAt: now - 86400000 * 3,
      updatedAt: now - 3600000 * 3,
    });
    await db.chapters.add({
      id: 'ch-city-01',
      projectId: 'project-city-letters',
      title: 'Postmarked Prague, 1928',
      order: 1,
      createdAt: now - 86400000 * 3,
      updatedAt: now - 3600000 * 3,
    });
    await db.scenes.add({
      id: 'sc-city-01',
      chapterId: 'ch-city-01',
      projectId: 'project-city-letters',
      title: 'The Clockmaker\'s Lane',
      order: 1,
      beats: [],
      charactersPresent: [],
      activePlotThreadIds: [],
      contentHtml: `<p>My dearest Julian, the snow here does not fall so much as hover between the copper spires. I have found rooms above a bookbinder whose shop smells of rabbit glue and cedarwood.</p>`,
      wordCount: 4920,
      status: 'drafted',
      createdAt: now - 86400000 * 3,
      updatedAt: now - 3600000 * 3,
    });

    // 5. A Quiet Rain (Blog Series)
    await db.projects.add({
      id: 'project-quiet-rain',
      title: 'A Quiet Rain',
      genre: 'Blog Series',
      targetWordCount: 15000,
      description: 'Reflections on solitude, prose rhythm, and observational essays.',
      createdAt: now - 86400000 * 2,
      updatedAt: now - 3600000 * 5,
    });
    await db.chapters.add({
      id: 'ch-rain-01',
      projectId: 'project-quiet-rain',
      title: 'On Writing in Silence',
      order: 1,
      createdAt: now - 86400000 * 2,
      updatedAt: now - 3600000 * 5,
    });
    await db.scenes.add({
      id: 'sc-rain-01',
      chapterId: 'ch-rain-01',
      projectId: 'project-quiet-rain',
      title: 'The Sound of Morning Mist',
      order: 1,
      beats: [],
      charactersPresent: [],
      activePlotThreadIds: [],
      contentHtml: `<p>There is a quality to morning rain that invites the pen forward. When the room is still, sentences find their natural cadence without the urgency of conversation.</p>`,
      wordCount: 3104,
      status: 'drafted',
      createdAt: now - 86400000 * 2,
      updatedAt: now - 3600000 * 5,
    });

    // 6. Wandering Songs (Story Collection)
    await db.projects.add({
      id: 'project-wandering-songs',
      title: 'Wandering Songs',
      genre: 'Story Collection',
      targetWordCount: 40000,
      description: 'Folkloric vignettes of musicians travelling between forgotten valleys.',
      createdAt: now - 86400000 * 7,
      updatedAt: now - 86400000,
    });
    await db.chapters.add({
      id: 'ch-wandering-01',
      projectId: 'project-wandering-songs',
      title: 'The Lowland Piper',
      order: 1,
      createdAt: now - 86400000 * 7,
      updatedAt: now - 86400000,
    });
    await db.scenes.add({
      id: 'sc-wandering-01',
      chapterId: 'ch-wandering-01',
      projectId: 'project-wandering-songs',
      title: 'Song of the River Stone',
      order: 1,
      beats: [],
      charactersPresent: [],
      activePlotThreadIds: [],
      contentHtml: `<p>Old Kenneth held his fiddle as one might hold an injured fledgling: gently, with fingers that remembered thirty winters of tavern hearths and harvest fairs.</p>`,
      wordCount: 17226,
      status: 'drafted',
      createdAt: now - 86400000 * 7,
      updatedAt: now - 86400000,
    });

    // 7. InkFlow Notes (Blog)
    await db.projects.add({
      id: 'project-inkflow-notes',
      title: 'InkFlow Notes',
      genre: 'Blog',
      targetWordCount: 20000,
      description: 'Studio dispatches on artificial intelligence, typography, and authorial autonomy.',
      createdAt: now - 86400000 * 5,
      updatedAt: now - 3600000 * 2,
    });
    await db.chapters.add({
      id: 'ch-notes-01',
      projectId: 'project-inkflow-notes',
      title: 'Principles of AI-Native Writing',
      order: 1,
      createdAt: now - 86400000 * 5,
      updatedAt: now - 3600000 * 2,
    });
    await db.scenes.add({
      id: 'sc-notes-01',
      chapterId: 'ch-notes-01',
      projectId: 'project-inkflow-notes',
      title: 'The Canvas as Interface',
      order: 1,
      beats: [],
      charactersPresent: [],
      activePlotThreadIds: [],
      contentHtml: `<p>When software treats AI as an autonomous author, the writer becomes a mere editor of generic prose. When AI is positioned as a contextual assistant, the author remains the visionary.</p>`,
      wordCount: 11090,
      status: 'drafted',
      createdAt: now - 86400000 * 5,
      updatedAt: now - 3600000 * 2,
    });

    // 8. Email Drafts (Email)
    await db.projects.add({
      id: 'project-email-drafts',
      title: 'Email Drafts',
      genre: 'Email',
      targetWordCount: 5000,
      description: 'Professional correspondence, agent queries, and editorial notes.',
      createdAt: now - 86400000 * 6,
      updatedAt: now - 3600000 * 8,
    });
    await db.chapters.add({
      id: 'ch-email-01',
      projectId: 'project-email-drafts',
      title: 'Agent Inquiry — Manuscript Proposal',
      order: 1,
      createdAt: now - 86400000 * 6,
      updatedAt: now - 3600000 * 8,
    });
    await db.scenes.add({
      id: 'sc-email-01',
      chapterId: 'ch-email-01',
      projectId: 'project-email-drafts',
      title: 'Query Letter — The Glass Orchard',
      order: 1,
      beats: [],
      charactersPresent: [],
      activePlotThreadIds: [],
      contentHtml: `<p>Dear Ms. Thorne,</p><p>I am pleased to present <em>The Glass Orchard</em>, an 75,000-word atmospheric mystery novel set against the decaying salt piers of Harborwick.</p>`,
      wordCount: 2148,
      status: 'drafted',
      createdAt: now - 86400000 * 6,
      updatedAt: now - 3600000 * 8,
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