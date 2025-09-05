import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../store';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { SparklesIcon } from '../Icons';

export const NarrativePanel = () => {
    const { gameState, handlePlayerAction } = useStore(state => ({
        gameState: state.gameState,
        handlePlayerAction: state.handlePlayerAction
    }));
    const [playerInput, setPlayerInput] = useState('');
    const storyEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        storyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [gameState.storyLog]);

    const handleActionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (playerInput.trim() && !gameState.isLoading) {
            handlePlayerAction(playerInput.trim());
            setPlayerInput('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleActionSubmit(e);
        }
    }

    return (
        <div className="flex-grow flex flex-col h-full bg-secondary overflow-hidden">
            <div className="flex-grow overflow-y-auto p-4 md:p-6 space-y-6">
                {gameState.storyLog.map(entry => (
                    <div key={entry.id} className={`w-full flex ${entry.type === 'player' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-4xl p-4 rounded-lg shadow-md ${entry.type === 'player' ? 'bg-cyan-900/40' : 'bg-background'}`}>
                            {entry.imageUrl && <img src={entry.imageUrl} alt="Scene" className="rounded-lg mb-4 w-full h-auto object-cover max-h-[50vh]" />}
                            <p className="text-foreground whitespace-pre-wrap leading-relaxed">{entry.text}</p>
                        </div>
                    </div>
                ))}
                {gameState.isLoading && (
                     <div className="flex justify-start">
                        <div className="max-w-4xl p-4 rounded-lg shadow-md bg-background">
                            <div className="flex items-center space-x-2 text-muted-foreground">
                                <SparklesIcon className="w-5 h-5 animate-pulse" />
                                <span>Veritas is weaving the narrative...</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={storyEndRef} />
            </div>

            <div className="p-4 border-t border-border bg-background">
                <form onSubmit={handleActionSubmit} className="relative">
                    <Textarea
                        value={playerInput}
                        onChange={(e) => setPlayerInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="What do you do next?"
                        className="pr-24 min-h-[52px] resize-none"
                        disabled={gameState.isLoading}
                        rows={1}
                    />
                    <Button
                        type="submit"
                        className="absolute right-2.5 bottom-2.5"
                        disabled={gameState.isLoading}
                    >
                        Send
                    </Button>
                </form>
            </div>
        </div>
    );
};
