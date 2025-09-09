import React, { memo, useMemo } from 'react';
import { CSVLink } from 'react-csv';

import LineChart from '@/components/Charts/Line/Line';
import { useChartControls } from '@/shared/hooks/useChartControls';
import { useCSVExport } from '@/shared/hooks/useCSVExport';
import { useLineChart } from '@/shared/hooks/useLineChart';
import { useModal } from '@/shared/hooks/useModal';
import { ChartDataItem } from '@/shared/lib/utils/utils';
import { TokenData } from '@/shared/types/Treasury/types';
import { BarSize } from '@/shared/types/types';
import Button from '@/shared/ui/Button/Button';
import Card from '@/shared/ui/Card/Card';
import CSVDownloadButton from '@/shared/ui/CSVDownloadButton/CSVDownloadButton';
import Drawer from '@/shared/ui/Drawer/Drawer';
import Icon from '@/shared/ui/Icon/Icon';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';
import Text from '@/shared/ui/Text/Text';

interface TotalTreasuryValueProps {
  isLoading?: boolean;
  isError?: boolean;
  data?: TokenData[];
  onCopyLink?: (id: string) => void;
}

interface FiltersProps {
  barSize: BarSize;

  isLoading: boolean;

  csvFilename: string;

  csvData: Record<string, string | number>[];

  onBarSizeChange: (value: string) => void;
}

const HistoricalExpensesByNetworks = ({
  isLoading,
  isError,
  data: treasuryApiResponse
}: TotalTreasuryValueProps) => {
  const groupBy = 'Network';

  const { barSize, onBarSizeChange } = useChartControls({
    initialBarSize: 'D'
  });

  const rawData: ChartDataItem[] = useMemo(() => {
    if (!treasuryApiResponse) {
      return [];
    }
    return [...treasuryApiResponse].sort((a, b) => a.date - b.date);
  }, [treasuryApiResponse]);

  const correctedChartSeries = useMemo(() => {
    if (!rawData || rawData.length === 0) {
      return [];
    }

    const networkTotals = new Map<string, Map<number, number>>();

    for (const point of rawData) {
      const network = point.source?.network || 'unknown';
      const date = new Date(point.date);
      date.setUTCHours(0, 0, 0, 0);
      const dayStartTimestamp = date.getTime();

      if (!networkTotals.has(network)) {
        networkTotals.set(network, new Map());
      }

      const dailyTotals = networkTotals.get(network)!;
      const currentTotal = dailyTotals.get(dayStartTimestamp) || 0;
      dailyTotals.set(dayStartTimestamp, currentTotal + point.value);
    }

    return Array.from(networkTotals.entries()).map(([network, dailyTotals]) => {
      const aggregatedData = Array.from(dailyTotals.entries()).map(
        ([x, y]) => ({ x, y })
      );

      aggregatedData.sort((a, b) => a.x - b.x);

      return {
        name: network,
        data: aggregatedData
      };
    });
  }, [rawData]);

  const {
    chartRef,
    showEvents,
    isLegendEnabled,
    aggregatedSeries,
    areAllSeriesHidden,
    onAllSeriesHidden,
    onEventsData,
    onShowEvents,
    onSelectAll,
    onDeselectAll
  } = useLineChart({
    groupBy,
    data: correctedChartSeries,
    barSize
  });

  const { csvData, csvFilename } = useCSVExport({
    chartSeries: correctedChartSeries,
    barSize,
    groupBy: 'None',
    filePrefix: 'Total_Treasury_Value',
    aggregationType: 'sum'
  });

  return (
    <Card
      isLoading={isLoading}
      isError={isError}
      title='Historical expences by networks'
      id='historical-expences-by-networks'
      className={{
        loading: 'min-h-[inherit]',
        container: 'min-h-[571px] rounded-lg',
        content: 'flex flex-col gap-3 px-0 pt-0 pb-5 md:px-5 lg:px-10 lg:pb-10'
      }}
    >
      <Filters
        isLoading={isLoading || false}
        barSize={barSize}
        csvData={csvData}
        csvFilename={csvFilename}
        onBarSizeChange={onBarSizeChange}
      />
      <LineChart
        className='max-h-fit'
        key={groupBy}
        data={correctedChartSeries}
        groupBy={groupBy}
        chartRef={chartRef}
        isLegendEnabled={isLegendEnabled}
        aggregatedSeries={aggregatedSeries}
        showEvents={showEvents}
        areAllSeriesHidden={areAllSeriesHidden}
        onAllSeriesHidden={onAllSeriesHidden}
        onSelectAll={onSelectAll}
        onDeselectAll={onDeselectAll}
        onShowEvents={onShowEvents}
        onEventsData={onEventsData}
      />
    </Card>
  );
};

const Filters = memo(
  ({
    barSize,
    csvData,
    csvFilename,
    isLoading,
    onBarSizeChange
  }: FiltersProps) => {
    const {
      isOpen: isMoreOpen,
      onOpenModal: onMoreOpen,
      onCloseModal: onMoreClose
    } = useModal();

    return (
      <>
        <div className='block lg:hidden'>
          <div className='flex flex-col justify-end gap-2 px-5 py-3 sm:flex-row md:px-0'>
            <div className='flex justify-end gap-2'>
              <TabsGroup
                className={{
                  container: 'hidden w-full sm:block sm:w-auto',
                  list: 'w-auto'
                }}
                tabs={['COMP', 'USD']}
                value={'COMP'}
                onTabChange={() => {}}
              />
              <TabsGroup
                className={{
                  container: 'w-full sm:w-auto',
                  list: 'w-full sm:w-auto'
                }}
                tabs={['Lend', 'Borrow', 'Total']}
                value={'Borrow'}
                onTabChange={() => {}}
                disabled={isLoading}
              />
              <TabsGroup
                className={{
                  container: 'hidden w-full sm:block sm:w-auto',
                  list: 'w-auto'
                }}
                tabs={['D', 'W', 'M']}
                value={barSize}
                onTabChange={onBarSizeChange}
                disabled={isLoading}
              />
            </div>
            <div className='flex flex-row items-center justify-end gap-2'>
              <TabsGroup
                className={{
                  container: 'block w-full sm:hidden',
                  list: 'w-full'
                }}
                tabs={['COMP', 'USD']}
                value={'COMP'}
                onTabChange={() => {}}
              />
              <TabsGroup
                className={{
                  container: 'block w-full sm:hidden',
                  list: 'w-full'
                }}
                tabs={['D', 'W', 'M']}
                value={barSize}
                onTabChange={onBarSizeChange}
                disabled={isLoading}
              />
              <Button
                onClick={onMoreOpen}
                className='bg-secondary-27 shadow-13 flex h-9 min-w-9 rounded-lg sm:w-auto md:h-8 md:min-w-8 lg:hidden'
              >
                <Icon
                  name='3-dots'
                  className='h-6 w-6 fill-none'
                />
              </Button>
            </div>
          </div>
        </div>
        <div className='hidden lg:block'>
          <div className='flex items-center justify-end gap-2 px-0 py-3'>
            <TabsGroup
              tabs={['COMP', 'USD']}
              value={'COMP'}
              onTabChange={() => {}}
            />
            <TabsGroup
              tabs={['Lend', 'Borrow', 'Total']}
              value={'Borrow'}
              onTabChange={() => {}}
              disabled={isLoading}
            />
            <TabsGroup
              tabs={['D', 'W', 'M']}
              value={barSize}
              onTabChange={onBarSizeChange}
              disabled={isLoading}
            />
            <CSVDownloadButton
              data={csvData}
              filename={csvFilename}
              tooltipContent='CSV with the entire historical data can be downloaded'
            />
          </div>
        </div>
        <Drawer
          isOpen={isMoreOpen}
          onClose={onMoreClose}
        >
          <Text
            size='17'
            weight='700'
            align='center'
            className='mb-5'
          >
            Actions
          </Text>
          <div className='flex flex-col gap-1.5'>
            <div className='px-3 py-2'>
              <CSVLink
                data={csvData}
                filename={csvFilename}
                onClick={onMoreClose}
              >
                <div className='flex items-center gap-1.5'>
                  <Icon
                    name='download'
                    className='h-[26px] w-[26px]'
                  />
                  <Text
                    size='14'
                    weight='500'
                  >
                    CSV with the entire historical data
                  </Text>
                </div>
              </CSVLink>
            </div>
          </div>
        </Drawer>
      </>
    );
  }
);

export default HistoricalExpensesByNetworks;
