import { Theme } from '../types';

interface ThemeDefinition {
    colors: {
        [key: string]: string;
    };
    fonts: {
        sans: string;
        serif: string;
        mono: string;
    };
    bodyFont: 'font-sans' | 'font-serif' | 'font-mono';
    backgroundImage?: string;
}

export const themes: Record<Theme, ThemeDefinition> = {
    'veritas': {
        colors: {
            background: "222.2 84% 4.9%",
            foreground: "210 40% 98%",
            card: "222.2 84% 4.9%",
            'card-foreground': "210 40% 98%",
            popover: "222.2 84% 4.9%",
            'popover-foreground': "210 40% 98%",
            primary: "173 95% 50%",
            'primary-foreground': "222.2 47.4% 11.2%",
            secondary: "217.2 32.6% 17.5%",
            'secondary-foreground': "210 40% 98%",
            muted: "217.2 32.6% 17.5%",
            'muted-foreground': "215 20.2% 65.1%",
            accent: "217.2 32.6% 17.5%",
            'accent-foreground': "210 40% 98%",
            destructive: "0 62.8% 30.6%",
            'destructive-foreground': "210 40% 98%",
            border: "217.2 32.6% 17.5%",
            input: "217.2 32.6% 17.5%",
            ring: "173 95% 50%",
        },
        fonts: {
            sans: "Inter, sans-serif",
            serif: "'Playfair Display', serif",
            mono: "'Share Tech Mono', monospace",
        },
        bodyFont: 'font-sans'
    },
    'sci-fi': {
        colors: {
            background: "210 30% 8%",
            foreground: "140 80% 80%",
            card: "210 30% 12%",
            'card-foreground': "140 80% 80%",
            popover: "210 30% 8%",
            'popover-foreground': "140 80% 80%",
            primary: "140 100% 50%",
            'primary-foreground': "210 30% 5%",
            secondary: "210 30% 15%",
            'secondary-foreground': "140 80% 80%",
            muted: "210 30% 20%",
            'muted-foreground': "210 20% 60%",
            accent: "140 80% 25%",
            'accent-foreground': "140 80% 90%",
            destructive: "0 70% 50%",
            'destructive-foreground': "0 0% 100%",
            border: "140 80% 20%",
            input: "210 30% 15%",
            ring: "140 100% 50%",
        },
        fonts: {
            sans: "'Share Tech Mono', monospace",
            serif: "'Playfair Display', serif",
            mono: "'Share Tech Mono', monospace",
        },
        bodyFont: 'font-mono'
    },
    'fantasy': {
        colors: {
            background: "35 33% 94%",
            foreground: "35 25% 20%",
            card: "35 45% 88%",
            'card-foreground': "35 25% 20%",
            popover: "35 50% 92%",
            'popover-foreground': "35 25% 20%",
            primary: "15 55% 40%",
            'primary-foreground': "35 33% 96%",
            secondary: "35 30% 80%",
            'secondary-foreground': "35 25% 20%",
            muted: "35 30% 85%",
            'muted-foreground': "35 15% 40%",
            accent: "35 40% 75%",
            'accent-foreground': "15 55% 40%",
            destructive: "0 60% 50%",
            'destructive-foreground': "0 0% 100%",
            border: "35 25% 70%",
            input: "35 25% 75%",
            ring: "15 55% 40%",
        },
        fonts: {
            sans: "'Playfair Display', serif",
            serif: "'Playfair Display', serif",
            mono: "'Share Tech Mono', monospace",
        },
        bodyFont: 'font-serif',
        backgroundImage: "https://www.transparenttextures.com/patterns/old-paper.png"
    },
    'high-contrast': {
        colors: {
            background: "0 0% 0%",
            foreground: "0 0% 100%",
            card: "0 0% 10%",
            'card-foreground': "0 0% 100%",
            popover: "0 0% 0%",
            'popover-foreground': "0 0% 100%",
            primary: "60 100% 50%", // Bright yellow
            'primary-foreground': "0 0% 0%",
            secondary: "0 0% 20%",
            'secondary-foreground': "0 0% 100%",
            muted: "0 0% 20%",
            'muted-foreground': "0 0% 80%",
            accent: "0 0% 30%",
            'accent-foreground': "0 0% 100%",
            destructive: "0 100% 50%",
            'destructive-foreground': "0 0% 0%",
            border: "0 0% 60%",
            input: "0 0% 15%",
            ring: "60 100% 50%",
        },
        fonts: {
            sans: "Inter, sans-serif",
            serif: "'Playfair Display', serif",
            mono: "'Share Tech Mono', monospace",
        },
        bodyFont: 'font-sans'
    }
};
