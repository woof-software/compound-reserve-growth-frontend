import { useUrlSync } from '@/refactor/hooks/useUrlFilterSync'

export type DateRange = [number | null, number | null];

export function useUrlSyncDateRange(key: string, value: DateRange) {
  return useUrlSync<[number | null, number | null]>(key, value, {
    parse: (val: string) => {
      const parsedValue = JSON.parse(val)

      return [
        typeof parsedValue[0] === 'number' ? parsedValue[0] : null,
        typeof parsedValue[1] === 'number' ? parsedValue[1] : null,
      ]
    },
    stringify: ([startDate, endDate]) => {
      if (startDate === null) return '';

      if (endDate === null) return JSON.stringify([startDate]);

      return JSON.stringify([startDate, endDate]);
    }
  });
}