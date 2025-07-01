import * as React from 'react';
import { useMemo } from 'react';

import LineChart from '@/components/Charts/Line/Line';
import Filter from '@/components/Filter/Filter';
import { useFilter } from '@/components/Filter/useFilter';
import SingleDropdown from '@/components/SingleDropdown/SingleDropdown';
import { useChartControls } from '@/shared/hooks/useChartControls';
import { FilterItem } from '@/shared/types/types';
import Card from '@/shared/ui/Card/Card';
import { useDropdown } from '@/shared/ui/Dropdown/Dropdown';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';
import { useTreasuryHistory } from '@/shared/hooks/useTreasuryHistory';

const TEST_FILTERS_LIST: FilterItem[] = [
  {
    id: 'chain',
    title: 'Chain',
    placeholder: 'Add Chain',
    options: [
      'Ethereum',
      'Arbitrum',
      'Avalanche',
      'Optimism',
      'Polygon',
      'Base',
      'Sonic'
    ]
  },
  {
    id: 'assetType',
    title: 'Asset Type',
    placeholder: 'Add Asset Type',
    options: ['DeFi', 'Stablecoin', 'BTC Corellated', 'ETH Corellated', 'COMP']
  },
  {
    id: 'deployment',
    title: 'Deployment',
    placeholder: 'Add Deployment',
    options: [
      'Arbitrum V3',
      'Arbitrum V2',
      'Avalanche V3',
      'Base V3',
      'Ethereum Lido',
      'Ethereum V3'
    ]
  }
];

const options = ['Asset Type', 'Chain', 'Market', 'Wallet'];

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

  const { data: treasuryApiResponse } = useTreasuryHistory();

  console.log('popo', treasuryApiResponse?.data?.data);

  const fullFiveYearData = useMemo(() => {
    const data: { x: number; y: number }[] = [];
    const startDate = new Date('2020-01-01');
    const endDate = new Date('2025-01-01');
    let baseValue = 1000000;

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      baseValue *= 1 + (Math.random() - 0.45) * 0.01;
      data.push({
        x: d.getTime(),
        y: Math.round(baseValue)
      });
    }
    return data;
  }, []);

  const activeCount = selected.length;

  const filterProps = useMemo(
    () => ({
      activeFilters: activeCount,
      selectedItems: local,
      filtersList: TEST_FILTERS_LIST,
      onFilterItemSelect: toggle,
      onApply: apply,
      onClear: clear,
      onOutsideClick: reset
    }),
    [activeCount, local, toggle, apply, clear, reset]
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
        />

        <TabsGroup
          tabs={['7B', '30B', '90B', '180B']}
          value={activeTab}
          onTabChange={handleTabChange}
        />

        <SingleDropdown
          options={options}
          isOpen={openSingle}
          selectedValue={selectedSingle?.[0] || ''}
          onToggle={toggleSingle}
          onClose={closeSingle}
          onSelect={selectSingle}
        />

        <Filter {...filterProps} />
      </div>

      <LineChart
        data={fullFiveYearData}
        className='max-h-[400px]'
        barSize={barSize}
        barCountToSet={barCount}
        onVisibleBarsChange={handleVisibleBarsChange}
      />
    </Card>
  );
};

export default TotalTresuaryValue;
