import React, { useState, useRef } from 'react';
import type { Character, WorldState } from '../types';
import { SparklesIcon, UploadIcon } from './Icons';
import { useStore } from '../store';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

type Step = 'welcome' | 'world' | 'character' | 'opening';

export const OnboardingWizard = () => {
  const { handleOnboardingComplete, loadGame } = useStore(state => ({
    handleOnboardingComplete: state.handleOnboardingComplete,
    loadGame: state.loadGame,
  }));
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('welcome');
  const [world, setWorld] = useState<WorldState>({ lore: { Genre: "Epic Fantasy", "Core Concept": "A realm of high fantasy teetering on the edge of an industrial revolution, where magic clashes with technology." }, npcs: [] });
  const [character, setCharacter] = useState<Character>({ name: "Aella", backstory: "A former royal guard, exiled after a political conspiracy.", skills: [{name: "Swordsmanship", value: 75}, {name: "Perception", value: 60}], inventory: [{name: "Steel Longsword", description: "A well-balanced and reliable blade."}], imageUrlHistory: [] });
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

  const handleLoadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = e.target?.result as string;
          loadGame(json);
        } catch (error) {
          console.error("Failed to load or parse game file:", error);
        }
      };
      reader.readAsText(file);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return (
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500 mb-2">Veritas</h1>
            <h2 className="text-2xl text-primary mb-6">The Unchained Storytelling Engine</h2>
            <p className="text-lg text-muted-foreground mb-8">You are the author. The world is your canvas. The story is yours to command. There are no limits, no rails, no judgments. Only the narrative you wish to create.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" onClick={() => setStep('world')}>
                Forge Your Reality
              </Button>
              <Button size="lg" variant="secondary" onClick={handleLoadClick}>
                <UploadIcon className="w-5 h-5 mr-2"/>
                Load Game
              </Button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
            </div>
          </div>
        );
      case 'world':
        return (
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="text-primary text-3xl">The World Anvil</CardTitle>
              <CardDescription>Describe the core concept of your world. What is its genre, its mood, its central conflict?</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={world.lore['Core Concept'] || ""}
                onChange={handleWorldChange}
                className="h-48 resize-none text-base"
                placeholder="e.g., A cyberpunk dystopia ruled by AI, a magical kingdom hidden in the clouds..."
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={() => setStep('character')}>Next: Create Your Avatar</Button>
            </CardFooter>
          </Card>
        );
      case 'character':
        return (
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="text-primary text-3xl">The Character Crucible</CardTitle>
              <CardDescription>Who are you in this world? Define your protagonist.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Character Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={character.name}
                  onChange={handleCharacterChange}
                  placeholder="e.g., Aella, Jax, Unit-734"
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="backstory">Character Backstory</Label>
                <Textarea
                  id="backstory"
                  name="backstory"
                  value={character.backstory}
                  onChange={handleCharacterChange}
                  placeholder="e.g., A disgraced knight seeking redemption, a rogue AI that escaped its creators..."
                  className="h-32 resize-none"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
               <Button variant="secondary" onClick={() => setStep('world')}>Back to World</Button>
               <Button onClick={() => setStep('opening')}>Next: The First Scene</Button>
            </CardFooter>
          </Card>
        );
      case 'opening':
        return (
           <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="text-primary text-3xl">The Opening Scene</CardTitle>
              <CardDescription>Describe the very first moment of your story. This will be the initial prompt given to the Storytelling Engine.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={openingPrompt}
                onChange={(e) => setOpeningPrompt(e.target.value)}
                className="h-48 resize-none"
                placeholder="e.g., Describe my character waking up at the scene of a crime, with no memory of the past 24 hours."
              />
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="secondary" onClick={() => setStep('character')}>Back to Character</Button>
                <Button size="lg" onClick={handleStart}>
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    Begin The Saga
                </Button>
            </CardFooter>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background">
      <div className="w-full transition-all duration-500">
        {renderStep()}
      </div>
    </div>
  );
};
