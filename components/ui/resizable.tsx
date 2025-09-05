import React, { useState, useRef, useCallback, createContext, useContext, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface ResizablePanelGroupContextType {
  direction: 'horizontal' | 'vertical';
  id: string;
}

const ResizablePanelGroupContext = createContext<ResizablePanelGroupContextType | null>(null);

const useResizablePanelGroup = () => {
    const context = useContext(ResizablePanelGroupContext);
    if (!context) {
        throw new Error('useResizablePanelGroup must be used within a ResizablePanelGroup');
    }
    return context;
};

// A simple store to persist panel sizes
const panelStorage = {
    getItem: (id: string): number[] | null => {
        try {
            const stored = localStorage.getItem(`resizable-panels:${id}`);
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    },
    setItem: (id: string, sizes: number[]) => {
        try {
            localStorage.setItem(`resizable-panels:${id}`, JSON.stringify(sizes));
        } catch (error) {
            console.warn("Could not save panel sizes to local storage", error);
        }
    },
};

const ResizablePanelGroup = ({
    direction,
    onLayout,
    children,
    className,
    id = "default-resizable-group",
}: {
    direction: 'horizontal' | 'vertical';
    onLayout: (sizes: number[]) => void;
    children: React.ReactNode;
    className?: string;
    id?: string;
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [panelSizes, setPanelSizes] = useState<number[]>([]);
    const draggingHandleIndex = useRef<number | null>(null);

    useEffect(() => {
        const childrenArray = React.Children.toArray(children);
        const storedSizes = panelStorage.getItem(id);
        const initialSizes = storedSizes || childrenArray.filter((c: any) => c.type === ResizablePanel).map((c: any) => c.props.defaultSize || 100 / childrenArray.length);
        setPanelSizes(initialSizes);
        onLayout(initialSizes);
    }, [id, children]);

    const handleDrag = useCallback((event: MouseEvent) => {
        if (draggingHandleIndex.current === null) return;
        
        const container = containerRef.current;
        if (!container) return;

        const { left, top, width, height } = container.getBoundingClientRect();
        const position = direction === 'horizontal' ? event.clientX - left : event.clientY - top;
        const totalSize = direction === 'horizontal' ? width : height;

        const delta = (position / totalSize) * 100 - panelSizes.slice(0, draggingHandleIndex.current + 1).reduce((a, b) => a + b, 0);

        setPanelSizes(prevSizes => {
            const newSizes = [...prevSizes];
            const i = draggingHandleIndex.current!;
            
            newSizes[i] += delta;
            newSizes[i + 1] -= delta;
            
            // Basic min size constraint (e.g., 10%)
            const minSize = 10;
            if (newSizes[i] < minSize || newSizes[i+1] < minSize) {
                return prevSizes; // Abort change
            }
            
            onLayout(newSizes);
            panelStorage.setItem(id, newSizes);
            return newSizes;
        });

    }, [direction, panelSizes, onLayout, id]);

    const stopDrag = useCallback(() => {
        document.removeEventListener('mousemove', handleDrag);
        document.removeEventListener('mouseup', stopDrag);
        draggingHandleIndex.current = null;
    }, [handleDrag]);

    const startDrag = useCallback((event: React.MouseEvent, handleIndex: number) => {
        event.preventDefault();
        draggingHandleIndex.current = handleIndex;
        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('mouseup', stopDrag);
    }, [handleDrag, stopDrag]);

    let handleIndexCounter = 0;

    return (
        <ResizablePanelGroupContext.Provider value={{ direction, id }}>
            <div
                ref={containerRef}
                className={cn('flex w-full h-full', direction === 'vertical' ? 'flex-col' : 'flex-row', className)}
            >
                {React.Children.map(children, (child, index) => {
                    if (!React.isValidElement(child)) return null;

                    if ((child.type as any).displayName === 'ResizablePanel') {
                        const panelIndex = React.Children.toArray(children).filter(c => (c as any).type.displayName === 'ResizablePanel').indexOf(child);
                        return React.cloneElement(child, { size: panelSizes[panelIndex] } as any);
                    }
                    
                    if ((child.type as any).displayName === 'ResizableHandle') {
                        const currentHandleIndex = handleIndexCounter++;
                        return React.cloneElement(child, { onMouseDown: (e: React.MouseEvent) => startDrag(e, currentHandleIndex) } as any);
                    }
                    
                    return child;
                })}
            </div>
        </ResizablePanelGroupContext.Provider>
    );
};
ResizablePanelGroup.displayName = "ResizablePanelGroup";

const ResizablePanel = ({ children, className, defaultSize, isCollapsed, size, ...props }: { defaultSize?: number; minSize?: number; collapsible?: boolean; collapsedSize?: number; isCollapsed?: boolean; children: React.ReactNode; className?: string; size?: number; }) => {
<<<<<<< HEAD
    const { direction } = useResizablePanelGroup();
    return (
        <div
            className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                className
            )}
            style={{
                flexGrow: isCollapsed ? 0 : size,
                flexShrink: 1,
                flexBasis: '0px',
                minWidth: direction === 'horizontal' && isCollapsed ? '0px' : undefined,
                minHeight: direction === 'vertical' && isCollapsed ? '0px' : undefined,
                overflow: isCollapsed ? 'hidden' : 'auto',
            }}
            {...props}
        >
            {!isCollapsed && children}
=======
    return (
        <div 
            className={cn("overflow-hidden", className)} 
            style={{
                flexGrow: size,
                flexShrink: 1,
                flexBasis: '0%',
                display: isCollapsed ? 'none' : 'block'
            }}
            {...props}
        >
            {children}
>>>>>>> abd10e7d0e3f946760e79891427c9d4ad551de8c
        </div>
    );
};
ResizablePanel.displayName = "ResizablePanel";

const ResizableHandle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { withHandle?: boolean }>(({ className, withHandle, ...props }, ref) => {
    const { direction } = useResizablePanelGroup();
    return (
        <div
            ref={ref}
            className={cn(
<<<<<<< HEAD
                "flex-shrink-0 bg-border relative transition-colors",
                direction === 'horizontal' ? 'w-2 cursor-col-resize hover:bg-primary/20' : 'h-2 cursor-row-resize hover:bg-primary/20',
=======
                "flex-shrink-0 bg-border relative",
                direction === 'horizontal' ? 'w-2 cursor-col-resize' : 'h-2 cursor-row-resize',
>>>>>>> abd10e7d0e3f946760e79891427c9d4ad551de8c
                "flex items-center justify-center",
                className
            )}
            onMouseDown={props.onMouseDown}
        >
            {withHandle && (
                <div className={cn("z-10 rounded-full bg-muted-foreground/50", direction === 'horizontal' ? 'w-1 h-8' : 'h-1 w-8')} />
            )}
        </div>
    );
});
ResizableHandle.displayName = "ResizableHandle";

<<<<<<< HEAD
export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
=======
export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
>>>>>>> abd10e7d0e3f946760e79891427c9d4ad551de8c
