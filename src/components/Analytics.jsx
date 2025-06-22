import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { useAnalytics } from '../hooks/useAnalytics';
import { useHaptic } from '../hooks/useHaptic';
import { PERIODS, WEEKDAY_LABELS } from '../utils/constants';

export function Analytics({ 
  darkMode, 
  analyticsShifts, 
  goals, 
  calendarData, 
  selectedPeriod, 
  setSelectedPeriod 
}) {
  const { 
    getStats, 
    getWeekdayStats, 
    getWeeklyStats, 
    getMonthlyStats, 
    getPlanFactStats 
  } = useAnalytics(analyticsShifts, goals, calendarData);

  const { hapticButton } = useHaptic();

  const getChartOptions = (title) => ({
    responsive: true,
    plugins: {
      legend: { 
        position: 'top',
        labels: {
          color: darkMode ? '#ffffff' : '#374151',
          font: {
            size: 12,
            weight: '600'
          }
        }
      },
      title: { 
        display: true, 
        text: title,
        color: darkMode ? '#ffffff' : '#374151',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    },
    scales: {
      x: {
        ticks: {
          color: darkMode ? '#9ca3af' : '#6b7280'
        },
        grid: {
          color: darkMode ? '#374151' : '#e5e7eb'
        }
      },
      y: {
        ticks: {
          color: darkMode ? '#9ca3af' : '#6b7280'
        },
        grid: {
          color: darkMode ? '#374151' : '#e5e7eb'
        }
      }
    }
  });

  const chartData = () => {
    const { filtered } = getStats(selectedPeriod);
    if (!filtered.length) {
      return { labels: [], earnings: [], picks: [] };
    }

    const groupedByDate = filtered.reduce((acc, shift) => {
      if (!acc[shift.date]) {
        acc[shift.date] = { earnings: 0, picks: 0 };
      }
      acc[shift.date].earnings += shift.amount || 0;
      acc[shift.date].picks += shift.picks || 0;
      return acc;
    }, {});

    const sortedDates = Object.keys(groupedByDate).sort();
    
    return {
      labels: sortedDates.map(date => new Date(date).toLocaleDateString()),
      earnings: sortedDates.map(date => groupedByDate[date].earnings),
      picks: sortedDates.map(date => groupedByDate[date].picks)
    };
  };

  const stats = getStats(selectedPeriod);

  const handlePeriodChange = (periodId) => {
    setSelectedPeriod(periodId);
  };

  return (
    <section className="space-y-6 animate-fadeIn">
      <h2 className="text-xl font-semibold mb-4 text-gradient-primary">Аналитика</h2>
      
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`chart-animate ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900 border border-gray-200'} p-6 rounded-modern shadow-modern-lg`}>
          <Line
            options={getChartOptions('Заработок')}
            data={{
              labels: chartData().labels,
              datasets: [{
                label: 'Заработок (₽)',
                data: chartData().earnings,
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
            options={getChartOptions('Количество пиков')}
            data={{
              labels: chartData().labels,
              datasets: [{
                label: 'Пики',
                data: chartData().picks,
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`chart-animate ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900 border border-gray-200'} p-6 rounded-modern shadow-modern-lg`}>
          <Bar
            options={getChartOptions('Средний доход по дням недели')}
            data={{
              labels: WEEKDAY_LABELS,
              datasets: [{
                label: 'Средний доход (₽)',
                data: getWeekdayStats(),
                backgroundColor: 'rgba(139, 92, 246, 0.8)',
                borderColor: 'rgb(139, 92, 246)',
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
              }],
            }}
          />
        </div>
        <div className={`chart-animate ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900 border border-gray-200'} p-6 rounded-modern shadow-modern-lg`}>
          <Line
            options={getChartOptions('Динамика по неделям (₽)')}
            data={{
              labels: getWeeklyStats().labels,
              datasets: [{
                label: 'Доход по неделям',
                data: getWeeklyStats().data,
                borderColor: 'rgb(34,197,94)',
                backgroundColor: 'rgba(34,197,94, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: 'rgb(34,197,94)',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
              }],
            }}
          />
        </div>
        <div className={`chart-animate ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900 border border-gray-200'} p-6 rounded-modern shadow-modern-lg`}>
          <Line
            options={getChartOptions('Динамика по месяцам (₽)')}
            data={{
              labels: getMonthlyStats().labels,
              datasets: [{
                label: 'Доход по месяцам',
                data: getMonthlyStats().data,
                borderColor: 'rgb(59,130,246)',
                backgroundColor: 'rgba(59,130,246, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: 'rgb(59,130,246)',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
              }],
            }}
          />
        </div>
        <div className={`chart-animate ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900 border border-gray-200'} p-6 rounded-modern shadow-modern-lg`}>
          <Line
            options={getChartOptions('План / Факт по датам')}
            data={{
              labels: getPlanFactStats().labels,
              datasets: [
                {
                  label: 'План',
                  data: getPlanFactStats().plan,
                  borderColor: 'rgb(168,85,247)',
                  backgroundColor: 'rgba(168,85,247, 0.1)',
                  borderWidth: 3,
                  borderDash: [8, 4],
                  tension: 0.4,
                  fill: false,
                  pointBackgroundColor: 'rgb(168,85,247)',
                  pointBorderColor: '#ffffff',
                  pointBorderWidth: 2,
                  pointRadius: 6,
                  pointHoverRadius: 8
                },
                {
                  label: 'Факт',
                  data: getPlanFactStats().fact,
                  borderColor: 'rgb(34,197,94)',
                  backgroundColor: 'rgba(34,197,94, 0.1)',
                  borderWidth: 3,
                  tension: 0.4,
                  fill: true,
                  pointBackgroundColor: 'rgb(34,197,94)',
                  pointBorderColor: '#ffffff',
                  pointBorderWidth: 2,
                  pointRadius: 6,
                  pointHoverRadius: 8
                }
              ],
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className={`card-enter ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900 border border-gray-200'} p-6 rounded-modern shadow-modern-lg hover-lift transition-all duration-300`}>
          <h3 className="text-sm text-gray-400 mb-2">Всего заработано</h3>
          <p className="text-3xl font-bold text-gradient-success">{stats.totalEarnings.toFixed(2)} ₽</p>
        </div>
        <div className={`card-enter ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900 border border-gray-200'} p-6 rounded-modern shadow-modern-lg hover-lift transition-all duration-300`}>
          <h3 className="text-sm text-gray-400 mb-2">Всего пиков</h3>
          <p className="text-3xl font-bold text-gradient-primary">{stats.totalPicks}</p>
        </div>
        <div className={`card-enter ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900 border border-gray-200'} p-6 rounded-modern shadow-modern-lg hover-lift transition-all duration-300`}>
          <h3 className="text-sm text-gray-400 mb-2">Средний заработок в день</h3>
          <p className="text-3xl font-bold text-gradient-success">{stats.averageEarnings.toFixed(2)} ₽</p>
        </div>
        <div className={`card-enter ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900 border border-gray-200'} p-6 rounded-modern shadow-modern-lg hover-lift transition-all duration-300`}>
          <h3 className="text-sm text-gray-400 mb-2">Среднее количество пиков</h3>
          <p className="text-3xl font-bold text-gradient-primary">{stats.averagePicks.toFixed(2)}</p>
        </div>
      </div>
    </section>
  );
} 