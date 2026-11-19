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
  commands: {
    focus: (position?: string) => void;
    insertContent: (content: string) => void;
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
    activeChapterTitle,
    activeProjectTitle
  } = useInkFlowStore();

  const [isLoading, setIsLoading] = useState(false);
  const [brainstormIdeas, setBrainstormIdeas] = useState<string[]>([]);
  const editorInstanceRef = useRef<EditorHandle | null>(null);

  // Execute dynamic AI action using real Ollama inference and manuscript context
  const handleAIAction = async (task: 'continue' | 'rewrite' | 'expand' | 'brainstorm', instruction?: string) => {
    setIsLoading(true);

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

    const isNewDraft = realParagraphs.length === 0;
    const lastExcerpt = realParagraphs.slice(-3).join('\n\n');

    // Prompt construction tailored to Ollama completion
    let prompt = '';
    if (isNewDraft) {
      if (task === 'continue') {
        prompt = `Project / Collection: "${activeProjectTitle}"
Story Title: "${activeChapterTitle}"
${instruction ? `Writer directive: ${instruction}` : ''}

Task: Write the opening of this story. Suggest 2 to 3 distinct, evocative opening sentences or opening paragraphs to begin "${activeChapterTitle}".
Formatting: Provide each option on a new line starting with 1., 2., 3. Output only narrative prose without conversational remarks.`;
      } else if (task === 'brainstorm') {
        prompt = `Project / Collection: "${activeProjectTitle}"
Story Title: "${activeChapterTitle}"
${instruction ? `Writer directive: ${instruction}` : ''}

Task: Suggest 4 imaginative premise ideas, twists, or narrative directions for this story ("${activeChapterTitle}").
Formatting: Output each idea on a separate line starting with '- '.`;
      } else {
        prompt = `Story Title: "${activeChapterTitle}"
Collection: "${activeProjectTitle}"
${instruction ? `Writer directive: ${instruction}` : ''}
Task: Suggest 2 to 3 rich opening variations for "${activeChapterTitle}".
Formatting: Number each variation 1., 2., 3.`;
      }
    } else {
      if (task === 'continue') {
        prompt = `Story Title: "${activeChapterTitle}"
Collection: "${activeProjectTitle}"
Recent manuscript context:
"""
${lastExcerpt}
"""
${instruction ? `Writer directive: ${instruction}` : ''}

Task: Suggest 2 to 3 concise, distinct narrative continuation options for what happens next in this scene.
Formatting: Provide each option on a new line starting with 1., 2., 3. Output only story prose without conversational remarks.`;
      } else if (task === 'rewrite') {
        prompt = `Story Title: "${activeChapterTitle}"
Manuscript passage to revise:
"""
${lastExcerpt}
"""
${instruction ? `Writer directive: ${instruction}` : 'Improve rhythm, sensory precision, and emotional resonance.'}

Task: Provide 2 to 3 alternative rewritten variations.
Formatting: Number each variation 1., 2., 3. Output only the revised prose.`;
      } else if (task === 'expand') {
        prompt = `Story Title: "${activeChapterTitle}"
Manuscript passage to expand:
"""
${lastExcerpt}
"""
${instruction ? `Writer directive: ${instruction}` : 'Add tactile sensory details, atmosphere, and character body language.'}

Task: Provide 2 expanded variations that deepen the scene. Number each 1., 2.`;
      } else if (task === 'brainstorm') {
        prompt = `Project: "${activeProjectTitle}"
Story: "${activeChapterTitle}"
Current passage:
"""
${lastExcerpt}
"""
${instruction ? `Writer directive: ${instruction}` : ''}

Task: List 4 distinct, imaginative plot developments, conflict twists, or scene directions.
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
          const lines = rawResponse
            .split('\n')
            .map(l => l.replace(/^[-*•\d.]+\s*/, '').trim())
            .filter(l => l.length > 10)
            .slice(0, 4);

          setBrainstormIdeas(lines.length > 0 ? lines : [
            `Introduce an unforeseen arrival that challenges the assumptions in ${activeChapterTitle}.`,
            `Reveal a hidden artifact or letter connecting to the central mystery.`,
            `Subvert expectations by having the ambient silence broken by an urgent summons.`
          ]);
        } else {
          const options = parseOptionsFromAI(rawResponse, activeProjectTitle);

          if (generationMode === 'write-for-me' && task === 'continue' && editorInstanceRef.current) {
            // Direct insertion mode
            const chosenText = options[0] || rawResponse;
            editorInstanceRef.current.commands.focus('end');
            editorInstanceRef.current.commands.insertContent(` ${chosenText}`);
          } else {
            // Suggestion mode: present options for writer review
            setContinuationSuggestions(options);
            setIsSuggestionsCardOpen(true);
          }
        }
      } else {
        // Dynamic contextual fallback based on user's actual document words
        generateContextualFallback(task, lastExcerpt);
      }
    } catch {
      generateContextualFallback(task, lastExcerpt);
    }

    setIsLoading(false);
  };

  const generateContextualFallback = (task: string, lastExcerpt: string) => {
    const words = lastExcerpt.split(/\s+/).slice(-8).join(' ');
    if (task === 'brainstorm') {
      setBrainstormIdeas([
        `An unexpected observation related to "${words}" changes the stakes.`,
        `A secondary character questions the certainty of the current direction.`,
        `The atmosphere shifts as an external signal demands an immediate choice.`
      ]);
    } else {
      setContinuationSuggestions([
        `Taking a measured breath, the silence following "${words}" stretched into a quiet realization.`,
        `Every detail in the room seemed to sharpen as the moment demanded a decisive step forward.`,
        `Looking toward the shadowed threshold, it became clear that returning was no longer an option.`
      ]);
      setIsSuggestionsCardOpen(true);
    }
  };

  const handleTryAnother = () => {
    handleAIAction('continue');
  };

  return (
    <div className="flex-1 flex overflow-hidden relative">
      {/* Left Column: Chapter Navigator (hidden in focus mode) */}
      {!isFocusMode && <ChapterNavigator />}

      {/* Center Hero: Manuscript Editor */}
      <ManuscriptEditor 
        onAcceptSuggestion={() => {}}
        onTryAnotherSuggestion={handleTryAnother}
        onEditorReady={(instance) => {
          editorInstanceRef.current = instance as EditorHandle;
        }}
      />

      {/* Right Column: AI Writing Partner (hidden in focus mode) */}
      {!isFocusMode && (
        <AIPartner 
          onContinue={(inst) => handleAIAction('continue', inst)}
          onRewrite={(inst) => handleAIAction('rewrite', inst)}
          onExpand={(inst) => handleAIAction('expand', inst)}
          onBrainstorm={(inst) => handleAIAction('brainstorm', inst)}
          isLoading={isLoading}
          brainstormIdeas={brainstormIdeas}
        />
      )}
    </div>
  );
};
