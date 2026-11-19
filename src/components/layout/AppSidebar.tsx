import React, { useEffect, useState } from 'react';
import { 
  Home, 
  Files, 
  FolderKanban, 
  Sparkles, 
  LayoutTemplate, 
  FileText,
  Feather
} from 'lucide-react';
import { useInkFlowStore } from '../../store/useInkFlowStore';
import { db } from '../../storage/DexieStorage';
import type { AppScreen, Scene, Project } from '../../types';

interface SidebarRecentItem {
  sceneId: string;
  chapterId: string;
  projectId: string;
  title: string;
  projectTitle: string;
}

export const AppSidebar: React.FC = () => {
  const { 
    currentScreen, 
    setCurrentScreen,
    setActiveProjectId,
    setActiveProjectTitle,
    setActiveChapterId,
    setActiveChapterTitle,
    setActiveSceneId
  } = useInkFlowStore();

  const [recentDocs, setRecentDocs] = useState<SidebarRecentItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    const loadRecent = async () => {
      try {
        const scenes: Scene[] = await db.scenes.orderBy('updatedAt').reverse().limit(5).toArray();
        const projectMap = new Map<string, Project>();
        const projects = await db.projects.toArray();
        for (const p of projects) {
          projectMap.set(p.id, p);
        }

        const items: SidebarRecentItem[] = scenes.map((s) => ({
          sceneId: s.id,
          chapterId: s.chapterId,
          projectId: s.projectId,
          title: s.title || 'Untitled Draft',
          projectTitle: projectMap.get(s.projectId)?.title || 'Manuscript'
        }));

        if (isMounted) setRecentDocs(items);
      } catch (err) {
        console.warn('Failed to load recent sidebar docs:', err);
      }
    };

    loadRecent();
    return () => {
      isMounted = false;
    };
  }, [currentScreen]);

  const navItems: Array<{ id: AppScreen; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'studio', label: 'Studio', icon: Home },
    { id: 'editor', label: 'Writing Editor', icon: Files },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'skills', label: 'Skills & AI', icon: Sparkles },
    { id: 'templates', label: 'Templates', icon: LayoutTemplate },
  ];

  const handleOpenDoc = (doc: SidebarRecentItem) => {
    setActiveProjectId(doc.projectId);
    setActiveProjectTitle(doc.projectTitle);
    setActiveChapterId(doc.chapterId);
    setActiveChapterTitle(doc.title);
    setActiveSceneId(doc.sceneId);
    setCurrentScreen('editor');
  };

  return (
    <aside className="w-56 h-screen flex flex-col bg-[#F3EFE7] border-r border-[#E3DDD3] select-none shrink-0 transition-all">
      {/* Brand Header */}
      <div className="px-5 py-5 flex items-center justify-between">
        <button 
          onClick={() => setCurrentScreen('studio')}
          className="text-left group flex items-center gap-1.5 focus:outline-none cursor-pointer"
        >
          <span className="font-serif font-bold text-2xl tracking-tight text-[#25251F] group-hover:text-[#181814] transition-colors">
            inkFlow
          </span>
        </button>
      </div>

      {/* Primary Navigation */}
      <nav className="px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentScreen(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all text-left cursor-pointer ${
                isActive 
                  ? 'bg-[#E1EAD9] text-[#2C3E25] font-semibold shadow-xs' 
                  : 'text-[#5A5852] hover:bg-[#EAE4D7] hover:text-[#25251F]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#3E5535]' : 'text-[#7C776E]'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Recent Writing Section - Dynamically populated */}
      <div className="mt-8 px-4 flex-1 overflow-y-auto">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#8A847A] px-2 mb-2 flex items-center justify-between">
          <span>Recent</span>
          <span className="font-mono text-[10px]">{recentDocs.length}</span>
        </div>
        <div className="space-y-0.5">
          {recentDocs.length === 0 ? (
            <div className="px-2 py-2 text-[11px] text-[#9E988D] italic font-serif">
              No recent documents
            </div>
          ) : (
            recentDocs.map((doc) => (
              <button
                key={doc.sceneId}
                onClick={() => handleOpenDoc(doc)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium text-[#504D46] hover:bg-[#EAE4D7] hover:text-[#25251F] transition-colors text-left truncate cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-[#8A847A] shrink-0" />
                <span className="truncate">{doc.title}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Bottom Editorial Callout */}
      <div className="p-3 m-3 rounded-xl bg-[#ECE5D8]/70 border border-[#DFD8CC] relative overflow-hidden">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#E2DACB] text-[#5C574F] shrink-0 mt-0.5">
            <Feather className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-serif font-semibold text-xs text-[#25251F]">
              Write anything.
            </div>
            <div className="text-[11px] leading-tight text-[#757067] mt-0.5">
              Stories, novels, emails, blogs and more.
            </div>
          </div>
        </div>
        <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full bg-[#DFD6C6]/40 pointer-events-none" />
      </div>
    </aside>
  );
};
