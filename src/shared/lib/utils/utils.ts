import { ChangeEvent, MouseEvent as ReactMouseEvent } from 'react';

import { THIRTY_DAYS } from '@/shared/consts/consts';
import { TokenData } from '@/shared/types/Treasury/types';
import type { OptionType } from '@/shared/types/types';
import { ResponseDataType } from '@/shared/types/types';

export const preventEventBubbling = (
  e: ReactMouseEvent<HTMLElement> | ChangeEvent<HTMLInputElement>
): void => {
  e.preventDefault();
  e.stopPropagation();
};

export const colorPicker = (index: number): string => {
  const colors = [
    '#6F42EB',
    '#3877FF',
    '#00D395',
    '#F54E59',
    '#FFA374',
    '#F9FF8E',
    '#8FE6FE',
    '#B39AFF',
    '#FDB0C0',
    '#BCE954',
    '#10A674',
    '#5C8BC4',
    '#F6C642',
    '#02CCFE',
    '#BC8F6F',
    '#7A89B8',
    '#FF752E',
    '#FAB3FF',
    '#58F0C5',
    '#62B1FF'
  ];

  if (index < colors.length) {
    return colors[index];
  }

  const base = colors[Math.floor(Math.random() * colors.length)];

  const r = parseInt(base.slice(1, 3), 16);
  const g = parseInt(base.slice(3, 5), 16);
  const b = parseInt(base.slice(5, 7), 16);

  const offset = Math.floor(Math.random() * 30) - 15;
  const nr = Math.min(255, Math.max(0, r + offset));
  const ng = Math.min(255, Math.max(0, g + offset));
  const nb = Math.min(255, Math.max(0, b + offset));

  return `#${nr.toString(16).padStart(2, '0')}${ng
    .toString(16)
    .padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
};

export const networkColorMap: { [key: string]: string } = {
  ethereum: '#3877FF',
  mainnet: '#3877FF',
  arbitrum: '#00D395',
  avalanche: '#F9FF8E',
  base: '#F54E59',
  optimism: '#6F42EB',
  polygon: '#FFA374',
  sonic: '#F6C642',
  linea: '#FF752E',
  mantle: '#02CCFE',
  ronin: '#B39AFF',
  scroll: '#FDB0C0',
  unichain: '#BCE954'
};

export const units = [
  { value: 1e33, symbol: 'D' },
  { value: 1e30, symbol: 'N' },
  { value: 1e27, symbol: 'Oc' },
  { value: 1e24, symbol: 'Sp' },
  { value: 1e21, symbol: 'Sx' },
  { value: 1e18, symbol: 'Qi' },
  { value: 1e15, symbol: 'Q' },
  { value: 1e12, symbol: 'T' },
  { value: 1e9, symbol: 'B' },
  { value: 1e6, symbol: 'M' },
  { value: 1e3, symbol: 'K' }
];

export const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  return `${value.toLocaleString()}`;
};

export const formatGrowth = (growth: number) => {
  if (growth === 0) return '-';
  return `${growth > 0 ? '+' : ''}${growth?.toFixed(1)}%`;
};

export function formatLargeNumber(num: number, digits: number = 4): string {
  const threshold = 1 / 10 ** (digits + 1);

  if (num === 0 || isNaN(num)) return threshold.toFixed(digits);

  const sign = num < 0 ? '-' : '';
  const absNum = Math.abs(num);

  if (absNum < 1_000) {
    return (
      sign +
      absNum.toLocaleString('en-US', {
        maximumFractionDigits: digits,
        minimumFractionDigits: digits
      })
    );
  }

  for (const unit of units) {
    if (absNum >= unit.value) {
      return (
        sign +
        (absNum / unit.value).toLocaleString('en-US', {
          maximumFractionDigits: digits,
          minimumFractionDigits: digits
        }) +
        unit.symbol
      );
    }
  }

  return (
    sign + absNum.toLocaleString('en-US', { maximumFractionDigits: digits })
  );
}

export const formatPrice = (price: number, decimals = 2): string => {
  return `$${formatLargeNumber(price, decimals)}`;
};

export const groupByTypeLast30Days = <T extends ResponseDataType>(
  data: T[],
  useLatestDate = false
): Record<string, T[]> => {
  if (data.length === 0) return {} as Record<string, T[]>;

  const nowSec = useLatestDate
    ? Math.max(...data.map((d) => d.date))
    : Math.floor(Date.now() / 1000);

  const threshold = nowSec - THIRTY_DAYS;

  return data
    .filter((item) => item.date >= threshold)
    .reduce<Record<string, T[]>>(
      (acc, item) => {
        const type = item.source.asset.type ?? 'Unknown';
        if (!acc[type]) acc[type] = [];
        acc[type].push(item);
        return acc;
      },
      {} as Record<string, T[]>
    );
};

// TotalTresuaryValue and CompoundCumulativeRevenue helpers
export interface ChartDataItem {
  date: number;
  value: number;
  source: Record<string, any>;
}

export interface FilterOptionsConfig {
  [key: string]: {
    path: string;
    labelFormatter?: (value: string) => string;
  };
}

export const getValueByPath = (obj: any, path: string): any => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

export const capitalizeFirstLetter = (str: string): string => {
  if (!str) return 'Unknown';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const extractFilterOptions = (
  rawData: ChartDataItem[],
  config: FilterOptionsConfig
): Record<string, OptionType[]> => {
  if (!rawData.length) return {};

  const uniqueValues: Record<string, Set<string>> = Object.keys(config).reduce(
    (acc, key) => {
      acc[key] = new Set<string>();
      return acc;
    },
    {} as Record<string, Set<string>>
  );

  rawData.forEach((item) => {
    for (const key in config) {
      const value = getValueByPath(item, config[key].path);
      if (value) {
        uniqueValues[key].add(value);
      }
    }
  });

  const result: Record<string, OptionType[]> = {};
  for (const key in uniqueValues) {
    const formatter = config[key].labelFormatter || capitalizeFirstLetter;
    result[`${key}Options`] = Array.from(uniqueValues[key])
      .sort()
      .map((value) => ({
        id: value,
        label: formatter(value)
      }));
  }

  return result;
};
// TotalTresuaryValue and CompoundCumulativeRevenue helpers

export function uniqByNestedAddresses<T extends TokenData>(arr: T[]): T[] {
  const seen = new Set<string>();

  return arr.reduce<T[]>((acc, item) => {
    const key = `${item.source.address}__${item.source.asset.address}`;
    if (!seen.has(key)) {
      seen.add(key);
      acc.push(item);
    }
    return acc;
  }, []);
}

export function pick30DaysOldRecords<T extends TokenData>(
  mainData: T[],
  uniqueData: T[]
): T[] {
  const refDateMap = new Map<string, number>();

  uniqueData.forEach((item) => {
    const key = `${item.source.address}__${item.source.asset.address}`;

    refDateMap.set(key, item.date);
  });

  const candidates = new Map<string, T>();

  mainData.forEach((item) => {
    const key = `${item.source.address}__${item.source.asset.address}`;
    const refDate = refDateMap.get(key);
    if (refDate === undefined) return;

    const threshold = refDate - THIRTY_DAYS;
    if (item.date > threshold) return;

    const prev = candidates.get(key);
    if (!prev || item.date > prev.date) {
      candidates.set(key, item);
    }
  });

  return Array.from(candidates.values());
}

export const groupByKey = <T>(
  data: T[],
  keyFn: (item: T) => string
): Record<string, T[]> => {
  return data.reduce<Record<string, T[]>>((acc, item) => {
    const key = keyFn(item);

    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push(item);

    return acc;
  }, {});
};

export const sumValues = (arr: TokenData[] = []): number =>
  arr.reduce((acc, item) => acc + item.value, 0);
