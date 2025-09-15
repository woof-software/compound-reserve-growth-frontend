import { useCallback, useState } from 'react';

import { BarSize } from '@/shared/types';

const VALID_BAR_SIZES: BarSize[] = ['D', 'W', 'M'];

interface UseChartControlsProps {
  initialBarSize?: BarSize;
}

export const useChartControls = ({
  initialBarSize = 'D'
}: UseChartControlsProps = {}) => {
  const [barSize, setBarSize] = useState<BarSize>(initialBarSize);

  const onBarSizeChange = useCallback((value: string) => {
    if (VALID_BAR_SIZES.includes(value as BarSize)) {
      setBarSize(value as BarSize);
    }
  }, []);

  return {
    barSize,
    onBarSizeChange
  };
};
