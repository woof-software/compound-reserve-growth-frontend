import { useEffect, useState } from 'react';

import { capitalizeFirstLetter } from '@/shared/lib/utils/utils';
import { CapoNormalizedChartData } from '@/shared/types/Capo/types';

export type Option = {
  id: string;
  label: string;
};

export type OptionSetter = (previous: Option | null) => Option | null;

const getOptions = <T extends Array<any>>(
  arr: T,
  key: string,
  transformLabelCb?: (label: string) => string
) => {
  return [...new Set(arr.map((item) => item[key]))]
    .map((item) => ({
      id: item,
      label: transformLabelCb ? transformLabelCb(item) : item
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

const findOptionById = (
  options: Option[],
  id: string | null
): Option | null => {
  if (!id) return null;
  return options.find((opt) => opt.id === id) || null;
};

export const useChartFilters = (rawData: CapoNormalizedChartData[]) => {
  const [selectedChain, setSelectedChain] = useState<Option | null>(null);
  const [selectedCollateral, setSelectedCollateral] = useState<Option | null>(
    null
  );

  const chainOptions = getOptions(rawData, 'network', capitalizeFirstLetter);

  const collateralOptions = getOptions(
    rawData.filter(({ network }) => {
      if (!selectedChain) return true;

      return network === selectedChain.id;
    }),
    'collateral'
  );

  const setSelectedChainWrapper = (
    value: Option | null | string | OptionSetter
  ) => {
    if (!value) {
      setSelectedChain(null);
      return;
    }

    if (typeof value === 'string') {
      const option = findOptionById(chainOptions, value);
      if (option) {
        setSelectedChain(option);
      } else if (chainOptions.length === 0) {
        setPendingChainId(value);
      }
    } else {
      setSelectedChain(value);
    }
  };

  const setSelectedCollateralWrapper = (
    value: Option | null | string | OptionSetter
  ) => {
    if (!value) {
      setSelectedCollateral(null);
      return;
    }

    if (typeof value === 'string') {
      const option = findOptionById(collateralOptions, value);
      if (option) {
        setSelectedCollateral(option);
      } else if (collateralOptions.length === 0) {
        setPendingCollateralId(value);
      }
    } else {
      setSelectedCollateral(value);
    }
  };

  const [pendingChainId, setPendingChainId] = useState<string | null>(null);
  const [pendingCollateralId, setPendingCollateralId] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (chainOptions.length > 0 && pendingChainId && !selectedChain) {
      const option = findOptionById(chainOptions, pendingChainId);
      if (option) {
        setSelectedChain(option);
        setPendingChainId(null);
      }
    }
  }, [chainOptions, pendingChainId, selectedChain]);

  useEffect(() => {
    if (
      collateralOptions.length > 0 &&
      pendingCollateralId &&
      !selectedCollateral
    ) {
      const option = findOptionById(collateralOptions, pendingCollateralId);
      if (option) {
        setSelectedCollateral(option);
        setPendingCollateralId(null);
      }
    }
  }, [collateralOptions, pendingCollateralId, selectedCollateral]);

  const filteredData =
    !selectedChain && !selectedCollateral
      ? []
      : rawData.filter((item) => {
          const matchesChain =
            !selectedChain || item.network === selectedChain?.id;
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

  return {
    selectedChain,
    setSelectedChain: setSelectedChainWrapper,
    selectedCollateral,
    setSelectedCollateral: setSelectedCollateralWrapper,
    chainOptions,
    collateralOptions,
    filteredData,
    groupBy
  };
};
