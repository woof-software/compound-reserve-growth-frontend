import { useEffect, useMemo } from 'react';
import { useQueryState } from 'nuqs';

import { ChartActions } from '@/components/Charts/ChartActions';
import { DropdownFilter } from '@/components/Filter/DropdownFilter/DropdownFilter';
import { Filters } from '@/components/Filter/Filters';
import { GroupFilter } from '@/components/Filter/GroupFilter';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import RevenueBreakdown, { FormattedRevenueData } from '@/components/RevenuePageTable/RevenueBreakdown';
import { RevenueProps } from '@/pages/AccountingPage/AccountingPage';
import { NOT_MARKET } from '@/shared/consts/consts';
import { useOptions } from '@/shared/hooks/filters/useOptions';
import { useModal } from '@/shared/hooks/useModal';
import { useProcessor } from '@/shared/hooks/useProcessor';
import { SortAccessor, SortAdapter, useSorting } from '@/shared/hooks/useSorting';
import { Format } from '@/shared/lib/utils/format';
import { capitalizeFirstLetter, parseStingsArray } from '@/shared/lib/utils/utils';
import Button from '@/shared/ui/Button/Button';
import Card from '@/shared/ui/Card/Card';
import CSVDownloadButton from '@/shared/ui/CSVDownloadButton/CSVDownloadButton';
import { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';
import Icon from '@/shared/ui/Icon/Icon';
import SortDrawer from '@/shared/ui/SortDrawer/SortDrawer';

const QUARTERS = [1, 2, 3, 4];

const RevenueBreakDownBlock = (props: RevenueProps) => {
  const { revenueData: rawData, isLoading, isError } = props;

  const { sortDirection, sortKey, onKeySelect, onTypeSelect } = useSorting<FormattedRevenueData>('asc', null);

  const sortType: SortAdapter<FormattedRevenueData> = {
    type: sortDirection,
    key: sortKey,
  };

  const { isOpen: isSortOpen, onOpenModal: onSortOpen, onCloseModal: onSortClose } = useModal();

  const [selectedChainKeys, setSelectedChainKeys] = useQueryState('rb-chain', parseStingsArray([]));
  const [selectedMarketKeys, setSelectedMarketKeys] = useQueryState('rb-deployment', parseStingsArray([]));
  const [selectedSourceKeys, setSelectedSourceKeys] = useQueryState('rb-source', parseStingsArray([]));
  const [selectedSymbolKeys, setSelectedSymbolKeys] = useQueryState('rb-symbol', parseStingsArray([]));
  const [selectedYearKey, setSelectedYearKey] = useQueryState('rb-year');

  const yearGroupOptions = useMemo(() => {
    if (!rawData?.length) {
      return [];
    }

    const years = new Set(rawData.map((item) => new Date(item.date * 1000).getFullYear().toString()));

    return Array.from(years)
      .sort((a, b) => Number(b) - Number(a))
      .map((year) => ({ label: year, value: year }));
  }, [rawData]);

  const selectedYearOption = useMemo(() => {
    if (!yearGroupOptions.length) {
      return { label: '', value: '' };
    }

    const key = selectedYearKey ?? yearGroupOptions[0].value;

    return yearGroupOptions.find(({ value }) => value === key) ?? yearGroupOptions[0];
  }, [yearGroupOptions, selectedYearKey]);

  const chainOptions = useMemo(
    () =>
      [...new Set(rawData.map((item) => item.source.network))].sort().map((value) => ({
        label: capitalizeFirstLetter(value),
        value,
      })),
    [rawData],
  );

  const { selectedOptions: selectedChainOptions, setSelectedOptions: setSelectedChainOptions } = useOptions(
    chainOptions,
    selectedChainKeys,
    setSelectedChainKeys,
  );

  const selectedChainOptionsSet = useMemo(
    () => new Set(selectedChainOptions.map(o => o.value)),
    [selectedChainOptions]
  );

  const byChain = useMemo(
    () =>
      !selectedChainOptions.length
        ? rawData
        : rawData.filter((item) => selectedChainOptionsSet.has(item.source.network)),
    [rawData, selectedChainOptions],
  );

  const marketOptions = useMemo(
    () =>
      [...new Set(byChain.map((item) => item.source.market ?? NOT_MARKET))].sort().map((value) => ({
        label: capitalizeFirstLetter(value),
        value,
      })),
    [byChain],
  );

  const { selectedOptions: selectedMarketOptions, setSelectedOptions: setSelectedMarketOptions } = useOptions(
    marketOptions,
    selectedMarketKeys,
    setSelectedMarketKeys,
  );

  const selectedMarketOptionsSet = useMemo(
    () => new Set(selectedMarketOptions.map(o => o.value)),
    [selectedMarketOptions]
  );

  const byChainAndMarket = useMemo(
    () =>
      !selectedMarketOptions.length
        ? byChain
        : byChain.filter((item) => selectedMarketOptionsSet.has(item.source.market ?? NOT_MARKET)),
    [byChain, selectedMarketOptions],
  );

  const sourceOptions = useMemo(
    () =>
      [...new Set(byChainAndMarket.map((item) => item.source.type))]
        .filter(Boolean)
        .sort()
        .map((value) => ({
          label: capitalizeFirstLetter(value),
          value,
        })),
    [byChainAndMarket],
  );

  const { selectedOptions: selectedSourceOptions, setSelectedOptions: setSelectedSourceOptions } = useOptions(
    sourceOptions,
    selectedSourceKeys,
    setSelectedSourceKeys,
  );

  const selectedSourceOptionsSet = useMemo(
    () => new Set(selectedSourceOptions.map(o => o.value)),
    [selectedSourceOptions]
  );

  const byChainMarketAndSource = useMemo(
    () =>
      !selectedSourceOptions.length
        ? byChainAndMarket
        : byChainAndMarket.filter((item) => selectedSourceOptionsSet.has(item.source.type)),
    [byChainAndMarket, selectedSourceOptions],
  );

  const symbolOptions = useMemo(
    () =>
      [...new Set(byChainMarketAndSource.map((item) => item.source.asset.symbol))]
        .filter(Boolean)
        .sort()
        .map((value) => ({
          label: capitalizeFirstLetter(value),
          value,
        })),
    [byChainMarketAndSource],
  );

  const { selectedOptions: selectedSymbolOptions, setSelectedOptions: setSelectedSymbolOptions } = useOptions(
    symbolOptions,
    selectedSymbolKeys,
    setSelectedSymbolKeys,
  );

  const selectedSymbolOptionsSet = useMemo(
    () => new Set(selectedSymbolOptions.map(o => o.value)),
    [selectedSymbolOptions]
  );

  useEffect(() => {
    const prune = (options: { value: string }[], keys: string[], setKeys: (v: string[]) => void) => {
      const valid = new Set(options.map((o) => o.value));
      const next = keys.filter((key) => valid.has(key));
      if (next.length !== keys.length) {
        setKeys(next);
      }
    };

    prune(marketOptions, selectedMarketKeys, setSelectedMarketKeys);
    prune(sourceOptions, selectedSourceKeys, setSelectedSourceKeys);
    prune(symbolOptions, selectedSymbolKeys, setSelectedSymbolKeys);
  }, [
    marketOptions,
    sourceOptions,
    symbolOptions,
    selectedMarketKeys,
    selectedSourceKeys,
    selectedSymbolKeys,
    setSelectedMarketKeys,
    setSelectedSourceKeys,
    setSelectedSymbolKeys,
  ]);

  const yearToDisplay = selectedYearOption.value;

  const tableContext = useMemo(
    () => {
      return {
        yearToDisplay,
        showMarketColumn: selectedMarketOptions.length > 0,
        showSourceColumn: selectedSourceOptions.length > 0,
        showReserveAssetColumn: selectedSymbolOptions.length > 0,
      };
    },
    [yearToDisplay, selectedMarketOptions.length, selectedSourceOptions.length, selectedSymbolOptions.length],
  );

  const { result: groupedData } = useProcessor({
    array: rawData ?? [],
    filters: [
      (v) => !selectedChainOptions.length || selectedChainOptionsSet.has(v.source.network),
      (v) =>
        !selectedMarketOptions.length || selectedMarketOptionsSet.has(v.source.market ?? NOT_MARKET),
      (v) => !selectedSourceOptions.length || selectedSourceOptionsSet.has(v.source.type),
      (v) => !selectedSymbolOptions.length || selectedSymbolOptionsSet.has(v.source.asset.symbol),
      (v) => !yearToDisplay || new Date(v.date * 1000).getFullYear().toString() === yearToDisplay,
    ],
    transformer: () => {
      const grouped: Record<string, FormattedRevenueData> = {};

      return (item) => {
        const marketValue = item.source.market || NOT_MARKET;
        const keyParts = [item.source.network];

        if (tableContext.showMarketColumn) keyParts.push(marketValue);
        if (tableContext.showSourceColumn) keyParts.push(item.source.type);
        if (tableContext.showReserveAssetColumn) keyParts.push(item.source.asset.symbol);

        const groupKey = keyParts.join('-');
        const { yearToDisplay } = tableContext;

        if (!grouped[groupKey]) {
          const row: FormattedRevenueData = {
            chain: capitalizeFirstLetter(item.source.network),
            market: marketValue,
            source: item.source.type,
            reserveAsset: item.source.asset.symbol,
          };

          QUARTERS.forEach((quarter) => {
            row[`q${quarter}_${yearToDisplay}`] = 0;
          });

          grouped[groupKey] = row;
        }

        const date = new Date(item.date * 1000);
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        const quarterKey = `q${quarter}_${yearToDisplay}`;
        (grouped[groupKey][quarterKey] as number) += item.value;
        return grouped;
      };
    },
  });

  const dynamicColumns = useMemo(() => {
    if (!tableContext.yearToDisplay) {
      return [];
    }

    const { yearToDisplay } = tableContext;
    const columns: ExtendedColumnDef<FormattedRevenueData>[] = [
      { accessorKey: 'chain', header: 'Chain' }
    ];

    if (tableContext.showMarketColumn) {
      columns.push({ accessorKey: 'market', header: 'Market' });
    }

    if (tableContext.showSourceColumn) {
      columns.push({ accessorKey: 'source', header: 'Source' });
    }

    if (tableContext.showReserveAssetColumn) {
      columns.push({ accessorKey: 'reserveAsset', header: 'Reserve Asset' });
    }

    QUARTERS.forEach((quarter) => {
      columns.push({
        accessorKey: `q${quarter}_${yearToDisplay}`,
        header: `Q${quarter} ${yearToDisplay}`,
        cell: ({ getValue }) => Format.price(Number(getValue()), 'standard')
      });
    });

    return columns;
  }, [tableContext]);

  const tableData = useMemo(() => Object.values(groupedData ?? {}), [groupedData]);

  const revenueBreakdownColumns: SortAccessor<FormattedRevenueData>[] = useMemo(
    () =>
      dynamicColumns.map((column) => ({
        accessorKey: String(column.accessorKey),
        header: typeof column.header === 'string' ? column.header : '',
      })),
    [dynamicColumns],
  );

  const clearAllFilters = () => {
    setSelectedChainKeys([]);
    setSelectedMarketKeys([]);
    setSelectedSourceKeys([]);
    setSelectedSymbolKeys([]);
  };

  const isAnyFiltersSelected =
    selectedChainOptions.length > 0 ||
    selectedMarketOptions.length > 0 ||
    selectedSourceOptions.length > 0 ||
    selectedSymbolOptions.length > 0;

  const hasData = tableData.length > 0;

  const noDataMessage = isAnyFiltersSelected ? 'No data for selected filters' : 'No data available';

  const csvFilename = `Revenue Breakdown ${yearToDisplay}.csv`;

  return (
    <Card
      title='Revenue Breakdown'
      id='revenue-breakdown'
      isLoading={isLoading}
      isError={isError}
      className={{
        loading: 'min-h-[inherit]',
        container: 'border-background min-h-[571px] border',
        content: 'flex flex-col gap-3 p-0 px-0 pb-5 md:px-5 lg:pb-10',
      }}
    >
      <div className='flex flex-col gap-2 px-5 py-3 md:px-0 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end lg:flex-nowrap lg:gap-1.5'>
        <div className='flex w-full gap-2 max-sm:flex sm:contents lg:flex lg:w-auto lg:items-center lg:gap-1.5'>
          <div className='min-w-0 flex-1 sm:flex-none max-sm:[&_button]:w-full max-sm:[&_button]:min-w-0 lg:order-2 lg:flex-none'>
            <GroupFilter
              options={yearGroupOptions}
              getKey={(v) => v.value}
              getLabel={(v) => v.label}
              value={selectedYearOption}
              setValue={({ value }) => setSelectedYearKey(value)}
            />
          </div>
          <div className='min-w-0 flex-1 sm:flex-none lg:order-1 lg:flex lg:flex-nowrap lg:items-center lg:gap-1.5 max-sm:[&_button]:w-full max-sm:[&_button]:min-w-0'>
            <Filters onClearAll={clearAllFilters} isShowClear={isAnyFiltersSelected}>
              <DropdownFilter
                triggerLabel='Chain'
                options={chainOptions}
                selectedOptions={selectedChainOptions}
                getKey={(v) => v.value}
                getLabel={(v) => v.label}
                setValue={setSelectedChainOptions}
              />
              <DropdownFilter
                triggerLabel='Market'
                options={marketOptions}
                selectedOptions={selectedMarketOptions}
                getKey={(v) => v.value}
                getLabel={(v) => v.label}
                setValue={setSelectedMarketOptions}
              />
              <DropdownFilter
                triggerLabel='Source'
                options={sourceOptions}
                selectedOptions={selectedSourceOptions}
                getKey={(v) => v.value}
                getLabel={(v) => v.label}
                setValue={setSelectedSourceOptions}
              />
              <DropdownFilter
                triggerLabel='Reserve Symbols'
                options={symbolOptions}
                selectedOptions={selectedSymbolOptions}
                getKey={(v) => v.value}
                getLabel={(v) => v.label}
                setValue={setSelectedSymbolOptions}
              />
            </Filters>
          </div>
        </div>
        <div className='flex w-full gap-2 sm:contents'>
          <div className='min-w-0 flex-1 sm:flex-none max-sm:[&_button]:w-full max-sm:[&_button]:min-w-0'>
            <Button
              onClick={onSortOpen}
              className='bg-secondary-27 text-gray-11 shadow-13 flex h-9 w-full min-w-0 gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold sm:min-w-[130px] sm:w-auto md:h-8 lg:hidden'
            >
              <Icon name='sort-icon' className='h-[14px] w-[14px]' />
              Sort
            </Button>
          </div>
          <div className='shrink-0 sm:flex-none'>
            <ChartActions mobileChildren={
              <CSVDownloadButton
                data={tableData}
                filename={csvFilename}
              />
            }>
              <CSVDownloadButton
                data={tableData}
                filename={csvFilename}
              />
            </ChartActions>
          </div>
        </div>
      </div>
      {hasData ? (
        <RevenueBreakdown
          data={tableData}
          columns={dynamicColumns}
          sortType={sortType}
        />
      ) : (
        <NoDataPlaceholder
          onButtonClick={clearAllFilters}
          text={noDataMessage}
        />
      )}
      <SortDrawer
        isOpen={isSortOpen}
        sortType={sortType}
        columns={revenueBreakdownColumns}
        onClose={onSortClose}
        onKeySelect={onKeySelect}
        onTypeSelect={onTypeSelect}
      />
    </Card>
  );
};

export default RevenueBreakDownBlock;
