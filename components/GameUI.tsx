import React from 'react';
import { Codex } from './Codex';
import { Dashboard } from './Dashboard';

export const GameUI = () => {
  return (
    <div className="h-screen w-screen p-4 flex flex-col md:flex-row gap-4 bg-slate-900 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
      {/* Main Column (Codex) */}
      <div className="flex-grow md:w-2/3 h-full">
        <Codex />
      </div>

      {/* Side Column (Dashboard) */}
      <div className="md:w-1/3 h-full flex-shrink-0">
        <Dashboard />
      </div>
    </div>
  );
};
