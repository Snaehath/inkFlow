import React, { useState } from 'react';
import { 
  Check, 
  Maximize2, 
  Minimize2, 
  MoreHorizontal, 
  ChevronDown, 
  BookOpen
} from 'lucide-react';
import { useInkFlowStore } from '../../store/useInkFlowStore';
import { buildDynamicModelOptions } from '../../lib/modelRouter';
import { OllamaIcon } from '../icons/OllamaIcon';

export const TopBar: React.FC = () => {
  const { 
    currentScreen, 
    activeProjectTitle, 
    activeChapterTitle, 
    saveStatus, 
    editorStats,
    isFocusMode,
    toggleFocusMode,
    selectedModel,
    setSelectedModel,
    availableModels,
    setModelRoutingMode
  } = useInkFlowStore();

  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const modelOptions = buildDynamicModelOptions(availableModels);

  return (
    <header className="h-13 border-b border-[#E3DDD3] bg-[#F7F3EB]/90 backdrop-blur-md px-6 flex items-center justify-between select-none z-20">
      {/* Left: Breadcrumbs / Title */}
      <div className="flex items-center gap-3">
        {currentScreen === 'editor' ? (
          <div className="flex items-center gap-2 text-xs text-[#524F47]">
            <BookOpen className="w-3.5 h-3.5 text-[#7C776E]" />
            <span className="font-medium text-[#25251F]">{activeProjectTitle}</span>
            <span className="text-[#A59F95]">›</span>
            <span className="text-[#59554C] truncate max-w-xs">{activeChapterTitle}</span>
          </div>
        ) : (
          <div className="text-xs font-serif italic text-[#7C776E]">
            {currentScreen === 'studio' ? 'Writing Studio' : 'Skills & Agent Studio'}
          </div>
        )}
      </div>

      {/* Right Area: Word Count, Focus Mode, Clean Ollama Selector */}
      <div className="flex items-center gap-3">
        {currentScreen === 'editor' && (
          <>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#5F6E55] bg-[#EBF0E6] px-2.5 py-1 rounded-full border border-[#D5E0CD]">
              <Check className="w-3 h-3 text-[#3E5535]" />
              <span className="font-medium">
                {saveStatus === 'saving' ? 'Saving...' : 'Saved'}
              </span>
            </div>

            <div className="text-xs text-[#5A564E] font-medium px-1">
              {editorStats.words.toLocaleString()} words
            </div>

            <button
              onClick={toggleFocusMode}
              title={isFocusMode ? "Exit Focus Mode" : "Distraction-Free Mode"}
              className="p-1.5 text-[#6B665D] hover:text-[#25251F] hover:bg-[#EAE4D7] rounded-lg transition-colors cursor-pointer"
            >
              {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button className="p-1.5 text-[#6B665D] hover:text-[#25251F] hover:bg-[#EAE4D7] rounded-lg transition-colors cursor-pointer">
              <MoreHorizontal className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-[#DFD8CC]" />
          </>
        )}

        {/* Clean Ollama Selector - Just Ollama & Icon */}
        <div className="relative">
          <button
            onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
            className="flex items-center gap-2 bg-[#FAF7F2] hover:bg-[#F3EFE7] border border-[#E0D8CB] px-3 py-1.5 rounded-xl text-xs font-medium text-[#2E2B25] transition-colors shadow-2xs cursor-pointer"
          >
            <OllamaIcon className="w-3.5 h-3.5 text-[#25251F]" />
            <span className="font-semibold text-[#25251F]">Ollama</span>
            <span className="text-[#A59F95]">·</span>
            <span className="text-[#59554C] truncate max-w-[130px]">{selectedModel}</span>
            <ChevronDown className="w-3 h-3 text-[#7C776E] shrink-0" />
          </button>

          {isModelDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-60 bg-[#FAF7F2] border border-[#DDD5C7] rounded-xl shadow-lg p-1.5 z-50 text-xs">
              <div className="px-2 py-1 font-semibold text-[#78736A] text-[10px] uppercase tracking-wider">
                Ollama Models
              </div>

              {modelOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setModelRoutingMode(opt.isAuto ? 'auto' : 'manual');
                    setSelectedModel(opt.label);
                    setIsModelDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                    selectedModel === opt.label ? 'bg-[#E1EAD9] text-[#2C3E25] font-semibold' : 'hover:bg-[#EFEAE0] text-[#3D3A34]'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {selectedModel === opt.label && <Check className="w-3.5 h-3.5 text-[#35502A] shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
