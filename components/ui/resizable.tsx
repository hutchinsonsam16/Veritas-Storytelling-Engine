import React, { useState, useRef, useCallback, createContext, useContext } from 'react';
import { cn } from '../../lib/utils';

interface ResizablePanelGroupContextType {
  direction: 'horizontal' | 'vertical';
  initialSizes: React.MutableRefObject<number[]>;
}

const ResizablePanelGroupContext = createContext<ResizablePanelGroupContextType | null>(null);

const useResizablePanelGroup = () => {
    const context = useContext(ResizablePanelGroupContext);
    if (!context) {
        throw new Error('useResizablePanelGroup must be used within a ResizablePanelGroup');
    }
    return context;
};

const ResizablePanelGroup = ({ direction, onLayout, children, className }: { direction: 'horizontal' | 'vertical', onLayout: (sizes: number[]) => void, children: React.ReactNode, className?: string }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const initialSizes = useRef<number[]>([]);

    const handleDrag = useCallback((event: MouseEvent | TouchEvent, handleIndex: number) => {
        if (!containerRef.current) return;
        
        const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
        const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

        const { left, top, width, height } = containerRef.current.getBoundingClientRect();
        
        const pos = direction === 'horizontal' ? (clientX - left) / width * 100 : (clientY - top) / height * 100;
        
        const childrenArray = React.Children.toArray(children).filter((child: any) => child.type === ResizablePanel) as React.ReactElement[];
        
        const sizes = [...initialSizes.current];
        const delta = pos - sizes.slice(0, handleIndex + 1).reduce((a, b) => a + b, 0);

        let newSizes = [...sizes];
        newSizes[handleIndex] += delta;
        newSizes[handleIndex + 1] -= delta;
        
        // Ensure minSize constraints (simplified)
        const minSize = 10;
        if(newSizes[handleIndex] < minSize || newSizes[handleIndex + 1] < minSize) return;

        containerRef.current.style.gridTemplateColumns = direction === 'horizontal' ? newSizes.map(s => `${s}fr`).join(' 10px ') : '1fr';
        containerRef.current.style.gridTemplateRows = direction === 'vertical' ? newSizes.map(s => `${s}fr`).join(' 10px ') : '1fr';
        
        if (onLayout) {
            onLayout(newSizes);
        }

    }, [direction, onLayout, children]);

    const stopDrag = () => {
         document.removeEventListener('mousemove', (e) => handleDrag(e, 0));
         document.removeEventListener('mouseup', stopDrag);
         document.removeEventListener('touchmove', (e) => handleDrag(e, 0));
         document.removeEventListener('touchend', stopDrag);
    };

    const startDrag = (event: React.MouseEvent | React.TouchEvent, handleIndex: number) => {
        if (!containerRef.current) return;
        
        // FIX: Use `Array.from` to convert HTMLCollection to array, instead of `React.Children.toArray`.
        const childrenArray = Array.from(containerRef.current.children);
        initialSizes.current = childrenArray.map(child => {
            // FIX: `child` is now a DOM element, so `getBoundingClientRect` is available.
            return direction === 'horizontal' ? (child.getBoundingClientRect().width / containerRef.current!.getBoundingClientRect().width) * 100 : (child.getBoundingClientRect().height / containerRef.current!.getBoundingClientRect().height) * 100;
        }).filter(size => size > 1); // filter out handles


        const onMove = (e: MouseEvent | TouchEvent) => handleDrag(e, handleIndex);
        
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', stopDrag, { once: true });
        document.addEventListener('touchmove', onMove);
        document.addEventListener('touchend', stopDrag, { once: true });
    };
    
    // This is a simplified implementation. We'll use CSS grid.
    const childrenArray = React.Children.toArray(children);
    const panelCount = childrenArray.filter((child: any) => child.type === ResizablePanel).length;
    
    const gridTemplate = direction === 'horizontal'
        ? `repeat(${panelCount}, 1fr)`
        : `repeat(${panelCount}, 1fr)`;

    let handleIndexCounter = 0;

    return (
        <ResizablePanelGroupContext.Provider value={{ direction, initialSizes }}>
            <div
                ref={containerRef}
                className={cn(`grid h-full`, className)}
                style={{ [direction === 'horizontal' ? 'gridTemplateColumns' : 'gridTemplateRows']: childrenArray.map((child: any) => child.props.isCollapsed ? '0fr' : child.props.defaultSize ? `${child.props.defaultSize}fr` : '1fr').join(' auto ') }}
            >
                {React.Children.map(children, (child) => {
                    if (React.isValidElement(child) && (child.type as any).displayName === 'ResizableHandle') {
                        const handle = React.cloneElement(child, { onMouseDown: (e: React.MouseEvent) => startDrag(e, handleIndexCounter), onTouchStart: (e: React.TouchEvent) => startDrag(e, handleIndexCounter) } as any);
                        handleIndexCounter++;
                        return handle;
                    }
                    return child;
                })}
            </div>
        </ResizablePanelGroupContext.Provider>
    );
};
ResizablePanelGroup.displayName = "ResizablePanelGroup";

const ResizablePanel = ({ children, className, defaultSize, isCollapsed, ...props }: { defaultSize?: number, minSize?: number, collapsible?: boolean, collapsedSize?: number, isCollapsed?: boolean, children: React.ReactNode, className?: string }) => {
    return (
        <div className={cn("overflow-hidden", isCollapsed && "hidden", className)} {...props}>
            {children}
        </div>
    );
};
ResizablePanel.displayName = "ResizablePanel";

const ResizableHandle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { withHandle?: boolean }>(({ className, withHandle, ...props }, ref) => {
    const { direction } = useResizablePanelGroup();
    return (
        <div
            ref={ref}
            className={cn("relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1",
            direction === 'vertical' && "h-px w-full after:left-0 after:h-1 after:w-full after:-translate-y-1/2 after:translate-x-0 [&[data-dragging=true]]:after:bg-ring",
            direction === 'horizontal' ? 'cursor-col-resize' : 'cursor-row-resize',
             className)}
            {...props}
        >
            {withHandle && (
                <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-2.5 w-2.5"><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                </div>
            )}
        </div>
    )
});
ResizableHandle.displayName = "ResizableHandle";

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };