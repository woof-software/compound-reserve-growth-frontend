import React, { Dispatch, SetStateAction, useState } from 'react';

import { DropdownFilterActions } from '@/refactor/DropdownFilter/DropdownFilterActions';
import { DropdownFilterInput } from '@/refactor/DropdownFilter/DropdownFilterInput';
import { DropdownFilterTrigger } from '@/refactor/DropdownFilter/DropdownFilterTrigger';
import { OptionsList } from '@/refactor/filters/OptionsList';
import { useMediaQuery } from '@/refactor/hooks/useMediaQuery';
import { Dropdown } from '@/refactor/shared/Dropdown';
import Button from '@/shared/ui/Button/Button';
import Icon from '@/shared/ui/Icon/Icon';

export type Option = { label: string; value: string };

interface DropdownFilterProps {
  options: Option[]
  selectedOptions: Option[]
  onSelect: (option: Option | Option[]) => void
  triggerLabel: string
  expandedFilter: string | null
  setExpandedFilter: Dispatch<SetStateAction<string | null>>
}

export const DropdownFilter = (props: DropdownFilterProps) => {
  const {
    options,
    selectedOptions,
    onSelect,
    triggerLabel,
    expandedFilter,
    setExpandedFilter,
  } = props;

  const [isDropdown, setIsDropdown] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const selectAllOptions = () => {
    return onSelect(options)
  }

  const clearSelectedOptions = () => {
    return onSelect([])
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
          selectedOptions={selectedOptions}
          handler={() => setExpandedFilter(triggerLabel)}
        />
      );
    }

    return (
      <>
        <Button
          onClick={() => setExpandedFilter(null)}
          className='absolute top-[30px] h-[44px] w-[44px]'
        >
          <Icon name='arrow-line' className='h-6 w-6' />
        </Button>

        <DropdownFilterInput
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          isSearchResult={isSearchResult}
        />
        <div className='my-2 mr-[3px] ml-2 max-h-[300px] overflow-auto'>
          <OptionsList
            options={filteredOptions}
            getLabel={(option) => option.label}
            getKey={(option) => option.value}
            onSelect={onSelect}
            selectedOptions={selectedOptions}
          />
        </div>
        <DropdownFilterActions
          isAllSelected={isAllSelected}
          clearAll={clearSelectedOptions}
          setAll={selectAllOptions}
          selectedOptions={selectedOptions}
        />
      </>
    );
  }

  return (
    <Dropdown
      isOpen={isDropdown}
      setIsOpen={setIsDropdown}
      trigger={
        <DropdownFilterTrigger
          label={triggerLabel}
          selectedOptions={selectedOptions}
          handler={toggle}
        />
      }
    >
      <DropdownFilterInput
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        isSearchResult={isSearchResult}
      />

      <div className='my-2 mr-[3px] ml-2 max-h-[180px] overflow-auto'>
        <OptionsList
          options={filteredOptions}
          getLabel={(option) => option.label}
          getKey={(option) => option.value}
          onSelect={onSelect}
          selectedOptions={selectedOptions}
        />
      </div>

      <DropdownFilterActions
        isAllSelected={isAllSelected}
        clearAll={clearSelectedOptions}
        setAll={selectAllOptions}
        selectedOptions={selectedOptions}
      />
    </Dropdown>
  );
};
