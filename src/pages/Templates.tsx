import React, { useState } from 'react';
import { 
  Book, 
  Feather, 
  FileText, 
  Mail, 
  Layers, 
  Sparkles, 
  Search, 
  Plus, 
  Bookmark, 
  PenTool,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { useInkFlowStore } from '../store/useInkFlowStore';
import { db } from '../storage/DexieStorage';
import { ProceduralArt } from '../components/ui/ProceduralArt';
import { requestOllamaCompletion } from '../lib/ollama';
import type { DocumentType } from '../types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';

function getNow(): number {
  return Date.now();
}

function mapCategoryToDocType(cat: string): DocumentType {
  const c = cat.toLowerCase();
  if (c.includes('novel')) return 'novel';
  if (c.includes('short')) return 'short-story';
  if (c.includes('email')) return 'email';
  if (c.includes('blog')) return 'blog';
  return 'story';
}

interface TemplateCardData {
  id: string;
  title: string;
  description: string;
  category: 'Novel' | 'Short Story' | 'Story' | 'Blog' | 'Email' | 'Article' | 'Other';
  icon: React.FC<{ className?: string }>;
  tags: string[];
  chapters: Array<{ title: string; prompt: string }>;
}

export const Templates: React.FC = () => {
  const { 
    setCurrentScreen, 
    setActiveProjectId, 
    setActiveProjectTitle, 
    setActiveChapterId,
    setActiveChapterTitle,
    setActiveSceneId,
    setActiveDocumentType,
    selectedModel 
  } = useInkFlowStore();

  const [activeCategory, setActiveCategory] = useState<string>('All Templates');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiIdeaPrompt, setAiIdeaPrompt] = useState('');

  const builtInTemplates: TemplateCardData[] = [
    {
      id: 'tmpl-novel',
      title: 'Novel (Long-form)',
      description: 'A complete novel structure with acts, chapters, and scene prompts.',
      category: 'Novel',
      icon: Book,
      tags: ['# Story', '# Planning'],
      chapters: [
        { title: 'Act I — The Inciting Incident', prompt: 'Establish protagonist normal world and the disturbance.' },
        { title: 'Act I — Crossing the Threshold', prompt: 'Commitment to the journey with no turning back.' },
        { title: 'Act II — Rising Complications', prompt: 'Encounter obstacles and test relationships.' },
        { title: 'Act II — The Midpoint Climax', prompt: 'A false victory or major shift in stakes.' },
        { title: 'Act III — The Dark Moment', prompt: 'All seems lost before the final realization.' },
        { title: 'Act III — Resolution', prompt: 'Climax and the transformed new normal.' }
      ]
    },
    {
      id: 'tmpl-short-story',
      title: 'Short Story',
      description: 'Write a focused, compelling story with a clear narrative arc.',
      category: 'Short Story',
      icon: Feather,
      tags: ['# Fiction', '# < 5k words'],
      chapters: [
        { title: 'Scene 01 — Hook & Tension', prompt: 'Begin in media res with an immediate sensory beat.' },
        { title: 'Scene 02 — The Escalation', prompt: 'Deepen the conflict and force a choice.' },
        { title: 'Scene 03 — The Echo', prompt: 'Resonant ending that lingers after the final line.' }
      ]
    },
    {
      id: 'tmpl-blog-post',
      title: 'Blog Post',
      description: 'Create engaging, well-structured craft and opinion articles.',
      category: 'Blog',
      icon: FileText,
      tags: ['# Blog', '# Informative'],
      chapters: [
        { title: 'Introduction — The Paradox Hook', prompt: 'Challenge common assumptions with a punchy opening.' },
        { title: 'Section 01 — Core Argument', prompt: 'Lay out the main thesis with real-world examples.' },
        { title: 'Section 02 — Practical Takeaways', prompt: 'Provide actionable advice for the reader.' },
        { title: 'Conclusion — The Parting Thought', prompt: 'Summarize with a memorable closing sentence.' }
      ]
    },
    {
      id: 'tmpl-email',
      title: 'Email',
      description: 'Write clear and effective emails for any professional or personal purpose.',
      category: 'Email',
      icon: Mail,
      tags: ['# Professional', '# Personal'],
      chapters: [
        { title: 'Subject & Opening', prompt: 'Warm, respectful opening establishing the context.' },
        { title: 'Body & Key Update', prompt: 'Clear paragraphs explaining the rationale.' },
        { title: 'Call to Action', prompt: 'Next steps with polite appreciation.' }
      ]
    },
    {
      id: 'tmpl-story-series',
      title: 'Story Series',
      description: 'Build a connected series of stories with a consistent style and world.',
      category: 'Story',
      icon: Layers,
      tags: ['# Series', '# Worldbuilding'],
      chapters: [
        { title: 'Dispatch 01 — The First Valley', prompt: 'Introduce the shared environment through a lone traveler.' },
        { title: 'Dispatch 02 — The Crossing', prompt: 'Show the same world through a contrasting perspective.' },
        { title: 'Dispatch 03 — Convergence', prompt: 'Threads from previous dispatches intertwine.' }
      ]
    },
    {
      id: 'tmpl-custom-ai',
      title: 'Custom (AI)',
      description: 'Describe your writing needs and generate a tailored template.',
      category: 'Other',
      icon: Sparkles,
      tags: ['# Flexible', '# AI-powered'],
      chapters: [
        { title: 'Chapter 01 — Discovery', prompt: 'Generated based on your custom prompt.' }
      ]
    }
  ];

  const categories = ['All Templates', 'Novel', 'Short Story', 'Story', 'Blog', 'Email', 'Article', 'Other'];

  const filtered = builtInTemplates.filter(t => {
    const matchesCat = activeCategory === 'All Templates' || t.category === activeCategory;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleUseTemplate = async (tmpl: TemplateCardData) => {
    const now = getNow();
    const projectId = `proj-${now}`;
    const firstChapter = tmpl.chapters[0];
    const firstChapterId = `ch-${now}-0`;
    const firstSceneId = `sc-${now}-0`;

    await db.projects.add({
      id: projectId,
      title: `Untitled ${tmpl.title}`,
      genre: tmpl.category,
      targetWordCount: tmpl.category === 'Novel' ? 60000 : 3000,
      description: tmpl.description,
      activeSceneId: firstSceneId,
      createdAt: now,
      updatedAt: now,
    });

    for (let i = 0; i < tmpl.chapters.length; i++) {
      const ch = tmpl.chapters[i];
      const chId = `ch-${now}-${i}`;
      const scId = `sc-${now}-${i}`;

      await db.chapters.add({
        id: chId,
        projectId,
        title: ch.title,
        order: i + 1,
        summary: ch.prompt,
        createdAt: now,
        updatedAt: now,
      });

      await db.scenes.add({
        id: scId,
        chapterId: chId,
        projectId,
        title: ch.title,
        order: 1,
        beats: [{ id: `b-${now}-${i}`, description: ch.prompt, completed: false }],
        charactersPresent: [],
        activePlotThreadIds: [],
        contentHtml: `<h2>${ch.title}</h2><p><em>Section Objective: ${ch.prompt}</em></p><hr /><p>Begin drafting your scene here. Use <strong>Continue</strong> or <strong>Brainstorm</strong> in the AI Partner panel on the right whenever you want ideas, sensory details, or alternatives.</p>`,
        wordCount: 38,
        status: 'empty',
        createdAt: now,
        updatedAt: now,
      });
    }

    setActiveProjectId(projectId);
    setActiveProjectTitle(`Untitled ${tmpl.title}`);
    setActiveChapterId(firstChapterId);
    setActiveChapterTitle(firstChapter.title);
    setActiveSceneId(firstSceneId);
    setActiveDocumentType(mapCategoryToDocType(tmpl.category));
    setCurrentScreen('editor');
  };

  const handleGenerateTemplateWithAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiIdeaPrompt.trim() || isAIGenerating) return;

    setIsAIGenerating(true);
    const systemPrompt = `You are an expert editorial writing consultant in inkFlow studio. 
Generate a structured manuscript template based on the writer's idea.
Output 4 chapters/acts with concise prompts.`;

    const prompt = `Idea: "${aiIdeaPrompt}"
Format each chapter as:
Chapter Title | Brief Scene Objective`;

    let generatedOutline: Array<{ title: string; prompt: string }> = [];

    try {
      const response = await requestOllamaCompletion(selectedModel, prompt, systemPrompt);
      if (response) {
        const lines = response.split('\n').filter(l => l.includes('|'));
        if (lines.length > 0) {
          generatedOutline = lines.slice(0, 5).map(l => {
            const [t, p] = l.split('|');
            return { title: t.trim().replace(/^[-*•\d.]+\s*/, ''), prompt: (p || '').trim() };
          });
        }
      }
    } catch {
      // Fallback
    }

    if (generatedOutline.length === 0) {
      generatedOutline = [
        { title: 'Act I — The Discovery', prompt: `Opening scene exploring: ${aiIdeaPrompt.slice(0, 50)}...` },
        { title: 'Act II — The Turn', prompt: 'Complication and shifting alliances.' },
        { title: 'Act III — The Threshold', prompt: 'The defining confrontation and aftermath.' }
      ];
    }

    const dynamicTmpl: TemplateCardData = {
      id: `tmpl-ai-${getNow()}`,
      title: aiIdeaPrompt.slice(0, 32),
      description: `AI-structured template tailored for "${aiIdeaPrompt.slice(0, 60)}..."`,
      category: 'Story',
      icon: Sparkles,
      tags: ['# AI-Generated', '# Custom'],
      chapters: generatedOutline
    };

    setIsAIGenerating(false);
    setAiModalOpen(false);
    setAiIdeaPrompt('');
    await handleUseTemplate(dynamicTmpl);
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8 max-w-6xl mx-auto w-full space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#25251F]">
            Templates
          </h1>
          <p className="text-xs text-[#7A7469] mt-1 font-sans">
            Kickstart your writing with flexible, AI-ready templates.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCurrentScreen('editor')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F3EEE5] border border-[#DDD5C7] text-xs font-medium text-[#403D37] transition-colors cursor-pointer"
          >
            <PenTool className="w-3.5 h-3.5 text-[#7C776E]" />
            <span>Create from draft</span>
          </button>

          <button
            onClick={() => setAiModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C77B5B] hover:bg-[#B3684A] text-white text-xs font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Template</span>
          </button>
        </div>
      </div>

      {/* Categories & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                activeCategory === cat
                  ? 'bg-[#E1EAD9] text-[#2C3E25] font-semibold shadow-2xs'
                  : 'text-[#615C53] hover:bg-[#EAE4D7] hover:text-[#25251F]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-56 shrink-0">
          <Search className="w-3.5 h-3.5 text-[#8A847A] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="w-full text-xs pl-8.5 pr-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#E0D8CB] text-[#25251F] placeholder-[#9E988D] focus:outline-none focus:border-[#3E5535]"
          />
        </div>
      </div>

      {/* Hero Banner: Turn an idea into a template with Procedural Books & Quill Art */}
      <div className="bg-[#FAF7F2] border border-[#E3DDD3] rounded-2xl overflow-hidden shadow-2xs relative flex flex-col md:flex-row items-center justify-between p-6 md:p-8 gap-6">
        <div className="flex-1 space-y-3 z-10">
          <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-[#8C5843]">
            <Sparkles className="w-4 h-4 text-[#C77B5B]" />
            <span>Turn an idea into a template</span>
          </div>

          <p className="text-xs text-[#524E46] leading-relaxed max-w-md font-sans">
            Describe what you want in your own words, and let inkFlow create a structured, reusable template for you.
          </p>

          <div>
            <button
              onClick={() => setAiModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3F5236] hover:bg-[#32422B] text-white text-xs font-semibold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Generate with AI</span>
            </button>
          </div>
        </div>

        {/* Stack of books & quill illustration */}
        <div className="w-full md:w-80 h-32 md:h-36 shrink-0 relative overflow-hidden rounded-xl">
          <ProceduralArt theme="books-quill" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Popular Templates Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-bold text-lg text-[#25251F]">
            Popular Templates
          </h2>
          <span className="text-xs text-[#706B62] font-mono">
            {filtered.length} {filtered.length === 1 ? 'template' : 'templates'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((tmpl) => {
            const Icon = tmpl.icon;
            return (
              <div
                key={tmpl.id}
                onClick={() => handleUseTemplate(tmpl)}
                className="group bg-[#FAF7F2] hover:bg-[#F3EEE5] border border-[#E3DDD3] hover:border-[#CCD8C2] rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#EFE9DF] group-hover:bg-[#E3DDD0] text-[#524E46] group-hover:text-[#25251F] flex items-center justify-center transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 text-[#8A847A] hover:text-[#25251F] rounded-lg transition-colors"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <h3 className="font-serif font-bold text-base text-[#25251F] group-hover:text-[#181814]">
                      {tmpl.title}
                    </h3>
                    <p className="text-xs text-[#6B665C] leading-relaxed mt-1 font-sans line-clamp-2">
                      {tmpl.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E8E2D7] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {tmpl.tags.map((tag) => (
                      <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#ECE5D8] text-[#555047]">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#8A847A] group-hover:text-[#25251F] group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* shadcn Dialog: AI Template Generator */}
      <Dialog open={aiModalOpen} onOpenChange={setAiModalOpen}>
        <DialogContent className="bg-[#FAF7F2] border border-[#DDD5C7] rounded-2xl max-w-lg w-full p-6 shadow-xl text-[#25251F]">
          <DialogHeader className="pb-2 border-b border-[#E8E2D7]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C77B5B]" />
              <DialogTitle className="font-serif font-bold text-base text-[#25251F]">
                Generate Template with AI
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-[#6B655A]">
              Describe what you want to write in your own words, and inkFlow will generate a structured, chaptered template.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleGenerateTemplateWithAI} className="space-y-4 text-xs pt-2">
            <div>
              <label className="block font-semibold text-[#403D37] mb-1">
                Describe your story idea or writing format
              </label>
              <textarea
                autoFocus
                rows={4}
                value={aiIdeaPrompt}
                onChange={(e) => setAiIdeaPrompt(e.target.value)}
                placeholder="e.g. A four-part gothic mystery set in a decaying cliffside conservatory, focusing on hidden heirlooms and ancient debts..."
                className="w-full p-3 rounded-xl bg-[#F4EFE6] border border-[#DDD5C7] text-xs text-[#25251F] placeholder-[#9E988D] focus:outline-none focus:border-[#3E5535] resize-none"
              />
            </div>

            <DialogFooter className="flex items-center justify-end gap-2 pt-2 bg-transparent border-none p-0">
              <button
                type="button"
                onClick={() => setAiModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#DDD5C7] text-[#615C53] hover:bg-[#ECE5D8] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!aiIdeaPrompt.trim() || isAIGenerating}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3F5236] hover:bg-[#32422B] text-white font-semibold shadow-xs disabled:opacity-40 transition-colors cursor-pointer"
              >
                {isAIGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Structuring with Ollama...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Create Template</span>
                  </>
                )}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
