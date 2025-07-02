import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signInWithRedirect, signOut, GoogleAuthProvider, getRedirectResult } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const provider = new GoogleAuthProvider();
// Добавляем дополнительные области доступа
provider.addScope('email');
provider.addScope('profile');
// Устанавливаем тип входа
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
            // Если Firestore недоступен, продолжаем работу в локальном режиме
            if (firestoreError.message && firestoreError.message.includes('PERMISSION_DENIED')) {
              setSyncError('Ошибка доступа к Firebase. Данные сохраняются локально.');
            } else {
              setSyncError('Синхронизация временно недоступна. Данные сохраняются локально.');
            }
          }
        }
      } catch (error) {
        console.error('Redirect result error:', error);
        // Обрабатываем различные типы ошибок
        if (error.code === 'auth/unauthorized-domain' || error.code === 'auth/redirect-uri-mismatch') {
          setSyncError('Google авторизация временно недоступна. Используйте гостевой режим.');
        } else if (error.code === 'auth/network-request-failed') {
          setSyncError('Ошибка сети. Проверьте подключение к интернету.');
        } else if (error.message && error.message.includes('PERMISSION_DENIED')) {
          setSyncError('Ошибка доступа к Firebase. Используйте гостевой режим.');
        } else {
          setSyncError('Ошибка при завершении входа через Google. Используйте гостевой режим.');
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
      // Проверяем, доступен ли домен для авторизации
      const currentDomain = window.location.origin;
      console.log('Current domain:', currentDomain);
      
      // Используем редирект вместо попапа
      await signInWithRedirect(auth, provider);
      // После редиректа пользователь вернется на страницу и useEffect обработает результат
    } catch (e) {
      console.error('Google sign-in error:', e);
      let errorMessage = 'Ошибка входа через Google';
      
      if (e.code === 'auth/unauthorized-domain') {
        errorMessage = 'Домен не авторизован для входа через Google. Используйте гостевой режим.';
      } else if (e.code === 'auth/redirect-uri-mismatch') {
        errorMessage = 'Ошибка конфигурации авторизации. Используйте гостевой режим.';
      } else if (e.code === 'auth/network-request-failed') {
        errorMessage = 'Ошибка сети. Проверьте подключение к интернету';
      } else if (e.code === 'auth/operation-not-allowed') {
        errorMessage = 'Вход через Google не разрешен для этого приложения';
      } else if (e.message && e.message.includes('PERMISSION_DENIED')) {
        errorMessage = 'Ошибка доступа к Firebase. Используйте гостевой режим.';
      }
      
      setSyncError(errorMessage);
      setLoadingSync(false);
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsGoogleUser(false);
      localStorage.removeItem('wb_user');
      localStorage.removeItem('wb_is_google_user');
    } catch (error) {
      console.error('Sign out error:', error);
      // Даже если выход не удался, очищаем локальные данные
      setUser(null);
      setIsGoogleUser(false);
      localStorage.removeItem('wb_user');
      localStorage.removeItem('wb_is_google_user');
    }
  };

  const syncDataToFirestore = async (data) => {
    if (user && isGoogleUser && user.uid) {
      setLoadingSync(true);
      try {
        await setDoc(doc(db, 'users', user.uid), data, { merge: true });
        setSyncError(''); // Очищаем ошибки при успешной синхронизации
      } catch (error) {
        console.error('Error syncing data:', error);
        if (error.message && error.message.includes('PERMISSION_DENIED')) {
          setSyncError('Ошибка доступа к Firebase. Данные сохраняются локально.');
        } else {
          setSyncError('Ошибка синхронизации данных. Данные сохраняются локально.');
        }
      } finally {
        setLoadingSync(false);
      }
    }
  };

  // Синхронизация данных подписки с Firestore
  const syncSubscriptionToFirestore = async (subscriptionData) => {
    if (user && isGoogleUser && user.uid) {
      try {
        await setDoc(doc(db, 'users', user.uid), { 
          subscription: subscriptionData,
          lastSubscriptionUpdate: new Date().toISOString()
        }, { merge: true });
        console.log('Subscription synced to Firestore');
      } catch (error) {
        console.error('Error syncing subscription:', error);
      }
    }
  };

  // Загрузка данных подписки из Firestore
  const loadSubscriptionFromFirestore = async () => {
    if (user && isGoogleUser && user.uid) {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          return data.subscription || null;
        }
      } catch (error) {
        console.error('Error loading subscription:', error);
      }
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
    loadSubscriptionFromFirestore
  };
} 