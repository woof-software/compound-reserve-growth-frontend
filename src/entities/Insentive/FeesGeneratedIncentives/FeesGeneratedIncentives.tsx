import React, { useMemo } from 'react';
import { parseAsBoolean, useQueryState } from 'nuqs';

import { ChartActions } from '@/components/Charts/ChartActions';
import Line from '@/components/Charts/Line/Line';
import { DateRangePickerFilter } from '@/components/Filter/DateRangePickerFilter/DateRangePickerFilter';
import { DropdownFilter } from '@/components/Filter/DropdownFilter/DropdownFilter';
import { Filters } from '@/components/Filter/Filters';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import {
  customChartOptions,
  customTooltipFormatter
} from '@/entities/Insentive/FeesGeneratedIncentives/lib/customTooltipFormatter';
import { getGeneratedIncentivesChartSeries } from '@/entities/Insentive/FeesGeneratedIncentives/lib/getGeneratedIncentivesChartSeries';
import { NOT_MARKET } from '@/shared/consts/consts';
import { useOptions } from '@/shared/hooks/filters/useOptions';
import { useBarSizeWithDateRange } from '@/shared/hooks/useBarSizeWithDateRange';
import { useLineChart } from '@/shared/hooks/useLineChart';
import { getCsvFileName } from '@/shared/lib/utils/getCsvFileName';
import { convertSeriesToCsv } from '@/shared/lib/utils/convertSeriesToCsv';
import { capitalizeFirstLetter, parseAsTimestampMs, parseStingsArray } from '@/shared/lib/utils/utils';
import { CombinedIncentivesData } from '@/shared/types/Incentive/types';
import { BAR_SIZE_OPTIONS } from '@/shared/types/types';
import Card from '@/shared/ui/Card/Card';
import CSVDownloadButton from '@/shared/ui/CSVDownloadButton/CSVDownloadButton';
import Switch from '@/shared/ui/Switch/Switch';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';

interface FeesGeneratedIncentivesProps {
  data: CombinedIncentivesData[];
  isLoading: boolean;
  isError: boolean;
}

const FeesGeneratedIncentives = (props: FeesGeneratedIncentivesProps) => {
  const { data, isLoading, isError } = props;

  const [selectedChainKeys, setSelectedChainKeys] = useQueryState('rvi-chain', parseStingsArray([]));
  const [selectedMarketKeys, setSelectedMarketKeys] = useQueryState('rvi-market', parseStingsArray([]));
  const [isRevenueOnly, setIsRevenueOnly ] = useQueryState('rvi-isRevenueOnly',  parseAsBoolean.withDefault(false));
  const [startDate, setStartDate] = useQueryState('rvi-start', parseAsTimestampMs);
  const [endDate, setEndDate] = useQueryState('rvi-end', parseAsTimestampMs);

  const chainOptions = useMemo(() => {
    const uniqueNetworks = [...new Set(data.map(d => d.source.network))];
    const filteredNetworks = uniqueNetworks.filter(network => network !== 'mainnet');
    const optionNetworks = filteredNetworks.map(network => ({ label: capitalizeFirstLetter(network), value: network }));

    return [
      { label: 'Mainnet', value: 'mainnet' },
      ...optionNetworks
    ];
  }, [data]);


  const {
    selectedOptions: selectedChainOptions,
    setSelectedOptions: setSelectedChainOptions,
  } = useOptions(chainOptions, selectedChainKeys, setSelectedChainKeys);

  const selectedChainOptionsSet = useMemo(
    () => new Set(selectedChainOptions.map(o => o.value)),
    [selectedChainOptions]
  );

  const byChain = useMemo(() => (
    !selectedChainOptions.length
      ? data
      : data.filter(d => selectedChainOptionsSet.has(d.source.network))
  ), [data, selectedChainOptions]);

  const marketOptions = useMemo(() => (
    [...new Set(byChain.map(d => d.source.market ?? NOT_MARKET))]
      .sort()
      .map(value => ({ label: capitalizeFirstLetter(value), value }))
  ), [byChain]);

  const {
    selectedOptions: selectedMarketOptions,
    setSelectedOptions: setSelectedMarketOptions,
  } = useOptions(marketOptions, selectedMarketKeys, setSelectedMarketKeys);

  const selectedMarketOptionsSet = useMemo(
    () => new Set(selectedMarketOptions.map(o => o.value)),
    [selectedMarketOptions]
  );

  const filteredData = useMemo(() => (
    !selectedMarketOptions.length
      ? byChain
      : byChain.filter(d => selectedMarketOptionsSet.has(d.source.market ?? NOT_MARKET))
  ), [byChain, selectedMarketOptions]);

  const clearAllFilters = () => {
    setSelectedChainKeys([]);
    setSelectedMarketKeys([]);
    setIsRevenueOnly(false);
    setStartDate(null);
    setEndDate(null);
  };

  const isAnyFiltersSelected =
    startDate !== null ||
    endDate !== null ||
    !!selectedChainOptions.length ||
    !!selectedMarketOptions.length;

  const { barSize, onBarSizeChange, disabledBarSizes } = useBarSizeWithDateRange({ startDate, endDate });

  const groupBy = 'None';

  const dateFilteredData = useMemo(() => {
    if (startDate === null && endDate === null) return filteredData;

    return filteredData.filter((item) => {
      const itemTime = item.date * 1000;
      if (startDate !== null && itemTime < startDate) return false;
      if (endDate !== null && itemTime > endDate) return false;
      return true;
    });
  }, [filteredData, startDate, endDate]);

  const chartSeries = getGeneratedIncentivesChartSeries(dateFilteredData);

  const displaySeries = isRevenueOnly
    ? chartSeries.filter((series) => series.name === 'Revenue')
    : chartSeries;

  const { aggregatedSeries } = useLineChart({
    groupBy,
    data: displaySeries,
    barSize,
    isAggregate: true
  });

  const hasAggregatedData = useMemo(
    () =>
      aggregatedSeries.some((s) => Array.isArray(s.data) && s.data.length > 0),
    [aggregatedSeries]
  );


  return (
    <Card
      isLoading={isLoading}
      isError={isError}
      title='Revenue vs Incentives'
      id='fees-generated-vs-incentives'
      className={{
        loading: 'min-h-[inherit]',
        container: 'min-h-[571px] rounded-lg',
        content: 'flex flex-col gap-3 px-0 pt-0 pb-5 md:px-5 lg:px-10 lg:pb-10'
      }}
    >
      <div className='flex flex-col-reverse items-center justify-end gap-2 py-3 px-5 sm:flex-row lg:px-0'>
        <div className='w-full sm:w-auto'>
          <TabsGroup
            className={{
              container: 'w-full sm:w-auto',
              list: 'w-full sm:w-auto'
            }}
            tabs={BAR_SIZE_OPTIONS}
            value={barSize}
            onTabChange={onBarSizeChange}
            disabled={isLoading}
            disabledTabs={disabledBarSizes}
          />
        </div>
        <div className='flex w-full items-center justify-end gap-2 sm:w-auto'>
          <Filters
            onClearAll={clearAllFilters}
            isShowClear={isAnyFiltersSelected}
          >
            <DateRangePickerFilter
              triggerLabel='Date Range'
              value={{startDate, endDate}}
              onChange={({startDate, endDate}) => {
                setStartDate(startDate);
                setEndDate(endDate);
              }}
            />
            <DropdownFilter
              triggerLabel={'Chain'}
              options={chainOptions}
              selectedOptions={selectedChainOptions}
              getKey={(v) => v.value}
              getLabel={(v) => v.label}
              setValue={setSelectedChainOptions}
            />
            <DropdownFilter
              triggerLabel={'Market'}
              options={marketOptions}
              selectedOptions={selectedMarketOptions}
              getKey={(v) => v.value}
              getLabel={(v) => v.label}
              setValue={setSelectedMarketOptions}
            />
          </Filters>
          <Switch
            label='Revenue Only'
            positionLabel='left'
            checked={isRevenueOnly}
            onCheckedChange={setIsRevenueOnly}
            className={{ title: '!text-[11px]' }}
          />
          <ChartActions
            mobileChildren={
              <CSVDownloadButton
                data={() => convertSeriesToCsv(aggregatedSeries)}
                filename={getCsvFileName('fees_generated_vs_incentives')}
                tooltipContent='CSV with the entire historical data can be downloaded'
              />
            }
          >
            <CSVDownloadButton
              data={() => convertSeriesToCsv(aggregatedSeries)}
              filename={getCsvFileName('fees_generated_vs_incentives')}
              tooltipContent='CSV with the entire historical data can be downloaded'
            />
          </ChartActions>
        </div>
      </div>
      {chartSeries.length === 0 || !hasAggregatedData ? (
        <NoDataPlaceholder onButtonClick={clearAllFilters} />
      ) : (
        <Line
          className='max-h-fit'
          key={groupBy}
          isLegendEnabled={false}
          groupBy={groupBy}
          aggregatedSeries={aggregatedSeries}
          customOptions={customChartOptions}
          customTooltipFormatter={customTooltipFormatter}
          resetZoomKey={`${barSize}-${startDate}-${endDate}`}
        />
      )}
    </Card>
  );
};

export default FeesGeneratedIncentives;
