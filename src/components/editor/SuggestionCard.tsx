import React from 'react';
import { 
  Check, 
  RotateCw, 
  X, 
  Lightbulb, 
  ArrowRight, 
  Maximize2,
  Sparkles
} from 'lucide-react';
import { useInkFlowStore } from '../../store/useInkFlowStore';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

interface SuggestionCardProps {
  onAccept: (text: string) => void;
  onTryAnother: () => void;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({ onAccept, onTryAnother }) => {
  const { 
    continuationSuggestions, 
    selectedSuggestionIndex, 
    setSelectedSuggestionIndex,
    isSuggestionsCardOpen,
    suggestionTaskType,
    dismissSuggestions 
  } = useInkFlowStore();

  if (!isSuggestionsCardOpen || continuationSuggestions.length === 0) {
    return null;
  }

  const selectedText = continuationSuggestions[selectedSuggestionIndex] || continuationSuggestions[0];

  const taskConfig = {
    continue: {
      title: 'Continuation Suggestions',
      subtitle: 'Select a paragraph continuation to advance your scene',
      icon: ArrowRight,
      actionLabel: 'Accept & Insert',
      actionIcon: Check,
    },
    rewrite: {
      title: 'Rewrite Variations',
      subtitle: 'Select a stylistic variation to replace the active passage',
      icon: RotateCw,
      actionLabel: 'Replace Passage',
      actionIcon: Check,
    },
    expand: {
      title: 'Expanded Scene Options',
      subtitle: 'Rich variations deepening sensory detail and atmosphere',
      icon: Maximize2,
      actionLabel: 'Insert Expansion',
      actionIcon: Check,
    },
    brainstorm: {
      title: 'Brainstormed Directions',
      subtitle: 'Pick a creative direction to draft into your manuscript',
      icon: Lightbulb,
      actionLabel: 'Draft from this Idea',
      actionIcon: Sparkles,
    },
  }[suggestionTaskType || 'continue'];

  const Icon = taskConfig.icon;
  const ActionIcon = taskConfig.actionIcon;

  return (
    <Card className="bg-[#FAF7F2] border-[#DDD5C7] rounded-2xl p-4 shadow-md space-y-3.5 my-6 transition-all gap-0 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between text-xs text-[#706B62] border-b border-[#EBE4D8] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#EFE9DF] text-[#3F5236]">
            <Icon className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-semibold text-[#25251F] font-serif text-sm">
              {taskConfig.title}
            </span>
            <p className="text-[11px] text-[#7A7469] font-sans mt-0.5">
              {taskConfig.subtitle}
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-[#8C867C] px-2 py-0.5 rounded bg-[#ECE5D8]">
          {selectedSuggestionIndex + 1} of {continuationSuggestions.length}
        </span>
      </div>

      {/* Suggestion Options List */}
      <div className="space-y-2.5">
        {continuationSuggestions.map((suggestion, idx) => {
          const isSelected = selectedSuggestionIndex === idx;
          return (
            <div
              key={idx}
              onClick={() => setSelectedSuggestionIndex(idx)}
              className={`p-3.5 rounded-xl border leading-relaxed transition-all cursor-pointer flex items-start gap-3 ${
                isSelected
                  ? 'bg-[#F2F7EE] border-[#B9CCA9] text-[#25251F] shadow-2xs font-serif text-[15px]'
                  : 'bg-[#FAF7F2] border-[#E8E2D7] text-[#5C574F] hover:bg-[#F5EFE5] font-serif text-[15px]'
              }`}
            >
              <div className="mt-1 shrink-0 text-[#3F5236]">
                {isSelected ? (
                  <div className="w-4 h-4 rounded-full border-2 border-[#3F5236] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#3F5236]" />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full border border-[#B3ACA0]" />
                )}
              </div>
              <p className="flex-1 select-text leading-relaxed">
                {suggestion}
              </p>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-[#EBE4D8]">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => onAccept(selectedText)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3F5236] hover:bg-[#32422B] text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <ActionIcon className="w-3.5 h-3.5" />
            <span>{taskConfig.actionLabel}</span>
          </Button>

          <Button
            variant="outline"
            onClick={onTryAnother}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-[#DDD5C7] hover:bg-[#ECE5D8] text-[#4A4740] text-xs font-medium transition-colors cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Try another</span>
          </Button>
        </div>

        <Button
          variant="ghost"
          onClick={dismissSuggestions}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs text-[#8A847A] hover:text-[#25251F] hover:bg-[#ECE5D8] transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
          <span>Dismiss</span>
        </Button>
      </div>
    </Card>
  );
};
