import React from 'react';

import Line from '@/components/Charts/Line/Line';
import {
  customFormatter,
  customOptions
} from '@/entities/Capo/CapoSpecificCollateralPrice/lib/chartConfig';
import { useChartFilters } from '@/entities/Capo/CapoSpecificCollateralPrice/lib/useChartFilters';
import { useCollateralChartData } from '@/entities/Capo/CapoSpecificCollateralPrice/lib/useCollateralChartData';
import { useChartControls } from '@/shared/hooks/useChartControls';
import { useFilterSyncSingle } from '@/shared/hooks/useFiltersSync';
import { useLineChart } from '@/shared/hooks/useLineChart';
import { NormalizedChartData } from '@/shared/types/Capo/types';
import Card from '@/shared/ui/Card/Card';
import SingleSelect from '@/shared/ui/SingleSelect/SingleSelect';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';

interface CapoSpecificCollateralPriceProps {
  rawData: NormalizedChartData[];
}
/* TODO:
    - fix any type at Line component (custom option and custom tooltip)
    - csv export logic
*   */
export const CapoSpecificCollateralPrice = (
  props: CapoSpecificCollateralPriceProps
) => {
  const { rawData } = props;
  const {
    selectedChain,
    selectedCollateral,
    setSelectedChain,
    setSelectedCollateral,
    chainOptions,
    collateralOptions,
    filteredData,
    groupBy
  } = useChartFilters(rawData);

  const { barSize, onBarSizeChange } = useChartControls({
    initialBarSize: 'D'
  });

  const { chartSeries, hasData } = useCollateralChartData({
    rawData: filteredData
  });

  useFilterSyncSingle(
    'capoSpecificCollateralPriceChain',
    selectedChain?.id,
    setSelectedChain
  );

  useFilterSyncSingle(
    'capoSpecificCollateralPriceCollateral',
    selectedCollateral?.id,
    setSelectedCollateral
  );

  // const { csvData, csvFilename } = useCSVExport({
  //   chartSeries: chartSeries,
  //   barSize,
  //   groupBy: groupBy(),
  //   filePrefix: 'Capo_Specific_Collateral_Price',
  //   aggregationType: 'sum'
  // });

  const {
    chartRef,
    eventsData,
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
    groupBy: groupBy(),
    data: chartSeries,
    barSize
  });

  return (
    <Card
      id='specific-collateral-price-against-price-restriction'
      title={'Specific Collateral Price against Price Restriction'}
      className={{
        loading: 'min-h-[inherit]',
        container: 'min-h-[571px] rounded-lg',
        content: 'flex flex-col gap-3 px-0 pt-0 pb-5 md:px-5 lg:px-10 lg:pb-10'
      }}
    >
      <div className='hidden items-center justify-end gap-2 px-10 py-3 lg:flex lg:px-0'>
        <TabsGroup
          className={{
            container: 'w-full sm:w-auto',
            list: 'w-full sm:w-auto'
          }}
          tabs={['D', 'W', 'M']}
          value={barSize}
          onTabChange={onBarSizeChange}
        />
        <SingleSelect
          options={chainOptions}
          value={selectedChain}
          onChange={setSelectedChain}
          placeholder='Chain'
        />
        <SingleSelect
          options={collateralOptions}
          value={selectedCollateral}
          onChange={setSelectedCollateral}
          placeholder='Collateral'
        />
      </div>
      {hasData && (
        <Line
          key={`${groupBy()}`}
          data={chartSeries}
          groupBy={groupBy()}
          aggregatedSeries={aggregatedSeries}
          className='max-h-fit'
          chartRef={chartRef}
          isLegendEnabled={isLegendEnabled}
          eventsData={eventsData}
          showEvents={showEvents}
          areAllSeriesHidden={areAllSeriesHidden}
          onAllSeriesHidden={onAllSeriesHidden}
          onSelectAll={onSelectAll}
          onDeselectAll={onDeselectAll}
          onShowEvents={onShowEvents}
          onEventsData={onEventsData}
          customTooltipFormatter={customFormatter}
          customOptions={customOptions}
        />
      )}
      {!hasData && (
        <div
          style={{
            padding: '40px',
            textAlign: 'center',
            color: '#666'
          }}
        >
          No data available for the selected filters
        </div>
      )}
    </Card>
  );
};
