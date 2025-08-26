import React, { memo, useCallback, useMemo, useReducer } from 'react';

import LineChart from '@/components/Charts/Line/Line';
import CSVDownloadButton from '@/components/CSVDownloadButton/CSVDownloadButton';
import Filter from '@/components/Filter/Filter';
import { MultiSelect } from '@/components/MultiSelect/MultiSelect';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import SingleDropdown, {
  SingleDrawer
} from '@/components/SingleDropdown/SingleDropdown';
import { useChartControls } from '@/shared/hooks/useChartControls';
import { useChartDataProcessor } from '@/shared/hooks/useChartDataProcessor';
import { useCSVExport } from '@/shared/hooks/useCSVExport';
import { useModal } from '@/shared/hooks/useModal';
import { ChartDataItem, extractFilterOptions } from '@/shared/lib/utils/utils';
import { TokenData } from '@/shared/types/Treasury/types';
import { BarSize, OptionType, TimeRange } from '@/shared/types/types';
import Button from '@/shared/ui/Button/Button';
import Card from '@/shared/ui/Card/Card';
import { useDropdown } from '@/shared/ui/Dropdown/Dropdown';
import Icon from '@/shared/ui/Icon/Icon';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';
import Text from '@/shared/ui/Text/Text';

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

interface FiltersProps {
  chainOptions: OptionType[];

  deploymentOptionsFilter: OptionType[];

  assetTypeOptions: OptionType[];

  symbolOptions: OptionType[];

  barSize: BarSize;

  activeTab: TimeRange | null;

  isLoading: boolean;

  isOpenSingle: boolean;

  groupBy: string;

  csvFilename: string;

  csvData: Record<string, string | number>[];

  selectedOptions: {
    chain: OptionType[];

    assetType: OptionType[];

    deployment: OptionType[];

    symbol: OptionType[];
  };

  onSelectChain: (chain: OptionType[]) => void;

  onSelectAssetType: (assetType: OptionType[]) => void;

  onSelectMarket: (deployment: OptionType[]) => void;

  onSelectSymbol: (symbol: OptionType[]) => void;

  handleBarSizeChange: (value: string) => void;

  handleTabChange: (value: string) => void;

  openSingleDropdown: () => void;

  closeSingle: () => void;

  onClearAll: () => void;

  selectSingle: (value: string) => void;

  selectSingleClose: (value: string) => void;
}

const IncomeVsExpensesOnChainsAndMarkets = ({
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
    isOpen: isOpenSingle,
    selectedValue: selectedSingle,
    close: closeSingle,
    open: openSingleDropdown,
    select: selectSingle,
    selectClose: selectSingleClose
  } = useDropdown('single');

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
        container: 'min-h-[571px] rounded-lg',
        content: 'flex flex-col gap-3 px-0 pt-0 pb-5 md:px-10 md:pb-10'
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
        isOpenSingle={isOpenSingle}
        onSelectChain={onSelectChain}
        onSelectAssetType={onSelectAssetType}
        onSelectMarket={onSelectMarket}
        onSelectSymbol={onSelectSymbol}
        handleBarSizeChange={handleBarSizeChange}
        handleTabChange={handleTabChange}
        openSingleDropdown={openSingleDropdown}
        closeSingle={closeSingle}
        selectSingle={selectSingle}
        selectSingleClose={selectSingleClose}
        onClearAll={onClearAll}
      />
      {!isLoading && !isError && !hasData ? (
        <NoDataPlaceholder onButtonClick={onClearAll} />
      ) : (
        <LineChart
          key={groupBy}
          data={correctedChartSeries}
          groupBy={groupBy}
          className='max-h-fit'
          barSize={barSize}
          barCountToSet={barCount}
          onZoom={handleResetActiveTab}
        />
      )}
    </Card>
  );
};

const Filters = memo(
  ({
    barSize,
    activeTab,
    isOpenSingle,
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
    openSingleDropdown,
    closeSingle,
    selectSingle,
    selectSingleClose,
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
        total: selectedOptions.deployment.length,
        selectedOptions: selectedOptions.deployment,
        options: deploymentOptionsFilter || [],
        onChange: onSelectMarket
      };

      const assetTypeFilterOptions = {
        id: 'assetType',
        placeholder: 'Asset Type',
        total: selectedOptions.assetType.length,
        selectedOptions: selectedOptions.assetType,
        options:
          assetTypeOptions?.sort((a, b) => a.label.localeCompare(b.label)) ||
          [],
        onChange: onSelectAssetType
      };

      return [chainFilterOptions, marketFilterOptions, assetTypeFilterOptions];
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
                  isOpen={isOpenSingle}
                  selectedValue={groupBy}
                  onOpen={openSingleDropdown}
                  onClose={closeSingle}
                  onSelect={(value: string) => {
                    selectSingle(value);
                  }}
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
        <div className='hidden lg:block'>
          <div className='flex items-center justify-end gap-3 px-0 py-3'>
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
                isOpen={isOpenSingle}
                selectedValue={groupBy}
                onOpen={openSingleDropdown}
                onClose={closeSingle}
                onSelect={(value: string) => {
                  selectSingleClose(value);
                }}
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
      </>
    );
  }
);

export default IncomeVsExpensesOnChainsAndMarkets;
