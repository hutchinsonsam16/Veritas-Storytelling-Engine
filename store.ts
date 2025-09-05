import { create } from 'zustand';
import {
  Character,
  WorldState,
  GameState,
  GamePhase,
  StoryEntry,
  TimelineEvent,
  NPC,
} from './types';
import { INITIAL_CHARACTER_STATE, INITIAL_WORLD_STATE, INITIAL_GAME_STATE } from './constants';
import { getAIDrivenTurn, generateImage } from './services/geminiService';

interface AppState {
  character: Character;
  world: WorldState;
  gameState: GameState;
  
  handleOnboardingComplete: (character: Character, world: WorldState, openingPrompt: string) => void;
  handlePlayerAction: (action: string) => Promise<void>;
}

// The core logic for parsing and applying AI response tags.
const parseAndApplyTags = async (
    rawResponse: string, 
    set: (fn: (state: AppState) => Partial<AppState> | AppState) => void,
    get: () => AppState
    ): Promise<void> => {
    let narrativeText = rawResponse;
    let imagePromise: Promise<string | null> | null = null;
    let charImagePromise: Promise<string | null> | null = null;

    const tagRegex = /\[(img-prompt|char-img-prompt|update-backstory|add-item|remove-item|update-skill|create-npc|update-npc|remove-npc|update-npc-relation|update-lore|log-world-event)\]([\s\S]*?)\[\/\1\]/g;

    const matches = Array.from(rawResponse.matchAll(tagRegex));

    for (const match of matches) {
      const [fullTag, tagName, content] = match;
      narrativeText = narrativeText.replace(fullTag, '').trim();
      
      switch (tagName) {
        case 'img-prompt':
          imagePromise = generateImage(content);
          break;
        case 'char-img-prompt':
          charImagePromise = generateImage(content);
          break;
        case 'update-backstory':
          set(state => ({ character: { ...state.character, backstory: content } }));
          break;
        case 'add-item':
          const [itemName, itemDesc] = content.split('|');
          if (itemName) {
            set(state => ({ character: { ...state.character, inventory: [...state.character.inventory, { name: itemName.trim(), description: (itemDesc || '').trim() }] } }));
          }
          break;
        case 'remove-item':
          set(state => ({ character: { ...state.character, inventory: state.character.inventory.filter(item => item.name !== content.trim()) } }));
          break;
        case 'update-skill':
          const [skillName, skillValue] = content.split('|');
          if (skillName && !isNaN(parseInt(skillValue))) {
            set(state => {
              const skills = [...state.character.skills];
              const skillIndex = skills.findIndex(s => s.name === skillName.trim());
              if (skillIndex > -1) {
                skills[skillIndex].value = parseInt(skillValue);
              } else {
                skills.push({ name: skillName.trim(), value: parseInt(skillValue) });
              }
              return { character: { ...state.character, skills } };
            });
          }
          break;
        case 'create-npc':
        case 'update-npc':
           try {
            const npcData = JSON.parse(content) as NPC;
            set(state => {
                const npcs = [...state.world.npcs];
                const npcIndex = npcs.findIndex(n => n.id === npcData.id);
                if (npcIndex > -1) {
                    npcs[npcIndex] = { ...npcs[npcIndex], ...npcData };
                } else {
                    npcs.push(npcData);
                }
                return { world: { ...state.world, npcs } };
            });
           } catch(e) { console.error("Failed to parse NPC JSON", content, e)}
          break;
        case 'remove-npc':
            try {
                const { id } = JSON.parse(content) as {id: string};
                set(state => ({ world: { ...state.world, npcs: state.world.npcs.filter(n => n.id !== id) } }));
            } catch(e) { console.error("Failed to parse NPC JSON for removal", content, e)}
          break;
        case 'update-npc-relation':
           const [npcId, relationValue] = content.split('|');
           if (npcId && !isNaN(parseInt(relationValue))) {
               set(state => {
                   const npcs = state.world.npcs.map(n => n.id === npcId.trim() ? { ...n, relationship: parseInt(relationValue) } : n);
                   return { world: { ...state.world, npcs } };
               });
           }
          break;
        case 'update-lore':
            const [loreKey, loreValue] = content.split('|');
            if(loreKey && loreValue){
                set(state => ({ world: { ...state.world, lore: { ...state.world.lore, [loreKey.trim()]: loreValue.trim() } } }));
            }
            break;
        case 'log-world-event':
            set(state => ({ gameState: { ...state.gameState, timeline: [...state.gameState.timeline, { id: Date.now(), description: content }] } }));
            break;
      }
    }
    
    const imageUrl = await imagePromise;
    const charImageUrl = await charImagePromise;

    if (charImageUrl) {
        set(state => ({ character: { ...state.character, imageUrl: charImageUrl } }));
    }

    const newNarrativeEntry: StoryEntry = {
      id: Date.now(),
      type: 'narrative',
      text: narrativeText,
      imageUrl: imageUrl ?? undefined,
    };
    set(state => ({ gameState: { ...state.gameState, storyLog: [...state.gameState.storyLog, newNarrativeEntry] } }));

    if(imageUrl){
        set(state => {
            const lastEvent = state.gameState.timeline[state.gameState.timeline.length -1];
            if(lastEvent && !lastEvent.imageUrl){
                const updatedEvent = { ...lastEvent, imageUrl };
                return { gameState: { ...state.gameState, timeline: [...state.gameState.timeline.slice(0, -1), updatedEvent] } };
            }
            return {};
        });
    }
}

export const useStore = create<AppState>((set, get) => ({
  character: INITIAL_CHARACTER_STATE,
  world: INITIAL_WORLD_STATE,
  gameState: INITIAL_GAME_STATE,

  handleOnboardingComplete: (initialCharacter, initialWorld, openingPrompt) => {
    set({
      character: initialCharacter,
      world: initialWorld,
      gameState: { ...get().gameState, phase: GamePhase.PLAYING }
    });
    get().handlePlayerAction(openingPrompt);
  },
  
  handlePlayerAction: async (action: string) => {
    set(state => ({ gameState: { ...state.gameState, isLoading: true } }));

    const playerEntry: StoryEntry = {
        id: Date.now(),
        type: 'player',
        text: action
    };
    set(state => ({ gameState: { ...state.gameState, storyLog: [...state.gameState.storyLog, playerEntry] } }));

    const { character, world, gameState } = get();
    const aiResponse = await getAIDrivenTurn(character, world, gameState.timeline, action);
    
    await parseAndApplyTags(aiResponse, set, get);

    set(state => ({ gameState: { ...state.gameState, isLoading: false } }));
  },
}));
