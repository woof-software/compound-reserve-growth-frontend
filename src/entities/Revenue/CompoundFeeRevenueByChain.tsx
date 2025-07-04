import * as React from 'react';

import CompoundFeeRevenuebyChain from '@/components/RevenuePageTable/CompoundFeeRevenuebyChain';
import SingleDropdown from '@/components/SingleDropdown/SingleDropdown';
import Card from '@/shared/ui/Card/Card';
import { useDropdown } from '@/shared/ui/Dropdown/Dropdown';
import Text from '@/shared/ui/Text/Text';

const options = ['Quarterly', 'Week', 'Month', 'Year'];

const yearOptions = ['2025', '2024', '2023', '2022'];

const CompoundFeeRevenueByChain = () => {
  const {
    open: intervalOpen,
    selectedValue: selectedInterval,
    toggle: toggleInterval,
    close: closeInterval,
    select: selectInterval
  } = useDropdown('single');

  const {
    open: yearOpen,
    selectedValue: selectedYear,
    toggle: toggleYear,
    close: closeYear,
    select: selectYear
  } = useDropdown('single');

  return (
    <Card
      title='Compound Fee Revenue by Chain'
      className={{ content: 'flex flex-col gap-3 px-10 pt-0 pb-10' }}
    >
      <div className='flex justify-end gap-3 px-0 py-3'>
        <div className='flex items-center gap-1'>
          <Text
            tag='span'
            size='11'
            weight='600'
            lineHeight='16'
            className='text-primary-14'
          >
            Interval
          </Text>
          <SingleDropdown
            triggerContentClassName='pl-0'
            options={options}
            isOpen={intervalOpen}
            selectedValue={selectedInterval?.[0] || ''}
            onToggle={toggleInterval}
            onClose={closeInterval}
            onSelect={selectInterval}
          />
        </div>
        <div className='flex items-center gap-1'>
          <Text
            tag='span'
            size='11'
            weight='600'
            lineHeight='16'
            className='text-primary-14'
          >
            Year
          </Text>
          <SingleDropdown
            triggerContentClassName='pl-0'
            options={yearOptions}
            isOpen={yearOpen}
            selectedValue={selectedYear?.[0] || ''}
            onToggle={toggleYear}
            onClose={closeYear}
            onSelect={selectYear}
          />
        </div>
      </div>
      <CompoundFeeRevenuebyChain />
    </Card>
  );
};

export default CompoundFeeRevenueByChain;
