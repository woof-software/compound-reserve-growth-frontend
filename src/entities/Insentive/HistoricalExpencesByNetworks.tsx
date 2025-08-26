import React, { memo, useCallback, useMemo, useReducer } from 'react';

import LineChart from '@/components/Charts/Line/Line';
import CSVDownloadButton from '@/components/CSVDownloadButton/CSVDownloadButton';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import { useChartControls } from '@/shared/hooks/useChartControls';
import { useChartDataProcessor } from '@/shared/hooks/useChartDataProcessor';
import { useCSVExport } from '@/shared/hooks/useCSVExport';
import { ChartDataItem } from '@/shared/lib/utils/utils';
import { TokenData } from '@/shared/types/Treasury/types';
import { BarSize, OptionType, TimeRange } from '@/shared/types/types';
import Card from '@/shared/ui/Card/Card';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';

interface TotalTreasuryValueProps {
  isLoading?: boolean;
  isError?: boolean;
  data?: TokenData[];
  onCopyLink?: (id: string) => void;
}

interface FiltersProps {
  barSize: BarSize;

  activeTab: TimeRange | null;

  isLoading: boolean;

  csvFilename: string;

  csvData: Record<string, string | number>[];

  handleBarSizeChange: (value: string) => void;

  handleTabChange: (value: string) => void;
}

const HistoricalExpencesByNetworks = ({
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
    groupBy: 'None',
    groupByKeyPath: null,
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
    groupBy: 'None',
    filePrefix: 'Total_Treasury_Value',
    aggregationType: 'sum'
  });

  const hasData = useMemo(() => {
    return (
      correctedChartSeries.length > 0 &&
      correctedChartSeries.some((s) => s.data.length > 0)
    );
  }, [correctedChartSeries]);

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
  }, [onClearSelectedOptions]);

  return (
    <Card
      isLoading={isLoading}
      isError={isError}
      title='Historical expences by networks'
      id='historical-expences-by-networks'
      className={{
        loading: 'min-h-[inherit]',
        container: 'min-h-[571px] rounded-lg',
        content: 'flex flex-col gap-3 px-0 pt-0 pb-5 md:px-10 md:pb-10'
      }}
    >
      <Filters
        isLoading={isLoading || false}
        barSize={barSize}
        activeTab={activeTab}
        csvData={csvData}
        csvFilename={csvFilename}
        handleBarSizeChange={handleBarSizeChange}
        handleTabChange={handleTabChange}
      />
      {!isLoading && !isError && !hasData ? (
        <NoDataPlaceholder onButtonClick={onClearAll} />
      ) : (
        <LineChart
          // key={groupBy}
          data={correctedChartSeries}
          groupBy={'None'}
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
    csvData,
    csvFilename,
    isLoading,
    handleBarSizeChange,
    handleTabChange
  }: FiltersProps) => {
    return (
      <>
        <div className='block lg:hidden'>
          <div className='flex flex-col justify-end gap-3 px-5 py-3'>
            <div className='flex flex-wrap justify-end gap-3'>
              <TabsGroup
                tabs={['Lend Incentive', 'Borrow Incentive', 'Total']}
                value={'Borrow Incentive'}
                onTabChange={() => {}}
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
            </div>
            <div className='flex flex-wrap items-center justify-end gap-3'>
              <CSVDownloadButton
                data={csvData}
                filename={csvFilename}
                tooltipContent='CSV with the entire historical data can be downloaded'
              />
            </div>
          </div>
        </div>
        <div className='hidden lg:block'>
          <div className='flex items-center justify-end gap-3 px-0 py-3'>
            <TabsGroup
              tabs={['Lend Incentive', 'Borrow Incentive', 'Total']}
              value={'Borrow Incentive'}
              onTabChange={() => {}}
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
            <CSVDownloadButton
              data={csvData}
              filename={csvFilename}
              tooltipContent='CSV with the entire historical data can be downloaded'
            />
          </div>
        </div>
      </>
    );
  }
);

export default HistoricalExpencesByNetworks;
