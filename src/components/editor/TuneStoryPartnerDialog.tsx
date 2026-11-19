import React, { useState } from 'react';
import { Sparkles, Loader2, BookOpen, Wand2, Check } from 'lucide-react';
import { useInkFlowStore } from '../../store/useInkFlowStore';
import { resolveModelForTask } from '../../lib/modelRouter';
import { generateSkillFromStoryPremise } from '../../lib/skillGenerator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface TuneStoryPartnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentManuscriptExcerpt?: string;
}

interface TuneFormProps {
  onClose: () => void;
  currentManuscriptExcerpt: string;
}

const TuneStoryPartnerForm: React.FC<TuneFormProps> = ({
  onClose,
  currentManuscriptExcerpt,
}) => {
  const { 
    activeChapterTitle, 
    activeProjectTitle, 
    selectedModel, 
    availableModels, 
    saveReusableSkill,
    applySkillToSession
  } = useInkFlowStore();

  const [storyTitle, setStoryTitle] = useState(
    activeChapterTitle || activeProjectTitle || 'Untitled Story'
  );
  const [premiseText, setPremiseText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleUseCurrentExcerpt = () => {
    if (currentManuscriptExcerpt.trim()) {
      setPremiseText(currentManuscriptExcerpt.trim().slice(0, 400));
    }
  };

  const handleGenerateSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPremise = premiseText.trim() || currentManuscriptExcerpt.trim();
    if (!cleanPremise) return;

    setIsGenerating(true);
    try {
      const routing = resolveModelForTask(selectedModel, 'continue', availableModels);
      const result = await generateSkillFromStoryPremise(storyTitle, cleanPremise, routing.modelName);

      // Save and apply new skill to active session
      saveReusableSkill(result.title, result.markdown);
      applySkillToSession();

      setIsSuccess(true);
      setTimeout(() => {
        setIsGenerating(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.warn('Failed to generate tailored skill:', err);
      setIsGenerating(false);
    }
  };

  return (
    <>
      <DialogHeader className="pb-3 border-b border-[#E8E2D7]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#EAE2D2] flex items-center justify-center text-[#C77B5B]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <DialogTitle className="font-serif font-bold text-lg text-[#25251F]">
              Tune Writing Partner for this Story
            </DialogTitle>
            <DialogDescription className="text-xs text-[#706B62] mt-0.5 font-sans">
              Tell inkFlow what you are planning to write. AI will craft custom instructions (tone, sensory rules, and suspense) specifically for this story.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <form onSubmit={handleGenerateSkill} className="space-y-4 pt-2">
        {/* Story Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#4A4740] block">
            Story Title
          </label>
          <Input
            type="text"
            value={storyTitle}
            onChange={(e) => setStoryTitle(e.target.value)}
            placeholder="e.g. The Floor 101"
            className="text-xs rounded-xl bg-[#F7F2E8] border-[#DFD8CC] text-[#25251F] focus-visible:ring-[#3F5236]"
          />
        </div>

        {/* Premise & Planning Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[#4A4740]">
              What are you planning to write?
            </label>
            {currentManuscriptExcerpt.trim() && (
              <button
                type="button"
                onClick={handleUseCurrentExcerpt}
                className="text-[11px] text-[#3F5236] hover:underline font-medium cursor-pointer flex items-center gap-1"
              >
                <BookOpen className="w-3 h-3" />
                <span>Use current draft text</span>
              </button>
            )}
          </div>

          <textarea
            rows={4}
            value={premiseText}
            onChange={(e) => setPremiseText(e.target.value)}
            placeholder="e.g. A mystery about a 100-floor Moscow hotel with a secret 101st floor that only a rookie bellhop can see when the seniors dismiss him..."
            className="w-full text-xs font-serif p-3 rounded-2xl bg-[#F7F2E8] border border-[#DFD8CC] text-[#25251F] placeholder-[#9E988D] focus:outline-none focus:ring-1 focus:ring-[#3F5236] resize-none shadow-2xs leading-relaxed"
          />
        </div>

        {/* Quick Idea Chips */}
        <div className="space-y-1">
          <span className="text-[11px] font-medium text-[#7A7469]">Quick Tone Presets:</span>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {[
              'Liminal Hotel Mystery',
              'Psychological Suspense',
              'Quiet Uncanny Realism',
              'Dark Urban Fantasy',
              'Soviet Gothic Realism'
            ].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setPremiseText((prev) => prev ? `${prev} Tone: ${chip}.` : `Tone: ${chip}. Story about ${storyTitle}.`)}
                className="text-[10px] px-2.5 py-1 rounded-lg bg-[#ECE4D6] hover:bg-[#E2D8C6] text-[#4F4A42] transition-colors cursor-pointer"
              >
                + {chip}
              </button>
            ))}
          </div>
        </div>

        <DialogFooter className="pt-2 border-t border-[#E8E2D7] flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="rounded-xl px-3 text-xs text-[#7A7469] hover:text-[#25251F] cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={(!premiseText.trim() && !currentManuscriptExcerpt.trim()) || isGenerating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3F5236] hover:bg-[#32422B] text-white text-xs font-semibold shadow-xs hover:shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Consulting Ollama...</span>
              </>
            ) : isSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Skill Applied!</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3.5 h-3.5" />
                <span>Shape Partner Skill</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
};

export const TuneStoryPartnerDialog: React.FC<TuneStoryPartnerDialogProps> = ({
  open,
  onOpenChange,
  currentManuscriptExcerpt = '',
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#FAF7F2] border border-[#DDD5C7] rounded-3xl max-w-lg w-full p-6 shadow-2xl text-[#25251F] font-sans">
        {open && (
          <TuneStoryPartnerForm
            onClose={() => onOpenChange(false)}
            currentManuscriptExcerpt={currentManuscriptExcerpt}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
