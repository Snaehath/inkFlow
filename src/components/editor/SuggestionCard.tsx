import React from 'react';
import { Check, RotateCw, X } from 'lucide-react';
import { useInkFlowStore } from '../../store/useInkFlowStore';

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
    dismissSuggestions 
  } = useInkFlowStore();

  if (!isSuggestionsCardOpen || continuationSuggestions.length === 0) {
    return null;
  }

  const selectedText = continuationSuggestions[selectedSuggestionIndex] || continuationSuggestions[0];

  return (
    <div className="bg-[#FAF7F2] border border-[#DDD5C7] rounded-2xl p-4 shadow-md space-y-3 my-4 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between text-xs text-[#706B62] border-b border-[#EBE4D8] pb-2">
        <span className="font-semibold text-[#25251F] font-serif">
          Continuation suggestions
        </span>
        <span className="text-[11px] font-mono">
          {selectedSuggestionIndex + 1} / {continuationSuggestions.length}
        </span>
      </div>

      {/* Suggestion Options */}
      <div className="space-y-2">
        {continuationSuggestions.map((suggestion, idx) => {
          const isSelected = selectedSuggestionIndex === idx;
          return (
            <div
              key={idx}
              onClick={() => setSelectedSuggestionIndex(idx)}
              className={`p-3 rounded-xl border text-xs leading-relaxed transition-all cursor-pointer flex items-start gap-2.5 ${
                isSelected
                  ? 'bg-[#F2F7EE] border-[#B9CCA9] text-[#25251F] shadow-2xs font-serif'
                  : 'bg-[#FAF7F2] border-[#E8E2D7] text-[#5C574F] hover:bg-[#F5EFE5] font-serif'
              }`}
            >
              <div className="mt-0.5 shrink-0 text-[#3F5236]">
                {isSelected ? (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-[#3F5236] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#3F5236]" />
                  </div>
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-[#B3ACA0]" />
                )}
              </div>
              <p className="flex-1 select-text">
                {suggestion}
              </p>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAccept(selectedText)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#3F5236] hover:bg-[#32422B] text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Accept</span>
          </button>

          <button
            onClick={onTryAnother}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DDD5C7] hover:bg-[#ECE5D8] text-[#4A4740] text-xs font-medium transition-colors cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Try another</span>
          </button>
        </div>

        <button
          onClick={dismissSuggestions}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs text-[#8A847A] hover:text-[#25251F] hover:bg-[#ECE5D8] transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
          <span>Dismiss</span>
        </button>
      </div>
    </div>
  );
};
