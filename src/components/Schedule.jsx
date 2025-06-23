import React, { useState, useEffect } from 'react';
import { ScheduleCalendar } from './ScheduleCalendar';
import { useHaptic } from '../hooks/useHaptic';

export function Schedule({ 
  darkMode, 
  shifts, 
  loadShift, 
  deleteShift, 
  openShiftDetails, 
  currentDate, 
  setCurrentDate, 
  prevMonth, 
  nextMonth, 
  workDays, 
  toggleWorkDay 
}) {
  const { hapticButton } = useHaptic();

  const handleDayClick = (day, date) => {
    hapticButton();
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    if (shifts[dateStr]) {
      openShiftDetails(dateStr);
    } else {
      loadShift(dateStr);
    }
  };

  const handleToggleWorkDay = (dateStr) => {
    toggleWorkDay(dateStr);
    hapticButton();
  };

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold text-gradient-primary">График/смены</h2>
      <ScheduleCalendar
        darkMode={darkMode}
        shifts={shifts}
        loadShift={loadShift}
        deleteShift={deleteShift}
        openShiftDetails={openShiftDetails}
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        prevMonth={prevMonth}
        nextMonth={nextMonth}
        workDays={workDays}
        toggleWorkDay={toggleWorkDay}
      />
    </section>
  );
} 