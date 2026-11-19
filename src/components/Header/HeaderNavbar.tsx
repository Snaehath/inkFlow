import React, { useEffect, useState } from 'react';
import { useInkFlowStore } from '../../store/useInkFlowStore';
import { db } from '../../storage/DexieStorage';
import type { WorkspaceMode } from '../../types';
import { 
  Feather,
  Maximize2, 
  Command, 
  Sparkles,
} from 'lucide-react';

export const HeaderNavbar: React.FC = () => {
  const {
    activeMode,
    setActiveMode,
    isFocusMode,
    toggleFocusMode,
    toggleCommandPalette,
    toggleAskInkFlow,
    activeProjectId,
  } = useInkFlowStore();

  const [projectTitle, setProjectTitle] = useState('The Shadow of Castle Black');
  const [linterCount, setLinterCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      const proj = await db.projects.get(activeProjectId);
      if (proj) setProjectTitle(proj.title);
      const count = await db.linterIssues.where('status').equals('active').count();
      setLinterCount(count);
    };
    load();
  }, [activeProjectId]);

  if (isFocusMode) return null;

  const navModes: { id: WorkspaceMode; label: string; badge?: number }[] = [
    { id: 'write', label: 'Write' },
    { id: 'plan', label: 'Plan' },
    { id: 'brain', label: 'Brain' },
    { id: 'review', label: 'Review', badge: linterCount },
    { id: 'publish', label: 'Publish' },
  ];

  return (
    <header className="h-11 bg-[#0A0C10] border-b border-[#181C26] px-4 flex items-center justify-between select-none z-30 font-sans text-xs">
      {/* Left: Brand & Story Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setActiveMode('home')}
          className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors group"
          title="Return to Home Dashboard"
        >
          <div className="w-5 h-5 rounded bg-violet-600/30 border border-violet-500/40 flex items-center justify-center group-hover:bg-violet-600 transition-colors">
            <Feather className="w-3 h-3 text-violet-300 group-hover:text-white" />
          </div>
          <span className="font-['Outfit'] font-bold text-slate-200 text-xs tracking-tight">
            InkFlow
          </span>
        </button>

        <span className="text-slate-700">/</span>

        {/* Current Story Title (quiet, literary) */}
        <button
          onClick={() => setActiveMode('home')}
          className="text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors truncate max-w-[220px]"
          title="Switch Project"
        >
          {projectTitle}
        </button>
      </div>

      {/* Center: Minimal Mode Switcher (Hierarchy: Story > Scene > Words) */}
      <nav className="flex items-center space-x-0.5">
        {navModes.map((mode) => {
          const isActive = activeMode === mode.id;

          return (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={`relative px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? 'text-white bg-[#161B26] font-semibold'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-[#12151D]'
              }`}
            >
              <span>{mode.label}</span>
              {mode.badge !== undefined && mode.badge > 0 && (
                <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Right: Quick Tools (<kbd>Ctrl+J</kbd> Ask, <kbd>Ctrl+Shift+F</kbd> Focus, <kbd>Ctrl+K</kbd>) */}
      <div className="flex items-center space-x-1.5">
        <button
          onClick={toggleAskInkFlow}
          className="flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-[#161B26] text-slate-400 hover:text-violet-300 transition-colors"
          title="Ask InkFlow (Ctrl+J)"
        >
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span className="text-[11px] font-mono hidden sm:inline">Ctrl+J</span>
        </button>

        <button
          onClick={toggleFocusMode}
          className="flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-[#161B26] text-slate-400 hover:text-slate-200 transition-colors"
          title="Focus Mode (Ctrl+Shift+F)"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={toggleCommandPalette}
          className="flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-[#161B26] text-slate-400 hover:text-slate-200 transition-colors font-mono text-[11px]"
          title="Commands (Ctrl+K)"
        >
          <Command className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
