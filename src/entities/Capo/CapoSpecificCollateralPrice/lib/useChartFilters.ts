import { useState } from 'react';

import { NormalizedChartData } from '@/shared/types/Capo/types';

type Option = {
  id: string;
  label: string;
};

const capitalizeFirstLetter = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1);

const getOptions = <T extends Array<any>>(arr: T, key: string) => {
  return [...new Set(arr.map((item) => item[key]))]
    .map((item) => ({
      id: item,
      label: capitalizeFirstLetter(item)
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

export const useChartFilters = (rawData: NormalizedChartData[]) => {
  const [selectedChain, setSelectedChain] = useState<Option | null>(null);
  const [selectedCollateral, setSelectedCollateral] = useState<Option | null>(
    null
  );

  const chainOptions = getOptions(rawData, 'network');
  const collateralOptions = getOptions(rawData, 'collateral');

  const filteredData = rawData.filter((item) => {
    const matchesChain = !selectedChain || item.network === selectedChain?.id;
    const matchesCollateral =
      !selectedCollateral || item.collateral === selectedCollateral?.id;
    return matchesChain && matchesCollateral;
  });

  const groupBy = (): string => {
    if (selectedChain && selectedCollateral) return 'both';
    if (selectedChain) return 'chain';
    if (selectedCollateral) return 'collateral';
    return 'none';
  };

  console.log(filteredData);

  return {
    selectedChain,
    setSelectedChain,
    selectedCollateral,
    setSelectedCollateral,
    chainOptions,
    collateralOptions,
    filteredData,
    groupBy
  };
};
