import { useMemo } from 'react';
import { useQueryState } from 'nuqs';

import { ChartActions } from '@/components/Charts/ChartActions';
import { DropdownFilter } from '@/components/Filter/DropdownFilter/DropdownFilter';
import { Filters } from '@/components/Filter/Filters';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import CollateralsPriceTable from '@/entities/Capo/CollateralPriceBlock/CollateralsPriceTable';
import { useOptions } from '@/shared/hooks/filters/useOptions';
import { useModal } from '@/shared/hooks/useModal';
import { useProcessor } from '@/shared/hooks/useProcessor';
import { SortAccessor, SortAdapter, useSorting } from '@/shared/hooks/useSorting';
import { capitalizeFirstLetter, parseStingsArray } from '@/shared/lib/utils/utils';
import { CapoTableItem } from '@/shared/types/Capo/types';
import Button from '@/shared/ui/Button/Button';
import Card from '@/shared/ui/Card/Card';
import CSVDownloadButton from '@/shared/ui/CSVDownloadButton/CSVDownloadButton';
import Icon from '@/shared/ui/Icon/Icon';
import SortDrawer from '@/shared/ui/SortDrawer/SortDrawer';

const CARD_CLASS_NAMES = {
  loading: 'min-h-[565px]',
  container: 'overflow-visible rounded-lg',
  content: 'rounded-b-lg px-0 pt-0 pb-0 lg:px-10 lg:pb-10',
  header: 'rounded-t-lg'
};

export interface CollateralsPriceBlockProps {
  isLoading?: boolean;
  isError?: boolean;
  tableData: CapoTableItem[];
}

const SORT_COLUMNS: SortAccessor<CapoTableItem>[] = [
  { accessorKey: 'network', header: 'Network' },
  { accessorKey: 'collateral', header: 'Collateral' },
  { accessorKey: 'collateralPrice', header: 'Collateral Price' },
  { accessorKey: 'priceRestriction', header: 'Price Restriction' },
  { accessorKey: 'priceBuffer', header: 'Price Buffer' },
  { accessorKey: 'priceFeed', header: 'Price Feed' }
];

const CapoCollateralsPriceBlock = ({
   isLoading = false,
   isError = false,
   tableData
  }: CollateralsPriceBlockProps) => {
  const [selectedChainKeys, setSelectedChainKeys] = useQueryState('cpapr-chain', parseStingsArray([]));
  const [selectedCollateralKeys, setSelectedCollateralKeys] = useQueryState('cpapr-collateral', parseStingsArray([]));

  const clearAllFilters = () => {
    setSelectedChainKeys([]);
    setSelectedCollateralKeys([]);
  };

  const { isOpen: isSortOpen, onOpenModal: onSortOpen, onCloseModal: onSortClose } = useModal();

  const chainOptions = useMemo(() => (
    [...new Set(tableData.map((item) => item.network))]
      .map((network) => ({ label: capitalizeFirstLetter(network), value: network }))
  ), [tableData]);

  const { selectedOptions: selectedChainOptions, setSelectedOptions: setSelectedChainOptions } =
    useOptions(chainOptions, selectedChainKeys, setSelectedChainKeys);

  const selectedChainOptionsSet = useMemo(
    () => new Set(selectedChainOptions.map(o => o.value)),
    [selectedChainOptions]
  );

  const byChain = useMemo(() => (
    !selectedChainOptions.length
      ? tableData
      : tableData.filter((item) => selectedChainOptionsSet.has(item.network))
  ), [tableData, selectedChainOptions]);

  const collateralOptions = useMemo(() => (
    [...new Set(byChain.map((item) => item.collateral))]
      .map((collateral) => ({ label: collateral, value: collateral }))
  ), [byChain]);

  const { selectedOptions: selectedCollateralOptions, setSelectedOptions: setSelectedCollateralOptions } =
    useOptions(collateralOptions, selectedCollateralKeys, setSelectedCollateralKeys);

  const selectedCollateralOptionsSet = useMemo(
    () => new Set(selectedCollateralOptions.map(o => o.value)),
    [selectedCollateralOptions]
  );

  const { result } = useProcessor({
    array: tableData,
    filters: [
      (v) => !selectedChainOptions.length || selectedChainOptionsSet.has(v.network),
      (v) => !selectedCollateralOptions.length || selectedCollateralOptionsSet.has(v.collateral),
    ],
    transformer: () => {
      const processed: CapoTableItem[] = [];

      return (item: CapoTableItem) => {
        processed.push({
          ...item,
          network: capitalizeFirstLetter(item.network),
          priceBuffer: Number(item.priceRestriction) - Number(item.collateralPrice),
        });

        return processed;
      };
    },
  });

  const processedData = result ?? [];

  const { sortDirection, sortKey, onKeySelect, onTypeSelect } =
    useSorting<CapoTableItem>('desc', 'priceBuffer');

  const sortType: SortAdapter<CapoTableItem> = { type: sortDirection, key: sortKey };

  const isAnyFilterSelected = !!selectedChainOptions.length || !!selectedCollateralOptions.length;

  return (
    <Card
      isError={isError}
      isLoading={isLoading}
      title='Collaterals Price against Price Restriction'
      id='collaterals-price-against-price-restriction'
      className={CARD_CLASS_NAMES}
    >
      <div className={'flex items-center justify-end gap-2 py-3 px-5 md:px-5 lg:px-0'}>
        <Filters isShowClear={isAnyFilterSelected} onClearAll={clearAllFilters}>
          <DropdownFilter
            triggerLabel='Chain'
            options={chainOptions}
            selectedOptions={selectedChainOptions}
            getKey={(v) => v.value}
            getLabel={(v) => v.label}
            setValue={setSelectedChainOptions}
          />
          <DropdownFilter
            triggerLabel='Collateral'
            options={collateralOptions}
            selectedOptions={selectedCollateralOptions}
            getKey={(v) => v.value}
            getLabel={(v) => v.label}
            setValue={setSelectedCollateralOptions}
          />
        </Filters>
        <Button
          onClick={onSortOpen}
          className='bg-secondary-27 text-gray-11 shadow-13 grow sm:max-w-32.5 flex h-9 min-w-32.5 gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold md:h-8 lg:hidden'
        >
          <Icon name='sort-icon' className='h-3.5 w-3.5' />
          Sort
        </Button>
        <SortDrawer
          isOpen={isSortOpen}
          sortType={sortType}
          columns={SORT_COLUMNS}
          onClose={onSortClose}
          onKeySelect={onKeySelect}
          onTypeSelect={onTypeSelect}
        />
        <ChartActions
          mobileChildren={
            <CSVDownloadButton data={processedData} filename='collaterals_price_against_price_restriction' />
          }
        >
          <CSVDownloadButton data={processedData} filename='collaterals_price_against_price_restriction' />
        </ChartActions>
      </div>
      {!isLoading && !isError && (
        processedData.length ? (
          <CollateralsPriceTable
            sortType={sortType}
            tableData={processedData}
          />
        ) : (
          <NoDataPlaceholder
            text={!isAnyFilterSelected ? 'No data found' : undefined}
            hideButton={!isAnyFilterSelected}
            onButtonClick={clearAllFilters}
          />
        )
      )}
    </Card>
  );
};

export default CapoCollateralsPriceBlock;