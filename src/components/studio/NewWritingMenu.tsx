import React from 'react';
import { Book, Library, FileText, Mail, Feather } from 'lucide-react';
import { useInkFlowStore } from '../../store/useInkFlowStore';
import { db } from '../../storage/DexieStorage';
import { Card } from '../ui/card';
import type { DocumentType } from '../../types';

function createEntityId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function getTimestamp(): number {
  return Date.now();
}

export const NewWritingMenu: React.FC = () => {
  const { 
    setCurrentScreen, 
    setActiveProjectId,
    setActiveProjectTitle, 
    setActiveChapterId,
    setActiveChapterTitle,
    setActiveSceneId,
    setActiveDocumentType 
  } = useInkFlowStore();

  const writingFormats: Array<{
    type: DocumentType;
    label: string;
    icon: React.FC<{ className?: string }>;
    defaultTitle: string;
    defaultChapter: string;
    description: string;
  }> = [
    { 
      type: 'story', 
      label: 'Story', 
      icon: Book, 
      defaultTitle: 'Untitled Story', 
      defaultChapter: 'Scene 01',
      description: 'Narrative prose & character fiction'
    },
    { 
      type: 'novel', 
      label: 'Novel', 
      icon: Library, 
      defaultTitle: 'Untitled Novel', 
      defaultChapter: 'Chapter 01 — The Beginning',
      description: 'Multi-chapter long-form manuscript'
    },
    { 
      type: 'short-story', 
      label: 'Short story', 
      icon: FileText, 
      defaultTitle: 'Untitled Short Story', 
      defaultChapter: 'Story 01 — Untitled',
      description: 'Single-scene or standalone tale'
    },
    { 
      type: 'email', 
      label: 'Email', 
      icon: Mail, 
      defaultTitle: 'Email Dispatch', 
      defaultChapter: 'Draft: Collaboration Note',
      description: 'Editorial letter, newsletter, or update'
    },
    { 
      type: 'blog', 
      label: 'Blog', 
      icon: Feather, 
      defaultTitle: 'Studio Essay', 
      defaultChapter: 'Draft Essay',
      description: 'Article, craft essay, or journal entry'
    },
  ];

  const handleStartWriting = async (format: typeof writingFormats[0]) => {
    const now = getTimestamp();
    const newProjectId = createEntityId('proj');
    const newChapterId = createEntityId('ch');
    const newSceneId = createEntityId('sc');

    // Create real records in Dexie
    await db.projects.add({
      id: newProjectId,
      title: format.defaultTitle,
      genre: format.label,
      targetWordCount: format.type === 'novel' ? 60000 : 5000,
      description: format.description,
      activeSceneId: newSceneId,
      createdAt: now,
      updatedAt: now,
    });

    await db.chapters.add({
      id: newChapterId,
      projectId: newProjectId,
      title: format.defaultChapter,
      order: 1,
      createdAt: now,
      updatedAt: now,
    });

    await db.scenes.add({
      id: newSceneId,
      chapterId: newChapterId,
      projectId: newProjectId,
      title: format.defaultChapter,
      order: 1,
      beats: [],
      charactersPresent: [],
      activePlotThreadIds: [],
      contentHtml: '',
      wordCount: 0,
      status: 'empty',
      createdAt: now,
      updatedAt: now,
    });

    setActiveProjectId(newProjectId);
    setActiveProjectTitle(format.defaultTitle);
    setActiveChapterId(newChapterId);
    setActiveChapterTitle(format.defaultChapter);
    setActiveSceneId(newSceneId);
    setActiveDocumentType(format.type);
    setCurrentScreen('editor');
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {writingFormats.map((format) => {
        const Icon = format.icon;
        return (
          <Card
            key={format.type}
            onClick={() => handleStartWriting(format)}
            className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl bg-[#FAF7F2] hover:bg-[#F3EEE5] border-[#E3DDD3] transition-all group text-center shadow-2xs hover:shadow-xs hover:-translate-y-0.5 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#EFE9DF] group-hover:bg-[#E3DDD1] flex items-center justify-center text-[#59554C] group-hover:text-[#25251F] transition-colors">
              <Icon className="w-5 h-5" />
            </div>
            <span className="font-medium text-xs text-[#38352F] group-hover:text-[#181814]">
              {format.label}
            </span>
          </Card>
        );
      })}
    </div>
  );
};