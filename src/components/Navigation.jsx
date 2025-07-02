import React from 'react';
import { useHaptic } from '../hooks/useHaptic';

// Импорт новых иконок
import calculatorIcon from '../assets/icons/calculator.png';
import scheduleIcon from '../assets/icons/schedule.png';
import analyticsIcon from '../assets/icons/analytics.png';
import goalsIcon from '../assets/icons/goals.png';

export function Navigation({ activeTab, setActiveTab, darkMode }) {
  const { hapticButton } = useHaptic();
  
  const tabs = [
    {
      id: "calculator",
      label: "Калькулятор",
      icon: <img src={calculatorIcon} alt="Калькулятор" className="w-6 h-6" />
    },
    {
      id: "schedule",
      label: "График",
      icon: <img src={scheduleIcon} alt="График" className="w-6 h-6" />
    },
    {
      id: "analytics",
      label: "Аналитика",
      icon: <img src={analyticsIcon} alt="Аналитика" className="w-6 h-6" />,
      badge: "Pro" // Показываем что это улучшенная аналитика
    },
    {
      id: "goals",
      label: "Цели",
      icon: <img src={goalsIcon} alt="Цели" className="w-6 h-6" />
    }
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    hapticButton();
  };

  return (
    <nav className={`sticky top-0 z-40 w-full ${darkMode ? 'bg-gray-800/95 backdrop-blur-md border-b border-gray-700' : 'bg-white/95 backdrop-blur-md border-b border-gray-200'} shadow-modern transition-all duration-300`}>
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-center h-16">
          {/* Навигационные вкладки */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                {...hapticButton()}
                className={`relative flex flex-col items-center justify-center px-3 py-2 rounded-modern transition-all duration-300 ease-in-out min-w-[60px] sm:min-w-[80px] group ${
                  activeTab === tab.id
                    ? `${darkMode 
                        ? 'bg-gradient-to-br from-gray-700 to-gray-800 text-white shadow-modern-lg border border-purple-500/50' 
                        : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 shadow-modern-lg border border-purple-400/50'
                      } transform scale-105`
                    : `${darkMode 
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700 border border-transparent' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-transparent'
                      } hover:scale-105`
                }`}
              >
                {/* Анимированный индикатор активной вкладки */}
                {activeTab === tab.id && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full animate-pulse" />
                )}
                
                {/* Pro badge для аналитики */}
                {tab.badge && (
                  <div className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-[8px] px-1 py-0.5 rounded-full font-bold">
                    {tab.badge}
                  </div>
                )}
                
                <div className={`transition-all duration-300 ease-in-out ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-105'}`}>
                  {tab.icon}
                </div>
                
                <span className={`text-xs font-medium mt-1 transition-all duration-300 ease-in-out ${
                  activeTab === tab.id ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'
                }`}>
                  {tab.label}
                </span>

                {/* Подсветка при наведении */}
                <div className={`absolute inset-0 rounded-modern transition-all duration-300 ease-in-out ${
                  activeTab === tab.id ? '' : 'group-hover:bg-gray-100/50 dark:group-hover:bg-gray-700/50'
                }`} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Улучшенный прогресс-бар */}
      <div className={`h-0.5 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 ${darkMode ? 'opacity-60' : 'opacity-40'} transition-opacity duration-300`}>
        <div className="h-full bg-gradient-to-r from-white/40 to-white/20 animate-pulse transition-all duration-500" style={{ width: '100%' }} />
      </div>
    </nav>
  );
} 