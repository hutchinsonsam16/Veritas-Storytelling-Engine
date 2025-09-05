
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
  imageUrlHistory: string[];
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
export type TextEngine = 'gemini' | 'local';
export type ImageEngine = 'gemini' | 'local-performance' | 'local-quality';

export type Theme = 'veritas' | 'sci-fi' | 'fantasy' | 'high-contrast';

export type PanelId = 'character' | 'narrative' | 'context';
export interface PanelLayout {
    order: PanelId[];
    sizes: number[];
}

export interface ComponentVisibility {
    characterPortrait: boolean;
    characterStatus: boolean;
    characterSkills: boolean;
    characterInventory: boolean;
    characterBackstory: boolean;
    characterProgression: boolean;
}

export interface Settings {
    // Engine
    imageGenerationMode: ImageGenerationMode;
    imageTheme: string;
    textEngine: TextEngine;
    imageEngine: ImageEngine;
    // UI & Theme
    theme: Theme;
    // Accessibility
    fontScale: number;
    disableAnimations: boolean;
    // Layout
    layout: PanelLayout;
    componentVisibility: ComponentVisibility;
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