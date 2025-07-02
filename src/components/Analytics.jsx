import React from 'react';
import { EnhancedAnalytics } from './EnhancedAnalytics';

// Основной компонент аналитики теперь использует улучшенную версию
export function Analytics({ analyticsShifts, goals, darkMode, selectedPeriod, setSelectedPeriod }) {
  return (
    <EnhancedAnalytics 
      analyticsShifts={analyticsShifts}
      goals={goals}
      darkMode={darkMode}
      selectedPeriod={selectedPeriod}
      setSelectedPeriod={setSelectedPeriod}
    />
  );
} 