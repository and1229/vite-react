export const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

export const getStartOfMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

export const getStartOfYear = (date) => {
  return new Date(date.getFullYear(), 0, 1);
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ru-RU', { 
    day: 'numeric', 
    month: 'long'
  });
};

export const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();

export const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

export const formatDateForInput = (date) => {
  return date.toISOString().split("T")[0];
}; 