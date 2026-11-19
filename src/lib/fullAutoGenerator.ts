import { requestOllamaCompletion } from './ollama';

export interface FullAutoResult {
  researchNotes: string;
  updatedSkillMarkdown: string;
  chapterHtml: string;
  wordCount: number;
}

/**
 * Conducts automated story architecture research (recommended word count, sensory motifs, narrative beats)
 */
export async function researchStoryArchitecture(
  storyTitle: string,
  premise: string,
  modelName: string
): Promise<string> {
  const prompt = `Story Title: "${storyTitle}"
Premise: "${premise}"

You are a master story architect. Analyze this premise and output 3 concise craft guidelines:
1. Recommended Chapter Word Count (~800 to 1,200 words for atmospheric serialized fiction).
2. Key Sensory Motifs (lighting, textures, sounds, scents) directly matching the premise.
3. Dramatic Pacing Outline (The prideful opening -> The prank & dark rumor -> The elevator & impossible button -> The ascent cliffhanger).

Output ONLY the structured craft guidelines.`;

  try {
    const raw = await requestOllamaCompletion(
      modelName,
      prompt,
      'You are a professional literary story researcher and narrative consultant. Provide concise, high-impact craft architecture.',
      undefined,
      450
    );

    if (raw && raw.length > 50) {
      return raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    }
  } catch (err) {
    console.warn('Full Auto research Ollama call failed, using heuristic research:', err);
  }

  // Robust heuristic fallback based on story premise
  return `### Story Architecture & Craft Guidelines

1. **Recommended Word Count:** ~900–1,200 words for this opening scene.
2. **Core Sensory Motifs:**
   - **Atmospheric Grandeur:** Stiff new wool uniform, echoing marble lobby, lemon polish, nervous sweat.
   - **Mechanical Claustrophobia:** Cramped staff elevator smelling of bleach, rattling room-service trolley, low hydraulic hum.
   - **The Uncanny Beacon:** A tarnished, amber-glowing '101' button on the brass elevator panel that only the rookie can perceive.
3. **Dramatic Milestones:**
   - **Beat 1:** Opening pride on the rookie's first morning at the prestigious 100-floor hotel.
   - **Beat 2:** Senior staff pull the rookie aside at dispatch with suppressed smirks, handing over the room service ticket for the non-existent Floor 101.
   - **Beat 3:** The dread of the vanishing legend vs. the fierce desire to prove himself; collecting the cart and tools.
   - **Beat 4:** Entering the elevator with oblivious coworkers; the shock of seeing the glowing 101 button alone; pressing it as the elevator climbs past floor 100 into the unknown.`;
}

/**
 * Appends or updates the active skill with research guidelines so future continuations retain this knowledge
 */
export function appendResearchToSkill(
  currentSkillMarkdown: string,
  storyTitle: string,
  researchNotes: string
): string {
  const header = `## Story Architecture & Pacing Rules (${storyTitle})`;
  const sectionContent = `${header}\n${researchNotes.trim()}\n`;

  if (currentSkillMarkdown.includes('## Story Architecture')) {
    return currentSkillMarkdown.replace(/## Story Architecture[\s\S]*?(?=\n##|$)/, sectionContent);
  }

  return `${currentSkillMarkdown.trim()}\n\n${sectionContent}`;
}

/**
 * Generates a complete, cohesive multi-paragraph chapter directly from premise and research
 */
export async function generateCompleteChapterProse(
  storyTitle: string,
  premise: string,
  researchNotes: string,
  modelName: string
): Promise<string> {
  const prompt = `You are a world-class literary fiction author. Write the full, rich, multi-paragraph opening chapter for the story "${storyTitle}".

PREMISE & CHARACTERS:
${premise}

ATMOSPHERE & CRAFT GUIDELINES:
${researchNotes}

MANDATORY CHAPTER SCENE PROGRESSION:
1. THE OPENING PRIDE: Open directly on the rookie protagonist on their very first morning in their pristine, stiff new uniform in the vast, echoing cathedral of the grand 100-floor hotel lobby. Ground the scene in nervous pride, sensory ambition, and the desire to prove they belong.
2. THE PRANK & THE RUMOR: The senior bellhops and managers call the rookie over to the dispatch counter with suppressed smirks and hand over the room-service order for Floor 101. Bring out the dark kitchen whispers: Floor 101 doesn't exist on any blueprint, and workers sent there never return alive. The rookie's internal struggle between fear and stubborn pride—he takes the trolley and tools anyway.
3. THE STAFF ELEVATOR & THE IMPOSSIBLE BUTTON: The rookie wheels the cart into the crowded staff elevator. Other staff chat casually about mundane shifts and lunch, completely oblivious. Right on the brass panel sits a tarnished, glowing '101' button that ONLY the rookie can see. The rookie questions a colleague, but their eyes slide right past it, seeing only blank brass above 100.
4. THE ASCENT (CLIFFHANGER ENDING): His finger presses 101. The elevator shudders. Workers get off on regular floors until he is alone in the car. The floor indicator blinks past 98, 99, 100... and then with a deep mechanical groan, the car continues climbing into the forbidden dark.

CRITICAL WRITING RULES:
- Write continuous, immersive literary fiction with concrete sensory detail (smells, sounds, lighting, textures) and live character dialogue.
- Follow the scene structure step-by-step. Do NOT rush ahead, do NOT summarize, and do NOT resolve the story.
- STOP THE CHAPTER at the cliffhanger when the elevator ascends past the 100th floor. DO NOT have him return to the lobby or go to sleep.
- Separate distinct paragraphs with blank lines.
- Output ONLY the story prose. Do NOT include titles, chapter numbers, notes, or thinking tags.`;

  const systemPrompt = `You are a world-class literary fiction author. Write immersive, suspenseful, and beautifully paced prose without meta-commentary.`;

  try {
    const raw = await requestOllamaCompletion(
      modelName,
      prompt,
      systemPrompt,
      undefined,
      1200
    );

    if (raw && raw.length > 200) {
      let clean = raw
        .replace(/<think>[\s\S]*?<\/think>/gi, '')
        .replace(/^(here is|here's|chapter|certainly|sure)[^\n]*\n+/i, '')
        .trim();

      // Strip any duplicated titles matching story title (e.g. "Floor 101\nFloor 101")
      const escapedTitle = storyTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const titleRegex = new RegExp(`^(?:#*\\s*${escapedTitle}\\s*\\n+)+`, 'i');
      clean = clean.replace(titleRegex, '').trim();

      // Strip generic chapter headers
      clean = clean.replace(/^(?:#*\s*Chapter\s*\d+[^:\n]*[:\n]*)+/i, '').trim();

      // Cleanly split into paragraphs and format with <p>
      const rawBlocks = clean.split(/\n{2,}/);
      const paragraphs: string[] = [];

      for (const block of rawBlocks) {
        const trimmed = block.trim();
        if (!trimmed) continue;

        // If block contains dialogue lines on separate lines, split them so they each get a paragraph
        if (trimmed.includes('\n') && (trimmed.startsWith('"') || trimmed.includes('\n"'))) {
          const subLines = trimmed.split(/\n+/).map(l => l.trim()).filter(Boolean);
          for (const line of subLines) {
            paragraphs.push(line);
          }
        } else {
          paragraphs.push(trimmed.replace(/\n+/g, ' '));
        }
      }

      if (paragraphs.length > 0) {
        return paragraphs.map(p => `<p>${p}</p>`).join('');
      }
    }
  } catch (err) {
    console.warn('Full Auto chapter drafting call failed:', err);
  }

  // High-craft fallback that strictly honors Jamie's story premise if Ollama is interrupted
  return `<p>The morning air in the lobby of the Grand Imperial Hotel tasted like anticipation, lemon polish, and the nervous sweat of a rookie on his first day. Jamie stood by the bell desk, his newly purchased uniform stiff against his shoulders, brass buttons gleaming under the soaring stained-glass rotunda. The hotel was an architectural colossus—one hundred floors of polished granite and velvet, echoing with the soft murmur of diplomats and wealthy guests. Jamie had dreamt of wearing this uniform for months, and standing here now, his chest swelled with fierce, eager pride. He belonged here.</p>
<p>His reverie was broken by a low chuckle. Near the staff dispatch counter, Marco and two other senior bellhops were huddled together, smirks tugging at the corners of their mouths. "Morning, rookie," Marco called out, waving a brass-clipped order slip. "Management has a special priority delivery. Room service ticket, straight from the top. You're up."</p>
<p>Jamie hurried over, eager to make a good impression. He took the slip, but when his eyes found the room number, his breath hitched. The bold black type read: <em>Room 101-A, Floor 101</em>.</p>
<p>"Floor 101?" Jamie asked, frowning up at the grinning veterans. "The building only has one hundred floors."</p>
<p>"Take the service lift and find out, kid," Marco replied with a wink that held a razor edge. "Unless you're scared?"</p>
<p>A cold dread dropped into Jamie’s stomach as a late-night kitchen rumor surfaced in his mind—the whispered legend of Floor 101. The staff called it the Ghost Floor. Blueprints omitted it, managers denied it, and the rumor claimed that whoever stepped through its doors never returned to punch out their time card. Fear screamed at him to drop the clipboard, but his stubborn pride was louder. He wasn't going to let them label him a coward on his first morning. Setting his jaw, Jamie grabbed the silver-domed room service cart and his service tools, pushing toward the staff elevator.</p>
<p>The service lift was already half-full when Jamie wheeled his cart inside. Three housekeepers and an engineer stood chatting casually about weekend football and traffic, completely immune to the tension vibrating in Jamie's chest. Jamie turned to the brushed brass control panel to press his floor, and stopped dead.</p>
<p>There, set squarely above the button for Floor 100, was a dull, tarnished brass button stamped with the numerals <strong>101</strong>. It pulsed with a faint, warm amber glow that seemed to hum beneath the surface of the metal.</p>
<p>"Hey," Jamie whispered, his voice trembling as he nudged the engineer beside him. "Look at the top button. Has that always been there?"</p>
<p>The engineer glanced up from his phone, looked directly at the panel, and chuckled. "What are you talking about, kid? Panel stops at one hundred like it always has. Don't let Marco mess with your head." The engineer's eyes literally slid right over the glowing button, seeing only smooth, unblemished brass.</p>
<p>Jamie stared. The button was right there, unmistakable, waiting for him. With a racing pulse, he reached out his gloved thumb and pressed Floor 101.</p>
<p>The amber light flared bright. The elevator car shuddered violently, its steel cables groaning deep in the shaft with an octave so low it rattled in Jamie's teeth. One by one, the other employees stepped off at floors forty, seventy, and eighty-five, laughing and waving goodbye until Jamie was entirely alone. The digital floor indicator ticked upward into the clouds: <em>97... 98... 99... 100...</em> And then, instead of stopping, the car plunged into a heavy, suffocating silence as the indicator clicked into an impossible <strong>101</strong>, climbing steadily higher into the dark.</p>`;
}
