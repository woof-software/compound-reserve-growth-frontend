import React from 'react';

import Line from '@/components/Charts/Line/Line';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import {
  customFormatter,
  customOptions
} from '@/entities/Capo/CapoSpecificCollateralPrice/lib/chartConfig';
import { useChartFilters } from '@/entities/Capo/CapoSpecificCollateralPrice/lib/useChartFilters';
import { useCollateralChartData } from '@/entities/Capo/CapoSpecificCollateralPrice/lib/useCollateralChartData';
import { useRelativeFilters } from '@/entities/Capo/CapoSpecificCollateralPrice/lib/useRelativeFilters';
import { useChartControls } from '@/shared/hooks/useChartControls';
import { useCSVExport } from '@/shared/hooks/useCSVExport';
import { useFilterSyncSingle } from '@/shared/hooks/useFiltersSync';
import { useLineChart } from '@/shared/hooks/useLineChart';
import { NormalizedChartData } from '@/shared/types/Capo/types';
import Card from '@/shared/ui/Card/Card';
import CSVDownloadButton from '@/shared/ui/CSVDownloadButton/CSVDownloadButton';
import SingleSelect from '@/shared/ui/SingleSelect/SingleSelect';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';

interface CapoSpecificCollateralPriceProps {
  rawData: NormalizedChartData[];
  isLoading?: boolean;
  isError?: boolean;
}

export const CapoSpecificCollateralPrice = (
  props: CapoSpecificCollateralPriceProps
) => {
  const { rawData, isLoading, isError } = props;

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

  useRelativeFilters({
    collaterals: collateralOptions,
    chains: chainOptions,
    chain: selectedChain,
    onCollateralSelect: setSelectedCollateral,
    onChainSelect: setSelectedChain
  });

  const { csvData, csvFilename } = useCSVExport({
    chartSeries: chartSeries,
    barSize,
    groupBy: groupBy(),
    filePrefix: 'Capo_Specific_Collateral_Price',
    aggregationType: 'sum'
  });

  const {
    chartRef,
    showEvents,
    aggregatedSeries,
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

  const resetFilters = () => {
    const firstChain = chainOptions[0];

    if (!firstChain) return;

    setSelectedChain(firstChain);
  };

  return (
    <Card
      id='specific-collateral-price-against-price-restriction'
      title={'Specific Collateral Price against Price Restriction'}
      isLoading={isLoading}
      isError={isError}
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
        <CSVDownloadButton
          data={csvData}
          filename={csvFilename}
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
          showEvents={showEvents}
          onAllSeriesHidden={onAllSeriesHidden}
          onSelectAll={onSelectAll}
          onDeselectAll={onDeselectAll}
          onShowEvents={onShowEvents}
          onEventsData={onEventsData}
          // @ts-expect-error TODO: fix context type for Line component customTooltipFormatter
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
          <NoDataPlaceholder onButtonClick={resetFilters} />
        </div>
      )}
    </Card>
  );
};
