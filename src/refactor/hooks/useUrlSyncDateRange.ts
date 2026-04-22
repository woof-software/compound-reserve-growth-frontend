import { useUrlSync } from '@/refactor/hooks/useUrlFilterSync'

export type DateRange = [number | null, number | null];

export const useUrlSyncDateRange = (key: string, value: DateRange) => {
  return useUrlSync<[number | null, number | null]>(key, value, {
    parse: (raw) => {
      if (!raw) return [null, null];

      const parts = raw.split('_');

      return [
        parts[0] ? Number(parts[0]) : null,
        parts[1] ? Number(parts[1]) : null,
      ];
    },
    stringify: ([startDate, endDate]) => {
      if (startDate === null) return '';

      if (endDate === null) return startDate.toString();

      return [startDate, endDate].join('_');
    },
  });
};