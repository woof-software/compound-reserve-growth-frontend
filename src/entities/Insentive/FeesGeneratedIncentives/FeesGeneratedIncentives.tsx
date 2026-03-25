import { useMemo, useState } from 'react';

import Line from '@/components/Charts/Line/Line';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import { FeesGeneratedIncentivesMobileFilters } from '@/entities/Insentive/FeesGeneratedIncentives/FeesGeneratedIncentivesMobileFilters';
import {
  customChartOptions,
  customTooltipFormatter
} from '@/entities/Insentive/FeesGeneratedIncentives/lib/customTooltipFormatter';
import { getGeneratedIncentivesChartSeries } from '@/entities/Insentive/FeesGeneratedIncentives/lib/getGeneratedIncentivesChartSeries';
import { useChainMarketFilters } from '@/entities/Insentive/useChainMarketFilters';
import { useBarSizeConstraints } from '@/shared/hooks/useBarSizeConstraints';
import { useChartControls } from '@/shared/hooks/useChartControls';
import { useDateRangeFilter } from '@/shared/hooks/useDataRangeFilter';
import {
  useFiltersSync,
  useFilterSyncSingle
} from '@/shared/hooks/useFiltersSync';
import { useLineChart } from '@/shared/hooks/useLineChart';
import { getCsvFileName } from '@/shared/lib/utils/getCsvFileName';
import { getSummarizedCsvData } from '@/shared/lib/utils/getSummarizedCsvData';
import { CombinedIncentivesData } from '@/shared/types/Incentive/types';
import { BAR_SIZE, BAR_SIZE_OPTIONS } from '@/shared/types/types';
import { MultiSelect } from '@/shared/ui/AnimationProvider/MultiSelect/MultiSelect';
import Card from '@/shared/ui/Card/Card';
import CSVDownloadButton from '@/shared/ui/CSVDownloadButton/CSVDownloadButton';
import { DateRangePickerPopover } from '@/shared/ui/DateRangePicker/DateRangePicker';
import Switch from '@/shared/ui/Switch/Switch';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';

interface FeesGeneratedIncentivesProps {
  data: CombinedIncentivesData[];
  isLoading: boolean;
  isError: boolean;
}

const FeesGeneratedIncentives = (props: FeesGeneratedIncentivesProps) => {
  const { data, isLoading, isError } = props;
  const [isRevenueOnly, setIsRevenueOnly] = useState(false);
  const groupBy = 'None';

  const { barSize, onBarSizeChange } = useChartControls({
    initialBarSize: BAR_SIZE.D
  });

  const {
    dateRange,
    setDateRange,
    normalizedDateRange,
    dateBounds,
    resetDateRange,
    mobileFilterOption: dateRangeMobileOption
  } = useDateRangeFilter();

  const { disabledBarSizes } = useBarSizeConstraints(
    normalizedDateRange,
    barSize,
    onBarSizeChange
  );

  const {
    chainOptions,
    deploymentOptionsFilter,
    selectedOptions,
    setSelectedOptions,
    onSelectChain,
    onSelectMarket,
    filteredData,
    clearAllFilters,
    mobileFilterOptions
  } = useChainMarketFilters(data, { filterByLatestDate: false });

  useFiltersSync(selectedOptions, setSelectedOptions, 'fgvsi', [
    'chain',
    'deployment'
  ]);

  useFilterSyncSingle(
    'FeesGeneratedIncentivesPeriod',
    barSize,
    onBarSizeChange
  );
  useFilterSyncSingle(
    'FeesGeneratedRevenueOnly',
    isRevenueOnly,
    setIsRevenueOnly
  );

  const dateFilteredData = useMemo(() => {
    const { start, end } = normalizedDateRange;
    if (start === null && end === null) return filteredData;

    return filteredData.filter((item) => {
      const itemTime = item.date * 1000;
      if (start !== null && itemTime < start) return false;
      if (end !== null && itemTime > end) return false;
      return true;
    });
  }, [filteredData, normalizedDateRange]);

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

  const csvData = getSummarizedCsvData(aggregatedSeries);

  const handleClearAllFilters = () => {
    clearAllFilters();
    resetDateRange();
  };

  const mobileFilterOptionsWithDateRange = () => [
    dateRangeMobileOption,
    ...mobileFilterOptions()
  ];

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
      <FeesGeneratedIncentivesMobileFilters
        barSize={barSize}
        onBarSizeChange={onBarSizeChange}
        filterOptions={mobileFilterOptionsWithDateRange}
        onClearAll={handleClearAllFilters}
        csvData={csvData}
        isRevenueOnly={isRevenueOnly}
        setIsRevenueOnly={setIsRevenueOnly}
      />
      <div className='hidden lg:block'>
        <div className='flex items-center justify-end gap-2 px-0 py-3'>
          <TabsGroup
            tabs={BAR_SIZE_OPTIONS}
            value={barSize}
            onTabChange={onBarSizeChange}
            disabled={isLoading}
            disabledTabs={disabledBarSizes}
          />
          <DateRangePickerPopover
            value={dateRange}
            min={dateBounds.min}
            max={dateBounds.max}
            onChange={setDateRange}
            disabled={isLoading}
            showLabels
            showClear
            inputClassName='w-full'
          />
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
          <Switch
            label='Revenue Only'
            positionLabel='left'
            checked={isRevenueOnly}
            onCheckedChange={setIsRevenueOnly}
            className={{ title: '!text-[11px]' }}
          />
          <CSVDownloadButton
            data={csvData}
            filename={getCsvFileName('fees_generated_vs_incentives')}
            tooltipContent='CSV with the entire historical data can be downloaded'
          />
        </div>
      </div>
      {chartSeries.length === 0 ? (
        <NoDataPlaceholder onButtonClick={handleClearAllFilters} />
      ) : (
        <Line
          className='max-h-fit'
          key={groupBy}
          isLegendEnabled={false}
          groupBy={groupBy}
          aggregatedSeries={aggregatedSeries}
          customOptions={customChartOptions}
          customTooltipFormatter={customTooltipFormatter}
        />
      )}
    </Card>
  );
};

export default FeesGeneratedIncentives;
