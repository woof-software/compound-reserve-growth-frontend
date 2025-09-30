import { useState } from 'react';

import { NormalizedChartData } from '@/shared/types/Capo/types';

export const useChartFilters = (rawData: NormalizedChartData[]) => {
  const [selectedChain, setSelectedChain] = useState<string>('');
  const [selectedCollateral, setSelectedCollateral] = useState<string>('');
  const [isChainDropdownOpen, setIsChainDropdownOpen] = useState(false);
  const [isCollateralDropdownOpen, setIsCollateralDropdownOpen] =
    useState(false);

  const chainOptions = [...new Set(rawData.map((item) => item.network))];
  const collateralOptions = [
    ...new Set(rawData.map((item) => item.collateral))
  ];

  const filteredData = rawData.filter((item) => {
    const matchesChain = !selectedChain || item.network === selectedChain;
    const matchesCollateral =
      !selectedCollateral || item.collateral === selectedCollateral;
    return matchesChain && matchesCollateral;
  });

  const groupBy = (): string => {
    if (selectedChain && selectedCollateral) return 'both';
    if (selectedChain) return 'chain';
    if (selectedCollateral) return 'collateral';
    return 'none';
  };

  return {
    selectedChain,
    setSelectedChain,
    selectedCollateral,
    setSelectedCollateral,
    isChainDropdownOpen,
    setIsChainDropdownOpen,
    isCollateralDropdownOpen,
    setIsCollateralDropdownOpen,
    chainOptions,
    collateralOptions,
    filteredData,
    groupBy
  };
};
