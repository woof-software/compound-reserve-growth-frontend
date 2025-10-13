import { ChangeEvent, MouseEvent as ReactMouseEvent } from 'react';

import { NOT_MARKET, THIRTY_DAYS } from '@/shared/consts/consts';
import { TokenData } from '@/shared/types/Treasury/types';
import type { OptionType } from '@/shared/types/types';

export const preventEventBubbling = (
  e: ReactMouseEvent<HTMLElement> | ChangeEvent<HTMLInputElement>
): void => {
  e.preventDefault();
  e.stopPropagation();
};

export const shortMonthNames = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC'
];
export const longMonthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

const STABLE_COLORS = [
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

const hashName = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

export const colorPicker = (index: number): string => {
  const i =
    ((index % STABLE_COLORS.length) + STABLE_COLORS.length) %
    STABLE_COLORS.length;

  return STABLE_COLORS[i];
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

// Function to get stable color based on series name
export const getStableColorForSeries = (
  seriesName: string,
  allSeriesNames: string[]
): string => {
  const nameNorm = seriesName.trim().toLowerCase();

  if (networkColorMap[nameNorm]) return networkColorMap[nameNorm];

  for (const [network, color] of Object.entries(networkColorMap)) {
    if (nameNorm.includes(network)) return color;
  }

  const sortedLower = [
    ...new Set(allSeriesNames.map((n) => n.trim().toLowerCase()))
  ].sort();
  let idx = sortedLower.indexOf(nameNorm);

  if (idx === -1) idx = hashName(nameNorm) % STABLE_COLORS.length;

  return colorPicker(idx);
};

export const explorers: { [key: string]: string } = {
  ethereum: 'https://etherscan.io/address/',
  mainnet: 'https://etherscan.io/address/',
  arbitrum: 'https://arbiscan.io/address/',
  avalanche: 'https://snowtrace.io/address/',
  base: 'https://basescan.org/address/',
  optimism: 'https://optimistic.etherscan.io/address/',
  polygon: 'https://polygonscan.com/address/',
  sonic: 'https://explorer.sonic.game/address/',
  linea: 'https://lineascan.build/address/',
  mantle: 'https://explorer.mantle.xyz/address/',
  ronin: 'https://app.roninchain.com/address/',
  scroll: 'https://scrollscan.com/address/',
  unichain: 'https://www.blockscout.com/search?q='
  // defaul Etherscan
};

export const defaultExplorer = 'https://etherscan.io/address/';

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

const getOrdinalSuffix = (day: number) => {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
};

export const formatDateWithOrdinal = (dateString: string) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    const suffix = getOrdinalSuffix(day);
    return `${month} ${day}${suffix} ${year}`;
  } catch {
    return dateString;
  }
};

export const sliceAddress = (
  address?: string,
  before: number = 4,
  after: number = 4
) => {
  return address && `${address.slice(0, before)}...${address.slice(-after)}`;
};

export const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  return `${value.toLocaleString()}`;
};

export const formatNumber = (num: number | undefined | null, prefix = '$') => {
  if (num === null || num === undefined || num === 0) return '-';
  return `${prefix}${Math.round(num).toLocaleString('en-US')}`;
};

export const formatQuantity = (quantity: number) => {
  if (quantity === null || quantity === undefined) return '-';
  return quantity.toLocaleString('en-US', { maximumFractionDigits: 0 });
};

export const formatGrowth = (growth: number) => {
  if (growth === 0) return '-';
  return `${growth > 0 ? '+' : ''}${growth?.toFixed(1)}%`;
};

export const formatLargeNumber = (
  num: number,
  digits?: number,
  exact: boolean = false
): string => {
  const defaultDigits = digits ?? 4;
  const threshold = 1 / 10 ** (defaultDigits + 1);

  if (num === 0 || isNaN(num)) {
    return exact ? '0' : threshold.toFixed(defaultDigits);
  }

  const sign = num < 0 ? '-' : '';
  const absNum = Math.abs(num);

  if (exact) {
    if (absNum < 1_000) {
      return sign + absNum.toString();
    }

    for (const unit of units) {
      if (absNum >= unit.value) {
        const exactValue = absNum / unit.value;
        return sign + exactValue.toString() + unit.symbol;
      }
    }

    return sign + absNum.toString();
  }

  if (absNum < 1_000) {
    if (digits === undefined) {
      return sign + Math.round(absNum).toLocaleString('en-US');
    }
    return (
      sign +
      absNum.toLocaleString('en-US', {
        maximumFractionDigits: defaultDigits,
        minimumFractionDigits: defaultDigits
      })
    );
  }

  for (const unit of units) {
    if (absNum >= unit.value) {
      const unitValue = absNum / unit.value;
      if (digits === undefined) {
        return (
          sign + Math.round(unitValue).toLocaleString('en-US') + unit.symbol
        );
      }
      return (
        sign +
        unitValue.toLocaleString('en-US', {
          maximumFractionDigits: defaultDigits,
          minimumFractionDigits: defaultDigits
        }) +
        unit.symbol
      );
    }
  }

  if (digits === undefined) {
    return sign + Math.round(absNum).toLocaleString('en-US');
  }
  return (
    sign +
    absNum.toLocaleString('en-US', { maximumFractionDigits: defaultDigits })
  );
};

export const formatPrice = (price: number, decimals = 2): string => {
  const priceFormat = `$${formatLargeNumber(price, decimals)}`;

  return priceFormat.startsWith('$-')
    ? `-${priceFormat.replace('-', '')}`
    : priceFormat;
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

export const capitalizeFirstLetter = (
  str: string,
  replaceSymbol?: string
): string => {
  if (!str) return replaceSymbol || 'Unknown';
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
      let value = getValueByPath(item, config[key].path);

      if (key === 'deployment' && value === null) {
        value = NOT_MARKET;
      }

      if (value !== null && value !== undefined) {
        uniqueValues[key].add(value);
      }
    }
  });

  const result: Record<string, OptionType[]> = {};
  for (const key in uniqueValues) {
    const formatter = config[key].labelFormatter || capitalizeFirstLetter;
    result[`${key}Options`] = Array.from(uniqueValues[key])
      .sort((a, b) => a.localeCompare(b))
      .map((value) => {
        const option: OptionType = {
          id: value,
          label: formatter(value)
        };

        if (key === 'deployment') {
          const matches =
            value === NOT_MARKET
              ? rawData.filter(
                  (item) => getValueByPath(item, config[key].path) == null
                )
              : rawData.filter(
                  (item) => getValueByPath(item, config[key].path) === value
                );

          if (value !== NOT_MARKET) {
            option.marketType = matches[0]?.source.type.split(' ')[1] ?? '';
          }

          option.chain = Array.from(
            new Set(matches.map((item) => item.source.network))
          );
        }

        return option;
      });
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

export const formatUSD = (num: number, format?: 'compact'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: format ?? 'standard',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

export const formatCurrencyValue = (value: unknown): string => {
  const num = Number(value);

  if (
    value === null ||
    typeof value === 'undefined' ||
    isNaN(num) ||
    num === 0
  ) {
    return '-';
  }

  const isNegative = num < 0;
  const absValue = Math.abs(num);

  const formattedNumber = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0
  }).format(absValue);

  return isNegative ? `-$${formattedNumber}` : `$${formattedNumber}`;
};

export const groupOptionsDto = (options: string[]) => {
  return options.map((option) => ({
    header: option,
    accessorKey: option
  }));
};

export const formatValue = (value: number) => {
  if (Math.abs(value) >= 1_000_000) {
    return (value / 1_000_000).toFixed(1) + 'M';
  }
  if (Math.abs(value) >= 1_000) {
    return (value / 1_000).toFixed(1) + 'K';
  }
  return value.toFixed(0);
};

export const removeDuplicates = <T>(array: T[], key: keyof T): T[] => {
  const uniqueValues = new Set();

  return array.filter((item) => {
    const value = item[key];

    if (uniqueValues.has(value)) return false;

    uniqueValues.add(value);

    return true;
  });
};

export const startOfUTCDay = (t: number) => {
  const d = new Date(t);

  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
};

export const startOfUTCWeekMon = (t: number) => {
  const d = new Date(t);

  const weekday = d.getUTCDay();

  const shift = (weekday + 6) % 7;

  const dayStart = startOfUTCDay(t);

  return dayStart - shift * 24 * 60 * 60 * 1000;
};

export const startOfUTCMonth = (t: number) => {
  const d = new Date(t);

  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
};

/**
 * A no-operation function that performs no actions and returns undefined.
 * Typically used as a placeholder or default callback.
 *
 * @return Always returns undefined.
 */
export function noop() {
  // Do nothing
}

export const filterAndSortMarkets = (
  options: OptionType[] = [],
  selectedChainIds: string[] = []
): OptionType[] => {
  const filtered = options.filter(
    (el) =>
      ['v2', 'v3'].includes(el.marketType?.toLowerCase() ?? '') ||
      el.id.toLowerCase() === NOT_MARKET.toLowerCase()
  );

  const sorted = filtered.sort((a, b) => {
    const getOrder = (el: OptionType) => {
      const type = el.marketType?.toLowerCase();

      if (type === 'v3') return 0;

      if (type === 'v2') return 1;

      if (el.id.toLowerCase() === NOT_MARKET.toLowerCase()) return 2;

      return 3;
    };

    const orderA = getOrder(a);
    const orderB = getOrder(b);

    if (orderA !== orderB) return orderA - orderB;

    return a.label.localeCompare(b.label);
  });

  if (selectedChainIds.length) {
    return sorted.filter((el) =>
      Array.isArray(el.chain)
        ? el.chain.some((c) => selectedChainIds.includes(c))
        : false
    );
  }

  return sorted;
};
