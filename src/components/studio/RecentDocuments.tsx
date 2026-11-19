import React, { useEffect, useState, useRef } from 'react';
import { 
  FileText, 
  MoreHorizontal, 
  ArrowRight, 
  BookOpen, 
  Edit3, 
  Copy, 
  Trash2,
  Check
} from 'lucide-react';
import { useInkFlowStore } from '../../store/useInkFlowStore';
import { db } from '../../storage/DexieStorage';
import type { Scene, Project } from '../../types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

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
  const [activeMenuDocId, setActiveMenuDocId] = useState<string | null>(null);
  const [renameDoc, setRenameDoc] = useState<DynamicDocItem | null>(null);
  const [renameTitleInput, setRenameTitleInput] = useState('');
  const [docToDelete, setDocToDelete] = useState<DynamicDocItem | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close menu on click outside or Escape
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuDocId(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenuDocId(null);
      }
    };

    window.addEventListener('mousedown', handleGlobalClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleGlobalClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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

        const now = Date.now();
        const items: DynamicDocItem[] = scenes.map((s) => {
          const proj = projectMap.get(s.projectId);
          const diffMs = now - (s.updatedAt || now);
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
  }, [refreshKey]);

  const handleOpenDoc = (doc: DynamicDocItem) => {
    setActiveProjectId(doc.projectId);
    setActiveProjectTitle(doc.projectTitle);
    setActiveChapterId(doc.chapterId);
    setActiveChapterTitle(doc.title);
    setActiveSceneId(doc.sceneId);
    setCurrentScreen('editor');
  };

  const handleStartRename = (e: React.MouseEvent, doc: DynamicDocItem) => {
    e.stopPropagation();
    setActiveMenuDocId(null);
    setRenameDoc(doc);
    setRenameTitleInput(doc.title);
  };

  const handleSaveRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameDoc || !renameTitleInput.trim()) return;

    try {
      const now = Date.now();
      await db.scenes.update(renameDoc.sceneId, {
        title: renameTitleInput.trim(),
        updatedAt: now
      });
      setRenameDoc(null);
      setRefreshKey(k => k + 1);
    } catch (err) {
      console.warn('Failed to rename scene:', err);
    }
  };

  const handleDuplicateDoc = async (e: React.MouseEvent, doc: DynamicDocItem) => {
    e.stopPropagation();
    setActiveMenuDocId(null);
    try {
      const existing = await db.scenes.get(doc.sceneId);
      if (!existing) return;

      const now = Date.now();
      const newSceneId = `sc-${now}-${Math.random().toString(36).slice(2, 6)}`;
      await db.scenes.add({
        ...existing,
        id: newSceneId,
        title: `${doc.title} (Copy)`,
        createdAt: now,
        updatedAt: now
      });
      setRefreshKey(k => k + 1);
    } catch (err) {
      console.warn('Failed to duplicate scene:', err);
    }
  };

  const handleDeleteDoc = (e: React.MouseEvent, doc: DynamicDocItem) => {
    e.stopPropagation();
    setActiveMenuDocId(null);
    setDocToDelete(doc);
  };

  const handleConfirmDelete = async () => {
    if (!docToDelete) return;
    try {
      await db.scenes.delete(docToDelete.sceneId);
      setDocToDelete(null);
      setRefreshKey(k => k + 1);
    } catch (err) {
      console.warn('Failed to delete scene:', err);
    }
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
    <div className="space-y-3 relative">
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

      <div className="bg-[#FAF7F2] border border-[#E3DDD3] rounded-2xl overflow-visible shadow-2xs divide-y divide-[#EBE5DA]">
        {documents.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#7A7469] font-serif italic">
            No recent manuscripts yet. Choose a format above to start writing.
          </div>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.sceneId}
              onClick={() => handleOpenDoc(doc)}
              className="flex items-center justify-between px-4 py-3 hover:bg-[#F3EEE5] transition-colors cursor-pointer group relative"
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

              <div className="flex items-center gap-4 shrink-0 relative">
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${getBadgeStyle(doc.genre)}`}>
                  {doc.genre}
                </span>
                <span className="text-xs text-[#807A70] hidden sm:inline font-mono">
                  {doc.wordCount.toLocaleString()} words
                </span>
                <span className="text-xs text-[#807A70] hidden sm:inline">
                  {doc.timeAgo}
                </span>

                {/* Options Button */}
                <div className="relative">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuDocId(activeMenuDocId === doc.sceneId ? null : doc.sceneId);
                    }}
                    title="Document options"
                    className="p-1.5 text-[#8A847A] hover:text-[#25251F] hover:bg-[#EAE4D7] rounded-lg transition-colors cursor-pointer"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {/* Options Dropdown Menu */}
                  {activeMenuDocId === doc.sceneId && (
                    <div 
                      ref={menuRef}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-8 w-44 bg-[#FAF7F2] border border-[#DDD5C7] rounded-xl shadow-lg p-1.5 z-50 text-xs font-sans divide-y divide-[#EFEAE0]"
                    >
                      <div className="space-y-0.5 pb-1">
                        <button
                          onClick={() => {
                            setActiveMenuDocId(null);
                            handleOpenDoc(doc);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#EFEAE0] text-[#33302A] flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-[#7A7469]" />
                          <span>Open in Editor</span>
                        </button>

                        <button
                          onClick={(e) => handleStartRename(e, doc)}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#EFEAE0] text-[#33302A] flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#7A7469]" />
                          <span>Rename</span>
                        </button>

                        <button
                          onClick={(e) => handleDuplicateDoc(e, doc)}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#EFEAE0] text-[#33302A] flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5 text-[#7A7469]" />
                          <span>Duplicate</span>
                        </button>
                      </div>

                      <div className="pt-1">
                        <button
                          onClick={(e) => handleDeleteDoc(e, doc)}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#FCEBE6] text-[#C77B5B] flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* shadcn Dialog: Rename Document */}
      <Dialog open={!!renameDoc} onOpenChange={(open) => !open && setRenameDoc(null)}>
        <DialogContent className="bg-[#FAF7F2] border border-[#DDD5C7] rounded-2xl p-6 max-w-md shadow-xl text-[#25251F]">
          <DialogHeader className="pb-2 border-b border-[#EBE5DA]">
            <DialogTitle className="font-serif font-bold text-base text-[#25251F]">
              Rename Document
            </DialogTitle>
            <DialogDescription className="text-xs text-[#6B655A]">
              Update the title for this manuscript chapter or scene.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveRename} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-[#656057] mb-1">
                Document Title
              </label>
              <input
                type="text"
                value={renameTitleInput}
                onChange={(e) => setRenameTitleInput(e.target.value)}
                autoFocus
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#D5CEC2] text-sm text-[#25251F] focus:outline-none focus:ring-1 focus:ring-[#3F5236]"
                placeholder="e.g. Chapter 01 — The Letter"
              />
            </div>

            <DialogFooter className="flex justify-end gap-2 pt-2 bg-transparent border-none p-0">
              <button
                type="button"
                onClick={() => setRenameDoc(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#656057] hover:bg-[#EAE4D7] transition-colors cursor-pointer border border-[#D5CEC2]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!renameTitleInput.trim()}
                className="px-4 py-2 rounded-xl bg-[#3F5236] hover:bg-[#32422B] text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* shadcn AlertDialog: Delete Document */}
      <AlertDialog open={!!docToDelete} onOpenChange={(open) => !open && setDocToDelete(null)}>
        <AlertDialogContent className="bg-[#FAF7F2] border border-[#DDD5C7] rounded-2xl p-6 max-w-md shadow-xl text-[#25251F]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-lg font-bold text-[#25251F]">
              Delete Document
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-[#6B655A] leading-relaxed">
              Are you sure you want to remove <strong className="text-[#25251F]">"{docToDelete?.title}"</strong>? This will remove the draft from your recent documents and local storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex gap-2 justify-end bg-transparent border-none p-0">
            <AlertDialogCancel 
              onClick={() => setDocToDelete(null)}
              className="rounded-xl px-3.5 py-2 text-xs font-medium text-[#656057] hover:bg-[#EAE4D7] border border-[#D5CEC2] cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="rounded-xl px-4 py-2 bg-[#C77B5B] hover:bg-[#B3684A] text-white text-xs font-semibold cursor-pointer"
            >
              Delete Document
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
