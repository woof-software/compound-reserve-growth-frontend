import { useCallback, useState } from 'react';

import { BAR_SIZE, BAR_SIZE_OPTIONS, BarSize } from '@/shared/types/types';

interface UseChartControlsProps {
  initialBarSize?: BarSize;
}

export const useChartControls = ({
  initialBarSize = BAR_SIZE.D
}: UseChartControlsProps = {}) => {
  const [barSize, setBarSize] = useState<BarSize>(initialBarSize);

  const onBarSizeChange = useCallback((value: string) => {
    if (BAR_SIZE_OPTIONS.includes(value as BarSize)) {
      setBarSize(value as BarSize);
    }
  }, []);

  return {
    barSize,
    onBarSizeChange
  };
};
