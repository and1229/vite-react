import React from 'react';
import { useSubscription } from '../hooks/useSubscription';

export function AdminBadge({ firebaseHook, darkMode }) {
  const { hasAnalyticsAccess } = useSubscription(firebaseHook);
  
  // Список администраторов
  const ADMIN_EMAILS = ['ggttxx1229@yandex.ru'];
  
  const isAdmin = firebaseHook?.user?.email && ADMIN_EMAILS.includes(firebaseHook.user.email);
  
  if (!isAdmin) return null;
  
  return (
    <div className={`px-2 py-1 rounded-full text-xs font-bold ${
      darkMode 
        ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900' 
        : 'bg-gradient-to-r from-yellow-300 to-orange-300 text-gray-800'
    } shadow-lg`}>
      👑 Admin
    </div>
  );
}