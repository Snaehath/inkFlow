import React, { useState } from 'react';
import { 
  RotateCw, 
  Maximize2, 
  Lightbulb, 
  Send, 
  ArrowRight,
  Loader2
} from 'lucide-react';
import { ModelSelector } from './ModelSelector';
import { Card } from '../ui/card';

interface AIPartnerProps {
  onContinue: (instruction?: string) => void;
  onRewrite: (instruction?: string) => void;
  onExpand: (instruction?: string) => void;
  onBrainstorm: (instruction?: string) => void;
  isLoading: boolean;
  brainstormIdeas: string[];
}

export const AIPartner: React.FC<AIPartnerProps> = ({
  onContinue,
  onRewrite,
  onExpand,
  onBrainstorm,
  isLoading,
  brainstormIdeas,
}) => {
  const [promptText, setPromptText] = useState('');

  const actions = [
    {
      id: 'continue',
      label: 'Continue',
      desc: 'Suggest next sentence or paragraph',
      icon: ArrowRight,
      onClick: () => onContinue(),
    },
    {
      id: 'rewrite',
      label: 'Rewrite',
      desc: 'Improve or rephrase active passage',
      icon: RotateCw,
      onClick: () => onRewrite(),
    },
    {
      id: 'expand',
      label: 'Expand',
      desc: 'Add sensory depth, context, or detail',
      icon: Maximize2,
      onClick: () => onExpand(),
    },
    {
      id: 'brainstorm',
      label: 'Brainstorm',
      desc: 'Explore plot branches & alternatives',
      icon: Lightbulb,
      onClick: () => onBrainstorm(),
    },
  ];

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim() || isLoading) return;
    onContinue(promptText);
    setPromptText('');
  };

  return (
    <aside className="w-80 h-full border-l border-[#E3DDD3] bg-[#F7F3EB]/70 flex flex-col select-none shrink-0 overflow-y-auto p-4 space-y-4">
      {/* Clean Panel Header */}
      <div>
        <h3 className="font-serif font-bold text-base text-[#25251F]">
          Writing partner
        </h3>
        <p className="text-xs text-[#7A7469] mt-0.5">
          AI support tuned to your writing
        </p>
      </div>

      {/* 4 Interaction Decision Buttons */}
      <div className="space-y-2">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Card
              key={act.id}
              onClick={act.onClick}
              className={`w-full text-left p-3 rounded-2xl bg-[#FAF7F2] hover:bg-[#F3EEE5] border-[#E3DDD3] transition-all flex items-start gap-3 group shadow-2xs hover:shadow-xs cursor-pointer ${
                isLoading ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <div className="p-2 rounded-xl bg-[#EFE9DF] group-hover:bg-[#E3DDCF] text-[#524E46] group-hover:text-[#25251F] transition-colors shrink-0 mt-0.5">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-serif font-semibold text-xs text-[#25251F] group-hover:text-[#181814]">
                  {act.label}
                </div>
                <div className="text-[11px] text-[#7A7469] leading-snug mt-0.5">
                  {act.desc}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Brainstorm Ideas Section if Available */}
      {brainstormIdeas.length > 0 && (
        <Card className="p-3.5 rounded-2xl bg-[#FAF7F2] border-[#DDD5C7] space-y-2.5 shadow-2xs gap-0">
          <div className="text-xs font-serif font-semibold text-[#25251F]">
            Brainstormed Directions
          </div>
          <ul className="space-y-2 text-xs text-[#524E46]">
            {brainstormIdeas.map((idea, i) => (
              <li 
                key={i} 
                className="p-2 rounded-xl bg-[#F4EFE6] border border-[#E5DFD4] leading-relaxed cursor-pointer hover:bg-[#ECE4D6] transition-colors font-serif"
                onClick={() => onContinue(`Explore idea: ${idea}`)}
                title="Click to draft continuation exploring this direction"
              >
                {idea}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Natural Language Partner Prompt Input */}
      <form onSubmit={handleCustomSubmit} className="space-y-1.5 pt-1">
        <label className="text-xs font-semibold text-[#4A4740]">
          Tell your partner what to do...
        </label>
        <div className="relative">
          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleCustomSubmit(e);
              }
            }}
            rows={3}
            disabled={isLoading}
            placeholder="e.g. Continue this scene with a quiet, atmospheric tone..."
            className="w-full text-xs font-serif p-3 pr-10 rounded-2xl bg-[#FAF7F2] border border-[#DDD5C7] text-[#25251F] placeholder-[#9E988D] focus:outline-none focus:border-[#3E5535] focus:ring-1 focus:ring-[#3F5236] resize-none shadow-2xs leading-relaxed disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!promptText.trim() || isLoading}
            className="absolute right-2.5 bottom-3.5 w-7 h-7 rounded-xl bg-[#3F5236] hover:bg-[#32422B] text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </button>
        </div>
      </form>

      {/* Bottom Controls: Mode, Model, Skill */}
      <div className="mt-auto">
        <ModelSelector />
      </div>
    </aside>
  );
};