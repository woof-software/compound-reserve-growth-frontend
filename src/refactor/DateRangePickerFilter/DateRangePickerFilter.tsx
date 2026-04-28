import { useFilterContext } from '@/refactor/filters/Filters'
import Text from '@/shared/ui/Text/Text'
import React from 'react';

import { DropdownFilterTrigger } from '@/refactor/DropdownFilter/DropdownFilterTrigger';
import { useMediaQuery } from '@/refactor/hooks/useMediaQuery';
import { timestampToInputDate } from '@/shared/lib/date/dateUtils';
import Button from '@/shared/ui/Button/Button';
import DateRangePicker, { DateRangePickerPopover,DateRangePickerProps  } from '@/shared/ui/DateRangePicker/DateRangePicker';
import Icon from '@/shared/ui/Icon/Icon';

export interface DateRangePickerFilterProps extends DateRangePickerProps {
  triggerLabel: string
}

export const DateRangePickerFilter = (props: DateRangePickerFilterProps) => {
  const { triggerLabel, ...pickerProps } = props;
  const { value } = pickerProps;

  const isMobile = useMediaQuery('(max-width: 63.938rem)');

  const { expandedFilter, setExpandedFilter } = useFilterContext()

  const counter = value.startDate || value.endDate
    ? `${timestampToInputDate(value.startDate)} - ${timestampToInputDate(value.endDate) || 'Now'}`
    : '';

  if (isMobile) {
    const isExpanded = expandedFilter === triggerLabel;
    const isOtherExpanded = expandedFilter !== null && !isExpanded;

    if (isOtherExpanded) return null;

    if (!isExpanded) {
      return (
        <DropdownFilterTrigger
          label={triggerLabel}
          counter={counter}
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