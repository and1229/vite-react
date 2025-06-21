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
    const saved = localStorage.getItem('wb_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isGoogleUser, setIsGoogleUser] = useState(() => {
    const saved = localStorage.getItem('wb_is_google_user');
    return saved ? JSON.parse(saved) : false;
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
          }
        }
      } catch (error) {
        console.error('Redirect result error:', error);
        // Если произошла ошибка с редиректом, предлагаем войти как гость
        if (error.code === 'auth/unauthorized-domain' || error.code === 'auth/redirect-uri-mismatch') {
          setSyncError('Google авторизация временно недоступна. Используйте гостевой режим.');
        } else {
          setSyncError('Ошибка при завершении входа через Google');
        }
      }
    };

    checkRedirectResult();
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
    }
  };

  const syncDataToFirestore = async (data) => {
    if (user && isGoogleUser && user.uid) {
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
    isGoogleUser,
    setIsGoogleUser,
    loadingSync,
    syncError,
    handleGoogleSignIn,
    handleGoogleSignOut,
    syncDataToFirestore
  };
} 