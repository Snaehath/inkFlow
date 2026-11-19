import React from 'react';
import { 
  RotateCw, 
  Maximize2, 
  Lightbulb, 
  ArrowRight,
  Loader2,
  Sparkles
} from 'lucide-react';
import { ModelSelector } from './ModelSelector';
import { Card } from '../ui/card';

interface AIPartnerProps {
  onContinue: () => void;
  onRewrite: () => void;
  onExpand: () => void;
  onBrainstorm: () => void;
  isLoading: boolean;
  activeTask?: string | null;
}

export const AIPartner: React.FC<AIPartnerProps> = ({
  onContinue,
  onRewrite,
  onExpand,
  onBrainstorm,
  isLoading,
  activeTask,
}) => {
  const actions = [
    {
      id: 'continue',
      label: 'Continue',
      desc: 'Suggest or draft next paragraph',
      icon: ArrowRight,
      onClick: onContinue,
    },
    {
      id: 'rewrite',
      label: 'Rewrite',
      desc: 'Elevate style of active passage',
      icon: RotateCw,
      onClick: onRewrite,
    },
    {
      id: 'expand',
      label: 'Expand',
      desc: 'Add sensory depth & atmosphere',
      icon: Maximize2,
      onClick: onExpand,
    },
    {
      id: 'brainstorm',
      label: 'Brainstorm',
      desc: 'Explore fresh plot ideas & branches',
      icon: Lightbulb,
      onClick: onBrainstorm,
    },
  ];

  return (
    <aside className="w-80 h-full border-l border-[#E3DDD3] bg-[#F7F3EB]/70 flex flex-col justify-between select-none shrink-0 overflow-y-auto p-4 space-y-4">
      <div className="space-y-4">
        {/* Clean Panel Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-base text-[#25251F]">
              Writing partner
            </h3>
            <p className="text-xs text-[#7A7469] mt-0.5 font-sans">
              AI support tuned to your writing
            </p>
          </div>
          {isLoading && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#EAE3D5] text-[#3F5236] text-[11px] font-medium animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Drafting...</span>
            </div>
          )}
        </div>

        {/* 4 Core Interaction Action Cards */}
        <div className="space-y-2.5">
          {actions.map((act) => {
            const Icon = act.icon;
            const isThisActionLoading = isLoading && activeTask === act.id;
            return (
              <Card
                key={act.id}
                onClick={act.onClick}
                className={`w-full text-left p-3.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#F3EEE5] border-[#E3DDD3] transition-all flex items-start gap-3 group shadow-2xs hover:shadow-xs cursor-pointer ${
                  isLoading ? 'opacity-55 pointer-events-none' : ''
                }`}
              >
                <div className="p-2 rounded-xl bg-[#EFE9DF] group-hover:bg-[#E3DDCF] text-[#524E46] group-hover:text-[#25251F] transition-colors shrink-0 mt-0.5">
                  {isThisActionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#3F5236]" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-serif font-semibold text-xs text-[#25251F] group-hover:text-[#181814] flex items-center justify-between">
                    <span>{act.label}</span>
                    <Sparkles className="w-3 h-3 opacity-0 group-hover:opacity-60 text-[#C77B5B] transition-opacity" />
                  </div>
                  <div className="text-[11px] text-[#7A7469] leading-snug mt-0.5 font-sans">
                    {act.desc}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Editorial Context Indicator */}
        <div className="p-3 rounded-xl bg-[#F0EBE0]/60 border border-[#E4DDD0] text-[11px] text-[#736E64] leading-relaxed font-sans">
          Actions automatically read your current manuscript paragraph or selected passage. Responses appear directly on your canvas.
        </div>
      </div>

      {/* Bottom Controls: Mode Toggle, Model Dropdown, Active Skill */}
      <div className="mt-auto pt-2">
        <ModelSelector />
      </div>
    </aside>
  );
};