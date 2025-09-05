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
import { INITIAL_CHARACTER_STATE, INITIAL_WORLD_STATE, INITIAL_GAME_STATE, INITIAL_SETTINGS_STATE, INITIAL_COMPONENT_VISIBILITY } from './constants';
import { getAIDrivenTurn, generateImage } from './services/geminiService';
import { getLocalAIDrivenTurn, generateLocalImage, initializeLocalModel, initializeLocalImageModel as initLocalImageModelService } from './services/localGenerationService';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import saveAs from 'file-saver';
import { toast } from './hooks/use-toast';


interface AppState {
  character: Character;
  world: WorldState;
  gameState: GameState;
  settings: Settings;
  imagePrompts: string[];
  localModelStatus: { loading: boolean; progress: number; message: string; loaded: boolean };
  localImageModelStatus: {
    [key in 'performance' | 'quality']: { loading: boolean; progress: number; message: string; loaded: boolean };
  };
  
  initializeLocalModel: () => Promise<void>;
  initializeLocalImageModel: (mode: 'performance' | 'quality') => Promise<void>;
  handleOnboardingComplete: (character: Character, world: WorldState, openingPrompt: string) => void;
  handlePlayerAction: (action: string) => Promise<void>;
  updateSettings: (newSettings: Partial<Settings>) => void;
  saveGame: () => void;
  loadGame: (json: string) => void;
  exportGame: () => Promise<void>;
  restartGame: () => void;
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
            if (settings.imageEngine === 'local-performance' || settings.imageEngine === 'local-quality') {
                const mode = settings.imageEngine.replace('local-', '') as 'performance' | 'quality';
                imagePromise = generateLocalImage(content, settings.imageTheme, mode);
            } else if (settings.imageEngine === 'gemini') {
                imagePromise = generateImage(content, settings.imageTheme, '4:3');
            }
          }
          break;
        case 'char-img-prompt':
          if (settings.imageGenerationMode === 'character' || settings.imageGenerationMode === 'both') {
            set(state => ({ imagePrompts: [...state.imagePrompts, content] }));
            if (settings.imageEngine === 'local-performance' || settings.imageEngine === 'local-quality') {
                const mode = settings.imageEngine.replace('local-', '') as 'performance' | 'quality';
                charImagePromise = generateLocalImage(content, settings.imageTheme, mode);
            } else if (settings.imageEngine === 'gemini') {
                charImagePromise = generateImage(content, settings.imageTheme, '3:4');
            }
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

    if (characterStateChanged && !charImagePromise && (settings.imageGenerationMode === 'character' || settings.imageGenerationMode === 'both')) {
      const updatedCharacter = get().character;
      const skillsString = updatedCharacter.skills.map(s => s.name).join(', ') || 'no defined skills';
      const inventoryString = updatedCharacter.inventory.map(i => i.name).join(', ') || 'nothing';
      const autoPrompt = `A portrait of ${updatedCharacter.name}. Backstory: ${updatedCharacter.backstory}. They are skilled in ${skillsString}. They are currently carrying: ${inventoryString}.`;
      
      set(state => ({ imagePrompts: [...state.imagePrompts, autoPrompt] }));
       if (settings.imageEngine === 'local-performance' || settings.imageEngine === 'local-quality') {
          const mode = settings.imageEngine.replace('local-', '') as 'performance' | 'quality';
          charImagePromise = generateLocalImage(autoPrompt, settings.imageTheme, mode);
       } else if (settings.imageEngine === 'gemini') {
          charImagePromise = generateImage(autoPrompt, settings.imageTheme, '3:4');
       }
    }
    
    const imageUrl = await imagePromise;
    const charImageUrl = await charImagePromise;

    if (charImageUrl) {
        set(state => {
            const history = [...(state.character.imageUrlHistory || [])];
            if (state.character.imageUrl) {
                history.unshift(state.character.imageUrl); // Add previous image to start of history
            }
            return { character: { ...state.character, imageUrl: charImageUrl, imageUrlHistory: history.slice(0, 9) } }; // Limit history
        });
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

/**
 * Migrates a loaded save state to the latest data structure, ensuring backward compatibility.
 */
function migrateSaveState(loadedState: any): Partial<AppState> {
    const character = { ...INITIAL_CHARACTER_STATE, ...loadedState.character };
    if (!character.imageUrlHistory) {
        character.imageUrlHistory = [];
    }

    const world = { ...INITIAL_WORLD_STATE, ...loadedState.world };
    if (world.npcs) {
        world.npcs = world.npcs.map((npc: any) => ({
            relationship: 0, // Ensure relationship exists
            ...npc,
        }));
    }

    const gameState = { 
        ...INITIAL_GAME_STATE, 
        ...loadedState.gameState, 
        phase: GamePhase.PLAYING, 
        isLoading: false 
    };
    
    // Safely merge settings, especially nested objects
    const settings = { 
        ...INITIAL_SETTINGS_STATE, 
        ...loadedState.settings,
        layout: {
            ...INITIAL_SETTINGS_STATE.layout,
            ...(loadedState.settings?.layout || {}),
        },
        componentVisibility: {
            ...INITIAL_COMPONENT_VISIBILITY,
            ...(loadedState.settings?.componentVisibility || {}),
        }
    };
    if ((settings as any).localImageApiUrl) {
        delete (settings as any).localImageApiUrl;
    }

    const imagePrompts = loadedState.imagePrompts || [];

    return { character, world, gameState, settings, imagePrompts };
}


export const useStore = create<AppState>((set, get) => ({
  character: INITIAL_CHARACTER_STATE,
  world: INITIAL_WORLD_STATE,
  gameState: INITIAL_GAME_STATE,
  settings: INITIAL_SETTINGS_STATE,
  imagePrompts: [],
  localModelStatus: { loading: false, progress: 0, message: 'Not loaded', loaded: false },
  localImageModelStatus: {
    performance: { loading: false, progress: 0, message: 'Not loaded', loaded: false },
    quality: { loading: false, progress: 0, message: 'Not loaded', loaded: false },
  },

  initializeLocalModel: async () => {
    if (get().localModelStatus.loaded || get().localModelStatus.loading) {
        return;
    }

    set({ localModelStatus: { loading: true, progress: 0, message: 'Initializing...', loaded: false }});

    const progress_callback = (progress: any) => {
        if (progress.status === 'progress') {
            const percentage = (progress.progress || 0).toFixed(2);
            set({ localModelStatus: { loading: true, progress: progress.progress, message: `${progress.file} (${percentage}%)`, loaded: false } });
        } else {
             set({ localModelStatus: { loading: true, progress: get().localModelStatus.progress, message: progress.status, loaded: false } });
        }
    };

    await initializeLocalModel(progress_callback);

    set({ localModelStatus: { loading: false, progress: 100, message: 'Ready', loaded: true } });
  },

  initializeLocalImageModel: async (mode: 'performance' | 'quality') => {
    const status = get().localImageModelStatus[mode];
    if (status.loaded || status.loading) {
        return;
    }

    set(state => ({
        localImageModelStatus: {
            ...state.localImageModelStatus,
            [mode]: { loading: true, progress: 0, message: 'Initializing...', loaded: false }
        }
    }));

    const progress_callback = (progress: any) => {
        if (progress.status === 'progress') {
            const percentage = (progress.progress || 0).toFixed(2);
            set(state => ({
                localImageModelStatus: {
                    ...state.localImageModelStatus,
                    [mode]: { loading: true, progress: progress.progress, message: `${progress.file} (${percentage}%)`, loaded: false }
                }
            }));
        } else {
            set(state => ({
                localImageModelStatus: {
                    ...state.localImageModelStatus,
                    [mode]: { loading: true, progress: get().localImageModelStatus[mode].progress, message: progress.status, loaded: false }
                }
            }));
        }
    };

    await initLocalImageModelService(mode, progress_callback);

    set(state => ({
        localImageModelStatus: {
            ...state.localImageModelStatus,
            [mode]: { loading: false, progress: 100, message: 'Ready', loaded: true }
        }
    }));
  },

  handleOnboardingComplete: (initialCharacter, initialWorld, openingPrompt) => {
    set({
      character: { ...INITIAL_CHARACTER_STATE, ...initialCharacter},
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

    const { character, world, gameState, settings } = get();

    let aiResponse: string;

    try {
        if (settings.textEngine === 'local') {
            await get().initializeLocalModel();
            aiResponse = await getLocalAIDrivenTurn(character, world, gameState.timeline, action);
        } else {
            aiResponse = await getAIDrivenTurn(character, world, gameState.timeline, action);
        }
        
        // Pre-load local image model if selected, but don't wait for it
        if (settings.imageEngine === 'local-performance' || settings.imageEngine === 'local-quality') {
            const mode = settings.imageEngine.replace('local-', '') as 'performance' | 'quality';
            get().initializeLocalImageModel(mode);
        }
        
        await parseAndApplyTags(aiResponse, set, get);
    } catch (error) {
        console.error("Error during AI turn:", error);
        toast({
            title: "AI Error",
            description: "The connection to the storytelling engine failed.",
            variant: "destructive"
        })
    }


    set(state => ({ gameState: { ...state.gameState, isLoading: false } }));
  },

  updateSettings: (newSettings) => {
    set(state => ({ settings: { ...state.settings, ...newSettings } }));
  },

  saveGame: () => {
    const state = get();
    const stateToSave: Partial<AppState> = {};
    SAVABLE_STATE_KEYS.forEach(key => {
        (stateToSave as any)[key] = state[key];
    });

    const json = JSON.stringify(stateToSave, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    saveAs(blob, `veritas-save-${Date.now()}.json`);
    toast({ title: "Game Saved", description: "Your progress has been saved locally.", variant: "default" });
  },

  loadGame: (json) => {
    try {
        const loadedState = JSON.parse(json);
        set(migrateSaveState(loadedState));
        toast({ title: "Game Loaded", description: "Your adventure continues.", variant: "default" });
    } catch(e) {
        console.error("Failed to load save file:", e);
        toast({
            title: "Load Failed",
            description: "The save file might be corrupted.",
            variant: "destructive"
        });
    }
  },

  exportGame: async () => {
    set(state => ({ gameState: { ...state.gameState, isLoading: true } }));
    toast({ title: "Exporting Saga", description: "Please wait while your files are being prepared...", variant: "default" });
    const { character, gameState, imagePrompts } = get();
    const zip = new JSZip();

    try {
        // 1. Add save.json
        const state = get();
        const stateToSave: Partial<AppState> = {};
        SAVABLE_STATE_KEYS.forEach(key => {
            (stateToSave as any)[key] = state[key];
        });
        zip.file('save.json', JSON.stringify(stateToSave, null, 2));

        // 2. Add prompts.txt
        zip.file('prompts.txt', imagePrompts.join('\n\n'));

        // 3. Add images
        const imagesFolder = zip.folder('images');
        if(imagesFolder) {
            let sceneCounter = 0;
            if (character.imageUrl) {
                const base64Data = character.imageUrl.split(',')[1];
                imagesFolder.file('character_current.jpg', base64Data, { base64: true });
            }
            (character.imageUrlHistory || []).forEach((url, index) => {
                const base64Data = url.split(',')[1];
                imagesFolder.file(`character_history_${index}.jpg`, base64Data, { base64: true });
            });
            for (const entry of gameState.storyLog) {
                if (entry.imageUrl) {
                    const base64Data = entry.imageUrl.split(',')[1];
                    imagesFolder.file(`scene_${sceneCounter++}.jpg`, base64Data, { base64: true });
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
        doc.text(`Veritas Saga`, margin, y);
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
        toast({ title: "Export Complete", description: "Your saga has been downloaded as a zip file.", variant: "default" });

    } catch (error) {
        console.error("Failed to export game:", error);
        toast({ title: "Export Failed", description: "An error occurred while creating the export file.", variant: "destructive" });
    } finally {
        set(state => ({ gameState: { ...state.gameState, isLoading: false } }));
    }
  },

  restartGame: () => {
    set({
      character: INITIAL_CHARACTER_STATE,
      world: INITIAL_WORLD_STATE,
      gameState: INITIAL_GAME_STATE,
      settings: INITIAL_SETTINGS_STATE,
      imagePrompts: [],
      localModelStatus: { loading: false, progress: 0, message: 'Not loaded', loaded: false },
    });
  }
}));