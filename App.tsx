import React from 'react';
import { OnboardingWizard } from './components/OnboardingWizard';
import { GameUI } from './components/GameUI';
import { GamePhase } from './types';
import { useStore } from './store';

const App: React.FC = () => {
  const phase = useStore(state => state.gameState.phase);

  if (phase === GamePhase.ONBOARDING) {
    return <OnboardingWizard />;
  }

  return <GameUI />;
};

export default App;
