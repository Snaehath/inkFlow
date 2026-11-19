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
  const glassOrchardExists = await db.projects.get('project-glass-orchard');
  const primaryProjectId = 'project-glass-orchard';
  const primarySceneId = 'sc-04-1';

  if (!glassOrchardExists) {
    const now = Date.now();

    // 1. Primary Hero Project: The Glass Orchard
    await db.projects.add({
      id: primaryProjectId,
      title: 'The Glass Orchard',
      genre: 'Atmospheric Mystery Novel',
      targetWordCount: 75000,
      description: 'Elara investigates the mysterious coastal town of Harborwick and an enigmatic glasshouse orchard.',
      activeSceneId: primarySceneId,
      createdAt: now,
      updatedAt: now,
    });

    // Also add other projects shown in Studio UI: City Letters & Wandering Songs
    await db.projects.add({
      id: 'project-city-letters',
      title: 'City Letters',
      genre: 'Short stories',
      targetWordCount: 25000,
      description: 'Epistolary dispatches across shifting European capitals.',
      createdAt: now - 86400000 * 3,
      updatedAt: now - 3600000 * 3,
    });

    await db.projects.add({
      id: 'project-wandering-songs',
      title: 'Wandering Songs',
      genre: 'Story collection',
      targetWordCount: 40000,
      description: 'Folkloric vignettes of musicians travelling between forgotten valleys.',
      createdAt: now - 86400000 * 7,
      updatedAt: now - 86400000,
    });

    // 2. Chapters for The Glass Orchard
    const glassChapters: Chapter[] = [
      {
        id: 'ch-01',
        projectId: primaryProjectId,
        title: 'Chapter 01 — The Letter',
        order: 1,
        summary: 'A stained envelope arrives bearing news from the coast.',
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

    // 3. Scene for Chapter 04
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
  }

  const projectCount = await db.projects.count();
  const demoProjectId = 'demo-project-1';
  const firstSceneId = 'sc-1-1';

  if (projectCount === 0) {
    const now = Date.now();

    // 1. Project
    await db.projects.add({
      id: demoProjectId,
      title: 'The Shadow of Castle Black',
      genre: 'Dark Fantasy Mystery',
      targetWordCount: 80000,
      description: 'Detective Emma investigates ancient blood magic ritual murders in the northern mountains.',
      activeSceneId: firstSceneId,
      createdAt: now,
      updatedAt: now,
    });

    // 2. Chapters
    const chapters: Chapter[] = [
      {
        id: 'ch-1',
        projectId: demoProjectId,
        title: 'Chapter 1: The Arrival',
        order: 1,
        summary: 'Emma arrives at Castle Black amidst a northern gale and senses Victor inside.',
        createdAt: now - 86400000,
        updatedAt: now - 86400000,
      },
      {
        id: 'ch-2',
        projectId: demoProjectId,
        title: 'Chapter 2: The Forbidden Chamber',
        order: 2,
        summary: 'Emma uncovers an ancient oak door bearing the blood seal of Victor.',
        createdAt: now - 43200000,
        updatedAt: now - 43200000,
      },
      {
        id: 'ch-3',
        projectId: demoProjectId,
        title: 'Chapter 3: The Blood Crypt',
        order: 3,
        summary: 'Inside the subterranean crypt, an obsidian brazier flares and a guild sentinel confronts Emma.',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'ch-4',
        projectId: demoProjectId,
        title: 'Chapter 4: The Alchemist\'s Secret',
        order: 4,
        summary: 'A hidden laboratory reveals the true cost of the grand eclipse ritual.',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'ch-5',
        projectId: demoProjectId,
        title: 'Chapter 5: The Final Confrontation',
        order: 5,
        summary: 'Emma and Victor face each other atop the crumbling northern parapet.',
        createdAt: now,
        updatedAt: now,
      },
    ];
    await db.chapters.bulkAdd(chapters);

    // 3. Scenes
    const scenes: Scene[] = [
      {
        id: firstSceneId,
        chapterId: 'ch-1',
        projectId: demoProjectId,
        title: 'Carriage through the Murk',
        order: 1,
        povCharacterId: 'char-emma',
        locationId: 'loc-carriage',
        storyTime: 'October 14, 1894 - Nightfall',
        sceneGoal: 'Reach Castle Black before the northern storm closes the pass',
        conflict: 'Coachman Caleb refuses to drive closer to the fortress gates',
        outcome: 'Emma continues on foot into the fortress courtyard with her grandfather\'s ring',
        beats: [
          { id: 'b-1', description: 'Hear the tolling iron bell through carriage storm', completed: true },
          { id: 'b-2', description: 'Coachman halts horses; refuses to enter outer wall', completed: true },
          { id: 'b-3', description: 'Emma checks grandfather\'s silver ring; ring warms against skin', completed: true },
          { id: 'b-4', description: 'Step into the mud and approach the iron gates', completed: true },
        ],
        charactersPresent: ['char-emma', 'char-caleb'],
        activePlotThreadIds: ['plot-murders', 'plot-legacy'],
        contentHtml: `<h1>Chapter 1: The Arrival</h1><p>The night cold cut through Detective Emma's woolen coat like broken glass as her carriage lurched to a halt in front of Castle Black. Rain lashed against the ancient granite walls, carrying with it the unmistakable iron tang of fresh blood.</p><p>"We don't go any closer, miss," the coachman grunted, his fingers white on the reins. "The northern winds carry voices tonight, and none of them belong to the living."</p><p>Emma stepped down into the mud, pulling her collar high. She reached into her inner pocket and gripped the silver ring her grandfather had left her—its metallic chill oddly comforting against her fingers. Victor was inside. She could feel it.</p>`,
        wordCount: 104,
        status: 'drafted',
        createdAt: now - 3600000,
        updatedAt: now - 3600000,
      },
      {
        id: 'sc-1-2',
        chapterId: 'ch-1',
        projectId: demoProjectId,
        title: 'The Outer Courtyard',
        order: 2,
        povCharacterId: 'char-emma',
        locationId: 'loc-courtyard',
        storyTime: 'October 14, 1894 - 10:15 PM',
        sceneGoal: 'Survey the perimeter for signs of blood sorcerer activity',
        conflict: 'Frozen gate mechanisms and suspicious tracks',
        outcome: 'Discovers fresh wagon tracks leading toward the subterranean crypt',
        beats: [
          { id: 'b-5', description: 'Inspect wagon wheel ruts in the fresh frost', completed: true },
          { id: 'b-6', description: 'Notice strange absence of imperial guards', completed: true },
        ],
        charactersPresent: ['char-emma'],
        activePlotThreadIds: ['plot-murders'],
        contentHtml: `<p>The courtyard was deathly still save for the wind whistling through gargoyle arches. Frost crunched beneath Emma's boots as she knelt by the wheel ruts. Heavy wagons had passed through here hours ago—carrying crates lined with lead.</p><p>No guards manned the watchtowers. Castle Black had been abandoned by the Crown three months ago, yet fresh torches burned in the wall brackets.</p>`,
        wordCount: 68,
        status: 'drafted',
        createdAt: now - 1800000,
        updatedAt: now - 1800000,
      },
      {
        id: 'sc-2-1',
        chapterId: 'ch-2',
        projectId: demoProjectId,
        title: 'The Oak Portal',
        order: 1,
        povCharacterId: 'char-emma',
        locationId: 'loc-great-hall',
        storyTime: 'October 14, 1894 - 10:45 PM',
        sceneGoal: 'Find the entrance to the lower archives',
        conflict: 'A reinforced door sealed with an alchemical sigil',
        outcome: 'The silver ring reacts with the seal, unlocking the latch',
        beats: [
          { id: 'b-7', description: 'Examine carved sigil of house Victor', completed: true },
          { id: 'b-8', description: 'Touch ring to seal and unlock latch', completed: true },
        ],
        charactersPresent: ['char-emma'],
        activePlotThreadIds: ['plot-legacy'],
        contentHtml: `<p>Inside the fortress, cobwebs hung like torn drapes from the vaulted ceiling. Emma raised her lantern, illuminating a heavy oak door bearing the seal of the house of Victor.</p><p>As she drew closer, the silver ring on her finger grew searing hot. When she pressed the bezel against the copper lockplate, the tumblers tumbled with a heavy, hollow thud.</p>`,
        wordCount: 63,
        status: 'drafted',
        createdAt: now - 900000,
        updatedAt: now - 900000,
      },
      {
        id: 'sc-3-1',
        chapterId: 'ch-3',
        projectId: demoProjectId,
        title: 'The Altar of Ash',
        order: 1,
        povCharacterId: 'char-emma',
        locationId: 'loc-crypt',
        storyTime: 'October 14, 1894 - 11:30 PM',
        sceneGoal: 'Confront Victor before he initiates the crimson eclipse rite',
        conflict: 'The High Guild Sentinel stands guard over the subterranean altar',
        outcome: 'Emma learns Victor is backed by the High Council',
        beats: [
          { id: 'b-9', description: 'Enter the flooded nave of the crypt', completed: false },
          { id: 'b-10', description: 'Obsidian brazier flares to life', completed: false },
          { id: 'b-11', description: 'Confront the Sentinel in Guild robes', completed: false },
        ],
        charactersPresent: ['char-emma', 'char-sentinel'],
        activePlotThreadIds: ['plot-murders', 'plot-legacy'],
        contentHtml: `<p>The heavy iron hinges groaned as Emma leaned her full weight against the subterranean door. The air that rushed to meet her was thick with the scent of wet stone and ancient sulfur.</p><p>"Victor isn't alone down here," she whispered, her fingers finding the silver seal in her pocket. The metal was burning hot.</p><p>Across the vaulted hall, an obsidian brazier flared to life without flint or spark. A figure stepped into the light—not Victor, but someone wearing the ceremonial robes of the High Guild.</p><p>"You shouldn't have opened that door, Detective."</p>`,
        wordCount: 88,
        status: 'drafted',
        createdAt: now,
        updatedAt: now,
      },
    ];
    await db.scenes.bulkAdd(scenes);

    // 4. Characters
    const characters: CharacterEntity[] = [
      {
        id: 'char-emma',
        projectId: demoProjectId,
        name: 'Detective Emma Vance',
        role: 'protagonist',
        age: '29',
        occupation: 'Senior Inspector, Northern Special Constabulary',
        voiceNotes: 'Controlled, perceptive, dry wit under pressure, pauses before answering difficult questions.',
        personality: ['Analytical', 'Tenacious', 'Secretive', 'Skeptical'],
        goals: ['Apprehend Victor', 'Uncover her grandfather\'s true connection to Castle Black'],
        relationships: [
          {
            targetCharacterId: 'char-victor',
            targetName: 'Victor the Alchemist',
            relationshipType: 'Enemy / Rival',
            trustScore: -90,
            notes: 'Responsible for three ritual murders across northern counties.',
          },
          {
            targetCharacterId: 'char-caleb',
            targetName: 'Coachman Caleb',
            relationshipType: 'Neutral Ally',
            trustScore: 20,
            notes: 'Hired driver from the village below.',
          },
        ],
        status: 'alive',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'char-victor',
        projectId: demoProjectId,
        name: 'Victor Malakar',
        role: 'antagonist',
        age: '54',
        occupation: 'Rogue Blood Sorcerer & Former Guild Arch-Scholar',
        voiceNotes: 'Cultured, aristocratic, contemptuous of imperial bureaucracy, speaks softly.',
        personality: ['Ruthless', 'Obsessive', 'Scholarly'],
        goals: ['Activate the blood altar during the midnight eclipse'],
        relationships: [
          {
            targetCharacterId: 'char-emma',
            targetName: 'Detective Emma Vance',
            relationshipType: 'Enemy',
            trustScore: -100,
            notes: 'Considers her a nuisance who fails to see the grand pattern.',
          },
        ],
        status: 'alive',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'char-caleb',
        projectId: demoProjectId,
        name: 'Caleb the Coachman',
        role: 'minor',
        age: '61',
        occupation: 'Northern Post-Driver',
        voiceNotes: 'Gruff northern accent, short sentences, superstitious.',
        personality: ['Superstitious', 'Pragmatic'],
        goals: ['Survive the night and return horses safely'],
        relationships: [],
        status: 'alive',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'char-sentinel',
        projectId: demoProjectId,
        name: 'High Guild Sentinel',
        role: 'supporting',
        age: '40',
        occupation: 'Sworn Guard of the Inner Alchemical Council',
        voiceNotes: 'Monotone, zealot devotion, ceremonial cadence.',
        personality: ['Zealot', 'Loyal', 'Stoic'],
        goals: ['Prevent outsiders from reaching the altar'],
        relationships: [],
        status: 'alive',
        createdAt: now,
        updatedAt: now,
      },
    ];
    await db.characters.bulkAdd(characters);

    // 5. Temporal Character State (Emma at Scene 3-1)
    await db.characterStates.add({
      id: 'state-emma-sc3-1',
      characterId: 'char-emma',
      sceneId: 'sc-3-1',
      knownFacts: [
        'Victor is inside Castle Black',
        'Grandfather\'s ring unlocks the ancient locks of the fortress',
        'No Crown guards are present in the outer ward',
      ],
      falseBeliefs: [
        'Believes the High Guild is trying to stop Victor',
      ],
      emotionalState: 'High alertness, growing dread over grandfather\'s legacy',
    });

    // 6. Locations
    await db.locations.bulkAdd([
      {
        id: 'loc-carriage',
        projectId: demoProjectId,
        name: 'The Northern High Road',
        type: 'Passage / Transport',
        description: 'Muddy carriage road carved along the granite cliff edge beneath Castle Black.',
        sensoryDetails: 'Smell of wet wool, screaming gales, smell of iron and pine needles.',
        associatedCharacters: ['char-emma', 'char-caleb'],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'loc-courtyard',
        projectId: demoProjectId,
        name: 'Castle Black Outer Courtyard',
        type: 'Fortress Courtyard',
        description: 'Vast granite ward flanked by broken siege gargoyles and frozen mud.',
        sensoryDetails: 'Crunch of thin frost, torches sputtering in wind.',
        associatedCharacters: ['char-emma'],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'loc-crypt',
        projectId: demoProjectId,
        name: 'The Subterranean Blood Crypt',
        type: 'Vaulted Tomb / Temple',
        description: 'Flooded nave beneath the fortress containing the ancient alchemical altar.',
        sensoryDetails: 'Sulfur, damp stone, glow of obsidian fire.',
        associatedCharacters: ['char-emma', 'char-sentinel', 'char-victor'],
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // 7. World Lore
    await db.worldLore.bulkAdd([
      {
        id: 'lore-blood-magic',
        projectId: demoProjectId,
        title: 'The Law of Equal Transmutation',
        category: 'magic',
        description: 'Blood magic cannot create matter; it can only reforge existing living essence into kinetic or structural energy.',
        rulesAndCosts: 'The sorcerer must offer their own vital pulse or consume living sacrifice.',
        createdAt: now,
      },
      {
        id: 'lore-high-guild',
        projectId: demoProjectId,
        title: 'The High Guild of Alchemists',
        category: 'faction',
        description: 'Imperial regulatory body chartered in 1740 to ban rogue sorcery. Secretly compromised.',
        createdAt: now,
      },
    ]);

    // 8. Plot Threads
    await db.plotThreads.bulkAdd([
      {
        id: 'plot-murders',
        projectId: demoProjectId,
        title: 'The Castle Black Ritual Murders',
        description: 'Three local magistrates found drained of blood bearing geometric alchemical burns.',
        startedSceneId: firstSceneId,
        status: 'in-progress',
        relatedCharacters: ['char-emma', 'char-victor'],
        createdAt: now,
      },
      {
        id: 'plot-legacy',
        projectId: demoProjectId,
        title: 'Grandfather Vance\'s Secret',
        description: 'How Emma\'s grandfather acquired the silver ring that unlocks Castle Black.',
        startedSceneId: firstSceneId,
        status: 'in-progress',
        relatedCharacters: ['char-emma'],
        createdAt: now,
      },
    ]);

    // 9. Promises & Chekhov Guns
    await db.promises.bulkAdd([
      {
        id: 'prom-ring',
        projectId: demoProjectId,
        title: 'The Silver Bezel Ring',
        promiseType: 'chekhov_gun',
        introducedSceneId: firstSceneId,
        status: 'progressing',
        ageScenes: 3,
        notes: 'Already unlocked the oak portal; still contains unknown second inscription.',
      },
      {
        id: 'prom-wagon',
        projectId: demoProjectId,
        title: 'The Lead-Lined Crates',
        promiseType: 'mystery_question',
        introducedSceneId: 'sc-1-2',
        status: 'open',
        ageScenes: 2,
        notes: 'What did the wagons bring into the lower crypts?',
      },
    ]);

    // 10. Pre-computed Linter Issues (Demonstrating the Story Linter)
    await db.linterIssues.bulkAdd([
      {
        id: 'lint-1',
        type: 'character_knowledge',
        severity: 'warning',
        sceneId: 'sc-3-1',
        sceneTitle: 'The Altar of Ash',
        title: 'Potential Character Knowledge Discrepancy',
        explanation: 'In this scene, Emma recognizes the ceremonial robes of the High Guild. However, in Chapter 1 Scene 1 she stated she had never met a High Guild official before.',
        excerpt: '"someone wearing the ceremonial robes of the High Guild."',
        conflictingSceneId: firstSceneId,
        conflictingSceneTitle: 'Carriage through the Murk',
        suggestedFix: 'Clarify that Emma recognizes the embroidered crest from police textbooks, rather than personal familiarity.',
        status: 'active',
      },
      {
        id: 'lint-2',
        type: 'unresolved_promise',
        severity: 'info',
        sceneId: 'sc-1-2',
        sceneTitle: 'The Outer Courtyard',
        title: 'Lead-Lined Crates Unexamined',
        explanation: 'The lead-lined crates discovered in Scene 2 have not been inspected or referenced for 2 scenes.',
        suggestedFix: 'Add sensory evidence of crate splinters or packing straw near the crypt entrance.',
        status: 'active',
      },
    ]);

    // 11. Momentum Engine: Goals & Milestones
    await db.goals.bulkAdd([
      {
        id: 'goal-weekly',
        projectId: demoProjectId,
        type: 'words',
        target: 2000,
        current: 1240,
        period: 'weekly',
      },
      {
        id: 'goal-daily',
        projectId: demoProjectId,
        type: 'words',
        target: 500,
        current: 350,
        period: 'daily',
      },
    ]);

    await db.milestones.bulkAdd([
      {
        id: 'm-1',
        projectId: demoProjectId,
        title: 'Act I: The Arrival & Outer Ward',
        actOrChapter: 'Act I',
        completed: true,
        targetWordEstimate: 5000,
      },
      {
        id: 'm-2',
        projectId: demoProjectId,
        title: 'Act II: The Subterranean Blood Crypt',
        actOrChapter: 'Act II',
        completed: false,
        targetWordEstimate: 15000,
      },
      {
        id: 'm-3',
        projectId: demoProjectId,
        title: 'Act III: The Crimson Eclipse Confrontation',
        actOrChapter: 'Act III',
        completed: false,
        targetWordEstimate: 25000,
      },
    ]);
  }

  return { projectId: primaryProjectId, sceneId: primarySceneId };
}
