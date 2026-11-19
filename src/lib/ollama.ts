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
          // Filter out pure embedding models and exempt models (granite, ministral)
          const isNotEmbedding = !caps.includes('embedding') || caps.includes('completion');
          const isAllowedModel = !/granite|ministral/i.test(m.name);
          return isNotEmbedding && isAllowedModel;
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
  baseUrl = 'http://localhost:11434',
  numPredict = 700
): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000); // 90s timeout for local model warm-up and generation
    const res = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        system: systemPrompt,
        stream: false,
        options: {
          temperature: 0.75,
          top_p: 0.9,
          repeat_penalty: 1.18,
          num_predict: numPredict,
        }
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.response) {
        const text = data.response.trim();
        // If text contains thinking blocks, strip them
        const stripped = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
        if (stripped) {
          return stripped;
        }
        // If model only outputted inside think tags, strip the tags themselves and salvage the prose
        const insideThink = text.replace(/<\/?think>/gi, '').trim();
        return insideThink || text;
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

  // 2. Remove conversational headers/intros
  cleaned = cleaned.replace(/^(here are|here is|okay,|sure|certainly|i hope|to help me|what are|below are|as requested)[^\n]*\n+/i, '').trim();

  // 3. Remove markdown bold option labels like **Option 1:** or Option 1:
  cleaned = cleaned
    .replace(/\*\*(Option|Choice|Variation)\s*\d+[^:]*:\*\*/gi, '')
    .replace(/(Option|Choice|Variation)\s*\d+[^:]*:/gi, '');

  // 4. Split by numbered markers (e.g. 1., 2., 3. or **1.**, **2.**)
  const regexNumbered = /(?:^|\n+)(?:\*{0,2}\d+[.:)]\*{0,2}|[-*•])\s+/g;
  const parts = cleaned.split(regexNumbered).map(p => p.trim()).filter(Boolean);

  const options: string[] = [];
  if (parts.length > 1) {
    for (const part of parts) {
      const cleanPart = part
        .replace(/^["']|["']$/g, '')
        .replace(/\n+/g, ' ')
        .trim();
      if (cleanPart.length > 20 && !/^(here are|i hope|let me know)/i.test(cleanPart)) {
        options.push(cleanPart);
      }
    }
  }

  if (options.length > 0) {
    return options.slice(0, 3);
  }

  // Fallback to line-based parsing
  const lines = cleaned.split(/\n+/)
    .map(line => line.trim())
    .filter(Boolean)
    .filter(line => !/^(here are|here is|okay,|sure|certainly|i hope|to help me|what are|what kind|below are|as requested)/i.test(line));

  for (const line of lines) {
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

  if (cleaned.length > 15) {
    return [cleaned.replace(/^["']|["']$/g, '').trim()];
  }

  return [
    `${fallbackSubject} paused, listening to the ambient silence settle into the room.`,
    `A subtle shift in the air signaled that something had changed just beyond view.`
  ];
}
