import React, { useState } from 'react';
import { Plus, Trash2, Sparkles, Check, Search } from 'lucide-react';
import { useInkFlowStore } from '../../store/useInkFlowStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

export const SkillLibrary: React.FC = () => {
  const { 
    savedSkills, 
    activeSkillId, 
    loadSkill, 
    createNewSkill, 
    deleteSkill 
  } = useInkFlowStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [skillToDelete, setSkillToDelete] = useState<string | null>(null);

  const filteredSkills = savedSkills.filter((s) => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSkillToDelete(id);
  };

  const handleConfirmDelete = () => {
    if (skillToDelete) {
      deleteSkill(skillToDelete);
      setSkillToDelete(null);
    }
  };

  return (
    <aside className="w-64 bg-[#FAF7F2] border border-[#DDD5C7] rounded-2xl p-4 shadow-xs flex flex-col space-y-3 select-none shrink-0 h-full">
      {/* Header with New Skill Button */}
      <div className="flex items-center justify-between pb-2 border-b border-[#EBE4D8]">
        <div>
          <h3 className="font-serif font-bold text-sm text-[#25251F]">
            Skill Library
          </h3>
          <span className="text-[11px] text-[#78736A]">
            {savedSkills.length} {savedSkills.length === 1 ? 'skill' : 'skills'}
          </span>
        </div>

        <Button
          onClick={createNewSkill}
          title="Create fresh skill template"
          className="flex items-center gap-1 px-2.5 py-1 h-auto rounded-xl bg-[#3F5236] hover:bg-[#32422B] text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New</span>
        </Button>
      </div>

      {/* Quick Search */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-[#8A847A] absolute left-2.5 top-2.5" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter skills..."
          className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl bg-[#F4EFE6] border-[#E0D8CB] text-[#25251F] placeholder-[#9E988D] focus-visible:ring-1 focus-visible:ring-[#3E5535]"
        />
      </div>

      {/* Skills List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5">
        {filteredSkills.map((skill) => {
          const isActive = activeSkillId === skill.id;
          return (
            <Card
              key={skill.id}
              onClick={() => loadSkill(skill.id)}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer group flex flex-col justify-between gap-0 ${
                isActive
                  ? 'bg-[#E1EAD9] border-[#B9CCA9] text-[#25251F] shadow-2xs'
                  : 'bg-[#FAF7F2] border-[#E8E2D7] text-[#5C574F] hover:bg-[#F3EEE5]'
              }`}
            >
              <div className="flex items-start justify-between gap-1.5">
                <div className="font-serif font-semibold text-xs text-[#25251F] group-hover:text-[#181814] truncate flex-1">
                  {skill.name}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {isActive && (
                    <span className="w-4 h-4 rounded-full bg-[#3F5236] text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}

                  <button
                    onClick={(e) => handleDeleteClick(e, skill.id)}
                    title="Delete skill template"
                    className="p-1 text-[#9E988D] hover:text-[#C77B5B] hover:bg-black/5 rounded transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-[10px] text-[#7A7469] line-clamp-1 mt-1 font-sans">
                {skill.summary}
              </div>

              <div className="flex items-center justify-between text-[10px] text-[#8C867C] mt-2 pt-1.5 border-t border-black/5">
                <Badge variant="outline" className="px-1.5 py-0.5 rounded bg-black/5 text-[#5A544A] border-none font-mono text-[9px]">
                  {skill.category}
                </Badge>
                {isActive && (
                  <span className="text-[#35502A] font-medium flex items-center gap-1 text-[10px]">
                    <Sparkles className="w-2.5 h-2.5" />
                    Active
                  </span>
                )}
              </div>
            </Card>
          );
        })}

        {filteredSkills.length === 0 && (
          <div className="p-4 text-center text-xs text-[#8A847A] italic font-serif">
            No skills match "{searchQuery}"
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={!!skillToDelete} onOpenChange={(open) => !open && setSkillToDelete(null)}>
        <AlertDialogContent className="bg-[#FAF7F2] border border-[#DDD5C7] rounded-2xl p-6 max-w-sm shadow-xl text-[#25251F]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-lg font-bold text-[#25251F]">
              Delete Skill?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-[#6B655A] leading-relaxed">
              Are you sure you want to delete this writing skill? If deleted, inkFlow will revert to the default creative partner instructions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex gap-2 justify-end bg-transparent border-none p-0">
            <AlertDialogCancel className="rounded-xl px-3.5 py-2 text-xs font-medium text-[#656057] hover:bg-[#EAE4D7] border border-[#D5CEC2] cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="rounded-xl px-4 py-2 bg-[#C77B5B] hover:bg-[#B3684A] text-white text-xs font-semibold cursor-pointer"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  );
};