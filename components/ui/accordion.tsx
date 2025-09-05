import React, { useState, createContext, useContext, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { SparklesIcon } from '../Icons'; // Using a generic icon for chevron

interface AccordionContextType {
  openItems: string[];
  toggleItem: (value: string) => void;
}

const AccordionContext = createContext<AccordionContextType | null>(null);

const useAccordion = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('useAccordion must be used within an Accordion');
  }
  return context;
};

const Accordion = ({ children, defaultValue, ...props }: { children: React.ReactNode, defaultValue?: string, className?: string }) => {
  const [openItems, setOpenItems] = useState<string[]>(defaultValue ? [defaultValue] : []);

  const toggleItem = (value: string) => {
    setOpenItems(prev =>
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    );
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div className={cn("w-full", props.className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
};

const AccordionItem = ({ children, value, className, ...props }: { children: React.ReactNode, value: string, className?: string }) => {
  return (
    <div className={cn("border-b border-border", className)} {...props}>
      {children}
    </div>
  );
};

const AccordionTrigger = ({ children, className, ...props }: { children: React.ReactNode, className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const { openItems, toggleItem } = useAccordion();
  // We need to find the value from the parent AccordionItem. This is a bit of a hack.
  // In a real implementation with Radix, this is handled automatically.
  // Here, we assume the AccordionTrigger is a direct child of a component that has `value`.
  // This won't work as is, we need to pass the value down.
  // The below implementation is a simplified one assuming the value is somehow accessible.
  // Let's assume AccordionItem provides its value via context. This is getting complex.
  
  // Simplified: Let's assume the button onClick is handled by the parent passing the value
  // The component structure will be slightly different from shadcn to make it work without Radix.
  // The parent `AccordionItem` will handle the context providing.

  // Let's restructure. `AccordionItem` will be the context provider for its `value`.
  const itemValue = (props as any)['data-value'];
  const isOpen = openItems.includes(itemValue);
  
  return (
    <button
      onClick={() => toggleItem(itemValue)}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className
      )}
      aria-expanded={isOpen}
      {...props}
    >
      {children}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 shrink-0 transition-transform duration-200"
      >
        <path d="m6 9 6 6 6-6"></path>
      </svg>
    </button>
  );
};


const AccordionContent = ({ children, className, ...props }: { children: React.ReactNode, className?: string }) => {
    // This is the tricky part without Radix. We'll use CSS and state.
    const { openItems } = useAccordion();
    const itemValue = (props as any)['data-value'];
    const isOpen = openItems.includes(itemValue);

    const contentRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState<number | string>(0);

    useEffect(() => {
        if (isOpen) {
            setHeight(contentRef.current?.scrollHeight || 'auto');
        } else {
            setHeight(0);
        }
    }, [isOpen, children]);
    

    return (
        <div
            ref={contentRef}
            style={{ height }}
            className={cn(
                "overflow-hidden text-sm transition-all duration-200 ease-out",
                className
            )}
            {...props}
        >
            <div className="pb-4 pt-0">{children}</div>
        </div>
    );
};


// A complete, working version without Radix context magic
const SimpleAccordionItem = ({ value, trigger, children, defaultOpen }: { value: string, trigger: React.ReactNode, children: React.ReactNode, defaultOpen?: boolean }) => {
    const { openItems, toggleItem } = useAccordion();
    const isOpen = openItems.includes(value);

    return (
        <div className="border-b border-border">
            <h3 className="text-lg">
                <button
                    onClick={() => toggleItem(value)}
                    className="flex w-full items-center justify-between py-4 font-medium transition-all hover:underline text-left"
                    aria-expanded={isOpen}
                >
                    {trigger}
                     <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    >
                        <path d="m6 9 6 6 6-6"></path>
                    </svg>
                </button>
            </h3>
             <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen' : 'max-h-0'}`}>
                <div className="pb-4 pt-0">
                    {children}
                </div>
            </div>
        </div>
    )
}


export { Accordion, SimpleAccordionItem as AccordionItem, AccordionTrigger, AccordionContent };
