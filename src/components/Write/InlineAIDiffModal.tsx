import React from 'react';
import type { AIDiffProposal } from '../../types';
import { Sparkles, Check, X, HelpCircle, ArrowRight } from 'lucide-react';

interface InlineAIDiffModalProps {
  proposal: AIDiffProposal | null;
  onAccept: (text: string) => void;
  onDiscard: () => void;
}

export const InlineAIDiffModal: React.FC<InlineAIDiffModalProps> = ({
  proposal,
  onAccept,
  onDiscard,
}) => {
  if (!proposal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 select-none font-sans text-xs">
      <div className="w-full max-w-2xl bg-[#0E1117] border border-[#232A3B] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-3 bg-[#0A0C10] border-b border-[#1C212B] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <span className="font-semibold text-slate-100 uppercase tracking-wider text-[11px]">
              AI Revision Proposal ({proposal.actionType})
            </span>
          </div>
          <button
            onClick={onDiscard}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Diff Comparison Body */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
          {/* Original */}
          <div className="space-y-1.5">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
              Original Excerpt
            </div>
            <div className="p-3 rounded-lg bg-[#141720] border border-[#202636] font-['Newsreader'] text-sm leading-relaxed text-slate-300 min-h-[120px] whitespace-pre-wrap">
              {proposal.originalText || '(End of current scene)'}
            </div>
          </div>

          {/* Suggested Revision */}
          <div className="space-y-1.5">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-emerald-400 flex items-center gap-1">
              <span>Suggested Revision</span>
              <ArrowRight className="w-3 h-3 text-emerald-400" />
            </div>
            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/40 font-['Newsreader'] text-sm leading-relaxed text-emerald-100 min-h-[120px] whitespace-pre-wrap">
              {proposal.suggestedText}
            </div>
          </div>
        </div>

        {/* Narrative Rationale */}
        <div className="px-4 py-2.5 bg-[#12151E] border-t border-[#1C212B] flex items-center space-x-2 text-slate-300 text-[11px]">
          <HelpCircle className="w-4 h-4 text-violet-400 shrink-0" />
          <span>
            <strong className="text-violet-300">Why this was suggested:</strong> {proposal.rationale}
          </span>
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-[#0A0C10] border-t border-[#1C212B] flex items-center justify-end space-x-2">
          <button
            onClick={onDiscard}
            className="px-3 py-1.5 rounded-md border border-slate-700 hover:bg-slate-800 text-slate-300 font-medium transition-colors"
          >
            Discard
          </button>
          <button
            onClick={() => onAccept(proposal.suggestedText)}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-md bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-md transition-all"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Accept Revision</span>
          </button>
        </div>
      </div>
    </div>
  );
};
