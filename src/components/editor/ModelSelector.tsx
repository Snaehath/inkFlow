import React, { useState } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';
import { useInkFlowStore } from '../../store/useInkFlowStore';
import { buildDynamicModelOptions } from '../../lib/modelRouter';
import { OllamaIcon } from '../icons/OllamaIcon';

export const ModelSelector: React.FC = () => {
  const { 
    selectedModel, 
    setSelectedModel, 
    availableModels,
    setModelRoutingMode,
    activeSkillName,
    setCurrentScreen,
    generationMode,
    setGenerationMode
  } = useInkFlowStore();

  const [isOpen, setIsOpen] = useState(false);
  const modelOptions = buildDynamicModelOptions(availableModels);

  return (
    <div className="space-y-3 pt-3 border-t border-[#E3DDD3]">
      {/* Mode Toggle: Suggest vs Write for me */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setGenerationMode('suggest')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            generationMode === 'suggest'
              ? 'bg-[#E1EAD9] text-[#2C3E25] border border-[#CCD8C2] shadow-2xs'
              : 'bg-[#FAF7F2] text-[#69655C] border border-[#E3DDD3] hover:bg-[#EFEAE0]'
          }`}
        >
          <span>Suggest</span>
        </button>

        <button
          onClick={() => setGenerationMode('write-for-me')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            generationMode === 'write-for-me'
              ? 'bg-[#3F5236] text-white shadow-2xs'
              : 'bg-[#FAF7F2] text-[#69655C] border border-[#E3DDD3] hover:bg-[#EFEAE0]'
          }`}
        >
          <span>Write for me</span>
        </button>
      </div>

      {/* Model Selection Row with Official Ollama Icon */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-[#5A564E] font-medium">
          <OllamaIcon className="w-3.5 h-3.5 text-[#25251F]" />
          <span>Ollama</span>
        </div>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 text-xs font-medium text-[#25251F] bg-[#FAF7F2] hover:bg-[#EFEAE0] border border-[#DDD5C7] px-2.5 py-1 rounded-xl transition-colors cursor-pointer max-w-[170px]"
          >
            <span className="truncate">{selectedModel}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#7C776E] shrink-0" />
          </button>

          {isOpen && (
            <div className="absolute right-0 bottom-full mb-1.5 w-60 bg-[#FAF7F2] border border-[#DDD5C7] rounded-xl shadow-lg p-1.5 z-50 text-xs">
              <div className="max-h-56 overflow-y-auto space-y-0.5">
                {modelOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setSelectedModel(opt.label);
                      setModelRoutingMode(opt.isAuto ? 'auto' : 'manual');
                      setIsOpen(false);
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
            </div>
          )}
        </div>
      </div>

      {/* Active Skill Row */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#5A564E] font-medium">Active skill</span>
        <div className="flex items-center gap-1 bg-[#E7EFE2] text-[#344D2E] border border-[#D0DFC9] px-2.5 py-1 rounded-xl font-medium">
          <button 
            onClick={() => setCurrentScreen('skills')}
            className="hover:underline cursor-pointer truncate max-w-[140px]"
            title="Edit skill in Skills Studio"
          >
            {activeSkillName || 'Atmospheric fiction'}
          </button>
          <button
            onClick={() => setCurrentScreen('skills')}
            className="text-[#688262] hover:text-[#25251F] ml-1 cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
