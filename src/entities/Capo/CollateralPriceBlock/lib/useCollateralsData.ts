import { useMemo } from 'react';

import { capitalizeFirstLetter } from '@/shared/lib/utils/utils';
import { CapoTableItem } from '@/shared/types/Capo/types';

interface UseCollateralsDataProps {
  tableData: CapoTableItem[];
  applyFilters: (data: CapoTableItem[]) => CapoTableItem[];
  applySorting: (data: any[]) => any[];
}

const transformTableData = (data: CapoTableItem[]): CapoTableItem[] =>
  data.map((item) => ({
    network: capitalizeFirstLetter(item.network),
    collateral: item.collateral,
    collateralPrice: item.collateralPrice,
    priceRestriction: item.priceRestriction,
    priceFeed: item.priceFeed,
    priceBuffer: Number(item.priceRestriction) - Number(item.collateralPrice),
    oracleName: item.oracleName
  }));

export const useCollateralsData = ({
  tableData,
  applyFilters,
  applySorting
}: UseCollateralsDataProps) => {
  return useMemo(() => {
    const filtered = applyFilters(tableData);
    const transformed = transformTableData(filtered);

    return applySorting(transformed);
  }, [tableData, applyFilters, applySorting]);
};
