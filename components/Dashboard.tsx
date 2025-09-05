import React, { useState } from 'react';
import { UserCircleIcon, GlobeIcon, UsersIcon } from './Icons';
import { useStore } from '../store';

type DashboardTab = 'character' | 'world' | 'npcs';

const TabButton = ({ isActive, onClick, children }: { isActive: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={`flex-1 p-3 text-sm font-semibold transition-colors duration-200 ${
      isActive ? 'bg-slate-700 text-cyan-300' : 'bg-slate-800 text-gray-400 hover:bg-slate-700/50'
    }`}
  >
    {children}
  </button>
);


export const Dashboard = () => {
  const character = useStore(state => state.character);
  const world = useStore(state => state.world);

  const [activeTab, setActiveTab] = useState<DashboardTab>('character');

  const renderContent = () => {
    switch (activeTab) {
      case 'character':
        return (
          <div className="p-4 space-y-4">
            <h3 className="text-xl font-bold text-cyan-300">{character.name}</h3>
            {character.imageUrl && <img src={character.imageUrl} alt={character.name} className="rounded-lg shadow-lg" />}
            
            <div>
              <h4 className="font-semibold text-gray-200 border-b border-slate-600 pb-1 mb-2">Current Status</h4>
              <blockquote className="border-l-4 border-cyan-500 pl-4 py-2 bg-slate-900/50 my-2">
                <p className="text-sm text-gray-300 italic">{character.status || "Ready for action."}</p>
              </blockquote>
            </div>

            <div>
              <h4 className="font-semibold text-gray-200 border-b border-slate-600 pb-1 mb-2">Backstory</h4>
              <p className="text-sm text-gray-300">{character.backstory}</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-200 border-b border-slate-600 pb-1 mb-2">Skills</h4>
              <ul className="space-y-1 text-sm">
                {character.skills.length > 0 ? character.skills.map(skill => (
                  <li key={skill.name} className="flex justify-between">
                    <span>{skill.name}</span>
                    <span className="font-mono text-cyan-400">{skill.value}</span>
                  </li>
                )) : <li className="text-gray-500">No skills defined.</li>}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-200 border-b border-slate-600 pb-1 mb-2">Inventory</h4>
              <ul className="space-y-2 text-sm">
                {character.inventory.length > 0 ? character.inventory.map(item => (
                  <li key={item.name}>
                    <p className="font-semibold text-gray-300">{item.name}</p>
                    <p className="text-xs text-gray-400 pl-2">{item.description}</p>
                  </li>
                )) : <li className="text-gray-500">Inventory is empty.</li>}
              </ul>
            </div>
          </div>
        );
      case 'world':
        return (
          <div className="p-4">
            <h3 className="text-xl font-bold text-cyan-300 mb-4">World Knowledge</h3>
            <ul className="space-y-3 text-sm">
              {Object.entries(world.lore).map(([key, value]) => (
                <li key={key}>
                  <p className="font-semibold text-gray-300">{key}</p>
                  {/* FIX: The `value` from `Object.entries` is inferred as `unknown`. Explicitly converting it to a string ensures type safety for rendering. */}
                  <p className="text-xs text-gray-400 pl-2">{String(value)}</p>
                </li>
              ))}
            </ul>
          </div>
        );
      case 'npcs':
        return (
          <div className="p-4">
            <h3 className="text-xl font-bold text-cyan-300 mb-4">Active NPCs</h3>
            <ul className="space-y-3">
               {world.npcs.length > 0 ? world.npcs.map(npc => (
                <li key={npc.id} className="text-sm">
                  <p className="font-semibold text-gray-300">{npc.name} <span className={`font-mono text-xs ${npc.relationship > 0 ? 'text-green-400' : npc.relationship < 0 ? 'text-red-400' : 'text-gray-400'}`}>({npc.relationship})</span></p>
                  <p className="text-xs text-gray-400 pl-2">{npc.description}</p>
                </li>
              )) : <li className="text-gray-500 text-sm">No NPCs in the current scene.</li>}
            </ul>
          </div>
        );
    }
  };

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-2xl h-full flex flex-col">
      <div className="flex border-b border-slate-700">
        <TabButton isActive={activeTab === 'character'} onClick={() => setActiveTab('character')}>
            <UserCircleIcon className="w-5 h-5 mx-auto"/>
        </TabButton>
        <TabButton isActive={activeTab === 'world'} onClick={() => setActiveTab('world')}>
            <GlobeIcon className="w-5 h-5 mx-auto"/>
        </TabButton>
        <TabButton isActive={activeTab === 'npcs'} onClick={() => setActiveTab('npcs')}>
            <UsersIcon className="w-5 h-5 mx-auto"/>
        </TabButton>
      </div>
      <div className="flex-grow overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};