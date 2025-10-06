import React, { useState } from 'react';

import Line from '@/components/Charts/Line/Line';
import { HistoricalExpensesMobileActions } from '@/entities/Insentive/HistoricalExpensesByNetwork/HistoricalExpensesMobileActions';
import { customTooltipFormatter } from '@/entities/Insentive/HistoricalExpensesByNetwork/lib/customTooltipFormatter';
import { getCsvFileName } from '@/entities/Insentive/HistoricalExpensesByNetwork/lib/getCsvFileName';
import { useHistoricalExpensesChartSeries } from '@/entities/Insentive/HistoricalExpensesByNetwork/lib/useHistoricalExpensesChartSeries';
import { useChartControls } from '@/shared/hooks/useChartControls';
import { useCSVExport } from '@/shared/hooks/useCSVExport';
import { useFilterSyncSingle } from '@/shared/hooks/useFiltersSync';
import { useLineChart } from '@/shared/hooks/useLineChart';
import { CombinedIncentivesData } from '@/shared/types/Incentive/types';
import Card from '@/shared/ui/Card/Card';
import CSVDownloadButton from '@/shared/ui/CSVDownloadButton/CSVDownloadButton';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';
import Text from '@/shared/ui/Text/Text';

interface HistoricalExpensesByNetworksProps {
  isLoading: boolean;
  isError: boolean;
  data: CombinedIncentivesData[];
  onCopyLink?: (id: string) => void;
}

const HistoricalExpensesByNetworks = (
  props: HistoricalExpensesByNetworksProps
) => {
  const { data, isError, isLoading } = props;
  const [activeModeTab, setActiveModeTab] = useState<
    'Lend' | 'Borrow' | 'Total'
  >('Total');
  const [activeViewTab, setActiveViewTab] = useState<'COMP' | 'USD'>('COMP');
  const { barSize, onBarSizeChange } = useChartControls({
    initialBarSize: 'D'
  });
  const groupBy = 'Network';

  const { chartSeries, hasData } = useHistoricalExpensesChartSeries({
    rawData: data,
    mode: activeModeTab,
    view: activeViewTab
  });

  const {
    chartRef,
    showEvents,
    aggregatedSeries,
    onAllSeriesHidden,
    onEventsData,
    onShowEvents,
    onSelectAll,
    onDeselectAll,
    areAllSeriesHidden
  } = useLineChart({
    groupBy,
    data: chartSeries,
    barSize
  });

  useFilterSyncSingle(
    'historicalExpByNetworkMode',
    activeModeTab,
    setActiveModeTab
  );

  useFilterSyncSingle(
    'historicalExpByNetworkView',
    activeViewTab,
    setActiveViewTab
  );

  useFilterSyncSingle('historicalExpByNetworkPeriod', barSize, onBarSizeChange);

  const { csvData } = useCSVExport({
    chartSeries,
    barSize,
    groupBy: 'None',
    filePrefix: 'historical_expenses_by_networks',
    aggregationType: 'sum'
  });

  return (
    <Card
      isLoading={isLoading}
      isError={isError}
      title='Historical expenses by networks'
      id='historical-expenses-by-networks'
      className={{
        loading: 'min-h-[inherit]',
        container: 'min-h-143 rounded-lg',
        content: 'flex flex-col gap-3 px-0 pt-0 pb-5 md:px-5 lg:px-10 lg:pb-10'
      }}
    >
      <div className='flex flex-col justify-end gap-2 px-5 py-3 sm:flex-row md:px-0'>
        <div className='flex flex-wrap items-center justify-end gap-2'>
          <TabsGroup
            className={{
              container: 'w-full sm:w-auto',
              list: 'w-auto'
            }}
            tabs={['COMP', 'USD']}
            value={activeViewTab}
            onTabChange={setActiveViewTab}
          />
          <TabsGroup
            className={{
              container: 'w-full sm:w-auto',
              list: 'w-full sm:w-auto'
            }}
            tabs={['Lend', 'Borrow', 'Total']}
            value={activeModeTab}
            onTabChange={setActiveModeTab}
            disabled={isLoading}
          />
          <div className={'flex w-full items-center gap-2 sm:w-auto'}>
            <TabsGroup
              className={{
                container: 'w-full',
                list: 'w-full'
              }}
              tabs={['D', 'W', 'M']}
              value={barSize}
              onTabChange={onBarSizeChange}
              disabled={isLoading}
            />
            <HistoricalExpensesMobileActions
              csvData={csvData}
              activeModeTab={activeModeTab}
              activeViewTab={activeViewTab}
              barSize={barSize}
            />
            {/*TODO: fix download button style applying*/}
            <span className={'mt-1 hidden md:block'}>
              <CSVDownloadButton
                data={csvData}
                filename={getCsvFileName('historical_expenses_by_networks', {
                  view: activeViewTab,
                  mode: activeModeTab,
                  timeFrame: barSize
                })}
              />
            </span>
          </div>
        </div>
      </div>
      {!isLoading && !isError && !hasData ? (
        <div
          className={
            'flex h-[400px] flex-col items-center justify-center gap-4'
          }
        >
          <Text
            size='12'
            className='text-primary-14'
          >
            No data
          </Text>
        </div>
      ) : (
        <Line
          key={`${groupBy}`}
          data={chartSeries}
          groupBy={groupBy}
          aggregatedSeries={aggregatedSeries}
          className='max-h-fit'
          chartRef={chartRef}
          showEvents={showEvents}
          onAllSeriesHidden={onAllSeriesHidden}
          onSelectAll={onSelectAll}
          onDeselectAll={onDeselectAll}
          onShowEvents={onShowEvents}
          onEventsData={onEventsData}
          areAllSeriesHidden={areAllSeriesHidden}
          isLegendEnabled={true}
          // @ts-expect-error TODO: fix customTooltip types
          customTooltipFormatter={customTooltipFormatter(activeViewTab)}
        />
      )}
    </Card>
  );
};

export default HistoricalExpensesByNetworks;
