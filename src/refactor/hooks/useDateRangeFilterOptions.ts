import { DateRangeValue } from '@/shared/ui/DateRangePicker/types';

import { useUrlFilterSync } from './useUrlFilterSync';

export const useDateRangeFilterOptions = (key: string) => {
  const { selectedValues, setSelectedValues } = useUrlFilterSync(key, 'range');

  const dateRange: DateRangeValue = {
    startDate: selectedValues[0] ? Number(selectedValues[0]) : null,
    endDate: selectedValues[1] ? Number(selectedValues[1]) : null,
  };

  const setDateRange = (next: DateRangeValue) => {
    setSelectedValues([
      next.startDate !== null ? String(next.startDate) : '',
      next.endDate !== null ? String(next.endDate) : '',
    ]);
  };

  const clearDateRange = () => setSelectedValues(['', '']);

  const hasActiveDateRange = dateRange.startDate !== null || dateRange.endDate !== null;

  return { dateRange, setDateRange, clearDateRange, hasActiveDateRange } as const;
};