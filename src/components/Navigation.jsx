import React from 'react';
import { TABS } from '../utils/constants';

export function Navigation({ activeTab, setActiveTab, darkMode }) {
  return (
    <nav className={`w-full ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/90'} border-b sticky top-0 z-10 backdrop-blur-sm`}>
      <div className="flex overflow-x-auto scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 px-4 py-3 font-medium transition-all duration-200 whitespace-nowrap min-w-0 ${
              activeTab === tab.id
                ? darkMode
                  ? 'border-b-2 border-purple-500 text-purple-400 bg-gray-800/80'
                  : 'border-b-2 border-purple-500 text-purple-600 bg-gray-50'
                : darkMode
                  ? 'hover:text-gray-300 hover:bg-gray-700/50 text-gray-400'
                  : 'hover:text-purple-500 hover:bg-gray-100/50 text-gray-600'
            }`}
          >
            <span className="text-sm sm:text-base">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
} 