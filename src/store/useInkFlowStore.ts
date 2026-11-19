import { create } from 'zustand';
import type { 
  WorkspaceMode, 
  PlanViewMode, 
  BrainCategory, 
  EditorStats,
  AIDiffProposal,
  AppScreen,
  DocumentType
} from '../types';
import { 
  DEFAULT_SKILL_MARKDOWN, 
  PRESET_SKILLS, 
  NEW_SKILL_TEMPLATE,
  type SkillItem 
} from '../lib/skillParser';

interface InkFlowState {
  // Navigation & Screen Control
  currentScreen: AppScreen;
  setCurrentScreen: (screen: AppScreen) => void;

  activeMode: WorkspaceMode;
  activeProjectId: string;
  activeChapterId: string | null;
  activeSceneId: string | null;
  activeDocumentType: DocumentType;

  // Active Project & Chapter details
  activeProjectTitle: string;
  activeChapterTitle: string;
  saveStatus: 'saved' | 'saving' | 'unsaved';

  // Skills & AI Studio
  activeSkillId: string;
  activeSkillMarkdown: string;
  activeSkillName: string;
  isSkillApplied: boolean;
  savedSkills: SkillItem[];

  // Inline Suggestions & Editor AI Responses
  continuationSuggestions: string[];
  selectedSuggestionIndex: number;
  isSuggestionsCardOpen: boolean;
  suggestionTaskType: 'continue' | 'format' | 'rewrite' | 'expand' | 'brainstorm';
  generationMode: 'suggest' | 'write-for-me';
  writingFlowMode: 'co-assist' | 'full-auto';
  modelRoutingMode: 'auto' | 'manual';

  // UI Overlays & Drawers
  isFocusMode: boolean;
  isSceneContextOpen: boolean;
  isCommandPaletteOpen: boolean;
  isAskInkFlowOpen: boolean;
  
  // Mode-Specific States
  planView: PlanViewMode;
  selectedBrainCategory: BrainCategory;
  selectedBrainEntityId: string | null;
  isBrainDrawerOpen: boolean;
  
  // AI Operations & In-Editor Diff Proposal
  diffProposal: AIDiffProposal | null;
  isAIActionRunning: boolean;
  aiProvider: 'gemini' | 'ollama' | 'mock';
  selectedModel: string;
  availableModels: string[];
  ollamaStatus: 'connected' | 'disconnected' | 'checking';
  
  // Editor Metrics
  editorStats: EditorStats;

  // Actions
  setActiveMode: (mode: WorkspaceMode) => void;
  setActiveProjectId: (id: string) => void;
  setActiveChapterId: (id: string | null) => void;
  setActiveSceneId: (id: string | null) => void;
  setActiveDocumentType: (type: DocumentType) => void;
  setActiveProjectTitle: (title: string) => void;
  setActiveChapterTitle: (title: string) => void;
  setSaveStatus: (status: 'saved' | 'saving' | 'unsaved') => void;

  // Skills Actions
  setActiveSkillId: (id: string) => void;
  setActiveSkillMarkdown: (md: string) => void;
  setActiveSkillName: (name: string) => void;
  setIsSkillApplied: (applied: boolean) => void;
  loadSkill: (skillId: string) => void;
  createNewSkill: () => void;
  applySkillToSession: () => void;
  saveReusableSkill: (name: string, markdown: string) => void;
  deleteSkill: (skillId: string) => void;

  // Suggestions Actions
  setContinuationSuggestions: (suggestions: string[]) => void;
  setSelectedSuggestionIndex: (idx: number) => void;
  setIsSuggestionsCardOpen: (open: boolean) => void;
  setSuggestionTaskType: (type: 'continue' | 'format' | 'rewrite' | 'expand' | 'brainstorm') => void;
  setGenerationMode: (mode: 'suggest' | 'write-for-me') => void;
  setWritingFlowMode: (mode: 'co-assist' | 'full-auto') => void;
  setModelRoutingMode: (mode: 'auto' | 'manual') => void;
  dismissSuggestions: () => void;
  
  toggleFocusMode: () => void;
  setFocusMode: (open: boolean) => void;
  toggleSceneContext: () => void;
  setSceneContextOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleAskInkFlow: () => void;
  setAskInkFlowOpen: (open: boolean) => void;
  
  setPlanView: (view: PlanViewMode) => void;
  setSelectedBrainCategory: (category: BrainCategory) => void;
  setSelectedBrainEntityId: (id: string | null) => void;
  setBrainDrawerOpen: (open: boolean) => void;
  openBrainEntity: (category: BrainCategory, id: string) => void;
  
  setDiffProposal: (proposal: AIDiffProposal | null) => void;
  setIsAIActionRunning: (running: boolean) => void;
  setAIProvider: (provider: 'gemini' | 'ollama' | 'mock') => void;
  setSelectedModel: (model: string) => void;
  setAvailableModels: (models: string[]) => void;
  setOllamaStatus: (status: 'connected' | 'disconnected' | 'checking') => void;
  
  updateEditorStats: (stats: EditorStats) => void;
}

function generateSkillId(): string {
  return `skill-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export const useInkFlowStore = create<InkFlowState>((set) => ({
  // Default to studio screen (can jump instantly to editor or skills)
  currentScreen: 'studio',
  setCurrentScreen: (screen) => set({ currentScreen: screen }),

  activeMode: 'write',
  activeProjectId: 'project-glass-orchard',
  activeChapterId: 'ch-02',
  activeSceneId: 'sc-02-1',
  activeDocumentType: 'novel',

  activeProjectTitle: 'The Glass Orchard',
  activeChapterTitle: 'Chapter 02 — The Quiet Between',
  saveStatus: 'saved',

  // Skills
  activeSkillId: 'skill-atmospheric',
  activeSkillMarkdown: DEFAULT_SKILL_MARKDOWN,
  activeSkillName: 'Atmospheric Fiction',
  isSkillApplied: true,
  savedSkills: PRESET_SKILLS,

  // Inline Continuation Suggestions
  continuationSuggestions: [],
  selectedSuggestionIndex: 0,
  isSuggestionsCardOpen: false,
  suggestionTaskType: 'continue',
  generationMode: 'write-for-me',
  writingFlowMode: 'co-assist',
  modelRoutingMode: 'auto',

  isFocusMode: false,
  isSceneContextOpen: false,
  isCommandPaletteOpen: false,
  isAskInkFlowOpen: false,
  
  planView: 'outline',
  selectedBrainCategory: 'characters',
  selectedBrainEntityId: null,
  isBrainDrawerOpen: false,
  
  diffProposal: null,
  isAIActionRunning: false,
  aiProvider: 'ollama',
  selectedModel: 'Auto (Task Router)',
  availableModels: [],
  ollamaStatus: 'checking',
  
  editorStats: {
    words: 0,
    characters: 0,
    paragraphs: 0,
    readingTimeMinutes: 0,
  },

  setActiveMode: (mode) => set({ activeMode: mode }),
  setActiveProjectId: (id) => set({ activeProjectId: id }),
  setActiveChapterId: (id) => set({ activeChapterId: id }),
  setActiveSceneId: (id) => set({ activeSceneId: id }),
  setActiveDocumentType: (type) => set({ activeDocumentType: type }),
  setActiveProjectTitle: (title) => set({ activeProjectTitle: title }),
  setActiveChapterTitle: (title) => set({ activeChapterTitle: title }),
  setSaveStatus: (status) => set({ saveStatus: status }),

  setActiveSkillId: (id) => set({ activeSkillId: id }),
  setActiveSkillMarkdown: (md) => set({ activeSkillMarkdown: md }),
  setActiveSkillName: (name) => set({ activeSkillName: name }),
  setIsSkillApplied: (applied) => set({ isSkillApplied: applied }),

  loadSkill: (skillId) => set((state) => {
    const target = state.savedSkills.find(s => s.id === skillId);
    if (!target) return state;
    return {
      activeSkillId: target.id,
      activeSkillName: target.name,
      activeSkillMarkdown: target.markdown,
      isSkillApplied: true,
    };
  }),

  createNewSkill: () => set(() => {
    const newId = generateSkillId();
    return {
      activeSkillId: newId,
      activeSkillName: 'Untitled Writing Partner',
      activeSkillMarkdown: NEW_SKILL_TEMPLATE,
      isSkillApplied: false,
    };
  }),

  applySkillToSession: () => set((state) => {
    const activeSkill = state.savedSkills.find(s => s.id === state.activeSkillId);
    const md = activeSkill?.markdown || state.activeSkillMarkdown;
    const firstLine = md.split('\n')[0] || '';
    const name = firstLine.replace(/^#\s*/, '').trim() || 'Custom Partner';
    return {
      isSkillApplied: true,
      activeSkillName: name,
      activeSkillMarkdown: md
    };
  }),

  saveReusableSkill: (name, markdown) => set((state) => {
    const existingIndex = state.savedSkills.findIndex(s => s.id === state.activeSkillId);
    const firstLine = markdown.split('\n')[0] || '';
    const cleanName = name || firstLine.replace(/^#\s*/, '').trim() || 'Custom Partner';

    if (existingIndex >= 0) {
      const updated = [...state.savedSkills];
      updated[existingIndex] = {
        ...updated[existingIndex],
        name: cleanName,
        markdown
      };
      return {
        savedSkills: updated,
        activeSkillName: cleanName,
        activeSkillMarkdown: markdown,
        isSkillApplied: true
      };
    } else {
      const newSkill: SkillItem = {
        id: state.activeSkillId || generateSkillId(),
        name: cleanName,
        category: 'Custom',
        summary: 'Custom session writing partner',
        markdown,
        isPreset: false
      };
      return {
        savedSkills: [newSkill, ...state.savedSkills],
        activeSkillId: newSkill.id,
        activeSkillName: cleanName,
        activeSkillMarkdown: markdown,
        isSkillApplied: true
      };
    }
  }),

  deleteSkill: (skillId) => set((state) => {
    const filtered = state.savedSkills.filter(s => s.id !== skillId);
    if (state.activeSkillId === skillId) {
      const fallback = filtered[0] || PRESET_SKILLS[0];
      return {
        savedSkills: filtered,
        activeSkillId: fallback.id,
        activeSkillName: fallback.name,
        activeSkillMarkdown: fallback.markdown,
        isSkillApplied: true
      };
    }
    return {
      savedSkills: filtered
    };
  }),

  setContinuationSuggestions: (suggestions) => set({ 
    continuationSuggestions: suggestions, 
    selectedSuggestionIndex: 0,
    isSuggestionsCardOpen: suggestions.length > 0
  }),
  setSelectedSuggestionIndex: (idx) => set({ selectedSuggestionIndex: idx }),
  setIsSuggestionsCardOpen: (open) => set({ isSuggestionsCardOpen: open }),
  setSuggestionTaskType: (type) => set({ suggestionTaskType: type }),
  setGenerationMode: (mode) => set({ generationMode: mode }),
  setWritingFlowMode: (mode) => set({ writingFlowMode: mode }),
  setModelRoutingMode: (mode) => set({ modelRoutingMode: mode }),
  dismissSuggestions: () => set({ isSuggestionsCardOpen: false }),

  toggleFocusMode: () => set((state) => ({ isFocusMode: !state.isFocusMode })),
  setFocusMode: (open) => set({ isFocusMode: open }),
  toggleSceneContext: () => set((state) => ({ isSceneContextOpen: !state.isSceneContextOpen })),
  setSceneContextOpen: (open) => set({ isSceneContextOpen: open }),
  toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
  toggleAskInkFlow: () => set((state) => ({ isAskInkFlowOpen: !state.isAskInkFlowOpen })),
  setAskInkFlowOpen: (open) => set({ isAskInkFlowOpen: open }),
  
  setPlanView: (view) => set({ planView: view }),
  setSelectedBrainCategory: (category) => set({ selectedBrainCategory: category }),
  setSelectedBrainEntityId: (id) => set({ selectedBrainEntityId: id }),
  setBrainDrawerOpen: (open) => set({ isBrainDrawerOpen: open }),
  openBrainEntity: (category, id) => set({ selectedBrainCategory: category, selectedBrainEntityId: id, isBrainDrawerOpen: true }),
  
  setDiffProposal: (proposal) => set({ diffProposal: proposal }),
  setIsAIActionRunning: (running) => set({ isAIActionRunning: running }),
  setAIProvider: (provider) => set({ aiProvider: provider }),
  setSelectedModel: (model) => set({ selectedModel: model }),
  setAvailableModels: (models) => set({ availableModels: models.filter(m => !/granite|ministral/i.test(m)) }),
  setOllamaStatus: (status) => set({ ollamaStatus: status }),
  
  updateEditorStats: (stats) => set({ editorStats: stats }),
}));
