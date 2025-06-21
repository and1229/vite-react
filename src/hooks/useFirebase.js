import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signInWithPopup, signOut, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const provider = new GoogleAuthProvider();

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

  const handleGoogleSignIn = async () => {
    setSyncError('');
    setLoadingSync(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userData = {
        name: user.displayName || user.email || 'Google User',
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
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return data; // Возвращаем данные для обновления состояния в App.jsx
      } else {
        // Если данных нет, создаём пустой документ
        await setDoc(doc(db, 'users', user.uid), {
          goals: [],
          analyticsShifts: [],
          calendarData: {},
          workDays: [],
        });
        return {
          goals: [],
          analyticsShifts: [],
          calendarData: {},
          workDays: [],
        };
      }
    } catch (e) {
      setSyncError('Ошибка входа через Google');
      return null;
    } finally {
      setLoadingSync(false);
    }
  };

  const handleGoogleSignOut = async () => {
    await signOut(auth);
    setUser(null);
    setIsGoogleUser(false);
    localStorage.removeItem('wb_user');
    localStorage.removeItem('wb_is_google_user');
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