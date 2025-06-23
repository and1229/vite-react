import React, { useState, useEffect, useRef } from 'react';
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
  Legend,
  Filler
} from 'chart.js';

// Импорт компонентов
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { Calculator } from './components/Calculator';
import { Schedule } from './components/Schedule';
import { Analytics } from './components/Analytics';
import { Goals } from './components/Goals';
import { ShiftEditModal } from './components/ShiftEditModal';
import { SettingsPanel } from './components/SettingsPanel';
import { AnimatedTabContent } from './components/AnimatedTabContent';
import { TermsOfUse } from './components/TermsOfUse';
import { FeedbackModal } from './components/FeedbackModal';
import { useSwipe } from './hooks/useSwipe';
import { useHaptic } from './hooks/useHaptic';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useShiftCalculator } from './hooks/useShiftCalculator';
import { useAnalytics } from './hooks/useAnalytics';
import { useFirebase } from './hooks/useFirebase';
import { useMobileGestures } from './hooks/useMobileGestures';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import './styles.css';

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
  Legend,
  Filler
);

export default function App() {
  // Миграция старых ключей localStorage
  useEffect(() => {
    const migrateKey = (oldKey, newKey) => {
      const oldData = localStorage.getItem(oldKey);
      if (oldData) {
        localStorage.setItem(newKey, oldData);
        localStorage.removeItem(oldKey);
      }
    };
    migrateKey('wb_dark_mode', 'app_dark_mode');
    migrateKey('wb_goals', 'app_goals');
    migrateKey('wb_shifts', 'app_shifts');
    migrateKey('wb_work_days', 'app_work_days');
    migrateKey('wb_users_count', 'app_users_count');
  }, []);

  // Состояния с localStorage
  const [darkMode, setDarkMode] = useLocalStorage('app_dark_mode', true);
  const [goals, setGoals] = useLocalStorage('app_goals', []);
  const [analyticsShifts, setAnalyticsShifts] = useLocalStorage('app_shifts', []);
  const [calendarData, setCalendarData] = useLocalStorage('calendarData', {});
  const [workDays, setWorkDays] = useLocalStorage('app_work_days', []);
  const [usersCount, setUsersCount] = useLocalStorage('app_users_count', 0);
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  // Состояния компонентов
  const [activeTab, setActiveTab] = useState("calculator");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedShiftIndex, setSelectedShiftIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showAdButton, setShowAdButton] = useState(false);

  // Состояния калькулятора
  const [targetEarnings, setTargetEarnings] = useState("");
  const [ratePerPick, setRatePerPick] = useState("");
  const [workHours, setWorkHours] = useState("");
  const [breakInterval, setBreakInterval] = useState("");
  const [shiftDate, setShiftDate] = useState(new Date().toISOString().split("T")[0]);
  const [shiftType, setShiftType] = useState('day');
  const [shiftStatus, setShiftStatus] = useState('regular');
  const [shiftNote, setShiftNote] = useState('');

  // Свайпы для навигации
  const handleSwipeLeft = () => {
    const tabs = ["calculator", "schedule", "analytics", "goals"];
    const currentIndex = tabs.indexOf(activeTab);
    const nextIndex = (currentIndex + 1) % tabs.length;
    setActiveTab(tabs[nextIndex]);
  };

  const handleSwipeRight = () => {
    const tabs = ["calculator", "schedule", "analytics", "goals"];
    const currentIndex = tabs.indexOf(activeTab);
    const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
    setActiveTab(tabs[prevIndex]);
  };

  // Хук для свайпов
  const swipeRef = useSwipe(handleSwipeLeft, handleSwipeRight);

  // PWA установка - исправленная версия с диагностикой
  useEffect(() => {
    let deferredPrompt = null;

    const handler = (e) => {
      e.preventDefault();
      deferredPrompt = e;
      setDeferredPrompt(e);
      setShowInstall(true);
      console.log('PWA install prompt captured');
    };

    // Проверяем, установлено ли уже приложение
    const checkIfInstalled = () => {
      // Проверка для standalone режима
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        console.log('App is already installed in standalone mode');
        setShowInstall(false);
        return true;
      }
      
      // Проверка для iOS (проверяем наличие вкладки в браузере)
      if (window.navigator.standalone === true) {
        console.log('App is already installed on iOS');
        setShowInstall(false);
        return true;
      }
      
      // Проверка для Android (проверяем наличие в списке приложений)
      if ('getInstalledRelatedApps' in navigator) {
        navigator.getInstalledRelatedApps().then((relatedApps) => {
          if (relatedApps.length > 0) {
            console.log('App is already installed on Android');
            setShowInstall(false);
            return true;
          }
        });
      }
      
      return false;
    };

    // Диагностика PWA
    const diagnosePWA = async () => {
      console.log('=== PWA Диагностика ===');
      console.log('HTTPS:', window.location.protocol === 'https:');
      console.log('Service Worker:', 'serviceWorker' in navigator);
      console.log('Push Manager:', 'PushManager' in window);
      console.log('User Agent:', navigator.userAgent);
      
      // Проверяем manifest
      try {
        const manifestResponse = await fetch('/manifest.json');
        if (manifestResponse.ok) {
          const manifest = await manifestResponse.json();
          console.log('Manifest загружен:', manifest.name);
        } else {
          console.error('Manifest не загружен:', manifestResponse.status);
        }
      } catch (error) {
        console.error('Ошибка загрузки manifest:', error);
      }
      
      // Проверяем service worker
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            console.log('Service Worker зарегистрирован:', registration.active ? 'активен' : 'неактивен');
          } else {
            console.log('Service Worker не зарегистрирован');
          }
        } catch (error) {
          console.error('Ошибка проверки Service Worker:', error);
        }
      }
      
      console.log('=== Конец диагностики ===');
    };

    // Проверяем при загрузке
    checkIfInstalled();
    diagnosePWA();

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      console.log('App was installed');
      setShowInstall(false);
      setDeferredPrompt(null);
      deferredPrompt = null;
    });

    // Принудительно показываем кнопку для тестирования через 1 секунду
    // (удалить после тестирования)
    const testTimer = setTimeout(() => {
      if (!deferredPrompt && !checkIfInstalled()) {
        console.log('Принудительно показываем кнопку для тестирования');
        setShowInstall(true);
      }
    }, 1000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', () => {});
      clearTimeout(testTimer);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      console.log('Triggering install prompt...');
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        } else {
          console.log('User dismissed the A2HS prompt');
        }
        setDeferredPrompt(null);
        setShowInstall(false);
      }).catch((error) => {
        console.error('Error during install prompt:', error);
        setDeferredPrompt(null);
        setShowInstall(false);
      });
    } else {
      // Fallback для случаев, когда нет deferredPrompt
      console.log('No deferred prompt available, showing manual install instructions');
      
      // Показываем инструкции для ручной установки
      if (navigator.userAgent.includes('Chrome')) {
        alert('Для установки приложения:\n1. Нажмите на меню браузера (⋮)\n2. Выберите "Установить приложение"\n3. Подтвердите установку');
      } else if (navigator.userAgent.includes('Safari')) {
        alert('Для установки приложения:\n1. Нажмите на кнопку "Поделиться" (□↑)\n2. Выберите "На экран «Домой»"\n3. Подтвердите установку');
      } else {
        alert('Для установки приложения используйте меню браузера и выберите "Установить приложение" или "Добавить на главный экран"');
      }
    }
  };

  // Тема
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  // Показываем рекламную кнопку через 5 секунд
  useEffect(() => {
    const adTimer = setTimeout(() => {
      setShowAdButton(true);
    }, 5000);

    return () => clearTimeout(adTimer);
  }, []);

  // Обновление статистики пользователей
  useEffect(() => {
    // Эта логика больше не нужна, так как `usersCount` берется из localStorage,
    // а авторизация теперь через Яндекс.
    // let users = JSON.parse(localStorage.getItem('wb_users') || '[]');
    // setUsersCount(users.length);
  }, [setUsersCount]);

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
          hours: hours,
          date: localDate,
          type: shiftType,
          status: shiftStatus,
          note: shiftNote,
        },
        actual: {
          amount: earnings,
          rate: rate,
          picks: picksNeeded,
          hours: hours,
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

  useEffect(() => {
    // Добавляем глобальную функцию для тестирования обновлений
    window.forceUpdate = () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            if ('caches' in window) {
              caches.keys().then((cacheNames) => {
                return Promise.all(
                  cacheNames.map((cacheName) => {
                    return caches.delete(cacheName);
                  })
                );
              });
            }
            window.location.reload();
          });
        });
      }
    };

    serviceWorkerRegistration.register({
      onUpdate: registration => {
        console.log('New version detected! Auto-updating...');
        
        // Автоматически обновляем приложение
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          registration.waiting.addEventListener('statechange', event => {
            if (event.target.state === 'activated') {
              console.log('New version activated, reloading...');
              window.location.reload();
            }
          });
        }
      },
      onSuccess: registration => {
        console.log('Service worker registered successfully');
      }
    });

    // Дополнительная проверка обновлений каждые 15 минут
    const checkForUpdates = () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.update();
        });
      }
    };

    const updateInterval = setInterval(checkForUpdates, 15 * 60 * 1000); // 15 минут

    // Проверка обновлений при фокусе на приложении
    const handleFocus = () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.update();
        });
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(updateInterval);
      window.removeEventListener('focus', handleFocus);
      delete window.forceUpdate;
    };
  }, []);

  return (
    <div 
      ref={swipeRef}
      className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"} min-h-screen font-sans transition-colors duration-500 flex flex-col items-center`}
    >
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        showInstall={showInstall}
        handleInstallClick={handleInstallClick}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
      />
      
      <SettingsPanel
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode(!darkMode)}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        onShowFeedback={() => setShowFeedback(true)}
      />
      
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
      />
      
      <main className="container mx-auto p-3 sm:p-4 max-w-4xl w-full transition-all duration-300">
        <AnimatedTabContent activeTab={activeTab} darkMode={darkMode} animationType="slide">
          <div data-tab="calculator">
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
          </div>

          <div data-tab="schedule">
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
          </div>

          <div data-tab="analytics">
            <Analytics
              darkMode={darkMode}
              analyticsShifts={analyticsShifts}
              goals={goals}
              calendarData={calendarData}
              selectedPeriod={selectedPeriod}
              setSelectedPeriod={setSelectedPeriod}
            />
          </div>

          <div data-tab="goals">
            <Goals
              goals={goals}
              darkMode={darkMode}
              onToggle={toggleGoalCompletion}
              onDelete={deleteGoal}
              onUpdate={handleGoalUpdate}
            />
          </div>
        </AnimatedTabContent>
      </main>

      <footer className={`mt-auto py-3 sm:py-4 px-3 sm:px-4 text-center text-xs sm:text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400 bg-white/80 border-t border-gray-200'}`}>
        ShiftMate © {new Date().getFullYear()} | 
        <button onClick={() => setShowTerms(true)} className="ml-1 underline hover:text-purple-400 transition-colors">
          Условия использования
        </button>
      </footer>
      
      <div className="w-full flex justify-center pb-4 sm:pb-6 px-3 sm:px-4">
        <a
          href="https://pxl.leads.su/click/e2a6684949541fd83e9e15e94a82fee9?erid=2W5zFJLdzVv"
          target="_blank"
          rel="noopener noreferrer"
          className={`ad-button px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-purple-500 via-blue-500 to-purple-600 ad-button-gradient text-white font-semibold text-sm sm:text-base shadow-lg ${darkMode ? 'shadow-purple-500/25' : 'shadow-purple-500/20'} ${showAdButton ? 'ad-button-enter-active' : 'ad-button-enter'}`}
          style={{
            minWidth: 160,
            textAlign: 'center',
            letterSpacing: '0.02em',
            fontFamily: `'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif`,
            boxShadow: darkMode 
              ? '0 8px 25px rgba(139, 92, 246, 0.3), 0 4px 10px rgba(59, 130, 246, 0.2)' 
              : '0 8px 25px rgba(139, 92, 246, 0.15), 0 4px 10px rgba(59, 130, 246, 0.1)',
            backdropFilter: 'blur(10px)',
            border: darkMode ? '1px solid rgba(139, 92, 246, 0.2)' : '1px solid rgba(139, 92, 246, 0.1)',
          }}
          title="Бери деньги — плати 0%"
        >
          <span className="flex items-center justify-center space-x-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span>Бери деньги — плати 0%</span>
          </span>
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

      {showTerms && (
        <TermsOfUse onClose={() => setShowTerms(false)} darkMode={darkMode} />
      )}

      {showFeedback && (
        <FeedbackModal onClose={() => setShowFeedback(false)} darkMode={darkMode} />
      )}
    </div>
  );
}
