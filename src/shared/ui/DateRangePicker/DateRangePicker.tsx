import React, { ChangeEvent, FC } from 'react';

import { cn } from '@/shared/lib/classNames/classNames';
import Button from '@/shared/ui/Button/Button';
import Icon from '@/shared/ui/Icon/Icon';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/shared/ui/Popover/Popover';
import Text from '@/shared/ui/Text/Text';
import View from '@/shared/ui/View/View';

export type DateRangeValue = {
  startDate: string;
  endDate: string;
};

interface DateRangePickerProps {
  value: DateRangeValue;
  onChange: (next: DateRangeValue) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  triggerClassName?: string;
  popoverContentClassName?: string;
  showLabels?: boolean;
  showClear?: boolean;
  clearLabel?: string;
  placeholder?: string;
  variant?: 'inline' | 'popover';
}

const DateRangePicker: FC<DateRangePickerProps> = ({
  value,
  onChange,
  min,
  max,
  disabled = false,
  className,
  inputClassName,
  triggerClassName,
  popoverContentClassName,
  showLabels = false,
  showClear = false,
  clearLabel = 'Clear',
  placeholder = 'Date range',
  variant = 'inline'
}) => {
  const startMax = value.endDate || max;
  const endMin = value.startDate || min;

  const onStartChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextStart = e.target.value;
    const nextEnd =
      value.endDate && nextStart && nextStart > value.endDate
        ? nextStart
        : value.endDate;

    onChange({ startDate: nextStart, endDate: nextEnd });
  };

  const onEndChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextEnd = e.target.value;
    const nextStart =
      value.startDate && nextEnd && nextEnd < value.startDate
        ? nextEnd
        : value.startDate;

    onChange({ startDate: nextStart, endDate: nextEnd });
  };

  const onClear = () => onChange({ startDate: '', endDate: '' });

  const inputClasses = cn(
    'outline-secondary-19 bg-custom-trigger text-primary-14 h-9 rounded-lg px-3 text-[11px] font-medium focus-visible:outline-none',
    { 'cursor-not-allowed opacity-60': disabled },
    inputClassName
  );

  const rangeLabel = () => {
    if (value.startDate && value.endDate) {
      return `${value.startDate} — ${value.endDate}`;
    }
    if (value.startDate) {
      return `From ${value.startDate}`;
    }
    if (value.endDate) {
      return `Until ${value.endDate}`;
    }
    return placeholder;
  };

  const renderInputs = () => (
    <div className={cn('flex items-center gap-2', className)}>
      <div className='flex flex-col gap-1'>
        <View.Condition if={showLabels}>
          <Text
            size='11'
            weight='500'
            className='text-secondary-21'
          >
            Start
          </Text>
        </View.Condition>
        <input
          type='date'
          value={value.startDate}
          min={min || undefined}
          max={startMax || undefined}
          onChange={onStartChange}
          disabled={disabled}
          className={inputClasses}
        />
      </div>
      <div className='flex flex-col gap-1'>
        <View.Condition if={showLabels}>
          <Text
            size='11'
            weight='500'
            className='text-secondary-21'
          >
            End
          </Text>
        </View.Condition>
        <input
          type='date'
          value={value.endDate}
          min={endMin || undefined}
          max={max || undefined}
          onChange={onEndChange}
          disabled={disabled}
          className={inputClasses}
        />
      </div>
      <View.Condition
        if={Boolean(showClear && (value.startDate || value.endDate))}
      >
        <Button
          className='text-primary-14 hover:bg-secondary-22 h-9 rounded-lg px-3 text-[11px] font-medium'
          onClick={onClear}
          disabled={disabled}
        >
          {clearLabel}
        </Button>
      </View.Condition>
    </div>
  );

  if (variant === 'popover') {
    const hasSelection = Boolean(value.startDate || value.endDate);
    const iconName = hasSelection ? 'calendar-check' : 'calendar-uncheck';

    const triggerClasses = cn(
      'bg-custom-trigger flex h-[32px] items-center gap-1.5 rounded-lg p-1.5 pr-3 text-[11px] font-medium',
      { 'opacity-60': disabled },
      triggerClassName
    );

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            className={triggerClasses}
            disabled={disabled}
          >
            <div className='p-0.5'>
              <Icon
                name={iconName}
                className='h-4 w-4'
                isRound={false}
              />
            </div>
            <Text
              size='11'
              weight='500'
              className={
                hasSelection
                  ? '!text-[var(--color-secondary-10)]'
                  : '!text-[var(--color-gray-11)]'
              }
            >
              {rangeLabel()}
            </Text>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align='end'
          className={cn(
            'bg-primary-15 shadow-15 w-auto min-w-[168px] rounded-lg border-none p-0',
            popoverContentClassName
          )}
        >
          <div className='p-2'>{renderInputs()}</div>
        </PopoverContent>
      </Popover>
    );
  }

  return renderInputs();
};

export default DateRangePicker;
