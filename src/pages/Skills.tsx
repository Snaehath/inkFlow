import React, { useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useInkFlowStore } from '../store/useInkFlowStore';
import { parseSkillMarkdown } from '../lib/skillParser';
import { SkillLibrary } from '../components/skills/SkillLibrary';
import { SkillMarkdownEditor } from '../components/skills/SkillMarkdownEditor';
import { AgentPreview } from '../components/skills/AgentPreview';
import { SkillActions } from '../components/skills/SkillActions';
import { Button } from '../components/ui/button';

export const Skills: React.FC = () => {
  const { 
    activeSkillMarkdown, 
    setActiveSkillMarkdown, 
    applySkillToSession,
    saveReusableSkill,
    createNewSkill 
  } = useInkFlowStore();

  const parsedSkill = useMemo(() => {
    return parseSkillMarkdown(activeSkillMarkdown);
  }, [activeSkillMarkdown]);

  const handleApply = () => {
    applySkillToSession();
  };

  const handleSaveReusable = () => {
    saveReusableSkill(parsedSkill.title, activeSkillMarkdown);
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 max-w-7xl mx-auto w-full flex flex-col justify-between space-y-5 select-none">
      {/* Title & Philosophy Subtitle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#25251F]">
            Shape your writing partner.
          </h1>
          <p className="text-xs text-[#7A7469] mt-0.5 font-sans">
            Choose a skill template, customize its Markdown instructions, or create a new partner for this session.
          </p>
        </div>

        <Button
          onClick={createNewSkill}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C77B5B] hover:bg-[#B3684A] text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New skill</span>
        </Button>
      </div>

      {/* 3-Column Skills Studio: Library | Markdown Editor | Agent Preview */}
      <div className="flex-1 flex flex-col lg:flex-row items-stretch gap-4 min-h-[460px]">
        {/* Left: Skill Library Templates & Delete Option */}
        <SkillLibrary />

        {/* Center: Live Markdown Skill Editor */}
        <SkillMarkdownEditor 
          onMarkdownChange={setActiveSkillMarkdown}
        />

        {/* Right: Live Interpreted Agent Preview */}
        <AgentPreview 
          parsedSkill={parsedSkill}
        />
      </div>

      {/* Action Footer */}
      <SkillActions 
        onApply={handleApply}
        onSaveReusable={handleSaveReusable}
      />
    </div>
  );
};
