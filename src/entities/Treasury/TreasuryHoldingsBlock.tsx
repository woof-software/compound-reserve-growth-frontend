import * as React from 'react';
import { useMemo } from 'react';

import Filter from '@/components/Filter/Filter';
import { useFilter } from '@/components/Filter/useFilter';
import TreasuryHoldings from '@/components/TreasuryPageTable/TreasuryHoldings';
import Card from '@/shared/ui/Card/Card';

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

const TreasuryHoldingsBlock = () => {
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
      title='Full Treasury Holdings'
      className={{
        container: 'overflow-visible',
        content: 'pt-0'
      }}
    >
      <div className='flex items-center justify-end gap-3 px-0 py-3'>
        <Filter {...filterProps} />
      </div>

      <TreasuryHoldings />
    </Card>
  );
};

export default TreasuryHoldingsBlock;
