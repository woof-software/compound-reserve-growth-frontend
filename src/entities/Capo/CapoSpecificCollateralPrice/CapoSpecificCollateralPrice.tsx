import React, { useReducer } from 'react';

import LineChart from '@/components/Charts/Line/Line';
import { useCollateralChartData } from '@/entities/Capo/CapoSpecificCollateralPrice/lib/useCollateralChartData';
import { useChartControls } from '@/shared/hooks/useChartControls';
import { useFiltersSync } from '@/shared/hooks/useFiltersSync';
import { useLineChart } from '@/shared/hooks/useLineChart';
import { OptionType } from '@/shared/types/types';
import Card from '@/shared/ui/Card/Card';

interface CapoSpecificCollateralPriceProps {
  rawData: any[];
}

export const CapoSpecificCollateralPrice = (
  props: CapoSpecificCollateralPriceProps
) => {
  const { rawData } = props;

  const [selectedOptions, setSelectedOptions] = useReducer(
    (prev, next) => ({
      ...prev,
      ...next
    }),
    {
      chain: [] as OptionType[],
      collateral: [] as OptionType[]
    }
  );

  useFiltersSync(selectedOptions, setSelectedOptions, 'cscp', [
    'chain',
    'collateral'
  ]);

  const { barSize } = useChartControls({
    initialBarSize: 'D'
  });

  const groupBy = (): string => {
    if (selectedOptions.chain.length > 0) return 'chain';
    if (selectedOptions.collateral.length > 0) return 'collateral';
    return 'none';
  };

  const { chartSeries, hasData } = useCollateralChartData({
    rawData,
    selectedAsset: 14
  });
  // console.log(chartSeries);
  // console.log(rawData);
  // console.log('raw data', rawData);
  // console.log('chart data', chartSeries);

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
    <Card title={'Specific Collateral Price against Price Restriction'}>
      {hasData && (
        <LineChart
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
