import React, { useState, useEffect } from 'react';
import { useInkFlowStore } from '../../store/useInkFlowStore';
import { 
  Search, 
  Home, 
  Files, 
  Sparkles, 
  Maximize2, 
  X 
} from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    setCurrentScreen,
    toggleFocusMode,
  } = useInkFlowStore();

  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const actions = [
    {
      id: 'studio',
      label: 'Go to Studio (Recent documents, projects, templates)',
      category: 'Navigation',
      icon: Home,
      perform: () => {
        setCurrentScreen('studio');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'editor',
      label: 'Open Writing Editor',
      category: 'Navigation',
      icon: Files,
      perform: () => {
        setCurrentScreen('editor');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'skills',
      label: 'Open Skills & AI Studio',
      category: 'Navigation',
      icon: Sparkles,
      perform: () => {
        setCurrentScreen('skills');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'focus',
      label: 'Toggle Focus Mode',
      category: 'Editor',
      icon: Maximize2,
      perform: () => {
        toggleFocusMode();
        setCommandPaletteOpen(false);
      },
    },
  ];

  const filtered = actions.filter((act) =>
    act.label.toLowerCase().includes(query.toLowerCase()) ||
    act.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/35 backdrop-blur-xs select-none">
      <div 
        className="w-full max-w-lg bg-[#FAF7F2] border border-[#DDD5C7] rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-[#EBE4D8] gap-3">
          <Search className="w-4 h-4 text-[#78736A]" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or jump to screen... (Esc to exit)"
            className="flex-1 bg-transparent border-none text-xs text-[#25251F] placeholder-[#9E988D] focus:outline-none"
          />
          <button 
            onClick={() => setCommandPaletteOpen(false)}
            className="p-1 text-[#8A847A] hover:text-[#25251F] rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action List */}
        <div className="max-h-72 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-xs text-[#8A847A]">
              No actions match your search.
            </div>
          ) : (
            filtered.map((act) => {
              const Icon = act.icon;
              return (
                <button
                  key={act.id}
                  onClick={act.perform}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F3EEE5] text-left transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-[#EFE9DF] text-[#59554C] group-hover:bg-[#E5DFD4] group-hover:text-[#25251F] transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#25251F]">
                        {act.label}
                      </div>
                      <div className="text-[10px] text-[#7A7469]">
                        {act.category}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#A8A196] font-mono group-hover:text-[#5C574F]">
                    ↵ Select
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-[#F3EFE7] border-t border-[#EBE4D8] text-[11px] text-[#78736A] flex justify-between">
          <span>inkFlow Command Palette</span>
          <span>Press Esc to close</span>
        </div>
      </div>
    </div>
  );
};
