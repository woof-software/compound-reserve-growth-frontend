import React from 'react';

import Icon from '@/shared/ui/Icon/Icon';

export type OptionsListProps<T> = T extends Array<infer N> ? {
  options: T;
  getLabel: (v: N) => string;
  getKey: (v: N) => string;
  selectedOptions: T;
  onSelect: (option: N) => void
} : never;

export function OptionsList<T extends Array<any>>(props: OptionsListProps<T>) {
  const {
    options,
    selectedOptions,
    onSelect,
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
          onClick={() => onSelect(option)}
          className='flex justify-between items-center cursor-pointer rounded-lg px-3 h-[44px] lg:h-[40px] text-[11px] font-medium hover:bg-secondary-12 mr-[2px]'
        >
          <button className={'w-full flex justify-between items-center cursor-pointer'}>
            {getLabel(option)}
            {isSelected(option) && <Icon name='check-stroke' className='h-4 w-4'/>}
          </button>
        </li>
      ))}
    </ul>
  );
};