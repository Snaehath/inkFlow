import React from 'react';
import { Sparkles, Check, ChevronDown } from 'lucide-react';
import type { ParsedSkill } from '../../lib/skillParser';
import { useInkFlowStore } from '../../store/useInkFlowStore';
import { OllamaIcon } from '../icons/OllamaIcon';

interface AgentPreviewProps {
  parsedSkill: ParsedSkill;
}

export const AgentPreview: React.FC<AgentPreviewProps> = ({ parsedSkill }) => {
  const { selectedModel, availableModels } = useInkFlowStore();

  const activeModelDisplay = selectedModel === 'Auto (Task Router)' 
    ? (availableModels[0] ? `Auto → ${availableModels[0]}` : 'Auto - Best for creative prose')
    : selectedModel;

  return (
    <div className="w-80 bg-[#FAF7F2] border border-[#DDD5C7] rounded-2xl p-5 shadow-xs space-y-6 select-none shrink-0">
      {/* Header & Ready Status */}
      <div className="flex items-center justify-between pb-3 border-b border-[#EBE4D8]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#3E5535]" />
          <h3 className="font-serif font-bold text-sm text-[#25251F]">
            Agent preview
          </h3>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EBF0E6] text-[#344E2C] border border-[#D5E2CC] text-[11px] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3F6E36]" />
          <span>Ready for this session</span>
        </div>
      </div>

      {/* Summary */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7C776E]">
          Summary
        </span>
        <p className="text-xs text-[#25251F] font-serif leading-relaxed font-medium">
          {parsedSkill.summary}
        </p>
      </div>

      {/* Behavior */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7C776E]">
          Behavior
        </span>
        <div className="space-y-1.5">
          {parsedSkill.behaviors.map((beh, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs text-[#3E5535] font-medium">
              <div className="w-4 h-4 rounded-full bg-[#EBF0E6] border border-[#D5E2CC] flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 text-[#35502A]" />
              </div>
              <span className="text-[#38352F]">{beh}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Model routing with Ollama Icon */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7C776E]">
          Model routing
        </span>
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#F4EFE6] border border-[#E0D8CB] text-xs font-medium text-[#25251F]">
          <div className="flex items-center gap-1.5 truncate">
            <OllamaIcon className="w-3.5 h-3.5 text-[#59554C] shrink-0" />
            <span className="truncate">{activeModelDisplay}</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-[#7C776E] shrink-0" />
        </div>
      </div>

      {/* Sample prompt */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7C776E]">
          Sample prompt
        </span>
        <div className="p-3.5 rounded-xl bg-[#F6F1E8] border border-[#E2DBCF] font-serif italic text-xs text-[#4F4B43] leading-relaxed">
          {parsedSkill.samplePrompt}
        </div>
      </div>
    </div>
  );
};
