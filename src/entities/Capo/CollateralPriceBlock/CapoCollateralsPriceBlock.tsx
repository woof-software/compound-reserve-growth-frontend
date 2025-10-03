import React, { useCallback } from 'react';

import CollateralsPriceTable from '@/components/CapoPageTable/CollateralsPriceTable';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import { DesktopFilters } from '@/entities/Capo/CollateralPriceBlock/filters/CollateralDesktopFilters';
import { MobileFilters } from '@/entities/Capo/CollateralPriceBlock/filters/CollateralMobileFilters';
import { useCollateralsFilters } from '@/entities/Capo/CollateralPriceBlock/filters/useCollateralsFilters';
import { useCollateralsData } from '@/entities/Capo/CollateralPriceBlock/lib/useCollateralsData';
import { useCollateralsSort } from '@/entities/Capo/CollateralPriceBlock/lib/useCollateralsSort';
import { TableItem } from '@/shared/types/Capo/types';
import Card from '@/shared/ui/Card/Card';
import View from '@/shared/ui/View/View';

export const SORT_COLUMNS = [
  { accessorKey: 'network', header: 'Network' },
  { accessorKey: 'collateral', header: 'Collateral' },
  { accessorKey: 'collateralPrice', header: 'Collateral Price' },
  { accessorKey: 'priceRestriction', header: 'Price Restriction' },
  { accessorKey: 'priceFeed', header: 'Price Feed' }
];

export const CARD_CLASS_NAMES = {
  loading: 'min-h-[inherit]',
  container: 'min-h-[427px] overflow-visible rounded-lg lg:min-h-[458.5px]',
  content: 'rounded-b-lg px-0 pt-0 pb-0 lg:px-10 lg:pb-10',
  header: 'rounded-t-lg'
};

export interface CollateralsPriceBlockProps {
  isLoading?: boolean;
  isError?: boolean;
  tableData: TableItem[];
}

const CapoCollateralsPriceBlock = ({
  isLoading = false,
  isError = false,
  tableData
}: CollateralsPriceBlockProps) => {
  const {
    selectedOptions,
    filterOptions,
    chainOptions,
    collateralOptions,
    onSelectChain,
    onSelectCollateral,
    onClearSelectedOptions,
    applyFilters
  } = useCollateralsFilters(tableData);

  const { sortType, onKeySelect, onTypeSelect, onClearSort, applySorting } =
    useCollateralsSort();

  const processedData = useCollateralsData({
    tableData,
    applyFilters,
    applySorting
  });

  const onClearAll = useCallback(() => {
    onClearSelectedOptions();
    onClearSort();
  }, [onClearSelectedOptions, onClearSort]);

  const isFiltersApplied = !!(
    selectedOptions.chain.length || selectedOptions.collateral.length
  );

  return (
    <Card
      isError={isError}
      isLoading={isLoading}
      title='Collaterals Price against Price Restriction'
      id='collaterals-price-against-price-restriction'
      className={CARD_CLASS_NAMES}
    >
      <DesktopFilters
        chainOptions={chainOptions || []}
        collateralOptions={collateralOptions || []}
        selectedChain={selectedOptions.chain}
        selectedCollateral={selectedOptions.collateral}
        onSelectChain={onSelectChain}
        onSelectCollateral={onSelectCollateral}
        csvData={processedData}
        isLoading={isLoading}
      />
      <MobileFilters
        filterOptions={filterOptions}
        sortColumns={SORT_COLUMNS}
        sortType={sortType}
        onKeySelect={onKeySelect}
        onTypeSelect={onTypeSelect}
        onClearAll={onClearAll}
        csvData={processedData}
      />
      <View.Condition if={processedData.length}>
        <CollateralsPriceTable
          sortType={sortType}
          tableData={processedData}
        />
      </View.Condition>
      <View.Condition if={!processedData.length}>
        <NoDataPlaceholder
          text={!isFiltersApplied ? 'No data found' : undefined}
          hideButton={!isFiltersApplied}
          onButtonClick={onClearAll}
        />
      </View.Condition>
    </Card>
  );
};

export default CapoCollateralsPriceBlock;
