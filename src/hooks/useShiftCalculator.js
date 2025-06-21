import { useMemo } from 'react';

export function useShiftCalculator(targetEarnings, ratePerPick, workHours, breakInterval) {
  return useMemo(() => {
    const earnings = parseFloat(targetEarnings);
    const rate = parseFloat(ratePerPick);
    const hours = parseFloat(workHours);
    const breakEvery = parseInt(breakInterval);

    if (!earnings || !rate || !hours || !breakEvery) return null;

    const breaksCount = Math.floor(hours / breakEvery);
    const totalBreakMinutes = breaksCount * 10;
    const effectiveWorkMinutes = hours * 60 - totalBreakMinutes;
    const picksNeeded = Math.ceil(earnings / rate);
    const picksPerHour = Math.ceil(picksNeeded / hours);
    const hourlyRate = picksPerHour * rate;
    const picksBeforeBreak = Math.ceil(picksNeeded / (hours / breakEvery));

    return {
      picksNeeded,
      totalBreakMinutes,
      effectiveWorkMinutes,
      picksPerHour,
      hourlyRate,
      workHours,
      targetEarnings: earnings,
      breaksCount,
      picksBeforeBreak,
      ratePerPick: rate,
    };
  }, [targetEarnings, ratePerPick, workHours, breakInterval]);
} 