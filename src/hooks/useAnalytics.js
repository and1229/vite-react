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

export function useAnalytics(analyticsShifts, goals, calendarData) {
  const allShifts = useMemo(() => {
    const shifts = [
      ...Object.values(calendarData || {}),
      ...(goals || []).filter(goal => goal && goal.completed)
        .map(goal => ({
          date: goal.planned.date,
          earnings: Number(goal.actual.amount),
          picks: Number(goal.actual.picks),
          rate: goal.planned.rate
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
        bestDayDate: '–'
      };
    }

    const totalEarnings = completedShifts.reduce((sum, s) => sum + s.amount, 0);
    const totalHours = completedShifts.reduce((sum, s) => sum + (s.hours || 8), 0);
    const totalDays = new Set(completedShifts.map(s => s.date)).size; // Уникальные дни
    
    // Находим самый прибыльный день (конкретную дату)
    const dayEarnings = {};
    completedShifts.forEach(s => {
      if (!dayEarnings[s.date]) dayEarnings[s.date] = 0;
      dayEarnings[s.date] += s.amount;
    });
    
    const bestDayDate = Object.entries(dayEarnings)
      .sort(([,a], [,b]) => b - a)[0][0];
    
    const bestDay = new Date(bestDayDate).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long'
    });

    return {
      totalEarnings,
      totalHours,
      totalDays,
      avgPerShift: totalEarnings / shiftsCount,
      avgPerHour: totalHours > 0 ? totalEarnings / totalHours : 0,
      bestDay,
      bestDayDate
    };
  }, [completedShifts]);

  // Прогноз заработка на разные периоды
  const forecasts = useMemo(() => {
    const last30DaysShifts = completedShifts.filter(s => {
      const date = new Date(s.date);
      const today = new Date();
      const diffDays = (today - date) / (1000 * 60 * 60 * 24);
      return diffDays <= 30;
    });

    if (last30DaysShifts.length < 3) {
      return { week: null, month: null, year: null };
    }

    const avgDailyEarnings = last30DaysShifts.reduce((sum, s) => sum + s.amount, 0) / last30DaysShifts.length;
    
    return {
      week: avgDailyEarnings * 7,
      month: avgDailyEarnings * 30,
      year: avgDailyEarnings * 365
    };
  }, [completedShifts]);

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

  return {
    allShifts,
    calculatePeriodStats,
    getStats,
    getWeekdayStats,
    getWeeklyStats,
    getMonthlyStats,
    getPlanFactStats,
    keyMetrics,
    forecasts,
    monthlyTrends
  };
} 