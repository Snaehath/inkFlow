import React, { useEffect, useState } from 'react';
import { FileText, MoreHorizontal, ArrowRight } from 'lucide-react';
import { useInkFlowStore } from '../../store/useInkFlowStore';
import { db } from '../../storage/DexieStorage';
import type { Scene, Project } from '../../types';

interface DynamicDocItem {
  sceneId: string;
  projectId: string;
  chapterId: string;
  title: string;
  projectTitle: string;
  genre: string;
  wordCount: number;
  timeAgo: string;
}

export const RecentDocuments: React.FC = () => {
  const { 
    setCurrentScreen, 
    setActiveProjectId,
    setActiveProjectTitle, 
    setActiveChapterId,
    setActiveChapterTitle,
    setActiveSceneId 
  } = useInkFlowStore();

  const [documents, setDocuments] = useState<DynamicDocItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchRecent = async () => {
      try {
        const scenes: Scene[] = await db.scenes.orderBy('updatedAt').reverse().limit(6).toArray();
        const projectMap = new Map<string, Project>();
        const projects = await db.projects.toArray();
        for (const p of projects) {
          projectMap.set(p.id, p);
        }

        const items: DynamicDocItem[] = scenes.map((s) => {
          const proj = projectMap.get(s.projectId);
          const diffMs = Date.now() - (s.updatedAt || Date.now());
          const diffMins = Math.floor(diffMs / 60000);
          const diffHours = Math.floor(diffMins / 60);
          const diffDays = Math.floor(diffHours / 24);

          let timeAgo = 'Just now';
          if (diffDays > 0) timeAgo = `${diffDays}d ago`;
          else if (diffHours > 0) timeAgo = `${diffHours}h ago`;
          else if (diffMins > 0) timeAgo = `${diffMins}m ago`;

          return {
            sceneId: s.id,
            projectId: s.projectId,
            chapterId: s.chapterId,
            title: s.title || 'Untitled Scene',
            projectTitle: proj?.title || 'Standalone Draft',
            genre: proj?.genre || 'Story',
            wordCount: s.wordCount || 0,
            timeAgo
          };
        });

        if (isMounted) setDocuments(items);
      } catch (err) {
        console.warn('Failed to load recent documents:', err);
      }
    };

    fetchRecent();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenDoc = (doc: DynamicDocItem) => {
    setActiveProjectId(doc.projectId);
    setActiveProjectTitle(doc.projectTitle);
    setActiveChapterId(doc.chapterId);
    setActiveChapterTitle(doc.title);
    setActiveSceneId(doc.sceneId);
    setCurrentScreen('editor');
  };

  const getBadgeStyle = (genre: string) => {
    const lower = genre.toLowerCase();
    if (lower.includes('short')) return 'bg-[#E7EFE3] text-[#3A5333] border-[#D4E3CC]';
    if (lower.includes('email')) return 'bg-[#FBF1EA] text-[#8C4A2E] border-[#F2DACD]';
    if (lower.includes('blog') || lower.includes('essay')) return 'bg-[#EBF2F7] text-[#2F5370] border-[#D2E2EE]';
    if (lower.includes('novel')) return 'bg-[#F6EFE6] text-[#695333] border-[#E8DDCE]';
    return 'bg-[#EAE4D7] text-[#4E4A42] border-[#DDD5C7]';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-semibold text-[#25251F]">
          Recent documents
        </h3>
        {documents.length > 0 && (
          <button 
            onClick={() => handleOpenDoc(documents[0])}
            className="text-xs font-medium text-[#706B62] hover:text-[#25251F] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Open latest</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="bg-[#FAF7F2] border border-[#E3DDD3] rounded-2xl overflow-hidden shadow-2xs divide-y divide-[#EBE5DA]">
        {documents.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#7A7469] font-serif italic">
            No recent manuscripts yet. Choose a format above to start writing.
          </div>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.sceneId}
              onClick={() => handleOpenDoc(doc)}
              className="flex items-center justify-between px-4 py-3 hover:bg-[#F3EEE5] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-1.5 rounded-lg bg-[#EFE9DF] text-[#69645B] group-hover:bg-[#E5DFD4] group-hover:text-[#25251F] transition-colors shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="font-medium text-sm text-[#25251F] group-hover:text-[#181814] truncate block">
                    {doc.title}
                  </span>
                  <span className="text-[11px] text-[#78736A] truncate block">
                    {doc.projectTitle}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${getBadgeStyle(doc.genre)}`}>
                  {doc.genre}
                </span>
                <span className="text-xs text-[#807A70] hidden sm:inline font-mono">
                  {doc.wordCount.toLocaleString()} words
                </span>
                <span className="text-xs text-[#807A70] hidden sm:inline">
                  {doc.timeAgo}
                </span>
                <button 
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 text-[#8A847A] hover:text-[#25251F] rounded-md transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
