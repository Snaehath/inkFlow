import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { useInkFlowStore } from '../../store/useInkFlowStore';
import { db } from '../../storage/DexieStorage';
import type { Chapter, Scene } from '../../types';
import { SceneContextPanel } from './SceneContextPanel';
import { InlineAIDiffModal } from './InlineAIDiffModal';
import { aiRuntime } from '../../services/ai/AIRuntime';
import { 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  Quote, 
  List, 
  Undo, 
  Redo, 
  Sparkles,
  ChevronDown,
  ChevronRight,
  Plus,
  PanelRightClose,
  PanelRightOpen,
  Maximize2,
  Type,
  Send,
  X,
  Compass
} from 'lucide-react';

export const WriteWorkspace: React.FC = () => {
  const {
    activeProjectId,
    setActiveChapterId,
    activeSceneId,
    setActiveSceneId,
    isFocusMode,
    toggleFocusMode,
    isSceneContextOpen,
    toggleSceneContext,
    isAskInkFlowOpen,
    setAskInkFlowOpen,
    toggleAskInkFlow,
    diffProposal,
    setDiffProposal,
    updateEditorStats,
  } = useInkFlowStore();

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [activeScene, setActiveScene] = useState<Scene | null>(null);
  const [collapsedChapters, setCollapsedChapters] = useState<Record<string, boolean>>({});
  const [showFormattingBar, setShowFormattingBar] = useState(false);
  const [customAIPrompt, setCustomAIPrompt] = useState('');
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // TipTap Rich Text Editor Instance
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start writing. Don't worry about getting it right—you can revise later.",
      }),
      CharacterCount,
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[500px] text-slate-100 selection:bg-violet-600/40 selection:text-white',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const words = editor.storage.characterCount.words();
      const characters = editor.storage.characterCount.characters();
      const paragraphs = editor.getText().split(/\n+/).filter(Boolean).length;
      const readingTimeMinutes = Math.ceil(words / 200);

      updateEditorStats({ words, characters, paragraphs, readingTimeMinutes });

      if (activeSceneId) {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(async () => {
          await db.scenes.update(activeSceneId, {
            contentHtml: html,
            wordCount: words,
            status: words > 100 ? 'drafted' : words > 0 ? 'drafted' : 'empty',
            updatedAt: Date.now(),
          });
        }, 500);
      }
    },
  });

  // Reload Chapters & Scenes from Dexie
  const reloadHierarchy = useCallback(async () => {
    const chs = await db.chapters.where('projectId').equals(activeProjectId).sortBy('order');
    setChapters(chs);

    const scs = await db.scenes.where('projectId').equals(activeProjectId).sortBy('order');
    setScenes(scs);

    if (activeSceneId) {
      const cur = scs.find((s) => s.id === activeSceneId) || scs[0] || null;
      setActiveScene(cur);
      if (cur && editor && editor.getHTML() !== cur.contentHtml) {
        editor.commands.setContent(cur.contentHtml || '');
        const words = editor.storage.characterCount.words();
        const characters = editor.storage.characterCount.characters();
        updateEditorStats({
          words,
          characters,
          paragraphs: editor.getText().split(/\n+/).filter(Boolean).length,
          readingTimeMinutes: Math.ceil(words / 200),
        });
      }
    } else if (scs.length > 0) {
      setActiveSceneId(scs[0].id);
      setActiveChapterId(scs[0].chapterId);
    }
  }, [activeProjectId, activeSceneId, editor, setActiveSceneId, setActiveChapterId, updateEditorStats]);

  useEffect(() => {
    let isMounted = true;
    const runReload = async () => {
      if (isMounted) {
        await reloadHierarchy();
      }
    };
    runReload();
    return () => {
      isMounted = false;
    };
  }, [reloadHierarchy]);

  // Global Keyboard Shortcuts: Ctrl+Shift+F (Focus), Ctrl+J (Ask InkFlow)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+F -> Toggle Focus Mode
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleFocusMode();
      }
      // Ctrl+J -> Toggle Ask InkFlow
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        toggleAskInkFlow();
      }
      // Escape -> close Focus or Ask modal
      if (e.key === 'Escape') {
        if (isFocusMode) toggleFocusMode();
        if (isAskInkFlowOpen) setAskInkFlowOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode, toggleFocusMode, isAskInkFlowOpen, toggleAskInkFlow, setAskInkFlowOpen]);

  // Add New Scene
  const handleAddScene = async (chapterId?: string) => {
    const targetChapterId = chapterId || chapters[0]?.id;
    if (!targetChapterId) return;

    const nextOrder = scenes.filter((s) => s.chapterId === targetChapterId).length + 1;
    const newSceneId = `sc-${Date.now()}`;
    const newScene: Scene = {
      id: newSceneId,
      chapterId: targetChapterId,
      projectId: activeProjectId,
      title: `Scene ${nextOrder}`,
      order: nextOrder,
      contentHtml: '',
      wordCount: 0,
      beats: [{ id: `b-${Date.now()}`, description: 'Establish scene stakes', completed: false }],
      charactersPresent: ['char-emma'],
      activePlotThreadIds: ['plot-murders'],
      status: 'empty',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await db.scenes.add(newScene);
    setActiveSceneId(newSceneId);
    setActiveChapterId(targetChapterId);
    await reloadHierarchy();
  };

  // Perform AI Assistance Action
  const handleAIAction = async (type: 'rewrite' | 'tension' | 'subtext' | 'continue') => {
    if (!editor) return;
    setIsAIProcessing(true);
    setAskInkFlowOpen(false);

    try {
      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to, ' ');

      if (type === 'continue') {
        const fullText = editor.getText();
        const proposal = await aiRuntime.continueScene(
          activeScene?.title || 'Scene',
          fullText,
          activeScene?.sceneGoal,
          'Detective Emma'
        );
        setDiffProposal(proposal);
      } else {
        const textToTransform = selectedText || editor.getText().slice(-300);
        const proposal = await aiRuntime.rewriteSelection(textToTransform, type, {
          povName: 'Detective Emma',
          location: 'The Blood Crypt',
          goal: activeScene?.sceneGoal,
        });
        setDiffProposal(proposal);
      }
    } finally {
      setIsAIProcessing(false);
    }
  };

  // Accept Diff Proposal
  const handleAcceptDiff = (text: string) => {
    if (!editor) return;
    if (diffProposal?.actionType === 'continue') {
      editor.commands.focus('end');
      editor.commands.insertContent(`<p>${text}</p>`);
    } else {
      const { from, to } = editor.state.selection;
      if (from !== to) {
        editor.commands.insertContentAt({ from, to }, text);
      } else {
        editor.commands.focus('end');
        editor.commands.insertContent(`<p>${text}</p>`);
      }
    }
    setDiffProposal(null);
  };

  if (!editor) return null;

  // STATE C — FOCUS MODE (Pure calm canvas, typewriter scrolling, no chrome)
  if (isFocusMode) {
    return (
      <div className="h-screen w-screen bg-[#090B0E] text-slate-100 flex flex-col justify-center items-center px-6 overflow-y-auto select-text font-serif">
        <div className="w-full max-w-2xl py-20">
          <div className="text-center mb-10 opacity-30 hover:opacity-100 transition-opacity">
            <span className="text-[11px] font-sans font-mono tracking-widest text-slate-400 uppercase">
              {activeScene?.title || 'Drafting'} · Press Esc to exit
            </span>
          </div>
          <EditorContent editor={editor} />
        </div>
      </div>
    );
  }

  const isSceneEmpty = !editor.getText().trim();

  return (
    <div className="flex-1 flex overflow-hidden relative bg-[#090B0E] select-none font-sans text-xs">
      {/* 1. Left: Story Navigator (Subtle, clean, not developer-like) */}
      <aside className="w-60 bg-[#0B0D12] border-r border-[#161A24] flex flex-col h-full shrink-0">
        <div className="p-3 border-b border-[#161A24] flex items-center justify-between">
          <span className="font-semibold text-slate-400 uppercase tracking-widest text-[10px]">
            Story
          </span>
          <button
            onClick={() => handleAddScene()}
            className="flex items-center space-x-1 px-1.5 py-0.5 rounded hover:bg-[#161B26] text-slate-400 hover:text-slate-200 transition-colors text-[10px]"
            title="Create New Scene"
          >
            <Plus className="w-3 h-3" />
            <span>Scene</span>
          </button>
        </div>

        {/* Empty State when no chapters or scenes exist */}
        {chapters.length === 0 ? (
          <div className="p-4 text-center space-y-3 my-auto">
            <Compass className="w-6 h-6 text-slate-600 mx-auto" />
            <p className="text-slate-500 text-[11px]">Your story has no scenes yet.</p>
            <button
              onClick={() => handleAddScene()}
              className="px-3 py-1 rounded bg-violet-600 text-white font-medium text-[11px]"
            >
              Create First Scene
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {chapters.map((ch) => {
              const chScenes = scenes.filter((s) => s.chapterId === ch.id);
              const isCollapsed = collapsedChapters[ch.id] || false;

              return (
                <div key={ch.id} className="space-y-1">
                  {/* Chapter Row */}
                  <div
                    onClick={() =>
                      setCollapsedChapters((prev) => ({ ...prev, [ch.id]: !prev[ch.id] }))
                    }
                    className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-[#131722] cursor-pointer text-slate-400 font-medium group text-[11px]"
                  >
                    <div className="flex items-center space-x-1 truncate">
                      {isCollapsed ? (
                        <ChevronRight className="w-3 h-3 text-slate-600" />
                      ) : (
                        <ChevronDown className="w-3 h-3 text-slate-600" />
                      )}
                      <span className="truncate">{ch.title}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddScene(ch.id);
                      }}
                      className="p-0.5 rounded hover:bg-slate-800 text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Add Scene to this Chapter"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Scene Rows with Subtle Dot Indicators */}
                  {!isCollapsed && (
                    <div className="pl-3 space-y-0.5">
                      {chScenes.map((sc) => {
                        const isSelected = activeSceneId === sc.id;
                        const isDrafted = sc.status === 'drafted' || (sc.wordCount || 0) > 0;

                        return (
                          <div
                            key={sc.id}
                            onClick={() => {
                              setActiveSceneId(sc.id);
                              setActiveChapterId(ch.id);
                            }}
                            className={`flex items-center justify-between py-1.5 px-2 rounded-md cursor-pointer transition-colors text-[11px] ${
                              isSelected
                                ? 'bg-[#181D2A] text-slate-100 font-medium'
                                : 'text-slate-400 hover:bg-[#12151E] hover:text-slate-300'
                            }`}
                          >
                            <div className="flex items-center space-x-2 truncate">
                              {/* Subtle symbol indicator */}
                              <span
                                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  isDrafted ? 'bg-violet-400/80' : 'border border-slate-600'
                                }`}
                              />
                              <span className="truncate">{sc.title}</span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-600">
                              {sc.wordCount ? `${sc.wordCount}w` : ''}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </aside>

      {/* 2. Center: The Writing Canvas (Calm, Literate, Distraction-Free) */}
      <div className="flex-1 flex flex-col h-full bg-[#090B0E] overflow-hidden relative">
        {/* Subtle, Minimal Header Bar (No visual clutter) */}
        <div className="h-9 px-6 flex items-center justify-between text-slate-500 z-10 shrink-0 border-b border-[#141822]">
          <div className="text-[11px] text-slate-400 font-medium truncate max-w-[300px]">
            {activeScene?.title || 'Drafting'}
          </div>

          <div className="flex items-center space-x-2">
            {/* Formatting Toggle */}
            <button
              onClick={() => setShowFormattingBar(!showFormattingBar)}
              className={`p-1 rounded hover:bg-[#141824] transition-colors ${
                showFormattingBar ? 'text-violet-300 bg-[#141824]' : 'text-slate-500'
              }`}
              title="Formatting Options"
            >
              <Type className="w-3.5 h-3.5" />
            </button>

            {/* Unified Ask InkFlow Button */}
            <button
              onClick={toggleAskInkFlow}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#131724] border border-[#1F2638] hover:border-violet-500/40 text-slate-300 hover:text-white transition-all text-[11px] font-medium"
              title="Ask InkFlow (Ctrl+J)"
            >
              <Sparkles className="w-3 h-3 text-violet-400" />
              <span>Ask InkFlow</span>
              <span className="text-[9px] font-mono text-slate-500 hidden md:inline">Ctrl+J</span>
            </button>

            {/* Context Panel Toggle (State A vs State B) */}
            <button
              onClick={toggleSceneContext}
              className={`p-1 rounded hover:bg-[#141824] transition-colors ${
                isSceneContextOpen ? 'text-violet-300' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Toggle Scene Context"
            >
              {isSceneContextOpen ? (
                <PanelRightClose className="w-3.5 h-3.5" />
              ) : (
                <PanelRightOpen className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Focus Mode Quick Toggle */}
            <button
              onClick={toggleFocusMode}
              className="p-1 rounded hover:bg-[#141824] text-slate-500 hover:text-slate-300 transition-colors"
              title="Focus Mode (Ctrl+Shift+F)"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Optional Secondary Formatting Toolbar (only when opened by author) */}
        {showFormattingBar && (
          <div className="h-8 bg-[#0D1017] border-b border-[#161B26] px-6 flex items-center space-x-1 text-slate-400 animate-in fade-in duration-100">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-1 rounded hover:bg-[#1C212B] ${editor.isActive('bold') ? 'text-violet-300' : ''}`}
            >
              <Bold className="w-3 h-3" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-1 rounded hover:bg-[#1C212B] ${editor.isActive('italic') ? 'text-violet-300' : ''}`}
            >
              <Italic className="w-3 h-3" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`p-1 rounded hover:bg-[#1C212B] ${editor.isActive('heading', { level: 1 }) ? 'text-violet-300' : ''}`}
            >
              <Heading1 className="w-3 h-3" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-1 rounded hover:bg-[#1C212B] ${editor.isActive('heading', { level: 2 }) ? 'text-violet-300' : ''}`}
            >
              <Heading2 className="w-3 h-3" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-1 rounded hover:bg-[#1C212B] ${editor.isActive('blockquote') ? 'text-violet-300' : ''}`}
            >
              <Quote className="w-3 h-3" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-1 rounded hover:bg-[#1C212B] ${editor.isActive('bulletList') ? 'text-violet-300' : ''}`}
            >
              <List className="w-3 h-3" />
            </button>
            <button
              onClick={() => editor.chain().focus().undo().run()}
              className="p-1 rounded hover:bg-[#1C212B] disabled:opacity-30"
            >
              <Undo className="w-3 h-3" />
            </button>
            <button
              onClick={() => editor.chain().focus().redo().run()}
              className="p-1 rounded hover:bg-[#1C212B] disabled:opacity-30"
            >
              <Redo className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* ProseMirror Literary Canvas */}
        <div className="flex-1 overflow-y-auto px-8 md:px-16 lg:px-24 py-10 flex justify-center">
          <div className="w-full max-w-2xl relative">
            {/* Thoughtful Empty State Invitation */}
            {isSceneEmpty && (
              <div className="mb-6 p-4 rounded-xl bg-[#10141E]/60 border border-[#1A2234] text-slate-300 space-y-2">
                <div className="font-semibold text-slate-100 text-xs">What happens next?</div>
                <p className="text-[11px] text-slate-400">
                  Write the first sentence yourself, or let InkFlow suggest an opening tailored to your scene goal:
                </p>
                <div className="flex items-center space-x-2 pt-1">
                  <button
                    onClick={() => editor.commands.focus()}
                    className="px-2.5 py-1 rounded bg-[#161B26] hover:bg-[#1C2333] text-slate-200 border border-slate-700 text-[11px] font-medium"
                  >
                    I'll write
                  </button>
                  <button
                    onClick={() => handleAIAction('continue')}
                    className="flex items-center space-x-1.5 px-3 py-1 rounded bg-violet-600 hover:bg-violet-500 text-white text-[11px] font-medium transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Help me start</span>
                  </button>
                </div>
              </div>
            )}

            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      {/* 3. Right: Collapsible Smart Scene Context Panel (State B) */}
      <SceneContextPanel
        scene={activeScene}
        onUpdateScene={async (updated) => {
          if (!activeSceneId) return;
          await db.scenes.update(activeSceneId, updated);
          await reloadHierarchy();
        }}
      />

      {/* 4. Unified "Ask InkFlow" Contextual Drawer / Palette (<kbd>Ctrl+J</kbd>) */}
      {isAskInkFlowOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-100">
          <div className="w-full max-w-lg bg-[#0E1117] border border-[#232A3B] rounded-xl shadow-2xl overflow-hidden font-sans text-xs">
            <div className="p-3 border-b border-[#1C212B] flex items-center justify-between bg-[#0A0C10]">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5 text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                Ask InkFlow
              </span>
              <button
                onClick={() => setAskInkFlowOpen(false)}
                className="text-slate-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 space-y-3">
              {/* Quick Actions */}
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider px-1">
                  Actions for this scene
                </div>
                <button
                  onClick={() => handleAIAction('continue')}
                  disabled={isAIProcessing}
                  className="w-full text-left p-2 rounded-lg hover:bg-[#161B26] text-slate-200 flex items-center justify-between transition-colors"
                >
                  <div>
                    <div className="font-medium">Continue Scene</div>
                    <div className="text-[10px] text-slate-400">Draft the next paragraphs based on current goal and beats</div>
                  </div>
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                </button>

                <button
                  onClick={() => handleAIAction('tension')}
                  disabled={isAIProcessing}
                  className="w-full text-left p-2 rounded-lg hover:bg-[#161B26] text-slate-200 flex items-center justify-between transition-colors"
                >
                  <div>
                    <div className="font-medium">Increase Tension</div>
                    <div className="text-[10px] text-slate-400">Elevate stakes and heighten gothic environmental suspense</div>
                  </div>
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                </button>

                <button
                  onClick={() => handleAIAction('subtext')}
                  disabled={isAIProcessing}
                  className="w-full text-left p-2 rounded-lg hover:bg-[#161B26] text-slate-200 flex items-center justify-between transition-colors"
                >
                  <div>
                    <div className="font-medium">Deepen Subtext & Voice</div>
                    <div className="text-[10px] text-slate-400">Infuse behavioral cues and hidden motivations</div>
                  </div>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                </button>
              </div>

              {/* Freeform Prompt Input */}
              <div className="pt-2 border-t border-[#1C212B] flex items-center space-x-2">
                <input
                  type="text"
                  autoFocus
                  placeholder="Ask anything about this scene..."
                  value={customAIPrompt}
                  onChange={(e) => setCustomAIPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAIAction('continue');
                  }}
                  className="flex-1 bg-[#141722] border border-[#202636] rounded-lg px-3 py-1.5 text-slate-100 placeholder:text-slate-500 text-xs focus:outline-none focus:border-violet-500"
                />
                <button
                  onClick={() => handleAIAction('continue')}
                  disabled={isAIProcessing}
                  className="p-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Pre-Action Side-by-Side Diff Modal */}
      <InlineAIDiffModal
        proposal={diffProposal}
        onAccept={handleAcceptDiff}
        onDiscard={() => setDiffProposal(null)}
      />
    </div>
  );
};
