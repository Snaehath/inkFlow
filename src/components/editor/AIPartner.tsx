import React, { useState } from 'react';
import { 
  ArrowRight, 
  Maximize2, 
  Loader2, 
  Sparkles, 
  Wand2, 
  Bot, 
  Feather, 
  BookOpen
} from 'lucide-react';
import { useInkFlowStore } from '../../store/useInkFlowStore';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface AIPartnerProps {
  onContinue: () => void;
  onExpand: () => void;
  onFullAutoGenerate: (premise: string) => Promise<void>;
  onOpenTuneModal: () => void;
  isLoading: boolean;
  activeTask?: string | null;
}

export const AIPartner: React.FC<AIPartnerProps> = ({
  onContinue,
  onExpand,
  onFullAutoGenerate,
  onOpenTuneModal,
  isLoading,
  activeTask,
}) => {
  const { 
    writingFlowMode, 
    setWritingFlowMode, 
    activeSkillName, 
    activeChapterTitle,
    activeSkillMarkdown
  } = useInkFlowStore();

  const [fullAutoPremise, setFullAutoPremise] = useState('');
  const [isFullAutoRunning, setIsFullAutoRunning] = useState(false);

  const handleRunFullAuto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFullAutoRunning || isLoading) return;
    setIsFullAutoRunning(true);
    try {
      await onFullAutoGenerate(fullAutoPremise.trim());
    } finally {
      setIsFullAutoRunning(false);
    }
  };

  const hasResearchedArchitecture = activeSkillMarkdown.includes('## Story Architecture');

  return (
    <aside className="w-80 h-full border-l border-[#E3DDD3] bg-[#F7F3EB]/70 flex flex-col justify-between select-none shrink-0 overflow-y-auto p-4 space-y-4 font-sans">
      <div className="space-y-4">
        {/* Panel Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-base text-[#25251F]">
              Writing Partner
            </h3>
            <p className="text-xs text-[#7A7469] mt-0.5 font-sans">
              AI support tuned to your manuscript
            </p>
          </div>
          {(isLoading || isFullAutoRunning) && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#EAE3D5] text-[#3F5236] text-[11px] font-medium animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>{isFullAutoRunning ? 'Writing chapter...' : 'Drafting...'}</span>
            </div>
          )}
        </div>

        {/* Co-Assist vs Full Auto Mode Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#EFE9DF] border border-[#E3DDD3]">
          <button
            type="button"
            onClick={() => setWritingFlowMode('co-assist')}
            className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              writingFlowMode === 'co-assist'
                ? 'bg-[#FAF7F2] text-[#25251F] shadow-2xs font-bold'
                : 'text-[#69655C] hover:text-[#25251F]'
            }`}
          >
            <Feather className="w-3.5 h-3.5 text-[#3F5236]" />
            <span>Co-Assist</span>
          </button>

          <button
            type="button"
            onClick={() => setWritingFlowMode('full-auto')}
            className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              writingFlowMode === 'full-auto'
                ? 'bg-[#3F5236] text-white shadow-2xs font-bold'
                : 'text-[#69655C] hover:text-[#25251F]'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Full Auto</span>
          </button>
        </div>

        {/* Co-Assist Mode View */}
        {writingFlowMode === 'co-assist' ? (
          <div className="space-y-3">
            {/* Core Action 1: Continue Story */}
            <Card
              onClick={onContinue}
              className={`w-full text-left p-3.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#F3EEE5] border-[#E3DDD3] transition-all flex items-start gap-3 group shadow-2xs hover:shadow-xs cursor-pointer ${
                isLoading ? 'opacity-55 pointer-events-none' : ''
              }`}
            >
              <div className="p-2 rounded-xl bg-[#EFE9DF] group-hover:bg-[#E3DDCF] text-[#524E46] group-hover:text-[#25251F] transition-colors shrink-0 mt-0.5">
                {isLoading && activeTask === 'continue' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#3F5236]" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-serif font-semibold text-xs text-[#25251F] group-hover:text-[#181814] flex items-center justify-between">
                  <span>Continue Story</span>
                  <Sparkles className="w-3 h-3 opacity-0 group-hover:opacity-60 text-[#C77B5B] transition-opacity" />
                </div>
                <div className="text-[11px] text-[#7A7469] leading-snug mt-0.5 font-sans">
                  Seamlessly picks up from your last sentence with auto-formatting & continuous flow.
                </div>
              </div>
            </Card>

            {/* Core Action 2: Expand Scene */}
            <Card
              onClick={onExpand}
              className={`w-full text-left p-3.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#F3EEE5] border-[#E3DDD3] transition-all flex items-start gap-3 group shadow-2xs hover:shadow-xs cursor-pointer ${
                isLoading ? 'opacity-55 pointer-events-none' : ''
              }`}
            >
              <div className="p-2 rounded-xl bg-[#EFE9DF] group-hover:bg-[#E3DDCF] text-[#524E46] group-hover:text-[#25251F] transition-colors shrink-0 mt-0.5">
                {isLoading && activeTask === 'expand' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#3F5236]" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-serif font-semibold text-xs text-[#25251F] group-hover:text-[#181814] flex items-center justify-between">
                  <span>Expand Scene</span>
                  <Sparkles className="w-3 h-3 opacity-0 group-hover:opacity-60 text-[#C77B5B] transition-opacity" />
                </div>
                <div className="text-[11px] text-[#7A7469] leading-snug mt-0.5 font-sans">
                  Deepen sensory details, lighting, sounds, and claustrophobic tension.
                </div>
              </div>
            </Card>

            {/* Story Premise & Partner Tone */}
            <Card className="p-3.5 rounded-2xl bg-[#FAF7F2] border-[#DDD5C7] space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-[#25251F]">
                  <Sparkles className="w-3.5 h-3.5 text-[#C77B5B]" />
                  <span>Story Premise & Voice</span>
                </div>
                <Badge variant="outline" className="text-[10px] bg-[#E1EAD9] text-[#2C3E25] border-none px-1.5 py-0.5 font-semibold">
                  Active
                </Badge>
              </div>
              <p className="text-[11px] text-[#706B62] leading-snug font-sans">
                Tuned specifically for <strong className="text-[#25251F]">"{activeChapterTitle}"</strong>. Custom sensory rules guide every continuation.
              </p>
              <Button
                onClick={onOpenTuneModal}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-[#FAF7F2] hover:bg-[#F3EFE7] border border-[#DDD5C7] text-xs font-semibold text-[#25251F] shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              >
                <Wand2 className="w-3.5 h-3.5 text-[#C77B5B]" />
                <span>Tune Partner for this Story</span>
              </Button>
            </Card>
          </div>
        ) : (
          /* Full Auto Mode View */
          <div className="space-y-3">
            <Card className="p-4 rounded-2xl bg-[#FAF7F2] border-[#DDD5C7] space-y-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[#EAE2D2] flex items-center justify-center text-[#3F5236]">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-xs text-[#25251F]">
                    Full Auto Chapter Drafting
                  </h4>
                  <p className="text-[10px] text-[#7A7469]">
                    Researches structure, word count & drafts complete chapter
                  </p>
                </div>
              </div>

              <form onSubmit={handleRunFullAuto} className="space-y-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#45423B] block">
                    What happens in this chapter?
                  </label>
                  <textarea
                    rows={4}
                    value={fullAutoPremise}
                    onChange={(e) => setFullAutoPremise(e.target.value)}
                    placeholder="e.g. Finn the rookie bellboy takes the staff lift to the secret 101st floor in the Moscow hotel, stepping into an eerie corridor that shouldn't exist..."
                    className="w-full text-xs font-serif p-2.5 rounded-xl bg-[#F7F2E8] border border-[#DFD8CC] text-[#25251F] placeholder-[#9E988D] focus:outline-none focus:ring-1 focus:ring-[#3F5236] resize-none shadow-2xs leading-relaxed"
                  />
                </div>

                {hasResearchedArchitecture && (
                  <div className="p-2 rounded-xl bg-[#EAE3D5]/60 border border-[#DDD5C7] text-[10px] text-[#4A4740] flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#3F5236] shrink-0" />
                    <span>Story architecture & pacing rules stored in skill</span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isFullAutoRunning || isLoading}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#3F5236] hover:bg-[#32422B] text-white text-xs font-semibold shadow-xs hover:shadow-sm cursor-pointer disabled:opacity-50 transition-all"
                >
                  {isFullAutoRunning ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Researching & Drafting Chapter...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate Complete Chapter</span>
                    </>
                  )}
                </Button>
              </form>
            </Card>

            <p className="text-[11px] text-[#7A7469] leading-normal font-sans px-1">
              Full Auto conducts automated craft research (target word count, pacing beats, sensory motifs), stores the rules into the story skill, and outputs a complete, connected chapter directly into the editor.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Active Skill Pill (Clickable) */}
      <div className="pt-2 border-t border-[#E3DDD3] flex items-center justify-between text-xs">
        <span className="text-[#6B665C] font-medium text-[11px]">Active Skill:</span>
        <button
          onClick={onOpenTuneModal}
          title="Click to tune or view story skill"
          className="flex items-center gap-1.5 bg-[#E7EFE2] text-[#344D2E] hover:bg-[#DCE7D5] border border-[#D0DFC9] px-2.5 py-1 rounded-xl font-medium text-[11px] transition-colors cursor-pointer max-w-[190px]"
        >
          <Sparkles className="w-3 h-3 text-[#3F5236] shrink-0" />
          <span className="truncate">{activeSkillName}</span>
        </button>
      </div>
    </aside>
  );
};
