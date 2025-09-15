import { ToDateTab } from '@/entities/Revenue';

export const ROLLING_TABS = ['7D', '30D', '90D', '180D', '365D'] as const;

export const TO_DATE_TABS = ['WTD', 'MTD', 'YTD'] as const;

export const DATE_TYPE_TABS = ['Rolling', 'To Date'] as const;

export const toDateHeaderMap: Record<ToDateTab, string> = {
  WTD: 'Week to Date',
  MTD: 'Month to Date',
  YTD: 'Year to Date'
};
