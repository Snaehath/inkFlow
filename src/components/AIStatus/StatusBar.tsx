import React, { useState, useEffect } from 'react';
import { useInkFlowStore } from '../../store/useInkFlowStore';
import { db } from '../../storage/DexieStorage';
import { Check, Sparkles, X, ChevronUp } from 'lucide-react';

export const StatusBar: React.FC = () => {
  const { editorStats, isFocusMode, activeSceneId, activeProjectId } = useInkFlowStore();
  const [isContextPopupOpen, setIsContextPopupOpen] = useState(false);
  const [sceneInfo, setSceneInfo] = useState<{ title: string; pov: string; location: string; threads: string[] }>({
    title: 'Loading...',
    pov: 'Detective Emma',
    location: 'Castle Black',
    threads: ['The Castle Black Murders', 'Grandfather\'s Legacy'],
  });

  useEffect(() => {
    if (!activeSceneId) return;
    const loadContextDetails = async () => {
      const sc = await db.scenes.get(activeSceneId);
      if (sc) {
        let povName = 'Unassigned';
        if (sc.povCharacterId) {
          const char = await db.characters.get(sc.povCharacterId);
          if (char) povName = char.name;
        }
        let locName = 'Unassigned';
        if (sc.locationId) {
          const loc = await db.locations.get(sc.locationId);
          if (loc) locName = loc.name;
        }
        setSceneInfo({
          title: sc.title,
          pov: povName,
          location: locName,
          threads: ['The Castle Black Murders', 'Grandfather\'s Legacy'],
        });
      }
    };
    loadContextDetails();
  }, [activeSceneId, activeProjectId]);

  if (isFocusMode) return null;

  return (
    <>
      {/* Context Inspection Popover */}
      {isContextPopupOpen && (
        <div className="fixed bottom-7 left-4 z-40 w-72 bg-[#0E1117] border border-[#232A3B] rounded-lg shadow-xl p-3 text-xs text-slate-300 font-sans space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between text-slate-200 font-semibold border-b border-[#1C212B] pb-1.5 text-[11px]">
            <span className="flex items-center gap-1.5 text-violet-300">
              <Sparkles className="w-3.5 h-3.5" />
              Active Story Context
            </span>
            <button
              onClick={() => setIsContextPopupOpen(false)}
              className="text-slate-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div>
              <span className="text-slate-500">Current Scene:</span>{' '}
              <span className="text-slate-200">{sceneInfo.title}</span>
            </div>
            <div>
              <span className="text-slate-500">Active POV:</span>{' '}
              <span className="text-slate-200">{sceneInfo.pov}</span>
            </div>
            <div>
              <span className="text-slate-500">Setting:</span>{' '}
              <span className="text-slate-200">{sceneInfo.location}</span>
            </div>
            <div>
              <span className="text-slate-500">Active Threads:</span>{' '}
              <span className="text-slate-200">{sceneInfo.threads.join(', ')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Status Bar */}
      <footer className="h-6 bg-[#080A0D] border-t border-[#181C26] px-4 flex items-center justify-between text-[11px] text-slate-500 select-none z-30 font-sans">
        {/* Left: Clickable Context Status */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsContextPopupOpen(!isContextPopupOpen)}
            className="flex items-center space-x-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title="Click to view active story context"
          >
            <Sparkles className="w-3 h-3 text-violet-400" />
            <span>Context ✓</span>
            <ChevronUp className="w-2.5 h-2.5 text-slate-600" />
          </button>
        </div>

        {/* Center: Clean Saved Status */}
        <div className="flex items-center space-x-1 text-slate-400">
          <Check className="w-3 h-3 text-emerald-400" />
          <span>Saved</span>
        </div>

        {/* Right: Literary Word & Reading Stats */}
        <div className="flex items-center space-x-3 text-slate-400 font-mono text-[10px]">
          <span>{editorStats.words.toLocaleString()} words</span>
          <span>•</span>
          <span>{editorStats.readingTimeMinutes} min read</span>
        </div>
      </footer>
    </>
  );
};
