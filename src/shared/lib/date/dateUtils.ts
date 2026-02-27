/** Date utilities that operate in UTC to avoid timezone shifts. */

export const DAY_IN_MS = 24 * 60 * 60 * 1000;

const INPUT_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const DATE_LABEL_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC'
});

export const inputDateToTimestamp = (value: string): number | null => {
  if (!value) return null;

  const match = INPUT_DATE_PATTERN.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return null;

  const timestamp = Date.UTC(year, month - 1, day);
  const date = new Date(timestamp);
  const isValidDate =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;

  return isValidDate ? timestamp : null;
};

export const timestampToInputDate = (timestamp: number | null): string => {
  if (timestamp === null) return '';
  return new Date(timestamp).toISOString().slice(0, 10);
};

export const formatTimestampForLabel = (timestamp: number | null): string => {
  if (timestamp === null) return '';

  const formatted = DATE_LABEL_FORMATTER.format(new Date(timestamp));
  return formatted.replace(/\//g, '.');
};

export const getEndOfDayTimestamp = (timestamp: number): number =>
  timestamp + DAY_IN_MS - 1;

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

export const isSameDay = (a: Date, b: Date): boolean =>
  a.getTime() === b.getTime();

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
