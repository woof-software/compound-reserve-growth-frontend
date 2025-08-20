import React, { useCallback, useMemo, useReducer } from 'react';

import CompoundRevenue from '@/components/Charts/CompoundRevenue/CompoundRevenue';
import CSVDownloadButton from '@/components/CSVDownloadButton/CSVDownloadButton';
import {
  MultiSelect,
  MultiSelectDrawer
} from '@/components/MultiSelect/MultiSelect';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import { useChartControls } from '@/shared/hooks/useChartControls';
import { useCSVExport } from '@/shared/hooks/useCSVExport';
import { useModal } from '@/shared/hooks/useModal';
import { type RevenuePageProps } from '@/shared/hooks/useRevenue';
import { capitalizeFirstLetter, ChartDataItem } from '@/shared/lib/utils/utils';
import { BarSize, OptionType, TimeRange } from '@/shared/types/types';
import Button from '@/shared/ui/Button/Button';
import Card from '@/shared/ui/Card/Card';
import Drawer from '@/shared/ui/Drawer/Drawer';
import Icon from '@/shared/ui/Icon/Icon';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';
import Text from '@/shared/ui/Text/Text';
import View from '@/shared/ui/View/View';

interface PreprocessedItem {
  date: string;
  value: number;
  chain: string;
  market: string;
  source: string;
  symbol: string;
}

interface FilterOptions {
  chainOptions: OptionType[];
  marketOptions: OptionType[];
  sourceOptions: OptionType[];
  symbolOptions: OptionType[];
}

interface PreprocessedResult {
  filterOptions: FilterOptions;
  processedItems: PreprocessedItem[];
  initialAggregatedData: { date: string; value: number }[];
  sortedDates: string[];
}

interface FiltersProps {
  chainOptions: OptionType[];

  deploymentOptionsFilter: OptionType[];

  sourceOptions: OptionType[];

  symbolOptions: OptionType[];

  barSize: BarSize;

  activeTab: TimeRange | null;

  isLoading: boolean;

  csvFilename: string;

  csvData: Record<string, string | number>[];

  selectedOptions: {
    chain: OptionType[];

    source: OptionType[];

    deployment: OptionType[];

    symbol: OptionType[];
  };

  onSelectChain: (chain: OptionType[]) => void;

  onSelectSource: (source: OptionType[]) => void;

  onSelectMarket: (deployment: OptionType[]) => void;

  onSelectSymbol: (symbol: OptionType[]) => void;

  handleBarSizeChange: (value: string) => void;

  handleTabChange: (value: string) => void;

  onClearAll: () => void;
}

function preprocessData(rawData: ChartDataItem[]): PreprocessedResult {
  const emptyResult: PreprocessedResult = {
    filterOptions: {
      chainOptions: [],
      marketOptions: [],
      sourceOptions: [],
      symbolOptions: []
    },
    processedItems: [],
    initialAggregatedData: [],
    sortedDates: []
  };

  if (!rawData || rawData.length === 0) {
    return emptyResult;
  }

  const uniqueValues = {
    chain: new Set<string>(),
    market: new Set<string>(),
    source: new Set<string>(),
    symbol: new Set<string>()
  };

  const processedItems: PreprocessedItem[] = [];
  const dailyTotals: Record<string, number> = {};

  for (const item of rawData) {
    const chain = item.source?.network || 'N/A';
    const market =
      item.source?.market === null ? 'no name' : item.source?.market || 'N/A';
    const source = item.source?.type || 'N/A';
    const symbol = item.source?.asset?.symbol || 'N/A';
    const date = new Date(item.date * 1000).toISOString().split('T')[0];

    uniqueValues.chain.add(chain);
    uniqueValues.market.add(market);
    uniqueValues.source.add(source);
    uniqueValues.symbol.add(symbol);

    processedItems.push({
      date,
      value: item.value,
      chain,
      market,
      source,
      symbol
    });
    dailyTotals[date] = (dailyTotals[date] || 0) + item.value;
  }

  const filterOptions: Partial<FilterOptions> = {};
  for (const key in uniqueValues) {
    const optionsKey = `${key}Options` as keyof FilterOptions;
    filterOptions[optionsKey] = Array.from(
      uniqueValues[key as keyof typeof uniqueValues]
    )
      .sort((a, b) => a.localeCompare(b))
      .map((value) => {
        const option: OptionType = {
          id: value,
          label: capitalizeFirstLetter(value)
        };

        if (key === 'market') {
          const matches =
            value === 'no name'
              ? rawData.filter((item) => item.source?.market == null)
              : rawData.filter((item) => item.source?.market === value);

          option.marketType = matches[0]?.source.type.split(' ')[1] ?? '';

          option.chain = Array.from(
            new Set(matches.map((item) => item.source.network))
          );
        }

        return option;
      });
  }

  const sortedDates = Object.keys(dailyTotals).sort();
  const initialAggregatedData = sortedDates.map((date) => ({
    date,
    value: dailyTotals[date]
  }));

  return {
    filterOptions: filterOptions as FilterOptions,
    processedItems,
    initialAggregatedData,
    sortedDates
  };
}

const createIdSet = (options: OptionType[]): Set<string> =>
  new Set(options.map((opt) => opt.id));

const CompoundRevenueBlock = ({
  revenueData: data,
  isLoading,
  isError
}: RevenuePageProps) => {
  const [selectedOptions, setSelectedOptions] = useReducer(
    (prev, next) => ({
      ...prev,
      ...next
    }),
    {
      chain: [] as OptionType[],
      source: [] as OptionType[],
      deployment: [] as OptionType[],
      symbol: [] as OptionType[]
    }
  );

  const {
    activeTab,
    barSize,
    barCount,
    handleTabChange,
    handleResetActiveTab,
    handleBarSizeChange
  } = useChartControls({
    initialTimeRange: '7B',
    initialBarSize: 'D'
  });

  const { filterOptions, processedItems, initialAggregatedData, sortedDates } =
    useMemo(() => preprocessData(data || []), [data]);

  const { chainOptions, marketOptions, sourceOptions, symbolOptions } =
    filterOptions;

  const deploymentOptionsFilter = useMemo(() => {
    const marketV2 =
      marketOptions
        ?.filter((el) => el.marketType?.toLowerCase() === 'v2')
        .sort((a, b) => a.label.localeCompare(b.label)) || [];

    const marketV3 =
      marketOptions
        ?.filter((el) => el.marketType?.toLowerCase() === 'v3')
        .sort((a, b) => a.label.localeCompare(b.label)) || [];

    const noMarkets = marketOptions?.find(
      (el) => el.id.toLowerCase() === 'no name'
    );

    const selectedChainIds = selectedOptions.chain.map((o) => o.id);

    let allMarkets = [...marketV3, ...marketV2];

    if (noMarkets) {
      allMarkets = [...allMarkets, noMarkets];
    }

    if (selectedChainIds.length) {
      return allMarkets.filter((el) =>
        Array.isArray(el.chain)
          ? el.chain.some((c) => selectedChainIds.includes(c))
          : false
      );
    }

    return allMarkets;
  }, [marketOptions, selectedOptions]);

  const processedChartData = useMemo(() => {
    const hasActiveFilters =
      selectedOptions.chain.length > 0 ||
      selectedOptions.deployment.length > 0 ||
      selectedOptions.source.length > 0 ||
      selectedOptions.symbol.length > 0;

    if (!hasActiveFilters) {
      return initialAggregatedData;
    }

    const activeFiltersById = {
      chain: createIdSet(selectedOptions.chain),
      market: createIdSet(selectedOptions.deployment),
      source: createIdSet(selectedOptions.source),
      symbol: createIdSet(selectedOptions.symbol)
    };

    const dailyTotals: Record<string, number> = {};

    for (const item of processedItems) {
      if (
        activeFiltersById.chain.size > 0 &&
        !activeFiltersById.chain.has(item.chain)
      )
        continue;
      if (
        activeFiltersById.market.size > 0 &&
        !activeFiltersById.market.has(item.market)
      )
        continue;
      if (
        activeFiltersById.source.size > 0 &&
        !activeFiltersById.source.has(item.source)
      )
        continue;
      if (
        activeFiltersById.symbol.size > 0 &&
        !activeFiltersById.symbol.has(item.symbol)
      )
        continue;

      dailyTotals[item.date] = (dailyTotals[item.date] || 0) + item.value;
    }

    const result: { date: string; value: number }[] = [];
    for (const date of sortedDates) {
      if (dailyTotals[date] !== undefined) {
        result.push({ date, value: dailyTotals[date] });
      }
    }
    return result;
  }, [processedItems, initialAggregatedData, sortedDates, selectedOptions]);

  const chartSeriesForCSV = useMemo(() => {
    if (!processedChartData || processedChartData.length === 0) return [];

    return [
      {
        name: 'Revenue',
        data: processedChartData.map((item) => ({
          x: new Date(item.date).getTime(),
          y: item.value
        }))
      }
    ];
  }, [processedChartData]);

  const groupBy = useMemo(() => {
    const hasFilters =
      selectedOptions.chain.length > 0 ||
      selectedOptions.deployment.length > 0 ||
      selectedOptions.source.length > 0 ||
      selectedOptions.symbol.length > 0;
    return hasFilters ? 'Filtered' : 'Total';
  }, [selectedOptions]);

  const { csvData, csvFilename } = useCSVExport({
    chartSeries: chartSeriesForCSV,
    barSize,
    groupBy,
    filePrefix: 'Compound_Revenue',
    aggregationType: 'sum'
  });

  const hasData = processedChartData.length > 0;

  const noDataMessage =
    selectedOptions.chain.length > 0 ||
    selectedOptions.deployment.length > 0 ||
    selectedOptions.source.length > 0 ||
    selectedOptions.symbol.length > 0
      ? 'No data for selected filters'
      : 'No data available';

  const onSelectChain = useCallback(
    (chain: OptionType[]) => {
      const selectedChainIds = chain.map((o) => o.id);

      const filteredDeployment = selectedOptions.deployment.filter((el) =>
        selectedChainIds.length === 0
          ? true
          : (el.chain?.some((c) => selectedChainIds.includes(c)) ?? false)
      );

      setSelectedOptions({
        chain,
        deployment: filteredDeployment
      });
    },
    [selectedOptions]
  );

  const onSelectSource = useCallback((selectedOptions: OptionType[]) => {
    setSelectedOptions({
      source: selectedOptions
    });
  }, []);

  const onSelectMarket = useCallback((selectedOptions: OptionType[]) => {
    setSelectedOptions({
      deployment: selectedOptions
    });
  }, []);

  const onSelectSymbol = useCallback((selectedOptions: OptionType[]) => {
    setSelectedOptions({
      symbol: selectedOptions
    });
  }, []);

  const onClearSelectedOptions = useCallback(() => {
    setSelectedOptions({
      chain: [],
      assetType: [],
      deployment: [],
      symbol: []
    });
  }, []);

  return (
    <Card
      title='Compound Revenue'
      id='compound-revenue'
      isLoading={isLoading}
      isError={isError}
      className={{
        loading: 'min-h-[inherit]',
        container: 'border-background min-h-[571px] border',
        content: 'flex flex-col gap-3 p-0 md:px-10 md:pb-10'
      }}
    >
      <Filters
        barSize={barSize}
        activeTab={activeTab}
        csvData={csvData}
        csvFilename={csvFilename}
        chainOptions={chainOptions}
        selectedOptions={selectedOptions}
        deploymentOptionsFilter={deploymentOptionsFilter}
        sourceOptions={sourceOptions}
        symbolOptions={symbolOptions}
        isLoading={isLoading}
        onSelectChain={onSelectChain}
        onSelectSource={onSelectSource}
        onSelectMarket={onSelectMarket}
        onSelectSymbol={onSelectSymbol}
        handleBarSizeChange={handleBarSizeChange}
        handleTabChange={handleTabChange}
        onClearAll={onClearSelectedOptions}
      />
      <View.Condition if={!isLoading && !isError && hasData}>
        <div className='h-[400px]'>
          <CompoundRevenue
            data={processedChartData}
            barSize={barSize}
            barCountToSet={barCount}
            onZoom={handleResetActiveTab}
          />
        </div>
      </View.Condition>
      <View.Condition if={!isLoading && !isError && !hasData}>
        <NoDataPlaceholder
          onButtonClick={onClearSelectedOptions}
          text={noDataMessage}
        />
      </View.Condition>
    </Card>
  );
};

const Filters = ({
  barSize,
  activeTab,
  csvData,
  csvFilename,
  chainOptions,
  selectedOptions,
  deploymentOptionsFilter,
  sourceOptions,
  symbolOptions,
  isLoading,
  onSelectChain,
  onSelectSource,
  onSelectMarket,
  onSelectSymbol,
  handleBarSizeChange,
  handleTabChange,
  onClearAll
}: FiltersProps) => {
  const { isOpen, onOpenModal, onCloseModal } = useModal();

  return (
    <>
      <div className='hidden lg:block'>
        <div className='hidden items-center justify-end gap-3 px-0 py-3 lg:flex'>
          <div className='flex gap-2'>
            <MultiSelect
              options={chainOptions || []}
              value={selectedOptions.chain}
              onChange={onSelectChain}
              placeholder='Chain'
              disabled={isLoading}
            />
            <MultiSelect
              options={deploymentOptionsFilter || []}
              value={selectedOptions.deployment}
              onChange={onSelectMarket}
              placeholder='Market'
              disabled={isLoading || !Boolean(deploymentOptionsFilter.length)}
            />
            <MultiSelect
              options={
                sourceOptions?.sort((a, b) => a.label.localeCompare(b.label)) ||
                []
              }
              value={selectedOptions.source}
              onChange={onSelectSource}
              placeholder='Source'
              disabled={isLoading}
            />
            <MultiSelect
              options={
                symbolOptions?.sort((a, b) => a.label.localeCompare(b.label)) ||
                []
              }
              value={selectedOptions.symbol}
              onChange={onSelectSymbol}
              placeholder='Reserve Symbols'
              disabled={isLoading}
            />
          </div>
          <TabsGroup
            tabs={['D', 'W', 'M']}
            value={barSize}
            onTabChange={handleBarSizeChange}
            disabled={isLoading}
          />
          <TabsGroup
            tabs={['7B', '30B', '90B', '180B']}
            value={activeTab}
            onTabChange={handleTabChange}
            disabled={isLoading}
          />
          <CSVDownloadButton
            data={csvData}
            filename={csvFilename}
          />
        </div>
        <div className='flex flex-col items-end justify-end gap-3 px-0 py-3 lg:hidden'>
          <div className='z-[1] flex items-center gap-2'>
            <MultiSelect
              options={chainOptions || []}
              value={selectedOptions.chain}
              onChange={onSelectChain}
              placeholder='Chain'
              disabled={isLoading}
            />
            <MultiSelect
              options={deploymentOptionsFilter || []}
              value={selectedOptions.deployment}
              onChange={onSelectMarket}
              placeholder='Market'
              disabled={isLoading || !Boolean(deploymentOptionsFilter.length)}
            />
            <MultiSelect
              options={
                sourceOptions?.sort((a, b) => a.label.localeCompare(b.label)) ||
                []
              }
              value={selectedOptions.source}
              onChange={onSelectSource}
              placeholder='Source'
              disabled={isLoading}
            />
            <MultiSelect
              options={
                symbolOptions?.sort((a, b) => a.label.localeCompare(b.label)) ||
                []
              }
              value={selectedOptions.symbol}
              onChange={onSelectSymbol}
              placeholder='Reserve Symbols'
              disabled={isLoading}
            />
          </div>
          <div className='flex items-center gap-3'>
            <TabsGroup
              tabs={['D', 'W', 'M']}
              value={barSize}
              onTabChange={handleBarSizeChange}
              disabled={isLoading}
            />
            <TabsGroup
              tabs={['7B', '30B', '90B', '180B']}
              value={activeTab}
              onTabChange={handleTabChange}
              disabled={isLoading}
            />
            <CSVDownloadButton
              data={csvData}
              filename={csvFilename}
            />
          </div>
        </div>
      </div>
      <div className='block lg:hidden'>
        <div className='flex flex-col justify-end gap-3 px-5 py-3'>
          <div className='flex flex-wrap justify-end gap-3'>
            <TabsGroup
              tabs={['D', 'W', 'M']}
              value={barSize}
              onTabChange={handleBarSizeChange}
              disabled={isLoading}
            />
            <TabsGroup
              tabs={['7B', '30B', '90B', '180B']}
              value={activeTab}
              onTabChange={handleTabChange}
              disabled={isLoading}
            />
          </div>
          <div className='flex flex-wrap items-center justify-end gap-3'>
            <Button
              onClick={onOpenModal}
              className='bg-secondary-27 text-gray-11 shadow-13 flex min-w-[130px] gap-1.5 rounded-lg p-2.5 text-[11px] leading-4 font-semibold'
            >
              <Icon
                name='filters'
                className='h-[14px] w-[14px]'
              />
              Filters
            </Button>
            <CSVDownloadButton
              data={csvData}
              filename={csvFilename}
            />
          </div>
        </div>
        <Drawer
          isOpen={isOpen}
          onClose={onCloseModal}
        >
          <Text
            size='17'
            weight='700'
            lineHeight='140'
            align='center'
            className='mb-8 w-full'
          >
            Filters
          </Text>
          <div className='grid gap-3 px-2'>
            <MultiSelectDrawer
              options={chainOptions || []}
              value={selectedOptions.chain}
              onChange={onSelectChain}
              placeholder='Chain'
              disabled={isLoading}
            />
            <MultiSelectDrawer
              options={deploymentOptionsFilter || []}
              value={selectedOptions.deployment}
              onChange={onSelectMarket}
              placeholder='Market'
              disabled={isLoading || !Boolean(deploymentOptionsFilter.length)}
            />
            <MultiSelectDrawer
              options={
                sourceOptions?.sort((a, b) => a.label.localeCompare(b.label)) ||
                []
              }
              value={selectedOptions.source}
              onChange={onSelectSource}
              placeholder='Source'
              disabled={isLoading}
            />
            <MultiSelectDrawer
              options={
                symbolOptions?.sort((a, b) => a.label.localeCompare(b.label)) ||
                []
              }
              value={selectedOptions.symbol}
              onChange={onSelectSymbol}
              placeholder='Reserve Symbols'
              disabled={isLoading}
            />
          </div>
          <div className='w-full px-2'>
            <Button
              className='bg-secondary-14 mx-2 mt-8 flex w-full items-center justify-center rounded-lg px-3 py-4 text-[11px] font-medium'
              onClick={onClearAll}
            >
              Clear Filters
            </Button>
          </div>
        </Drawer>
      </div>
    </>
  );
};

export default CompoundRevenueBlock;
