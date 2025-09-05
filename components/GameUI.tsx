import React, { useState } from 'react';
import { Codex } from './Codex';
import { Dashboard } from './Dashboard';
import { SettingsModal } from './SettingsModal';
import { CogIcon } from './Icons';

export const GameUI = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="relative h-screen w-screen p-4 flex flex-col md:flex-row gap-4 bg-slate-900 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
      {/* Main Column (Codex) */}
      <div className="flex-grow md:w-2/3 h-full">
        <Codex />
      </div>

      {/* Side Column (Dashboard) */}
      <div className="md:w-1/3 h-full flex-shrink-0">
        <Dashboard />
      </div>

      {/* Settings Button */}
      <button
        onClick={() => setIsSettingsOpen(true)}
        className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors p-2 rounded-full bg-slate-800/50 hover:bg-slate-700/70"
        aria-label="Open Settings"
      >
        <CogIcon className="w-6 h-6" />
      </button>

      {/* Settings Modal */}
      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
    </div>
  );
};