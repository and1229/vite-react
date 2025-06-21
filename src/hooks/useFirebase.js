import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { vkSignIn, vkSignOut, checkVKAuth } from '../vkAuth';

// Функция для очистки объекта пользователя от циклических ссылок
const cleanUserObject = (userData) => {
  if (!userData) return null;
  
  return {
    name: userData.name || '',
    displayName: userData.displayName || userData.name || '',
    badge: userData.badge || '',
    email: userData.email || '',
    photoURL: userData.photoURL || '',
    uid: userData.uid || '',
    isVK: userData.isVK || false,
    vkId: userData.vkId || '',
    vkDomain: userData.vkDomain || ''
  };
};

export function useFirebase() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('wb_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isVKUser, setIsVKUser] = useState(() => {
    const saved = localStorage.getItem('wb_is_vk_user');
    return saved ? JSON.parse(saved) : false;
  });
  const [loadingSync, setLoadingSync] = useState(false);
  const [syncError, setSyncError] = useState('');

  // Проверяем статус VK авторизации при загрузке компонента
  useEffect(() => {
    const checkVKAuthStatus = async () => {
      try {
        const vkUser = await checkVKAuth();
        if (vkUser && vkUser.uid) {
          const cleanUser = cleanUserObject(vkUser);
          if (cleanUser) {
            setUser(cleanUser);
            setIsVKUser(true);
            localStorage.setItem('wb_user', JSON.stringify(cleanUser));
            localStorage.setItem('wb_is_vk_user', 'true');
            
            // Загрузка данных из Firestore
            try {
              const userDoc = await getDoc(doc(db, 'users', cleanUser.uid));
              if (userDoc.exists()) {
                const data = userDoc.data();
                // Обновляем локальное состояние данными из Firestore
                if (data.goals) localStorage.setItem('wb_goals', JSON.stringify(data.goals));
                if (data.analyticsShifts) localStorage.setItem('wb_shifts', JSON.stringify(data.analyticsShifts));
                if (data.calendarData) localStorage.setItem('calendarData', JSON.stringify(data.calendarData));
                if (data.workDays) localStorage.setItem('wb_work_days', JSON.stringify(data.workDays));
              } else {
                // Если данных нет, создаём пустой документ
                const defaultData = {
                  goals: [],
                  analyticsShifts: [],
                  calendarData: {},
                  workDays: [],
                };
                await setDoc(doc(db, 'users', cleanUser.uid), defaultData);
              }
            } catch (firestoreError) {
              console.error('Firestore error:', firestoreError);
            }
          }
        }
      } catch (error) {
        console.error('VK auth check error:', error);
      }
    };

    checkVKAuthStatus();
  }, []);

  const handleVKSignIn = async () => {
    setSyncError('');
    setLoadingSync(true);
    try {
      const vkUser = await vkSignIn();
      if (vkUser && vkUser.uid) {
        const cleanUser = cleanUserObject(vkUser);
        if (cleanUser) {
          setUser(cleanUser);
          setIsVKUser(true);
          localStorage.setItem('wb_user', JSON.stringify(cleanUser));
          localStorage.setItem('wb_is_vk_user', 'true');
          
          // Загрузка данных из Firestore
          try {
            const userDoc = await getDoc(doc(db, 'users', cleanUser.uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              // Обновляем локальное состояние данными из Firestore
              if (data.goals) localStorage.setItem('wb_goals', JSON.stringify(data.goals));
              if (data.analyticsShifts) localStorage.setItem('wb_shifts', JSON.stringify(data.analyticsShifts));
              if (data.calendarData) localStorage.setItem('calendarData', JSON.stringify(data.calendarData));
              if (data.workDays) localStorage.setItem('wb_work_days', JSON.stringify(data.workDays));
            } else {
              // Если данных нет, создаём пустой документ
              const defaultData = {
                goals: [],
                analyticsShifts: [],
                calendarData: {},
                workDays: [],
              };
              await setDoc(doc(db, 'users', cleanUser.uid), defaultData);
            }
          } catch (firestoreError) {
            console.error('Firestore error:', firestoreError);
          }
        }
      }
    } catch (e) {
      console.error('VK sign-in error:', e);
      let errorMessage = 'Ошибка входа через ВКонтакте';
      
      if (e.message.includes('не загрузился')) {
        errorMessage = 'Ошибка загрузки VKID SDK. Проверьте подключение к интернету';
      } else if (e.message.includes('отменена')) {
        errorMessage = 'Авторизация была отменена';
      } else if (e.message.includes('не удалось получить данные')) {
        errorMessage = 'Не удалось получить данные пользователя';
      } else if (e.message.includes('Ошибка авторизации VK')) {
        errorMessage = 'Ошибка авторизации через ВКонтакте';
      } else if (e.message.includes('Ошибка получения данных пользователя')) {
        errorMessage = 'Ошибка получения данных пользователя';
      }
      
      setSyncError(errorMessage);
    } finally {
      setLoadingSync(false);
    }
  };

  const handleVKSignOut = async () => {
    try {
      await vkSignOut();
      setUser(null);
      setIsVKUser(false);
      localStorage.removeItem('wb_user');
      localStorage.removeItem('wb_is_vk_user');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const syncDataToFirestore = async (data) => {
    if (user && isVKUser && user.uid && data) {
      setLoadingSync(true);
      try {
        await setDoc(doc(db, 'users', user.uid), data, { merge: true });
      } catch (error) {
        console.error('Error syncing data:', error);
        setSyncError('Ошибка синхронизации данных');
      } finally {
        setLoadingSync(false);
      }
    }
  };

  return {
    user,
    setUser,
    isVKUser,
    setIsVKUser,
    loadingSync,
    syncError,
    handleVKSignIn,
    handleVKSignOut,
    syncDataToFirestore
  };
} 