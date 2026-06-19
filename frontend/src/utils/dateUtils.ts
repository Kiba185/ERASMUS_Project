export const getSystemDate = (): Date => {
  const enabled = localStorage.getItem('simulatedTimeEnabled') === 'true';
  const timeStr = localStorage.getItem('simulatedTime');
  if (enabled && timeStr) {
    return new Date(timeStr);
  }
  return new Date();
};

export const formatDateValue = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getISOWeekDetails = (date: Date) => {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  return { weekNumber, isEven: weekNumber % 2 === 0 };
};

export const getMondayOfOffsetWeek = (weekOffset: number): Date => {
  const today = getSystemDate();
  const currentDay = today.getDay();
  const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
  const targetMonday = new Date(today.setDate(today.getDate() + distanceToMonday + weekOffset * 7));
  return targetMonday;
};

export const isWeekMatch = (lessonWeek: string, activeParity: 'even' | 'odd'): boolean => {
  if (!lessonWeek) return true;
  const normalized = lessonWeek.toLowerCase();
  if (normalized === 'all' || normalized === 'both') return true;
  if (activeParity === 'even') {
    return normalized === 'even' || normalized === 'a';
  } else {
    return normalized === 'odd' || normalized === 'b';
  }
};
