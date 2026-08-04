import React, { useMemo } from 'react';
import { useQueryState } from 'nuqs';

import ChartIconToggle from '@/components/ChartIconToggle/ChartIconToggle';
import { ChartActions } from '@/components/Charts/ChartActions';
import Line from '@/components/Charts/Line/Line';
import { DateRangePickerFilter } from '@/components/Filter/DateRangePickerFilter/DateRangePickerFilter';
import { Filters } from '@/components/Filter/Filters';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import {
  customChartOptions,
  customTooltipFormatter
} from '@/entities/Insentive/HistoricalExpensesByNetwork/lib/customTooltipFormatter';
import {
  useHistoricalExpensesChartSeries
} from '@/entities/Insentive/HistoricalExpensesByNetwork/lib/useHistoricalExpensesChartSeries';
import { useBarSizeWithDateRange } from '@/shared/hooks/useBarSizeWithDateRange';
import { useLegends } from '@/shared/hooks/useLegends';
import { useLineChart } from '@/shared/hooks/useLineChart';
import { getCsvFileName } from '@/shared/lib/utils/getCsvFileName';
import { getSummarizedCsvData } from '@/shared/lib/utils/getSummarizedCsvData';
import { parseAsTimestampMs } from '@/shared/lib/utils/utils';
import { CombinedIncentivesData } from '@/shared/types/Incentive/types';
import { BAR_SIZE_OPTIONS } from '@/shared/types/types';
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

  const [activeModeTab, setActiveModeTab] = useQueryState('hebn-mode', { defaultValue: 'Total' });
  const [activeCurrencyTab, setActiveCurrencyTab] = useQueryState('hebn-currency', { defaultValue: 'COMP' });
  const [startDate, setStartDate] = useQueryState('hebn-start', parseAsTimestampMs);
  const [endDate, setEndDate] = useQueryState('hebn-end', parseAsTimestampMs);

  const { barSize, onBarSizeChange, disabledBarSizes } = useBarSizeWithDateRange({ startDate, endDate });

  const clearAllFilters = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const groupBy = 'Network';

  const dateFilteredData = useMemo(() => {
    if (startDate === null && endDate === null) return data;

    return data.filter((item) => {
      const itemTime = item.date * 1000;
      if (startDate !== null && itemTime < startDate) return false;
      if (endDate !== null && itemTime > endDate) return false;
      return true;
    });
  }, [data, startDate, endDate]);

  const { chartSeries, hasData } = useHistoricalExpensesChartSeries({
    rawData: dateFilteredData,
    mode: activeModeTab,
    view: activeCurrencyTab
  });

  const { aggregatedSeries, isLegendEnabled } = useLineChart({
    groupBy,
    data: chartSeries,
    barSize,
    isAggregate: true
  });

  const hasAggregatedData = useMemo(
    () =>
      aggregatedSeries.some((s) => Array.isArray(s.data) && s.data.length > 0),
    [aggregatedSeries]
  );

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
      <div className={'gap-2 px-5 md:px-0 py-3 items-center justify-end hidden sm:flex'}>
        <Filters
          isShowClear={!!(startDate || endDate)}
          onClearAll={clearAllFilters}
        >
          <DateRangePickerFilter
            triggerLabel='Date Range'
            value={{ startDate, endDate }}
            onChange={({ startDate, endDate }) => {
              setStartDate(startDate);
              setEndDate(endDate);
            }}
          />
        </Filters>
        <TabsGroup
          className={{
            container: 'w-full sm:w-auto',
            list: 'w-auto'
          }}
          tabs={['COMP', 'USD']}
          value={activeCurrencyTab}
          onTabChange={setActiveCurrencyTab}
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
            tabs={BAR_SIZE_OPTIONS}
            value={barSize}
            onTabChange={onBarSizeChange}
            disabled={isLoading}
            disabledTabs={disabledBarSizes}
          />
          <ChartActions
            mobileChildren={
              <>
                <CSVDownloadButton
                  data={() => getSummarizedCsvData(aggregatedSeries)}
                  filename={getCsvFileName('historical_expenses_by_networks', {
                    view: activeCurrencyTab,
                    mode: activeModeTab,
                    timeFrame: barSize
                  })}
                />
                <ChartIconToggle
                  active={isSeriesHidden}
                  onIcon='eye'
                  offIcon='eye-closed'
                  ariaLabel='Toggle all series visibility'
                  className={{
                    container:
                      'flex items-center gap-1.5 bg-transparent p-0 !shadow-none',
                    icon: 'h-6.5 w-6.5',
                    iconContainer: 'h-6.5 w-6.5'
                  }}
                  onClick={onEyeClick}
                >
                  <Text
                    size='14'
                    weight='500'
                  >
                    {isSeriesHidden ? 'Select All' : 'Unselect All'}
                  </Text>
                </ChartIconToggle>
              </>
            }
          >
            <CSVDownloadButton
              data={() => getSummarizedCsvData(aggregatedSeries)}
              tooltipContent={
                'CSV with the entire historical data can be downloaded'
              }
              filename={getCsvFileName('historical_expenses_by_networks', {
                view: activeCurrencyTab,
                mode: activeModeTab,
                timeFrame: barSize
              })}
            />
          </ChartActions>
        </div>
      </div>
      {/*mobile layout*/}
      <div className={'sm:hidden flex flex-col gap-2 px-5 py-3'}>
        <Filters
          isShowClear={!!(startDate || endDate)}
          onClearAll={clearAllFilters}
        >
          <DateRangePickerFilter
            triggerLabel='Date Range'
            value={{ startDate, endDate }}
            onChange={({ startDate, endDate }) => {
              setStartDate(startDate);
              setEndDate(endDate);
            }}
          />
        </Filters>
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
        <div className={'flex gap-2'}>
          <TabsGroup
            className={{
              container: 'w-full sm:w-auto',
              list: 'w-auto'
            }}
            tabs={['COMP', 'USD']}
            value={activeCurrencyTab}
            onTabChange={setActiveCurrencyTab}
          />
          <TabsGroup
            className={{
              container: 'w-full',
              list: 'w-full'
            }}
            tabs={BAR_SIZE_OPTIONS}
            value={barSize}
            onTabChange={onBarSizeChange}
            disabled={isLoading}
            disabledTabs={disabledBarSizes}
          />
          <ChartActions
            mobileChildren={
              <>
                <CSVDownloadButton
                  data={() => getSummarizedCsvData(aggregatedSeries)}
                  filename={getCsvFileName('historical_expenses_by_networks', {
                    view: activeCurrencyTab,
                    mode: activeModeTab,
                    timeFrame: barSize
                  })}
                />
                <ChartIconToggle
                  active={isSeriesHidden}
                  onIcon='eye'
                  offIcon='eye-closed'
                  ariaLabel='Toggle all series visibility'
                  className={{
                    container:
                      'flex items-center gap-1.5 bg-transparent p-0 !shadow-none',
                    icon: 'h-6.5 w-6.5',
                    iconContainer: 'h-6.5 w-6.5'
                  }}
                  onClick={onEyeClick}
                >
                  <Text
                    size='14'
                    weight='500'
                  >
                    {isSeriesHidden ? 'Select All' : 'Unselect All'}
                  </Text>
                </ChartIconToggle>
              </>
            }
          >
            <></>
          </ChartActions>
        </div>
      </div>
      {!isLoading && !isError && (!hasData || !hasAggregatedData) ? (
        <NoDataPlaceholder onButtonClick={clearAllFilters} />
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
          customOptions={customChartOptions(activeCurrencyTab)}
          resetZoomKey={`${barSize}-${startDate}-${endDate}`}
          customTooltipFormatter={customTooltipFormatter(activeCurrencyTab)}
        />
      )}
    </Card>
  );
};

export default HistoricalExpensesByNetworks;
