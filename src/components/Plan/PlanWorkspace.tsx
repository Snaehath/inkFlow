import React, { useState, useEffect } from 'react';
import { useInkFlowStore } from '../../store/useInkFlowStore';
import { db } from '../../storage/DexieStorage';
import type { Chapter, Scene, PlotThread } from '../../types';
import { 
  ListTree, 
  LayoutGrid, 
  Columns3, 
  Target, 
  ShieldAlert, 
  CheckCircle2
} from 'lucide-react';

export const PlanWorkspace: React.FC = () => {
  const { 
    activeProjectId, 
    planView, 
    setPlanView, 
    setActiveSceneId, 
    setActiveChapterId, 
    setActiveMode 
  } = useInkFlowStore();

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [plotThreads, setPlotThreads] = useState<PlotThread[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchPlanData = async () => {
      const chs = await db.chapters.where('projectId').equals(activeProjectId).sortBy('order');
      if (!isMounted) return;
      setChapters(chs);

      const scs = await db.scenes.where('projectId').equals(activeProjectId).sortBy('order');
      if (!isMounted) return;
      setScenes(scs);

      const threads = await db.plotThreads.where('projectId').equals(activeProjectId).toArray();
      if (!isMounted) return;
      setPlotThreads(threads);
    };

    fetchPlanData();
    return () => {
      isMounted = false;
    };
  }, [activeProjectId]);

  const handleOpenSceneInWriter = (sceneId: string, chapterId: string) => {
    setActiveSceneId(sceneId);
    setActiveChapterId(chapterId);
    setActiveMode('write');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B0D10] text-slate-200 select-none overflow-hidden font-sans text-xs">
      {/* Plan Header & View Switcher */}
      <div className="h-11 bg-[#0E1117] border-b border-[#1C212B] px-4 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-100 uppercase tracking-wider text-[11px] font-['Outfit']">
            Story Plan Studio
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 text-[11px]">
            {chapters.length} Chapters · {scenes.length} Scenes · {plotThreads.length} Plot Threads
          </span>
        </div>

        {/* View Switcher: Outline / Corkboard Cards / Plot Grid */}
        <div className="flex items-center bg-[#0A0C10] p-1 rounded-lg border border-[#1A202C]">
          <button
            onClick={() => setPlanView('outline')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md transition-all font-medium ${
              planView === 'outline'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#161B23]'
            }`}
          >
            <ListTree className="w-3.5 h-3.5" />
            <span>Outline</span>
          </button>

          <button
            onClick={() => setPlanView('cards')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md transition-all font-medium ${
              planView === 'cards'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#161B23]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Corkboard Cards</span>
          </button>

          <button
            onClick={() => setPlanView('grid')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md transition-all font-medium ${
              planView === 'grid'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#161B23]'
            }`}
          >
            <Columns3 className="w-3.5 h-3.5" />
            <span>Plot Grid</span>
          </button>
        </div>
      </div>

      {/* View Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* VIEW 1: HIERARCHICAL OUTLINE */}
        {planView === 'outline' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {chapters.map((ch) => {
              const chScenes = scenes.filter((s) => s.chapterId === ch.id);
              const chapterWords = chScenes.reduce((acc, s) => acc + (s.wordCount || 0), 0);

              return (
                <div
                  key={ch.id}
                  className="bg-[#0E1117] border border-[#1E2433] rounded-xl overflow-hidden shadow-sm"
                >
                  <div className="p-3 bg-[#131722] border-b border-[#1E2433] flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-100 text-sm font-['Outfit']">
                        {ch.title}
                      </h3>
                      {ch.summary && (
                        <p className="text-slate-400 text-[11px] mt-0.5">{ch.summary}</p>
                      )}
                    </div>
                    <span className="font-mono text-slate-400 text-[11px] px-2 py-0.5 rounded bg-[#1A1F2C]">
                      {chapterWords} words
                    </span>
                  </div>

                  <div className="p-3 divide-y divide-[#1A202C]">
                    {chScenes.map((sc) => (
                      <div
                        key={sc.id}
                        className="py-2.5 flex items-center justify-between hover:bg-[#141824] px-2 rounded-lg transition-colors group cursor-pointer"
                        onClick={() => handleOpenSceneInWriter(sc.id, ch.id)}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-slate-200">{sc.title}</span>
                            {sc.status === 'drafted' && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                                Drafted
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-3 text-slate-400 text-[11px]">
                            {sc.sceneGoal && (
                              <span className="flex items-center gap-1">
                                <Target className="w-3 h-3 text-emerald-400" />
                                {sc.sceneGoal}
                              </span>
                            )}
                            {sc.conflict && (
                              <span className="flex items-center gap-1 text-slate-500">
                                • Obstacle: {sc.conflict}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className="font-mono text-slate-500 text-[11px]">
                            {sc.wordCount || 0}w
                          </span>
                          <span className="text-violet-400 text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            Write ➔
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 2: CORKBOARD CARDS */}
        {planView === 'cards' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {scenes.map((sc) => (
              <div
                key={sc.id}
                onClick={() => handleOpenSceneInWriter(sc.id, sc.chapterId)}
                className="bg-[#0E1117] border border-[#1E2433] hover:border-violet-500/50 rounded-xl p-3.5 space-y-3 cursor-pointer transition-all hover:shadow-lg group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-violet-400 font-semibold">
                    {chapters.find((c) => c.id === sc.chapterId)?.title || 'Chapter'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{sc.wordCount || 0} words</span>
                </div>

                <h4 className="font-bold text-slate-100 text-sm group-hover:text-violet-300 transition-colors">
                  {sc.title}
                </h4>

                <div className="space-y-1.5 text-[11px] text-slate-300">
                  {sc.sceneGoal && (
                    <div className="flex items-start gap-1.5">
                      <Target className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{sc.sceneGoal}</span>
                    </div>
                  )}
                  {sc.conflict && (
                    <div className="flex items-start gap-1.5">
                      <ShieldAlert className="w-3 h-3 text-rose-400 shrink-0 mt-0.5" />
                      <span>{sc.conflict}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-[#1A202C] flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    {sc.beats.filter((b) => b.completed).length} / {sc.beats.length} beats
                  </span>
                  <span className="text-violet-400 font-medium">Open in Editor ➔</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VIEW 3: PLOTTR-STYLE TIMELINE GRID */}
        {planView === 'grid' && (
          <div className="overflow-x-auto pb-6">
            <div className="min-w-[900px] border border-[#1E2433] rounded-xl bg-[#0E1117] overflow-hidden">
              {/* Columns Header (Chapters) */}
              <div className="grid grid-cols-6 bg-[#131722] border-b border-[#1E2433] text-[11px] font-semibold text-slate-300">
                <div className="p-3 border-r border-[#1E2433] uppercase tracking-wider text-slate-400">
                  Plotline / Subplot
                </div>
                {chapters.slice(0, 5).map((ch) => (
                  <div key={ch.id} className="p-3 border-r border-[#1E2433] last:border-r-0 truncate">
                    {ch.title}
                  </div>
                ))}
              </div>

              {/* Rows (Plot Threads) */}
              {plotThreads.map((thread) => (
                <div
                  key={thread.id}
                  className="grid grid-cols-6 border-b border-[#1E2433] last:border-b-0 text-[11px] hover:bg-[#12151E]"
                >
                  <div className="p-3 border-r border-[#1E2433] bg-[#0A0C10] font-medium text-slate-200">
                    <div className="font-semibold text-violet-300">{thread.title}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
                      {thread.description}
                    </div>
                  </div>

                  {chapters.slice(0, 5).map((ch) => {
                    const sceneInCol = scenes.find((s) => s.chapterId === ch.id);
                    return (
                      <div
                        key={ch.id}
                        className="p-3 border-r border-[#1E2433] last:border-r-0 flex flex-col justify-center"
                      >
                        {sceneInCol ? (
                          <div
                            onClick={() => handleOpenSceneInWriter(sceneInCol.id, ch.id)}
                            className="p-2 rounded bg-[#161B26] border border-[#232A3B] hover:border-violet-500/50 cursor-pointer transition-all space-y-1"
                          >
                            <span className="font-medium text-slate-200 block truncate">
                              {sceneInCol.title}
                            </span>
                            <span className="text-[10px] text-slate-400 block line-clamp-1">
                              {sceneInCol.sceneGoal || 'Scene progression'}
                            </span>
                          </div>
                        ) : (
                          <div className="h-12 border border-dashed border-[#1E2433] rounded flex items-center justify-center text-slate-600 text-[10px]">
                            —
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
