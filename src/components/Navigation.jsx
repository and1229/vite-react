import React from 'react';
import { useHaptic } from '../hooks/useHaptic';

export function Navigation({ activeTab, setActiveTab, darkMode }) {
  const { hapticButton } = useHaptic();
  
  const tabs = [
    {
      id: "calculator",
      label: "Калькулятор",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: "schedule",
      label: "Расписание",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: "analytics",
      label: "Аналитика",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      id: "goals",
      label: "Цели",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    hapticButton();
  };

  return (
    <nav className={`sticky top-0 z-40 w-full ${darkMode ? 'bg-gray-800/95 backdrop-blur-md border-b border-gray-700' : 'bg-white/95 backdrop-blur-md border-b border-gray-200'} shadow-modern`}>
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-16">
          {/* Логотип */}
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-modern ${darkMode ? 'bg-purple-600' : 'bg-gradient-to-r from-purple-500 to-blue-500'}`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <h1 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                ShiftMate
              </h1>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Умный калькулятор смен
              </p>
            </div>
          </div>

          {/* Навигационные вкладки */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                {...hapticButton()}
                className={`relative flex flex-col items-center justify-center px-3 py-2 rounded-modern transition-all duration-200 min-w-[60px] sm:min-w-[80px] group ${
                  activeTab === tab.id
                    ? `${darkMode ? 'bg-purple-600 text-white shadow-modern-lg' : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-modern-lg'} transform scale-105`
                    : `${darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`
                }`}
              >
                {/* Анимированный индикатор активной вкладки */}
                {activeTab === tab.id && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full animate-pulse" />
                )}
                
                <div className={`transition-transform duration-200 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-105'}`}>
                  {tab.icon}
                </div>
                
                <span className={`text-xs font-medium mt-1 transition-all duration-200 ${
                  activeTab === tab.id ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'
                }`}>
                  {tab.label}
                </span>

                {/* Подсветка при наведении */}
                <div className={`absolute inset-0 rounded-modern transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20'
                    : 'bg-transparent group-hover:bg-gray-100/50 dark:group-hover:bg-gray-700/50'
                }`} />
              </button>
            ))}
          </div>

          {/* Индикатор свайпа */}
          <div className="hidden sm:flex items-center space-x-2">
            <div className={`px-2 py-1 rounded-modern text-xs ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
              <span className="flex items-center space-x-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span>Свайп</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Прогресс-бар для индикации загрузки контента */}
      <div className={`h-0.5 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 ${darkMode ? 'opacity-60' : 'opacity-40'}`}>
        <div className="h-full bg-white/20 animate-pulse" style={{ width: '30%' }} />
      </div>
    </nav>
  );
} 