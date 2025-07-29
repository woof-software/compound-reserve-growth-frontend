import { useCallback, useMemo, useState } from 'react';

export type TimeRange = '7B' | '30B' | '90B' | '180B';
export type BarSize = 'D' | 'W' | 'M';

const VALID_TIME_RANGES: TimeRange[] = ['7B', '30B', '90B', '180B'];
const VALID_BAR_SIZES: BarSize[] = ['D', 'W', 'M'];

interface UseChartControlsProps {
  initialTimeRange?: TimeRange;
  initialBarSize?: BarSize;
}

export const useChartControls = ({
  initialTimeRange = '7B',
  initialBarSize = 'D'
}: UseChartControlsProps = {}) => {
  const [activeTab, setActiveTab] = useState<TimeRange | null>(
    initialTimeRange
  );
  const [barSize, setBarSize] = useState<BarSize>(initialBarSize);

  const barCount = useMemo(() => {
    if (!activeTab) {
      return 0;
    }
    return parseInt(activeTab.replace('B', ''), 10);
  }, [activeTab]);

  const handleTabChange = useCallback((value: string) => {
    if (VALID_TIME_RANGES.includes(value as TimeRange)) {
      setActiveTab(value as TimeRange);
    }
  }, []);

  const handleBarSizeChange = useCallback((value: string) => {
    if (VALID_BAR_SIZES.includes(value as BarSize)) {
      setBarSize(value as BarSize);
    }
  }, []);

  const handleVisibleBarsChange = useCallback((count: number) => {
    const matchingTab = `${count}B` as TimeRange;
    if (VALID_TIME_RANGES.includes(matchingTab)) {
      setActiveTab(matchingTab);
    } else {
      setActiveTab(null);
    }
  }, []);

  const handleResetActiveTab = useCallback(() => {
    setActiveTab(null);
  }, [setActiveTab]);

  return {
    activeTab,
    barSize,
    barCount,
    handleTabChange,
    handleResetActiveTab,
    handleBarSizeChange,
    handleVisibleBarsChange
  };
};
