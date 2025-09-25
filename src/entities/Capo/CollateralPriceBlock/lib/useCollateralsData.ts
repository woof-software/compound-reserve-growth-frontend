import { useMemo } from 'react';

import { capitalizeFirstLetter } from '@/shared/lib/utils/utils';
import { TableItem } from '@/shared/types/Capo/types';

interface UseCollateralsDataProps {
  tableData: TableItem[];
  applyFilters: (data: TableItem[]) => TableItem[];
  applySorting: (data: any[]) => any[];
}

const transformTableData = (data: TableItem[]): TableItem[] =>
  data.map((item) => ({
    network: capitalizeFirstLetter(item.network),
    collateral: item.collateral,
    collateralPrice: item.collateralPrice,
    priceRestriction: item.priceRestriction,
    priceFeed: item.priceFeed,
    oracleName: item.oracleName
  }));

export const useCollateralsData = ({
  tableData,
  applyFilters,
  applySorting
}: UseCollateralsDataProps) => {
  const processedData = useMemo(() => {
    const filtered = applyFilters(tableData);
    const transformed = transformTableData(filtered);

    return applySorting(transformed);
  }, [tableData, applyFilters, applySorting]);

  const hasData = tableData.length > 0;
  const showNoData = tableData.length === 0;

  return {
    processedData,
    hasData,
    showNoData
  };
};
