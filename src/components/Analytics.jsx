import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { useAnalytics } from '../hooks/useAnalytics';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { PERIODS, WEEKDAY_LABELS } from '../utils/constants';

// Регистрация компонентов Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// Карточка для метрик
const MetricCard = ({ title, value, unit }) => (
  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md transition-colors duration-300">
    <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
    <p className="text-2xl font-bold text-gray-900 dark:text-white">
      {typeof value === 'number' ? value.toLocaleString('ru-RU', { maximumFractionDigits: 0 }) : value}
      {unit && <span className="text-base font-normal ml-1">{unit}</span>}
    </p>
  </div>
);

// Основной компонент аналитики
export function Analytics({ analyticsShifts, goals, darkMode, selectedPeriod, setSelectedPeriod }) {
  const { keyMetrics, forecasts, monthlyTrends, getStats, getWeekdayStats, getWeeklyStats, getPlanFactStats } = useAnalytics(analyticsShifts, goals);

  if (!analyticsShifts || analyticsShifts.length === 0) {
    return <div className="text-center py-10"><p className="text-gray-500">Нет данных для анализа. Добавьте хотя бы одну смену.</p></div>;
  }
  
  const stats = getStats(selectedPeriod);

  const getChartOptions = (text) => ({
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: darkMode ? '#fff' : '#000' } },
      title: { display: true, text, color: darkMode ? '#fff' : '#000' }
    },
    scales: {
      x: { ticks: { color: darkMode ? '#fff' : '#000' } },
      y: { ticks: { color: darkMode ? '#fff' : '#000' } }
    }
  });

  const chartData = {
    labels: stats.filtered.map(s => new Date(s.date).toLocaleDateString()),
    earnings: stats.filtered.map(s => s.amount),
    picks: stats.filtered.map(s => s.picks),
  };

  return (
    <div className="space-y-8 p-4">
      {/* Новые метрики и прогнозы */}
      <h2 className="text-xl font-semibold text-center text-gray-800 dark:text-white">Общая статистика</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Всего заработано" value={keyMetrics.totalEarnings} unit="₽" />
        <MetricCard title="Среднее за смену" value={keyMetrics.avgPerShift} unit="₽" />
        <MetricCard title="Отработано дней" value={keyMetrics.totalDays} unit="дн" />
        <MetricCard title="Самый прибыльный день" value={keyMetrics.bestDay} />
      </div>
      
      {forecasts.week && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md text-center">
            <h3 className="font-semibold text-sky-500 dark:text-sky-400">Прогноз на неделю</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">~ {forecasts.week.toLocaleString()} ₽</p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md text-center">
            <h3 className="font-semibold text-sky-500 dark:text-sky-400">Прогноз на месяц</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">~ {forecasts.month.toLocaleString()} ₽</p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md text-center">
            <h3 className="font-semibold text-sky-500 dark:text-sky-400">Прогноз на год</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">~ {forecasts.year.toLocaleString()} ₽</p>
          </div>
        </div>
      )}

      <hr className="border-gray-200 dark:border-gray-700"/>

      <h2 className="text-xl font-semibold text-center text-gray-800 dark:text-white">Анализ по периодам</h2>
      <div className="flex justify-center space-x-2">
        {PERIODS.map(p => (
          <button key={p.id} onClick={() => setSelectedPeriod(p.id)} className={`px-4 py-2 rounded-lg font-semibold transition-all ${selectedPeriod === p.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 dark:bg-gray-700'}`}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Заработано за период" value={stats.totalEarnings} unit="₽" />
        <MetricCard title="Пиков за период" value={stats.totalPicks} />
        <MetricCard title="Средний заработок" value={stats.averageEarnings} unit="₽" />
        <MetricCard title="Среднее кол-во пиков" value={stats.averagePicks} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md"><Line options={getChartOptions('Заработок')} data={{ labels: chartData.labels, datasets: [{ label: 'Заработок', data: chartData.earnings, borderColor: '#8b5cf6', fill: true }] }} /></div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md"><Bar options={getChartOptions('Количество пиков')} data={{ labels: chartData.labels, datasets: [{ label: 'Пики', data: chartData.picks, backgroundColor: '#3b82f6' }] }} /></div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md"><Bar options={getChartOptions('Средний доход по дням недели')} data={{ labels: WEEKDAY_LABELS, datasets: [{ label: 'Средний доход (₽)', data: getWeekdayStats(), backgroundColor: '#8b5cf6' }] }} /></div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md"><Line options={getChartOptions('Динамика по неделям (₽)')} data={{ labels: getWeeklyStats().labels, datasets: [{ label: 'Доход по неделям', data: getWeeklyStats().data, borderColor: '#22c55e', fill: true }] }} /></div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md"><Line options={getChartOptions('Динамика по месяцам (₽)')} data={{ labels: monthlyTrends.labels, datasets: [{ label: 'Доход по месяцам', data: monthlyTrends.data, borderColor: '#3b82f6', fill: true }] }} /></div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md"><Line options={getChartOptions('План / Факт по датам')} data={{ labels: getPlanFactStats().labels, datasets: [{ label: 'План', data: getPlanFactStats().plan, borderColor: '#a855f7', borderDash: [5, 5], fill: false }, { label: 'Факт', data: getPlanFactStats().fact, borderColor: '#22c55e', fill: true }] }} /></div>
        </div>
      </div>
  );
} 