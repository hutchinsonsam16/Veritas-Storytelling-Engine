import React, { useState } from 'react';
import { useStore } from '../../store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { ImageGenerationMode } from '../../types';
import { Button } from '../ui/button';
import { RelationshipWeb } from '../visualizations/RelationshipWeb';
import { InteractiveMap } from '../visualizations/InteractiveMap';

export const ContextPanel = () => {
    const { world, settings, updateSettings } = useStore(state => ({
        world: state.world,
        settings: state.settings,
        updateSettings: state.updateSettings
    }));
    const [loreSearch, setLoreSearch] = useState('');

    const filteredLore = Object.entries(world.lore).filter(([key, value]) => 
        !key.toLowerCase().startsWith('location:') &&
        (key.toLowerCase().includes(loreSearch.toLowerCase()) ||
        String(value).toLowerCase().includes(loreSearch.toLowerCase()))
    );

    return (
        <div className="h-full flex flex-col bg-background p-4 overflow-hidden">
            <Tabs defaultValue="npcs" className="flex-grow flex flex-col">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="npcs">NPCs</TabsTrigger>
                    <TabsTrigger value="web">Web</TabsTrigger>
                    <TabsTrigger value="map">Map</TabsTrigger>
                    <TabsTrigger value="lore">Lore</TabsTrigger>
                    <TabsTrigger value="quick">Quick</TabsTrigger>
                </TabsList>

                <TabsContent value="npcs" className="flex-grow overflow-y-auto mt-4 pr-2">
                    {world.npcs.length > 0 ? (
                        <div className="space-y-3">
                            {world.npcs.map(npc => (
                                <Card key={npc.id}>
                                    <CardHeader className="p-4">
                                        <CardTitle className="text-base flex justify-between items-center">
                                            {npc.name}
                                            <span className={`font-mono text-sm px-2 py-0.5 rounded-md ${npc.relationship > 10 ? 'bg-green-800 text-green-300' : npc.relationship < -10 ? 'bg-red-800 text-red-300' : 'bg-secondary'}`}>
                                                {npc.relationship}
                                            </span>
                                        </CardTitle>
                                        <CardDescription className="text-xs pt-1">{npc.description}</CardDescription>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-muted-foreground">No NPCs encountered yet.</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="web" className="flex-grow overflow-y-auto mt-4">
                    <RelationshipWeb />
                </TabsContent>

                <TabsContent value="map" className="flex-grow overflow-y-auto mt-4">
                    <InteractiveMap />
                </TabsContent>

                <TabsContent value="lore" className="flex-grow flex flex-col overflow-hidden mt-4">
                    <Input
                        placeholder="Search lore..."
                        value={loreSearch}
                        onChange={(e) => setLoreSearch(e.target.value)}
                        className="mb-4"
                    />
                    <div className="flex-grow overflow-y-auto space-y-2 pr-2">
                        {filteredLore.length > 0 ? filteredLore.map(([key, value]) => (
                             <div key={key} className="text-sm">
                                <p className="font-semibold text-foreground">{key}</p>
                                <p className="text-xs text-muted-foreground pl-2">{String(value)}</p>
                            </div>
                        )) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-muted-foreground">No matching lore entries.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="quick" className="flex-grow overflow-y-auto mt-4 space-y-6">
                    <div>
                        <h4 className="font-semibold mb-2 text-sm">Image Generation</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {(['both', 'scene', 'character', 'none'] as ImageGenerationMode[]).map(mode => (
                                <Button
                                    key={mode}
                                    variant={settings.imageGenerationMode === mode ? 'default' : 'secondary'}
                                    size="sm"
                                    onClick={() => updateSettings({ imageGenerationMode: mode })}
                                >
                                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                </Button>
                            ))}
                        </div>
                    </div>
                     <div>
                        <h4 className="font-semibold mb-2 text-sm">Image Style Keywords</h4>
                        <Input
                            value={settings.imageTheme}
                            onChange={(e) => updateSettings({ imageTheme: e.target.value })}
                            placeholder="e.g., epic fantasy art..."
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};