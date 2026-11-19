import { useCallback } from 'react';
import { useInkFlowStore } from '../store/useInkFlowStore';
import { resolveModelForTask, type TaskType } from '../lib/modelRouter';
import { requestOllamaCompletion } from '../lib/ollama';

export function useWritingSession() {
  const store = useInkFlowStore();

  const triggerAIAction = useCallback(async (task: TaskType, customInstruction?: string) => {
    store.setIsAIActionRunning(true);
    const routing = resolveModelForTask(store.selectedModel, task, store.availableModels);

    const systemPrompt = `You are inkFlow, an attentive writing collaborator obeying this session skill:
${store.activeSkillMarkdown}
Current task: ${task}.
Ensure all suggestions respect author cadence and avoid melodrama.`;

    let result = '';
    try {
      result = await requestOllamaCompletion(routing.modelName, customInstruction || `Assist with ${task}`, systemPrompt);
    } catch {
      // Fallback
    }

    store.setIsAIActionRunning(false);
    return { result, routing };
  }, [store]);

  return {
    ...store,
    triggerAIAction,
  };
}
