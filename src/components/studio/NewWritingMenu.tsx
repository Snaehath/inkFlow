import React, { useState } from 'react';
import { Book, Library, FileText, Mail, Feather, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { useInkFlowStore } from '../../store/useInkFlowStore';
import { db } from '../../storage/DexieStorage';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { resolveModelForTask } from '../../lib/modelRouter';
import { generateSkillFromStoryPremise } from '../../lib/skillGenerator';
import type { DocumentType } from '../../types';

function createEntityId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function getTimestamp(): number {
  return Date.now();
}

export const NewWritingMenu: React.FC = () => {
  const { 
    setCurrentScreen, 
    setActiveProjectId, 
    setActiveProjectTitle, 
    setActiveChapterId, 
    setActiveChapterTitle, 
    setActiveSceneId, 
    setActiveDocumentType,
    selectedModel,
    availableModels,
    saveReusableSkill,
    applySkillToSession
  } = useInkFlowStore();

  const writingFormats: Array<{
    type: DocumentType;
    label: string;
    icon: React.FC<{ className?: string }>;
    defaultTitle: string;
    defaultChapter: string;
    description: string;
  }> = [
    { 
      type: 'story', 
      label: 'Story', 
      icon: Book, 
      defaultTitle: 'Untitled Story', 
      defaultChapter: 'Scene 01',
      description: 'Narrative prose & character fiction'
    },
    { 
      type: 'novel', 
      label: 'Novel', 
      icon: Library, 
      defaultTitle: 'Untitled Novel', 
      defaultChapter: 'Chapter 01 — The Beginning',
      description: 'Multi-chapter long-form manuscript'
    },
    { 
      type: 'short-story', 
      label: 'Short story', 
      icon: FileText, 
      defaultTitle: 'Untitled Short Story', 
      defaultChapter: 'Story 01 — Untitled',
      description: 'Single-scene or standalone tale'
    },
    { 
      type: 'email', 
      label: 'Email', 
      icon: Mail, 
      defaultTitle: 'Email Dispatch', 
      defaultChapter: 'Draft: Collaboration Note',
      description: 'Editorial letter, newsletter, or update'
    },
    { 
      type: 'blog', 
      label: 'Blog', 
      icon: Feather, 
      defaultTitle: 'Studio Essay', 
      defaultChapter: 'Draft Essay',
      description: 'Article, craft essay, or journal entry'
    },
  ];

  const [selectedFormat, setSelectedFormat] = useState<typeof writingFormats[0] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [premisePlan, setPremisePlan] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFormatClick = (format: typeof writingFormats[0]) => {
    setSelectedFormat(format);
    setCustomTitle('');
    setPremisePlan('');
    setModalOpen(true);
  };

  const executeCreateDraft = async (shapeSkillWithAI = false) => {
    if (!selectedFormat) return;

    const now = getTimestamp();
    const newProjectId = createEntityId('proj');
    const newChapterId = createEntityId('ch');
    const newSceneId = createEntityId('sc');

    const finalTitle = customTitle.trim() || selectedFormat.defaultTitle;
    const finalChapter = customTitle.trim() 
      ? (selectedFormat.type === 'short-story' ? finalTitle : `Chapter 01 — ${finalTitle}`)
      : selectedFormat.defaultChapter;

    if (shapeSkillWithAI && premisePlan.trim()) {
      setIsGenerating(true);
      try {
        const routing = resolveModelForTask(selectedModel, 'continue', availableModels);
        const skillResult = await generateSkillFromStoryPremise(finalTitle, premisePlan.trim(), routing.modelName);
        saveReusableSkill(skillResult.title, skillResult.markdown);
        applySkillToSession();
      } catch (err) {
        console.warn('AI skill generation failed:', err);
      }
      setIsGenerating(false);
    }

    // Create real records in Dexie
    await db.projects.add({
      id: newProjectId,
      title: finalTitle,
      genre: selectedFormat.label,
      targetWordCount: selectedFormat.type === 'novel' ? 60000 : 5000,
      description: premisePlan.trim() || selectedFormat.description,
      activeSceneId: newSceneId,
      createdAt: now,
      updatedAt: now,
    });

    await db.chapters.add({
      id: newChapterId,
      projectId: newProjectId,
      title: finalChapter,
      order: 1,
      createdAt: now,
      updatedAt: now,
    });

    await db.scenes.add({
      id: newSceneId,
      chapterId: newChapterId,
      projectId: newProjectId,
      title: finalChapter,
      order: 1,
      beats: [],
      charactersPresent: [],
      activePlotThreadIds: [],
      contentHtml: '',
      wordCount: 0,
      status: 'empty',
      createdAt: now,
      updatedAt: now,
    });

    setActiveProjectId(newProjectId);
    setActiveProjectTitle(finalTitle);
    setActiveChapterId(newChapterId);
    setActiveChapterTitle(finalChapter);
    setActiveSceneId(newSceneId);
    setActiveDocumentType(selectedFormat.type);
    setModalOpen(false);
    setCurrentScreen('editor');
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {writingFormats.map((format) => {
          const Icon = format.icon;
          return (
            <Card
              key={format.type}
              onClick={() => handleFormatClick(format)}
              className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl bg-[#FAF7F2] hover:bg-[#F3EEE5] border-[#E3DDD3] transition-all group text-center shadow-2xs hover:shadow-xs hover:-translate-y-0.5 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#EFE9DF] group-hover:bg-[#E3DDD1] flex items-center justify-center text-[#59554C] group-hover:text-[#25251F] transition-colors">
                <Icon className="w-5 h-5" />
              </div>
              <span className="font-medium text-xs text-[#38352F] group-hover:text-[#181814]">
                {format.label}
              </span>
            </Card>
          );
        })}
      </div>

      {/* Story Planning & Partner Shaping Modal */}
      {selectedFormat && (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="bg-[#FAF7F2] border border-[#DDD5C7] rounded-3xl max-w-lg w-full p-6 shadow-2xl text-[#25251F] font-sans">
            <DialogHeader className="pb-3 border-b border-[#E8E2D7]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#EAE2D2] flex items-center justify-center text-[#C77B5B]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <DialogTitle className="font-serif font-bold text-lg text-[#25251F]">
                    Start New {selectedFormat.label}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-[#706B62] mt-0.5 font-sans">
                    Tell inkFlow what you are planning to write. AI will craft custom partner rules (tone, sensory details, and pacing) for this story.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#4A4740] block">
                  Title
                </label>
                <Input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder={`e.g. ${selectedFormat.type === 'short-story' ? 'The Floor 101' : selectedFormat.defaultTitle}`}
                  className="text-xs rounded-xl bg-[#F7F2E8] border-[#DFD8CC] text-[#25251F] focus-visible:ring-[#3F5236]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#4A4740] block">
                  What are you planning to write?
                </label>
                <textarea
                  rows={4}
                  value={premisePlan}
                  onChange={(e) => setPremisePlan(e.target.value)}
                  placeholder="e.g. A mystery about a 100-floor Moscow hotel with a secret 101st floor that only a rookie room-service worker can see..."
                  className="w-full text-xs font-serif p-3 rounded-2xl bg-[#F7F2E8] border border-[#DFD8CC] text-[#25251F] placeholder-[#9E988D] focus:outline-none focus:ring-1 focus:ring-[#3F5236] resize-none shadow-2xs leading-relaxed"
                />
              </div>

              <DialogFooter className="pt-3 border-t border-[#E8E2D7] flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => executeCreateDraft(false)}
                  disabled={isGenerating}
                  className="text-xs rounded-xl text-[#7A7469] hover:text-[#25251F] cursor-pointer"
                >
                  Skip & Start Blank Draft
                </Button>

                <Button
                  type="button"
                  onClick={() => executeCreateDraft(true)}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3F5236] hover:bg-[#32422B] text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Shaping Partner...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Create & Shape AI Partner</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
