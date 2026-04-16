import { useFiltersContext } from '@/refactor/filters/FiltersProvider'
import React, { Dispatch, ReactNode, SetStateAction, useState } from 'react';

import { OptionsList } from '@/refactor/filters/OptionsList';
import { useMediaQuery } from '@/refactor/hooks/useMediaQuery';
import { Dropdown } from '@/refactor/shared/Dropdown';
import { noop } from '@/shared/lib/utils/utils';
import Button from '@/shared/ui/Button/Button';
import Icon from '@/shared/ui/Icon/Icon';

export type Option = { label: string; value: string };

interface DropdownFilterProps {
  options: Option[]
  selectedOptions: Option[]
  setSelectedOptions: (option: Option) => void
  renderTrigger: (handler: () => void, selectedOptions: Option[], isOpen?: boolean) => ReactNode
  renderSearch?: (searchValue: string, setSearchValue: Dispatch<SetStateAction<string>>, isSearchResult: boolean) => ReactNode
  renderActions?: (clearAll: () => void, setAll: () => void, selectedOptions: Option[]) => ReactNode
  clearAll?: () => void
  setAll?: () => void
}

export const DropdownFilter = (props: DropdownFilterProps) => {
  const {
    options,
    selectedOptions,
    setSelectedOptions,
    renderTrigger,
    renderSearch,
    renderActions,
    clearAll = noop,
    setAll = noop
  } = props;

  const [isDropdown, setIsDropdown] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const {isMobileFilterExpanded, setIsMobileFilterExpanded} = useFiltersContext();

  const toggle = () => setIsDropdown(prev => !prev);

  const filteredOptions = options.filter(({label}) =>
    label.toLowerCase().includes(searchValue.toLowerCase())
  );

  const isSearchResult = filteredOptions.length !== 0;

  const isMobile = useMediaQuery('(max-width: 63.938rem)');

  if (isMobile) {
    return (
      <>
        {isMobileFilterExpanded
          ? <Button
            onClick={() => setIsMobileFilterExpanded(false)}
            className={'absolute top-[30px] h-[44px] w-[44px]'}
          >
            <Icon
              name='arrow-line'
              className='h-6 w-6'
            />
          </Button>
          : renderTrigger(() => setIsMobileFilterExpanded(true), selectedOptions, isDropdown)
        }

        {isMobileFilterExpanded && (
          <>
            {renderSearch?.(searchValue, setSearchValue, isSearchResult)}

            <div className='my-2 mr-[3px] ml-2 lg:max-h-[180px] max-h-[300px] overflow-auto'>
              <OptionsList
                options={filteredOptions}
                setSelectedOptions={setSelectedOptions}
                selectedOptions={selectedOptions}
              />
            </div>

            {renderActions?.(clearAll, setAll, selectedOptions)}
          </>
        )}
      </>
    );
  }

  return (
    <Dropdown
      isOpen={isDropdown}
      setIsOpen={setIsDropdown}
      trigger={renderTrigger(toggle, selectedOptions)}
    >
      {renderSearch?.(searchValue, setSearchValue, isSearchResult)}

      <div className='my-2 mr-[3px] ml-2 max-h-[180px] overflow-auto'>
        <OptionsList
          options={filteredOptions}
          setSelectedOptions={setSelectedOptions}
          selectedOptions={selectedOptions}
        />
      </div>

      {renderActions?.(clearAll, setAll, selectedOptions)}
    </Dropdown>
  );
};
