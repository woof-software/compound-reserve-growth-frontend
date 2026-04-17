import { useEffect, useMemo } from 'react';

import { useChartControls } from '@/shared/hooks/useChartControls';
import { getMaxBarSizeForRange } from '@/shared/lib/date/dateUtils';
import { BAR_SIZE, BAR_SIZE_OPTIONS } from '@/shared/types/types';

const BAR_SIZE_ORDER = {
  [BAR_SIZE.D]: 0,
  [BAR_SIZE.W]: 1,
  [BAR_SIZE.M]: 2
} as const;

export const useBarSizeWithDateRange = (dateRange: { startDate: number | null; endDate: number | null }) => {
  const { barSize, onBarSizeChange } = useChartControls({ initialBarSize: BAR_SIZE.D });

  const maxBarSize = useMemo<BAR_SIZE>(() => {
    const { startDate, endDate } = dateRange;
    if (startDate === null || endDate === null) return BAR_SIZE.M;
    return getMaxBarSizeForRange(startDate, endDate);
  }, [dateRange]);

  const disabledBarSizes = useMemo<BAR_SIZE[]>(
    () => BAR_SIZE_OPTIONS.filter(size => BAR_SIZE_ORDER[size] > BAR_SIZE_ORDER[maxBarSize]),
    [maxBarSize]
  );

  useEffect(() => {
    if (BAR_SIZE_ORDER[barSize] > BAR_SIZE_ORDER[maxBarSize]) {
      onBarSizeChange(maxBarSize);
    }
  }, [maxBarSize]);

  return { barSize, onBarSizeChange, disabledBarSizes };
};