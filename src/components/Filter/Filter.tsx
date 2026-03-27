import React, { ChangeEvent, FC, useCallback, useMemo, useState } from 'react';

import { cn } from '@/shared/lib/classNames/classNames';
import { formatTimestampForLabel } from '@/shared/lib/date/dateUtils';
import { noop } from '@/shared/lib/utils/utils';
import { OptionType } from '@/shared/types/types';
import Button from '@/shared/ui/Button/Button';
import DateRangePicker from '@/shared/ui/DateRangePicker/DateRangePicker';
import { DateRangeValue } from '@/shared/ui/DateRangePicker/types';
import Drawer from '@/shared/ui/Drawer/Drawer';
import Each from '@/shared/ui/Each/Each';
import Icon from '@/shared/ui/Icon/Icon';
import Text from '@/shared/ui/Text/Text';
import View from '@/shared/ui/View/View';

type BaseFilterOptions = {
  id: string;
  placeholder: string;
  total: number;
  disableSelectAll?: boolean;
};

type SelectFilterOptions = BaseFilterOptions & {
  type?: 'select';
  selectedOptions: OptionType[];
  options: OptionType[];
  onChange?: (selectedOptions: OptionType[]) => void;
};

type DateRangeFilterOptions = BaseFilterOptions & {
  type: 'dateRange';
  dateRange: DateRangeValue;
  minDate: number | null;
  maxDate: number | null;
  onDateRangeChange: (next: DateRangeValue) => void;
  selectedOptions: OptionType[];
  options: OptionType[];
};

export type FilterOptions = SelectFilterOptions | DateRangeFilterOptions;

interface FilterProps {
  isOpen: boolean;
  filterOptions: FilterOptions[];
  onClose: () => void;
  onClearAll?: () => void;
  disableClearFilters?: boolean;
}

const isDateRangeFilterOption = (
  filter: FilterOptions
): filter is DateRangeFilterOptions => filter.type === 'dateRange';

const getDateRangeLabel = (dateRange: DateRangeValue): string | null => {
  if (dateRange.startDate !== null && dateRange.endDate !== null) {
    return `${formatTimestampForLabel(dateRange.startDate)} - ${formatTimestampForLabel(dateRange.endDate)}`;
  }
  if (dateRange.startDate !== null) {
    return `${formatTimestampForLabel(dateRange.startDate)} - ...`;
  }
  if (dateRange.endDate !== null) {
    return `... - ${formatTimestampForLabel(dateRange.endDate)}`;
  }

  return null;
};

const Filter: FC<FilterProps> = ({
  isOpen,
  filterOptions,
  onClose,
  onClearAll = noop,
  disableClearFilters = false
}) => {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');

  const activeFilter = useMemo<FilterOptions | null>(() => {
    if (!filterOptions.length) return null;

    return (
      filterOptions.find((filter) => filter.id === selectedKey) ??
      filterOptions[0]
    );
  }, [filterOptions, selectedKey]);

  const activeDateRangeFilter = useMemo<DateRangeFilterOptions | null>(() => {
    if (!activeFilter || !isDateRangeFilterOption(activeFilter)) return null;

    return activeFilter;
  }, [activeFilter]);

  const activeSelectFilter = useMemo<SelectFilterOptions | null>(() => {
    if (!activeFilter || isDateRangeFilterOption(activeFilter)) return null;

    return activeFilter;
  }, [activeFilter]);

  const filteredOptions = useMemo(
    () =>
      activeSelectFilter
        ? activeSelectFilter.options.filter((option) =>
            option.label.toLowerCase().includes(searchValue.toLowerCase())
          )
        : [],
    [activeSelectFilter, searchValue]
  );

  const onChangeSearch = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  }, []);

  const onSelectOptionInFilter = useCallback(
    (optionToToggle: OptionType) => {
      if (!activeSelectFilter?.onChange) return;

      const isSelected = activeSelectFilter.selectedOptions.some(
        (value) => value.id === optionToToggle.id
      );
      const nextValue = isSelected
        ? activeSelectFilter.selectedOptions.filter(
            (value) => value.id !== optionToToggle.id
          )
        : [...activeSelectFilter.selectedOptions, optionToToggle];

      activeSelectFilter.onChange(nextValue);
    },
    [activeSelectFilter]
  );

  const onSelectFilter = useCallback((selectedFilter: FilterOptions) => {
    setSelectedKey(selectedFilter.id);
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

  const onSelectAll = useCallback(() => {
    if (!activeSelectFilter?.onChange) return;

    const hasSelectedItems = activeSelectFilter.selectedOptions.length > 0;
    activeSelectFilter.onChange(
      hasSelectedItems ? [] : activeSelectFilter.options
    );
  }, [activeSelectFilter]);

  const hasManySelectOptions =
    activeSelectFilter !== null && activeSelectFilter.options.length > 5;
  const isSelectionNotEmpty =
    activeSelectFilter !== null &&
    activeSelectFilter.selectedOptions.length > 0;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onDrawerClose}
    >
      <View.Condition if={!selectedKey}>
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
            render={(option, index) => {
              const dateRangeLabel = isDateRangeFilterOption(option)
                ? getDateRangeLabel(option.dateRange)
                : null;
              const hasCounter = isDateRangeFilterOption(option)
                ? !!dateRangeLabel
                : option.total > 0;

              return (
                <div
                  key={index}
                  className='flex h-[42px] cursor-pointer items-center justify-between px-3 py-2.5'
                  onClick={() => onSelectFilter(option)}
                >
                  <div className='flex items-center gap-1.5'>
                    <Icon
                      name='plus'
                      className='h-2.5 w-2.5'
                      color={cn('primary-14', {
                        'secondary-41': hasCounter
                      })}
                    />
                    <Text
                      size='14'
                      weight='500'
                      className={cn('text-primary-14 text-sm font-medium', {
                        'text-secondary-41': hasCounter
                      })}
                    >
                      {option.placeholder}
                    </Text>
                  </div>
                  <View.Condition if={hasCounter}>
                    <div
                      className={cn(
                        'bg-secondary-46 flex h-6 items-center justify-center rounded-sm',
                        isDateRangeFilterOption(option)
                          ? 'max-w-[200px] px-2'
                          : 'w-6'
                      )}
                    >
                      <Text
                        size='11'
                        weight='500'
                        className='text-primary-18 leading-none tabular-nums'
                      >
                        {isDateRangeFilterOption(option)
                          ? dateRangeLabel
                          : option.total}
                      </Text>
                    </div>
                  </View.Condition>
                </div>
              );
            }}
          />
        </div>
        <View.Condition if={!disableClearFilters}>
          <div className='w-full px-2'>
            <Button
              className='text-primary-14 mx-2 mt-8 flex w-full items-center justify-center rounded-lg px-3 py-4 text-[11px] font-medium'
              onClick={onClearAll}
            >
              Clear Filters
            </Button>
          </div>
        </View.Condition>
      </View.Condition>
      <View.Condition if={!!selectedKey}>
        <div className='relative mb-8 flex items-center justify-center'>
          <Button onClick={onSelectedFilterClose}>
            <Icon
              name='arrow-line'
              className='absolute h-6 w-6'
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
        <View.Condition if={!!activeSelectFilter}>
          <View.Condition if={hasManySelectOptions}>
            <div
              className={cn(
                'outline-secondary-19 rounded-lg py-2 pr-5 pl-3 outline',
                {
                  'outline-red-11':
                    !filteredOptions.length && !!searchValue.length
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
            <View.Condition if={!filteredOptions.length}>
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
          <div className='hide-scrollbar mt-8 max-h-80 overflow-y-auto'>
            <Each
              data={filteredOptions}
              render={(option, index) => {
                const isSelected = activeSelectFilter
                  ? activeSelectFilter.selectedOptions.some(
                      (value) => value.id === option.id
                    )
                  : false;

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
                    <View.Condition if={isSelected}>
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
          <View.Condition if={!activeSelectFilter?.disableSelectAll}>
            <div className='w-full px-2 pt-8 pb-4'>
              <Button
                className='text-primary-14 flex w-full items-center justify-center rounded-lg text-[11px] font-medium'
                onClick={onSelectAll}
              >
                {isSelectionNotEmpty && 'Clear Selection'}
                {!isSelectionNotEmpty && 'Select All'}
              </Button>
            </div>
          </View.Condition>
        </View.Condition>
        {activeDateRangeFilter ? (
          <div>
            <DateRangePicker
              value={activeDateRangeFilter.dateRange}
              min={activeDateRangeFilter.minDate}
              max={activeDateRangeFilter.maxDate}
              onChange={activeDateRangeFilter.onDateRangeChange}
              onClose={onSelectedFilterClose}
              inlineCalendar
              showLabels
            />
          </div>
        ) : null}
      </View.Condition>
    </Drawer>
  );
};

export default Filter;
