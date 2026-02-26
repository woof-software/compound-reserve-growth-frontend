import { useCallback, useEffect, useState } from 'react';

import {
  getFinerBarSize,
  getMaxBarSizeForRange
} from '@/shared/lib/utils/chart';

export type BarSize = 'D' | 'W' | 'M';

const VALID_BAR_SIZES: BarSize[] = ['D', 'W', 'M'];

export interface DateRangeForBarSize {
  startDate: string;
  endDate: string;
}

interface UseChartControlsProps {
  initialBarSize?: BarSize;
  /** When set, bar size is auto-downscaled if the range is too small for the current size. */
  dateRange?: DateRangeForBarSize;
}

export const useChartControls = ({
  initialBarSize = 'D',
  dateRange
}: UseChartControlsProps = {}) => {
  const [barSize, setBarSize] = useState<BarSize>(initialBarSize);

  const onBarSizeChange = useCallback((value: string) => {
    if (VALID_BAR_SIZES.includes(value as BarSize)) {
      setBarSize(value as BarSize);
    }
  }, []);

  useEffect(() => {
    if (!dateRange?.startDate || !dateRange?.endDate) return;

    const maxBarSize = getMaxBarSizeForRange(
      dateRange.startDate,
      dateRange.endDate
    );
    const effectiveBarSize = getFinerBarSize(barSize, maxBarSize);
    if (effectiveBarSize !== barSize) {
      setBarSize(effectiveBarSize);
    }
  }, [dateRange?.startDate, dateRange?.endDate, barSize]);

  return {
    barSize,
    onBarSizeChange
  };
};
