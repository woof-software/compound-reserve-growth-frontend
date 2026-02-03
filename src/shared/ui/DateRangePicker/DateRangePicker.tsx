import React, { ChangeEvent, FC } from 'react';

import { useModal } from '@/shared/hooks/useModal';
import { cn } from '@/shared/lib/classNames/classNames';
import Button from '@/shared/ui/Button/Button';
import { Dropdown } from '@/shared/ui/Dropdown/Dropdown';
import Icon from '@/shared/ui/Icon/Icon';
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
  clearLabel = 'Clear Filter',
  placeholder = 'Date range',
  variant = 'inline'
}) => {
  const { isOpen, onOpenModal, onCloseModal } = useModal();
  const onStartChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextStart = e.target.value;
    onChange({ startDate: nextStart, endDate: value.endDate });
  };

  const onEndChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextEnd = e.target.value;
    onChange({ startDate: value.startDate, endDate: nextEnd });
  };

  const onClear = () => onChange({ startDate: '', endDate: '' });

  const inputClasses = cn(
    'date-range-input outline-secondary-19 bg-custom-trigger text-primary-14 h-10 w-full rounded-lg px-3 pr-10 text-[11px] font-medium leading-4 focus-visible:outline-none',
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
    <div
      className={cn(
        'bg-primary-15 flex w-[168px] flex-col items-stretch gap-2 rounded-lg p-2 shadow-[inset_0_0_0_0.25px_var(--secondary-39),0px_8px_16px_rgba(13,19,26,0.1),0px_16px_32px_rgba(13,19,26,0.05)]',
        className
      )}
    >
      <div className='flex flex-col gap-0'>
        <View.Condition if={showLabels}>
          <div className='flex h-6 items-center rounded-lg px-3 py-1'>
            <Text
              size='11'
              weight='500'
              className='text-secondary-41 dark:text-secondary-33'
            >
              Start
            </Text>
          </div>
        </View.Condition>
        <input
          type='date'
          value={value.startDate}
          min={min || undefined}
          max={max || undefined}
          onChange={onStartChange}
          disabled={disabled}
          className={inputClasses}
        />
      </div>
      <div className='flex flex-col gap-0'>
        <View.Condition if={showLabels}>
          <div className='flex h-6 items-center rounded-lg px-3 py-1'>
            <Text
              size='11'
              weight='500'
              className='text-secondary-41 dark:text-secondary-33'
            >
              End
            </Text>
          </div>
        </View.Condition>
        <input
          type='date'
          value={value.endDate}
          min={min || undefined}
          max={max || undefined}
          onChange={onEndChange}
          disabled={disabled}
          className={inputClasses}
        />
      </div>
      <View.Condition
        if={Boolean(showClear && (value.startDate || value.endDate))}
      >
        <div className='-mx-2 h-[0.25px] w-[calc(100%+16px)] self-stretch bg-[var(--color-secondary-39)]' />
        <Button
          className='text-primary-14 hover:bg-secondary-22 hover:shadow-15 h-[30px] w-full rounded-lg text-[11px] font-medium'
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
      <div className={cn({ 'pointer-events-none': disabled })}>
        <Dropdown
          open={isOpen}
          onOpen={onOpenModal}
          onClose={onCloseModal}
          triggerContent={
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
          }
          contentClassName={cn(
            'bg-transparent p-0 border-none shadow-none max-h-[300px]',
            popoverContentClassName
          )}
        >
          {renderInputs()}
        </Dropdown>
      </div>
    );
  }

  return renderInputs();
};

export default DateRangePicker;
