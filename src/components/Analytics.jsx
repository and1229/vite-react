import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { useAnalytics } from '../hooks/useAnalytics';
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

  const getChartOptions = (title) => ({
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: title }
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

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Аналитика</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {PERIODS.map(period => (
          <button
            key={period.id}
            onClick={() => setSelectedPeriod(period.id)}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              selectedPeriod === period.id 
                ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-50 border-b-2 border-blue-500 text-blue-700') 
                : (darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100')
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900 border border-gray-200 shadow'} p-4 rounded-lg`}>
          <Line
            options={getChartOptions('Заработок')}
            data={{
              labels: chartData().labels,
              datasets: [{
                label: 'Заработок (₽)',
                data: chartData().earnings,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
              }],
            }}
          />
        </div>
        <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900 border border-gray-200 shadow'} p-4 rounded-lg`}>
          <Bar
            options={getChartOptions('Количество пиков')}
            data={{
              labels: chartData().labels,
              datasets: [{
                label: 'Пики',
                data: chartData().picks,
                backgroundColor: 'rgb(54, 162, 235)',
              }],
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900 border border-gray-200 shadow'} p-4 rounded-lg`}>
          <Bar
            options={getChartOptions('Средний доход по дням недели')}
            data={{
              labels: WEEKDAY_LABELS,
              datasets: [{
                label: 'Средний доход (₽)',
                data: getWeekdayStats(),
                backgroundColor: 'rgb(139, 92, 246)',
              }],
            }}
          />
        </div>
        <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900 border border-gray-200 shadow'} p-4 rounded-lg`}>
          <Line
            options={getChartOptions('Динамика по неделям (₽)')}
            data={{
              labels: getWeeklyStats().labels,
              datasets: [{
                label: 'Доход по неделям',
                data: getWeeklyStats().data,
                borderColor: 'rgb(34,197,94)',
                tension: 0.1,
              }],
            }}
          />
        </div>
        <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900 border border-gray-200 shadow'} p-4 rounded-lg`}>
          <Line
            options={getChartOptions('Динамика по месяцам (₽)')}
            data={{
              labels: getMonthlyStats().labels,
              datasets: [{
                label: 'Доход по месяцам',
                data: getMonthlyStats().data,
                borderColor: 'rgb(59,130,246)',
                tension: 0.1,
              }],
            }}
          />
        </div>
        <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900 border border-gray-200 shadow'} p-4 rounded-lg`}>
          <Line
            options={getChartOptions('План / Факт по датам')}
            data={{
              labels: getPlanFactStats().labels,
              datasets: [
                {
                  label: 'План',
                  data: getPlanFactStats().plan,
                  borderColor: 'rgb(168,85,247)',
                  borderDash: [5,5],
                  tension: 0.1,
                },
                {
                  label: 'Факт',
                  data: getPlanFactStats().fact,
                  borderColor: 'rgb(34,197,94)',
                  tension: 0.1,
                }
              ],
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900 border border-gray-200 shadow'} p-4 rounded-lg`}>
          <h3 className="text-sm text-gray-400">Всего заработано</h3>
          <p className="text-2xl font-semibold mt-1">{stats.totalEarnings.toFixed(2)} ₽</p>
        </div>
        <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900 border border-gray-200 shadow'} p-4 rounded-lg`}>
          <h3 className="text-sm text-gray-400">Всего пиков</h3>
          <p className="text-2xl font-semibold mt-1">{stats.totalPicks}</p>
        </div>
        <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900 border border-gray-200 shadow'} p-4 rounded-lg`}>
          <h3 className="text-sm text-gray-400">Средний заработок в день</h3>
          <p className="text-2xl font-semibold mt-1">{stats.averageEarnings.toFixed(2)} ₽</p>
        </div>
        <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900 border border-gray-200 shadow'} p-4 rounded-lg`}>
          <h3 className="text-sm text-gray-400">Среднее количество пиков</h3>
          <p className="text-2xl font-semibold mt-1">{stats.averagePicks.toFixed(2)}</p>
        </div>
      </div>
    </section>
  );
} 