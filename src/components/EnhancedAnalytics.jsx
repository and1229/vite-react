import React, { useState, useMemo } from 'react';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import { useAnalytics } from '../hooks/useAnalytics';
import { useHaptic } from '../hooks/useHaptic';
import { PERIODS, WEEKDAY_LABELS } from '../utils/constants';

// Карточка для метрик с улучшенным дизайном
const MetricCard = ({ title, value, unit, trend, subtitle, icon, color = 'purple' }) => {
  const colorClasses = {
    purple: 'from-purple-500 to-purple-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
    indigo: 'from-indigo-500 to-indigo-600'
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl hover:scale-105">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white text-lg`}>
          {icon}
        </div>
        {trend && (
          <div className={`text-sm font-medium ${trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-gray-500'}`}>
            {trend > 0 ? '↗' : trend < 0 ? '↘' : '→'} {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">
        {typeof value === 'number' ? value.toLocaleString('ru-RU', { maximumFractionDigits: 0 }) : value}
        {unit && <span className="text-base font-normal ml-1">{unit}</span>}
      </p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
};

// Компонент настроек аналитики
const AnalyticsSettings = ({ settings, onChange, darkMode }) => {
  return (
    <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border border-gray-200 dark:border-gray-700`}>
      <h3 className="text-lg font-semibold mb-4 text-gradient-primary">⚙️ Настройки аналитики</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Месячная цель (₽)</label>
          <input
            type="number"
            value={settings.monthlyTarget}
            onChange={(e) => onChange({ ...settings, monthlyTarget: Number(e.target.value) })}
            className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'} focus:ring-2 focus:ring-purple-500`}
            placeholder="50000"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Дополнительные выходные в месяц</label>
          <input
            type="number"
            min="0"
            max="10"
            value={settings.weekendsPerMonth}
            onChange={(e) => onChange({ ...settings, weekendsPerMonth: Number(e.target.value) })}
            className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'} focus:ring-2 focus:ring-purple-500`}
            placeholder="2"
          />
          <p className="text-xs text-gray-500 mt-1">Кроме субботы и воскресенья</p>
        </div>
      </div>
    </div>
  );
};

// Компонент прогнозов
const ForecastPanel = ({ forecasts, workingDays, darkMode }) => {
  if (!forecasts.week.gross) return null;

  return (
    <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border border-gray-200 dark:border-gray-700`}>
      <h3 className="text-lg font-semibold mb-4 text-gradient-primary">📈 Прогнозы доходов</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-semibold text-blue-600 dark:text-blue-400">Неделя</h4>
          <p className="text-lg font-bold">{forecasts.week.net.toLocaleString()} ₽</p>
          <p className="text-xs text-gray-500">5 рабочих дней</p>
        </div>
        
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <h4 className="font-semibold text-green-600 dark:text-green-400">Месяц</h4>
          <p className="text-lg font-bold">{forecasts.month.net.toLocaleString()} ₽</p>
          <p className="text-xs text-gray-500">{workingDays.month} рабочих дней</p>
        </div>
        
        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <h4 className="font-semibold text-purple-600 dark:text-purple-400">Год</h4>
          <p className="text-lg font-bold">{forecasts.year.net.toLocaleString()} ₽</p>
          <p className="text-xs text-gray-500">{workingDays.year} рабочих дней</p>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          💡 Прогнозы рассчитаны на основе средней производительности за последние 30 дней
        </p>
      </div>
    </div>
  );
};

// Компонент целевых показателей
const TargetProgress = ({ targetAnalysis, darkMode }) => {
  if (!targetAnalysis) return null;

  const { progressPercent, isOnTrack, neededPerDay, remainingDays } = targetAnalysis;

  return (
    <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border border-gray-200 dark:border-gray-700`}>
      <h3 className="text-lg font-semibold mb-4 text-gradient-primary">🎯 Прогресс к цели</h3>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Прогресс к месячной цели</span>
          <span className={`text-sm font-bold ${isOnTrack ? 'text-green-500' : 'text-orange-500'}`}>
            {progressPercent.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${isOnTrack ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-orange-400 to-orange-600'}`}
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          ></div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {remainingDays}
          </p>
          <p className="text-sm text-gray-500">дней осталось</p>
        </div>
        
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {neededPerDay.toLocaleString()} ₽
          </p>
          <p className="text-sm text-gray-500">нужно в день</p>
        </div>
      </div>
      
      <div className={`mt-4 p-3 rounded-lg ${isOnTrack ? 'bg-green-50 dark:bg-green-900/20' : 'bg-orange-50 dark:bg-orange-900/20'}`}>
        <p className={`text-sm ${isOnTrack ? 'text-green-700 dark:text-green-300' : 'text-orange-700 dark:text-orange-300'}`}>
          {isOnTrack ? 
            '✅ Вы идете к цели по плану!' : 
            `⚠️ Нужно увеличить ежедневный доход на ${(neededPerDay - (targetAnalysis.currentEarnings / targetAnalysis.daysWorked)).toLocaleString()} ₽`
          }
        </p>
      </div>
    </div>
  );
};

// Основной компонент улучшенной аналитики
export function EnhancedAnalytics({ analyticsShifts, goals, darkMode, selectedPeriod, setSelectedPeriod }) {
  const { hapticButton } = useHaptic();
  
  // Состояние настроек
  const [settings, setSettings] = useState({
    monthlyTarget: 50000,
    weekendsPerMonth: 2
  });

  const { 
    keyMetrics, 
    forecasts, 
    monthlyTrends, 
    getStats, 
    getWeekdayStats, 
    getWeeklyStats, 
    getPlanFactStats,
    getHourlyEfficiency,
    getTrendAnalysis,
    getTargetAnalysis
  } = useAnalytics(analyticsShifts, goals);

  // Получаем все аналитические данные
  const stats = getStats(selectedPeriod);
  const trendAnalysis = getTrendAnalysis();
  const targetAnalysis = getTargetAnalysis(settings.monthlyTarget, settings.weekendsPerMonth);
  const hourlyEfficiency = getHourlyEfficiency();
  const forecastData = forecasts(settings.weekendsPerMonth);

  // Проверяем наличие данных
  if (!analyticsShifts || analyticsShifts.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold mb-2">Нет данных для анализа</h3>
        <p className="text-gray-500">Добавьте хотя бы одну смену, чтобы увидеть аналитику</p>
      </div>
    );
  }

  const getChartOptions = (text) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top', 
        labels: { 
          color: darkMode ? '#fff' : '#000',
          font: { size: 12 }
        } 
      },
      title: { 
        display: true, 
        text, 
        color: darkMode ? '#fff' : '#000',
        font: { size: 14, weight: 'bold' }
      }
    },
    scales: {
      x: { 
        ticks: { 
          color: darkMode ? '#fff' : '#000',
          font: { size: 11 }
        },
        grid: {
          color: darkMode ? '#374151' : '#e5e7eb'
        }
      },
      y: { 
        ticks: { 
          color: darkMode ? '#fff' : '#000',
          font: { size: 11 }
        },
        grid: {
          color: darkMode ? '#374151' : '#e5e7eb'
        }
      }
    }
  });

  const chartData = {
    labels: stats.filtered.map(s => new Date(s.date).toLocaleDateString()),
    earnings: stats.filtered.map(s => s.amount),
    picks: stats.filtered.map(s => s.picks),
  };

  return (
    <div className="space-y-6 p-4">
      {/* Настройки аналитики */}
      <AnalyticsSettings 
        settings={settings} 
        onChange={setSettings} 
        darkMode={darkMode} 
      />

      {/* Основные метрики */}
      <div>
        <h2 className="text-xl font-semibold text-center mb-6">📊 Общая статистика</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            title="Всего заработано" 
            value={keyMetrics.totalEarnings} 
            unit="₽" 
            icon="💰"
            color="green"
          />
          <MetricCard 
            title="Среднее за смену" 
            value={keyMetrics.avgPerShift} 
            unit="₽"
            trend={trendAnalysis?.trendPercent}
            icon="📈"
            color="blue"
          />
          <MetricCard 
            title="Эффективность" 
            value={keyMetrics.efficiency.toFixed(2)} 
            unit="₽/пик"
            subtitle="Рублей за пик"
            icon="⚡"
            color="orange"
          />
          <MetricCard 
            title="Стабильность" 
            value={keyMetrics.consistency.toFixed(1)} 
            unit="%"
            subtitle="Постоянство доходов"
            icon="🎯"
            color="purple"
          />
          <MetricCard 
            title="Отработано дней" 
            value={keyMetrics.totalDays} 
            unit="дн"
            icon="📅"
            color="indigo"
          />
          <MetricCard 
            title="Рост показателей" 
            value={keyMetrics.growthRate.toFixed(1)} 
            unit="%"
            subtitle="За период наблюдения"
            icon="🚀"
            color={keyMetrics.growthRate >= 0 ? 'green' : 'red'}
          />
          <MetricCard 
            title="Лучший день" 
            value={keyMetrics.bestDay}
            subtitle="Самый прибыльный"
            icon="🏆"
            color="purple"
          />
          <MetricCard 
            title="Доход в час" 
            value={keyMetrics.avgPerHour.toFixed(0)} 
            unit="₽"
            subtitle="Средняя почасовая ставка"
            icon="⏰"
            color="blue"
          />
        </div>
      </div>

      {/* Прогресс к цели */}
      {targetAnalysis && (
        <TargetProgress targetAnalysis={targetAnalysis} darkMode={darkMode} />
      )}

      {/* Прогнозы */}
      <ForecastPanel 
        forecasts={forecastData} 
        workingDays={forecastData.workingDays} 
        darkMode={darkMode} 
      />

      {/* Анализ трендов */}
      {trendAnalysis && (
        <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border border-gray-200 dark:border-gray-700`}>
          <h3 className="text-lg font-semibold mb-3 text-gradient-primary">📈 Анализ трендов</h3>
          <div className={`p-4 rounded-lg ${trendAnalysis.trend === 'up' ? 'bg-green-50 dark:bg-green-900/20' : trendAnalysis.trend === 'down' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">
                {trendAnalysis.trend === 'up' ? '📈' : trendAnalysis.trend === 'down' ? '📉' : '📊'}
              </span>
              <div>
                <p className="font-semibold">
                  {trendAnalysis.trend === 'up' ? 'Рост' : trendAnalysis.trend === 'down' ? 'Снижение' : 'Стабильность'} 
                  {' '}на {trendAnalysis.trendPercent.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {trendAnalysis.recommendation}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Эффективность по типам смен */}
      {hourlyEfficiency.length > 0 && (
        <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border border-gray-200 dark:border-gray-700`}>
          <h3 className="text-lg font-semibold mb-4 text-gradient-primary">🌅 Эффективность по типам смен</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {hourlyEfficiency.map((item, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h4 className="font-semibold text-lg">{item.type}</h4>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {item.avgEarnings.toLocaleString()} ₽
                </p>
                <p className="text-sm text-gray-500">{item.count} смен</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Селектор периода */}
      <div>
        <h2 className="text-xl font-semibold text-center mb-4">📈 Анализ по периодам</h2>
        <div className="flex justify-center space-x-2 mb-6">
          {PERIODS.map(p => (
            <button 
              key={p.id} 
              onClick={() => {
                setSelectedPeriod(p.id);
                hapticButton();
              }} 
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                selectedPeriod === p.id 
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg transform scale-105' 
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Метрики по периоду */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <MetricCard title="Заработано за период" value={stats.totalEarnings} unit="₽" icon="💵" color="green" />
          <MetricCard title="Пиков за период" value={stats.totalPicks} icon="📦" color="blue" />
          <MetricCard title="Средний заработок" value={stats.averageEarnings} unit="₽" icon="📊" color="purple" />
          <MetricCard title="Среднее кол-во пиков" value={stats.averagePicks} icon="🎯" color="orange" />
        </div>
      </div>

      {/* Графики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* График заработка */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div style={{ height: '300px' }}>
            <Line 
              options={getChartOptions('💰 Динамика заработка')} 
              data={{ 
                labels: chartData.labels, 
                datasets: [{ 
                  label: 'Заработок (₽)', 
                  data: chartData.earnings, 
                  borderColor: '#8b5cf6',
                  backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  fill: true,
                  tension: 0.4
                }] 
              }} 
            />
          </div>
        </div>

        {/* График пиков */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div style={{ height: '300px' }}>
            <Bar 
              options={getChartOptions('📦 Количество пиков')} 
              data={{ 
                labels: chartData.labels, 
                datasets: [{ 
                  label: 'Пики', 
                  data: chartData.picks, 
                  backgroundColor: 'rgba(59, 130, 246, 0.8)',
                  borderColor: '#3b82f6',
                  borderWidth: 1
                }] 
              }} 
            />
          </div>
        </div>

        {/* График по дням недели */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div style={{ height: '300px' }}>
            <Bar 
              options={getChartOptions('📅 Средний доход по дням недели')} 
              data={{ 
                labels: WEEKDAY_LABELS, 
                datasets: [{ 
                  label: 'Средний доход (₽)', 
                  data: getWeekdayStats(), 
                  backgroundColor: 'rgba(139, 92, 246, 0.8)',
                  borderColor: '#8b5cf6',
                  borderWidth: 1
                }] 
              }} 
            />
          </div>
        </div>

        {/* График недельной динамики */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div style={{ height: '300px' }}>
            <Line 
              options={getChartOptions('📈 Динамика по неделям')} 
              data={{ 
                labels: getWeeklyStats().labels, 
                datasets: [{ 
                  label: 'Доход по неделям (₽)', 
                  data: getWeeklyStats().data, 
                  borderColor: '#22c55e',
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  fill: true,
                  tension: 0.4
                }] 
              }} 
            />
          </div>
        </div>

        {/* График месячных трендов */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div style={{ height: '300px' }}>
            <Line 
              options={getChartOptions('📊 Динамика по месяцам')} 
              data={{ 
                labels: monthlyTrends.labels, 
                datasets: [{ 
                  label: 'Доход по месяцам (₽)', 
                  data: monthlyTrends.data, 
                  borderColor: '#3b82f6',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  fill: true,
                  tension: 0.4
                }] 
              }} 
            />
          </div>
        </div>

        {/* План/Факт */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div style={{ height: '300px' }}>
            <Line 
              options={getChartOptions('🎯 План vs Факт')} 
              data={{ 
                labels: getPlanFactStats().labels, 
                datasets: [
                  { 
                    label: 'План (₽)', 
                    data: getPlanFactStats().plan, 
                    borderColor: '#a855f7',
                    backgroundColor: 'rgba(168, 85, 247, 0.1)',
                    borderDash: [5, 5], 
                    fill: false,
                    tension: 0.4
                  }, 
                  { 
                    label: 'Факт (₽)', 
                    data: getPlanFactStats().fact, 
                    borderColor: '#22c55e',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    fill: true,
                    tension: 0.4
                  }
                ] 
              }} 
            />
          </div>
        </div>
      </div>

      {/* Советы и рекомендации */}
      <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border border-gray-200 dark:border-gray-700`}>
        <h3 className="text-lg font-semibold mb-4 text-gradient-primary">💡 Рекомендации для улучшения</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">🚀 Для роста доходов</h4>
            <ul className="text-sm space-y-1">
              <li>• Анализируйте самые прибыльные дни</li>
              <li>• Оптимизируйте частоту перерывов</li>
              <li>• Отслеживайте эффективность по типам смен</li>
            </ul>
          </div>
          
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">⚡ Для эффективности</h4>
            <ul className="text-sm space-y-1">
              <li>• Поддерживайте стабильный график</li>
              <li>• Используйте настройки выходных</li>
              <li>• Ставьте реалистичные цели</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 