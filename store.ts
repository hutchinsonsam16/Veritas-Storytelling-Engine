import { create } from 'zustand';
import {
  Character,
  WorldState,
  GameState,
  GamePhase,
  StoryEntry,
  Settings,
  NPC,
} from './types';
import { INITIAL_CHARACTER_STATE, INITIAL_WORLD_STATE, INITIAL_GAME_STATE, INITIAL_SETTINGS_STATE } from './constants';
import { getAIDrivenTurn, generateImage } from './services/geminiService';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import saveAs from 'file-saver';


interface AppState {
  character: Character;
  world: WorldState;
  gameState: GameState;
  settings: Settings;
  imagePrompts: string[];
  
  handleOnboardingComplete: (character: Character, world: WorldState, openingPrompt: string) => void;
  handlePlayerAction: (action: string) => Promise<void>;
  updateSettings: (newSettings: Partial<Settings>) => void;
  saveGame: () => void;
  loadGame: (json: string) => void;
  exportGame: () => Promise<void>;
}

const parseAndApplyTags = async (
    rawResponse: string, 
    set: (fn: (state: AppState) => Partial<AppState> | AppState) => void,
    get: () => AppState
    ): Promise<void> => {
    let narrativeText = rawResponse;
    const { settings } = get();
    let imagePromise: Promise<string | null> | null = null;
    let charImagePromise: Promise<string | null> | null = null;
    let characterStateChanged = false;

    const tagRegex = /\[(img-prompt|char-img-prompt|update-status|update-backstory|add-item|remove-item|update-skill|create-npc|update-npc|remove-npc|update-npc-relation|update-lore|log-world-event)\]([\s\S]*?)\[\/\1\]/g;

    const matches = Array.from(rawResponse.matchAll(tagRegex));

    for (const match of matches) {
      const [fullTag, tagName, content] = match;
      narrativeText = narrativeText.replace(fullTag, '').trim();
      
      switch (tagName) {
        case 'img-prompt':
          if (settings.imageGenerationMode === 'scene' || settings.imageGenerationMode === 'both') {
            set(state => ({ imagePrompts: [...state.imagePrompts, content] }));
            imagePromise = generateImage(content, settings.imageTheme);
          }
          break;
        case 'char-img-prompt':
          if (settings.imageGenerationMode === 'character' || settings.imageGenerationMode === 'both') {
            set(state => ({ imagePrompts: [...state.imagePrompts, content] }));
            charImagePromise = generateImage(content, settings.imageTheme);
          }
          break;
        case 'update-status':
          set(state => ({ character: { ...state.character, status: content } }));
          break;
        case 'update-backstory':
          set(state => ({ character: { ...state.character, backstory: content } }));
          characterStateChanged = true;
          break;
        case 'add-item':
          const [itemName, itemDesc] = content.split('|');
          if (itemName) {
            set(state => ({ character: { ...state.character, inventory: [...state.character.inventory, { name: itemName.trim(), description: (itemDesc || '').trim() }] } }));
            characterStateChanged = true;
          }
          break;
        case 'remove-item':
          set(state => ({ character: { ...state.character, inventory: state.character.inventory.filter(item => item.name !== content.trim()) } }));
          characterStateChanged = true;
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
            characterStateChanged = true;
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

    // Automatically generate a character image on state change if one wasn't explicitly provided.
    if (characterStateChanged && !charImagePromise && (settings.imageGenerationMode === 'character' || settings.imageGenerationMode === 'both')) {
      const updatedCharacter = get().character;
      // Construct a detailed prompt for the new image
      const skillsString = updatedCharacter.skills.map(s => s.name).join(', ') || 'no defined skills';
      const inventoryString = updatedCharacter.inventory.map(i => i.name).join(', ') || 'nothing';
      const autoPrompt = `A portrait of ${updatedCharacter.name}. Backstory: ${updatedCharacter.backstory}. They are skilled in ${skillsString}. They are currently carrying: ${inventoryString}.`;
      
      set(state => ({ imagePrompts: [...state.imagePrompts, autoPrompt] }));
      charImagePromise = generateImage(autoPrompt, settings.imageTheme);
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

const SAVABLE_STATE_KEYS: (keyof AppState)[] = ['character', 'world', 'gameState', 'settings', 'imagePrompts'];

export const useStore = create<AppState>((set, get) => ({
  character: INITIAL_CHARACTER_STATE,
  world: INITIAL_WORLD_STATE,
  gameState: INITIAL_GAME_STATE,
  settings: INITIAL_SETTINGS_STATE,
  imagePrompts: [],

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

  updateSettings: (newSettings) => {
    set(state => ({ settings: { ...state.settings, ...newSettings } }));
  },

  saveGame: () => {
    const state = get();
    const stateToSave: Partial<AppState> = {};
    // FIX: The original `reduce` caused a TypeScript error due to difficulty in correlating
    // the key with its corresponding value type in a generic way. Using `forEach` and a cast
    // to `any` resolves this complex type issue while achieving the same result.
    SAVABLE_STATE_KEYS.forEach(key => {
        (stateToSave as any)[key] = state[key];
    });

    const json = JSON.stringify(stateToSave, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    saveAs(blob, `veritas-save-${Date.now()}.json`);
  },

  loadGame: (json) => {
    const loadedState = JSON.parse(json);
    set({
      ...INITIAL_GAME_STATE, // ensure all fields are present
      ...INITIAL_CHARACTER_STATE,
      ...INITIAL_WORLD_STATE,
      ...INITIAL_SETTINGS_STATE,
      ...loadedState,
      gameState: {
        ...INITIAL_GAME_STATE,
        ...loadedState.gameState,
        phase: GamePhase.PLAYING,
        isLoading: false,
      }
    });
  },

  exportGame: async () => {
    set(state => ({ gameState: { ...state.gameState, isLoading: true } }));
    const { character, gameState, imagePrompts } = get();
    const zip = new JSZip();

    // 1. Add save.json
    const state = get();
    const stateToSave: Partial<AppState> = {};
    // FIX: The original `reduce` caused a TypeScript error due to difficulty in correlating
    // the key with its corresponding value type in a generic way. Using `forEach` and a cast
    // to `any` resolves this complex type issue while achieving the same result.
    SAVABLE_STATE_KEYS.forEach(key => {
        (stateToSave as any)[key] = state[key];
    });
    zip.file('save.json', JSON.stringify(stateToSave, null, 2));

    // 2. Add prompts.txt
    zip.file('prompts.txt', imagePrompts.join('\n\n'));

    // 3. Add images
    const imagesFolder = zip.folder('images');
    if(imagesFolder) {
        let imageCounter = 0;
        if (character.imageUrl) {
            const base64Data = character.imageUrl.split(',')[1];
            imagesFolder.file('character.jpg', base64Data, { base64: true });
        }
        for (const entry of gameState.storyLog) {
            if (entry.imageUrl) {
                const base64Data = entry.imageUrl.split(',')[1];
                imagesFolder.file(`scene_${imageCounter++}.jpg`, base64Data, { base64: true });
            }
        }
    }
    
    // 4. Create and add PDF
    const doc = new jsPDF();
    let y = 15;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 10;
    const maxWidth = doc.internal.pageSize.width - margin * 2;

    doc.setFont('helvetica', 'bold');
    doc.text(`Veritas Saga: ${character.name}'s Story`, margin, y);
    y += 10;
    
    doc.setFont('helvetica', 'normal');
    for (const entry of gameState.storyLog) {
      if (y > pageHeight - 20) {
        doc.addPage();
        y = margin;
      }
      doc.setFont('helvetica', entry.type === 'player' ? 'bold' : 'normal');
      const prefix = entry.type === 'player' ? `> ` : '';
      const lines = doc.splitTextToSize(`${prefix}${entry.text}`, maxWidth);
      
      for(const line of lines){
         if (y > pageHeight - 10) {
            doc.addPage();
            y = margin;
         }
         doc.text(line, margin, y);
         y+= 7;
      }
      y += 5; // Extra space between entries
    }
    zip.file('story.pdf', doc.output('blob'));

    // 5. Generate and download zip
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'veritas-saga.zip');
    set(state => ({ gameState: { ...state.gameState, isLoading: false } }));
  },
}));