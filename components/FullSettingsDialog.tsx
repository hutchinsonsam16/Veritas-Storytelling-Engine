import React, { useRef } from 'react';
import { useStore } from '../store';
import { ImageGenerationMode, Settings, TextEngine, ImageEngine, Theme, PanelId, ComponentVisibility } from '../types';
import { SaveIcon, UploadIcon, DownloadIcon, RefreshIcon } from './Icons';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from './ui/dialog';
import { useUIStore } from '../store/uiStore';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { themes } from '../lib/themes';
// FIX: Added missing import for Tabs components.
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const EngineButton = ({ active, onClick, children }: { active: boolean, onClick: () => void, children: React.ReactNode }) => (
    <Button variant={active ? 'default' : 'secondary'} onClick={onClick} className="w-full">
        {children}
    </Button>
);

const PanelOrderSelector = ({ order, onOrderChange }: { order: PanelId[], onOrderChange: (order: PanelId[]) => void }) => {
    const handleSelect = (index: number, value: PanelId) => {
        const newOrder = [...order];
        const oldIndex = newOrder.indexOf(value);
        [newOrder[index], newOrder[oldIndex]] = [newOrder[oldIndex], newOrder[index]]; // Swap
        onOrderChange(newOrder);
    };

    return (
        <div className="flex gap-2">
            {order.map((panelId, index) => (
                <div key={index} className="flex-1">
                    <Label className="text-xs">{`Slot ${index + 1}`}</Label>
                    <Select value={panelId} onValueChange={(value) => handleSelect(index, value as PanelId)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="character">Character</SelectItem>
                            <SelectItem value="narrative">Narrative</SelectItem>
                            <SelectItem value="context">Context</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            ))}
        </div>
    );
};


export const FullSettingsDialog: React.FC = () => {
    const { isOpen, setIsOpen } = useUIStore(state => ({ isOpen: state.isSettingsOpen, setIsOpen: state.setIsSettingsOpen }));
    const { 
        settings, updateSettings, saveGame, loadGame, exportGame, 
        gameState, restartGame, localModelStatus, initializeLocalModel, 
        localImageModelStatus, initializeLocalImageModel 
    } = useStore();

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleTextEngineChange = (engine: TextEngine) => {
        updateSettings({ textEngine: engine });
        if (engine === 'local' && !localModelStatus.loaded) {
            initializeLocalModel();
        }
    };

    const handleImageEngineChange = (engine: ImageEngine) => {
        updateSettings({ imageEngine: engine });
        if (engine === 'local-performance') {
            initializeLocalImageModel('performance');
        } else if (engine === 'local-quality') {
            initializeLocalImageModel('quality');
        }
    };

    const handleLoadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const json = e.target?.result as string;
                loadGame(json);
                setIsOpen(false);
            };
            reader.readAsText(file);
        }
    };

    const handleRestart = () => {
        if (window.confirm("Are you sure you want to restart? All unsaved progress will be lost.")) {
            restartGame();
            setIsOpen(false);
        }
    };

    const renderLocalModelStatus = (status: { message: string, loading: boolean, progress: number }) => (
        <div className="mt-2 text-xs text-muted-foreground">
            <p>Status: {status.message}</p>
            {status.loading && (
                <div className="w-full bg-secondary rounded-full h-1.5 mt-1">
                    <div className="bg-primary h-1.5 rounded-full" style={{ width: `${status.progress}%` }}></div>
                </div>
            )}
        </div>
    );
    
    const handleVisibilityChange = (key: keyof ComponentVisibility, value: boolean) => {
        updateSettings({ componentVisibility: { ...settings.componentVisibility, [key]: value } });
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-3xl grid-rows-[auto_1fr_auto]">
                <DialogHeader>
                    <DialogTitle className="text-primary text-2xl">Settings & Utilities</DialogTitle>
                    <DialogDescription>Configure AI engines, manage game data, and customize the interface.</DialogDescription>
                </DialogHeader>
                
                <div className="py-4 space-y-6 overflow-y-auto max-h-[70vh] pr-6">
                    <Tabs defaultValue="engine" className="w-full">
                        <TabsList className="grid w-full grid-cols-5">
                             <TabsTrigger value="engine">Engine</TabsTrigger>
                             <TabsTrigger value="style">Style</TabsTrigger>
                             <TabsTrigger value="layout">Layout</TabsTrigger>
                             <TabsTrigger value="accessibility">Access</TabsTrigger>
                             <TabsTrigger value="data">Data</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="engine" className="mt-4 space-y-4">
                             <div className="grid grid-cols-2 gap-4">
                                 <div>
                                    <Label className="font-semibold mb-2 block">Text Generation</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <EngineButton active={settings.textEngine === 'gemini'} onClick={() => handleTextEngineChange('gemini')}>Cloud (Gemini)</EngineButton>
                                        <EngineButton active={settings.textEngine === 'local'} onClick={() => handleTextEngineChange('local')}>Local (In-Browser)</EngineButton>
                                    </div>
                                    {settings.textEngine === 'local' && renderLocalModelStatus(localModelStatus)}
                                </div>
                                <div>
                                    <Label className="font-semibold mb-2 block">Image Generation</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <EngineButton active={settings.imageEngine === 'gemini'} onClick={() => handleImageEngineChange('gemini' )}>Cloud (Gemini)</EngineButton>
                                        <EngineButton active={settings.imageEngine === 'local-performance'} onClick={() => handleImageEngineChange('local-performance')}>Local (Perf.)</EngineButton>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant={settings.imageEngine === 'local-quality' ? 'default' : 'secondary'} onClick={() => handleImageEngineChange('local-quality')} className="w-full">Local (Quality)</Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Slow, high realism. Recommended 8GB+ RAM.</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    {(settings.imageEngine === 'local-performance' || settings.imageEngine === 'local-quality') &&
                                        renderLocalModelStatus(localImageModelStatus[settings.imageEngine.replace('local-', '') as 'performance' | 'quality'])}
                                </div>
                            </div>
                        </TabsContent>
                        
                        <TabsContent value="style" className="mt-4 space-y-4">
                             <div>
                                <Label className="font-semibold mb-2 block">UI Theme</Label>
                                <Select value={settings.theme} onValueChange={(v) => updateSettings({ theme: v as Theme })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(themes).map(themeKey => (
                                            <SelectItem key={themeKey} value={themeKey}>{themeKey.charAt(0).toUpperCase() + themeKey.slice(1)}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="font-semibold mb-2 block">Image Generation Mode</Label>
                                <div className="flex flex-wrap gap-2">
                                    {(['both', 'scene', 'character', 'none'] as ImageGenerationMode[]).map(mode => (
                                    <Button
                                        key={mode}
                                        size="sm"
                                        variant={settings.imageGenerationMode === mode ? 'default' : 'secondary'}
                                        onClick={() => updateSettings({ imageGenerationMode: mode })}
                                    >
                                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                    </Button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="theme-input" className="font-semibold mb-2 block">Image Style Keywords</Label>
                                <Input
                                    id="theme-input"
                                    value={settings.imageTheme}
                                    onChange={(e) => updateSettings({ imageTheme: e.target.value })}
                                    placeholder="e.g., cyberpunk, watercolor, photorealistic..."
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="layout" className="mt-4 space-y-4">
                            <div>
                                <Label className="font-semibold mb-2 block">Panel Order</Label>
                                <PanelOrderSelector order={settings.layout.order} onOrderChange={(order) => updateSettings({ layout: {...settings.layout, order} })}/>
                            </div>
                             <div>
                                <Label className="font-semibold mb-2 block">Character Panel Components</Label>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                    {Object.entries(settings.componentVisibility).map(([key, value]) => (
                                        <div key={key} className="flex items-center space-x-2">
                                            <Switch id={key} checked={value} onCheckedChange={(checked) => handleVisibilityChange(key as keyof ComponentVisibility, checked)} />
                                            <Label htmlFor={key} className="text-sm">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="accessibility" className="mt-4 space-y-4">
                            <div>
                                <Label htmlFor="font-scale" className="font-semibold mb-2 block">Font Size ({settings.fontScale * 100}%)</Label>
                                <input
                                    type="range"
                                    id="font-scale"
                                    min="0.8" max="1.5" step="0.1"
                                    value={settings.fontScale}
                                    onChange={(e) => updateSettings({ fontScale: parseFloat(e.target.value) })}
                                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                               <Switch id="animations" checked={settings.disableAnimations} onCheckedChange={(checked) => updateSettings({ disableAnimations: checked })} />
                               <Label htmlFor="animations">Disable Animations</Label>
                            </div>
                             <div>
                                <Label className="font-semibold mb-2 block">High Contrast Mode</Label>
                               <Button 
                                    variant={settings.theme === 'high-contrast' ? 'default' : 'secondary'}
                                    onClick={() => updateSettings({ theme: settings.theme === 'high-contrast' ? 'veritas' : 'high-contrast' })}
                                >
                                    Toggle High Contrast
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="data" className="mt-4 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <Button onClick={saveGame} disabled={gameState.isLoading}>
                                    <SaveIcon className="w-4 h-4 mr-2"/> Save Game
                                </Button>
                                <Button onClick={handleLoadClick} disabled={gameState.isLoading} variant="secondary">
                                    <UploadIcon className="w-4 h-4 mr-2"/> Load Game
                                </Button>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                                <Button onClick={exportGame} disabled={gameState.isLoading} variant="secondary">
                                    <DownloadIcon className="w-4 h-4 mr-2"/> Export Saga
                                </Button>
                            </div>
                            <Separator />
                            <div>
                                <h3 className="font-semibold text-destructive mb-3">Danger Zone</h3>
                                <Button onClick={handleRestart} disabled={gameState.isLoading} variant="destructive" className="w-full">
                                    <RefreshIcon className="w-4 h-4 mr-2"/> Restart Game
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};