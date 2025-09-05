import React from 'react';
import { cn } from '../../lib/utils';
import { XIcon } from '../Icons';

const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    // In a real shadcn setup this would be a Radix provider.
    // Here it's just a container.
    return <>{children}</>;
};

const ToastViewport = React.forwardRef<HTMLOListElement, React.HTMLAttributes<HTMLOListElement>>(
    ({ className, ...props }, ref) => (
        <ol
            ref={ref}
            className={cn(
                "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
                className
            )}
            {...props}
        />
    )
);
ToastViewport.displayName = "ToastViewport";

const toastVariantClasses = {
    default: "border bg-background text-foreground",
    destructive: "destructive border-destructive bg-destructive text-destructive-foreground",
};

const Toast = React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement> & { variant?: keyof typeof toastVariantClasses }>(
    ({ className, variant = "default", ...props }, ref) => (
        <li
            ref={ref}
            className={cn(
                "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
                toastVariantClasses[variant],
                className
            )}
            {...props}
        />
    )
);
Toast.displayName = "Toast";

const ToastTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("text-sm font-semibold", className)} {...props} />
    )
);
ToastTitle.displayName = "ToastTitle";

const ToastDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("text-sm opacity-90", className)} {...props} />
    )
);
ToastDescription.displayName = "ToastDescription";

const ToastClose = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
    ({ className, ...props }, ref) => (
        <button
            ref={ref}
            type="button"
            className={cn(
                "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100",
                className
            )}
            {...props}
        >
            <XIcon className="h-4 w-4" />
        </button>
    )
);
ToastClose.displayName = "ToastClose";


export {
    ToastProvider,
    ToastViewport,
    Toast,
    ToastTitle,
    ToastDescription,
    ToastClose,
};
