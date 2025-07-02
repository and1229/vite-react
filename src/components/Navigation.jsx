import React from 'react';
import { useHaptic } from '../hooks/useHaptic';
import { useSubscription } from '../hooks/useSubscription';
import { AdminBadge } from './AdminBadge';

// Импорт новых иконок
import calculatorIcon from '../assets/icons/calculator.png';
import scheduleIcon from '../assets/icons/schedule.png';
import analyticsIcon from '../assets/icons/analytics.png';
import goalsIcon from '../assets/icons/goals.png';
import logoIcon from '../../icon-512.png'; // Импорт логотипа

export function Navigation({ activeTab, setActiveTab, darkMode, onShowSubscription, firebaseHook }) {
  const { hapticButton } = useHaptic();
  const { hasAnalyticsAccess, getDaysRemaining } = useSubscription(firebaseHook);
  
  // Проверяем админ статус
  const ADMIN_EMAILS = ['ggttxx1229@yandex.ru'];
  const isAdmin = firebaseHook?.user?.email && ADMIN_EMAILS.includes(firebaseHook.user.email);
  
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
    <nav className={`sticky top-0 z-40 w-full ${darkMode ? 'bg-gray-800/95 backdrop-blur-md border-b border-gray-700' : 'bg-white/95 backdrop-blur-md border-b border-gray-200'} shadow-modern transition-all duration-300`}>
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-center h-16">
          {/* Навигационные вкладки */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Кнопка Pro */}
            <button
              onClick={() => {
                onShowSubscription && onShowSubscription();
                hapticButton();
              }}
                             className={`relative flex flex-col items-center justify-center px-2 py-2 rounded-lg transition-all duration-300 ease-in-out min-w-[50px] group ${
                 isAdmin
                   ? 'bg-gradient-to-br from-yellow-400 to-orange-400 text-gray-900 shadow-lg'
                   : hasAnalyticsAccess()
                   ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg'
                   : 'bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
               }`}
             >
               {isAdmin ? (
                 <div className="flex flex-col items-center">
                   <span className="text-xs font-bold">👑</span>
                   <span className="text-[8px] leading-none font-medium">Admin</span>
                 </div>
               ) : hasAnalyticsAccess() ? (
                 <div className="flex flex-col items-center">
                   <span className="text-xs font-bold">✨</span>
                   <span className="text-[8px] leading-none">{getDaysRemaining()}д</span>
                 </div>
               ) : (
                 <div className="flex flex-col items-center">
                   <span className="text-xs font-bold">🚀</span>
                   <span className="text-[8px] leading-none font-medium">Pro</span>
                 </div>
               )}
             </button>
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
                      }`
                }`}
              >
                {/* Анимированный индикатор активной вкладки */}
                {activeTab === tab.id && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full animate-pulse" />
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

      {/* Прогресс-бар для индикации загрузки контента */}
      <div className={`h-0.5 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 ${darkMode ? 'opacity-60' : 'opacity-40'} transition-opacity duration-300`}>
        <div className="h-full bg-white/20 animate-pulse transition-all duration-500" style={{ width: '30%' }} />
      </div>
    </nav>
  );
} 