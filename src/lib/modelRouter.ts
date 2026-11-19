export type TaskType = 'continue' | 'rewrite' | 'expand' | 'brainstorm' | 'suggest' | 'write-for-me';

export interface ModelRouteOption {
  id: string;
  label: string;
  description: string;
  isAuto: boolean;
  recommendedTask?: TaskType;
}

export function buildDynamicModelOptions(installedModels: string[]): ModelRouteOption[] {
  const options: ModelRouteOption[] = [
    {
      id: 'auto-route',
      label: 'Auto (Task Router)',
      description: 'Automatically routes to the best installed Ollama model for each writing task',
      isAuto: true
    }
  ];

  if (installedModels.length === 0) {
    options.push({
      id: 'waiting-ollama',
      label: 'Waiting for Ollama...',
      description: 'Run `ollama serve` to connect local models',
      isAuto: false
    });
    return options;
  }

  for (const model of installedModels) {
    const isCreative = /writer|fable|novel|story|qwen/i.test(model);
    const isFast = /3b|4b|mini/i.test(model);
    
    let desc: string;
    if (isCreative) {
      desc = 'Specialized for literary cadence & narrative prose';
    } else if (isFast) {
      desc = 'Fast local inference for immediate drafting & edits';
    } else {
      desc = 'Local instruction-tuned model';
    }

    options.push({
      id: model,
      label: model,
      description: desc,
      isAuto: false
    });
  }

  return options;
}

export function resolveModelForTask(
  currentSelection: string,
  taskType: TaskType,
  availableLocalModels: string[]
): { modelName: string; routingReason: string; isAuto: boolean } {
  // If no models available yet
  if (availableLocalModels.length === 0) {
    return {
      modelName: 'gemma-writer:latest',
      routingReason: 'Default fallback (Ollama connecting)',
      isAuto: true
    };
  }

  // If user specifically picked a manual local model that is present, honor it directly
  if (!currentSelection.startsWith('Auto') && availableLocalModels.includes(currentSelection)) {
    return {
      modelName: currentSelection,
      routingReason: `Manual selection: ${currentSelection}`,
      isAuto: false
    };
  }

  // Auto-routing based on task matching the user's REAL installed models
  switch (taskType) {
    case 'continue':
    case 'suggest':
    case 'write-for-me': {
      // Prioritize creative writer models like gemma-writer, fable, qwen
      const creativeMatch = availableLocalModels.find(m => /writer|fable|creative/i.test(m))
        || availableLocalModels.find(m => /qwen/i.test(m))
        || availableLocalModels.find(m => /gemma/i.test(m))
        || availableLocalModels[0];

      return {
        modelName: creativeMatch,
        routingReason: `Auto-routed to ${creativeMatch} (Best for creative narrative & sensory detail)`,
        isAuto: true
      };
    }

    case 'rewrite':
    case 'expand': {
      // Prioritize precision / editorial models like granite, llama, ministral
      const editorialMatch = availableLocalModels.find(m => /granite|llama|ministral/i.test(m))
        || availableLocalModels.find(m => /qwen/i.test(m))
        || availableLocalModels[0];

      return {
        modelName: editorialMatch,
        routingReason: `Auto-routed to ${editorialMatch} (Tuned for syntactic precision and restructuring)`,
        isAuto: true
      };
    }

    case 'brainstorm': {
      // Prioritize divergent lateral thinking models
      const brainstormMatch = availableLocalModels.find(m => /ministral|fable/i.test(m))
        || availableLocalModels.find(m => /qwen/i.test(m))
        || availableLocalModels[0];

      return {
        modelName: brainstormMatch,
        routingReason: `Auto-routed to ${brainstormMatch} (Optimized for lateral exploration and plot twists)`,
        isAuto: true
      };
    }

    default:
      return {
        modelName: availableLocalModels[0],
        routingReason: `Auto-routed to ${availableLocalModels[0]}`,
        isAuto: true
      };
  }
}
