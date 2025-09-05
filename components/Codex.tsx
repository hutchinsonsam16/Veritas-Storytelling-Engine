import React, { useState, useRef, useEffect } from 'react';
import { BookOpenIcon, ClockIcon, UsersIcon } from './Icons';
import { Loader } from './Loader';
import { useStore } from '../store';

type CodexTab = 'narrative' | 'timeline' | 'relationships';


const TabButton = ({ isActive, onClick, children }: { isActive: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-colors duration-200 ${
        isActive ? 'border-b-2 border-cyan-400 text-cyan-300' : 'border-b-2 border-transparent text-gray-400 hover:text-white'
      }`}
    >
      {children}
    </button>
  );

export const Codex = () => {
  const gameState = useStore(state => state.gameState);
  const onPlayerAction = useStore(state => state.handlePlayerAction);

  const [activeTab, setActiveTab] = useState<CodexTab>('narrative');
  const [playerInput, setPlayerInput] = useState('');
  const storyEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    storyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameState.storyLog]);

  const handleActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerInput.trim() && !gameState.isLoading) {
      onPlayerAction(playerInput.trim());
      setPlayerInput('');
    }
  };

  const renderNarrative = () => (
    <div className="flex-grow overflow-y-auto p-4 md:p-6 space-y-6">
      {gameState.storyLog.map(entry => (
        <div key={entry.id} className={`w-full flex ${entry.type === 'player' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-4xl p-4 rounded-lg shadow-md ${entry.type === 'player' ? 'bg-cyan-900/70' : 'story-entry-bg'}`}>
              {entry.imageUrl && <img src={entry.imageUrl} alt="Scene" className="rounded-lg mb-4 w-full h-auto object-cover max-h-96" />}
              <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">{entry.text}</p>
            </div>
        </div>
      ))}
      <div ref={storyEndRef} />
    </div>
  );

    const renderTimeline = () => (
        <div className="flex-grow overflow-y-auto p-4 md:p-6">
            <h2 className="text-2xl font-bold text-cyan-300 mb-6">Story Timeline</h2>
            <div className="relative border-l-2 border-slate-600 pl-6 space-y-8">
                {gameState.timeline.length > 0 ? gameState.timeline.map((event, index) => (
                    <div key={event.id} className="relative">
                        <div className="absolute -left-[33px] top-1 w-4 h-4 bg-cyan-400 rounded-full border-4 border-slate-800"></div>
                        <p className="text-gray-300">{event.description}</p>
                         {event.imageUrl && <img src={event.imageUrl} alt="Timeline event" className="rounded-lg mt-2 w-full max-w-sm h-auto object-cover" />}
                    </div>
                )) : <p className="text-gray-500">No major world events have been recorded yet.</p>}
            </div>
        </div>
    );
    
    // Placeholder for relationship web
    const renderRelationships = () => (
         <div className="flex-grow overflow-y-auto p-4 md:p-6 text-center">
            <h2 className="text-2xl font-bold text-cyan-300 mb-6">Relationship Web</h2>
            <UsersIcon className="w-24 h-24 mx-auto text-slate-600" />
            <p className="text-gray-500 mt-4">This feature is under development. It will visually map your character's relationships with NPCs and factions.</p>
        </div>
    );


  const renderContent = () => {
    switch (activeTab) {
      case 'narrative':
        return renderNarrative();
      case 'timeline':
        return renderTimeline();
      case 'relationships':
        return renderRelationships();
    }
  };
  
  return (
    <div className="bg-slate-900/70 backdrop-blur-sm rounded-lg shadow-2xl h-full flex flex-col">
        <div className="border-b border-slate-700 px-4">
            <div className="flex -mb-px">
                <TabButton isActive={activeTab === 'narrative'} onClick={() => setActiveTab('narrative')}>
                    <BookOpenIcon className="w-5 h-5"/><span>Narrative</span>
                </TabButton>
                <TabButton isActive={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')}>
                    <ClockIcon className="w-5 h-5"/><span>Timeline</span>
                </TabButton>
                <TabButton isActive={activeTab === 'relationships'} onClick={() => setActiveTab('relationships')}>
                    <UsersIcon className="w-5 h-5"/><span>Relationships</span>
                </TabButton>
            </div>
        </div>
      
      {renderContent()}

      <div className="p-4 border-t border-slate-700">
        {gameState.isLoading ? (
            <Loader text="Veritas is weaving the narrative..."/>
        ) : (
          <form onSubmit={handleActionSubmit} className="flex space-x-2">
            <input
              type="text"
              value={playerInput}
              onChange={(e) => setPlayerInput(e.target.value)}
              placeholder="What do you do next?"
              className="flex-grow p-3 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none text-white"
              disabled={gameState.isLoading}
            />
            <button
              type="submit"
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:bg-slate-500 disabled:cursor-not-allowed"
              disabled={gameState.isLoading}
            >
              Send
            </button>
          </form>
        )}
      </div>
    </div>
  );
};