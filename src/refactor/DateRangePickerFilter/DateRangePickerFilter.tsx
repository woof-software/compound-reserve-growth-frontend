import React from 'react';

import { DropdownFilterTrigger } from '@/refactor/DropdownFilter/DropdownFilterTrigger';
import { useFiltersContext } from '@/refactor/filters/FiltersProvider';
import { useMediaQuery } from '@/refactor/hooks/useMediaQuery';
import { timestampToInputDate } from '@/shared/lib/date/dateUtils';
import Button from '@/shared/ui/Button/Button';
import DateRangePicker, { DateRangePickerPopover,DateRangePickerProps  } from '@/shared/ui/DateRangePicker/DateRangePicker';
import Icon from '@/shared/ui/Icon/Icon';

interface DateRangePickerFilterProps extends DateRangePickerProps {
  triggerLabel: string;
}

export const DateRangePickerFilter = ({ triggerLabel, ...pickerProps }: DateRangePickerFilterProps) => {
  const { expandedFilter, setExpandedFilter } = useFiltersContext();
  const isMobile = useMediaQuery('(max-width: 63.938rem)');

  const { value } = pickerProps;

  const selectedOptions = [
    value.startDate && { label: timestampToInputDate(value.startDate), value: 'start' },
    value.endDate && { label: timestampToInputDate(value.endDate), value: 'end' }
  ].filter(Boolean) as { label: string; value: string }[];

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
        <DateRangePicker
          {...pickerProps}
          inlineCalendar
          onClose={() => setExpandedFilter(null)}
        />
      </>
    );
  }

  return (
    <DateRangePickerPopover
      {...pickerProps}
      placeholder={triggerLabel}
    />
  );
};