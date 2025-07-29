import React, { useCallback, useMemo, useReducer } from 'react';

import LineChart from '@/components/Charts/Line/Line';
import CSVDownloadButton from '@/components/CSVDownloadButton/CSVDownloadButton';
import { MultiSelect } from '@/components/MultiSelect/MultiSelect';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import SingleDropdown from '@/components/SingleDropdown/SingleDropdown';
import { useChartControls } from '@/shared/hooks/useChartControls';
import { useChartDataProcessor } from '@/shared/hooks/useChartDataProcessor';
import { useCSVExport } from '@/shared/hooks/useCSVExport';
import { ChartDataItem, extractFilterOptions } from '@/shared/lib/utils/utils';
import { TokenData } from '@/shared/types/Treasury/types';
import { OptionType } from '@/shared/types/types';
import Card from '@/shared/ui/Card/Card';
import { useDropdown } from '@/shared/ui/Dropdown/Dropdown';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';

const groupByOptions = ['None', 'Asset Type', 'Chain', 'Market'];

const groupByMapping: Record<string, string> = {
  'Asset Type': 'assetType',
  Chain: 'chain',
  Market: 'deployment'
};

interface TotalTreasuryValueProps {
  isLoading?: boolean;
  isError?: boolean;
  data?: TokenData[];
  onCopyLink?: (id: string) => void;
}

const TotalTresuaryValue = ({
  isLoading,
  isError,
  data: treasuryApiResponse
}: TotalTreasuryValueProps) => {
  const [selectedOptions, setSelectedOptions] = useReducer(
    (prev, next) => ({
      ...prev,
      ...next
    }),
    {
      chain: [] as OptionType[],
      assetType: [] as OptionType[],
      deployment: [] as OptionType[],
      symbol: [] as OptionType[]
    }
  );

  const {
    open: openSingle,
    selectedValue: selectedSingle,
    toggle: toggleSingle,
    close: closeSingle,
    select: selectSingle
  } = useDropdown('single');

  const {
    activeTab,
    barSize,
    barCount,
    handleTabChange,
    handleBarSizeChange,
    handleVisibleBarsChange
  } = useChartControls({
    initialTimeRange: '7B',
    initialBarSize: 'D'
  });

  const rawData: ChartDataItem[] = useMemo(() => {
    if (!treasuryApiResponse) {
      return [];
    }
    return [...treasuryApiResponse].sort((a, b) => a.date - b.date);
  }, [treasuryApiResponse]);

  const filterOptionsConfig = useMemo(
    () => ({
      chain: { path: 'source.network' },
      assetType: { path: 'source.asset.type' },
      deployment: { path: 'source.market' },
      symbol: { path: 'source.asset.symbol' }
    }),
    []
  );

  const { chainOptions, assetTypeOptions, symbolOptions, deploymentOptions } =
    useMemo(
      () => extractFilterOptions(rawData, filterOptionsConfig),
      [rawData, filterOptionsConfig]
    );

  const deploymentOptionsFilter = useMemo(() => {
    const marketV2 =
      deploymentOptions
        ?.filter((el) => el.marketType?.toLowerCase() === 'v2')
        .sort((a, b) => a.label.localeCompare(b.label)) || [];

    const marketV3 =
      deploymentOptions
        ?.filter((el) => el.marketType?.toLowerCase() === 'v3')
        .sort((a, b) => a.label.localeCompare(b.label)) || [];

    const noMarkets = deploymentOptions?.find(
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
  }, [deploymentOptions, selectedOptions]);

  const groupBy = selectedSingle?.[0] || 'None';

  const activeFilters = useMemo(
    () =>
      Object.entries(selectedOptions).reduce(
        (acc, [key, options]) => {
          acc[key] = options.map((option: OptionType) => option.id);
          return acc;
        },
        {} as Record<string, string[]>
      ),
    [selectedOptions]
  );

  const { chartSeries } = useChartDataProcessor({
    rawData,
    filters: activeFilters,
    filterPaths: {
      chain: 'source.network',
      assetType: 'source.asset.type',
      deployment: 'source.market',
      symbol: 'source.asset.symbol'
    },
    groupBy,
    groupByKeyPath:
      groupBy === 'None'
        ? null
        : filterOptionsConfig[
            groupByMapping[groupBy] as keyof typeof filterOptionsConfig
          ].path,
    defaultSeriesName: 'Treasury Value'
  });

  const correctedChartSeries = useMemo(() => {
    if (!chartSeries || chartSeries.length === 0) {
      return [];
    }

    return chartSeries.map((series) => {
      if (!series.data || series.data.length === 0) {
        return series;
      }

      const dailyTotals = new Map<number, number>();

      for (const point of series.data) {
        const date = new Date(point.x);
        date.setUTCHours(0, 0, 0, 0);
        const dayStartTimestamp = date.getTime();

        const currentTotal = dailyTotals.get(dayStartTimestamp) || 0;
        dailyTotals.set(dayStartTimestamp, currentTotal + point.y);
      }

      const aggregatedData = Array.from(dailyTotals.entries()).map(
        ([x, y]) => ({
          x,
          y
        })
      );

      aggregatedData.sort((a, b) => a.x - b.x);

      return {
        ...series,
        data: aggregatedData
      };
    });
  }, [chartSeries]);

  const { csvData, csvFilename } = useCSVExport({
    chartSeries: correctedChartSeries,
    barSize,
    groupBy,
    filePrefix: 'Total_Treasury_Value',
    aggregationType: 'sum'
  });

  const hasData = useMemo(() => {
    return (
      correctedChartSeries.length > 0 &&
      correctedChartSeries.some((s) => s.data.length > 0)
    );
  }, [correctedChartSeries]);

  const onSelectChain = useCallback(
    (chain: OptionType[]) => {
      const selectedChainIds = chain.map((o) => o.id);

      const filteredDeployment = selectedOptions.deployment.filter((el) =>
        selectedChainIds.length === 0
          ? true
          : (el.chain?.some((c) => selectedChainIds.includes(c)) ?? false)
      );
      setSelectedOptions({ chain, deployment: filteredDeployment });
    },
    [selectedOptions.deployment]
  );

  const onSelectAssetType = useCallback((selectedOptions: OptionType[]) => {
    setSelectedOptions({
      assetType: selectedOptions
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

  const onClearAll = useCallback(() => {
    onClearSelectedOptions();

    selectSingle('None');
  }, [onClearSelectedOptions, selectSingle]);

  return (
    <Card
      isLoading={isLoading}
      isError={isError}
      title='Total Treasury Value'
      id='total-treasury-value'
      className={{
        loading: 'min-h-[inherit]',
        container: 'min-h-[571px]',
        content: 'flex flex-col gap-3 px-10 pt-0 pb-10'
      }}
    >
      <div className='flex items-center justify-end gap-3 px-0 py-3'>
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
          isOpen={openSingle}
          selectedValue={groupBy}
          onToggle={toggleSingle}
          onClose={closeSingle}
          onSelect={selectSingle}
          disabled={isLoading}
        />
        <MultiSelect
          options={chainOptions || []}
          value={selectedOptions.chain}
          onChange={onSelectChain}
          placeholder='Chain'
          disabled={isLoading}
        />
        <MultiSelect
          options={deploymentOptionsFilter}
          value={selectedOptions.deployment}
          onChange={onSelectMarket}
          placeholder='Market'
          disabled={isLoading || !Boolean(deploymentOptionsFilter.length)}
        />
        <MultiSelect
          options={
            assetTypeOptions?.sort((a, b) => a.label.localeCompare(b.label)) ||
            []
          }
          value={selectedOptions.assetType}
          onChange={onSelectAssetType}
          placeholder='Asset Type'
          disabled={isLoading}
        />
        <MultiSelect
          options={
            symbolOptions?.sort((a, b) => a.label.localeCompare(b.label)) || []
          }
          value={selectedOptions.symbol}
          onChange={onSelectSymbol}
          placeholder='Reserve Symbols'
          disabled={isLoading}
        />
        <CSVDownloadButton
          data={csvData}
          filename={csvFilename}
        />
      </div>
      {!isLoading && !isError && !hasData ? (
        <NoDataPlaceholder onButtonClick={onClearAll} />
      ) : (
        <LineChart
          key={groupBy}
          data={correctedChartSeries}
          groupBy={groupBy}
          className='max-h-[400px]'
          barSize={barSize}
          barCountToSet={barCount}
          onVisibleBarsChange={handleVisibleBarsChange}
        />
      )}
    </Card>
  );
};

export default TotalTresuaryValue;
