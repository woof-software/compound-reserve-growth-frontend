import React, { useCallback, useMemo, useState } from 'react';

import CompoundRevenue from '@/components/Charts/CompoundRevenue/CompoundRevenue';
import CSVDownloadButton from '@/components/CSVDownloadButton/CSVDownloadButton';
import { MultiSelect } from '@/components/MultiSelect/MultiSelect';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import { useChartControls } from '@/shared/hooks/useChartControls';
import { useCSVExport } from '@/shared/hooks/useCSVExport';
import { type RevenuePageProps } from '@/shared/hooks/useRevenue';
import {
  capitalizeFirstLetter,
  ChartDataItem,
  getValueByPath
} from '@/shared/lib/utils/utils';
import { OptionType } from '@/shared/types/types';
import Card from '@/shared/ui/Card/Card';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';
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
        const match = rawData.find(
          (item) => getValueByPath(item, 'source.market') === value
        );

        const option: OptionType = {
          id: value,
          label: capitalizeFirstLetter(value),
          chain: match?.source.network || 'Unknown'
        };

        if (key === 'market') {
          option.marketType = match?.source.type.split(' ')[1] ?? '';
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
  const [selectedChains, setSelectedChains] = useState<OptionType[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<OptionType[]>([]);
  const [selectedSources, setSelectedSources] = useState<OptionType[]>([]);
  const [selectedSymbols, setSelectedSymbols] = useState<OptionType[]>([]);

  const { activeTab, barSize, barCount, handleTabChange, handleBarSizeChange } =
    useChartControls({
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
        .sort((a: OptionType, b: OptionType) =>
          a.label.localeCompare(b.label)
        ) || [];

    const marketV3 =
      marketOptions
        ?.filter((el) => el.marketType?.toLowerCase() === 'v3')
        .sort((a: OptionType, b: OptionType) =>
          a.label.localeCompare(b.label)
        ) || [];

    const noMarkets = marketOptions?.find(
      (el) => el?.id?.toLowerCase() === 'no name'
    );

    if (noMarkets) {
      return [...marketV3, ...marketV2, noMarkets];
    }

    return [...marketV3, ...marketV2];
  }, [marketOptions, selectedChains]);

  const processedChartData = useMemo(() => {
    const hasActiveFilters =
      selectedChains.length > 0 ||
      selectedMarkets.length > 0 ||
      selectedSources.length > 0 ||
      selectedSymbols.length > 0;

    if (!hasActiveFilters) {
      return initialAggregatedData;
    }

    const activeFiltersById = {
      chain: createIdSet(selectedChains),
      market: createIdSet(selectedMarkets),
      source: createIdSet(selectedSources),
      symbol: createIdSet(selectedSymbols)
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
  }, [
    processedItems,
    initialAggregatedData,
    sortedDates,
    selectedChains,
    selectedMarkets,
    selectedSources,
    selectedSymbols
  ]);

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
      selectedChains.length > 0 ||
      selectedMarkets.length > 0 ||
      selectedSources.length > 0 ||
      selectedSymbols.length > 0;
    return hasFilters ? 'Filtered' : 'Total';
  }, [selectedChains, selectedMarkets, selectedSources, selectedSymbols]);

  const { csvData, csvFilename } = useCSVExport({
    chartSeries: chartSeriesForCSV,
    barSize,
    groupBy,
    filePrefix: 'Compound_Revenue',
    aggregationType: 'sum'
  });

  const handleResetFilters = useCallback(() => {
    setSelectedChains([]);
    setSelectedMarkets([]);
    setSelectedSources([]);
    setSelectedSymbols([]);
  }, []);

  const hasData = processedChartData.length > 0;

  const noDataMessage =
    selectedChains.length > 0 ||
    selectedMarkets.length > 0 ||
    selectedSources.length > 0 ||
    selectedSymbols.length > 0
      ? 'No data for selected filters'
      : 'No data available';

  return (
    <Card
      title='Compound Revenue'
      id='compound-revenue'
      isLoading={isLoading}
      isError={isError}
      className={{
        loading: 'min-h-[inherit]',
        container: 'min-h-[571px]',
        content: 'flex flex-col gap-3 px-10 pt-0 pb-10'
      }}
    >
      <div className='flex justify-end gap-3 px-0 py-3'>
        <div className='flex gap-2'>
          <MultiSelect
            options={chainOptions || []}
            value={selectedChains}
            onChange={setSelectedChains}
            placeholder='Chain'
            disabled={isLoading}
          />
          <MultiSelect
            options={deploymentOptionsFilter || []}
            value={selectedMarkets}
            onChange={setSelectedMarkets}
            placeholder='Market'
            disabled={isLoading}
          />
          <MultiSelect
            options={sourceOptions || []}
            value={selectedSources}
            onChange={setSelectedSources}
            placeholder='Source'
            disabled={isLoading}
          />
          <MultiSelect
            options={symbolOptions || []}
            value={selectedSymbols}
            onChange={setSelectedSymbols}
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
      <View.Condition if={!isLoading && !isError && hasData}>
        <div className='h-[400px]'>
          <CompoundRevenue
            data={processedChartData}
            barSize={barSize}
            barCountToSet={barCount}
          />
        </div>
      </View.Condition>
      <View.Condition if={!isLoading && !isError && !hasData}>
        <NoDataPlaceholder
          onButtonClick={handleResetFilters}
          text={noDataMessage}
        />
      </View.Condition>
    </Card>
  );
};

export default CompoundRevenueBlock;
