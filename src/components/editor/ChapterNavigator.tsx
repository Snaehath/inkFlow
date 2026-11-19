import React, { useEffect, useState, useCallback } from 'react';
import { 
  FileText, 
  Plus, 
  BookMarked,
  Trash2
} from 'lucide-react';
import { useInkFlowStore } from '../../store/useInkFlowStore';
import { db } from '../../storage/DexieStorage';
import type { Chapter } from '../../types';

function generateEntityId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function getCurrentTimestamp(): number {
  return Date.now();
}

export const ChapterNavigator: React.FC = () => {
  const { 
    activeProjectId,
    activeProjectTitle, 
    activeChapterId,
    setActiveChapterId,
    setActiveChapterTitle,
    setActiveSceneId 
  } = useInkFlowStore();

  const [chapters, setChapters] = useState<Chapter[]>([]);

  // Load real chapters for active project from Dexie
  const loadProjectChapters = useCallback(async () => {
    if (!activeProjectId) return;
    try {
      const list = await db.chapters.where('projectId').equals(activeProjectId).sortBy('order');
      setChapters(list);
    } catch (err) {
      console.warn('Failed to load chapters from Dexie:', err);
    }
  }, [activeProjectId]);

  useEffect(() => {
    let isMounted = true;
    db.chapters.where('projectId').equals(activeProjectId).sortBy('order').then((list) => {
      if (isMounted) setChapters(list);
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [activeProjectId]);

  const handleSelectChapter = async (chapter: Chapter) => {
    setActiveChapterId(chapter.id);
    setActiveChapterTitle(chapter.title);

    // Find first scene for this chapter or create one if none exists
    const existingScene = await db.scenes.where('chapterId').equals(chapter.id).first();
    if (existingScene) {
      setActiveSceneId(existingScene.id);
    } else {
      const newSceneId = generateEntityId('sc');
      const now = getCurrentTimestamp();
      await db.scenes.add({
        id: newSceneId,
        chapterId: chapter.id,
        projectId: activeProjectId,
        title: chapter.title,
        order: 1,
        beats: [],
        charactersPresent: [],
        activePlotThreadIds: [],
        contentHtml: '',
        wordCount: 0,
        status: 'empty',
        createdAt: now,
        updatedAt: now
      });
      setActiveSceneId(newSceneId);
    }
  };

  const handleAddChapter = async () => {
    const nextOrder = chapters.length + 1;
    const formattedNumber = nextOrder < 10 ? `0${nextOrder}` : `${nextOrder}`;
    const chapterId = generateEntityId('ch');
    const newTitle = `Chapter ${formattedNumber} — Untitled`;
    const now = getCurrentTimestamp();

    const newChapter: Chapter = {
      id: chapterId,
      projectId: activeProjectId,
      title: newTitle,
      order: nextOrder,
      createdAt: now,
      updatedAt: now
    };

    await db.chapters.add(newChapter);

    const newSceneId = generateEntityId('sc');
    await db.scenes.add({
      id: newSceneId,
      chapterId: chapterId,
      projectId: activeProjectId,
      title: newTitle,
      order: 1,
      beats: [],
      charactersPresent: [],
      activePlotThreadIds: [],
      contentHtml: '',
      wordCount: 0,
      status: 'empty',
      createdAt: now,
      updatedAt: now
    });

    setActiveChapterId(chapterId);
    setActiveChapterTitle(newTitle);
    setActiveSceneId(newSceneId);
    await loadProjectChapters();
  };

  const handleDeleteChapter = async (e: React.MouseEvent, chapterId: string) => {
    e.stopPropagation();
    if (chapters.length <= 1) return; // Keep at least one chapter
    await db.chapters.delete(chapterId);
    await db.scenes.where('chapterId').equals(chapterId).delete();
    await loadProjectChapters();
  };

  return (
    <aside className="w-60 h-full border-r border-[#E3DDD3] bg-[#F7F3EB]/60 flex flex-col select-none shrink-0 overflow-y-auto">
      {/* Project Title Header */}
      <div className="p-4 border-b border-[#E8E2D7] flex items-center justify-between">
        <div className="flex items-center gap-2 truncate">
          <BookMarked className="w-4 h-4 text-[#7C776E] shrink-0" />
          <h2 className="font-serif font-bold text-sm text-[#25251F] truncate" title={activeProjectTitle}>
            {activeProjectTitle}
          </h2>
        </div>
      </div>

      {/* Dynamic Chapters List */}
      <div className="flex-1 p-3 space-y-1 text-xs">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-[#8A847A] px-2 mb-2 flex items-center justify-between">
          <span>Chapters</span>
          <span className="font-mono">{chapters.length}</span>
        </div>

        {chapters.map((ch) => {
          const isActive = activeChapterId === ch.id || ch.title === useInkFlowStore.getState().activeChapterTitle;
          return (
            <div
              key={ch.id}
              onClick={() => handleSelectChapter(ch)}
              className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-left transition-colors cursor-pointer group ${
                isActive
                  ? 'bg-[#E1EAD9] text-[#2C3E25] font-semibold shadow-2xs'
                  : 'text-[#615C53] hover:bg-[#ECE5D8] hover:text-[#25251F]'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileText className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#3E5535]' : 'text-[#8A847A]'}`} />
                <span className="truncate">{ch.title}</span>
              </div>

              {chapters.length > 1 && (
                <button
                  onClick={(e) => handleDeleteChapter(e, ch.id)}
                  title="Delete chapter"
                  className="opacity-0 group-hover:opacity-100 p-1 text-[#8A847A] hover:text-[#C77B5B] rounded transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Chapter Button */}
      <div className="p-3 border-t border-[#E8E2D7]">
        <button
          onClick={handleAddChapter}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-dashed border-[#CFC7B9] text-xs font-medium text-[#6B665C] hover:bg-[#EAE4D7] hover:text-[#25251F] hover:border-[#B5AC9C] transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add chapter</span>
        </button>
      </div>
    </aside>
  );
};
