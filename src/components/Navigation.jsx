import React from 'react';
import { TABS } from '../utils/constants';

export function Navigation({ activeTab, setActiveTab, darkMode }) {
  return (
    <nav className={`flex overflow-x-auto whitespace-nowrap border-b ${darkMode ? 'border-gray-700' : 'border-gray-200 bg-white/80'}`}>
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === tab.id
              ? darkMode
                ? 'border-b-2 border-purple-500 text-purple-500'
                : 'border-b-2 border-purple-500 text-purple-600 bg-gray-100'
              : darkMode
                ? 'hover:text-gray-300'
                : 'hover:text-purple-400 text-gray-700'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
} 