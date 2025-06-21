import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { getDoc, doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

// Импорт компонентов
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { Calculator } from './components/Calculator';
import { Schedule } from './components/Schedule';
import { Analytics } from './components/Analytics';
import { Goals } from './components/Goals';
import { ShiftEditModal } from './components/ShiftEditModal';
import { SettingsPanel } from './components/SettingsModal';
import { AuthScreen } from './components/AuthScreen';

// Импорт хуков
import { useLocalStorage } from './hooks/useLocalStorage';
import { useFirebase } from './hooks/useFirebase';

// Регистрация Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function App() {
  // Состояния с localStorage
  const [darkMode, setDarkMode] = useLocalStorage('wb_dark_mode', true);
  const [goals, setGoals] = useLocalStorage('wb_goals', []);
  const [analyticsShifts, setAnalyticsShifts] = useLocalStorage('wb_shifts', []);
  const [calendarData, setCalendarData] = useLocalStorage('calendarData', {});
  const [workDays, setWorkDays] = useLocalStorage('wb_work_days', []);
  const [usersCount, setUsersCount] = useLocalStorage('wb_users_count', 0);

  // Состояния компонентов
  const [activeTab, setActiveTab] = useState("calculator");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedShiftIndex, setSelectedShiftIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Состояния калькулятора
  const [targetEarnings, setTargetEarnings] = useState("");
  const [ratePerPick, setRatePerPick] = useState("");
  const [workHours, setWorkHours] = useState("");
  const [breakInterval, setBreakInterval] = useState("");
  const [shiftDate, setShiftDate] = useState(new Date().toISOString().split("T")[0]);
  const [shiftType, setShiftType] = useState('day');
  const [shiftStatus, setShiftStatus] = useState('regular');
  const [shiftNote, setShiftNote] = useState('');

  // Firebase хук
  const {
    user,
    setUser,
    isVKUser,
    setIsVKUser,
    loadingSync,
    syncError,
    handleVKSignIn,
    handleVKSignOut,
    syncDataToFirestore
  } = useFirebase();

  // PWA установка
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        } else {
          console.log('User dismissed the A2HS prompt');
        }
        setDeferredPrompt(null);
        setShowInstall(false);
      });
    }
  };

  // Тема
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  // Загрузка данных при входе через VK
  const handleVKSignInWithData = async (vkUserData = null) => {
    if (vkUserData && vkUserData.uid) {
      // Очищаем объект пользователя от циклических ссылок
      const cleanUser = {
        name: vkUserData.name || '',
        displayName: vkUserData.displayName || vkUserData.name || '',
        badge: vkUserData.badge || '',
        email: vkUserData.email || '',
        photoURL: vkUserData.photoURL || '',
        uid: vkUserData.uid || '',
        isVK: vkUserData.isVK || false,
        vkId: vkUserData.vkId || '',
        vkDomain: vkUserData.vkDomain || ''
      };

      // Если данные пользователя переданы напрямую от VKID виджета
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
    } else {
      // Старый способ через хук (для совместимости)
      await handleVKSignIn();
    }
  };

  // Вход как гость
  const handleGuestSignIn = () => {
    setUser({ name: 'Гость', badge: 'guest', isVK: false });
  };

  // Выход из аккаунта
  const handleSignOut = () => {
    setUser(null);
    setIsVKUser(false);
  };

  // Синхронизация с Firestore при изменении данных
  useEffect(() => {
    if (user && isVKUser && user.uid) {
      syncDataToFirestore({
        goals,
        analyticsShifts,
        calendarData,
        workDays,
      });
    }
  }, [goals, analyticsShifts, calendarData, workDays, user, isVKUser]);

  // Обновление состояния после успешной авторизации через VK
  useEffect(() => {
    if (user && isVKUser) {
      // Обновляем состояние из localStorage, если данные были загружены из Firestore
      const storedGoals = localStorage.getItem('wb_goals');
      const storedShifts = localStorage.getItem('wb_shifts');
      const storedCalendar = localStorage.getItem('calendarData');
      const storedWorkDays = localStorage.getItem('wb_work_days');
      
      if (storedGoals) {
        try {
          const parsedGoals = JSON.parse(storedGoals);
          if (parsedGoals.length !== goals.length) {
            setGoals(parsedGoals);
          }
        } catch (e) {
          console.error('Error parsing stored goals:', e);
        }
      }
      
      if (storedShifts) {
        try {
          const parsedShifts = JSON.parse(storedShifts);
          if (parsedShifts.length !== analyticsShifts.length) {
            setAnalyticsShifts(parsedShifts);
          }
        } catch (e) {
          console.error('Error parsing stored shifts:', e);
        }
      }
      
      if (storedCalendar) {
        try {
          const parsedCalendar = JSON.parse(storedCalendar);
          if (Object.keys(parsedCalendar).length !== Object.keys(calendarData).length) {
            setCalendarData(parsedCalendar);
          }
        } catch (e) {
          console.error('Error parsing stored calendar:', e);
        }
      }
      
      if (storedWorkDays) {
        try {
          const parsedWorkDays = JSON.parse(storedWorkDays);
          if (parsedWorkDays.length !== workDays.length) {
            setWorkDays(parsedWorkDays);
          }
        } catch (e) {
          console.error('Error parsing stored work days:', e);
        }
      }
    }
  }, [user, isVKUser]);

  // Обновление статистики пользователей
  useEffect(() => {
    if (user && user.badge) {
      // Очищаем объект пользователя от циклических ссылок
      const cleanUser = {
        name: user.name || '',
        displayName: user.displayName || user.name || '',
        badge: user.badge || '',
        email: user.email || '',
        photoURL: user.photoURL || '',
        uid: user.uid || '',
        isVK: user.isVK || false,
        vkId: user.vkId || '',
        vkDomain: user.vkDomain || ''
      };

      let users = JSON.parse(localStorage.getItem('wb_users') || '[]');
      const exists = users.some(u => u.badge === cleanUser.badge);
      if (!exists) {
        users.push(cleanUser);
        localStorage.setItem('wb_users', JSON.stringify(users));
        setUsersCount(users.length);
      } else {
        setUsersCount(users.length);
      }
    }
  }, [user, setUsersCount]);

  // Яндекс.Метрика
  useEffect(() => {
    if (!window.ym) {
      (function(m,e,t,r,i,k,a){
        m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
      })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
      window.ym && window.ym(102777505, "init", {
        clickmap:true,
        trackLinks:true,
        accurateTrackBounce:true,
        webvisor:true
      });
    }
  }, []);

  // Функции для работы с целями
  const addGoalFromShift = () => {
    const earnings = parseFloat(targetEarnings);
    const rate = parseFloat(ratePerPick);
    const hours = parseFloat(workHours);
    const breakEvery = parseInt(breakInterval);

    if (!earnings || !rate || !hours || !breakEvery) return;

    const breaksCount = Math.floor(hours / breakEvery);
    const picksNeeded = Math.ceil(earnings / rate);
    const localDate = shiftDate;

    setGoals([
      ...goals,
      {
        planned: {
          amount: earnings,
          rate: rate,
          picks: picksNeeded,
          date: localDate,
          type: shiftType,
          status: shiftStatus,
          note: shiftNote,
        },
        actual: {
          amount: earnings,
          rate: rate,
          picks: picksNeeded,
          date: localDate,
          type: shiftType,
          status: shiftStatus,
          note: shiftNote,
        },
        completed: false,
      },
    ]);

    // Сброс полей
    setTargetEarnings("");
    setRatePerPick("");
    setWorkHours("");
    setBreakInterval("");
    setShiftType('day');
    setShiftStatus('regular');
    setShiftNote('');
  };

  const toggleGoalCompletion = (index) => {
    const updatedGoals = [...goals];
    const goal = updatedGoals[index];

    if (!goal.completed) {
      const d = new Date(goal.actual.date);
      const localDate = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      setAnalyticsShifts([...analyticsShifts, { ...goal.actual, date: localDate }]);
    } else {
      setAnalyticsShifts(analyticsShifts.filter((s) => s.date !== goal.actual.date));
    }

    updatedGoals[index].completed = !updatedGoals[index].completed;
    setGoals(updatedGoals);
  };

  const deleteGoal = (index) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  const handleGoalUpdate = (updatedGoal, idx) => {
    setGoals(goals => goals.map((g, i) => i === idx ? updatedGoal : g));
  };

  // Функции для работы с календарем
  const prevMonth = () => {
    setCurrentDate(date => new Date(date.getFullYear(), date.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(date => new Date(date.getFullYear(), date.getMonth() + 1, 1));
  };

  const toggleWorkDay = (date) => {
    setWorkDays((prev) =>
      prev.includes(date)
        ? prev.filter((d) => d !== date)
        : [...prev, date]
    );
  };

  // Функции для работы со сменами
  const loadShiftToCalculator = (date) => {
    setShiftDate(date);
    const selectedShift = analyticsShifts.find((s) => s.date === date);
    if (selectedShift) {
      setTargetEarnings(selectedShift.amount.toString());
      setRatePerPick(selectedShift.rate.toString());
      setWorkHours("8");
      setBreakInterval("2");
    } else {
      setTargetEarnings("");
      setRatePerPick("");
      setWorkHours("");
      setBreakInterval("");
    }
    setActiveTab("calculator");
  };

  const openShiftDetails = (date) => {
    const index = analyticsShifts.findIndex((s) => s.date === date);
    if (index !== -1) {
      setSelectedShiftIndex(index);
      setShowDetailsModal(true);
    }
  };

  const editShiftAmount = (index, value) => {
    const newAmount = parseFloat(value);
    if (isNaN(newAmount)) return;

    const shift = analyticsShifts[index];
    const newPicks = Math.ceil(newAmount / shift.rate);

    const updatedShifts = [...analyticsShifts];
    updatedShifts[index] = {
      ...shift,
      amount: newAmount,
      picks: newPicks,
    };
    setAnalyticsShifts(updatedShifts);
  };

  const editShiftPicks = (index, value) => {
    const newPicks = parseInt(value);
    if (isNaN(newPicks) || newPicks <= 0) return;

    const shift = analyticsShifts[index];
    const newAmount = newPicks * shift.rate;

    const updatedShifts = [...analyticsShifts];
    updatedShifts[index] = {
      ...shift,
      amount: newAmount,
      picks: newPicks,
    };
    setAnalyticsShifts(updatedShifts);
  };

  const deleteShift = (date) => {
    setAnalyticsShifts(analyticsShifts.filter((s) => s.date !== date));
    setGoals(
      goals.map((g) =>
        g.actual?.date === date ? { ...g, completed: false } : g
      )
    );
  };

  // Группировка смен по дате для календаря
  const shiftsByDay = analyticsShifts.reduce((acc, shift) => {
    if (shift.date) acc[shift.date] = shift;
    return acc;
  }, {});

  // Если пользователь не авторизован, показываем экран входа
  if (!user) {
    return (
      <AuthScreen
        onVKSignIn={handleVKSignInWithData}
        onGuestSignIn={handleGuestSignIn}
        loadingSync={loadingSync}
        syncError={syncError}
      />
    );
  }

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"} min-h-screen font-sans transition-colors duration-500 flex flex-col items-center`}>
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        showInstall={showInstall}
        handleInstallClick={handleInstallClick}
        user={user}
        setShowSettings={setShowSettings}
        showSettings={showSettings}
      />
      
      <SettingsPanel
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        showSettings={showSettings}
        user={user}
        onVKSignIn={handleVKSignInWithData}
        onVKSignOut={handleSignOut}
        onGuestSignIn={handleGuestSignIn}
      />
      
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
      />
      
      <main className="container mx-auto p-3 sm:p-4 max-w-4xl w-full">
        {activeTab === "calculator" && (
          <Calculator
            darkMode={darkMode}
            shiftDate={shiftDate}
            setShiftDate={setShiftDate}
            targetEarnings={targetEarnings}
            setTargetEarnings={setTargetEarnings}
            ratePerPick={ratePerPick}
            setRatePerPick={setRatePerPick}
            workHours={workHours}
            setWorkHours={setWorkHours}
            breakInterval={breakInterval}
            setBreakInterval={setBreakInterval}
            shiftType={shiftType}
            setShiftType={setShiftType}
            shiftNote={shiftNote}
            setShiftNote={setShiftNote}
            addGoalFromShift={addGoalFromShift}
          />
        )}

        {activeTab === "schedule" && (
          <Schedule
            darkMode={darkMode}
            shifts={shiftsByDay}
            loadShift={loadShiftToCalculator}
            deleteShift={deleteShift}
            openShiftDetails={openShiftDetails}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            prevMonth={prevMonth}
            nextMonth={nextMonth}
            workDays={workDays}
            toggleWorkDay={toggleWorkDay}
          />
        )}

        {activeTab === "analytics" && (
          <Analytics
            darkMode={darkMode}
            analyticsShifts={analyticsShifts}
            goals={goals}
            calendarData={calendarData}
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={setSelectedPeriod}
          />
        )}

        {activeTab === "goals" && (
          <Goals
            goals={goals}
            darkMode={darkMode}
            onToggle={toggleGoalCompletion}
            onDelete={deleteGoal}
            onUpdate={handleGoalUpdate}
          />
        )}
      </main>

      <footer className={`mt-auto py-3 sm:py-4 px-3 sm:px-4 text-center text-xs sm:text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400 bg-white/80 border-t border-gray-200'}`}>
        ShiftMate © {new Date().getFullYear()} 
      </footer>
      
      <div className="w-full flex justify-center pb-4 sm:pb-6 px-3 sm:px-4">
        <a
          href="https://pxl.leads.su/click/e2a6684949541fd83e9e15e94a82fee9?erid=2W5zFJLdzVv"
          target="_blank"
          rel="noopener noreferrer"
          className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white font-bold text-sm sm:text-base shadow-md hover:shadow-xl hover:brightness-110 transition-all duration-300 ${darkMode ? '' : 'shadow-lg'}`}
          style={{
            minWidth: 160,
            textAlign: 'center',
            letterSpacing: '0.05em',
            fontFamily: `'Segoe UI', sans-serif`,
            boxShadow: darkMode ? '0 4px 10px rgba(128, 90, 213, 0.3)' : '0 6px 16px rgba(128, 90, 213, 0.10)',
          }}
          title="Бери деньги — плати 0%"
        >
          Бери деньги — плати 0%
        </a>
      </div>

      {/* Модальные окна */}
      {showDetailsModal && selectedShiftIndex !== null && (
        <ShiftEditModal
          shift={analyticsShifts[selectedShiftIndex]}
          onSaveAmount={(value) => editShiftAmount(selectedShiftIndex, value)}
          onSavePicks={(value) => editShiftPicks(selectedShiftIndex, value)}
          onClose={() => setShowDetailsModal(false)}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}
