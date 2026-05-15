import {
  DATE_TYPE_TABS,
  DateType,
  Period,
  PeriodMap,
  RevenueTableRowData,
  ROLLING_TABS,
  TO_DATE_TABS,
  toDateHeaderMap,
  ToDateTab,
} from '@/components/RevenuePageTable/RevenueOverviewUSD';
import type { RevenueItem } from '@/shared/hooks/useRevenue';
import { Format } from '@/shared/lib/utils/format';
import { capitalizeFirstLetter, networkColorMap } from '@/shared/lib/utils/utils';

export type PieSlice = {
  name: string;
  value: string;
  percent: number;
  color: string;
};

export type RevenueOverviewResult = {
  tableData: RevenueTableRowData[];
  pieData: PieSlice[];
  totals: PeriodMap | null;
};

const ALL_PERIODS: readonly string[] = [...ROLLING_TABS, ...TO_DATE_TABS];

export const TABS_CLASS = {
  container: 'w-full sm:w-auto',
  list: 'w-full sm:w-auto',
} as const;

export function isDateType(value: string): value is DateType {
  return (DATE_TYPE_TABS as readonly string[]).includes(value);
}

export function isPeriod(value: string): value is Period {
  return ALL_PERIODS.includes(value);
}

export function resolveOverviewState(dateType: string, period: string) {
  const normalizedDateType: DateType = isDateType(dateType) ? dateType : 'Rolling';
  const primaryTabs = normalizedDateType === 'Rolling' ? ROLLING_TABS : TO_DATE_TABS;
  const normalizedPeriod: Period =
    isPeriod(period) && (primaryTabs as readonly string[]).includes(period)
      ? period
      : primaryTabs[0];

  return { normalizedDateType, primaryTabs, normalizedPeriod };
}

export function getPeriodHeader(period: string, dateType: DateType): string {
  return dateType === 'Rolling'
    ? `Rolling ${period.toLowerCase()}`
    : toDateHeaderMap[period as ToDateTab] || period;
}

function getStartDateForPeriod(period: string, dateType: DateType): Date {
  const now = new Date();

  if (dateType === 'Rolling') {
    now.setDate(now.getDate() - parseInt(period.replace('D', ''), 10));
    return now;
  }

  switch (period) {
    case 'WTD': {
      const dayOfWeek = now.getDay();
      now.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
      break;
    }
    case 'MTD':
      now.setDate(1);
      break;
    case 'YTD':
      now.setMonth(0, 1);
      break;
    default:
      break;
  }

  now.setHours(0, 0, 0, 0);
  return now;
}

export function getPeriodStartTimestamps(
  periods: readonly string[],
  dateType: DateType,
): Record<string, number> {
  return Object.fromEntries(
    periods.map((p) => [p, Math.floor(getStartDateForPeriod(p, dateType).getTime() / 1000)]),
  );
}

export function buildRevenueOverviewData(
  rawData: RevenueItem[],
  periods: readonly string[],
  periodStartTimestamps: Record<string, number>,
  selectedPeriod: Period,
): RevenueOverviewResult {
  if (!rawData.length) {
    return { tableData: [], pieData: [], totals: null };
  }

  const totals = Object.fromEntries(periods.map((p) => [p, 0])) as PeriodMap;
  const tableDataMap = new Map<string, RevenueTableRowData>();

  for (const network of new Set(rawData.map((item) => item.source.network))) {
    const row: RevenueTableRowData = { chain: network };
    periods.forEach((p) => {
      row[p] = 0;
    });
    tableDataMap.set(network, row);
  }

  for (const item of rawData) {
    const row = tableDataMap.get(item.source.network);
    if (!row) continue;

    for (const p of periods) {
      if (item.date >= periodStartTimestamps[p]) {
        (row[p] as number) += item.value;
      }
    }
  }

  for (const row of tableDataMap.values()) {
    periods.forEach((p) => {
      totals[p] += row[p] as number;
    });
  }

  const tableData = [...tableDataMap.values()];
  const positivePieData = tableData
    .map((row) => ({ name: row.chain, value: (row[selectedPeriod] as number) || 0 }))
    .filter(({ value }) => value > 0);

  const totalPieValue = positivePieData.reduce((sum, { value }) => sum + value, 0);

  const pieData = positivePieData.map(({ name, value }) => ({
    name: capitalizeFirstLetter(name),
    value: Format.price(value, 'compact'),
    percent: Number((totalPieValue > 0 ? (value / totalPieValue) * 100 : 0).toFixed(1)),
    color: networkColorMap[name.toLowerCase()] || '#808080',
  }));

  return { tableData, pieData, totals };
}
