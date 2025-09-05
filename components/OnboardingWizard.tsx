import React, { useState } from 'react';
import type { Character, WorldState } from '../types';
import { SparklesIcon } from './Icons';
import { useStore } from '../store';

type Step = 'welcome' | 'world' | 'character' | 'opening';

export const OnboardingWizard = () => {
  const handleOnboardingComplete = useStore(state => state.handleOnboardingComplete);

  const [step, setStep] = useState<Step>('welcome');
  const [world, setWorld] = useState<WorldState>({ lore: { Genre: "Epic Fantasy", "Core Concept": "A realm of high fantasy teetering on the edge of an industrial revolution, where magic clashes with technology." }, npcs: [] });
  const [character, setCharacter] = useState<Character>({ name: "Aella", backstory: "A former royal guard, exiled after a political conspiracy.", skills: [{name: "Swordsmanship", value: 75}, {name: "Perception", value: 60}], inventory: [{name: "Steel Longsword", description: "A well-balanced and reliable blade."}] });
  const [openingPrompt, setOpeningPrompt] = useState<string>("Describe my character, Aella, waking up in a damp, moss-covered cave with no memory of how she arrived. The only light comes from glowing fungi on the walls.");

  const handleWorldChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newLore = { ...world.lore, 'Core Concept': e.target.value };
    setWorld({ ...world, lore: newLore });
  };

  const handleCharacterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCharacter({ ...character, [e.target.name]: e.target.value });
  };
  
  const handleStart = () => {
    handleOnboardingComplete(character, world, openingPrompt);
  };

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return (
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-2">Veritas</h1>
            <h2 className="text-2xl text-cyan-300 mb-6">The Unchained Storytelling Engine</h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">You are the author. The world is your canvas. The story is yours to command. There are no limits, no rails, no judgments. Only the narrative you wish to create.</p>
            <button onClick={() => setStep('world')} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all transform hover:scale-105">
              Forge Your Reality
            </button>
          </div>
        );
      case 'world':
        return (
          <div className="w-full max-w-2xl">
            <h2 className="text-3xl font-bold text-cyan-300 mb-4">The World Anvil</h2>
            <p className="text-gray-300 mb-6">Describe the core concept of your world. What is its genre, its mood, its central conflict? Be as brief or as detailed as you desire.</p>
            <textarea
              value={world.lore['Core Concept'] || ""}
              onChange={handleWorldChange}
              className="w-full h-48 p-4 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-none"
              placeholder="e.g., A cyberpunk dystopia ruled by AI, a magical kingdom hidden in the clouds..."
            />
            <div className="flex justify-end mt-6">
              <button onClick={() => setStep('character')} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg transition-transform transform hover:scale-105">
                Next: Create Your Avatar
              </button>
            </div>
          </div>
        );
      case 'character':
        return (
          <div className="w-full max-w-2xl">
            <h2 className="text-3xl font-bold text-cyan-300 mb-4">The Character Crucible</h2>
            <p className="text-gray-300 mb-6">Who are you in this world? Define your protagonist.</p>
            <div className="space-y-4">
              <input
                type="text"
                name="name"
                value={character.name}
                onChange={handleCharacterChange}
                placeholder="Character Name"
                className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
              <textarea
                name="backstory"
                value={character.backstory}
                onChange={handleCharacterChange}
                placeholder="Character Backstory"
                className="w-full h-32 p-3 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-none"
              />
            </div>
            <div className="flex justify-between mt-6">
               <button onClick={() => setStep('world')} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-6 rounded-lg transition-transform transform hover:scale-105">
                Back to World
              </button>
              <button onClick={() => setStep('opening')} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg transition-transform transform hover:scale-105">
                Next: The First Scene
              </button>
            </div>
          </div>
        );
      case 'opening':
        return (
          <div className="w-full max-w-2xl">
            <h2 className="text-3xl font-bold text-cyan-300 mb-4">The Opening Scene</h2>
            <p className="text-gray-300 mb-6">Describe the very first moment of your story. This will be the initial prompt given to the Storytelling Engine.</p>
            <textarea
              value={openingPrompt}
              onChange={(e) => setOpeningPrompt(e.target.value)}
              className="w-full h-48 p-4 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-none"
              placeholder="e.g., Describe my character waking up at the scene of a crime, with no memory of the past 24 hours."
            />
            <div className="flex justify-between mt-6">
                <button onClick={() => setStep('character')} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-6 rounded-lg transition-transform transform hover:scale-105">
                    Back to Character
                </button>
                <button onClick={handleStart} className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all transform hover:scale-105 flex items-center space-x-2">
                    <SparklesIcon className="w-6 h-6" />
                    <span>Begin The Saga</span>
                </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-900 bg-opacity-80 backdrop-blur-sm">
      <div className="w-full transition-all duration-500">
        {renderStep()}
      </div>
    </div>
  );
};