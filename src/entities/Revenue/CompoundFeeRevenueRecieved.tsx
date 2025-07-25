import { memo, useCallback, useMemo, useReducer, useState } from 'react';

import CompoundFeeRecieved from '@/components/Charts/CompoundFeeRecieved/CompoundFeeRecieved';
import CSVDownloadButton from '@/components/CSVDownloadButton/CSVDownloadButton';
import { MultiSelect } from '@/components/MultiSelect/MultiSelect';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import SingleDropdown from '@/components/SingleDropdown/SingleDropdown';
import { useChartControls } from '@/shared/hooks/useChartControls';
import { useCSVExport } from '@/shared/hooks/useCSVExport';
import { RevenuePageProps } from '@/shared/hooks/useRevenue';
import { capitalizeFirstLetter } from '@/shared/lib/utils/utils';
import { OptionType } from '@/shared/types/types';
import Card from '@/shared/ui/Card/Card';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';

interface SelectedOptionsState {
  chain: OptionType[];
  market: OptionType[];
  symbol: OptionType[];
  assetType: OptionType[];
}

interface StackedChartData {
  date: string;
  [key: string]: string | number;
}

const groupByOptions = ['None', 'Asset Type', 'Chain', 'Market'];

const groupByPathMapping: Record<string, string> = {
  'Asset Type': 'source.asset.type',
  Chain: 'source.network',
  Market: 'source.market'
};

const getValueByPath = (obj: any, path: string): any => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

interface StackedChartData {
  date: string;
  [key: string]: string | number;
}

const CompoundFeeRevenueRecieved = ({
  revenueData: rawData,
  isLoading,
  isError
}: RevenuePageProps) => {
  const {
    activeTab,
    barSize,
    barCount,
    handleTabChange,
    handleBarSizeChange,
    handleVisibleBarsChange
  } = useChartControls({ initialTimeRange: '7B', initialBarSize: 'D' });

  const initialState: SelectedOptionsState = {
    chain: [],
    market: [],
    symbol: [],
    assetType: []
  };

  const [selectedOptions, setSelectedOptions] = useReducer(
    (
      prev: SelectedOptionsState,
      next: Partial<SelectedOptionsState>
    ): SelectedOptionsState => ({
      ...prev,
      ...next
    }),
    initialState
  );

  const [groupBy, setGroupBy] = useState<string>('Chain');
  const [isGroupByOpen, setIsGroupByOpen] = useState(false);

  const toggleGroupBy = useCallback(
    () => setIsGroupByOpen((prev) => !prev),
    []
  );
  const closeGroupBy = useCallback(() => setIsGroupByOpen(false), []);
  const handleSelectGroupBy = useCallback(
    (value: string) => {
      setGroupBy(value);
      closeGroupBy();
    },
    [closeGroupBy]
  );

  const {
    chainOptions,
    marketOptions,
    symbolOptions,
    assetTypeOptions,
    chartData
  } = useMemo(() => {
    if (!rawData || rawData.length === 0) {
      return {
        chainOptions: [],
        marketOptions: [],
        symbolOptions: [],
        assetTypeOptions: [],
        chartData: []
      };
    }

    const selectedChainSet = new Set(selectedOptions.chain.map((c) => c.id));
    const selectedMarketSet = new Set(selectedOptions.market.map((m) => m.id));
    const selectedSymbolSet = new Set(selectedOptions.symbol.map((s) => s.id));
    const selectedAssetTypeSet = new Set(
      selectedOptions.assetType.map((a) => a.id)
    );

    const isChainFilterActive = selectedChainSet.size > 0;
    const isMarketFilterActive = selectedMarketSet.size > 0;
    const isSymbolFilterActive = selectedSymbolSet.size > 0;
    const isAssetTypeFilterActive = selectedAssetTypeSet.size > 0;

    const uniqueChains = new Set<string>();
    const uniqueMarkets = new Set<string>();
    const uniqueSymbols = new Set<string>();
    const uniqueAssetTypes = new Set<string>();
    const groupedByDate: { [date: string]: StackedChartData } = {};
    const groupByKeyPath = groupByPathMapping[groupBy];

    for (const item of rawData) {
      const network = item.source.network;
      const marketName = item.source.market ?? 'no name';
      const symbolName = item.source.asset.symbol;
      const assetTypeName = item.source.asset.type;

      uniqueChains.add(network);
      uniqueMarkets.add(marketName);
      uniqueSymbols.add(symbolName);
      uniqueAssetTypes.add(assetTypeName);

      const chainMatch = !isChainFilterActive || selectedChainSet.has(network);
      if (!chainMatch) continue;

      const marketMatch =
        !isMarketFilterActive || selectedMarketSet.has(marketName);
      if (!marketMatch) continue;

      const symbolMatch =
        !isSymbolFilterActive || selectedSymbolSet.has(symbolName);
      if (!symbolMatch) continue;

      const assetTypeMatch =
        !isAssetTypeFilterActive || selectedAssetTypeSet.has(assetTypeName);
      if (!assetTypeMatch) continue;

      const date = new Date(item.date * 1000).toISOString().split('T')[0];

      let seriesKey: string;
      if (groupBy === 'None') {
        seriesKey = 'Total';
      } else {
        seriesKey = getValueByPath(item, groupByKeyPath) || 'Unknown';
      }

      if (!groupedByDate[date]) {
        groupedByDate[date] = { date };
      }

      groupedByDate[date][seriesKey] =
        ((groupedByDate[date][seriesKey] as number) || 0) + item.value;
    }

    const createOptions = (
      uniqueValues: Set<string>,
      key?: string
    ): OptionType[] => {
      return Array.from(uniqueValues)
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
    };

    const finalChartData = Object.values(groupedByDate).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return {
      chainOptions: createOptions(uniqueChains),
      symbolOptions: createOptions(uniqueSymbols),
      assetTypeOptions: createOptions(uniqueAssetTypes),
      marketOptions: createOptions(uniqueMarkets, 'market'),
      chartData: finalChartData
    };
  }, [rawData, selectedOptions, groupBy]);

  const { csvData, csvFilename } = useCSVExport({
    stackedData: chartData,
    barSize,
    groupBy,
    filePrefix: 'Compound_Fee_Revenue',
    aggregationType: 'sum',
    rawData,
    selectedChains: selectedOptions.chain,
    selectedMarkets: selectedOptions.market,
    groupByPathMapping,
    getValueByPath
  });

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

    // Filter markets based on selected chain
    if (selectedOptions.chain.length) {
      const selectedChain = selectedOptions.chain.map(
        (option: OptionType) => option.id
      );

      if (noMarkets) {
        return [...marketV3, ...marketV2, noMarkets].filter((el) =>
          selectedChain.includes(el?.chain || '')
        );
      }

      return [...marketV3, ...marketV2].filter((el) =>
        selectedChain.includes(el?.chain || '')
      );
    }

    if (noMarkets) {
      return [...marketV3, ...marketV2, noMarkets];
    }

    return [...marketV3, ...marketV2];
  }, [marketOptions, selectedOptions]);

  const hasData = chartData.length > 0;
  const noDataMessage =
    selectedOptions.chain.length > 0 ||
    selectedOptions.market.length > 0 ||
    selectedOptions.symbol.length > 0 ||
    selectedOptions.assetType.length > 0
      ? 'No data for selected filters'
      : 'No data available';

  const onSelectChain = useCallback((options: OptionType[]) => {
    setSelectedOptions({ chain: options });

    setSelectedOptions({ market: [] });
  }, []);

  const onSelectMarket = useCallback((options: OptionType[]) => {
    setSelectedOptions({ market: options });
  }, []);

  const onSelectSymbol = useCallback((options: OptionType[]) => {
    setSelectedOptions({ symbol: options });
  }, []);

  const onSelectAssetType = useCallback((options: OptionType[]) => {
    setSelectedOptions({ assetType: options });
  }, []);

  const handleResetFilters = useCallback(() => {
    setSelectedOptions(initialState);

    setGroupBy('Chain');
  }, [initialState]);

  return (
    <Card
      title='Compound Fee Revenue Recieved'
      id='compound-fee-revenue-received'
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
            options={chainOptions}
            value={selectedOptions.chain}
            onChange={onSelectChain}
            placeholder='Chain'
            disabled={isLoading}
          />
          <MultiSelect
            options={deploymentOptionsFilter || []}
            value={selectedOptions.market}
            onChange={onSelectMarket}
            placeholder='Market'
            disabled={isLoading}
          />
          <MultiSelect
            options={assetTypeOptions}
            value={selectedOptions.assetType}
            onChange={onSelectAssetType}
            placeholder='Asset Type'
            disabled={isLoading}
          />
          <MultiSelect
            options={symbolOptions}
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
        <SingleDropdown
          options={groupByOptions}
          isOpen={isGroupByOpen}
          selectedValue={groupBy}
          onToggle={toggleGroupBy}
          onClose={closeGroupBy}
          onSelect={handleSelectGroupBy}
          disabled={isLoading}
        />
        <CSVDownloadButton
          data={csvData}
          filename={csvFilename}
        />
      </div>
      {!isLoading && !isError && !hasData ? (
        <NoDataPlaceholder
          onButtonClick={handleResetFilters}
          text={noDataMessage}
        />
      ) : (
        <CompoundFeeRecieved
          data={chartData}
          groupBy={groupBy}
          barCount={barCount}
          barSize={barSize}
          onVisibleBarsChange={handleVisibleBarsChange}
        />
      )}
    </Card>
  );
};

export default memo(CompoundFeeRevenueRecieved);
