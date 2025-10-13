import { useState } from 'react';

import Line from '@/components/Charts/Line/Line';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import { FeesGeneratedIncentivesMobileFilters } from '@/entities/Insentive/FeesGeneratedIncentives/FeesGeneratedIncentivesMobileFilters';
import {
  customChartOptions,
  customTooltipFormatter
} from '@/entities/Insentive/FeesGeneratedIncentives/lib/customTooltipFormatter';
import { getGeneratedIncentivesChartSeries } from '@/entities/Insentive/FeesGeneratedIncentives/lib/getGeneratedIncentivesChartSeries';
import { useChainMarketFilters } from '@/entities/Insentive/useChainMarketFilters';
import { useChartControls } from '@/shared/hooks/useChartControls';
import { useCSVExport } from '@/shared/hooks/useCSVExport';
import {
  useFiltersSync,
  useFilterSyncSingle
} from '@/shared/hooks/useFiltersSync';
import { useLineChart } from '@/shared/hooks/useLineChart';
import { getCsvFileName } from '@/shared/lib/utils/getCsvFileName';
import { CombinedIncentivesData } from '@/shared/types/Incentive/types';
import { MultiSelect } from '@/shared/ui/AnimationProvider/MultiSelect/MultiSelect';
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
  const [isRevenueOnly, setIsRevenueOnly] = useState(false);
  const groupBy = 'None';

  const { barSize, onBarSizeChange } = useChartControls({
    initialBarSize: 'D'
  });

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

  const chartSeries = getGeneratedIncentivesChartSeries(filteredData);

  const displaySeries = isRevenueOnly
    ? chartSeries.filter((series) => series.name === 'Revenue')
    : chartSeries;

  const { csvData } = useCSVExport({
    chartSeries,
    barSize,
    groupBy: 'None',
    filePrefix: 'fees_generated_vs_incentives',
    aggregationType: 'sum'
  });

  const {
    chartRef,
    showEvents,
    aggregatedSeries,
    areAllSeriesHidden,
    onAllSeriesHidden,
    onEventsData,
    onShowEvents,
    onSelectAll,
    onDeselectAll
  } = useLineChart({
    groupBy,
    data: displaySeries,
    barSize
  });

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
        filterOptions={mobileFilterOptions}
        onClearAll={clearAllFilters}
        csvData={csvData}
        isRevenueOnly={isRevenueOnly}
        setIsRevenueOnly={setIsRevenueOnly}
      />
      <div className='hidden lg:block'>
        <div className='flex items-center justify-end gap-2 px-0 py-3'>
          <TabsGroup
            tabs={['D', 'W', 'M']}
            value={barSize}
            onTabChange={onBarSizeChange}
            disabled={isLoading}
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
        <NoDataPlaceholder onButtonClick={clearAllFilters} />
      ) : (
        <Line
          className='max-h-fit'
          key={groupBy}
          isLegendEnabled={false}
          data={displaySeries}
          groupBy={groupBy}
          chartRef={chartRef}
          aggregatedSeries={aggregatedSeries}
          showEvents={showEvents}
          areAllSeriesHidden={areAllSeriesHidden}
          onAllSeriesHidden={onAllSeriesHidden}
          onSelectAll={onSelectAll}
          onDeselectAll={onDeselectAll}
          onShowEvents={onShowEvents}
          onEventsData={onEventsData}
          customOptions={customChartOptions}
          customTooltipFormatter={customTooltipFormatter}
        />
      )}
    </Card>
  );
};

export default FeesGeneratedIncentives;
