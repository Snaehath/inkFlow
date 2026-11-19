import React, { useEffect, useState, useMemo } from 'react';
import { 
  Plus, 
  MoreHorizontal, 
  BookOpen, 
  FileText, 
  Grid, 
  List, 
  ChevronDown, 
  Trash2
} from 'lucide-react';
import { useInkFlowStore } from '../store/useInkFlowStore';
import { db } from '../storage/DexieStorage';
import { ProceduralArt } from '../components/ui/ProceduralArt';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import type { Project } from '../types';

function getNow(): number {
  return Date.now();
}

interface ProjectWithStats extends Project {
  chapterCount: number;
  wordCount: number;
  formatUnit: string;
}

export const Projects: React.FC = () => {
  const { 
    setCurrentScreen, 
    setActiveProjectId, 
    setActiveProjectTitle, 
    setActiveChapterTitle,
    setActiveSceneId 
  } = useInkFlowStore();

  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<'All' | 'Novel' | 'Story' | 'Blog' | 'Series' | 'Other'>('All');
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'words'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<ProjectWithStats | null>(null);

  // New Project Form State
  const [newTitle, setNewTitle] = useState('');
  const [newGenre, setNewGenre] = useState('Novel');
  const [newTargetWords, setNewTargetWords] = useState(50000);

  useEffect(() => {
    let isMounted = true;
    const fetchProjects = async () => {
      try {
        const list = await db.projects.toArray();
        const enriched: ProjectWithStats[] = [];

        for (const p of list) {
          const chapters = await db.chapters.where('projectId').equals(p.id).toArray();
          const scenes = await db.scenes.where('projectId').equals(p.id).toArray();
          const totalWords = scenes.reduce((sum, s) => sum + (s.wordCount || 0), 0);

          let formatUnit = 'chapters';
          const g = p.genre.toLowerCase();
          if (g.includes('short') || g.includes('email')) formatUnit = 'drafts';
          else if (g.includes('blog') || g.includes('essay')) formatUnit = 'posts';
          else if (g.includes('collection') || g.includes('series')) formatUnit = 'stories';

          enriched.push({
            ...p,
            chapterCount: chapters.length || 1,
            wordCount: totalWords,
            formatUnit
          });
        }

        if (isMounted) {
          setProjects(enriched);
        }
      } catch (err) {
        console.warn('Failed to load projects:', err);
      }
    };

    fetchProjects();
    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  // Filter & Sort
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    if (activeTab !== 'All') {
      result = result.filter(p => {
        const g = p.genre.toLowerCase();
        if (activeTab === 'Novel') return g.includes('novel');
        if (activeTab === 'Story') return g.includes('story') && !g.includes('series');
        if (activeTab === 'Blog') return g.includes('blog') || g.includes('essay');
        if (activeTab === 'Series') return g.includes('series') || g.includes('collection');
        return true;
      });
    }

    result.sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'words') return b.wordCount - a.wordCount;
      return (b.updatedAt || 0) - (a.updatedAt || 0);
    });

    return result;
  }, [projects, activeTab, sortBy]);

  const handleOpenProject = async (p: ProjectWithStats) => {
    setActiveProjectId(p.id);
    setActiveProjectTitle(p.title);

    const firstChapter = await db.chapters.where('projectId').equals(p.id).sortBy('order');
    if (firstChapter.length > 0) {
      setActiveChapterTitle(firstChapter[0].title);
      const scene = await db.scenes.where('chapterId').equals(firstChapter[0].id).first();
      if (scene) {
        setActiveSceneId(scene.id);
      }
    } else {
      setActiveChapterTitle('Chapter 01');
    }

    setCurrentScreen('editor');
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const now = getNow();
    const projId = `project-${now}-${Math.random().toString(36).slice(2, 6)}`;
    const chId = `ch-${now}-1`;
    const scId = `sc-${now}-1`;

    await db.projects.add({
      id: projId,
      title: newTitle.trim(),
      genre: newGenre,
      targetWordCount: newTargetWords,
      description: `New ${newGenre.toLowerCase()} project`,
      activeSceneId: scId,
      createdAt: now,
      updatedAt: now,
    });

    await db.chapters.add({
      id: chId,
      projectId: projId,
      title: 'Chapter 01',
      order: 1,
      createdAt: now,
      updatedAt: now,
    });

    await db.scenes.add({
      id: scId,
      chapterId: chId,
      projectId: projId,
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

    setNewTitle('');
    setIsNewProjectModalOpen(false);
    setRefreshKey(k => k + 1);

    setActiveProjectId(projId);
    setActiveProjectTitle(newTitle.trim());
    setActiveChapterTitle('Chapter 01');
    setActiveSceneId(scId);
    setCurrentScreen('editor');
  };

  const handleDeleteProject = (e: React.MouseEvent, p: ProjectWithStats) => {
    e.stopPropagation();
    if (projects.length <= 1) return;
    setProjectToDelete(p);
  };

  const handleConfirmDeleteProject = async () => {
    if (!projectToDelete) return;
    try {
      await db.projects.delete(projectToDelete.id);
      await db.chapters.where('projectId').equals(projectToDelete.id).delete();
      await db.scenes.where('projectId').equals(projectToDelete.id).delete();
      setProjectToDelete(null);
      setRefreshKey(k => k + 1);
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  const tabCounts = useMemo(() => {
    return {
      all: projects.length,
      novels: projects.filter(p => p.genre.toLowerCase().includes('novel')).length,
      stories: projects.filter(p => p.genre.toLowerCase().includes('story') && !p.genre.toLowerCase().includes('series')).length,
      blogs: projects.filter(p => p.genre.toLowerCase().includes('blog') || p.genre.toLowerCase().includes('essay')).length,
      series: projects.filter(p => p.genre.toLowerCase().includes('series') || p.genre.toLowerCase().includes('collection')).length,
      others: projects.filter(p => !p.genre.toLowerCase().includes('novel') && !p.genre.toLowerCase().includes('story') && !p.genre.toLowerCase().includes('blog')).length,
    };
  }, [projects]);

  return (
    <div className="flex-1 overflow-y-auto px-8 lg:px-12 py-8 w-full space-y-6 select-none">
      {/* Header: Title & Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#25251F]">
            Projects
          </h1>
          <p className="text-xs text-[#7A7469] mt-1 font-sans">
            Organize your long-form works, series, and writing collections.
          </p>
        </div>

        <Button
          onClick={() => setIsNewProjectModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C77B5B] hover:bg-[#B3684A] text-white text-xs font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </Button>
      </div>

      {/* Filter Tabs & Controls Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'All'
                ? 'bg-[#E1EAD9] text-[#2C3E25] font-semibold shadow-2xs'
                : 'text-[#615C53] hover:bg-[#EAE4D7] hover:text-[#25251F]'
            }`}
          >
            All Projects <span className="text-[10px] opacity-70 ml-0.5">{tabCounts.all}</span>
          </button>

          <button
            onClick={() => setActiveTab('Novel')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'Novel'
                ? 'bg-[#E1EAD9] text-[#2C3E25] font-semibold shadow-2xs'
                : 'text-[#615C53] hover:bg-[#EAE4D7] hover:text-[#25251F]'
            }`}
          >
            Novels <span className="text-[10px] opacity-70 ml-0.5">{tabCounts.novels}</span>
          </button>

          <button
            onClick={() => setActiveTab('Story')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'Story'
                ? 'bg-[#E1EAD9] text-[#2C3E25] font-semibold shadow-2xs'
                : 'text-[#615C53] hover:bg-[#EAE4D7] hover:text-[#25251F]'
            }`}
          >
            Stories <span className="text-[10px] opacity-70 ml-0.5">{tabCounts.stories}</span>
          </button>

          <button
            onClick={() => setActiveTab('Blog')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'Blog'
                ? 'bg-[#E1EAD9] text-[#2C3E25] font-semibold shadow-2xs'
                : 'text-[#615C53] hover:bg-[#EAE4D7] hover:text-[#25251F]'
            }`}
          >
            Blogs <span className="text-[10px] opacity-70 ml-0.5">{tabCounts.blogs}</span>
          </button>

          <button
            onClick={() => setActiveTab('Series')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'Series'
                ? 'bg-[#E1EAD9] text-[#2C3E25] font-semibold shadow-2xs'
                : 'text-[#615C53] hover:bg-[#EAE4D7] hover:text-[#25251F]'
            }`}
          >
            Series <span className="text-[10px] opacity-70 ml-0.5">{tabCounts.series}</span>
          </button>
        </div>

        {/* Right Controls: Sort & Grid/List view */}
        <div className="flex items-center gap-3">
          {/* shadcn DropdownMenu for Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F2] border-[#DDD5C7] text-xs font-medium text-[#403D37] hover:bg-[#F3EEE5] shadow-2xs cursor-pointer"
              >
                <span>Sort: {sortBy === 'recent' ? 'Recent' : sortBy === 'title' ? 'Title' : 'Words'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#7C776E]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 bg-[#FAF7F2] border-[#DDD5C7] rounded-xl shadow-lg p-1 z-30 text-xs">
              <DropdownMenuItem
                onClick={() => setSortBy('recent')}
                className={`rounded-lg cursor-pointer ${sortBy === 'recent' ? 'bg-[#E1EAD9] text-[#2C3E25] font-semibold' : 'hover:bg-[#EFEAE0]'}`}
              >
                Recent
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortBy('title')}
                className={`rounded-lg cursor-pointer ${sortBy === 'title' ? 'bg-[#E1EAD9] text-[#2C3E25] font-semibold' : 'hover:bg-[#EFEAE0]'}`}
              >
                Title
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortBy('words')}
                className={`rounded-lg cursor-pointer ${sortBy === 'words' ? 'bg-[#E1EAD9] text-[#2C3E25] font-semibold' : 'hover:bg-[#EFEAE0]'}`}
              >
                Word count
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Grid / List View Toggle */}
          <div className="flex items-center bg-[#FAF7F2] border border-[#E3DDD3] rounded-xl p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-[#E1EAD9] text-[#2C3E25]' : 'text-[#7C776E] hover:text-[#25251F]'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-[#E1EAD9] text-[#2C3E25]' : 'text-[#7C776E] hover:text-[#25251F]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Projects Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredProjects.map((proj) => (
            <Card
              key={proj.id}
              onClick={() => handleOpenProject(proj)}
              className="group bg-[#FAF7F2] hover:bg-[#F3EEE5] border-[#E3DDD3] rounded-2xl overflow-hidden shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col relative p-0 gap-0"
            >
              {/* Procedural / Dynamic Cover Art */}
              <div className="h-44 w-full relative overflow-hidden bg-[#ECE5D8]">
                <ProceduralArt seedText={`${proj.title}-${proj.genre}`} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" />
                
                {/* Three-dots menu button */}
                <div className="absolute top-2.5 right-2.5">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => e.stopPropagation()}
                        className="h-7 w-7 p-0 rounded-xl bg-black/35 hover:bg-black/55 text-white backdrop-blur-xs transition-colors cursor-pointer"
                        title="Project options"
                      >
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      onClick={(e) => e.stopPropagation()}
                      className="w-36 bg-[#FAF7F2] border-[#DDD5C7] rounded-xl shadow-lg p-1 z-40 text-xs"
                    >
                      <DropdownMenuItem
                        onClick={() => handleOpenProject(proj)}
                        className="rounded-lg hover:bg-[#EFEAE0] text-[#3A3731] cursor-pointer"
                      >
                        Open Editor
                      </DropdownMenuItem>
                      {projects.length > 1 && (
                        <>
                          <DropdownMenuSeparator className="bg-[#EFEAE0] my-1" />
                          <DropdownMenuItem
                            onClick={(e) => handleDeleteProject(e, proj)}
                            className="rounded-lg hover:bg-[#FBEBEB] text-[#C77B5B] focus:text-[#C77B5B] focus:bg-[#FBEBEB] flex items-center gap-1.5 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Card Body */}
              <CardContent className="p-4 flex flex-col justify-between flex-1 space-y-3">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#25251F] group-hover:text-[#181814] truncate">
                    {proj.title}
                  </h3>

                  <div className="mt-1">
                    <Badge variant="outline" className="text-[11px] font-medium bg-[#EAE4D7] text-[#555047] border-[#DCD5C8] px-2 py-0.5 rounded-md">
                      {proj.genre}
                    </Badge>
                  </div>
                </div>

                {/* Chapter Count and Word Count Area (Prominent, No Progress Bar) */}
                <div className="pt-2 border-t border-[#E8E2D7] flex items-center justify-between text-xs text-[#706B62] font-mono">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#8A847A]" />
                    <span>{proj.chapterCount} {proj.formatUnit}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#8A847A]" />
                    <span>{proj.wordCount.toLocaleString()} words</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* List View */
        <Card className="bg-[#FAF7F2] border-[#E3DDD3] rounded-2xl overflow-hidden divide-y divide-[#EBE5DA] shadow-2xs p-0 gap-0">
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => handleOpenProject(proj)}
              className="p-4 flex items-center justify-between hover:bg-[#F3EEE5] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-16 h-12 rounded-xl overflow-hidden shrink-0 border border-[#DDD5C7]">
                  <ProceduralArt seedText={`${proj.title}-${proj.genre}`} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-serif font-bold text-sm text-[#25251F] group-hover:text-[#181814] truncate">
                    {proj.title}
                  </h3>
                  <Badge variant="outline" className="text-[10px] text-[#7A7469] mt-0.5">
                    {proj.genre}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-6 shrink-0 text-xs text-[#706B62] font-mono">
                <span>{proj.chapterCount} {proj.formatUnit}</span>
                <span>{proj.wordCount.toLocaleString()} words</span>
                {projects.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDeleteProject(e, proj)}
                    className="opacity-0 group-hover:opacity-100 h-8 w-8 text-[#8A847A] hover:text-[#C77B5B] hover:bg-[#FCEBE6] rounded-lg transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* shadcn Dialog: Create New Project */}
      <Dialog open={isNewProjectModalOpen} onOpenChange={setIsNewProjectModalOpen}>
        <DialogContent className="bg-[#FAF7F2] border border-[#DDD5C7] rounded-2xl max-w-md w-full p-6 shadow-xl text-[#25251F]">
          <DialogHeader className="pb-2 border-b border-[#E8E2D7]">
            <DialogTitle className="font-serif font-bold text-lg text-[#25251F]">
              Create New Project
            </DialogTitle>
            <DialogDescription className="text-xs text-[#6B655A]">
              Set up a structured writing workspace for your next novel, series, or collection.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateProject} className="space-y-4 text-xs pt-2">
            <div>
              <label className="block font-semibold text-[#403D37] mb-1">
                Project Title
              </label>
              <Input
                autoFocus
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. The Silver Key, Nocturne Letters..."
                className="w-full bg-[#F4EFE6] border-[#DDD5C7] text-xs text-[#25251F] rounded-xl focus-visible:ring-1 focus-visible:ring-[#3E5535]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#403D37] mb-1">
                Writing Format / Genre
              </label>
              <select
                value={newGenre}
                onChange={(e) => setNewGenre(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#F4EFE6] border border-[#DDD5C7] text-xs text-[#25251F] focus:outline-none focus:border-[#3E5535]"
              >
                <option value="Novel">Novel</option>
                <option value="Short Story">Short Story</option>
                <option value="Story Collection">Story Collection</option>
                <option value="Blog Series">Blog Series</option>
                <option value="Email Series">Email Series</option>
                <option value="Craft Essays">Craft Essays</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#403D37] mb-1">
                Target Word Count
              </label>
              <Input
                type="number"
                value={newTargetWords}
                onChange={(e) => setNewTargetWords(Number(e.target.value))}
                className="w-full bg-[#F4EFE6] border-[#DDD5C7] text-xs text-[#25251F] rounded-xl focus-visible:ring-1 focus-visible:ring-[#3E5535]"
              />
            </div>

            <DialogFooter className="flex items-center justify-end gap-2 pt-2 bg-transparent border-none p-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNewProjectModalOpen(false)}
                className="rounded-xl border-[#DDD5C7] text-[#615C53] hover:bg-[#ECE5D8] cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!newTitle.trim()}
                className="rounded-xl bg-[#C77B5B] hover:bg-[#B3684A] text-white font-semibold shadow-xs disabled:opacity-40 cursor-pointer"
              >
                Create Project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* shadcn AlertDialog: Delete Project */}
      <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <AlertDialogContent className="bg-[#FAF7F2] border border-[#DDD5C7] rounded-2xl p-6 max-w-md shadow-xl text-[#25251F]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-lg font-bold text-[#25251F]">
              Delete Project
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-[#6B655A] leading-relaxed">
              Are you sure you want to delete <strong className="text-[#25251F]">"{projectToDelete?.title}"</strong>? All chapters and scenes associated with this project will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex gap-2 justify-end bg-transparent border-none p-0">
            <AlertDialogCancel
              onClick={() => setProjectToDelete(null)}
              className="rounded-xl px-3.5 py-2 text-xs font-medium text-[#656057] hover:bg-[#EAE4D7] border border-[#D5CEC2] cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteProject}
              className="rounded-xl px-4 py-2 bg-[#C77B5B] hover:bg-[#B3684A] text-white text-xs font-semibold cursor-pointer"
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};