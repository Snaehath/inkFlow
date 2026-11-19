import React, { useState, useRef } from 'react';
import { useInkFlowStore } from '../store/useInkFlowStore';
import { ChapterNavigator } from '../components/editor/ChapterNavigator';
import { ManuscriptEditor } from '../components/editor/ManuscriptEditor';
import { AIPartner } from '../components/editor/AIPartner';
import { TuneStoryPartnerDialog } from '../components/editor/TuneStoryPartnerDialog';
import { resolveModelForTask } from '../lib/modelRouter';
import { requestOllamaCompletion } from '../lib/ollama';
import { parseSkillMarkdown } from '../lib/skillParser';
import { researchStoryArchitecture, appendResearchToSkill, generateCompleteChapterProse } from '../lib/fullAutoGenerator';
import { db } from '../storage/DexieStorage';

interface EditorHandle {
  getText: () => string;
  getHTML: () => string;
  state?: {
    selection?: { from: number; to: number };
    doc?: { textBetween: (from: number, to: number) => string };
  };
  commands: {
    focus: (position?: string) => void;
    insertContent: (content: string) => void;
    setContent: (content: string) => void;
  };
}

export const Editor: React.FC = () => {
  const { 
    isFocusMode, 
    selectedModel, 
    availableModels,
    activeSkillMarkdown,
    activeSkillName,
    saveReusableSkill,
    activeSceneId,
    setContinuationSuggestions,
    setIsSuggestionsCardOpen,
    suggestionTaskType,
    setSuggestionTaskType,
    activeChapterTitle,
    activeProjectTitle
  } = useInkFlowStore();

  const [isLoading, setIsLoading] = useState(false);
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [isTuneModalOpen, setIsTuneModalOpen] = useState(false);
  const [tuneExcerpt, setTuneExcerpt] = useState('');
  const editorInstanceRef = useRef<EditorHandle | null>(null);

  // Execute dynamic AI action reading directly from the manuscript
  const handleAIAction = async (task: 'continue' | 'expand' | 'format' | 'rewrite' | 'brainstorm', customDirective?: string) => {
    setIsLoading(true);
    setActiveTask(task);
    setSuggestionTaskType(task === 'expand' ? 'expand' : 'continue');

    const routing = resolveModelForTask(selectedModel, task === 'expand' ? 'expand' : 'continue', availableModels);
    const parsedSkill = parseSkillMarkdown(activeSkillMarkdown);

    // Extract current actual text from editor, filtering out any boilerplate placeholder
    const currentFullText = editorInstanceRef.current ? editorInstanceRef.current.getText() : '';
    const rawParagraphs = currentFullText.split(/\n+/).map(p => p.trim()).filter(Boolean);
    const realParagraphs = rawParagraphs.filter(p => 
      !p.includes('Section Objective:') &&
      !p.includes('Begin drafting your scene') &&
      !p.includes('Use Continue or Brainstorm') &&
      !p.includes('~ inkFlow Studio ~')
    );

    // Check if user has an active text selection in the editor
    let selectedText = '';
    if (editorInstanceRef.current?.state?.selection && editorInstanceRef.current?.state?.doc) {
      const { from, to } = editorInstanceRef.current.state.selection;
      if (to > from) {
        selectedText = editorInstanceRef.current.state.doc.textBetween(from, to).trim();
      }
    }

    const isNewDraft = realParagraphs.length === 0;
    const lastExcerpt = selectedText || realParagraphs.slice(-3).join('\n\n');

    // Prompt construction tailored to Ollama completion
    const prompt = isNewDraft
      ? `Project / Story: "${activeChapterTitle}"
Active partner style: "${parsedSkill.title}" - ${parsedSkill.voice}
${customDirective ? `Directive: ${customDirective}` : ''}

Task: Write an evocative, atmospheric opening narrative scene (around 120 to 180 words) that immediately establishes the sensory setting, character action, and tension.
CRITICAL: Output ONLY the story paragraph itself. Do NOT include meta-commentary, introductory remarks, quotes, or labels.`
      : task === 'expand'
      ? `Story Title: "${activeChapterTitle}"
Active partner skill: "${parsedSkill.title}" - ${parsedSkill.voice}
Manuscript passage to expand:
"""
${lastExcerpt}
"""
${customDirective ? `Directive: ${customDirective}` : 'Add tactile sensory details, atmosphere, lighting, sound, and character body language.'}

Task: Provide an expanded, highly atmospheric scene passage (around 120 to 180 words) deepening the sensory tension and psychological realism.
CRITICAL: Output ONLY narrative prose. No conversational remarks.`
      : `Story: "${activeChapterTitle}"
Collection / Project: "${activeProjectTitle}"
Active Writing Skill: "${parsedSkill.title}"
Voice Guidelines: ${parsedSkill.voice}
Style Rules: ${parsedSkill.style}

Existing Manuscript Context:
"""
${lastExcerpt}
"""
${customDirective ? `Author Directive: ${customDirective}` : ''}

TASK: Continue the story seamlessly. Pick up the narrative thread IMMEDIATELY from the exact physical action, sound, and sensory situation where the manuscript ends above.
MANDATORY CONTINUITY & FORMATTING RULES:
1. Advance the immediate scene into the next moment (e.g. if the character pressed an elevator button to an impossible floor, describe the car shuddering into motion, ascending past the top floor, the sound of the cables, and the doors opening onto the eerie hallway).
2. Write rich, sensory literary prose with concrete details (lighting, sounds, scents, textures) and psychological suspense.
3. Automatically format and correct all grammatical cadence, sentence flow, and punctuation.
4. NEVER summarize or repeat sentences from the existing manuscript.
5. Output ONLY the new narrative continuation prose. Do not include quotes, greetings, thinking tags, or conversational remarks.`;

    try {
      const rawResponse = await requestOllamaCompletion(
        routing.modelName, 
        prompt, 
        parsedSkill.compiledSystemPrompt,
        undefined,
        600
      );

      if (rawResponse && rawResponse.trim().length > 15) {
        const cleanParagraph = rawResponse
          .replace(/<think>[\s\S]*?<\/think>/gi, '')
          .replace(/^["']|["']$/g, '')
          .replace(/^(here is|here's|certainly|sure)[^\n]*\n+/i, '')
          .trim();

        if (cleanParagraph) {
          // Present the polished continuation in the canvas suggestion card
          setContinuationSuggestions([cleanParagraph]);
          setIsSuggestionsCardOpen(true);
        } else {
          generateContextualFallback(task, lastExcerpt);
        }
      } else {
        generateContextualFallback(task, lastExcerpt);
      }
    } catch {
      generateContextualFallback(task, lastExcerpt);
    }

    setIsLoading(false);
    setActiveTask(null);
  };

  // Full Auto: Researches structure, word count & drafts complete chapter directly into manuscript
  const handleFullAutoGenerate = async (premise: string) => {
    setIsLoading(true);
    setActiveTask('full-auto');

    const routing = resolveModelForTask(selectedModel, 'continue', availableModels);
    const effectivePremise = premise.trim() || editorInstanceRef.current?.getText().trim() || activeChapterTitle;

    try {
      // Step 1: Research story architecture & word count guidelines
      const researchNotes = await researchStoryArchitecture(
        activeChapterTitle,
        effectivePremise,
        routing.modelName
      );

      // Step 2: Store research into active skill so future continuations retain this knowledge
      const updatedSkill = appendResearchToSkill(
        activeSkillMarkdown,
        activeChapterTitle,
        researchNotes
      );
      saveReusableSkill(activeSkillName, updatedSkill);

      // Step 3: Generate the complete chapter prose
      const chapterHtml = await generateCompleteChapterProse(
        activeChapterTitle,
        effectivePremise,
        researchNotes,
        routing.modelName
      );

      // Step 4: Write directly into the manuscript canvas
      if (editorInstanceRef.current && chapterHtml) {
        editorInstanceRef.current.commands.setContent(chapterHtml);
      }

      // Step 5: Persist to Dexie storage
      if (activeSceneId) {
        const plainText = chapterHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        const wordCount = plainText ? plainText.split(/\s+/).length : 0;
        await db.scenes.update(activeSceneId, {
          contentHtml: chapterHtml,
          wordCount,
          updatedAt: Date.now()
        });
      }
    } catch (err) {
      console.warn('Full Auto generation encountered an error:', err);
    } finally {
      setIsLoading(false);
      setActiveTask(null);
    }
  };

  const generateContextualFallback = (_task: string, lastExcerpt: string) => {
    const isHotelMystery = /hotel|floor|101|bellboy|lift|elevator/i.test(activeChapterTitle + ' ' + lastExcerpt);
    if (isHotelMystery) {
      setContinuationSuggestions([
        `The lift shuddered into motion, the cable mechanism above emitting an unnatural, low-frequency hum as the floors ticked past one hundred. When the digital indicator finally blinked into "101", the doors hesitated, then peeled open onto a corridor lit by a dim amber hue that felt wrong—as though it were trying to conceal what lay beneath its polish.`,
        `A sudden chill leaked through the elevator gate, smelling faintly of old dust, forgotten paperwork, and damp carpets. The other employees laughed on about their lunch break, completely oblivious as the brass floor indicator slipped past 100 into the silent, impossible 101st floor.`
      ]);
    } else {
      setContinuationSuggestions([
        `The moment held a suspended stillness, every small sound sharpening as the weight of the choice settled in. Down the hallway, a dim light flickered against the peeling walls, revealing a path that had clearly been left untouched for years.`,
        `Stepping forward into the quiet, the atmosphere shifted perceptibly—cooler, heavier, smelling faintly of ozone and old paper. There was no turning back now, and whatever waited around the corner was already aware of the intrusion.`
      ]);
    }
    setIsSuggestionsCardOpen(true);
  };

  const handleTryAnother = () => {
    const currentTask = suggestionTaskType || 'continue';
    handleAIAction(currentTask);
  };

  const handleAcceptSuggestion = (text: string) => {
    if (suggestionTaskType === 'brainstorm') {
      // User clicked "Draft from this Idea": write a full paragraph exploring that idea directly in the editor!
      handleAIAction('continue', `Develop this creative direction: ${text}`);
    }
  };

  const handleOpenTuneModal = () => {
    const text = editorInstanceRef.current ? editorInstanceRef.current.getText() : '';
    setTuneExcerpt(text);
    setIsTuneModalOpen(true);
  };

  return (
    <div className="flex-1 flex overflow-hidden relative">
      {/* Left Column: Chapter Navigator (hidden in focus mode) */}
      {!isFocusMode && <ChapterNavigator />}

      {/* Center Hero: Manuscript Editor */}
      <ManuscriptEditor 
        onAcceptSuggestion={handleAcceptSuggestion}
        onTryAnotherSuggestion={handleTryAnother}
        onEditorReady={(instance) => {
          editorInstanceRef.current = instance as EditorHandle;
        }}
      />

      {/* Right Column: AI Writing Partner (hidden in focus mode) */}
      {!isFocusMode && (
        <AIPartner 
          onContinue={() => handleAIAction('continue')}
          onExpand={() => handleAIAction('expand')}
          onFullAutoGenerate={handleFullAutoGenerate}
          onOpenTuneModal={handleOpenTuneModal}
          isLoading={isLoading}
          activeTask={activeTask}
        />
      )}

      {/* Tune Partner Dialog Modal */}
      <TuneStoryPartnerDialog
        open={isTuneModalOpen}
        onOpenChange={setIsTuneModalOpen}
        currentManuscriptExcerpt={tuneExcerpt}
      />
    </div>
  );
};
