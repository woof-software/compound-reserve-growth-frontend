import { memo, useCallback, useMemo, useState } from 'react';

import CompoundFeeRecieved from '@/components/Charts/CompoundFeeRecieved/CompoundFeeRecieved';
import { MultiSelect } from '@/components/MultiSelect/MultiSelect';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import { useChartControls } from '@/shared/hooks/useChartControls';
import { RevenuePageProps } from '@/shared/hooks/useRevenue';
import { capitalizeFirstLetter } from '@/shared/lib/utils/utils';
import Card from '@/shared/ui/Card/Card';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';

interface StackedChartData {
  date: string;
  [key: string]: string | number;
}

type OptionType = { id: string; label: string };

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

  const handleResetFilters = useCallback(() => {
    setSelectedChains([]);
    setSelectedMarkets([]);
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
      const seriesKey = network;

      if (!groupedByDate[date]) {
        groupedByDate[date] = { date };
      }

      groupedByDate[date][seriesKey] =
        ((groupedByDate[date][seriesKey] as number) || 0) + item.value;
    }

    const createOptions = (uniqueValues: Set<string>): OptionType[] => {
      return Array.from(uniqueValues)
        .sort((a, b) => a.localeCompare(b))
        .map((value) => ({
          id: value,
          label: capitalizeFirstLetter(value)
        }));
    };

    const finalChartData = Object.values(groupedByDate).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return {
      chainOptions: createOptions(uniqueChains),
      marketOptions: createOptions(uniqueMarkets),
      chartData: finalChartData
    };
  }, [rawData, selectedChains, selectedMarkets]);

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
            options={marketOptions}
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
      </div>
      {!isLoading && !isError && !hasData ? (
        <NoDataPlaceholder
          onButtonClick={handleResetFilters}
          text={noDataMessage}
        />
      ) : (
        <CompoundFeeRecieved
          data={chartData}
          barCount={barCount}
          barSize={barSize}
          onVisibleBarsChange={handleVisibleBarsChange}
        />
      )}
    </Card>
  );
};

export default memo(CompoundFeeRevenueRecieved);
