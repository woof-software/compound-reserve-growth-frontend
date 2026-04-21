import React from 'react';

import Icon from '@/shared/ui/Icon/Icon';

interface OptionsListProps<T> {
  options: T[];
  getLabel: (v: T) => string;
  getKey: (v: T) => string;
  selectedOptions: T[];
  setSelectedOptions: (option: T) => void
}

export function OptionsList<T>(props: OptionsListProps<T>) {
  const {
    options,
    selectedOptions,
    setSelectedOptions,
    getLabel,
    getKey,
  } = props;

  const isSelected = (option: T) => {
    return selectedOptions?.some((o) => getKey(o) === getKey(option));
  };

  return (
    <ul>
      {options.map((option) => (
        <li 
          key={getKey(option)}
          onClick={() => setSelectedOptions(option)}
          className='flex justify-between items-center cursor-pointer rounded-lg px-3 h-[44px] lg:h-[40px] text-[11px] font-medium hover:bg-secondary-12 mr-[2px]'
        >
          {getLabel(option)}
          {isSelected(option) && <Icon name='check-stroke' className='h-4 w-4'/>}
        </li>
      ))}
    </ul>
  );
};