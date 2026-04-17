import React from 'react';

import { Option } from '@/refactor/DropdownFilter/DropdownFilter';
import { cn } from '@/shared/lib/classNames/classNames';
import Text from '@/shared/ui/Text/Text';

import ArrowDown from '@/shared/assets/svg/arrow-down.svg';

interface DropdownGroupFilterTriggerProps {
  selectedOptions: Option[]
  handler: () => void
  isOpen?: boolean
}

export const DropdownGroupFilterTrigger = (props: DropdownGroupFilterTriggerProps) => {
  const { selectedOptions, handler, isOpen = false } = props;

  return (
    <div className={'flex items-center gap-1.5 cursor-pointer'}>
      <Text
        tag='span'
        size='11'
        weight='600'
        lineHeight='16'
        className='text-primary-14'
      >
        Group by
      </Text>
      <button
        className={'flex items-center rounded-lg pl-3 pr-1 h-8 hover:bg-secondary-12 cursor-pointer gap-1.5'}
        onClick={handler}
      >
        <Text
          tag='span'
          size='11'
          weight='600'
          lineHeight='16'
          className='text-secondary-10'
        >
          {selectedOptions.length > 0 ? selectedOptions[0].label : 'None'}
        </Text>
        <ArrowDown
          className={cn('transition-transform', {
            'rotate-180': isOpen
          })}
          width={20}
          height={20}
        />
      </button>
    </div>
  );
};