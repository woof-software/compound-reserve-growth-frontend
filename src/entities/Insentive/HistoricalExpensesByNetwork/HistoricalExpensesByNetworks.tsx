import React, { useState } from 'react';

import Line from '@/components/Charts/Line/Line';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import { HistoricalExpensesMobileActions } from '@/entities/Insentive/HistoricalExpensesByNetwork/HistoricalExpensesMobileActions';
import {
  customChartOptions,
  customTooltipFormatter
} from '@/entities/Insentive/HistoricalExpensesByNetwork/lib/customTooltipFormatter';
import { useHistoricalExpensesChartSeries } from '@/entities/Insentive/HistoricalExpensesByNetwork/lib/useHistoricalExpensesChartSeries';
import { useChartControls } from '@/shared/hooks/useChartControls';
import { useFilterSyncSingle } from '@/shared/hooks/useFiltersSync';
import { useLegends } from '@/shared/hooks/useLegends';
import { useLineChart } from '@/shared/hooks/useLineChart';
import { getCsvFileName } from '@/shared/lib/utils/getCsvFileName';
import { getSummarizedCsvData } from '@/shared/lib/utils/getSummarizedCsvData';
import { CombinedIncentivesData } from '@/shared/types/Incentive/types';
import Card from '@/shared/ui/Card/Card';
import CSVDownloadButton from '@/shared/ui/CSVDownloadButton/CSVDownloadButton';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';

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

  const { aggregatedSeries, isLegendEnabled } = useLineChart({
    groupBy,
    data: chartSeries,
    barSize,
    isAggregate: true
  });

  const {
    legends,
    toggle: onLegendToggle,
    activateAll: onSelectAllLegends,
    deactivateAll: onDeselectAllLegends,
    highlight: onLegendHover,
    unhighlight: onLegendUnhover
  } = useLegends(aggregatedSeries, ({ name, color }) => ({
    id: `${name}`,
    name: `${name}`,
    isDisabled: false,
    isHighlighted: false,
    color: `${color}`
  }));

  const isSeriesHidden = legends.every((l) => l.isDisabled);

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

  const csvData = getSummarizedCsvData(aggregatedSeries);

  const onEyeClick = () => {
    if (isSeriesHidden) {
      onSelectAllLegends();
    } else {
      onDeselectAllLegends();
    }
  };

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
        <div className='hidden flex-wrap items-center justify-end gap-2 sm:flex'>
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
              areAllSeriesHidden={isSeriesHidden}
              onEyeClick={onEyeClick}
            />
            {/*TODO: fix download button style applying*/}
            <span className={'mt-1 hidden lg:block'}>
              <CSVDownloadButton
                data={csvData}
                tooltipContent={
                  'CSV with the entire historical data can be downloaded'
                }
                filename={getCsvFileName('historical_expenses_by_networks', {
                  view: activeViewTab,
                  mode: activeModeTab,
                  timeFrame: barSize
                })}
              />
            </span>
          </div>
        </div>
        <div className='flex flex-wrap items-center justify-end gap-2 sm:hidden'>
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
                container: 'w-full sm:w-auto',
                list: 'w-auto'
              }}
              tabs={['COMP', 'USD']}
              value={activeViewTab}
              onTabChange={setActiveViewTab}
            />
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
              areAllSeriesHidden={isSeriesHidden}
              onEyeClick={onEyeClick}
            />
          </div>
        </div>
      </div>
      {!isLoading && !isError && !hasData ? (
        <NoDataPlaceholder isHideButton={true} />
      ) : (
        <Line
          key={groupBy}
          groupBy={groupBy}
          aggregatedSeries={aggregatedSeries}
          className='max-h-fit'
          legends={legends}
          isLegendEnabled={isLegendEnabled}
          onSelectAllLegends={onSelectAllLegends}
          onDeselectAllLegends={onDeselectAllLegends}
          onLegendLeave={onLegendUnhover}
          onLegendHover={onLegendHover}
          onLegendClick={onLegendToggle}
          customOptions={customChartOptions(activeViewTab)}
          // @ts-expect-error TODO: fix customTooltip types
          customTooltipFormatter={customTooltipFormatter(activeViewTab)}
        />
      )}
    </Card>
  );
};

export default HistoricalExpensesByNetworks;
