// InkFlow 2.0 Domain Models & Type System

export type WorkspaceMode = 'write' | 'plan' | 'brain' | 'review' | 'publish' | 'home';

export type PlanViewMode = 'outline' | 'cards' | 'grid';

export type BrainCategory = 'characters' | 'locations' | 'lore' | 'plots' | 'promises';

export type EntityStatus = 'alive' | 'deceased' | 'unknown';

export interface Project {
  id: string;
  title: string;
  genre: string;
  targetWordCount: number;
  description?: string;
  activeSceneId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Chapter {
  id: string;
  projectId: string;
  title: string;
  order: number;
  summary?: string;
  createdAt: number;
  updatedAt: number;
}

export interface SceneBeat {
  id: string;
  description: string;
  completed: boolean;
}

export interface Scene {
  id: string;
  chapterId: string;
  projectId: string;
  title: string;
  order: number;
  contentHtml: string;
  wordCount: number;
  
  // Dramatic Scene Metadata
  povCharacterId?: string;
  locationId?: string;
  storyTime?: string;
  sceneGoal?: string;
  conflict?: string;
  outcome?: string;
  
  // Structured Narrative Beats
  beats: SceneBeat[];
  
  // Linked Entities
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
  personality: string[];
  goals: string[];
  relationships: {
    targetCharacterId: string;
    targetName: string;
    relationshipType: string;
    trustScore: number; // -100 to 100
    notes?: string;
  }[];
  status: EntityStatus;
  notes?: string;
  createdAt: number;
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

export interface LocationEntity {
  id: string;
  projectId: string;
  name: string;
  type: string;
  description: string;
  sensoryDetails?: string;
  associatedCharacters: string[];
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface WorldLoreEntity {
  id: string;
  projectId: string;
  title: string;
  category: 'magic' | 'technology' | 'history' | 'culture' | 'faction' | 'rule';
  description: string;
  rulesAndCosts?: string;
  createdAt: number;
}

export interface PlotThread {
  id: string;
  projectId: string;
  title: string;
  description: string;
  startedSceneId?: string;
  resolvedSceneId?: string;
  status: 'unresolved' | 'in-progress' | 'resolved' | 'abandoned';
  relatedCharacters: string[];
  createdAt: number;
}

export interface StoryPromise {
  id: string;
  projectId: string;
  title: string;
  promiseType: 'chekhov_gun' | 'mystery_question' | 'prophecy' | 'vow';
  introducedSceneId: string;
  resolvedSceneId?: string;
  status: 'open' | 'progressing' | 'resolved' | 'abandoned';
  ageScenes?: number;
  notes?: string;
}

export interface SceneSnapshot {
  id: string;
  sceneId: string;
  label: string;
  contentHtml: string;
  timestamp: number;
}

export interface LinterIssue {
  id: string;
  type: 'character_knowledge' | 'timeline' | 'unresolved_promise' | 'pacing' | 'voice';
  severity: 'warning' | 'info' | 'suggestion';
  sceneId: string;
  sceneTitle: string;
  title: string;
  explanation: string;
  excerpt?: string;
  conflictingSceneId?: string;
  conflictingSceneTitle?: string;
  suggestedFix?: string;
  status: 'active' | 'dismissed' | 'resolved';
}

export interface EditorStats {
  words: number;
  characters: number;
  paragraphs: number;
  readingTimeMinutes: number;
}

export interface AIDiffProposal {
  originalText: string;
  suggestedText: string;
  rationale: string;
  actionType: 'rewrite' | 'expand' | 'tension' | 'subtext' | 'continue';
}

// Momentum Engine (Writing Habits & Story Momentum)
export interface WritingSession {
  id: string;
  projectId: string;
  sceneId: string;
  startedAt: number;
  endedAt?: number;
  wordsAtStart: number;
  wordsAtEnd: number;
  wordsAdded: number;
  durationSeconds: number;
  completedScene?: boolean;
}

export interface WritingGoal {
  id: string;
  projectId: string;
  type: 'words' | 'time' | 'scenes';
  target: number;
  current: number;
  period: 'daily' | 'weekly';
}

export interface StoryMilestone {
  id: string;
  projectId: string;
  title: string;
  actOrChapter?: string;
  completed: boolean;
  targetWordEstimate?: number;
}

export interface ResumeContext {
  projectId: string;
  sceneId: string;
  sceneTitle: string;
  chapterTitle: string;
  lastParagraph: string;
  sceneGoal: string;
  activeCharacters: string[];
  openThreads: string[];
  weekWordsLogged: number;
  weekWordsTarget: number;
  scenesCompletedThisWeek: number;
}

export type AppScreen = 'studio' | 'editor' | 'skills' | 'projects' | 'templates';

export type DocumentType = 'story' | 'novel' | 'short-story' | 'email' | 'blog';

export interface WritingTemplate {
  id: string;
  title: string;
  description: string;
  category: 'Novel' | 'Short Story' | 'Story' | 'Blog' | 'Email' | 'Article' | 'Other';
  icon: string;
  tags: string[];
  chapters: Array<{ title: string; prompt?: string }>;
  isCustom?: boolean;
}

export interface WritingSkill {
  id: string;
  name: string;
  filename: string;
  markdown: string;
  summary: string;
  behaviors: string[];
  suggestedModel: string;
  samplePrompt: string;
  isApplied: boolean;
  category?: string;
  isPreset?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ContinuationOption {
  id: string;
  text: string;
}

export interface RecentDocumentItem {
  id: string;
  title: string;
  type: string;
  typeBadge: 'Short story' | 'Email' | 'Blog' | 'Novel' | 'Story';
  lastEditedText: string;
  projectId?: string;
  chapterId?: string;
  sceneId?: string;
  wordCount?: number;
}


