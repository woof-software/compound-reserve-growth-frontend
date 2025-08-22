import React, { useCallback, useMemo, useReducer } from 'react';

import CSVDownloadButton from '@/components/CSVDownloadButton/CSVDownloadButton';
import Filter from '@/components/Filter/Filter';
import { MultiSelect } from '@/components/MultiSelect/MultiSelect';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import RevenueBreakdown, {
  FormattedRevenueData
} from '@/components/RevenuePageTable/RevenueBreakdown';
import SingleDropdown, {
  SingleDrawer
} from '@/components/SingleDropdown/SingleDropdown';
import SortDrawer from '@/components/SortDrawer/SortDrawer';
import { useModal } from '@/shared/hooks/useModal';
import { RevenuePageProps } from '@/shared/hooks/useRevenue';
import {
  capitalizeFirstLetter,
  extractFilterOptions,
  formatNumber
} from '@/shared/lib/utils/utils';
import { OptionType } from '@/shared/types/types';
import Button from '@/shared/ui/Button/Button';
import Card from '@/shared/ui/Card/Card';
import { ExtendedColumnDef } from '@/shared/ui/DataTable/DataTable';
import { useDropdown } from '@/shared/ui/Dropdown/Dropdown';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';
import View from '@/shared/ui/View/View';

interface SelectedFiltersState {
  chain: OptionType[];
  market: OptionType[];
  source: OptionType[];
  symbol: OptionType[];
}

const RevenueBreakDownBlock = ({
  revenueData: rawData,
  isLoading,
  isError
}: RevenuePageProps) => {
  const initialState: SelectedFiltersState = {
    chain: [],
    market: [],
    source: [],
    symbol: []
  };

  const [sortType, setSortType] = useReducer(
    (prev, next) => ({
      ...prev,
      ...next
    }),
    { key: '', type: 'asc' }
  );

  const {
    isOpen: isFilterOpen,
    onOpenModal: onFilterOpen,
    onCloseModal: onFilterClose
  } = useModal();

  const {
    isOpen: isSortOpen,
    onOpenModal: onSortOpen,
    onCloseModal: onSortClose
  } = useModal();

  const [selectedOptions, setSelectedOptions] = useReducer(
    (
      prev: SelectedFiltersState,
      next: Partial<SelectedFiltersState>
    ): SelectedFiltersState => ({
      ...prev,
      ...next
    }),
    initialState
  );

  const {
    isOpen: yearOpen,
    selectedValue: selectedYear,
    open: openYear,
    close: closeYear,
    select: selectYear,
    selectClose: selectYearClose
  } = useDropdown('single');

  const onSelectChain = useCallback(
    (chain: OptionType[]) => {
      const selectedChainIds = chain.map((o) => o.id);

      const filteredDeployment = selectedOptions.market.filter((el) =>
        selectedChainIds.length === 0
          ? true
          : (el.chain?.some((c) => selectedChainIds.includes(c)) ?? false)
      );
      setSelectedOptions({ chain, market: filteredDeployment });
    },
    [selectedOptions.market]
  );

  const onSelectMarket = useCallback((options: OptionType[]) => {
    setSelectedOptions({ market: options });
  }, []);

  const onSelectSource = useCallback((options: OptionType[]) => {
    setSelectedOptions({ source: options });
  }, []);

  const onSelectSymbol = useCallback((options: OptionType[]) => {
    setSelectedOptions({ symbol: options });
  }, []);

  const yearOptions = useMemo(() => {
    if (!rawData || rawData.length === 0) {
      return [];
    }
    const years = new Set(
      rawData.map((item) => new Date(item.date * 1000).getFullYear().toString())
    );
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [rawData]);

  const filterOptionsConfig = useMemo(
    () => ({
      chain: { path: 'source.network' },
      market: { path: 'source.market' },
      source: { path: 'source.type' },
      symbol: { path: 'source.asset.symbol' }
    }),
    []
  );

  const { chainOptions, marketOptions, sourceOptions, symbolOptions } = useMemo(
    () => extractFilterOptions(rawData, filterOptionsConfig),
    [rawData, filterOptionsConfig]
  );

  const filteredData = useMemo(() => {
    let data = rawData;

    if (selectedOptions.chain.length > 0) {
      const selectedValues = selectedOptions.chain.map((option) => option.id);
      data = data.filter((item) =>
        item.source.network
          ? selectedValues.includes(item.source.network)
          : false
      );
    }

    if (selectedOptions.market.length > 0) {
      const selectedValues = selectedOptions.market.map((option) => option.id);
      data = data.filter((item) => {
        const marketValue = item.source.market || 'no name';
        return selectedValues.includes(marketValue);
      });
    }

    if (selectedOptions.source.length > 0) {
      const selectedValues = selectedOptions.source.map((option) => option.id);
      data = data.filter((item) =>
        item.source.type ? selectedValues.includes(item.source.type) : false
      );
    }

    if (selectedOptions.symbol.length > 0) {
      const selectedValues = selectedOptions.symbol.map((option) => option.id);
      data = data.filter((item) =>
        item.source.asset?.symbol
          ? selectedValues.includes(item.source.asset.symbol)
          : false
      );
    }

    return data;
  }, [rawData, selectedOptions]);

  const { tableData, dynamicColumns } = useMemo(() => {
    const yearToDisplay = selectedYear?.[0] || yearOptions[0];
    if (!yearToDisplay) {
      return { tableData: [], dynamicColumns: [] };
    }

    const dataForYear = filteredData.filter(
      (item) =>
        new Date(item.date * 1000).getFullYear().toString() === yearToDisplay
    );

    const columns: ExtendedColumnDef<FormattedRevenueData>[] = [
      { accessorKey: 'chain', header: 'Chain' }
    ];
    if (
      selectedOptions.market.length > 0 ||
      selectedOptions.source.length > 0
    ) {
      columns.push({ accessorKey: 'market', header: 'Market' });
    }
    if (selectedOptions.source.length > 0) {
      columns.push({ accessorKey: 'source', header: 'Source' });
    }
    if (
      selectedOptions.source.length > 0 ||
      selectedOptions.symbol.length > 0
    ) {
      columns.push({ accessorKey: 'reserveAsset', header: 'Reserve Asset' });
    }

    columns.push(
      {
        accessorKey: `q1_${yearToDisplay}`,
        header: `Q1 ${yearToDisplay}`,
        cell: ({ getValue }) => formatNumber(getValue() as number)
      },
      {
        accessorKey: `q2_${yearToDisplay}`,
        header: `Q2 ${yearToDisplay}`,
        cell: ({ getValue }) => formatNumber(getValue() as number)
      },
      {
        accessorKey: `q3_${yearToDisplay}`,
        header: `Q3 ${yearToDisplay}`,
        cell: ({ getValue }) => formatNumber(getValue() as number)
      },
      {
        accessorKey: `q4_${yearToDisplay}`,
        header: `Q4 ${yearToDisplay}`,
        cell: ({ getValue }) => {
          const val = getValue<number>();
          return val === 0 ? '-' : formatNumber(val);
        }
      }
    );

    if (dataForYear.length === 0) {
      return { tableData: [], dynamicColumns: columns };
    }

    const groupedData: Record<string, FormattedRevenueData> = {};

    dataForYear.forEach((item) => {
      const marketValue = item.source.market || 'no name';

      const keyParts = [item.source.network];
      if (
        selectedOptions.market.length > 0 ||
        selectedOptions.source.length > 0
      ) {
        keyParts.push(marketValue);
      }
      if (selectedOptions.source.length > 0) {
        keyParts.push(item.source.type);
      }
      if (
        selectedOptions.source.length > 0 ||
        selectedOptions.symbol.length > 0
      ) {
        keyParts.push(item.source.asset.symbol);
      }
      const groupKey = keyParts.join('-');

      if (!groupedData[groupKey]) {
        groupedData[groupKey] = {
          chain: capitalizeFirstLetter(item.source.network),
          market: marketValue,
          source: item.source.type,
          reserveAsset: item.source.asset.symbol,
          [`q1_${yearToDisplay}`]: 0,
          [`q2_${yearToDisplay}`]: 0,
          [`q3_${yearToDisplay}`]: 0,
          [`q4_${yearToDisplay}`]: 0
        };
      }

      const date = new Date(item.date * 1000);
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      const quarterKey = `q${quarter}_${yearToDisplay}`;
      (groupedData[groupKey][quarterKey] as number) += item.value;
    });

    const finalData = Object.values(groupedData);

    return { tableData: finalData, dynamicColumns: columns };
  }, [filteredData, selectedYear, yearOptions, selectedOptions]);

  const revenueBreakdownColumns = useMemo(() => {
    return dynamicColumns.map((column) => ({
      accessorKey: String(column.accessorKey),
      header: typeof column.header === 'string' ? column.header : ''
    }));
  }, [dynamicColumns]);

  const handleResetFilters = useCallback(() => {
    setSelectedOptions(initialState);
  }, []);

  const onKeySelect = useCallback((value: string) => {
    setSortType({
      key: value
    });
  }, []);

  const onTypeSelect = useCallback((value: string) => {
    setSortType({
      type: value
    });
  }, []);

  const hasData = tableData.length > 0;

  const noDataMessage =
    selectedOptions.chain.length > 0 ||
    selectedOptions.market.length > 0 ||
    selectedOptions.source.length > 0 ||
    selectedOptions.symbol.length > 0
      ? 'No data for selected filters'
      : 'No data available';

  const filterOptions = useMemo(() => {
    const chainFilterOptions = {
      id: 'chain',
      placeholder: 'Chain',
      total: selectedOptions.chain.length,
      selectedOptions: selectedOptions.chain,
      options: chainOptions || [],
      onChange: onSelectChain
    };

    const marketFilterOptions = {
      id: 'market',
      placeholder: 'Market',
      total: selectedOptions.market.length,
      selectedOptions: selectedOptions.market,
      options: marketOptions || [],
      onChange: onSelectMarket
    };

    const sourceFilterOptions = {
      id: 'source',
      placeholder: 'Source',
      total: selectedOptions.source.length,
      selectedOptions: selectedOptions.source,
      options:
        sourceOptions?.sort((a, b) => a.label.localeCompare(b.label)) || [],
      onChange: onSelectSource
    };

    const symbolFilterOptions = {
      id: 'reserveSymbol',
      placeholder: 'Reserve Symbols',
      total: selectedOptions.symbol.length,
      selectedOptions: selectedOptions.symbol,
      options:
        symbolOptions?.sort((a, b) => a.label.localeCompare(b.label)) || [],
      onChange: onSelectSymbol
    };

    return [
      chainFilterOptions,
      marketFilterOptions,
      sourceFilterOptions,
      symbolFilterOptions
    ];
  }, [
    chainOptions,
    marketOptions,
    onSelectChain,
    onSelectMarket,
    onSelectSource,
    onSelectSymbol,
    selectedOptions,
    sourceOptions,
    symbolOptions
  ]);

  return (
    <Card
      title='Revenue Breakdown'
      id='revenue-breakdown'
      isLoading={isLoading}
      isError={isError}
      className={{
        loading: 'min-h-[inherit]',
        container: 'border-background min-h-[571px] border',
        content: 'flex flex-col gap-3 px-0 pt-0 pb-0 md:pb-10 lg:px-10'
      }}
    >
      <View.Mobile>
        <div className='flex flex-col items-end gap-3 px-5 py-3'>
          <div className='flex w-fit flex-wrap items-center justify-end gap-3'>
            <Text
              tag='span'
              size='11'
              weight='600'
              lineHeight='16'
              className='text-primary-14'
            >
              Group by
            </Text>
            <SingleDrawer
              options={yearOptions}
              isOpen={yearOpen}
              selectedValue={selectedYear?.[0] || yearOptions[0] || ''}
              onOpen={openYear}
              onClose={closeYear}
              onSelect={selectYear}
              triggerContentClassName='p-[5px]'
              disabled={isLoading}
            />
          </div>
          <div className='flex flex-wrap items-center justify-end gap-3'>
            <Button
              onClick={onFilterOpen}
              className='bg-secondary-27 text-gray-11 shadow-13 flex min-w-[130px] gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold'
            >
              <Icon
                name='filters'
                className='h-[14px] w-[14px]'
              />
              Filters
            </Button>
            <Button
              onClick={onSortOpen}
              className='bg-secondary-27 text-gray-11 shadow-13 flex min-w-[130px] gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold'
            >
              <Icon
                name='sort-icon'
                className='h-[14px] w-[14px]'
              />
              Sort
            </Button>
            <CSVDownloadButton
              data={tableData}
              filename={`Revenue Breakdown ${selectedYear?.[0] || yearOptions[0]}.csv`}
            />
          </div>
        </div>
      </View.Mobile>
      <View.Tablet>
        <div className='flex justify-end gap-3 px-10 py-3 lg:px-0'>
          <div className='flex items-center gap-5'>
            <div className='flex items-center gap-1'>
              <MultiSelect
                options={chainOptions || []}
                value={selectedOptions.chain}
                onChange={onSelectChain}
                placeholder='Chain'
                disabled={isLoading}
              />
              <MultiSelect
                options={marketOptions || []}
                value={selectedOptions.market}
                onChange={onSelectMarket}
                placeholder='Market'
                disabled={isLoading || !Boolean(marketOptions.length)}
              />
              <MultiSelect
                options={
                  sourceOptions?.sort((a, b) =>
                    a.label.localeCompare(b.label)
                  ) || []
                }
                value={selectedOptions.source}
                onChange={onSelectSource}
                placeholder='Source'
                disabled={isLoading}
              />
              <MultiSelect
                options={
                  symbolOptions?.sort((a, b) =>
                    a.label.localeCompare(b.label)
                  ) || []
                }
                value={selectedOptions.symbol}
                onChange={onSelectSymbol}
                placeholder='Reserve Symbols'
                disabled={isLoading}
              />
            </div>
            <div className='flex items-center gap-1'>
              <Text
                tag='span'
                size='11'
                weight='600'
                lineHeight='16'
                className='text-primary-14'
              >
                Group by
              </Text>
              <SingleDropdown
                options={yearOptions}
                isOpen={yearOpen}
                selectedValue={selectedYear?.[0] || yearOptions[0] || ''}
                onOpen={openYear}
                onClose={closeYear}
                onSelect={selectYearClose}
                // contentClassName='p-[5px]'
                triggerContentClassName='p-[5px]'
                disabled={isLoading}
              />
            </div>
          </div>
          <CSVDownloadButton
            data={tableData}
            filename={`Revenue Breakdown ${selectedYear?.[0] || yearOptions[0]}.csv`}
          />
        </div>
      </View.Tablet>
      <View.Condition if={hasData}>
        <RevenueBreakdown
          data={tableData}
          columns={dynamicColumns}
          sortType={sortType}
        />
      </View.Condition>
      <View.Condition if={!hasData}>
        <NoDataPlaceholder
          onButtonClick={handleResetFilters}
          text={noDataMessage}
        />
      </View.Condition>
      <SortDrawer
        isOpen={isSortOpen}
        sortType={sortType}
        columns={revenueBreakdownColumns}
        onClose={onSortClose}
        onKeySelect={onKeySelect}
        onTypeSelect={onTypeSelect}
      />
      <Filter
        isOpen={isFilterOpen}
        filterOptions={filterOptions}
        onClose={onFilterClose}
        onClearAll={handleResetFilters}
      />
    </Card>
  );
};

export default RevenueBreakDownBlock;
