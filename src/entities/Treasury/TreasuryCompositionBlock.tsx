import React from 'react';

import PieChart from '@/components/Charts/Pie/Pie';
import SingleDropdown from '@/components/SingleDropdown/SingleDropdown';
import TreasuryComposition from '@/components/TreasuryPageTable/TreasuryComposition';
import Card from '@/shared/ui/Card/Card';
import { useDropdown } from '@/shared/ui/Dropdown/Dropdown';

const options = ['Asset Type', 'Chain', 'Market', 'Wallet'];

const TreasuryCompositionBlock = () => {
  const {
    open: openSingle,
    selectedValue: selectedSingle,
    toggle: toggleSingle,
    close: closeSingle,
    select: selectSingle
  } = useDropdown('single');

  return (
    <Card
      title='Treasury Composition'
      className={{
        content: 'flex flex-col gap-3 px-10 pt-0 pb-10'
      }}
    >
      <div className='flex justify-end py-3'>
        <SingleDropdown
          options={options}
          isOpen={openSingle}
          selectedValue={selectedSingle}
          onToggle={toggleSingle}
          onClose={closeSingle}
          onSelect={selectSingle}
        />
      </div>

      <div className='flex justify-between'>
        <PieChart
          className='max-h-[400px] max-w-[336.5px]'
          data={[
            { name: 'AAVE', percent: 70.67, value: '1.54M' },
            { name: 'Stablecoin', percent: 14.77, value: '1.54k' },
            { name: 'ETH Correlated', percent: 4.86, value: '0.54k' },
            { name: 'DeFi', percent: 2.63, value: '0.23k' },
            { name: 'BTC Correlated', percent: 2.6, value: '5.54k' },
            { name: 'Unclassified', percent: 2.6, value: '0.54k' }
          ]}
        />

        <TreasuryComposition />
      </div>
    </Card>
  );
};

export default TreasuryCompositionBlock;
