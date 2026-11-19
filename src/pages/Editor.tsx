import React, { useState, useRef } from 'react';
import { useInkFlowStore } from '../store/useInkFlowStore';
import { ChapterNavigator } from '../components/editor/ChapterNavigator';
import { ManuscriptEditor } from '../components/editor/ManuscriptEditor';
import { AIPartner } from '../components/editor/AIPartner';
import { resolveModelForTask } from '../lib/modelRouter';
import { requestOllamaCompletion, parseOptionsFromAI } from '../lib/ollama';
import { parseSkillMarkdown } from '../lib/skillParser';

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
    generationMode,
    setContinuationSuggestions,
    setIsSuggestionsCardOpen,
    suggestionTaskType,
    setSuggestionTaskType,
    activeChapterTitle,
    activeProjectTitle
  } = useInkFlowStore();

  const [isLoading, setIsLoading] = useState(false);
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const editorInstanceRef = useRef<EditorHandle | null>(null);

  // Execute dynamic AI action reading directly from the manuscript
  const handleAIAction = async (task: 'continue' | 'rewrite' | 'expand' | 'brainstorm', customDirective?: string) => {
    setIsLoading(true);
    setActiveTask(task);
    setSuggestionTaskType(task);

    const routing = resolveModelForTask(selectedModel, task, availableModels);
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
    let prompt = '';
    if (isNewDraft) {
      if (task === 'continue') {
        if (generationMode === 'write-for-me') {
          prompt = `Project / Collection: "${activeProjectTitle}"
Story Title: "${activeChapterTitle}"
${customDirective ? `Directive: ${customDirective}` : ''}

Task: Write a complete, evocative opening narrative paragraph (around 80 to 140 words) that immediately establishes the mood, sensory setting, and opening tension of this story.
CRITICAL: Output ONLY the story paragraph itself. Do NOT include meta-commentary, introductory remarks, quotes, or labels.`;
        } else {
          prompt = `Project / Collection: "${activeProjectTitle}"
Story Title: "${activeChapterTitle}"
${customDirective ? `Directive: ${customDirective}` : ''}

Task: Write 2 to 3 distinct, evocative opening paragraph options (each around 50 to 90 words) to begin "${activeChapterTitle}".
Formatting: Number each option 1., 2., 3. on separate lines. Output only narrative prose without conversational remarks.`;
        }
      } else if (task === 'brainstorm') {
        prompt = `Project / Collection: "${activeProjectTitle}"
Story Title: "${activeChapterTitle}"
${customDirective ? `Directive: ${customDirective}` : ''}

Task: Suggest 4 imaginative premise ideas, plot hooks, or narrative directions for this story ("${activeChapterTitle}").
Formatting: Output each idea on a separate line starting with '- '. Be concise, vivid, and distinct.`;
      } else {
        prompt = `Story Title: "${activeChapterTitle}"
Collection: "${activeProjectTitle}"
Task: Suggest 2 to 3 rich opening variations for "${activeChapterTitle}".
Formatting: Number each variation 1., 2., 3.`;
      }
    } else {
      if (task === 'continue') {
        if (generationMode === 'write-for-me') {
          prompt = `Project: "${activeProjectTitle}"
Story Title: "${activeChapterTitle}"
Existing manuscript context:
"""
${lastExcerpt}
"""
${customDirective ? `Directive: ${customDirective}` : ''}

Task: Continue the story seamlessly from the exact point where the manuscript text ends. Write a full, immersive narrative paragraph (around 80 to 150 words) developing the immediate action and character perspective.
CRITICAL RULES:
1. NEVER repeat or summarize any words or sentences from the existing manuscript above.
2. Advance the narrative forward with new developments.
3. Output ONLY narrative prose for the new paragraph. No conversational remarks or quotes.`;
        } else {
          prompt = `Story Title: "${activeChapterTitle}"
Collection: "${activeProjectTitle}"
Recent manuscript context:
"""
${lastExcerpt}
"""
${customDirective ? `Directive: ${customDirective}` : ''}

Task: Suggest 2 to 3 distinct, compelling narrative continuation paragraphs (each around 50 to 90 words) for what happens next in this scene.
CRITICAL RULES:
1. NEVER repeat or echo sentences from the existing manuscript.
2. Provide each option on a new line starting with 1., 2., 3.
3. Output only story prose without conversational remarks.`;
        }
      } else if (task === 'rewrite') {
        prompt = `Story Title: "${activeChapterTitle}"
Manuscript passage to revise:
"""
${lastExcerpt}
"""
${customDirective ? `Directive: ${customDirective}` : 'Improve rhythm, sensory precision, and emotional resonance.'}

Task: Provide 2 to 3 alternative rewritten variations of this passage.
Formatting: Number each variation 1., 2., 3. Output only the revised prose.`;
      } else if (task === 'expand') {
        prompt = `Story Title: "${activeChapterTitle}"
Manuscript passage to expand:
"""
${lastExcerpt}
"""
${customDirective ? `Directive: ${customDirective}` : 'Add tactile sensory details, atmosphere, and character body language.'}

Task: Provide 2 expanded variations that deepen the scene with sensory immersion. Number each 1., 2.`;
      } else if (task === 'brainstorm') {
        prompt = `Project: "${activeProjectTitle}"
Story: "${activeChapterTitle}"
Current passage:
"""
${lastExcerpt}
"""
${customDirective ? `Directive: ${customDirective}` : ''}

Task: List 4 distinct, imaginative plot developments, conflict twists, or scene directions for what could happen next.
Formatting: Output each idea on a separate line starting with '- '.`;
      }
    }

    try {
      const rawResponse = await requestOllamaCompletion(
        routing.modelName, 
        prompt, 
        parsedSkill.compiledSystemPrompt
      );

      if (rawResponse) {
        if (task === 'brainstorm') {
          // Brainstorm: extract 3-4 clean ideas and display them directly in the editor!
          const lines = rawResponse
            .replace(/<think>[\s\S]*?<\/think>/gi, '')
            .split('\n')
            .map(l => l.replace(/^[-*•\d.]+\s*/, '').trim())
            .filter(l => l.length > 15 && !/^(here are|below are|i hope)/i.test(l))
            .slice(0, 4);

          const finalIdeas = lines.length > 0 ? lines : [
            `Introduce an unforeseen arrival that challenges the assumptions in ${activeChapterTitle}.`,
            `Reveal a hidden artifact or letter connecting to the central mystery.`,
            `Subvert expectations by having the ambient silence broken by an urgent summons.`
          ];

          setContinuationSuggestions(finalIdeas);
          setIsSuggestionsCardOpen(true);
        } else if (generationMode === 'write-for-me' && task === 'continue' && editorInstanceRef.current) {
          // Write for me mode: writes a full narrative paragraph directly into the editor
          const cleanParagraph = rawResponse
            .replace(/<think>[\s\S]*?<\/think>/gi, '')
            .replace(/^["']|["']$/g, '')
            .replace(/^(here is|here's|certainly|sure)[^\n]*\n+/i, '')
            .trim();

          // Strip any overlapping text
          const existing = editorInstanceRef.current.getText().trim();
          let insertText = cleanParagraph;
          const existingWords = existing.split(/\s+/);
          const newWords = insertText.split(/\s+/);
          for (let len = Math.min(existingWords.length, newWords.length, 14); len >= 3; len--) {
            const tail = existingWords.slice(-len).join(' ').toLowerCase();
            const head = newWords.slice(0, len).join(' ').toLowerCase();
            if (tail === head) {
              insertText = newWords.slice(len).join(' ').trim();
              break;
            }
          }

          if (insertText) {
            editorInstanceRef.current.commands.focus('end');
            editorInstanceRef.current.commands.insertContent(`<p>${insertText}</p>`);
          }
        } else {
          // Suggestion mode (Continue, Rewrite, Expand): present options in the editor
          const options = parseOptionsFromAI(rawResponse, activeProjectTitle);
          setContinuationSuggestions(options);
          setIsSuggestionsCardOpen(true);
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

  const generateContextualFallback = (task: string, lastExcerpt: string) => {
    const words = lastExcerpt.split(/\s+/).slice(-8).join(' ');
    if (task === 'brainstorm') {
      setContinuationSuggestions([
        `An unexpected observation related to "${words}" changes the stakes entirely.`,
        `A secondary character questions the certainty of the current direction.`,
        `The atmosphere shifts as an external signal demands an immediate choice.`
      ]);
      setIsSuggestionsCardOpen(true);
    } else {
      setContinuationSuggestions([
        `Taking a measured breath, the silence following "${words}" stretched into a quiet realization. Every detail in the room seemed to sharpen as the moment demanded a decisive step forward.`,
        `Looking toward the shadowed threshold, it became clear that returning was no longer an option. The cold night air carried with it the distant murmur of something stirring in the valley below.`
      ]);
      setIsSuggestionsCardOpen(true);
    }
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
          onRewrite={() => handleAIAction('rewrite')}
          onExpand={() => handleAIAction('expand')}
          onBrainstorm={() => handleAIAction('brainstorm')}
          isLoading={isLoading}
          activeTask={activeTask}
        />
      )}
    </div>
  );
};
