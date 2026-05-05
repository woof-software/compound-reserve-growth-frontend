import React, { useState } from 'react';

import { DropdownFilterActions } from '@/components/Filter/DropdownFilter/DropdownFilterActions';
import { DropdownFilterInput } from '@/components/Filter/DropdownFilter/DropdownFilterInput';
import { DropdownFilterTrigger } from '@/components/Filter/DropdownFilter/DropdownFilterTrigger';
import { useFilterContext } from '@/components/Filter/Filters';
import { OptionsList } from '@/components/Filter/OptionsList';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import Button from '@/shared/ui/Button/Button';
import { Dropdown } from '@/shared/ui/DropdownRef/Dropdown';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';

export type Option = { label: string; value: string };

export interface DropdownFilterProps<T> {
  options: T[]
  selectedOptions: T[]
  onSelect: (option: T | T[]) => void
  triggerLabel: string
}

export const DropdownFilter = <T extends Option>(props: DropdownFilterProps<T>) => {
  const {
    options,
    selectedOptions,
    onSelect,
    triggerLabel
  } = props;

  const { expandedFilter, setExpandedFilter } = useFilterContext();

  const [isDropdown, setIsDropdown] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const selectAllOptions = () => {
    return onSelect(options);
  };

  const clearSelectedOptions = () => {
    return onSelect([]);
  };

  const isAllSelected = options.length > 0 && options.every(o => selectedOptions.some(s => s.value === o.value));

  const toggle = () => setIsDropdown(prev => !prev);

  const filteredOptions = options.filter(({label}) =>
    label.toLowerCase().includes(searchValue.toLowerCase())
  );

  const isSearchResult = filteredOptions.length !== 0;

  const isMobile = useMediaQuery('(max-width: 63.938rem)');

  if (isMobile) {
    const isExpanded = expandedFilter === triggerLabel;
    const isOtherExpanded = expandedFilter !== null && !isExpanded;

    if (isOtherExpanded) return null;

    if (!isExpanded) {
      return (
        <DropdownFilterTrigger
          label={triggerLabel}
          counter={selectedOptions.length}
          onClick={() => setExpandedFilter(triggerLabel)}
        />
      );
    }

    return (
      <>
        <div className={'flex items-center justify-between'}>
          <Button
            onClick={() => setExpandedFilter(null)}
            className='absolute top-[40px] h-[24px] w-[24px]'
          >
            <Icon name='arrow-line' className='h-6 w-6' />
          </Button>
          <Text
            size='17'
            weight='700'
            lineHeight='140'
            align='center'
            className='mb-8 w-full'
          >
            {triggerLabel}
          </Text>
        </div>

        <DropdownFilterInput
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          isError={isSearchResult}
        />
        <div className='hide-scrollbar mt-8 max-h-80 overflow-y-auto'>
          <OptionsList
            options={filteredOptions}
            getLabel={(v) => v.label}
            getKey={(option) => option.value}
            onSelect={onSelect}
            selectedOptions={selectedOptions}
          />
        </div>
        <DropdownFilterActions
          isAllSelected={isAllSelected}
          clearAll={clearSelectedOptions}
          setAll={selectAllOptions}
          isAnySelect={selectedOptions.length > 0}
        />
      </>
    );
  }

  return (
    <Dropdown
      isOpen={isDropdown}
      setIsOpen={setIsDropdown}
      onClose={() => setSearchValue('')}
      trigger={
        <DropdownFilterTrigger
          label={triggerLabel}
          counter={selectedOptions.length}
          onClick={toggle}
        />
      }
    >
      <DropdownFilterInput
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        isError={isSearchResult}
      />

      {isSearchResult && (
        <>
          <div className={'border-t-[0.25px] border-border'}></div>
          <div className='my-2 mr-[3px] ml-2 grid max-h-[131px] gap-y-1 overflow-auto'>
            <OptionsList
              options={filteredOptions}
              getLabel={(option) => option.label}
              getKey={(option) => option.value}
              onSelect={onSelect}
              selectedOptions={selectedOptions}
            />
          </div>
        </>
      )}

      <DropdownFilterActions
        isAllSelected={isAllSelected}
        clearAll={clearSelectedOptions}
        setAll={selectAllOptions}
        isAnySelect={selectedOptions.length > 0}
      />
    </Dropdown>
  );
};
