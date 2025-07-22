import { useCallback, useMemo } from 'react';

import LineChart from '@/components/Charts/Line/Line';
import Filter from '@/components/Filter/Filter';
import { useFilter } from '@/components/Filter/useFilter';
import NoDataPlaceholder from '@/components/NoDataPlaceholder/NoDataPlaceholder';
import SingleDropdown from '@/components/SingleDropdown/SingleDropdown';
import { useChartControls } from '@/shared/hooks/useChartControls';
import { useChartDataProcessor } from '@/shared/hooks/useChartDataProcessor';
import { ChartDataItem, extractFilterOptions } from '@/shared/lib/utils/utils';
import { TokenData } from '@/shared/types/Treasury/types';
import Card from '@/shared/ui/Card/Card';
import { useDropdown } from '@/shared/ui/Dropdown/Dropdown';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';

const groupByOptions = ['None', 'Asset Type', 'Chain', 'Market'];
const groupByMapping: Record<string, string> = {
  'Asset Type': 'assetType',
  Chain: 'chain',
  Market: 'deployment'
};

interface TotalTreasuryValueProps {
  isLoading?: boolean;
  isError?: boolean;
  data?: TokenData[];
  onCopyLink?: (id: string) => void;
}

const TotalTresuaryValue = ({
  isLoading,

  isError,
  data: treasuryApiResponse
}: TotalTreasuryValueProps) => {
  const { local, selected, toggle, apply, clear, reset } = useFilter();

  const {
    open: openSingle,
    selectedValue: selectedSingle,
    toggle: toggleSingle,
    close: closeSingle,
    select: selectSingle
  } = useDropdown('single');

  const handleClearAll = useCallback(() => {
    clear();
    selectSingle('None');
  }, [clear, selectSingle]);

  const {
    activeTab,
    barSize,
    barCount,
    handleTabChange,
    handleBarSizeChange,
    handleVisibleBarsChange
  } = useChartControls({
    initialTimeRange: '7B',
    initialBarSize: 'D'
  });

  const rawData: ChartDataItem[] = useMemo(() => {
    if (!treasuryApiResponse) {
      return [];
    }
    return [...treasuryApiResponse].sort((a, b) => a.date - b.date);
  }, [treasuryApiResponse]);

  const filterOptionsConfig = useMemo(
    () => ({
      chain: { path: 'source.network' },
      assetType: { path: 'source.asset.type' },
      deployment: { path: 'source.market' }
    }),
    []
  );

  const { chainOptions, assetTypeOptions, deploymentOptions } = useMemo(
    () => extractFilterOptions(rawData, filterOptionsConfig),
    [rawData, filterOptionsConfig]
  );

  const filtersList = useMemo(
    () => [
      {
        id: 'chain',
        title: 'Chain',
        placeholder: 'Add Chain',
        options: chainOptions?.map((o) => o.id) || []
      },
      {
        id: 'assetType',
        title: 'Asset Type',
        placeholder: 'Add Asset Type',
        options: assetTypeOptions?.map((o) => o.id) || []
      },
      {
        id: 'deployment',
        title: 'Market',
        placeholder: 'Add Market',
        options: deploymentOptions?.map((o) => o.id) || []
      }
    ],
    [chainOptions, assetTypeOptions, deploymentOptions]
  );

  const groupBy = selectedSingle?.[0] || 'None';

  const activeFilters = useMemo(
    () =>
      selected.reduce(
        (acc, filter) => {
          acc[filter.id] = filter.selectedItems;
          return acc;
        },
        {} as Record<string, string[]>
      ),
    [selected]
  );

  const { chartSeries } = useChartDataProcessor({
    rawData,
    filters: activeFilters,
    filterPaths: {
      chain: 'source.network',
      assetType: 'source.asset.type',
      deployment: 'source.market'
    },
    groupBy,
    groupByKeyPath:
      groupBy === 'None'
        ? null
        : filterOptionsConfig[
            groupByMapping[groupBy] as keyof typeof filterOptionsConfig
          ].path,
    defaultSeriesName: 'Treasury Value'
  });

  const correctedChartSeries = useMemo(() => {
    if (!chartSeries || chartSeries.length === 0) {
      return [];
    }

    return chartSeries.map((series) => {
      if (!series.data || series.data.length === 0) {
        return series;
      }

      const dailyTotals = new Map<number, number>();

      for (const point of series.data) {
        const date = new Date(point.x);
        date.setUTCHours(0, 0, 0, 0);
        const dayStartTimestamp = date.getTime();

        const currentTotal = dailyTotals.get(dayStartTimestamp) || 0;
        dailyTotals.set(dayStartTimestamp, currentTotal + point.y);
      }

      const aggregatedData = Array.from(dailyTotals.entries()).map(
        ([x, y]) => ({
          x,
          y
        })
      );

      aggregatedData.sort((a, b) => a.x - b.x);

      return {
        ...series,
        data: aggregatedData
      };
    });
  }, [chartSeries]);

  const hasData = useMemo(() => {
    return (
      correctedChartSeries.length > 0 &&
      correctedChartSeries.some((s) => s.data.length > 0)
    );
  }, [correctedChartSeries]);

  const activeCount = selected.reduce(
    (acc, filter) => acc + filter.selectedItems.length,
    0
  );

  const filterProps = useMemo(
    () => ({
      activeFilters: activeCount,
      selectedItems: local,
      filtersList,
      onFilterItemSelect: toggle,
      onApply: apply,
      onClear: handleClearAll,
      onOutsideClick: reset
    }),
    [activeCount, local, filtersList, toggle, apply, handleClearAll, reset]
  );

  return (
    <Card
      isLoading={isLoading}
      isError={isError}
      title='Total Treasury Value'
      id='total-treasury-value'
      className={{
        loading: 'min-h-[inherit]',
        container: 'min-h-[571px]',
        content: 'flex flex-col gap-3 px-10 pt-0 pb-10'
      }}
    >
      <div className='flex items-center justify-end gap-3 px-0 py-3'>
        <TabsGroup
          tabs={['D', 'W', 'M']}
          value={barSize}
          onTabChange={handleBarSizeChange}
          disabled={isLoading}
        />
        <TabsGroup
          tabs={['7B', '30B', '90B', '180B']}
          value={activeTab}
          onTabChange={handleTabChange}
          disabled={isLoading}
        />
        <SingleDropdown
          options={groupByOptions}
          isOpen={openSingle}
          selectedValue={groupBy}
          onToggle={toggleSingle}
          onClose={closeSingle}
          onSelect={selectSingle}
          disabled={isLoading}
        />
        <Filter
          {...filterProps}
          disabled={isLoading}
        />
      </div>
      {!isLoading && !isError && !hasData ? (
        <NoDataPlaceholder onButtonClick={handleClearAll} />
      ) : (
        <LineChart
          key={groupBy}
          data={correctedChartSeries}
          groupBy={groupBy}
          className='max-h-[400px]'
          barSize={barSize}
          barCountToSet={barCount}
          onVisibleBarsChange={handleVisibleBarsChange}
        />
      )}
    </Card>
  );
};

export default TotalTresuaryValue;
