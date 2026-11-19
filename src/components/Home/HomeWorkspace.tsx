import React, { useState, useEffect } from 'react';
import { useInkFlowStore } from '../../store/useInkFlowStore';
import { db } from '../../storage/DexieStorage';
import type { 
  Project, 
  Scene, 
  Chapter, 
  WritingGoal, 
  StoryMilestone, 
  PlotThread 
} from '../../types';
import { 
  ArrowRight, 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  HelpCircle
} from 'lucide-react';

export const HomeWorkspace: React.FC = () => {
  const { activeProjectId, setActiveMode, setActiveSceneId, setActiveProjectId } = useInkFlowStore();
  const [project, setProject] = useState<Project | null>(null);
  const [activeScene, setActiveScene] = useState<Scene | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [goal, setGoal] = useState<WritingGoal | null>(null);
  const [milestones, setMilestones] = useState<StoryMilestone[]>([]);
  const [threads, setThreads] = useState<PlotThread[]>([]);
  const [newStoryIdea, setNewStoryIdea] = useState('');
  const [isCreatingStory, setIsCreatingStory] = useState(false);

  useEffect(() => {
    const loadHomeData = async () => {
      const proj = await db.projects.get(activeProjectId);
      if (proj) {
        setProject(proj);
        if (proj.activeSceneId) {
          const sc = await db.scenes.get(proj.activeSceneId);
          if (sc) {
            setActiveScene(sc);
            const ch = await db.chapters.get(sc.chapterId);
            setChapter(ch || null);
          }
        }
      }

      const weeklyGoal = await db.goals.where('period').equals('weekly').first();
      setGoal(weeklyGoal || null);

      const ms = await db.milestones.toArray();
      setMilestones(ms);

      const ths = await db.plotThreads.where('projectId').equals(activeProjectId).toArray();
      setThreads(ths);
    };
    loadHomeData();
  }, [activeProjectId]);

  const handleContinueWriting = () => {
    if (activeScene) {
      setActiveSceneId(activeScene.id);
    }
    setActiveMode('write');
  };

  const handleLaunchQuickStory = async () => {
    if (!newStoryIdea.trim()) return;
    setIsCreatingStory(true);

    const now = Date.now();
    const newProjectId = `proj-${now}`;
    const newSceneId = `sc-${now}-1`;
    const newChapterId = `ch-${now}-1`;

    await db.projects.add({
      id: newProjectId,
      title: newStoryIdea.slice(0, 30) + '...',
      genre: 'Fiction / Mystery',
      targetWordCount: 80000,
      description: newStoryIdea,
      activeSceneId: newSceneId,
      createdAt: now,
      updatedAt: now,
    });

    await db.chapters.add({
      id: newChapterId,
      projectId: newProjectId,
      title: 'Chapter 1: The Beginning',
      order: 1,
      createdAt: now,
      updatedAt: now,
    });

    await db.scenes.add({
      id: newSceneId,
      chapterId: newChapterId,
      projectId: newProjectId,
      title: 'Scene 1',
      order: 1,
      contentHtml: '',
      wordCount: 0,
      beats: [{ id: `b-${now}`, description: 'Open scene and establish stakes', completed: false }],
      charactersPresent: [],
      activePlotThreadIds: [],
      status: 'empty',
      createdAt: now,
      updatedAt: now,
    });

    setActiveProjectId(newProjectId);
    setActiveSceneId(newSceneId);
    setActiveMode('write');
  };

  const progressPercentage = goal ? Math.min(100, Math.round((goal.current / goal.target) * 100)) : 62;

  // Extract last sentence or paragraph excerpt
  const lastParagraphClean = activeScene?.contentHtml
    ? activeScene.contentHtml.replace(/<[^>]+>/g, ' ').trim().slice(-180)
    : "Emma stepped into the mud, pulling her collar high. Victor was inside Castle Black. She could feel it.";

  return (
    <div className="flex-1 overflow-y-auto bg-[#090B0E] text-slate-200 p-8 select-none font-sans text-xs">
      <div className="max-w-3xl mx-auto space-y-6 py-4">
        {/* Welcome Salutation */}
        <div className="space-y-1">
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-widest">
            InkFlow · Writing Momentum
          </span>
          <h1 className="text-xl font-bold font-['Outfit'] text-slate-100">
            Good evening, Author.
          </h1>
        </div>

        {/* 1. THE STORY MOMENTUM CARD (THE HERO EXPERIENCE) */}
        <div className="bg-[#0E1117] border border-[#1A202C] rounded-xl p-6 shadow-md space-y-5">
          {/* Story & Chapter Location */}
          <div className="flex items-center justify-between border-b border-[#161A24] pb-4">
            <div>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-violet-400">
                Current Story
              </div>
              <h2 className="text-xl font-bold font-['Outfit'] text-slate-100 mt-0.5">
                {project?.title || 'The Shadow of Castle Black'}
              </h2>
              <div className="text-slate-400 text-xs mt-0.5">
                {chapter?.title || 'Chapter 3: The Blood Crypt'} · {activeScene?.title || 'Scene 1: The Altar of Ash'}
              </div>
            </div>

            <button
              onClick={handleContinueWriting}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-colors shadow-sm"
            >
              <span>Continue Writing</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Where you stopped */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
              Where you left off:
            </span>
            <div className="p-3.5 rounded-lg bg-[#12151E] border border-[#1C2230] font-['Newsreader'] text-sm leading-relaxed text-slate-300 italic">
              "...{lastParagraphClean}"
            </div>
          </div>

          {/* Scene Objective */}
          {activeScene?.sceneGoal && (
            <div className="flex items-start space-x-2 text-slate-300 text-[11px]">
              <span className="font-semibold text-slate-400 shrink-0">Current Scene Goal:</span>
              <span className="text-slate-200">{activeScene.sceneGoal}</span>
            </div>
          )}

          {/* Unresolved Threads Worth Remembering */}
          <div className="pt-3 border-t border-[#161A24] space-y-2">
            <div className="flex items-center justify-between text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              <span className="flex items-center gap-1.5">
                <HelpCircle className="w-3 h-3 text-violet-400" />
                Unresolved threads worth remembering
              </span>
            </div>

            <ul className="space-y-1 text-[11px] text-slate-300">
              {threads.map((t) => (
                <li key={t.id} className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                  <span className="font-medium text-slate-200">{t.title}</span>
                  <span className="text-slate-500">— {t.description.slice(0, 70)}...</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weekly Momentum (Literary & Non-Manipulative) */}
          <div className="pt-3 border-t border-[#161A24] flex items-center justify-between text-slate-400 text-[11px]">
            <div className="flex items-center space-x-3">
              <span>
                <strong className="text-slate-200">{goal?.current || 1240}</strong> / {goal?.target || 2000} words this week
              </span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">3 scenes completed</span>
            </div>

            <div className="w-36 h-1.5 rounded-full bg-[#161A24] overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-violet-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* 2. STORY MILESTONES (Story Completion > Word Count) */}
        <div className="bg-[#0E1117] border border-[#1A202C] rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-300 uppercase tracking-wider font-['Outfit']">
              Story Milestones
            </span>
            <span className="text-slate-500 text-[10px]">
              {milestones.filter((m) => m.completed).length} of {milestones.length} Completed
            </span>
          </div>

          <div className="space-y-2">
            {milestones.map((m) => (
              <div 
                key={m.id}
                className="flex items-center justify-between p-2 rounded-lg bg-[#12151E] border border-[#1C2230] text-[11px]"
              >
                <div className="flex items-center space-x-2.5">
                  {m.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                  )}
                  <span className={m.completed ? 'text-slate-400 line-through' : 'text-slate-200 font-medium'}>
                    {m.title}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-slate-500">
                  {m.targetWordEstimate ? `~${m.targetWordEstimate.toLocaleString()}w` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. QUICK STORY LAUNCHER (<10 SECONDS) */}
        <div className="bg-[#0E1117] border border-[#1A202C] rounded-xl p-5 space-y-3">
          <div className="flex items-center space-x-2 text-slate-200 font-semibold text-xs font-['Outfit']">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Start a Fresh Story in 10 Seconds</span>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newStoryIdea}
              onChange={(e) => setNewStoryIdea(e.target.value)}
              placeholder="Give a quick premise or title... (or start blank)"
              className="flex-1 bg-[#12151E] border border-[#1C2230] rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
            />
            <button
              onClick={() => {
                setNewStoryIdea('Untitled Story');
                handleLaunchQuickStory();
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-[#161B26] text-slate-300 text-[11px] font-medium"
            >
              Blank Page
            </button>
            <button
              onClick={handleLaunchQuickStory}
              disabled={!newStoryIdea.trim() || isCreatingStory}
              className="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[11px] font-semibold transition-all disabled:opacity-50"
            >
              Start ➔
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
