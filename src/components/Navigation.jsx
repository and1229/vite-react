import React from 'react';
import { useHaptic } from '../hooks/useHaptic';

export function Navigation({ activeTab, setActiveTab, darkMode }) {
  const { hapticButton } = useHaptic();
  
  const tabs = [
    { id: "calculator", label: "Калькулятор", icon: "🧮" },
    { id: "schedule", label: "График", icon: "📅" },
    { id: "analytics", label: "Аналитика", icon: "📊" },
    { id: "goals", label: "Цели", icon: "🎯" }
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <div className="w-full">
      <nav className={`w-full px-3 sm:px-4 py-2 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-modern border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              {...hapticButton()}
              className={`micro-button flex flex-col items-center justify-center px-3 py-2 rounded-modern transition-all duration-200 min-w-0 flex-1 ${
                activeTab === tab.id
                  ? `${darkMode ? 'bg-purple-600 text-white shadow-modern-lg' : 'bg-purple-100 text-purple-700 shadow-modern'} nav-tab-active`
                  : `${darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`
              }`}
            >
              <span className="text-lg sm:text-xl mb-1">{tab.icon}</span>
              <span className="text-xs sm:text-sm font-medium truncate">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
} 