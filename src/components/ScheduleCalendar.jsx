import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';
import { getDaysInMonth, getFirstDayOfMonth } from '../utils/dateUtils';

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
  const handleDayClick = (day) => {
    const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    toggleWorkDay(formattedDate);
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
      days.push(<div key={`empty-${i}`} className="h-16 sm:h-20 bg-gray-800/50 rounded-lg" />);
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
          className={`h-16 sm:h-20 p-1 sm:p-2 rounded-lg relative flex flex-col justify-between cursor-pointer select-none transition-all
            ${darkMode ? "bg-gray-800" : "bg-white"}
            border ${isToday ? "border-purple-500" : isWorkDay ? "border-green-500" : "border-gray-700"}
            ${isWorkDay ? "ring-2 ring-green-400/70" : ""}`}
          onClick={() => handleDayClick(day)}
          title={isWorkDay ? "Рабочий день" : "Отметить как рабочий"}
        >
          <div className="flex justify-between items-start">
            <span className={`text-xs sm:text-sm ${isToday ? "text-purple-500 font-bold" : isWorkDay ? "text-green-500 font-bold" : ""}`}>{day}</span>
            {isWorkDay && (
              <span className="ml-1 text-green-400 text-xs" title="Рабочий день">●</span>
            )}
            {shift && (
              <button
                onClick={e => { e.stopPropagation(); deleteShift(date); }}
                className="p-1 rounded hover:bg-red-700/20 text-red-500 text-xs"
              >✕</button>
            )}
          </div>
          {shift && (
            <button
              onClick={e => { e.stopPropagation(); openShiftDetails(date); }}
              className="mt-1 w-full text-left"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1 w-full overflow-hidden">
                <span className="text-xs font-medium text-green-500 truncate max-w-full" style={{lineHeight:'1.1'}}>
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
              onClick={e => {
                e.stopPropagation();
                const [year, month, day] = date.split('-').map(Number);
                const d = new Date(year, month - 1, day);
                const correctDate = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
                loadShift(correctDate);
              }}
              className="mt-1 w-full h-7 flex items-center justify-center rounded-lg border border-dashed border-gray-600 hover:border-purple-500 hover:bg-purple-500/10 transition-colors"
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {currentMonthName} {currentYear}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-gray-700"
          >
            <ChevronLeftIcon />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-gray-700"
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-4">
        {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
          <div key={day} className="text-center font-medium text-gray-400">
            {day}
          </div>
        ))}
        {renderCalendar()}
      </div>
    </div>
  );
} 