import * as React from 'react';
import { useMemo } from 'react';

import CryptoChart from '@/components/Charts/Bar/Bar';
import Filter from '@/components/Filter/Filter';
import { useFilter } from '@/components/Filter/useFilter';
import SingleDropdown from '@/components/SingleDropdown/SingleDropdown';
import TreasuryBalanceByNetwork from '@/components/TreasuryPageTable/TreasuryBalanceByNetwork';
import { FilterItem } from '@/shared/types/types';
import Card from '@/shared/ui/Card/Card';
import { useDropdown } from '@/shared/ui/Dropdown/Dropdown';
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

const TreasuryBalanceByNetworkBlock = () => {
  const { local, selected, toggle, apply, clear, reset } = useFilter();

  const {
    data: treasuryApiResponse,
    isLoading,
    isError,
    error
  } = useTreasuryHistory();

  // will be delete
  console.log({
    data: treasuryApiResponse,
    isLoading,
    isError,
    error
  });

  const {
    open: openSingle,
    selectedValue: selectedSingle,
    toggle: toggleSingle,
    close: closeSingle,
    select: selectSingle
  } = useDropdown('single');

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
      title='Treasury Balance by Network'
      className={{
        content: 'flex flex-col gap-3 px-10 pt-0 pb-10'
      }}
    >
      <div className='flex items-center justify-end gap-3 px-0 py-3'>
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

      <div className='flex justify-between gap-10'>
        <CryptoChart
          data={[
            { name: 'AAVE', value: 150000000, color: '#4F7CFF' },
            { name: 'Stablecoin', value: 35000000, color: '#00D4AA' },
            { name: 'ETH Correlated', value: 30000000, color: '#F0E68C' },
            { name: 'DeFi', value: 8500000, color: '#FF6B6B' },
            { name: 'BTC Correlated', value: 50000000, color: '#8B5CF6' },
            { name: 'Unclassified', value: 35000000, color: '#FF8C42' }
          ]}
        />

        <TreasuryBalanceByNetwork />
      </div>
    </Card>
  );
};

export default TreasuryBalanceByNetworkBlock;
