import { memo, useCallback, useMemo, useState } from 'react';

import CompoundFeeRecieved from '@/components/Charts/CompoundFeeRecieved/CompoundFeeRecieved';
import CSVDownloadButton from '@/components/CSVDownloadButton/CSVDownloadButton';
import { MultiSelect } from '@/components/MultiSelect/MultiSelect';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import SingleDropdown from '@/components/SingleDropdown/SingleDropdown';
import { useChartControls } from '@/shared/hooks/useChartControls';
import { useCSVExport } from '@/shared/hooks/useCSVExport';
import { RevenuePageProps } from '@/shared/hooks/useRevenue';
import { capitalizeFirstLetter } from '@/shared/lib/utils/utils';
import Card from '@/shared/ui/Card/Card';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';

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

type OptionType = { id: string; label: string; marketType?: string };

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

  const [selectedChains, setSelectedChains] = useState<OptionType[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<OptionType[]>([]);

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

  const handleResetFilters = useCallback(() => {
    setSelectedChains([]);
    setSelectedMarkets([]);
    setGroupBy('Chain');
  }, []);

  const { chainOptions, marketOptions, chartData } = useMemo(() => {
    if (!rawData || rawData.length === 0) {
      return {
        chainOptions: [],
        marketOptions: [],
        chartData: []
      };
    }

    const selectedChainSet = new Set(selectedChains.map((c) => c.id));
    const selectedMarketSet = new Set(selectedMarkets.map((m) => m.id));
    const isChainFilterActive = selectedChainSet.size > 0;
    const isMarketFilterActive = selectedMarketSet.size > 0;

    const uniqueChains = new Set<string>();
    const uniqueMarkets = new Set<string>();
    const groupedByDate: { [date: string]: StackedChartData } = {};
    const groupByKeyPath = groupByPathMapping[groupBy];

    for (const item of rawData) {
      const network = item.source.network;
      const marketName = item.source.market ?? 'no name';

      uniqueChains.add(network);
      uniqueMarkets.add(marketName);

      const chainMatch = !isChainFilterActive || selectedChainSet.has(network);
      if (!chainMatch) continue;

      const marketMatch =
        !isMarketFilterActive || selectedMarketSet.has(marketName);
      if (!marketMatch) continue;

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
          const option: OptionType & { marketType?: string } = {
            id: value,
            label: capitalizeFirstLetter(value)
          };

          if (key === 'market') {
            const match = rawData.find(
              (item) => getValueByPath(item, 'source.market') === value
            );

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
      marketOptions: createOptions(uniqueMarkets, 'market'),
      chartData: finalChartData
    };
  }, [rawData, selectedChains, selectedMarkets, groupBy]);

  const { csvData, csvFilename } = useCSVExport({
    stackedData: chartData,
    barSize,
    groupBy,
    filePrefix: 'Compound_Fee_Revenue',
    aggregationType: 'sum',
    rawData,
    selectedChains,
    selectedMarkets,
    groupByPathMapping,
    getValueByPath
  });

  const deploymentOptionsFilter = useMemo(() => {
    const marketV2 =
      marketOptions
        ?.filter((el) => el?.marketType?.toLowerCase() === 'v2')
        .sort((a: OptionType, b: OptionType) =>
          a.label.localeCompare(b.label)
        ) || [];

    const marketV3 =
      marketOptions
        ?.filter((el) => el?.marketType?.toLowerCase() === 'v3')
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
  }, [marketOptions]);

  const hasData = chartData.length > 0;
  const noDataMessage =
    selectedChains.length > 0 || selectedMarkets.length > 0
      ? 'No data for selected filters'
      : 'No data available';

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
            value={selectedChains}
            onChange={setSelectedChains}
            placeholder='Chain'
          />
          <MultiSelect
            options={deploymentOptionsFilter || []}
            value={selectedMarkets}
            onChange={setSelectedMarkets}
            placeholder='Market'
          />
        </div>
        <TabsGroup
          tabs={['D', 'W', 'M']}
          value={barSize}
          onTabChange={handleBarSizeChange}
        />
        <TabsGroup
          tabs={['7B', '30B', '90B', '180B']}
          value={activeTab}
          onTabChange={handleTabChange}
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
