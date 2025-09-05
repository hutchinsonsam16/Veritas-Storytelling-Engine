import React, { useState, createContext, useContext } from 'react';
import { cn } from '../../lib/utils';

interface TooltipContextType {
    open: boolean;
    setOpen: (open: boolean) => void;
}

const TooltipContext = createContext<TooltipContextType | null>(null);

const useTooltip = () => {
    const context = useContext(TooltipContext);
    if (!context) throw new Error("useTooltip must be used within a TooltipProvider");
    return context;
};

const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
    const [open, setOpen] = useState(false);
    return <TooltipContext.Provider value={{ open, setOpen }}>{children}</TooltipContext.Provider>;
};

const Tooltip = ({ children }: { children: React.ReactNode }) => {
    return <div className="relative inline-flex">{children}</div>;
};

const TooltipTrigger = ({ children, asChild = false }: { children: React.ReactNode; asChild?: boolean }) => {
    const { setOpen } = useTooltip();
    
    // FIX: The original `asChild` implementation had type errors because `children.props` is inferred as `unknown`.
    // Casting `children.props` to `any` resolves these errors, allowing both spreading of props and composition of event handlers.
    if (asChild && React.isValidElement(children)) {
        const childProps = children.props as any;
        return React.cloneElement(children, {
            ...childProps,
            onMouseEnter: (e: React.MouseEvent) => {
                childProps.onMouseEnter?.(e);
                setOpen(true);
            },
            onMouseLeave: (e: React.MouseEvent) => {
                childProps.onMouseLeave?.(e);
                setOpen(false);
            },
            onFocus: (e: React.FocusEvent) => {
                childProps.onFocus?.(e);
                setOpen(true);
            },
            onBlur: (e: React.FocusEvent) => {
                childProps.onBlur?.(e);
                setOpen(false);
            },
        });
    }

    return (
        <div
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
        >
            {children}
        </div>
    );
};

const TooltipContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => {
        const { open } = useTooltip();
        if (!open) return null;

        return (
            <div
                ref={ref}
                className={cn(
                    "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
                    "absolute top-full mt-2 left-1/2 -translate-x-1/2",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        )
    }
);
TooltipContent.displayName = "TooltipContent";


export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };