import React, { useEffect, useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { useInkFlowStore } from '../../store/useInkFlowStore';
import { db } from '../../storage/DexieStorage';
import { ProceduralArt } from '../ui/ProceduralArt';
import type { Project } from '../../types';

interface ProjectCardData extends Project {
  docCount: number;
}

export const ProjectCards: React.FC = () => {
  const { 
    setCurrentScreen, 
    setActiveProjectId, 
    setActiveProjectTitle, 
    setActiveChapterTitle,
    setActiveSceneId 
  } = useInkFlowStore();

  const [projects, setProjects] = useState<ProjectCardData[]>([]);

  useEffect(() => {
    let isMounted = true;
    const loadProjects = async () => {
      try {
        const list = await db.projects.toArray();
        const cards: ProjectCardData[] = [];
        for (const p of list) {
          const count = await db.scenes.where('projectId').equals(p.id).count();
          cards.push({
            ...p,
            docCount: count
          });
        }
        if (isMounted) setProjects(cards);
      } catch (err) {
        console.warn('Failed to load projects:', err);
      }
    };
    loadProjects();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenProject = async (proj: ProjectCardData) => {
    setActiveProjectId(proj.id);
    setActiveProjectTitle(proj.title);

    // Find first chapter or create one
    const firstChapter = await db.chapters.where('projectId').equals(proj.id).sortBy('order');
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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-semibold text-[#25251F]">
          Your projects
        </h3>
        <button
          onClick={() => setCurrentScreen('projects')}
          className="text-xs text-[#78736A] hover:text-[#25251F] font-sans hover:underline cursor-pointer flex items-center gap-1"
        >
          <span>View all ({projects.length})</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {projects.slice(0, 6).map((proj) => (
          <div
            key={proj.id}
            onClick={() => handleOpenProject(proj)}
            className="group bg-[#FAF7F2] hover:bg-[#F3EEE5] border border-[#E3DDD3] rounded-2xl overflow-hidden shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col"
          >
            {/* Visual Scenic Art Cover Header */}
            <div className="h-28 w-full relative overflow-hidden bg-[#ECE5D8]">
              <ProceduralArt 
                seedText={`${proj.title}-${proj.genre}`} 
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              />
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentScreen('projects');
                }}
                className="absolute top-2.5 right-2.5 p-1 rounded-lg bg-black/30 hover:bg-black/50 text-white backdrop-blur-xs transition-colors cursor-pointer"
                title="Project options"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Project Details */}
            <div className="p-3.5 flex flex-col justify-between flex-1">
              <div>
                <h4 className="font-serif font-bold text-sm text-[#25251F] group-hover:text-[#181814] truncate">
                  {proj.title}
                </h4>
                <div className="text-xs text-[#7A7469] mt-0.5">
                  {proj.genre} · {proj.docCount} {proj.docCount === 1 ? 'doc' : 'docs'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
