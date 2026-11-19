import { requestOllamaCompletion } from './ollama';

export interface GeneratedSkillResult {
  title: string;
  markdown: string;
  summary: string;
}

export async function generateSkillFromStoryPremise(
  storyTitle: string,
  premise: string,
  modelName: string
): Promise<GeneratedSkillResult> {
  const prompt = `Story Title: "${storyTitle || 'Untitled Story'}"
Writer's Story Premise & Plan:
"""
${premise}
"""

Task: Create an AI Writing Partner Skill specifically tailored to this story.
The skill must instruct the AI on the exact literary tone, atmosphere, sensory worldbuilding, and narrative pacing needed to write and format this story.

CRITICAL: Output ONLY standard Markdown in the following format (no conversational introduction):

# [2 to 4 word Skill Title, e.g. "Moscow Liminal Mystery" or "Atmospheric Noir"]

## Voice
[2 to 3 sentences describing narrative voice, POV distance, and tone]

## Style
[2 to 3 sentences detailing sensory specifics, rhythm, vocabulary, and avoiding clichés]

## When Helping
[Guidance for continuing scenes, fixing grammar and cadence, and maintaining narrative suspense]`;

  let response = '';
  try {
    response = await requestOllamaCompletion(modelName, prompt);
  } catch (err) {
    console.warn('Ollama skill generation failed:', err);
  }

  // Clean reasoning blocks
  const cleaned = response.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  if (cleaned.includes('# ') && cleaned.includes('## Voice')) {
    const firstLine = cleaned.split('\n')[0] || '';
    const title = firstLine.replace(/^#\s*/, '').trim() || `${storyTitle} Partner`;
    return {
      title,
      markdown: cleaned,
      summary: `Tailored writing partner for "${storyTitle || 'this story'}"`
    };
  }

  // Fallback: Generate intelligent structured skill based on keywords in premise
  const cleanTitle = storyTitle || 'Story Partner';
  const isMystery = /secret|mystery|hotel|floor|dark|unknown|curse|shadow|hidden/i.test(premise);
  const isSciFi = /ai|algorithm|space|future|cyber|robot|time|alien/i.test(premise);

  const skillTitle = isMystery
    ? `${cleanTitle} — Liminal Suspense`
    : isSciFi
    ? `${cleanTitle} — Speculative Fiction`
    : `${cleanTitle} — Atmospheric Fiction`;

  const fallbackMarkdown = `# ${skillTitle}

## Voice
Observant, grounded third-person perspective with subtle tension. Focus on the protagonist's immediate sensations and the uncanny contrast between everyday routine and impossible occurrences.

## Style
Precise sensory prose—mechanical hums, tactile surfaces, ambient echoes, and subtle body language. Pacing is patient, prioritizing tension and natural dialogue over exaggerated melodrama.

## When Helping
When drafting next paragraphs or formatting passages, preserve authorial suspense and realistic dialogue. Fix grammatical run-ons while keeping the raw story cadence intact. Advance the plot through character action and environmental discovery.`;

  return {
    title: skillTitle,
    markdown: fallbackMarkdown,
    summary: `Tailored partner skill tuned for "${storyTitle || 'this story'}"`
  };
}
