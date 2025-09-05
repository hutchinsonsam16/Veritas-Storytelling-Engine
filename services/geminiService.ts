
import { GoogleGenAI } from "@google/genai";
import { Character, WorldState, TimelineEvent } from '../types';
import { DIRECTOR_SYSTEM_PROMPT } from '../constants';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generateContentModel = 'gemini-2.5-flash';
const generateImageModel = 'imagen-4.0-generate-001';

function buildPrompt(
  character: Character,
  world: WorldState,
  timeline: TimelineEvent[],
  playerAction: string
): string {
  const recentEvents = timeline.slice(-5).map(e => `- ${e.description}`).join('\n');

  return `
--- CURRENT STATE ---

**CHARACTER: ${character.name}**
Status: ${character.status || 'Normal'}
Backstory: ${character.backstory}
Skills: ${character.skills.map(s => `${s.name}: ${s.value}`).join(', ') || 'None'}
Inventory: ${character.inventory.map(i => i.name).join(', ') || 'None'}

**WORLD LORE**
${Object.entries(world.lore).map(([key, value]) => `- ${key}: ${value}`).join('\n') || 'No lore established.'}

**KNOWN NPCS**
${world.npcs.map(n => `- ${n.name} (Relationship: ${n.relationship})`).join('\n') || 'No NPCs encountered.'}

**RECENT KEY EVENTS (Memory)**
${recentEvents || 'The story is just beginning.'}

--- PLAYER ACTION ---
${playerAction}

--- YOUR RESPONSE (Narrative + Tags) ---
`;
}

export async function getAIDrivenTurn(
  character: Character,
  world: WorldState,
  timeline: TimelineEvent[],
  playerAction: string
): Promise<string> {
  try {
    const prompt = buildPrompt(character, world, timeline, playerAction);
    const response = await ai.models.generateContent({
      model: generateContentModel,
      contents: prompt,
      config: {
        systemInstruction: DIRECTOR_SYSTEM_PROMPT,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "The connection to the storytelling engine flickered and died. Please try again.";
  }
}

export async function generateImage(prompt: string, theme: string): Promise<string | null> {
  try {
    const response = await ai.models.generateImages({
        model: generateImageModel,
        prompt: `${theme}, ${prompt}`,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '16:9',
        },
    });
    
    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
}