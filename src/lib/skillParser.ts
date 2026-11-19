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
Write with quiet tension, sensory details, and restrained emotion.

## Style
Prefer precise language. Avoid clichés and melodrama. Keep sentences balanced between observational clarity and character intimacy.

## When helping
Offer 2-3 continuation options before drafting a full paragraph. Always preserve the author's pacing and never alter established facts.

## How to use this skill
- Edit any section of this Markdown to immediately change how your AI writing partner behaves.
- ## Voice defines the tone, mood, and vocabulary used in suggestions.
- ## Style defines sentence structure, rhythm, and what tropes or melodrama to avoid.
- ## When helping sets generation rules (e.g. bullet ideas vs full prose).
- Click 'Apply to session' to activate for your current document, or 'Save as reusable skill' to keep for future projects.
`;

export const PRESET_SKILLS: SkillItem[] = [
  {
    id: 'skill-atmospheric',
    name: 'Atmospheric Fiction',
    category: 'Fiction',
    summary: 'Restrained, sensory tension and quiet prose',
    isPreset: true,
    markdown: `# Atmospheric Fiction Partner

## Voice
Write with quiet tension, sensory details, and restrained emotion.

## Style
Prefer precise language. Avoid clichés and melodrama.

## When helping
Offer 2-3 continuation options before drafting a full paragraph.
`
  },
  {
    id: 'skill-worldbuilder',
    name: 'Sensory Worldbuilder',
    category: 'Voice',
    summary: 'Tactile architecture, weather, and physical detail',
    isPreset: true,
    markdown: `# Sensory Worldbuilder

## Voice
Vivid, immersive, grounded in textures, sounds, weather, and physical history.

## Style
Evocative nouns and tactile verbs. Avoid generic exposition or unearned infodumps.

## When helping
Ground every continuation in a specific physical object, atmospheric light, or environmental change.
`
  },
  {
    id: 'skill-minimalist',
    name: 'Editorial Restraint',
    category: 'Voice',
    summary: 'Surgical sentences, active voice, zero excess words',
    isPreset: true,
    markdown: `# Editorial Restraint

## Voice
Crisp, unadorned, rhythmic, and surgical.

## Style
Short sentences, active voice, zero filler adjectives. Show through immediate action.

## When helping
Cut excess words and offer punchy, momentum-driven continuations that respect whitespace.
`
  },
  {
    id: 'skill-dialogue',
    name: 'Witty Dialogue',
    category: 'Dialogue',
    summary: 'Subtext-heavy exchanges, character cadence, and banter',
    isPreset: true,
    markdown: `# Witty Dialogue Specialist

## Voice
Sharp, bantering, subtext-heavy with conversational tension.

## Style
Natural speech rhythms, interrupted thoughts, body language between lines. Never on-the-nose.

## When helping
Propose alternative character retorts, subtextual glances, and dynamic dialogue exchanges.
`
  },
  {
    id: 'skill-essayist',
    name: 'Craft Essayist',
    category: 'Non-Fiction',
    summary: 'Lucid reflection, vivid craft metaphors, and thoughtful prose',
    isPreset: true,
    markdown: `# Craft Essayist

## Voice
Reflective, intellectually curious, lucid, and engaging.

## Style
Clear arguments backed by vivid metaphors. Balance theory with concrete writer craft examples.

## When helping
Brainstorm thesis questions, refine opening hooks, and tighten logical transitions.
`
  },
  {
    id: 'skill-email',
    name: 'Email & Dispatch',
    category: 'Communication',
    summary: 'Polished, respectful dispatches with zero corporate jargon',
    isPreset: true,
    markdown: `# Email & Dispatch Diplomat

## Voice
Warm, professional, respectful of reader time, and graceful.

## Style
Concise paragraphs, clear call to action, zero corporate jargon or sycophancy.

## When helping
Provide gentle, polished variations that balance warmth with clarity.
`
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
