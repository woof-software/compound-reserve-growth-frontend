import { useCallback, useState } from 'react';

import { BAR_SIZE, BAR_SIZE_OPTIONS } from '@/shared/types/types';

interface UseChartControlsProps {
  initialBarSize?: BAR_SIZE;
}

export const useChartControls = ({
  initialBarSize = BAR_SIZE.D
}: UseChartControlsProps = {}) => {
  const [barSize, setBarSize] = useState<BAR_SIZE>(initialBarSize);

  const onBarSizeChange = useCallback((value: string) => {
    if (BAR_SIZE_OPTIONS.includes(value as BAR_SIZE)) {
      setBarSize(value as BAR_SIZE);
    }
  }, []);

  return {
    barSize,
    onBarSizeChange
  };
};
