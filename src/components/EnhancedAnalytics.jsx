import React, { useState, useMemo } from 'react';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import { useAnalytics } from '../hooks/useAnalytics';
import { useHaptic } from '../hooks/useHaptic';
import { PERIODS, WEEKDAY_LABELS } from '../utils/constants';

export function EnhancedAnalytics({ 
  darkMode, 
  analyticsShifts, 
  goals, 
  calendarData, 
  selectedPeriod, 
  setSelectedPeriod 
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const { hapticButton } = useHaptic();
  const { 
    getStats, 
    getWeekdayStats, 
    getWeeklyStats, 
    getMonthlyStats, 
    getPlanFactStats 
  } = useAnalytics(analyticsShifts, goals, calendarData);

  // Прогноз заработка на основе исторических данных
  const earningsForecast = useMemo(() => {
    if (analyticsShifts.length < 3) return null;

    const recentShifts = analyticsShifts
      .slice(-10)
      .map(shift => shift.amount || 0)
      .filter(amount => amount > 0);

    if (recentShifts.length < 3) return null;

    // Простая линейная регрессия
    const n = recentShifts.length;
    const sumX = (n * (n + 1)) / 2;
    const sumY = recentShifts.reduce((sum, val) => sum + val, 0);
    const sumXY = recentShifts.reduce((sum, val, index) => sum + val * (index + 1), 0);
    const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const nextWeekForecast = slope * (n + 1) + intercept;
    const nextMonthForecast = slope * (n + 4) + intercept;

    return {
      nextWeek: Math.max(0, Math.round(nextWeekForecast)),
      nextMonth: Math.max(0, Math.round(nextMonthForecast)),
      trend: slope > 0 ? 'up' : slope < 0 ? 'down' : 'stable'
    };
  }, [analyticsShifts]);

  // Сравнение периодов
  const periodComparison = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const currentMonthShifts = analyticsShifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      return shiftDate.getMonth() === currentMonth && shiftDate.getFullYear() === currentYear;
    });

    const previousMonthShifts = analyticsShifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return shiftDate.getMonth() === prevMonth && shiftDate.getFullYear() === prevYear;
    });

    const currentTotal = currentMonthShifts.reduce((sum, shift) => sum + (shift.amount || 0), 0);
    const previousTotal = previousMonthShifts.reduce((sum, shift) => sum + (shift.amount || 0), 0);
    
    const change = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

    return {
      current: currentTotal,
      previous: previousTotal,
      change: Math.round(change * 100) / 100,
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
    };
  }, [analyticsShifts]);

  // Анализ эффективности по времени суток
  const timeEfficiency = useMemo(() => {
    const timeSlots = {
      '06:00-12:00': { total: 0, count: 0 },
      '12:00-18:00': { total: 0, count: 0 },
      '18:00-24:00': { total: 0, count: 0 },
      '00:00-06:00': { total: 0, count: 0 }
    };

    analyticsShifts.forEach(shift => {
      if (shift.shiftType === 'day') {
        timeSlots['06:00-12:00'].total += shift.amount || 0;
        timeSlots['06:00-12:00'].count += 1;
        timeSlots['12:00-18:00'].total += shift.amount || 0;
        timeSlots['12:00-18:00'].count += 1;
      } else if (shift.shiftType === 'night') {
        timeSlots['18:00-24:00'].total += shift.amount || 0;
        timeSlots['18:00-24:00'].count += 1;
        timeSlots['00:00-06:00'].total += shift.amount || 0;
        timeSlots['00:00-06:00'].count += 1;
      }
    });

    return Object.entries(timeSlots).map(([slot, data]) => ({
      slot,
      average: data.count > 0 ? Math.round(data.total / data.count) : 0
    }));
  }, [analyticsShifts]);

  // Статистика по дням недели с трендами
  const weekdayTrends = useMemo(() => {
    const weekdayData = getWeekdayStats();
    const maxEarnings = Math.max(...weekdayData);
    const minEarnings = Math.min(...weekdayData.filter(val => val > 0));
    
    return {
      data: weekdayData,
      bestDay: WEEKDAY_LABELS[weekdayData.indexOf(maxEarnings)],
      worstDay: WEEKDAY_LABELS[weekdayData.indexOf(minEarnings)],
      bestEarnings: maxEarnings,
      worstEarnings: minEarnings
    };
  }, [getWeekdayStats]);

  // Сезонность и тренды
  const seasonalityAnalysis = useMemo(() => {
    const monthlyData = getMonthlyStats();
    const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    
    return {
      labels: months,
      data: monthlyData.data || [],
      peakMonth: months[monthlyData.data?.indexOf(Math.max(...(monthlyData.data || []))) || 0],
      lowMonth: months[monthlyData.data?.indexOf(Math.min(...(monthlyData.data || []))) || 0]
    };
  }, [getMonthlyStats]);

  const getChartOptions = (title) => ({
    responsive: true,
    plugins: {
      legend: { 
        position: 'top',
        labels: {
          color: darkMode ? '#ffffff' : '#374151',
          font: { size: 12, weight: '600' }
        }
      },
      title: { 
        display: true, 
        text: title,
        color: darkMode ? '#ffffff' : '#374151',
        font: { size: 16, weight: 'bold' }
      }
    },
    animation: { duration: 1000, easing: 'easeInOutQuart' },
    scales: {
      x: {
        ticks: { color: darkMode ? '#9ca3af' : '#6b7280' },
        grid: { color: darkMode ? '#374151' : '#e5e7eb' }
      },
      y: {
        ticks: { color: darkMode ? '#9ca3af' : '#6b7280' },
        grid: { color: darkMode ? '#374151' : '#e5e7eb' }
      }
    }
  });

  const stats = getStats(selectedPeriod);

  const handlePeriodChange = (periodId) => {
    setSelectedPeriod(periodId);
    hapticButton();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    hapticButton();
  };

  return (
    <section className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gradient-primary">Умная аналитика</h2>
        <div className="flex space-x-2">
          {['overview', 'forecast', 'efficiency', 'trends'].map(tab => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-3 py-1 text-xs rounded-modern font-medium transition-all ${
                activeTab === tab
                  ? 'bg-purple-600 text-white shadow-modern'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {tab === 'overview' && 'Обзор'}
              {tab === 'forecast' && 'Прогноз'}
              {tab === 'efficiency' && 'Эффективность'}
              {tab === 'trends' && 'Тренды'}
            </button>
          ))}
        </div>
      </div>

      {/* Периоды */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {PERIODS.map(period => (
          <button
            key={period.id}
            onClick={() => handlePeriodChange(period.id)}
            {...hapticButton()}
            className={`micro-button px-4 py-3 rounded-modern font-semibold transition-all duration-200 ${
              selectedPeriod === period.id 
                ? (darkMode ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-modern-lg' : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-modern-lg') 
                : (darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white shadow-modern' : 'bg-white text-gray-700 hover:bg-gray-50 shadow-modern border border-gray-200')
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* Обзор */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Основные метрики */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-4 rounded-modern shadow-modern ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Общий заработок</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalEarnings?.toLocaleString()} ₽</p>
                </div>
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-modern shadow-modern ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Смены</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalShifts}</p>
                </div>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-modern shadow-modern ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Средний доход</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.averageEarnings?.toLocaleString()} ₽</p>
                </div>
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-modern shadow-modern ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Изменение</p>
                  <p className={`text-2xl font-bold ${periodComparison.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {periodComparison.change >= 0 ? '+' : ''}{periodComparison.change}%
                  </p>
                </div>
                <div className={`p-2 rounded-full ${periodComparison.change >= 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                  <svg className={`w-6 h-6 ${periodComparison.change >= 0 ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={periodComparison.change >= 0 ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Графики */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`chart-animate ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900 border border-gray-200'} p-6 rounded-modern shadow-modern-lg`}>
              <Line
                options={getChartOptions('Динамика заработка')}
                data={{
                  labels: getWeeklyStats().labels,
                  datasets: [{
                    label: 'Заработок (₽)',
                    data: getWeeklyStats().data,
                    borderColor: 'rgb(139, 92, 246)',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: 'rgb(139, 92, 246)',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                  }],
                }}
              />
            </div>
            <div className={`chart-animate ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900 border border-gray-200'} p-6 rounded-modern shadow-modern-lg`}>
              <Bar
                options={getChartOptions('Доход по дням недели')}
                data={{
                  labels: WEEKDAY_LABELS,
                  datasets: [{
                    label: 'Средний доход (₽)',
                    data: weekdayTrends.data,
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false,
                  }],
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Прогноз */}
      {activeTab === 'forecast' && (
        <div className="space-y-6">
          {earningsForecast ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-6 rounded-modern shadow-modern-lg ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
                  <h3 className="text-lg font-semibold mb-4">Прогноз на следующую неделю</h3>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600 mb-2">
                      {earningsForecast.nextWeek.toLocaleString()} ₽
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Тренд: {earningsForecast.trend === 'up' ? '📈 Растет' : earningsForecast.trend === 'down' ? '📉 Падает' : '➡️ Стабилен'}
                    </p>
                  </div>
                </div>
                <div className={`p-6 rounded-modern shadow-modern-lg ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
                  <h3 className="text-lg font-semibold mb-4">Прогноз на следующий месяц</h3>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600 mb-2">
                      {earningsForecast.nextMonth.toLocaleString()} ₽
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      На основе исторических данных
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className={`p-8 text-center rounded-modern ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
              <p className="text-gray-500 dark:text-gray-400">
                Для прогнозирования необходимо минимум 3 смены
              </p>
            </div>
          )}
        </div>
      )}

      {/* Эффективность */}
      {activeTab === 'efficiency' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`chart-animate ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900 border border-gray-200'} p-6 rounded-modern shadow-modern-lg`}>
              <Radar
                options={getChartOptions('Эффективность по времени суток')}
                data={{
                  labels: timeEfficiency.map(item => item.slot),
                  datasets: [{
                    label: 'Средний доход (₽)',
                    data: timeEfficiency.map(item => item.average),
                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                    borderColor: 'rgb(34, 197, 94)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgb(34, 197, 94)',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                  }],
                }}
              />
            </div>
            <div className={`chart-animate ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900 border border-gray-200'} p-6 rounded-modern shadow-modern-lg`}>
              <Doughnut
                options={getChartOptions('Распределение по дням недели')}
                data={{
                  labels: WEEKDAY_LABELS,
                  datasets: [{
                    data: weekdayTrends.data,
                    backgroundColor: [
                      'rgba(255, 99, 132, 0.8)',
                      'rgba(54, 162, 235, 0.8)',
                      'rgba(255, 206, 86, 0.8)',
                      'rgba(75, 192, 192, 0.8)',
                      'rgba(153, 102, 255, 0.8)',
                      'rgba(255, 159, 64, 0.8)',
                      'rgba(199, 199, 199, 0.8)'
                    ],
                    borderWidth: 2,
                    borderColor: darkMode ? '#374151' : '#ffffff'
                  }],
                }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-modern shadow-modern ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
              <h4 className="font-semibold mb-2">Лучший день</h4>
              <p className="text-lg font-bold text-green-600">{weekdayTrends.bestDay}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {weekdayTrends.bestEarnings.toLocaleString()} ₽ в среднем
              </p>
            </div>
            <div className={`p-4 rounded-modern shadow-modern ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
              <h4 className="font-semibold mb-2">Худший день</h4>
              <p className="text-lg font-bold text-red-600">{weekdayTrends.worstDay}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {weekdayTrends.worstEarnings.toLocaleString()} ₽ в среднем
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Тренды */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          <div className={`chart-animate ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900 border border-gray-200'} p-6 rounded-modern shadow-modern-lg`}>
            <Bar
              options={getChartOptions('Сезонность по месяцам')}
              data={{
                labels: seasonalityAnalysis.labels,
                datasets: [{
                  label: 'Доход по месяцам (₽)',
                  data: seasonalityAnalysis.data,
                  backgroundColor: 'rgba(139, 92, 246, 0.8)',
                  borderColor: 'rgb(139, 92, 246)',
                  borderWidth: 2,
                  borderRadius: 8,
                  borderSkipped: false,
                }],
              }}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-modern shadow-modern ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
              <h4 className="font-semibold mb-2">Пиковый месяц</h4>
              <p className="text-lg font-bold text-green-600">{seasonalityAnalysis.peakMonth}</p>
            </div>
            <div className={`p-4 rounded-modern shadow-modern ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
              <h4 className="font-semibold mb-2">Самый низкий месяц</h4>
              <p className="text-lg font-bold text-red-600">{seasonalityAnalysis.lowMonth}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
} 