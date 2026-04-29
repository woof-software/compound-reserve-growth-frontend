import { useUrlSync } from '@/shared/hooks/filters/useUrlSync'

export type DateRange = [number | null, number | null];

/**
 * Synchronizes a date range value with the URL state. It manages the parsing and stringify of the
 * date range to ensure proper encoding and decoding for URL usage.
 *
 * {string} key - The key representing the date range value in the URL query parameter.
 * {DateRange} value - The initial value of the date range to be synchronized.
 * {[number | null, number | null]} The parsed date range values from the URL or the default value.
 */
export const useUrlSyncDateRange = (key: string, value: DateRange) => {
  return useUrlSync<[number | null, number | null]>(key, value, {
    parse: (raw) => {
      if (!raw) return [null, null];

      const parts = raw.split('_');

      return [
        parts[0] ? (Number.isInteger(Number(parts[0])) ? Number(parts[0]) : null) : null,
        parts[1] ? (Number.isInteger(Number(parts[1])) ? Number(parts[1]) : null) : null,
      ];
    },
    stringify: ([startDate, endDate]) => {
      if (startDate === null) return '';

      if (endDate === null) return startDate.toString();

      return [startDate, endDate].join('_');
    },
  });
};