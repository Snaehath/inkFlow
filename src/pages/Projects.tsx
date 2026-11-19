import React, { useEffect, useState, useMemo } from 'react';
import { 
  Plus, 
  MoreHorizontal, 
  BookOpen, 
  FileText, 
  Grid, 
  List, 
  ChevronDown, 
  Trash2,
  X
} from 'lucide-react';
import { useInkFlowStore } from '../store/useInkFlowStore';
import { db } from '../storage/DexieStorage';
import { ProceduralArt } from '../components/ui/ProceduralArt';
import type { Project } from '../types';

function getNow(): number {
  return Date.now();
}

interface ProjectWithStats extends Project {
  chapterCount: number;
  wordCount: number;
  formatUnit: string; // 'chapters' | 'drafts' | 'posts' | 'stories'
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
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

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
    const projectId = `proj-${now}`;
    const chapterId = `ch-${now}`;
    const sceneId = `sc-${now}`;

    await db.projects.add({
      id: projectId,
      title: newTitle.trim(),
      genre: newGenre,
      targetWordCount: newTargetWords,
      description: `${newGenre} manuscript`,
      activeSceneId: sceneId,
      createdAt: now,
      updatedAt: now,
    });

    await db.chapters.add({
      id: chapterId,
      projectId: projectId,
      title: 'Chapter 01 — The Beginning',
      order: 1,
      createdAt: now,
      updatedAt: now,
    });

    await db.scenes.add({
      id: sceneId,
      chapterId: chapterId,
      projectId: projectId,
      title: 'Chapter 01 — The Beginning',
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

    setIsNewProjectModalOpen(false);
    setNewTitle('');
    setRefreshKey(k => k + 1);

    setActiveProjectId(projectId);
    setActiveProjectTitle(newTitle.trim());
    setActiveChapterTitle('Chapter 01 — The Beginning');
    setActiveSceneId(sceneId);
    setCurrentScreen('editor');
  };

  const handleDeleteProject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (projects.length <= 1) return; // Keep at least one
    await db.projects.delete(id);
    await db.chapters.where('projectId').equals(id).delete();
    await db.scenes.where('projectId').equals(id).delete();
    setActiveMenuId(null);
    setRefreshKey(k => k + 1);
  };

  // Tab counts
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
    <div className="flex-1 overflow-y-auto px-8 py-8 max-w-6xl mx-auto w-full space-y-6 select-none">
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

        <button
          onClick={() => setIsNewProjectModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C77B5B] hover:bg-[#B3684A] text-white text-xs font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
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

          <button
            onClick={() => setActiveTab('Other')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'Other'
                ? 'bg-[#E1EAD9] text-[#2C3E25] font-semibold shadow-2xs'
                : 'text-[#615C53] hover:bg-[#EAE4D7] hover:text-[#25251F]'
            }`}
          >
            Others <span className="text-[10px] opacity-70 ml-0.5">{tabCounts.others}</span>
          </button>
        </div>

        {/* Sort & View Mode Toggle */}
        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F3EEE5] border border-[#E3DDD3] text-xs font-medium text-[#403D37] transition-colors cursor-pointer"
            >
              <span>Sort: {sortBy === 'recent' ? 'Recent' : sortBy === 'title' ? 'Title' : 'Words'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#7C776E]" />
            </button>

            {isSortDropdownOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-[#FAF7F2] border border-[#DDD5C7] rounded-xl shadow-lg p-1 z-30 text-xs">
                <button
                  onClick={() => { setSortBy('recent'); setIsSortDropdownOpen(false); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg ${sortBy === 'recent' ? 'bg-[#E1EAD9] text-[#2C3E25] font-semibold' : 'hover:bg-[#EFEAE0]'}`}
                >
                  Recent
                </button>
                <button
                  onClick={() => { setSortBy('title'); setIsSortDropdownOpen(false); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg ${sortBy === 'title' ? 'bg-[#E1EAD9] text-[#2C3E25] font-semibold' : 'hover:bg-[#EFEAE0]'}`}
                >
                  Title
                </button>
                <button
                  onClick={() => { setSortBy('words'); setIsSortDropdownOpen(false); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg ${sortBy === 'words' ? 'bg-[#E1EAD9] text-[#2C3E25] font-semibold' : 'hover:bg-[#EFEAE0]'}`}
                >
                  Word count
                </button>
              </div>
            )}
          </div>

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => handleOpenProject(proj)}
              className="group bg-[#FAF7F2] hover:bg-[#F3EEE5] border border-[#E3DDD3] rounded-2xl overflow-hidden shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col relative"
            >
              {/* Procedural / Dynamic Cover Art */}
              <div className="h-44 w-full relative overflow-hidden bg-[#ECE5D8]">
                <ProceduralArt seedText={`${proj.title}-${proj.genre}`} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" />
                
                {/* Three-dots menu button */}
                <div className="absolute top-2.5 right-2.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(activeMenuId === proj.id ? null : proj.id);
                    }}
                    className="p-1.5 rounded-xl bg-black/35 hover:bg-black/55 text-white backdrop-blur-xs transition-colors cursor-pointer"
                  >
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>

                  {activeMenuId === proj.id && (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 mt-1 w-36 bg-[#FAF7F2] border border-[#DDD5C7] rounded-xl shadow-lg p-1 z-40 text-xs"
                    >
                      <button
                        onClick={() => handleOpenProject(proj)}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#EFEAE0] text-[#3A3731]"
                      >
                        Open Editor
                      </button>
                      {projects.length > 1 && (
                        <button
                          onClick={(e) => handleDeleteProject(e, proj.id)}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#FBEBEB] text-[#C77B5B] flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex flex-col justify-between flex-1 space-y-3">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#25251F] group-hover:text-[#181814] truncate">
                    {proj.title}
                  </h3>

                  <div className="mt-1">
                    <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#EAE4D7] text-[#555047] border border-[#DCD5C8]">
                      {proj.genre}
                    </span>
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
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-[#FAF7F2] border border-[#E3DDD3] rounded-2xl overflow-hidden divide-y divide-[#EBE5DA] shadow-2xs">
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
                  <span className="text-[11px] text-[#7A7469]">
                    {proj.genre}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6 shrink-0 text-xs text-[#706B62] font-mono">
                <span>{proj.chapterCount} {proj.formatUnit}</span>
                <span>{proj.wordCount.toLocaleString()} words</span>
                <button
                  onClick={(e) => handleDeleteProject(e, proj.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-[#8A847A] hover:text-[#C77B5B] rounded transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Project Modal */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-[#FAF7F2] border border-[#DDD5C7] rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D7]">
              <h2 className="font-serif font-bold text-lg text-[#25251F]">
                Create New Project
              </h2>
              <button 
                onClick={() => setIsNewProjectModalOpen(false)}
                className="p-1 text-[#8A847A] hover:text-[#25251F] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#403D37] mb-1">
                  Project Title
                </label>
                <input
                  autoFocus
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. The Silver Key, Nocturne Letters..."
                  className="w-full p-2.5 rounded-xl bg-[#F4EFE6] border border-[#DDD5C7] text-xs text-[#25251F] focus:outline-none focus:border-[#3E5535]"
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
                <input
                  type="number"
                  value={newTargetWords}
                  onChange={(e) => setNewTargetWords(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-[#F4EFE6] border border-[#DDD5C7] text-xs text-[#25251F] focus:outline-none focus:border-[#3E5535]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewProjectModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#DDD5C7] text-[#615C53] hover:bg-[#ECE5D8] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="px-4 py-2 rounded-xl bg-[#C77B5B] hover:bg-[#B3684A] text-white font-semibold shadow-xs disabled:opacity-40 transition-colors cursor-pointer"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
