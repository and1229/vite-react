import React, { useState, useEffect } from 'react';

export function NotificationSystem({ darkMode }) {
  const [notifications, setNotifications] = useState([]);

  // Функция добавления уведомления
  const addNotification = (type, title, message, duration = 5000) => {
    const id = Date.now();
    const notification = { id, type, title, message, duration };
    
    setNotifications(prev => [...prev, notification]);

    // Автоматически удаляем уведомление
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  };

  // Функция удаления уведомления
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Делаем функцию глобально доступной
  useEffect(() => {
    window.showNotification = addNotification;
    
    // Показываем приветственное уведомление
    setTimeout(() => {
      addNotification(
        'success',
        'Добро пожаловать! 🎉',
        'Теперь все функции доступны бесплатно! Полная аналитика, цели и многое другое.',
        7000
      );
    }, 2000);

    return () => {
      delete window.showNotification;
    };
  }, []);

  const getNotificationStyles = (type) => {
    const baseStyles = "transform transition-all duration-300 ease-in-out max-w-sm";
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-500 text-white border-l-4 border-green-600`;
      case 'error':
        return `${baseStyles} bg-red-500 text-white border-l-4 border-red-600`;
      case 'warning':
        return `${baseStyles} bg-orange-500 text-white border-l-4 border-orange-600`;
      case 'info':
        return `${baseStyles} bg-blue-500 text-white border-l-4 border-blue-600`;
      default:
        return `${baseStyles} ${darkMode ? 'bg-gray-800 text-white border-l-4 border-purple-500' : 'bg-white text-gray-900 border-l-4 border-purple-500'} shadow-lg`;
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${getNotificationStyles(notification.type)} p-4 rounded-lg shadow-xl animate-slide-in-right`}
          style={{
            animation: 'slideInRight 0.3s ease-out'
          }}
        >
          <div className="flex items-start space-x-3">
            <span className="text-lg mt-0.5 flex-shrink-0">
              {getIcon(notification.type)}
            </span>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm mb-1">
                {notification.title}
              </h4>
              <p className="text-sm opacity-90 leading-relaxed">
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-white/80 hover:text-white text-lg leading-none flex-shrink-0 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
} 