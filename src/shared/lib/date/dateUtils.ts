/** Date utilities that operate in UTC to avoid timezone shifts. */
import { BAR_SIZE } from '@/shared/types/types';

export const DAY_IN_MS = 24 * 60 * 60 * 1000;
export const MIN_YEAR = 1970;
export const MAX_YEAR = 2100;

const INPUT_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const DATE_LABEL_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC'
});

const formatDate = (digits: string) => {
  const trimmed = digits.slice(0, 8);

  const y = trimmed.slice(0, 4);
  const m = trimmed.slice(4, 6);
  const d = trimmed.slice(6, 8);

  let result = y;
  if (m) result += `-${m}`;
  if (d) result += `-${d}`;

  return result;
};

export const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
  const input = e.target;

  const raw = input.value;
  const selectionStart = input.selectionStart || 0;

  const digitsBeforeCursor = raw
    .slice(0, selectionStart)
    .replace(/\D/g, '').length;

  const digits = raw.replace(/\D/g, '').slice(0, 8);

  const formatted = formatDate(digits);

  input.value = formatted;

  let cursor = 0;
  let digitCount = 0;

  while (cursor < formatted.length && digitCount < digitsBeforeCursor) {
    if (/\d/.test(formatted[cursor])) {
      digitCount++;
    }
    cursor++;
  }

  if (formatted[cursor] === '-') {
    cursor++;
  }

  requestAnimationFrame(() => {
    input.setSelectionRange(cursor, cursor);
  });
};

export const inputDateToTimestamp = (value: string): number | null => {
  if (!value) return null;

  const match = INPUT_DATE_PATTERN.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (year < MIN_YEAR || year > MAX_YEAR) return null;

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

  const date = new Date(timestamp);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
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

// USED FOR CALENDAR
const getUtcDayStart = (timestamp: number): number => {
  const date = new Date(timestamp);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
};

const addUtcMonthsClamped = (timestamp: number, months: number): number => {
  const date = new Date(timestamp);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();

  const targetMonthIndex = month + months;
  const targetYear = year + Math.floor(targetMonthIndex / 12);
  const normalizedTargetMonth = ((targetMonthIndex % 12) + 12) % 12;
  const daysInTargetMonth = new Date(
    Date.UTC(targetYear, normalizedTargetMonth + 1, 0)
  ).getUTCDate();
  const clampedDay = Math.min(day, daysInTargetMonth);

  return Date.UTC(targetYear, normalizedTargetMonth, clampedDay);
};

export const getMaxBarSizeForRange = (
  startDate: number,
  endDate: number
): BAR_SIZE => {
  const from = Math.min(getUtcDayStart(startDate), getUtcDayStart(endDate));
  const to = Math.max(getUtcDayStart(startDate), getUtcDayStart(endDate));
  const endExclusive = to + DAY_IN_MS;

  const weekBoundary = from + 7 * DAY_IN_MS;
  const monthBoundary = addUtcMonthsClamped(from, 1) + DAY_IN_MS;

  if (endExclusive < weekBoundary) return BAR_SIZE.D;
  if (endExclusive < monthBoundary) return BAR_SIZE.W;
  return BAR_SIZE.M;
};
