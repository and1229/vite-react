import { useMemo } from 'react';

// Функции для работы с датами
const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

const getStartOfMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

const getStartOfYear = (date) => {
  return new Date(date.getFullYear(), 0, 1);
};

// Функция для расчета рабочих дней в периоде с учетом выходных
const getWorkingDaysInPeriod = (startDate, endDate, weekendsCount = 0) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let workingDays = 0;
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    // Считаем только будни (понедельник-пятница)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
  }
  
  // Вычитаем дополнительные выходные дни
  return Math.max(0, workingDays - weekendsCount);
};

export function useAnalytics(analyticsShifts, goals, calendarData) {
  const allShifts = useMemo(() => {
    const shifts = [
      ...Object.values(calendarData || {}),
      ...(goals || []).filter(goal => goal && goal.completed)
        .map(goal => ({
          date: goal.planned.date,
          earnings: Number(goal.actual.amount),
          picks: Number(goal.actual.picks),
          rate: goal.planned.rate,
          hours: Number(goal.actual.hours) || 8,
          type: goal.actual.type || 'day'
        }))
    ].filter(shift => shift && shift.date);

    // Убираем дубликаты по дате
    const uniqueShifts = Object.values(
      shifts.reduce((acc, shift) => {
        acc[shift.date] = shift;
        return acc;
      }, {})
    );

    return uniqueShifts.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [calendarData, goals]);

  const calculatePeriodStats = (shifts) => {
    if (!shifts || !Array.isArray(shifts) || shifts.length === 0) {
      return {
        picks: [],
        earnings: [],
        labels: [],
        totalPicks: 0,
        totalEarnings: 0,
        averagePicks: 0,
        averageEarnings: 0,
        shiftsCount: 0
      };
    }

    const stats = {
      picks: shifts.map(shift => Number(shift.picks) || 0),
      earnings: shifts.map(shift => Number(shift.earnings) || 0),
      labels: shifts.map(shift => shift.date),
      shiftsCount: shifts.length
    };

    stats.totalPicks = stats.picks.reduce((sum, picks) => sum + picks, 0);
    stats.totalEarnings = stats.earnings.reduce((sum, earnings) => sum + earnings, 0);
    stats.averagePicks = stats.totalPicks / stats.shiftsCount;
    stats.averageEarnings = stats.totalEarnings / stats.shiftsCount;

    return stats;
  };

  const getStats = (period) => {
    const now = new Date();
    let start;
    if (period === 'week') {
      start = getStartOfWeek(now);
    } else if (period === 'month') {
      start = getStartOfMonth(now);
    } else {
      start = getStartOfYear(now);
    }
    
    const startStr = start.toISOString().split('T')[0];
    const nowStr = now.toISOString().split('T')[0];
    
    const filtered = (analyticsShifts || []).filter(s => {
      if (!s || !s.date) return false;
      return s.date >= startStr && s.date <= nowStr;
    });

    const totalEarnings = filtered.reduce((sum, s) => sum + (s.amount || 0), 0);
    const totalPicks = filtered.reduce((sum, s) => sum + (s.picks || 0), 0);
    const uniqueDates = [...new Set(filtered.map(s => s.date))].length;
    
    return {
      totalEarnings,
      totalPicks,
      averageEarnings: uniqueDates ? totalEarnings / uniqueDates : 0,
      averagePicks: uniqueDates ? totalPicks / uniqueDates : 0,
      filtered
    };
  };

  const getWeekdayStats = () => {
    const filtered = (analyticsShifts || []).filter(s => s && s.date && typeof s.amount === 'number');
    const stats = Array(7).fill(0);
    const counts = Array(7).fill(0);
    filtered.forEach(s => {
      const day = new Date(s.date).getDay();
      stats[day] += s.amount;
      counts[day] += 1;
    });
    return stats.map((sum, i) => counts[i] ? sum / counts[i] : 0);
  };

  const getWeeklyStats = () => {
    const byWeek = {};
    (analyticsShifts || []).forEach(s => {
      if (!s || !s.date) return;
      const d = new Date(s.date);
      const weekStart = getStartOfWeek(d).toISOString().split('T')[0];
      if (!byWeek[weekStart]) byWeek[weekStart] = 0;
      byWeek[weekStart] += s.amount || 0;
    });
    const sorted = Object.entries(byWeek).sort(([a], [b]) => a.localeCompare(b));
    return {
      labels: sorted.map(([w]) => `Неделя ${new Date(w).toLocaleDateString()}`),
      data: sorted.map(([,v]) => v)
    };
  };

  const getMonthlyStats = () => {
    const byMonth = {};
    (analyticsShifts || []).forEach(s => {
      if (!s.date) return;
      const d = new Date(s.date);
      const month = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      if (!byMonth[month]) byMonth[month] = 0;
      byMonth[month] += s.amount || 0;
    });
    const sorted = Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b));
    return {
      labels: sorted.map(([m]) => m),
      data: sorted.map(([,v]) => v)
    };
  };

  const getPlanFactStats = () => {
    const planByDate = {};
    (goals || []).forEach(g => {
      if (g && g.planned?.date && g.planned?.amount) planByDate[g.planned.date] = g.planned.amount;
    });
    const factByDate = {};
    (analyticsShifts || []).forEach(s => {
      if (s && s.date && typeof s.amount === 'number') factByDate[s.date] = (factByDate[s.date] || 0) + s.amount;
    });
    const allDates = Array.from(new Set([...Object.keys(planByDate), ...Object.keys(factByDate)])).sort();
    return {
      labels: allDates.map(d => new Date(d).toLocaleDateString()),
      plan: allDates.map(d => planByDate[d] || 0),
      fact: allDates.map(d => factByDate[d] || 0)
    };
  };

  // Основной источник данных - завершенные смены
  const completedShifts = useMemo(() => {
    return (analyticsShifts || [])
      .filter(shift => shift && shift.date && shift.amount > 0)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [analyticsShifts]);

  // Расчет основных метрик
  const keyMetrics = useMemo(() => {
    const shiftsCount = completedShifts.length;
    if (shiftsCount === 0) {
      return { 
        totalEarnings: 0, 
        totalHours: 0, 
        totalDays: 0,
        avgPerShift: 0, 
        avgPerHour: 0, 
        bestDay: '–',
        bestDayDate: '–',
        efficiency: 0,
        consistency: 0,
        growthRate: 0
      };
    }

    const totalEarnings = completedShifts.reduce((sum, s) => sum + s.amount, 0);
    const totalHours = completedShifts.reduce((sum, s) => sum + (s.hours || 8), 0);
    const totalDays = new Set(completedShifts.map(s => s.date)).size;
    const totalPicks = completedShifts.reduce((sum, s) => sum + (s.picks || 0), 0);
    
    // Находим самый прибыльный день
    const dayEarnings = {};
    completedShifts.forEach(s => {
      if (!dayEarnings[s.date]) dayEarnings[s.date] = 0;
      dayEarnings[s.date] += s.amount;
    });
    
    const bestDayEntry = Object.entries(dayEarnings)
      .sort(([,a], [,b]) => b - a)[0];
    
    const bestDay = bestDayEntry ? new Date(bestDayEntry[0]).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long'
    }) : '–';

    // Расчет эффективности (рублей за пик)
    const efficiency = totalPicks > 0 ? totalEarnings / totalPicks : 0;

    // Расчет стабильности (коэффициент вариации доходов)
    const avgEarnings = totalEarnings / shiftsCount;
    const variance = completedShifts.reduce((sum, s) => sum + Math.pow(s.amount - avgEarnings, 2), 0) / shiftsCount;
    const consistency = avgEarnings > 0 ? Math.max(0, 100 - (Math.sqrt(variance) / avgEarnings * 100)) : 0;

    // Расчет роста (сравнение первой и последней недели)
    const firstWeekShifts = completedShifts.slice(0, Math.min(7, Math.floor(shiftsCount / 2)));
    const lastWeekShifts = completedShifts.slice(-Math.min(7, Math.floor(shiftsCount / 2)));
    
    const firstWeekAvg = firstWeekShifts.length > 0 ? 
      firstWeekShifts.reduce((sum, s) => sum + s.amount, 0) / firstWeekShifts.length : 0;
    const lastWeekAvg = lastWeekShifts.length > 0 ? 
      lastWeekShifts.reduce((sum, s) => sum + s.amount, 0) / lastWeekShifts.length : 0;
    
    const growthRate = firstWeekAvg > 0 ? ((lastWeekAvg - firstWeekAvg) / firstWeekAvg * 100) : 0;

    return {
      totalEarnings,
      totalHours,
      totalDays,
      totalPicks,
      avgPerShift: totalEarnings / shiftsCount,
      avgPerHour: totalHours > 0 ? totalEarnings / totalHours : 0,
      bestDay,
      bestDayDate: bestDayEntry ? bestDayEntry[0] : '–',
      efficiency: efficiency,
      consistency: consistency,
      growthRate: growthRate
    };
  }, [completedShifts]);

  // Продвинутые прогнозы с учетом выходных
  const getAdvancedForecasts = (weekendsPerMonth = 0) => {
    const last30DaysShifts = completedShifts.filter(s => {
      const date = new Date(s.date);
      const today = new Date();
      const diffDays = (today - date) / (1000 * 60 * 60 * 24);
      return diffDays <= 30;
    });

    if (last30DaysShifts.length < 3) {
      return { 
        week: { gross: null, net: null }, 
        month: { gross: null, net: null }, 
        year: { gross: null, net: null },
        workingDays: { month: 22, year: 260 }
      };
    }

    const avgDailyEarnings = last30DaysShifts.reduce((sum, s) => sum + s.amount, 0) / last30DaysShifts.length;
    
    // Стандартные рабочие дни
    const workingDaysPerWeek = 5; // пн-пт
    const workingDaysPerMonth = 22; // стандартный месяц
    const workingDaysPerYear = 260; // стандартный год

    // С учетом дополнительных выходных
    const adjustedWorkingDaysPerMonth = Math.max(0, workingDaysPerMonth - weekendsPerMonth);
    const adjustedWorkingDaysPerYear = Math.max(0, workingDaysPerYear - (weekendsPerMonth * 12));

    return {
      week: {
        gross: avgDailyEarnings * 7,
        net: avgDailyEarnings * workingDaysPerWeek
      },
      month: {
        gross: avgDailyEarnings * 30,
        net: avgDailyEarnings * adjustedWorkingDaysPerMonth
      },
      year: {
        gross: avgDailyEarnings * 365,
        net: avgDailyEarnings * adjustedWorkingDaysPerYear
      },
      workingDays: {
        month: adjustedWorkingDaysPerMonth,
        year: adjustedWorkingDaysPerYear
      }
    };
  };

  // Анализ эффективности по времени дня
  const getHourlyEfficiency = () => {
    const hourlyData = {};
    
    completedShifts.forEach(shift => {
      const type = shift.type || 'day';
      if (!hourlyData[type]) {
        hourlyData[type] = { earnings: 0, count: 0 };
      }
      hourlyData[type].earnings += shift.amount;
      hourlyData[type].count += 1;
    });

    return Object.entries(hourlyData).map(([type, data]) => ({
      type: type === 'day' ? 'Дневная' : type === 'night' ? 'Ночная' : 'Другая',
      avgEarnings: data.count > 0 ? data.earnings / data.count : 0,
      count: data.count
    }));
  };

  // Анализ трендов и паттернов
  const getTrendAnalysis = () => {
    if (completedShifts.length < 7) return null;

    const recent = completedShifts.slice(-7);
    const previous = completedShifts.slice(-14, -7);

    const recentAvg = recent.reduce((sum, s) => sum + s.amount, 0) / recent.length;
    const previousAvg = previous.length > 0 ? 
      previous.reduce((sum, s) => sum + s.amount, 0) / previous.length : recentAvg;

    const trend = recentAvg > previousAvg ? 'up' : recentAvg < previousAvg ? 'down' : 'stable';
    const trendPercent = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg * 100) : 0;

    return {
      trend,
      trendPercent: Math.abs(trendPercent),
      recentAvg,
      previousAvg,
      recommendation: trend === 'up' ? 
        'Отличная работа! Вы показываете рост.' :
        trend === 'down' ?
        'Стоит проанализировать факторы снижения дохода.' :
        'Стабильные результаты, можно попробовать новые стратегии.'
    };
  };

  // Данные для графика трендов по месяцам
  const monthlyTrends = useMemo(() => {
    const byMonth = {};
    completedShifts.forEach(s => {
        const d = new Date(s.date);
        const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!byMonth[month]) byMonth[month] = { earnings: 0, count: 0 };
        byMonth[month].earnings += s.amount;
        byMonth[month].count++;
    });
    const sorted = Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b));
    return {
        labels: sorted.map(([m]) => m),
        data: sorted.map(([, v]) => v.earnings)
    };
  }, [completedShifts]);

  // Расчет целевых показателей
  const getTargetAnalysis = (monthlyTarget = 0, weekendsPerMonth = 0) => {
    if (!monthlyTarget) return null;

    const workingDaysPerMonth = Math.max(0, 22 - weekendsPerMonth);
    const dailyTarget = workingDaysPerMonth > 0 ? monthlyTarget / workingDaysPerMonth : 0;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthShifts = completedShifts.filter(s => {
      const date = new Date(s.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const currentEarnings = monthShifts.reduce((sum, s) => sum + s.amount, 0);
    const daysWorked = monthShifts.length;
    const remainingDays = Math.max(0, workingDaysPerMonth - daysWorked);
    const neededPerDay = remainingDays > 0 ? (monthlyTarget - currentEarnings) / remainingDays : 0;

    return {
      monthlyTarget,
      dailyTarget,
      currentEarnings,
      daysWorked,
      remainingDays,
      neededPerDay,
      isOnTrack: currentEarnings >= (dailyTarget * daysWorked),
      progressPercent: (currentEarnings / monthlyTarget) * 100
    };
  };

  return {
    allShifts,
    calculatePeriodStats,
    getStats,
    getWeekdayStats,
    getWeeklyStats,
    getMonthlyStats,
    getPlanFactStats,
    keyMetrics,
    forecasts: getAdvancedForecasts, // Обновленные прогнозы
    monthlyTrends,
    getHourlyEfficiency,
    getTrendAnalysis,
    getTargetAnalysis,
    getWorkingDaysInPeriod // Экспортируем функцию расчета рабочих дней
  };
} 