import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';
import { getDaysInMonth, getFirstDayOfMonth } from '../utils/dateUtils';
import { useHaptic } from '../hooks/useHaptic';

export function ScheduleCalendar({ 
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
  const { hapticButton, hapticLight } = useHaptic();

  const handleDayClick = (day) => {
    hapticLight();
    const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    toggleWorkDay(formattedDate);
  };

  const handleDeleteShift = (e, date) => {
    e.stopPropagation();
    hapticLight();
    deleteShift(date);
  };

  const handleOpenShiftDetails = (e, date) => {
    e.stopPropagation();
    hapticLight();
    openShiftDetails(date);
  };

  const handleLoadShift = (e, date) => {
    e.stopPropagation();
    hapticLight();
    const [year, month, day] = date.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    const correctDate = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    loadShift(correctDate);
  };
  
  const currentMonthName = currentDate.toLocaleString("ru", { month: "long" });
  const currentYear = currentDate.getFullYear();
  
  const renderCalendar = () => {
    const days = [];
    const daysInMonth = getDaysInMonth(currentDate.getMonth(), currentDate.getFullYear());
    const firstDayOfMonth = getFirstDayOfMonth(currentDate.getMonth(), currentDate.getFullYear());
    const today = `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2,'0')}-${String(currentDate.getDate()).padStart(2,'0')}`;

    // Добавляем пустые ячейки для дней до начала месяца
    for (let i = 1; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-16 sm:h-20 bg-gray-800/50 rounded-modern" />);
    }

    // Добавляем дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      const shift = shifts[date];
      const isToday = date === today;
      const isWorkDay = workDays.includes(date);

      days.push(
        <div
          key={date}
          className={`calendar-day-hover h-16 sm:h-20 p-1 sm:p-2 rounded-modern relative flex flex-col justify-between cursor-pointer select-none transition-all duration-200
            ${darkMode ? "bg-gray-800 shadow-modern" : "bg-white shadow-modern"}
            border ${isToday ? "border-purple-500 shadow-modern-lg" : isWorkDay ? "border-green-500" : "border-gray-700"}
            ${isWorkDay ? "ring-2 ring-green-400/70" : ""}`}
          onClick={() => handleDayClick(day)}
          title={isWorkDay ? "Рабочий день" : "Отметить как рабочий"}
        >
          <div className="flex justify-between items-start">
            <span className={`text-xs sm:text-sm font-semibold ${isToday ? "text-purple-500" : isWorkDay ? "text-green-500" : ""}`}>{day}</span>
            {isWorkDay && (
              <span className="ml-1 text-green-400 text-xs" title="Рабочий день">●</span>
            )}
            {shift && (
              <button
                onClick={(e) => handleDeleteShift(e, date)}
                className="micro-button p-1 rounded-full hover:bg-red-700/20 text-red-500 text-xs transition-all duration-200"
                title="Удалить смену"
              >✕</button>
            )}
          </div>
          {shift && (
            <button
              onClick={(e) => handleOpenShiftDetails(e, date)}
              className="mt-1 w-full text-left hover-lift"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1 w-full overflow-hidden">
                <span className="text-xs font-semibold text-green-500 truncate max-w-full" style={{lineHeight:'1.1'}}>
                  {Number(shift.amount).toFixed(2)} ₽
                </span>
                <span className="text-[10px] text-gray-400 truncate max-w-full" style={{lineHeight:'1.1'}}>
                  {shift.picks} пиков
                </span>
              </div>
            </button>
          )}
          {!shift && (
            <button
              onClick={(e) => handleLoadShift(e, date)}
              className="micro-button mt-1 w-full h-7 flex items-center justify-center rounded-modern border border-dashed border-gray-600 hover:border-purple-500 hover:bg-purple-500/10 transition-all duration-200"
              title="Добавить смену"
            >
              <span className="text-xs text-gray-400">+</span>
            </button>
          )}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gradient-primary">
          {currentMonthName} {currentYear}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={prevMonth}
            {...hapticButton()}
            className="micro-button p-2 rounded-modern hover:bg-gray-700 transition-all duration-200"
          >
            <ChevronLeftIcon />
          </button>
          <button
            onClick={nextMonth}
            {...hapticButton()}
            className="micro-button p-2 rounded-modern hover:bg-gray-700 transition-all duration-200"
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-4">
        {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
          <div key={day} className="text-center font-semibold text-gray-400 text-sm">
            {day}
          </div>
        ))}
        {renderCalendar()}
      </div>
    </div>
  );
} 