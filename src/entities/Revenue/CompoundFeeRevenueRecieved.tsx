import { memo, useCallback, useMemo, useState } from 'react';

import CompoundFeeRecieved from '@/components/Charts/CompoundFeeRecieved/CompoundFeeRecieved';
import { MultiSelect } from '@/components/MultiSelect/MultiSelect';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import CSVDownloadButton from '@/components/CSVDownloadButton/CSVDownloadButton';
import { useChartControls } from '@/shared/hooks/useChartControls';
import { RevenuePageProps } from '@/shared/hooks/useRevenue';
import { capitalizeFirstLetter } from '@/shared/lib/utils/utils';
import Card from '@/shared/ui/Card/Card';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';
import SingleDropdown from '@/components/SingleDropdown/SingleDropdown';

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
  }, [rawData, selectedChains, selectedMarkets, groupBy]);

  const csvData = useMemo(() => {
    if (!chartData || chartData.length === 0 || !rawData) return [];

    if (barSize === 'D') {
      return chartData.map((row) => {
        const csvRow: Record<string, string | number> = { Date: row.date };
        Object.keys(row).forEach((key) => {
          if (key !== 'date') {
            csvRow[key] = row[key];
          }
        });
        return csvRow;
      });
    }

    const selectedChainSet = new Set(selectedChains.map((c) => c.id));
    const selectedMarketSet = new Set(selectedMarkets.map((m) => m.id));
    const isChainFilterActive = selectedChainSet.size > 0;
    const isMarketFilterActive = selectedMarketSet.size > 0;

    const filteredData = rawData
      .filter((item) => {
        const network = item.source.network;
        const marketName = item.source.market ?? 'no name';
        const chainMatch =
          !isChainFilterActive || selectedChainSet.has(network);
        const marketMatch =
          !isMarketFilterActive || selectedMarketSet.has(marketName);
        return chainMatch && marketMatch;
      })
      .sort((a, b) => a.date - b.date);

    const pointsPerBar = { D: 1, W: 7, M: 30 };
    const chunkSize = pointsPerBar[barSize];
    const groupedByDate: { [date: string]: StackedChartData } = {};
    const groupByKeyPath = groupByPathMapping[groupBy];

    for (let i = 0; i < filteredData.length; i += chunkSize) {
      const chunk = filteredData.slice(i, i + chunkSize);
      if (chunk.length === 0) continue;

      const firstPointDate = new Date(chunk[0].date * 1000);

      const date =
        barSize === 'M'
          ? new Date(firstPointDate.getFullYear(), firstPointDate.getMonth(), 1)
              .toISOString()
              .split('T')[0]
          : barSize === 'W'
            ? (() => {
                const dayOfWeek = firstPointDate.getUTCDay();
                const diff =
                  firstPointDate.getUTCDate() -
                  dayOfWeek +
                  (dayOfWeek === 0 ? -6 : 1);
                const startOfWeek = new Date(firstPointDate);
                startOfWeek.setUTCDate(diff);
                return startOfWeek.toISOString().split('T')[0];
              })()
            : firstPointDate.toISOString().split('T')[0];

      if (!groupedByDate[date]) {
        groupedByDate[date] = { date };
      }

      for (const item of chunk) {
        let seriesKey: string;
        if (groupBy === 'None') {
          seriesKey = 'Total';
        } else {
          seriesKey = getValueByPath(item, groupByKeyPath) || 'Unknown';
        }

        groupedByDate[date][seriesKey] =
          ((groupedByDate[date][seriesKey] as number) || 0) + item.value;
      }
    }

    const aggregatedData = Object.values(groupedByDate).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return aggregatedData.map((row) => {
      const csvRow: Record<string, string | number> = { Date: row.date };
      Object.keys(row).forEach((key) => {
        if (key !== 'date') {
          csvRow[key] = row[key];
        }
      });
      return csvRow;
    });
  }, [chartData, rawData, barSize, selectedChains, selectedMarkets, groupBy]);

  const csvFilename = useMemo(() => {
    const timeframe =
      barSize === 'D' ? 'Daily' : barSize === 'W' ? 'Weekly' : 'Monthly';
    const groupByText =
      groupBy === 'None' ? 'Total' : groupBy.replace(' ', '_');
    return `Compound_Fee_Revenue_${timeframe}_${groupByText}.csv`;
  }, [barSize, groupBy]);

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
