import React, { useEffect } from 'react';
import { OnboardingWizard } from './components/OnboardingWizard';
import { GameUI } from './components/GameUI';
import { GamePhase } from './types';
import { useStore } from './store';
import { themes } from './lib/themes';

const ThemeManager = () => {
    const { theme, fontScale, disableAnimations } = useStore(state => state.settings);
  
    useEffect(() => {
        const themeProperties = themes[theme];
        const styleElement = document.getElementById('theme-style');
        
        if (styleElement && themeProperties) {
            let css = ':root {\n';
            Object.entries(themeProperties.colors).forEach(([key, value]) => {
                css += `  --${key}: ${value};\n`;
            });
            Object.entries(themeProperties.fonts).forEach(([key, value]) => {
                css += `  --font-${key}: ${value};\n`;
            });
            if (themeProperties.backgroundImage) {
                css += `  --bg-image: url('${themeProperties.backgroundImage}');\n`
            } else {
                 css += `  --bg-image: none;\n`
            }
            css += '}\n';
            styleElement.innerHTML = css;
        }

        document.documentElement.style.setProperty('--font-scale', fontScale.toString());

        if (disableAnimations) {
            document.body.classList.add('disable-animations');
        } else {
            document.body.classList.remove('disable-animations');
        }

        document.body.className = document.body.className.split(' ').filter(c => !c.startsWith('font-')).join(' ');
        document.body.classList.add(themeProperties.bodyFont);

    }, [theme, fontScale, disableAnimations]);
  
    return null;
}


const App: React.FC = () => {
  const phase = useStore(state => state.gameState.phase);

  return (
    <>
        <ThemeManager />
        {phase === GamePhase.ONBOARDING ? <OnboardingWizard /> : <GameUI />}
    </>
  );
};

export default App;