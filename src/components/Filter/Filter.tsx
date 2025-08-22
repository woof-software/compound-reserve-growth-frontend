import React, { ChangeEvent, FC, useCallback, useMemo, useState } from 'react';

import { cn } from '@/shared/lib/classNames/classNames';
import { OptionType } from '@/shared/types/types';
import Button from '@/shared/ui/Button/Button';
import Drawer from '@/shared/ui/Drawer/Drawer';
import Each from '@/shared/ui/Each/Each';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';
import View from '@/shared/ui/View/View';

type FilterOptions = {
  id: string;

  placeholder: string;

  total: number;

  selectedOptions: OptionType[];

  options: OptionType[];

  onChange?: (selectedOptions: OptionType[]) => void;
};

interface FilterProps {
  isOpen: boolean;

  filterOptions: FilterOptions[];

  onClose: () => void;

  onClearAll: () => void;
}

const getKey = (f: FilterOptions) => f.id ?? f.placeholder;

const Filter: FC<FilterProps> = ({
  isOpen,
  filterOptions,
  onClose,
  onClearAll
}) => {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const [searchValue, setSearchValue] = useState('');

  const activeFilter = useMemo<FilterOptions | null>(() => {
    if (!filterOptions.length) return null;
    return (
      filterOptions.find((f) => getKey(f) === selectedKey) ?? filterOptions[0]
    );
  }, [filterOptions, selectedKey]);

  const filteredOptions = useMemo(
    () =>
      activeFilter
        ? activeFilter?.options.filter((option) =>
            option.label.toLowerCase().includes(searchValue.toLowerCase())
          )
        : [],
    [activeFilter, searchValue]
  );

  const onChangeSearch = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  }, []);

  const onSelectOptionInFilter = useCallback(
    (optionToToggle: OptionType) => {
      if (!activeFilter?.onChange) return;

      const isSelected = activeFilter?.selectedOptions.some(
        (v) => v.id === optionToToggle.id
      );

      const newSelectedValue = isSelected
        ? activeFilter?.selectedOptions.filter(
            (v) => v.id !== optionToToggle.id
          )
        : [...(activeFilter?.selectedOptions || []), optionToToggle];

      activeFilter?.onChange(newSelectedValue);
    },
    [activeFilter]
  );

  const onSelectFilter = useCallback((selectedFilter: FilterOptions) => {
    setSelectedKey(getKey(selectedFilter));

    setSearchValue('');
  }, []);

  const onSelectedFilterClose = useCallback(() => {
    setSearchValue('');

    setSelectedKey(null);
  }, []);

  const onDrawerClose = useCallback(() => {
    onClose();

    setSearchValue('');

    setSelectedKey(null);
  }, [onClose]);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onDrawerClose}
    >
      <View.Condition if={!Boolean(selectedKey)}>
        <Text
          size='17'
          weight='700'
          lineHeight='140'
          align='center'
          className='mb-5 w-full'
        >
          Filter
        </Text>
        <div className='grid gap-3'>
          <Each
            data={filterOptions}
            render={(option, index) => (
              <div
                key={index}
                className='flex h-[42px] cursor-pointer items-center justify-between px-3 py-2.5'
                onClick={() => onSelectFilter(option)}
              >
                <div className='flex items-center gap-1.5'>
                  <Icon
                    name='plus'
                    className='h-2.5 w-2.5'
                    color={cn('color-primary-14', {
                      'color-secondary-41': Boolean(option.total)
                    })}
                  />
                  <Text
                    size='14'
                    weight='500'
                    className={cn('text-primary-14 text-sm font-medium', {
                      'text-secondary-41': Boolean(option.total)
                    })}
                  >
                    {option.placeholder}
                  </Text>
                </div>
                <View.Condition if={Boolean(option.total)}>
                  <div className='bg-secondary-22 flex h-6 w-6 items-center justify-center rounded-full'>
                    <Text
                      size='11'
                      weight='500'
                      className='text-primary-14 leading-none tabular-nums'
                    >
                      {option.total}
                    </Text>
                  </div>
                </View.Condition>
              </div>
            )}
          />
        </div>
        <div className='w-full px-2'>
          <Button
            className='text-primary-14 mx-2 mt-8 flex w-full items-center justify-center rounded-lg px-3 py-4 text-[11px] font-medium'
            onClick={onClearAll}
          >
            Clear Filters
          </Button>
        </div>
      </View.Condition>
      <View.Condition if={Boolean(selectedKey)}>
        <div className='mb-8 flex items-center'>
          <Button onClick={onSelectedFilterClose}>
            <Icon
              name='arrow-line'
              className='h-6 w-6'
            />
          </Button>
          <Text
            size='17'
            weight='700'
            lineHeight='140'
            align='center'
            className='w-[calc(100%-24px)]'
          >
            {activeFilter?.placeholder}
          </Text>
        </div>
        <View.Condition
          if={Boolean(activeFilter && activeFilter?.options?.length > 5)}
        >
          <div
            className={cn(
              'outline-secondary-19 rounded-lg py-2 pr-5 pl-3 outline',
              {
                'outline-red-11':
                  !Boolean(filteredOptions?.length) &&
                  Boolean(searchValue.length)
              }
            )}
          >
            <input
              className='placeholder:text-secondary-21 h-[19px] w-full focus-visible:outline-none'
              placeholder='Search'
              value={searchValue}
              onChange={onChangeSearch}
            />
          </div>
          <View.Condition if={Boolean(!filteredOptions?.length)}>
            <div className='mt-3'>
              <Text
                size='12'
                weight='400'
                lineHeight='100'
                className='text-red-11'
              >
                No results found
              </Text>
            </div>
          </View.Condition>
        </View.Condition>
        <div className='hide-scrollbar mt-8 max-h-[450px] overflow-y-auto'>
          <Each
            data={filteredOptions}
            render={(option, index) => {
              const isSelected = activeFilter?.selectedOptions.some(
                (v) => v.id === option.id
              );

              return (
                <div
                  key={index}
                  className={cn(
                    'hover:bg-secondary-12 flex cursor-pointer items-center justify-between rounded-lg px-2 py-3'
                  )}
                  onClick={() => onSelectOptionInFilter(option)}
                >
                  <div className='flex items-end gap-1'>
                    <span
                      className={cn(
                        'text-primary-14 rounded-sm text-sm font-medium',
                        {
                          'text-secondary-10': isSelected
                        }
                      )}
                    >
                      {option.label}
                    </span>
                  </div>
                  <View.Condition if={Boolean(isSelected)}>
                    <Icon
                      name='check-stroke'
                      className='h-4 w-4'
                    />
                  </View.Condition>
                </div>
              );
            }}
          />
        </div>
      </View.Condition>
    </Drawer>
  );
};

export default Filter;
