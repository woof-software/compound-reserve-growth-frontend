/** Pure date helpers for calendar. All use UTC to avoid timezone shifts. */

export const parseDate = (value?: string): Date | null => {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(Date.UTC(year, month - 1, day));
};

export const formatDate = (date: Date): string =>
  date.toISOString().split('T')[0];

export const getMonthStart = (date: Date): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));

export const addMonths = (date: Date, amount: number): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1));

export const addDays = (date: Date, amount: number): Date =>
  new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() + amount
    )
  );

export const isSameDay = (a: Date | null, b: Date | null): boolean =>
  Boolean(a && b && a.getTime() === b.getTime());

export const formatMonthLabel = (monthStart: Date): string =>
  monthStart.toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  });

const WEEKS_IN_GRID = 6;
const DAYS_PER_WEEK = 7;

export const buildMonthWeeks = (monthStart: Date): Date[][] => {
  const startDay = monthStart.getUTCDay();
  const gridStart = addDays(monthStart, -startDay);
  const weeks: Date[][] = [];
  let current = gridStart;

  for (let weekIndex = 0; weekIndex < WEEKS_IN_GRID; weekIndex += 1) {
    const week: Date[] = [];
    for (let dayIndex = 0; dayIndex < DAYS_PER_WEEK; dayIndex += 1) {
      week.push(current);
      current = addDays(current, 1);
    }
    weeks.push(week);
  }

  return weeks;
};
