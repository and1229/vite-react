import React from 'react';
import { useHaptic } from '../hooks/useHaptic';

// Импорт новых иконок
import calculatorIcon from '../assets/icons/calculator.png';
import scheduleIcon from '../assets/icons/schedule.png';
import analyticsIcon from '../assets/icons/analytics.png';
import goalsIcon from '../assets/icons/goals.png';
import logoIcon from '../../icon-512.png'; // Импорт логотипа

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
      icon: <img src={analyticsIcon} alt="Аналитика" className="w-6 h-6" />
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
    <nav className={`sticky top-0 z-40 w-full ${darkMode ? 'bg-gray-800/95 backdrop-blur-md border-b border-gray-700' : 'bg-white/95 backdrop-blur-md border-b border-gray-200'} shadow-modern`}>
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-center h-16">
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
                    ? 'bg-white/10'
                    : 'bg-transparent group-hover:bg-gray-100/50 dark:group-hover:bg-gray-700/50'
                }`} />
              </button>
            ))}
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