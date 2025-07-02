import * as React from 'react';
import { useMemo } from 'react';

import type { LineChartSeries } from '@/components/Charts/Line/Line';
import LineChart from '@/components/Charts/Line/Line';
import Filter from '@/components/Filter/Filter';
import { useFilter } from '@/components/Filter/useFilter';
import SingleDropdown from '@/components/SingleDropdown/SingleDropdown';
import { useChartControls } from '@/shared/hooks/useChartControls';
import {
  type TreasuryHistoryItem,
  useTreasuryHistory
} from '@/shared/hooks/useTreasuryHistory';
import Card from '@/shared/ui/Card/Card';
import { useDropdown } from '@/shared/ui/Dropdown/Dropdown';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';
import Text from '@/shared/ui/Text/Text';

const groupByOptions = ['none', 'Asset Type', 'Chain', 'Market'];

const TotalTresuaryValue = () => {
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

  const {
    data: treasuryApiResponse,
    isLoading,
    isError
  } = useTreasuryHistory();

  const rawData: TreasuryHistoryItem[] = useMemo(
    () => treasuryApiResponse?.data?.data || [],
    [treasuryApiResponse]
  );

  const filtersList = useMemo(() => {
    if (!rawData.length) return [];
    const chains = new Set<string>();
    const assetTypes = new Set<string>();
    const deployments = new Set<string>();
    rawData.forEach((item) => {
      if (item.source?.network) chains.add(item.source.network);
      if (item.source?.asset?.type) assetTypes.add(item.source.asset.type);
      if (item.source?.market) deployments.add(item.source.market);
    });
    return [
      {
        id: 'chain',
        title: 'Chain',
        placeholder: 'Add Chain',
        options: Array.from(chains).filter(Boolean).sort() as string[]
      },
      {
        id: 'assetType',
        title: 'Asset Type',
        placeholder: 'Add Asset Type',
        options: Array.from(assetTypes).filter(Boolean).sort() as string[]
      },
      {
        id: 'deployment',
        title: 'Deployment',
        placeholder: 'Add Deployment',
        options: Array.from(deployments).filter(Boolean).sort() as string[]
      }
    ];
  }, [rawData]);

  const groupBy = selectedSingle?.[0] || 'none';

  const chartSeries: LineChartSeries[] = useMemo(() => {
    if (!rawData.length) return [];

    const getSelectedItems = (filterId: string): string[] =>
      selected.find((f) => f.id === filterId)?.selectedItems || [];
    const selectedChains = getSelectedItems('chain');
    const selectedAssetTypes = getSelectedItems('assetType');
    const selectedDeployments = getSelectedItems('deployment');

    const filteredData = rawData.filter((item) => {
      const chainMatch =
        selectedChains.length === 0 ||
        (item.source.network && selectedChains.includes(item.source.network));
      const assetTypeMatch =
        selectedAssetTypes.length === 0 ||
        (item.source.asset.type &&
          selectedAssetTypes.includes(item.source.asset.type));
      const deploymentMatch =
        selectedDeployments.length === 0 ||
        (item.source.market &&
          selectedDeployments.includes(item.source.market));
      return chainMatch && assetTypeMatch && deploymentMatch;
    });

    if (groupBy === 'none') {
      const aggregatedByDate = new Map<number, number>();
      filteredData.forEach((item) => {
        if (item.date && typeof item.value === 'number') {
          const dateKey = item.date * 1000;
          const currentValue = aggregatedByDate.get(dateKey) || 0;
          aggregatedByDate.set(dateKey, currentValue + item.value);
        }
      });
      const formattedData = Array.from(aggregatedByDate.entries())
        .map(([x, y]) => ({ x, y }))
        .sort((a, b) => a.x - b.x);
      return [{ name: 'Treasury Value', data: formattedData }];
    } else {
      const aggregatedData = new Map<string, Map<number, number>>();
      filteredData.forEach((item) => {
        if (!item.date || typeof item.value !== 'number') return;
        let key: string | null = null;
        switch (groupBy) {
          case 'Asset Type':
            key = item.source.asset.type;
            break;
          case 'Chain':
            key = item.source.network;
            break;
          case 'Market':
            key = item.source.market;
            break;
        }
        if (!key) {
          key = 'not a Market';
        }
        if (!aggregatedData.has(key)) {
          aggregatedData.set(key, new Map<number, number>());
        }
        const seriesMap = aggregatedData.get(key)!;
        const dateKey = item.date * 1000;
        const currentValue = seriesMap.get(dateKey) || 0;
        seriesMap.set(dateKey, currentValue + item.value);
      });
      return Array.from(aggregatedData.entries()).map(([name, dataMap]) => ({
        name,
        data: Array.from(dataMap.entries())
          .map(([x, y]) => ({ x, y }))
          .sort((a, b) => a.x - b.x)
      }));
    }
  }, [rawData, selected, groupBy]);

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

  const hasData = useMemo(
    () => chartSeries?.some((s) => s.data && s.data.length > 0),
    [chartSeries]
  );

  return (
    <Card
      title='Total Treasury Value'
      className={{
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

      {isLoading && (
        <div className='flex h-[400px] items-center justify-center'>
          <Text>Loading...</Text>
        </div>
      )}
      {isError && (
        <div className='flex h-[400px] items-center justify-center'>
          <Text>Error loading data.</Text>
        </div>
      )}
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
          <Text>No data for selected filters.</Text>
        </div>
      )}
    </Card>
  );
};

export default TotalTresuaryValue;
