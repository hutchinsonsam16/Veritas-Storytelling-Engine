
export interface Skill {
  name: string;
  value: number;
}

export interface Item {
  name: string;
  description: string;
}

export interface Character {
  name: string;
  backstory: string;
  skills: Skill[];
  inventory: Item[];
  imageUrl?: string;
  status?: string;
}

export interface NPC {
  id: string;
  name: string;
  description: string;
  relationship: number; // -100 to 100
}

export interface Lore {
  [key: string]: string;
}

export interface WorldState {
  lore: Lore;
  npcs: NPC[];
}

export interface TimelineEvent {
  id: number;
  description: string;
  imageUrl?: string;
}

export enum GamePhase {
  ONBOARDING = 'ONBOARDING',
  PLAYING = 'PLAYING',
}

export type ImageGenerationMode = 'none' | 'character' | 'scene' | 'both';

export interface Settings {
    imageGenerationMode: ImageGenerationMode;
    imageTheme: string;
}

export interface GameState {
  phase: GamePhase;
  isLoading: boolean;
  storyLog: StoryEntry[];
  timeline: TimelineEvent[];
}

export interface StoryEntry {
    id: number;
    type: 'narrative' | 'player';
    text: string;
    imageUrl?: string;
}