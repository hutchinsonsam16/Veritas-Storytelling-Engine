import React, { useRef } from 'react';
import { useStore } from '../store';
import { ImageGenerationMode, Settings } from '../types';
import { SaveIcon, UploadIcon, DownloadIcon } from './Icons';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { settings, updateSettings, saveGame, loadGame, exportGame, gameState } = useStore(state => ({
    settings: state.settings,
    updateSettings: state.updateSettings,
    saveGame: state.saveGame,
    loadGame: state.loadGame,
    exportGame: state.exportGame,
    gameState: state.gameState,
  }));
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSettingsChange = (newSettings: Partial<Settings>) => {
    updateSettings(newSettings);
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
          onClose(); // Close modal after loading
        } catch (error) {
          console.error("Failed to load or parse game file:", error);
          alert("Error: Could not load the save file. It may be corrupted.");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-lg text-gray-200">
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-cyan-300">Settings & Utilities</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Image Generation Settings */}
          <div>
            <h3 className="font-semibold mb-2">Image Generation</h3>
            <div className="flex flex-wrap gap-2">
              {(['both', 'scene', 'character', 'none'] as ImageGenerationMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => handleSettingsChange({ imageGenerationMode: mode })}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${settings.imageGenerationMode === mode ? 'bg-cyan-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Image Theme */}
          <div>
            <h3 className="font-semibold mb-2">Image Theme / Style</h3>
            <input
              type="text"
              value={settings.imageTheme}
              onChange={(e) => handleSettingsChange({ imageTheme: e.target.value })}
              placeholder="e.g., cyberpunk, watercolor, photorealistic..."
              className="w-full p-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
             <p className="text-xs text-gray-400 mt-1">This text is prepended to every image prompt.</p>
          </div>

          {/* Game Actions */}
          <div>
            <h3 className="font-semibold mb-3">Game Data</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
               <button onClick={saveGame} disabled={gameState.isLoading} className="flex items-center justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-500 rounded-lg disabled:bg-slate-600 disabled:cursor-not-allowed">
                <SaveIcon className="w-5 h-5"/>
                <span>Save Game</span>
               </button>
               <button onClick={handleLoadClick} disabled={gameState.isLoading} className="flex items-center justify-center gap-2 p-3 bg-slate-600 hover:bg-slate-500 rounded-lg disabled:bg-slate-600 disabled:cursor-not-allowed">
                <UploadIcon className="w-5 h-5"/>
                <span>Load Game</span>
               </button>
               <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
               <button onClick={exportGame} disabled={gameState.isLoading} className="flex items-center justify-center gap-2 p-3 bg-green-600 hover:bg-green-500 rounded-lg disabled:bg-slate-600 disabled:cursor-not-allowed">
                <DownloadIcon className="w-5 h-5"/>
                <span>Export Saga</span>
               </button>
            </div>
          </div>

        </div>
        <div className="p-4 bg-slate-900/50 border-t border-slate-700 text-right">
             <button onClick={onClose} className="px-6 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg">Close</button>
        </div>
      </div>
    </div>
  );
};
