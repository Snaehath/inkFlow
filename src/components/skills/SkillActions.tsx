import React, { useState } from 'react';
import { Check, Bookmark, ArrowRight, Trash2 } from 'lucide-react';
import { useInkFlowStore } from '../../store/useInkFlowStore';
import { Button } from '../ui/button';

interface SkillActionsProps {
  onApply: () => void;
  onSaveReusable: () => void;
}

export const SkillActions: React.FC<SkillActionsProps> = ({ onApply, onSaveReusable }) => {
  const { 
    setCurrentScreen, 
    activeSkillName, 
    activeSkillId,
    savedSkills,
    deleteSkill 
  } = useInkFlowStore();

  const [justApplied, setJustApplied] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const handleApplyClick = () => {
    onApply();
    setJustApplied(true);
    setTimeout(() => setJustApplied(false), 2000);
  };

  const handleSaveClick = () => {
    onSaveReusable();
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const handleDeleteCurrent = () => {
    if (savedSkills.length <= 1) return;
    deleteSkill(activeSkillId);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#E3DDD3]">
      <div className="flex items-center gap-3">
        <Button
          onClick={handleApplyClick}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3F5236] hover:bg-[#32422B] text-white text-xs font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>{justApplied ? 'Applied to session!' : 'Apply to session'}</span>
        </Button>

        <Button
          variant="outline"
          onClick={handleSaveClick}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F3EEE5] border-[#DDD5C7] text-[#3A3731] text-xs font-medium transition-colors cursor-pointer"
        >
          <Bookmark className="w-4 h-4 text-[#7C776E]" />
          <span>{justSaved ? 'Saved to library!' : 'Save skill'}</span>
        </Button>

        {savedSkills.length > 1 && (
          <Button
            variant="outline"
            onClick={handleDeleteCurrent}
            title="Delete this skill"
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border-[#DDD5C7] hover:bg-[#FBEBEB] hover:text-[#C77B5B] hover:border-[#F2D2D2] text-[#7A7469] text-xs font-medium transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </Button>
        )}
      </div>

      <Button
        variant="ghost"
        onClick={() => setCurrentScreen('editor')}
        className="flex items-center gap-1.5 text-xs font-semibold text-[#3F5236] hover:text-[#25251F] transition-colors cursor-pointer"
      >
        <span>Open editor with {activeSkillName}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
};