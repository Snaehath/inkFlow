import React, { useEffect, useState, useRef } from 'react';
import { Plus, ArrowRight, MoreHorizontal, BookOpen, FolderKanban, RotateCcw } from 'lucide-react';
import { useInkFlowStore } from '../store/useInkFlowStore';
import { db, resetToCleanDefaults } from '../storage/DexieStorage';
import { NewWritingMenu } from '../components/studio/NewWritingMenu';
import { RecentDocuments } from '../components/studio/RecentDocuments';
import { ProjectCards } from '../components/studio/ProjectCards';
import { ProceduralArt } from '../components/ui/ProceduralArt';

function createEntityId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function getTimestamp(): number {
  return Date.now();
}

interface ResumeCardInfo {
  projectTitle: string;
  chapterTitle: string;
  projectId: string;
  chapterId: string;
  sceneId: string;
  genre: string;
  excerpt: string;
  wordCount: number;
}

export const Studio: React.FC = () => {
  const { 
    setCurrentScreen,
    setActiveProjectId,
    setActiveProjectTitle,
    setActiveChapterId,
    setActiveChapterTitle,
    setActiveSceneId,
    setActiveDocumentType
  } = useInkFlowStore();

  const [resumeInfo, setResumeInfo] = useState<ResumeCardInfo | null>(null);
  const [isHeroMenuOpen, setIsHeroMenuOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const heroMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (heroMenuRef.current && !heroMenuRef.current.contains(e.target as Node)) {
        setIsHeroMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchLatest = async () => {
      try {
        const latestScene = await db.scenes.orderBy('updatedAt').reverse().first();
        if (latestScene && isMounted) {
          const project = await db.projects.get(latestScene.projectId);
          const plainText = latestScene.contentHtml
            ? latestScene.contentHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
            : '';

          setResumeInfo({
            projectTitle: project?.title || 'Current Manuscript',
            chapterTitle: latestScene.title || 'Active Draft',
            projectId: latestScene.projectId,
            chapterId: latestScene.chapterId,
            sceneId: latestScene.id,
            genre: project?.genre || 'Story',
            excerpt: plainText ? `"${plainText.slice(0, 160)}..."` : 'Draft ready for writing. Click below to continue.',
            wordCount: latestScene.wordCount || 0
          });
        }
      } catch (err) {
        console.warn('Failed to load resume card:', err);
      }
    };

    fetchLatest();
    return () => {
      isMounted = false;
    };
  }, [refreshTrigger]);

  const handleContinueWriting = () => {
    if (!resumeInfo) {
      setCurrentScreen('editor');
      return;
    }
    setActiveProjectId(resumeInfo.projectId);
    setActiveProjectTitle(resumeInfo.projectTitle);
    setActiveChapterId(resumeInfo.chapterId);
    setActiveChapterTitle(resumeInfo.chapterTitle);
    setActiveSceneId(resumeInfo.sceneId);
    setCurrentScreen('editor');
  };

  const handleNewWriting = async () => {
    const now = getTimestamp();
    const newProjectId = createEntityId('proj');
    const newChapterId = createEntityId('ch');
    const newSceneId = createEntityId('sc');

    await db.projects.add({
      id: newProjectId,
      title: 'Untitled Draft',
      genre: 'Story',
      targetWordCount: 10000,
      description: 'New creative project',
      activeSceneId: newSceneId,
      createdAt: now,
      updatedAt: now,
    });

    await db.chapters.add({
      id: newChapterId,
      projectId: newProjectId,
      title: 'Chapter 01',
      order: 1,
      createdAt: now,
      updatedAt: now,
    });

    await db.scenes.add({
      id: newSceneId,
      chapterId: newChapterId,
      projectId: newProjectId,
      title: 'Chapter 01',
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
    setActiveProjectTitle('Untitled Draft');
    setActiveChapterId(newChapterId);
    setActiveChapterTitle('Chapter 01');
    setActiveSceneId(newSceneId);
    setActiveDocumentType('story');
    setCurrentScreen('editor');
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8 max-w-5xl mx-auto w-full space-y-8 select-none">
      {/* Studio Header: Greeting & Quick Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#25251F]">
            Good afternoon.
          </h1>
          <p className="text-xs text-[#7A7469] mt-1 font-sans">
            Ready to shape your stories, manuscripts, and dispatches.
          </p>
        </div>

        <button
          onClick={handleNewWriting}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C77B5B] hover:bg-[#B3684A] text-white text-xs font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New writing</span>
        </button>
      </div>

      {/* Pick up where you left off Card - Fully Dynamic */}
      {resumeInfo && (
        <div className="space-y-3">
          <h3 className="font-serif text-lg font-semibold text-[#25251F]">
            Pick up where you left off.
          </h3>

          <div className="bg-[#FAF7F2] border border-[#E3DDD3] rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Visual Scenic Cover Art (Dynamic Procedural) */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 shadow-xs relative border border-[#DDD6C8] bg-[#E9E3D6]">
              <ProceduralArt 
                seedText={`${resumeInfo.projectTitle}-${resumeInfo.genre}`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Story Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-serif font-bold text-xl text-[#25251F] truncate">
                    {resumeInfo.projectTitle}
                  </h4>
                  <div className="text-xs font-medium text-[#7D776C] mt-0.5">
                    {resumeInfo.genre} — {resumeInfo.chapterTitle}
                  </div>
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setIsHeroMenuOpen(!isHeroMenuOpen)}
                    title="Story options"
                    className="p-1.5 text-[#8A847A] hover:text-[#25251F] hover:bg-[#EAE4D7] rounded-lg transition-colors cursor-pointer"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {isHeroMenuOpen && (
                    <div 
                      ref={heroMenuRef}
                      className="absolute right-0 top-8 w-52 bg-[#FAF7F2] border border-[#DDD5C7] rounded-xl shadow-lg p-1.5 z-50 text-xs font-sans divide-y divide-[#EFEAE0]"
                    >
                      <div className="space-y-0.5 pb-1">
                        <button
                          onClick={() => {
                            setIsHeroMenuOpen(false);
                            handleContinueWriting();
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#EFEAE0] text-[#33302A] flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-[#7A7469]" />
                          <span>Continue Writing</span>
                        </button>

                        <button
                          onClick={() => {
                            setIsHeroMenuOpen(false);
                            setCurrentScreen('projects');
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#EFEAE0] text-[#33302A] flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <FolderKanban className="w-3.5 h-3.5 text-[#7A7469]" />
                          <span>View in Projects</span>
                        </button>
                      </div>

                      <div className="pt-1">
                        <button
                          onClick={async () => {
                            setIsHeroMenuOpen(false);
                            if (window.confirm('Reset workspace to clean studio defaults (The Glass Orchard, City Letters, clean templates)?')) {
                              await resetToCleanDefaults();
                              setRefreshTrigger(k => k + 1);
                            }
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#FBEBEB] text-[#C77B5B] flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reset to Clean Defaults</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <p className="font-serif italic text-xs text-[#524E46] line-clamp-2 mt-2 leading-relaxed">
                {resumeInfo.excerpt}
              </p>

              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={handleContinueWriting}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3F5236] hover:bg-[#32422B] text-white text-xs font-semibold transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                >
                  <span>Continue writing</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs text-[#8A847A] font-mono">
                  {resumeInfo.wordCount.toLocaleString()} words logged
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Start something new (Story, Novel, Short Story, Email, Blog) */}
      <NewWritingMenu />

      {/* Recent Documents */}
      <RecentDocuments />

      {/* Your Projects */}
      <ProjectCards />
    </div>
  );
};
