import React, { memo, useCallback, useMemo, useReducer, useState } from 'react';

import CompoundFeeRecieved from '@/components/Charts/CompoundFeeRecieved/CompoundFeeRecieved';
import CSVDownloadButton from '@/components/CSVDownloadButton/CSVDownloadButton';
import Filter from '@/components/Filter/Filter';
import { MultiSelect } from '@/components/MultiSelect/MultiSelect';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import SingleDropdown, {
  SingleDrawer
} from '@/components/SingleDropdown/SingleDropdown';
import { useChartControls } from '@/shared/hooks/useChartControls';
import { useCSVExport } from '@/shared/hooks/useCSVExport';
import { useModal } from '@/shared/hooks/useModal';
import { RevenuePageProps } from '@/shared/hooks/useRevenue';
import { capitalizeFirstLetter } from '@/shared/lib/utils/utils';
import { BarSize, OptionType, TimeRange } from '@/shared/types/types';
import Button from '@/shared/ui/Button/Button';
import Card from '@/shared/ui/Card/Card';
import Icon from '@/shared/ui/Icon/Icon';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';
import Text from '@/shared/ui/Text/Text';

interface SelectedOptionsState {
  chain: OptionType[];
  market: OptionType[];
  symbol: OptionType[];
  assetType: OptionType[];
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

interface FiltersProps {
  chainOptions: OptionType[];

  deploymentOptionsFilter: OptionType[];

  assetTypeOptions: OptionType[];

  symbolOptions: OptionType[];

  barSize: BarSize;

  activeTab: TimeRange | null;

  isLoading: boolean;

  openSingle: boolean;

  groupBy: string;

  csvFilename: string;

  csvData: Record<string, string | number>[];

  selectedOptions: {
    chain: OptionType[];

    assetType: OptionType[];

    market: OptionType[];

    symbol: OptionType[];
  };

  onSelectChain: (chain: OptionType[]) => void;

  onSelectAssetType: (assetType: OptionType[]) => void;

  onSelectMarket: (market: OptionType[]) => void;

  onSelectSymbol: (symbol: OptionType[]) => void;

  handleBarSizeChange: (value: string) => void;

  handleTabChange: (value: string) => void;

  toggleSingle: () => void;

  closeSingle: () => void;

  onClearAll: () => void;

  selectSingle: (value: string) => void;
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
      return allMarkets.filter(
        (el) => el.chain?.some((c) => selectedChainIds.includes(c)) ?? false
      );
    }

    return allMarkets;
  }, [marketOptions, selectedOptions]);

  const hasData = chartData.length > 0;
  const noDataMessage =
    selectedOptions.chain.length > 0 ||
    selectedOptions.market.length > 0 ||
    selectedOptions.symbol.length > 0 ||
    selectedOptions.assetType.length > 0
      ? 'No data for selected filters'
      : 'No data available';

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
      title='Compound Fee Revenue Received'
      id='compound-fee-revenue-received'
      isLoading={isLoading}
      isError={isError}
      className={{
        loading: 'min-h-[inherit]',
        container: 'border-background min-h-[571px] border',
        content: 'flex flex-col gap-3 p-0 pb-5 md:px-10 md:pb-10'
      }}
    >
      <Filters
        groupBy={groupBy}
        assetTypeOptions={assetTypeOptions}
        selectedOptions={selectedOptions}
        chainOptions={chainOptions}
        symbolOptions={symbolOptions}
        deploymentOptionsFilter={deploymentOptionsFilter}
        isLoading={isLoading || false}
        barSize={barSize}
        activeTab={activeTab}
        csvData={csvData}
        csvFilename={csvFilename}
        openSingle={isGroupByOpen}
        onSelectChain={onSelectChain}
        onSelectAssetType={onSelectAssetType}
        onSelectMarket={onSelectMarket}
        onSelectSymbol={onSelectSymbol}
        handleBarSizeChange={handleBarSizeChange}
        handleTabChange={handleTabChange}
        toggleSingle={toggleGroupBy}
        closeSingle={closeGroupBy}
        selectSingle={handleSelectGroupBy}
        onClearAll={handleResetFilters}
      />
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

const Filters = ({
  barSize,
  activeTab,
  openSingle,
  groupBy,
  csvData,
  csvFilename,
  chainOptions,
  selectedOptions,
  deploymentOptionsFilter,
  assetTypeOptions,
  symbolOptions,
  isLoading,
  onSelectChain,
  onSelectAssetType,
  onSelectMarket,
  onSelectSymbol,
  handleBarSizeChange,
  handleTabChange,
  toggleSingle,
  closeSingle,
  selectSingle,
  onClearAll
}: FiltersProps) => {
  const { isOpen, onOpenModal, onCloseModal } = useModal();

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
      options: deploymentOptionsFilter || [],
      onChange: onSelectMarket
    };

    const assetTypeFilterOptions = {
      id: 'assetType',
      placeholder: 'Asset Type',
      total: selectedOptions.assetType.length,
      selectedOptions: selectedOptions.assetType,
      options:
        assetTypeOptions?.sort((a, b) => a.label.localeCompare(b.label)) || [],
      onChange: onSelectAssetType
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
      assetTypeFilterOptions,
      symbolFilterOptions
    ];
  }, [
    assetTypeOptions,
    chainOptions,
    deploymentOptionsFilter,
    onSelectAssetType,
    onSelectChain,
    onSelectMarket,
    selectedOptions
  ]);

  return (
    <>
      <div className='hidden lg:block'>
        <div className='hidden items-center justify-end gap-3 px-0 py-3 lg:flex'>
          <MultiSelect
            options={chainOptions || []}
            value={selectedOptions.chain}
            onChange={onSelectChain}
            placeholder='Chain'
            disabled={isLoading}
          />
          <MultiSelect
            options={deploymentOptionsFilter}
            value={selectedOptions.market}
            onChange={onSelectMarket}
            placeholder='Market'
            disabled={isLoading || !Boolean(deploymentOptionsFilter.length)}
          />
          <MultiSelect
            options={
              assetTypeOptions?.sort((a, b) =>
                a.label.localeCompare(b.label)
              ) || []
            }
            value={selectedOptions.assetType}
            onChange={onSelectAssetType}
            placeholder='Asset Type'
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
              options={groupByOptions}
              isOpen={openSingle}
              selectedValue={groupBy}
              onOpen={toggleSingle}
              onClose={closeSingle}
              onSelect={selectSingle}
              disabled={isLoading}
              triggerContentClassName='p-[5px]'
            />
          </div>
          <CSVDownloadButton
            data={csvData}
            filename={csvFilename}
          />
        </div>
        <div className='flex flex-col items-end justify-end gap-3 px-0 py-3 lg:hidden'>
          <div className='z-[3] flex items-center gap-3'>
            <MultiSelect
              options={chainOptions || []}
              value={selectedOptions.chain}
              onChange={onSelectChain}
              placeholder='Chain'
              disabled={isLoading}
            />
            <MultiSelect
              options={deploymentOptionsFilter}
              value={selectedOptions.market}
              onChange={onSelectMarket}
              placeholder='Market'
              disabled={isLoading || !Boolean(deploymentOptionsFilter.length)}
            />
            <MultiSelect
              options={
                assetTypeOptions?.sort((a, b) =>
                  a.label.localeCompare(b.label)
                ) || []
              }
              value={selectedOptions.assetType}
              onChange={onSelectAssetType}
              placeholder='Asset Type'
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
          <div className='z-[2] flex items-center gap-3'>
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
                options={groupByOptions}
                isOpen={openSingle}
                selectedValue={groupBy}
                onOpen={toggleSingle}
                onClose={closeSingle}
                onSelect={selectSingle}
                disabled={isLoading}
                triggerContentClassName='p-[5px]'
              />
            </div>
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
              <SingleDrawer
                options={groupByOptions}
                isOpen={openSingle}
                selectedValue={groupBy}
                onOpen={toggleSingle}
                onClose={closeSingle}
                onSelect={selectSingle}
                disabled={isLoading}
                triggerContentClassName='p-[5px]'
              />
            </div>
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
        <Filter
          isOpen={isOpen}
          filterOptions={filterOptions}
          onClose={onCloseModal}
          onClearAll={onClearAll}
        />
      </div>
    </>
  );
};

export default memo(CompoundFeeRevenueRecieved);
