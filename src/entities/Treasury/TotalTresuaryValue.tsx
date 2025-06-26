import * as React from 'react';
import { useMemo } from 'react';

import LineChart from '@/components/Charts/Line/Line';
import Filter from '@/components/Filter/Filter';
import { useFilter } from '@/components/Filter/useFilter';
import Card from '@/shared/ui/Card/Card';
import TabsGroup from '@/shared/ui/TabsGroup/TabsGroup';

type FilterItem = {
  id: string;

  title: string;

  placeholder: string;

  options: string[];
};

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

const SERIES_DATA = [
  ...Array.from({ length: 100 }, (_, i) => ({
    x: Date.UTC(2000 + i, 0, 1),
    y: Math.round(Math.random() * 100)
  }))
];

const TotalTresuaryValue = () => {
  const { local, selected, toggle, apply, clear, reset } = useFilter();

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
      contentClassName='pt-0 pb-10 px-10 flex flex-col gap-3'
    >
      <div className='flex justify-end gap-3 px-0 py-3'>
        <TabsGroup
          tabs={['7D', '30D', '90D', '1Y']}
          defaultTab='7D'
        />

        <TabsGroup
          tabs={['H', 'D', 'W']}
          defaultTab='D'
        />

        <Filter {...filterProps} />
      </div>

      <LineChart
        data={SERIES_DATA}
        className='max-h-[400px]'
      />
    </Card>
  );
};

export default TotalTresuaryValue;
