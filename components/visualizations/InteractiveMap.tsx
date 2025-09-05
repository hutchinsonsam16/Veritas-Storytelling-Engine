import React, { useMemo, useState } from 'react';
import { useStore } from '../../store';
import { GlobeIcon } from '../Icons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

// A simple hashing function to get a consistent position for a location name
const simpleHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

export const InteractiveMap = () => {
    const { world } = useStore(state => ({ world: state.world }));
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

    const locations = useMemo(() => {
        return Object.entries(world.lore)
            .filter(([key]) => key.toLowerCase().startsWith('location:'))
            .map(([key, description]) => {
                const name = key.replace(/^location:/i, '').trim();
                const x = (simpleHash(name) % 80) + 10; // % width + padding
                const y = (simpleHash(name.split('').reverse().join('')) % 80) + 10; // % height + padding
                return { name, description, x, y };
            });
    }, [world.lore]);
    
    if (locations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <GlobeIcon className="w-16 h-16 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground mt-4 text-sm">No locations have been defined in the world lore yet.</p>
                <p className="text-muted-foreground text-xs mt-1">Define lore with "Location: [Name]" to see it on the map.</p>
            </div>
        )
    }

    return (
        <div className="p-4 h-full flex flex-col items-center justify-center">
            <h3 className="text-lg font-semibold mb-4 text-primary">World Map</h3>
            <TooltipProvider>
                <div className="relative w-full max-w-lg aspect-video bg-secondary/50 rounded-lg border border-border overflow-hidden">
                    {/* Placeholder for map background texture */}
                    {locations.map(loc => (
                        <Tooltip key={loc.name}>
                            <TooltipTrigger asChild>
                                <button
                                    className="absolute -translate-x-1/2 -translate-y-1/2"
                                    style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                                    onClick={() => setSelectedLocation(selectedLocation === loc.name ? null : loc.name)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                                        className={`transition-all duration-200 ${selectedLocation === loc.name ? 'text-primary scale-150' : 'text-foreground'}`}>
                                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                                        <circle cx="12" cy="10" r="3"></circle>
                                    </svg>
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{loc.name}</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>
            </TooltipProvider>
            <div className="mt-4 w-full max-w-lg text-sm p-4 bg-secondary/50 rounded-lg border border-border h-24 overflow-y-auto">
                {selectedLocation ? (
                    <div>
                        <h4 className="font-bold text-primary">{selectedLocation}</h4>
                        <p className="text-muted-foreground text-xs">{locations.find(l => l.name === selectedLocation)?.description}</p>
                    </div>
                ) : (
                    <p className="text-muted-foreground text-center">Select a location to view details.</p>
                )}
            </div>
        </div>
    );
};