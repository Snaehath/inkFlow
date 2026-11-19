import React, { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { useInkFlowStore } from '../../store/useInkFlowStore';
import { db } from '../../storage/DexieStorage';
import { SuggestionCard } from './SuggestionCard';

interface ManuscriptEditorProps {
  onAcceptSuggestion: (text: string) => void;
  onTryAnotherSuggestion: () => void;
  onEditorReady?: (editorInstance: unknown) => void;
}

export const ManuscriptEditor: React.FC<ManuscriptEditorProps> = ({
  onAcceptSuggestion,
  onTryAnotherSuggestion,
  onEditorReady,
}) => {
  const { 
    activeSceneId, 
    activeChapterId,
    activeChapterTitle, 
    setActiveChapterTitle,
    updateEditorStats, 
    setSaveStatus 
  } = useInkFlowStore();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(activeChapterTitle);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Write freely here without distraction... Or ask your Writing Partner on the right to draft your opening.",
      }),
      CharacterCount,
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[420px] text-[#25251F] font-serif text-[19px] leading-[1.85] tracking-normal selection:bg-[#A7B69A]/30 selection:text-[#181814]',
      },
    },
    onUpdate: ({ editor: ed }) => {
      setSaveStatus('saving');
      const html = ed.getHTML();
      const words = ed.storage.characterCount.words();
      const characters = ed.storage.characterCount.characters();
      const paragraphs = ed.getText().split(/\n+/).filter(Boolean).length;
      const readingTimeMinutes = Math.ceil(words / 200);

      updateEditorStats({ words, characters, paragraphs, readingTimeMinutes });

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(async () => {
        if (activeSceneId) {
          try {
            await db.scenes.update(activeSceneId, {
              contentHtml: html,
              wordCount: words,
              updatedAt: Date.now(),
            });
          } catch (err) {
            console.warn('Scene auto-save error:', err);
          }
        }
        setSaveStatus('saved');
      }, 500);
    },
  });

  // Notify parent of editor instance
  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  // Load scene content dynamically from Dexie whenever activeSceneId changes
  useEffect(() => {
    let isMounted = true;
    async function loadScene() {
      if (!activeSceneId || !editor) return;
      try {
        const scene = await db.scenes.get(activeSceneId);
        if (scene && isMounted) {
          const currentHtml = editor.getHTML();
          if (scene.contentHtml !== currentHtml) {
            editor.commands.setContent(scene.contentHtml || '');
            const words = editor.storage.characterCount.words();
            const characters = editor.storage.characterCount.characters();
            const paragraphs = editor.getText().split(/\n+/).filter(Boolean).length;
            updateEditorStats({ words, characters, paragraphs, readingTimeMinutes: Math.ceil(words / 200) });
          }
        }
      } catch (err) {
        console.warn('Error loading scene from Dexie:', err);
      }
    }
    loadScene();
    return () => {
      isMounted = false;
    };
  }, [activeSceneId, editor, updateEditorStats]);

  const handleStartEditTitle = () => {
    setEditedTitle(activeChapterTitle);
    setIsEditingTitle(true);
  };

  const handleSaveTitle = async () => {
    setIsEditingTitle(false);
    if (!editedTitle.trim()) return;
    setActiveChapterTitle(editedTitle);

    if (activeChapterId) {
      await db.chapters.update(activeChapterId, { title: editedTitle, updatedAt: Date.now() });
    }
    if (activeSceneId) {
      await db.scenes.update(activeSceneId, { title: editedTitle, updatedAt: Date.now() });
    }
  };

  // Insert accepted suggestion into the document
  const handleAccept = (text: string) => {
    if (editor) {
      editor.commands.focus('end');
      editor.commands.insertContent(` ${text}`);
    }
    onAcceptSuggestion(text);
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 sm:px-16 py-10 max-w-3xl mx-auto w-full flex flex-col justify-between">
      <div>
        {/* Dynamic Editorial Chapter Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-sans font-semibold tracking-widest text-[#7C776E] uppercase select-none">
              MANUSCRIPT
            </span>
          </div>

          {isEditingTitle ? (
            <input
              autoFocus
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle();
                if (e.key === 'Escape') {
                  setEditedTitle(activeChapterTitle);
                  setIsEditingTitle(false);
                }
              }}
              className="font-serif text-3xl sm:text-4xl font-bold text-[#25251F] tracking-tight mt-1 mb-6 w-full bg-transparent border-b border-[#3E5535] focus:outline-none"
            />
          ) : (
            <h1 
              onClick={handleStartEditTitle}
              title="Click to rename chapter"
              className="font-serif text-3xl sm:text-4xl font-bold text-[#25251F] tracking-tight mt-1 mb-6 cursor-pointer hover:opacity-80 transition-opacity"
            >
              {activeChapterTitle || 'Untitled Draft'}
            </h1>
          )}
        </div>

        {/* ProseMirror Rich Text Editor */}
        <div className="prose max-w-none text-[#25251F] font-serif">
          <EditorContent editor={editor} />
        </div>

        {/* Inline Continuation Suggestions Card */}
        <SuggestionCard 
          onAccept={handleAccept}
          onTryAnother={onTryAnotherSuggestion}
        />
      </div>

      <div className="pt-8 text-center text-xs text-[#A39D92] select-none font-serif italic">
        ~ inkFlow Studio ~
      </div>
    </div>
  );
};
