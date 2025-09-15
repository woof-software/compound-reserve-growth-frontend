import {
  DATE_TYPE_TABS,
  DateType,
  Period,
  ROLLING_TABS,
  TO_DATE_TABS
} from '@/entities/Revenue';

export const getStartDateForPeriod = (
  period: string,
  dateType: 'Rolling' | 'To Date'
): Date => {
  const now = new Date();

  if (dateType === 'Rolling') {
    const daysAgo = parseInt(period.replace('D', ''), 10);
    now.setDate(now.getDate() - daysAgo);
    return now;
  }

  switch (period) {
    case 'WTD': {
      const dayOfWeek = now.getDay();
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      now.setDate(diff);
      break;
    }
    case 'MTD': {
      now.setDate(1);
      break;
    }
    case 'YTD': {
      now.setMonth(0, 1);
      break;
    }
    default:
      break;
  }

  now.setHours(0, 0, 0, 0);
  return now;
};

export function isDateType(value: string): value is DateType {
  return (DATE_TYPE_TABS as readonly string[]).includes(value);
}

export function isPeriod(value: string): value is Period {
  const allPeriods: readonly string[] = [...ROLLING_TABS, ...TO_DATE_TABS];
  return allPeriods.includes(value);
}
