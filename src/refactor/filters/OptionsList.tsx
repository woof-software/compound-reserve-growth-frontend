import React from 'react';

import { Option } from '@/refactor/DropdownFilter/DropdownFilter';
import Icon from '@/shared/ui/Icon/Icon';

interface OptionsListProps {
  options: Option[]
  setSelectedOptions: (option: Option) => void
  selectedOptions: Option[]
}

export const OptionsList = (props: OptionsListProps) => {
  const { options, setSelectedOptions, selectedOptions } = props;

  const isSelected = (option: string) => {
    return selectedOptions?.some((o) => o.value === option);
  };

  return (
    <ul>
      {options.map((option) => (
        <li 
          key={option.value}
          onClick={() => setSelectedOptions(option)}
          className='flex justify-between items-center cursor-pointer rounded-lg px-3 h-[44px] lg:h-[40px] text-[11px] font-medium hover:bg-secondary-12 mr-[2px]'
        >
          {option.label}
          {isSelected(option.value) && <Icon name='check-stroke' className='h-4 w-4'/>}
        </li>
      ))}
    </ul>
  );
};