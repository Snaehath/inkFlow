export interface OllamaModelDetail {
  name: string;
  displayName: string;
  parameterSize: string;
  family: string;
  isEmbeddingOnly: boolean;
  isCreative: boolean;
}

export interface OllamaStatusResult {
  connected: boolean;
  models: OllamaModelDetail[];
  rawNames: string[];
}

interface RawOllamaModel {
  name: string;
  capabilities?: string[];
  details?: {
    parameter_size?: string;
    family?: string;
  };
}

export async function checkOllamaConnection(baseUrl = 'http://localhost:11434'): Promise<OllamaStatusResult> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${baseUrl}/api/tags`, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const rawList: RawOllamaModel[] = data.models || [];
      
      const filtered: OllamaModelDetail[] = rawList
        .filter((m: RawOllamaModel) => {
          const caps = m.capabilities || [];
          // Filter out pure embedding models
          return !caps.includes('embedding') || caps.includes('completion');
        })
        .map((m: RawOllamaModel) => {
          const name = m.name;
          const param = m.details?.parameter_size || '';
          const family = m.details?.family || '';
          const cleanName = name.replace(/:latest$/, '');
          const isCreative = /writer|fable|story|novel|creative|qwen|gemma/i.test(name);

          return {
            name,
            displayName: param ? `${cleanName} (${param})` : cleanName,
            parameterSize: param,
            family,
            isEmbeddingOnly: false,
            isCreative
          };
        });

      return {
        connected: true,
        models: filtered,
        rawNames: filtered.map(m => m.name)
      };
    }
  } catch {
    // Offline
  }

  return {
    connected: false,
    models: [],
    rawNames: []
  };
}

export async function requestOllamaCompletion(
  model: string,
  prompt: string,
  systemPrompt?: string,
  baseUrl = 'http://localhost:11434'
): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout for local model warm-up and generation
    const res = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        system: systemPrompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
        }
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.response) {
        return data.response.trim();
      }
    }
  } catch (err) {
    console.warn('Ollama local generation error:', err);
  }

  return '';
}

/**
 * Cleanly parse multi-line AI responses into individual options
 */
export function parseOptionsFromAI(raw: string, fallbackSubject = 'The character'): string[] {
  if (!raw) return [];

  // 1. Remove thinking model reasoning blocks (<think>...</think>) from Qwen, Fable, DeepSeek
  let cleaned = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // 2. Remove markdown bold option labels like **Option 1:** or Option 1:
  cleaned = cleaned
    .replace(/\*\*(Option|Choice|Variation)\s*\d+[^:]*:\*\*/gi, '')
    .replace(/(Option|Choice|Variation)\s*\d+[^:]*:/gi, '');

  const lines = cleaned.split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    // Filter out conversational questions or introductions
    .filter(line => !/^(here are|here is|okay,|sure|certainly|i hope|to help me|what are|what kind|below are|as requested)/i.test(line));

  const options: string[] = [];

  for (const line of lines) {
    // Clean leading numbers, bold numbers, dashes, quotes (e.g. **1.**, **1:**, 1., 1), - )
    const stripped = line
      .replace(/^\*?\*?\d+[.:)]\*?\*?\s*/, '')
      .replace(/^[-*•]\s*/, '')
      .replace(/^["']|["']$/g, '')
      .trim();

    if (stripped.length > 20) {
      options.push(stripped);
    }
  }

  if (options.length > 0) {
    return options.slice(0, 3);
  }

  // If a single paragraph was returned without numbering
  if (cleaned.length > 15) {
    return [cleaned.replace(/^["']|["']$/g, '')];
  }

  return [
    `${fallbackSubject} paused, listening to the ambient silence settle into the room.`,
    `A subtle shift in the air signaled that something had changed just beyond view.`
  ];
}
