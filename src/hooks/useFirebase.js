import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signInWithRedirect, signOut, GoogleAuthProvider, getRedirectResult } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const provider = new GoogleAuthProvider();
provider.addScope('email');
provider.addScope('profile');
provider.setCustomParameters({
  prompt: 'select_account'
});

export function useFirebase() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('wb_user');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error parsing saved user:', error);
      localStorage.removeItem('wb_user');
      return null;
    }
  });
  
  const [isGoogleUser, setIsGoogleUser] = useState(() => {
    try {
      const saved = localStorage.getItem('wb_is_google_user');
      return saved ? JSON.parse(saved) : false;
    } catch (error) {
      console.error('Error parsing saved google user state:', error);
      localStorage.removeItem('wb_is_google_user');
      return false;
    }
  });
  
  const [loadingSync, setLoadingSync] = useState(false);
  const [syncError, setSyncError] = useState('');

  // Создаем демо аккаунт для тестирования
  const createDemoAccount = () => {
    const demoUser = {
      name: 'Администратор (Demo)',
      displayName: 'Администратор (Demo)',
      badge: 'demo_admin',
      email: 'ggttxx1229@yandex.ru', // Ваш email для получения админ прав
      photoURL: '',
      uid: 'demo_admin_access',
      isGoogle: false,
      isDemo: true
    };
    
    setUser(demoUser);
    setIsGoogleUser(false);
    localStorage.setItem('wb_user', JSON.stringify(demoUser));
    localStorage.setItem('wb_is_google_user', 'false');
    
    return demoUser;
  };

  // Проверяем результат редиректа при загрузке компонента
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          const user = result.user;
          const userData = {
            name: user.displayName || user.email || 'Google User',
            displayName: user.displayName,
            badge: user.uid,
            email: user.email,
            photoURL: user.photoURL || '',
            uid: user.uid,
            isGoogle: true,
          };
          setUser(userData);
          setIsGoogleUser(true);
          localStorage.setItem('wb_user', JSON.stringify(userData));
          localStorage.setItem('wb_is_google_user', 'true');
          
          // Загрузка данных из Firestore
          try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
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
              await setDoc(doc(db, 'users', user.uid), defaultData);
            }
          } catch (firestoreError) {
            console.error('Firestore error:', firestoreError);
            setSyncError('Синхронизация недоступна. Данные сохраняются локально.');
          }
        }
      } catch (error) {
        console.error('Redirect result error:', error);
        // Если Firebase недоступен, автоматически создаем демо аккаунт
        if (error.message.includes('Firebase') || error.code?.includes('auth/')) {
          console.log('Firebase auth failed, creating demo account');
          createDemoAccount();
          setSyncError('Используется демо режим. Все функции доступны локально.');
        } else {
          setSyncError('Ошибка авторизации. Используйте демо режим.');
        }
      }
    };

    // Добавляем задержку для стабилизации Firebase
    const timer = setTimeout(() => {
      checkRedirectResult();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleGoogleSignIn = async () => {
    setSyncError('');
    setLoadingSync(true);

    try {
      // Проверяем, доступен ли Firebase
      if (!auth || !provider) {
        throw new Error('Firebase not initialized');
      }
      
      // Используем редирект вместо попапа
      await signInWithRedirect(auth, provider);
      // После редиректа пользователь вернется на страницу и useEffect обработает результат
    } catch (e) {
      console.error('Google sign-in error:', e);
      
      // Fallback: создаем демо аккаунт
      console.log('Google sign-in failed, creating demo account');
      createDemoAccount();
      setSyncError('Google авторизация недоступна. Используется демо режим с полным доступом.');
      setLoadingSync(false);
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      // Очищаем локальные данные в любом случае
      setUser(null);
      setIsGoogleUser(false);
      localStorage.removeItem('wb_user');
      localStorage.removeItem('wb_is_google_user');
    }
  };

  const syncDataToFirestore = async (data) => {
    if (!user || !isGoogleUser || !user.uid || user.isDemo) {
      return; // Просто сохраняем локально для демо пользователей
    }

    setLoadingSync(true);
    try {
      await setDoc(doc(db, 'users', user.uid), data, { merge: true });
      setSyncError(''); // Очищаем ошибки при успешной синхронизации
    } catch (error) {
      console.error('Error syncing data:', error);
      setSyncError('Синхронизация недоступна. Данные сохраняются локально.');
    } finally {
      setLoadingSync(false);
    }
  };

  // Синхронизация данных подписки с Firestore
  const syncSubscriptionToFirestore = async (subscriptionData) => {
    if (!user || !isGoogleUser || !user.uid || user.isDemo) {
      return; // Просто сохраняем локально для демо пользователей
    }

    try {
      await setDoc(doc(db, 'users', user.uid), { 
        subscription: subscriptionData,
        lastSubscriptionUpdate: new Date().toISOString()
      }, { merge: true });
      console.log('Subscription synced to Firestore');
    } catch (error) {
      console.error('Error syncing subscription:', error);
    }
  };

  // Загрузка данных подписки из Firestore
  const loadSubscriptionFromFirestore = async () => {
    if (!user || !isGoogleUser || !user.uid || user.isDemo) {
      return null; // Возвращаем null, будет использоваться локальное хранилище
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return data.subscription || null;
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
    return null;
  };

      return {
      user,
      setUser,
      isGoogleUser,
      setIsGoogleUser,
      loadingSync,
      syncError,
      handleGoogleSignIn,
      handleGoogleSignOut,
      syncDataToFirestore,
      syncSubscriptionToFirestore,
      loadSubscriptionFromFirestore,
      createDemoAccount
    };
} 