import React from 'react';
import { ScheduleCalendar } from './ScheduleCalendar';

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
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">
        График
      </h2>
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