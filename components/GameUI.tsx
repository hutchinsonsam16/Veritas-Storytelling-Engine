import React, { useMemo } from 'react';
import { useUIStore } from '../store/uiStore';
import { useStore } from '../store';
import { CharacterPanel } from './panels/CharacterPanel';
import { NarrativePanel } from './panels/NarrativePanel';
import { ContextPanel } from './panels/ContextPanel';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { PanelLeftClose, PanelRightClose, PanelLeftOpen, PanelRightOpen, CogIcon } from './Icons';
import { FullSettingsDialog } from './FullSettingsDialog';
import { Toaster } from './ui/toaster';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from './ui/resizable';

export const GameUI = () => {
  const { 
    isLeftPanelCollapsed, 
    isRightPanelCollapsed, 
    toggleLeftPanel, 
    toggleRightPanel,
    setIsSettingsOpen 
  } = useUIStore();
  
  const { layout, setLayout } = useStore(state => ({
    layout: state.settings.layout,
    setLayout: (layout: any) => state.updateSettings({ layout })
  }));

  const onLayout = (sizes: number[]) => {
    setLayout({ ...layout, sizes });
  };

  const panels = useMemo(() => ({
    character: <CharacterPanel />,
    narrative: <NarrativePanel />,
    context: <ContextPanel />,
  }), []);

  return (
    <TooltipProvider>
      <div className="h-screen w-screen bg-background text-foreground flex flex-col">
        <header className="h-14 border-b border-border flex items-center px-4 shrink-0 z-10">
            <Button variant="ghost" size="icon" onClick={toggleLeftPanel} className="mr-2">
                {isLeftPanelCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
                <span className="sr-only">Toggle Character Panel</span>
            </Button>
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
                Veritas Engine
            </h1>
            <div className="ml-auto flex items-center gap-2">
                <Tooltip>
                    <TooltipTrigger asChild>
                         <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}>
                            <CogIcon className="w-5 h-5" />
                            <span className="sr-only">Open Settings</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Settings & Utilities</TooltipContent>
                </Tooltip>
                <Button variant="ghost" size="icon" onClick={toggleRightPanel}>
                    {isRightPanelCollapsed ? <PanelRightOpen className="h-5 w-5" /> : <PanelRightClose className="h-5 w-5" />}
                    <span className="sr-only">Toggle Context Panel</span>
                </Button>
            </div>
        </header>

        <main className="flex-grow overflow-hidden">
            <ResizablePanelGroup
                direction="horizontal"
                onLayout={onLayout}
                className="h-full w-full"
            >
                {layout.order.map((panelId, index) => (
                    <React.Fragment key={panelId}>
                        <ResizablePanel
                            defaultSize={layout.sizes[index]}
                            minSize={15}
                            collapsible={panelId !== 'narrative'}
                            collapsedSize={0}
                            isCollapsed={panelId === 'character' ? isLeftPanelCollapsed : isRightPanelCollapsed}
                        >
                           {panels[panelId]}
                        </ResizablePanel>
                        {index < layout.order.length - 1 && <ResizableHandle withHandle />}
                    </React.Fragment>
                ))}
            </ResizablePanelGroup>
        </main>
        
        <FullSettingsDialog />
        <Toaster />
      </div>
    </TooltipProvider>
  );
};