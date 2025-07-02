import React, { useState, useEffect } from 'react';

export function AdminNotification({ firebaseHook, darkMode }) {
  const [showNotification, setShowNotification] = useState(false);
  
  const ADMIN_EMAILS = ['ggttxx1229@yandex.ru'];
  const isAdmin = firebaseHook?.user?.email && ADMIN_EMAILS.includes(firebaseHook.user.email);
  
  useEffect(() => {
    // Показываем уведомление при входе админа
    if (isAdmin && !localStorage.getItem('admin_notification_shown')) {
      setShowNotification(true);
      localStorage.setItem('admin_notification_shown', 'true');
    }
  }, [isAdmin]);

  const handleDismiss = () => {
    setShowNotification(false);
  };

  if (!showNotification || !isAdmin) return null;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
      <div className={`p-4 rounded-xl shadow-xl border-2 ${
        darkMode 
          ? 'bg-gray-800 border-yellow-400 text-white' 
          : 'bg-white border-yellow-400 text-gray-900'
      } animate-bounce`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <span className="text-2xl">👑</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-yellow-600 dark:text-yellow-400 mb-2">
              Добро пожаловать, Администратор!
            </h3>
            <p className="text-sm mb-3">
              Вы вошли как администратор системы. У вас есть бессрочный доступ ко всем функциям ShiftMate Pro.
            </p>
            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
              <div>✅ Полная аналитика с 8+ метриками</div>
              <div>✅ Прогнозы доходов</div>
              <div>✅ Персональные рекомендации</div>
              <div>✅ Настройки выходных дней</div>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}