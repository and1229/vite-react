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
      ...Object.values(calendarData),
      ...goals.filter(goal => goal.completed)
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
    
    const filtered = analyticsShifts.filter(s => {
      if (!s.date) return false;
      const shiftDateStr = s.date;
      return shiftDateStr >= startStr && shiftDateStr <= nowStr;
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
    const filtered = analyticsShifts.filter(s => s.date && typeof s.amount === 'number');
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
    analyticsShifts.forEach(s => {
      if (!s.date) return;
      const d = new Date(s.date);
      const week = `${d.getFullYear()}-W${Math.ceil((d - new Date(d.getFullYear(),0,1)) / 604800000)}`;
      if (!byWeek[week]) byWeek[week] = 0;
      byWeek[week] += s.amount || 0;
    });
    const sorted = Object.entries(byWeek).sort(([a], [b]) => a.localeCompare(b));
    return {
      labels: sorted.map(([w]) => w),
      data: sorted.map(([,v]) => v)
    };
  };

  const getMonthlyStats = () => {
    const byMonth = {};
    analyticsShifts.forEach(s => {
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
    goals.forEach(g => {
      if (g.planned?.date && g.planned?.amount) planByDate[g.planned.date] = g.planned.amount;
    });
    const factByDate = {};
    analyticsShifts.forEach(s => {
      if (s.date && typeof s.amount === 'number') factByDate[s.date] = s.amount;
    });
    const allDates = Array.from(new Set([...Object.keys(planByDate), ...Object.keys(factByDate)])).sort();
    return {
      labels: allDates.map(d => new Date(d).toLocaleDateString()),
      plan: allDates.map(d => planByDate[d] || 0),
      fact: allDates.map(d => factByDate[d] || 0)
    };
  };

  return {
    allShifts,
    calculatePeriodStats,
    getStats,
    getWeekdayStats,
    getWeeklyStats,
    getMonthlyStats,
    getPlanFactStats
  };
} 