import * as React from 'react';
import { useMemo } from 'react';

import LineChart from '@/components/Charts/Line/Line';
import Filter from '@/components/Filter/Filter';
import { useFilter } from '@/components/Filter/useFilter';
import SingleDropdown from '@/components/SingleDropdown/SingleDropdown';
import { useChartControls } from '@/shared/hooks/useChartControls';
import { useChartDataProcessor } from '@/shared/hooks/useChartDataProcessor';
import { ChartDataItem, extractFilterOptions } from '@/shared/lib/utils/utils';
import { TokenData } from '@/shared/types/Treasury/types';
import Card from '@/shared/ui/Card/Card';
import { useDropdown } from '@/shared/ui/Dropdown/Dropdown';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';
import Text from '@/shared/ui/Text/Text';

const groupByOptions = ['none', 'Asset Type', 'Chain', 'Market'];
const groupByMapping: Record<string, string> = {
  'Asset Type': 'assetType',
  Chain: 'chain',
  Market: 'deployment'
};

interface TotalTreasuryValueProps {
  isLoading?: boolean;

  isError?: boolean;

  data?: TokenData[];
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

  const rawData: ChartDataItem[] = useMemo(
    () => treasuryApiResponse || [],
    [treasuryApiResponse]
  );

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
        title: 'Deployment',
        placeholder: 'Add Deployment',
        options: deploymentOptions?.map((o) => o.id) || []
      }
    ],
    [chainOptions, assetTypeOptions, deploymentOptions]
  );

  const groupBy = selectedSingle?.[0] || 'none';

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

  const { chartSeries, hasData } = useChartDataProcessor({
    rawData,
    filters: activeFilters,
    filterPaths: {
      chain: 'source.network',
      assetType: 'source.asset.type',
      deployment: 'source.market'
    },
    groupBy,
    groupByKeyPath:
      groupBy === 'none'
        ? null
        : filterOptionsConfig[
            groupByMapping[groupBy] as keyof typeof filterOptionsConfig
          ].path,
    defaultSeriesName: 'Treasury Value'
  });

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
      onClear: clear,
      onOutsideClick: reset
    }),
    [activeCount, local, filtersList, toggle, apply, clear, reset]
  );

  return (
    <Card
      isLoading={isLoading}
      isError={isError}
      title='Total Treasury Value'
      className={{
        loading: 'min-h-[inherit]',
        container: 'min-h-[571px]',
        content: 'flex flex-col gap-3 px-10 pt-0 pb-10'
      }}
    >
      <div className='flex justify-end gap-3 px-0 py-3'>
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
      {!isLoading && !isError && hasData && (
        <LineChart
          data={chartSeries}
          groupBy={groupBy}
          className='max-h-[400px]'
          barSize={barSize}
          barCountToSet={barCount}
          onVisibleBarsChange={handleVisibleBarsChange}
        />
      )}
      {!isLoading && !isError && !hasData && (
        <div className='flex h-[400px] items-center justify-center'>
          <Text
            size='12'
            className='text-primary-14'
          >
            No data for selected filters
          </Text>
        </div>
      )}
    </Card>
  );
};

export default TotalTresuaryValue;
