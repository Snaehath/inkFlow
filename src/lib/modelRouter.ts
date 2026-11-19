export type TaskType = 'continue' | 'rewrite' | 'expand' | 'brainstorm' | 'suggest' | 'write-for-me';

export interface ModelRouteOption {
  id: string;
  label: string;
  description: string;
  isAuto: boolean;
  recommendedTask?: TaskType;
}

export function buildDynamicModelOptions(installedModels: string[]): ModelRouteOption[] {
  // Filter out exempt models (granite, ministral)
  const allowedModels = installedModels.filter(m => !/granite|ministral/i.test(m));

  const options: ModelRouteOption[] = [
    {
      id: 'auto-route',
      label: 'Auto (Task Router)',
      description: 'Automatically routes to the best installed Ollama model for each writing task',
      isAuto: true
    }
  ];

  if (allowedModels.length === 0) {
    options.push({
      id: 'waiting-ollama',
      label: 'Waiting for Ollama...',
      description: 'Run `ollama serve` to connect local models',
      isAuto: false
    });
    return options;
  }

  for (const model of allowedModels) {
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
  // Filter out exempt models (granite, ministral)
  const allowed = availableLocalModels.filter(m => !/granite|ministral/i.test(m));

  // If no models available yet
  if (allowed.length === 0) {
    return {
      modelName: 'gemma-writer:latest',
      routingReason: 'Default fallback (Ollama connecting)',
      isAuto: true
    };
  }

  // If user specifically picked a manual local model that is present, honor it directly
  if (!currentSelection.startsWith('Auto') && allowed.includes(currentSelection)) {
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
      const creativeMatch = allowed.find(m => /writer|fable|creative/i.test(m))
        || allowed.find(m => /qwen/i.test(m))
        || allowed.find(m => /gemma/i.test(m))
        || allowed[0];

      return {
        modelName: creativeMatch,
        routingReason: `Auto-routed to ${creativeMatch} (Best for creative narrative & sensory detail)`,
        isAuto: true
      };
    }

    case 'rewrite':
    case 'expand': {
      // Prioritize precision / editorial models like llama, qwen, gemma
      const editorialMatch = allowed.find(m => /llama/i.test(m))
        || allowed.find(m => /qwen/i.test(m))
        || allowed.find(m => /writer|fable/i.test(m))
        || allowed[0];

      return {
        modelName: editorialMatch,
        routingReason: `Auto-routed to ${editorialMatch} (Tuned for syntactic precision and restructuring)`,
        isAuto: true
      };
    }

    case 'brainstorm': {
      // Prioritize divergent lateral thinking models
      const brainstormMatch = allowed.find(m => /fable/i.test(m))
        || allowed.find(m => /qwen/i.test(m))
        || allowed.find(m => /writer/i.test(m))
        || allowed[0];

      return {
        modelName: brainstormMatch,
        routingReason: `Auto-routed to ${brainstormMatch} (Optimized for lateral exploration and plot twists)`,
        isAuto: true
      };
    }

    default:
      return {
        modelName: allowed[0],
        routingReason: `Auto-routed to ${allowed[0]}`,
        isAuto: true
      };
  }
}
