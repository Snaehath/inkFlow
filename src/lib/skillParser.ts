export interface ParsedSkill {
  title: string;
  summary: string;
  behaviors: string[];
  suggestedModel: string;
  samplePrompt: string;
  voice: string;
  style: string;
  whenHelping: string;
  compiledSystemPrompt: string;
}

export interface SkillItem {
  id: string;
  name: string;
  category: 'Fiction' | 'Voice' | 'Dialogue' | 'Non-Fiction' | 'Communication' | 'Custom';
  summary: string;
  markdown: string;
  isPreset?: boolean;
}

export function parseSkillMarkdown(markdown: string): ParsedSkill {
  const lines = markdown.split('\n');
  let title = 'Custom Writing Partner';
  let voice = '';
  let style = '';
  let whenHelping = '';
  
  let currentSection = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ')) {
      title = trimmed.replace(/^#\s+/, '').trim();
    } else if (trimmed.startsWith('## ')) {
      currentSection = trimmed.replace(/^##\s+/, '').toLowerCase();
    } else if (trimmed.length > 0) {
      if (currentSection.includes('voice')) {
        voice += (voice ? ' ' : '') + trimmed;
      } else if (currentSection.includes('style')) {
        style += (style ? ' ' : '') + trimmed;
      } else if (currentSection.includes('help')) {
        whenHelping += (whenHelping ? ' ' : '') + trimmed;
      }
    }
  }

  // Derive behaviors dynamically or default to high-integrity partner rules
  const behaviors: string[] = [];
  if (whenHelping.toLowerCase().includes('option') || whenHelping.toLowerCase().includes('suggest')) {
    behaviors.push('Suggest first');
  } else {
    behaviors.push('Contextual suggestions');
  }

  if (voice.length > 0 || style.length > 0) {
    behaviors.push('Preserve my voice');
  } else {
    behaviors.push('Adaptive tone');
  }

  if (style.toLowerCase().includes('avoid') || style.toLowerCase().includes('restrain') || whenHelping.toLowerCase().includes('before drafting')) {
    behaviors.push('No unsolicited rewrites');
  } else {
    behaviors.push('Non-intrusive collaborator');
  }

  // Derive concise summary
  let summary = 'Atmospheric, restrained, sensory.';
  if (voice || style) {
    const combined = `${voice} ${style}`.toLowerCase();
    if (combined.includes('tension') || combined.includes('sensory') || combined.includes('quiet')) {
      summary = 'Atmospheric, restrained, sensory.';
    } else if (combined.includes('direct') || combined.includes('clarity') || combined.includes('concise')) {
      summary = 'Clear, concise, direct tone.';
    } else if (combined.includes('humor') || combined.includes('witty') || combined.includes('banter')) {
      summary = 'Witty, vibrant, rhythmic dialogue.';
    } else if (combined.includes('world') || combined.includes('texture') || combined.includes('architecture')) {
      summary = 'Immersive, grounded, tactile worldbuilding.';
    } else {
      const words = (voice || style).split(/[,.]/).filter(Boolean);
      summary = words.slice(0, 3).map(w => w.trim()).filter(Boolean).join(', ') || 'Attentive creative collaborator.';
    }
  }

  let samplePrompt = '"Make this feel like literary mystery, not horror."';
  if (title.toLowerCase().includes('email') || title.toLowerCase().includes('dispatch')) {
    samplePrompt = '"Draft a gentle follow-up without sounding pushy."';
  } else if (title.toLowerCase().includes('blog') || title.toLowerCase().includes('essay')) {
    samplePrompt = '"Give this opening paragraph a punchier craft hook."';
  } else if (title.toLowerCase().includes('dialogue')) {
    samplePrompt = '"Sharpen the banter between both characters."';
  } else if (title.toLowerCase().includes('world')) {
    samplePrompt = '"Ground this street scene in tactile sensory details."';
  }

  const compiledSystemPrompt = `You are inkFlow, an AI-native writing studio partner acting under the skill: "${title}".
CRITICAL DIRECTIVE: You are a creative collaborator sitting beside the author, NOT a chatbot taking over the manuscript.
Voice guidelines: ${voice || 'Natural, literary, attentive.'}
Style guidelines: ${style || 'Precise prose, avoid cliché and melodrama.'}
Interaction rules: ${whenHelping || 'Offer succinct continuation options, respect author cadence, never rewrite without approval.'}`;

  return {
    title,
    summary,
    behaviors,
    suggestedModel: 'Auto (Task Router)',
    samplePrompt,
    voice,
    style,
    whenHelping,
    compiledSystemPrompt
  };
}

export const DEFAULT_SKILL_MARKDOWN = `# Atmospheric Fiction Partner

## Voice
Write with quiet tension, sensory details, and restrained emotion. Balance atmospheric observation with subtle character interiority.

## Style
Prefer precise, tactile language. Avoid clichés, melodrama, and generic filler. Keep sentences rhythmic and balanced between concrete description and emotional restraint.

## When helping
Offer 2-3 continuation options before drafting a full paragraph. Always preserve the author's pacing, voice, and never alter established narrative facts.

## How to use this skill
- **Natural-Language Persona:** This Markdown document directly defines how your AI collaborator thinks, writes, and assists.
- **## Voice:** Sets the tone, mood, vocabulary, and psychological depth of suggestions.
- **## Style:** Governs sentence length, cadence, imagery style, and what words or tropes to avoid.
- **## When helping:** Dictates interaction rules (e.g., provide 2-3 bulleted options, avoid unsolicited rewrites, preserve pacing).
- **Session vs Reusable:** Click "Apply to session" to guide your current manuscript, or "Save as reusable skill" to keep it in your library.
`;

export const PRESET_SKILLS: SkillItem[] = [
  {
    id: 'skill-atmospheric',
    name: 'Atmospheric Fiction',
    category: 'Fiction',
    summary: 'Quiet tension, sensory details, and restrained emotion with complete how-to instructions',
    isPreset: true,
    markdown: DEFAULT_SKILL_MARKDOWN
  }
];

export const NEW_SKILL_TEMPLATE = `# Untitled Writing Partner

## Voice
Describe the narrative voice, tone, emotional register, and pacing...

## Style
Specify sentence structure preferences, word choice, and stylistic constraints...

## When helping
Define rules for how the partner should suggest continuations, give feedback, or assist...
`;
